// =====================================================
// Yacht Dice - 방 관리
// Firebase Realtime Database 연동
// =====================================================

const Room = {
    // 현재 방 정보
    currentRoom: null,
    roomRef: null,
    playersRef: null,

    // 리스너 해제용
    unsubscribers: [],

    // 방 생성
    async createRoom(nickname) {
        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const roomCode = Utils.generateRoomCode();
        const roomId = roomCode; // 방 코드를 ID로 사용

        const roomData = {
            roomCode: roomCode,
            hostId: userId,
            status: 'waiting', // waiting, playing, finished
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            startedAt: null,
            currentTurn: 0,
            turnStartedAt: null,
            turnOrder: [],
            maxPlayers: 4,
            autoStartTime: 120 // 2분
        };

        const playerData = {
            order: 0,
            userId: userId,
            nickname: nickname,
            score: 0,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        };

        try {
            // 방 생성
            await database.ref(`rooms/${roomId}`).set(roomData);

            // 플레이어 추가
            await database.ref(`rooms/${roomId}/players/${userId}`).set(playerData);

            this.currentRoom = roomId;
            this.setupRoomListeners(roomId);

            return { roomId, roomCode };
        } catch (error) {
            console.error('방 생성 실패:', error);
            throw error;
        }
    },

    // 방 참가 (코드로)
    async joinRoomByCode(roomCode, nickname) {
        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        const roomId = roomCode.toUpperCase();

        try {
            // 방 존재 확인
            const roomSnapshot = await database.ref(`rooms/${roomId}`).once('value');
            const roomData = roomSnapshot.val();

            if (!roomData) {
                throw new Error('존재하지 않는 방입니다.');
            }

            if (roomData.status !== 'waiting') {
                throw new Error('이미 게임이 시작된 방입니다.');
            }

            // 플레이어 수 확인
            const playersSnapshot = await database.ref(`rooms/${roomId}/players`).once('value');
            const players = playersSnapshot.val() || {};
            const playerCount = Object.keys(players).length;

            if (playerCount >= roomData.maxPlayers) {
                throw new Error('방이 가득 찼습니다.');
            }

            // 플레이어 추가
            const playerData = {
                order: playerCount,
                oderId: oderId,
                nickname: nickname,
                score: 0,
                joinedAt: firebase.database.ServerValue.TIMESTAMP
            };

            await database.ref(`rooms/${roomId}/players/${userId}`).set(playerData);

            this.currentRoom = roomId;
            this.setupRoomListeners(roomId);

            return { roomId, roomCode: roomData.roomCode };
        } catch (error) {
            console.error('방 참가 실패:', error);
            throw error;
        }
    },

    // 랜덤 매칭
    async joinRandomMatch(nickname) {
        const userId = getCurrentUserId();
        if (!userId) {
            throw new Error('로그인이 필요합니다.');
        }

        try {
            // 대기 중인 방 찾기
            const roomsSnapshot = await database.ref('rooms')
                .orderByChild('status')
                .equalTo('waiting')
                .limitToFirst(10)
                .once('value');

            const rooms = roomsSnapshot.val();

            if (rooms) {
                // 참가 가능한 방 찾기
                for (const roomId in rooms) {
                    const room = rooms[roomId];
                    const playersSnapshot = await database.ref(`rooms/${roomId}/players`).once('value');
                    const players = playersSnapshot.val() || {};
                    const playerCount = Object.keys(players).length;

                    if (playerCount < room.maxPlayers) {
                        // 이 방에 참가
                        return await this.joinRoomByCode(roomId, nickname);
                    }
                }
            }

            // 대기 중인 방이 없으면 새로 생성
            return await this.createRoom(nickname);
        } catch (error) {
            console.error('랜덤 매칭 실패:', error);
            throw error;
        }
    },

    // 방 나가기
    async leaveRoom() {
        if (!this.currentRoom) return;

        const userId = getCurrentUserId();
        const roomId = this.currentRoom;

        try {
            // 리스너 해제
            this.removeAllListeners();

            // 방 정보 가져오기
            const roomSnapshot = await database.ref(`rooms/${roomId}`).once('value');
            const roomData = roomSnapshot.val();

            if (!roomData) {
                this.currentRoom = null;
                return;
            }

            // 플레이어 제거
            await database.ref(`rooms/${roomId}/players/${userId}`).remove();

            // 게임 중이었다면 점수도 제거
            await database.ref(`rooms/${roomId}/scores/${userId}`).remove();

            // 남은 플레이어 수 확인
            const playersSnapshot = await database.ref(`rooms/${roomId}/players`).once('value');
            const players = playersSnapshot.val();
            const playerCount = players ? Object.keys(players).length : 0;

            if (playerCount === 0) {
                // 아무도 없으면 방 삭제
                await database.ref(`rooms/${roomId}`).remove();
            } else if (roomData.hostId === userId) {
                // 방장이 나갔으면 다른 사람에게 방장 이전
                const newHostId = Object.keys(players)[0];
                await database.ref(`rooms/${roomId}/hostId`).set(newHostId);
            }

            this.currentRoom = null;
        } catch (error) {
            console.error('방 나가기 실패:', error);
            this.currentRoom = null;
        }
    },

    // 게임 시작 (방장 전용)
    async startGame() {
        if (!this.currentRoom) return;

        const userId = getCurrentUserId();
        const roomId = this.currentRoom;

        try {
            const roomSnapshot = await database.ref(`rooms/${roomId}`).once('value');
            const roomData = roomSnapshot.val();

            if (roomData.hostId !== userId) {
                throw new Error('방장만 게임을 시작할 수 있습니다.');
            }

            // 플레이어 목록 가져오기
            const playersSnapshot = await database.ref(`rooms/${roomId}/players`).once('value');
            const players = playersSnapshot.val();
            const playerIds = Object.keys(players);

            if (playerIds.length < 2) {
                throw new Error('최소 2명이 필요합니다.');
            }

            // 턴 순서 랜덤 결정
            const turnOrder = Utils.shuffleArray(playerIds);

            // 각 플레이어 점수판 초기화
            const scores = {};
            playerIds.forEach(playerId => {
                scores[playerId] = Scoreboard.createEmptyScoreSheet();
            });

            // 게임 상태 초기화
            const gameState = {
                dice: [1, 1, 1, 1, 1],
                kept: [false, false, false, false, false],
                rollsLeft: 3,
                round: 1
            };

            // 게임 시작
            await database.ref(`rooms/${roomId}`).update({
                status: 'playing',
                startedAt: firebase.database.ServerValue.TIMESTAMP,
                currentTurn: 0,
                turnStartedAt: firebase.database.ServerValue.TIMESTAMP,
                turnOrder: turnOrder
            });

            await database.ref(`rooms/${roomId}/gameState`).set(gameState);
            await database.ref(`rooms/${roomId}/scores`).set(scores);

            return { turnOrder, players };
        } catch (error) {
            console.error('게임 시작 실패:', error);
            throw error;
        }
    },

    // 방 리스너 설정
    setupRoomListeners(roomId) {
        // 방 상태 리스너
        const roomRef = database.ref(`rooms/${roomId}`);
        roomRef.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                this.onRoomUpdate(data);
            } else {
                // 방이 삭제됨
                this.onRoomDeleted();
            }
        });
        this.unsubscribers.push(() => roomRef.off());

        // 플레이어 리스너
        const playersRef = database.ref(`rooms/${roomId}/players`);
        playersRef.on('value', snapshot => {
            const data = snapshot.val();
            this.onPlayersUpdate(data || {});
        });
        this.unsubscribers.push(() => playersRef.off());

        // 게임 상태 리스너
        const gameStateRef = database.ref(`rooms/${roomId}/gameState`);
        gameStateRef.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                this.onGameStateUpdate(data);
            }
        });
        this.unsubscribers.push(() => gameStateRef.off());

        // 점수 리스너
        const scoresRef = database.ref(`rooms/${roomId}/scores`);
        scoresRef.on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                this.onScoresUpdate(data);
            }
        });
        this.unsubscribers.push(() => scoresRef.off());
    },

    // 모든 리스너 해제
    removeAllListeners() {
        this.unsubscribers.forEach(unsub => unsub());
        this.unsubscribers = [];
    },

    // 콜백 함수들 (Game에서 오버라이드)
    onRoomUpdate(data) {
        console.log('Room updated:', data);
        if (window.Game && Game.onRoomUpdate) {
            Game.onRoomUpdate(data);
        }
    },

    onPlayersUpdate(players) {
        console.log('Players updated:', players);
        if (window.Game && Game.onPlayersUpdate) {
            Game.onPlayersUpdate(players);
        }
    },

    onGameStateUpdate(gameState) {
        console.log('Game state updated:', gameState);
        if (window.Game && Game.onGameStateUpdate) {
            Game.onGameStateUpdate(gameState);
        }
    },

    onScoresUpdate(scores) {
        console.log('Scores updated:', scores);
        if (window.Game && Game.onScoresUpdate) {
            Game.onScoresUpdate(scores);
        }
    },

    onRoomDeleted() {
        UI.showToast('방이 삭제되었습니다.', 'error');
        UI.showScreen('lobby');
        this.currentRoom = null;
    },

    // 현재 방 ID 가져오기
    getCurrentRoomId() {
        return this.currentRoom;
    },

    // 현재 방의 방장인지 확인
    async isHost() {
        if (!this.currentRoom) return false;

        const userId = getCurrentUserId();
        const snapshot = await database.ref(`rooms/${this.currentRoom}/hostId`).once('value');
        return snapshot.val() === userId;
    },

    // 게임 상태 업데이트
    async updateGameState(updates) {
        if (!this.currentRoom) return;
        await database.ref(`rooms/${this.currentRoom}/gameState`).update(updates);
    },

    // 점수 업데이트
    async updateScore(userId, category, score) {
        if (!this.currentRoom) return;
        await database.ref(`rooms/${this.currentRoom}/scores/${userId}/${category}`).set(score);
    },

    // 다음 턴으로
    async nextTurn() {
        if (!this.currentRoom) return;

        const roomSnapshot = await database.ref(`rooms/${this.currentRoom}`).once('value');
        const roomData = roomSnapshot.val();

        const nextTurn = (roomData.currentTurn + 1) % roomData.turnOrder.length;

        // 라운드 체크 (모든 카테고리가 채워졌는지)
        const scoresSnapshot = await database.ref(`rooms/${this.currentRoom}/scores`).once('value');
        const scores = scoresSnapshot.val();

        let allComplete = true;
        for (const oderId in scores) {
            if (!Scoreboard.isScoreSheetComplete(scores[oderId])) {
                allComplete = false;
                break;
            }
        }

        if (allComplete) {
            // 게임 종료
            await this.endGame();
        } else {
            // 다음 턴
            await database.ref(`rooms/${this.currentRoom}`).update({
                currentTurn: nextTurn,
                turnStartedAt: firebase.database.ServerValue.TIMESTAMP
            });

            // 게임 상태 리셋
            await this.updateGameState({
                dice: [1, 1, 1, 1, 1],
                kept: [false, false, false, false, false],
                rollsLeft: 3
            });
        }
    },

    // 게임 종료
    async endGame() {
        if (!this.currentRoom) return;

        await database.ref(`rooms/${this.currentRoom}/status`).set('finished');
    }
};

// 전역으로 내보내기
window.Room = Room;
