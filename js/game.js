// =====================================================
// Yacht Dice - 게임 로직
// =====================================================

const Game = {
    // 게임 상태
    roomData: null,
    players: {},
    scores: {},
    gameState: null,

    // 턴 관련
    turnTimer: null,
    turnTimeLeft: 45,

    // 현재 유저
    currentUserId: null,

    // 게임 시작
    start() {
        this.currentUserId = getCurrentUserId();
        UI.showScreen('game');
        Dice.reset();
        Dice.setupClickEvents();
        this.setupEventListeners();
    },

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 주사위 굴리기 버튼
        // 동적 생성이므로 이벤트 위임 또는 initScreenEvents에서 처리
        // 하지만 기존 코드는 getElementById로 직접 걸었음.
        // ui.js에서 호출하므로 여기서 getElementById 해도 됨 (DOM 존재함).
        const rollBtn = document.getElementById('roll-dice-btn');
        if (rollBtn) {
            rollBtn.addEventListener('click', () => this.rollDice());
        }

        // 주사위 클릭 (이벤트 위임)
        const diceContainer = document.querySelector('.dice-container');
        if (diceContainer) {
            diceContainer.addEventListener('click', (e) => {
                const diceEl = e.target.closest('.dice');
                if (diceEl) {
                    const index = parseInt(diceEl.id.split('-')[1]);

                    if (!this.isMyTurn()) {
                        UI.showToast('당신의 턴이 아닙니다!', 'warning');
                        return;
                    }

                    if (window.Dice) {
                        window.Dice.toggleKeep(index);
                    }
                }
            });
        }

        // 스코어 카테고리 클릭
        const scoreRows = document.querySelectorAll('.score-row[data-category]');
        scoreRows.forEach(row => {
            row.addEventListener('click', () => {
                const category = row.dataset.category;
                this.selectCategory(category);
            });
        });
    },

    // 화면 초기화 (이벤트 및 상태)
    setupScreen() {
        this.setupEventListeners();
        // Dice.setupClickEvents는 이벤트 위임으로 대체됨
    },


    // 방 데이터 업데이트 콜백
    onRoomUpdate(data) {
        const prevStatus = this.roomData?.status;
        this.roomData = data;

        if (data.status === 'waiting') {
            // 대기실 상태
            WaitingRoom.updatePlayers(this.players, data.hostId);
        } else if (data.status === 'playing') {
            // 게임 시작 (대기실 -> 게임)
            if (prevStatus === 'waiting' && UI.currentScreen === 'waiting-room') {
                this.handleGameStart(data);
            }

            // 게임 중 - 턴 정보 업데이트
            this.updatePlayerBar();
            this.updateTurnDisplay();
            this.startTurnTimer();
        } else if (data.status === 'finished') {
            // 게임 종료
            this.showResults();
        }
    },

    // 게임 시작 시퀀스 처리
    async handleGameStart(data) {
        // 룰렛 화면으로 전환
        UI.showScreen('turn-order');

        // 플레이어 정보 준비
        const players = Object.values(data.turnOrder).map(id => ({
            id: id,
            nickname: this.players[id]?.nickname || '플레이어'
        }));

        const orderedPlayers = data.turnOrder.map(id => ({
            id: id,
            nickname: this.players[id]?.nickname || '플레이어'
        }));

        // 룰렛 애니메이션
        await UI.playRouletteAnimation(players, orderedPlayers);

        // 게임 화면으로 전환 및 시작
        await Utils.delay(1000);
        this.start();
    },

    // 플레이어 업데이트 콜백
    // 플레이어 업데이트 콜백
    onPlayersUpdate(players) {
        this.players = players;

        if (this.roomData?.status === 'waiting') {
            WaitingRoom.updatePlayers(players, this.roomData?.hostId);
        } else if (this.roomData?.status === 'playing') {
            this.updatePlayerBar();

            // 플레이어 퇴장 체크 (나 혼자 남았을 때)
            const activePlayerIds = Object.keys(players);
            if (activePlayerIds.length === 1) {
                const winnerId = activePlayerIds[0];

                UI.showToast('다른 플레이어가 모두 나갔습니다. 게임을 종료합니다.', 'info');

                // 3초 후 결과 화면으로
                setTimeout(() => {
                    this.showResults();
                }, 3000);
            }
        }
    },

    // 게임 상태 업데이트 콜백
    onGameStateUpdate(gameState) {
        this.gameState = gameState;

        // 주사위 동기화
        if (gameState.dice) {
            Dice.setValues(gameState.dice);
        }
        if (gameState.kept) {
            Dice.setKept(gameState.kept);
        }
        if (gameState.rollsLeft !== undefined) {
            Dice.setRollsLeft(gameState.rollsLeft);
        }

        // 내 턴인지 확인하여 버튼 활성화
        UI.setRollButtonEnabled(this.isMyTurn() && Dice.rollsLeft > 0);
    },

    // 점수 업데이트 콜백
    onScoresUpdate(scores) {
        this.scores = scores;

        // 내 점수판 업데이트
        const myScores = scores[this.currentUserId];
        if (myScores) {
            UI.updateScoreboard(myScores);
        }

        // 플레이어 바 점수 업데이트
        this.updatePlayerBar();
    },

    // 플레이어 바 업데이트
    updatePlayerBar() {
        if (!this.roomData?.turnOrder) return;

        const playerList = this.roomData.turnOrder.map(userId => {
            const player = this.players[userId];
            const score = this.scores[userId];
            const totalScore = score ? Scoreboard.calculateTotalScore(score) : 0;

            return {
                id: userId,
                nickname: player?.nickname || '플레이어',
                score: totalScore,
                disconnected: !player
            };
        });

        UI.updatePlayerBar(playerList, this.roomData.currentTurn);
    },

    // 턴 표시 업데이트
    updateTurnDisplay() {
        if (!this.roomData?.turnOrder) return;

        const currentPlayerId = this.roomData.turnOrder[this.roomData.currentTurn];
        const currentPlayer = this.players[currentPlayerId];
        const playerName = currentPlayer?.nickname || '플레이어';

        UI.updateTurnInfo(
            this.isMyTurn() ? '당신' : playerName,
            this.turnTimeLeft
        );
    },

    // 턴 타이머 시작
    startTurnTimer() {
        this.stopTurnTimer();
        this.turnTimeLeft = 45;

        this.turnTimer = setInterval(async () => {
            this.turnTimeLeft--;
            UI.updateTurnInfo(
                this.isMyTurn() ? '당신' : this.getCurrentPlayerName(),
                this.turnTimeLeft
            );

            if (this.turnTimeLeft <= 0) {
                this.stopTurnTimer();

                // 내 턴이면 자동으로 점수 선택
                if (this.isMyTurn()) {
                    await this.autoSelectScore();
                }
            }
        }, 1000);
    },

    // 턴 타이머 정지
    stopTurnTimer() {
        if (this.turnTimer) {
            clearInterval(this.turnTimer);
            this.turnTimer = null;
        }
    },

    // 현재 플레이어 이름 가져오기
    getCurrentPlayerName() {
        if (!this.roomData?.turnOrder) return '플레이어';
        const currentPlayerId = this.roomData.turnOrder[this.roomData.currentTurn];
        return this.players[currentPlayerId]?.nickname || '플레이어';
    },

    // 내 턴인지 확인
    isMyTurn() {
        if (!this.roomData?.turnOrder) return false;
        const currentPlayerId = this.roomData.turnOrder[this.roomData.currentTurn];
        return currentPlayerId === this.currentUserId;
    },

    // 주사위 굴리기
    async rollDice() {
        if (!this.isMyTurn()) {
            UI.showToast('당신의 턴이 아닙니다!', 'warning');
            return;
        }

        if (Dice.rollsLeft <= 0) {
            UI.showToast('더 이상 굴릴 수 없습니다!', 'warning');
            return;
        }

        const success = await Dice.roll();

        if (success) {
            // Firebase에 동기화
            await Room.updateGameState({
                dice: Dice.getValues(),
                kept: Dice.kept,
                rollsLeft: Dice.rollsLeft
            });
        }
    },

    // 카테고리 선택
    async selectCategory(category) {
        if (!this.isMyTurn()) {
            UI.showToast('당신의 턴이 아닙니다!', 'warning');
            return;
        }

        if (Dice.rollsLeft === 3) {
            UI.showToast('먼저 주사위를 굴려주세요!', 'warning');
            return;
        }

        // 이미 채워진 카테고리인지 확인
        const myScores = this.scores[this.currentUserId] || {};
        if (myScores[category] !== null && myScores[category] !== undefined) {
            UI.showToast('이미 선택한 카테고리입니다!', 'warning');
            return;
        }

        // 점수 계산
        const score = Scoreboard.calculateScore(category, Dice.getValues());

        // 점수 저장
        await Room.updateScore(this.currentUserId, category, score);

        // 하이라이트 제거
        Dice.clearHighlights();

        // 다음 턴으로
        this.stopTurnTimer();
        await Room.nextTurn();
    },

    // 자동 점수 선택 (시간 초과 시)
    async autoSelectScore() {
        const myScores = this.scores[this.currentUserId] || {};
        const available = Scoreboard.getAvailableCategories(myScores);

        if (available.length === 0) return;

        // 가장 낮은 점수 카테고리 선택 (페널티)
        let minCategory = available[0];
        let minScore = Infinity;

        for (const category of available) {
            const score = Scoreboard.calculateScore(category, Dice.getValues());
            if (score < minScore) {
                minScore = score;
                minCategory = category;
            }
        }

        UI.showToast('시간 초과! 자동으로 선택되었습니다.', 'warning');
        await this.selectCategory(minCategory);
    },

    // 결과 화면 표시
    showResults() {
        this.stopTurnTimer();

        // 순위 계산
        const rankings = Object.entries(this.scores)
            .filter(([userId]) => this.players[userId]) // 접속 중인 플레이어만 표시
            .map(([userId, scores]) => ({
                id: userId,
                nickname: this.players[userId]?.nickname || '플레이어',
                score: Scoreboard.calculateTotalScore(scores)
            }))
            .sort((a, b) => b.score - a.score);

        UI.showScreen('result');
        UI.updateResultScreen(rankings);
    },

    // 게임 종료 및 로비로
    async backToLobby() {
        this.stopTurnTimer();
        await Room.leaveRoom();
        UI.showScreen('lobby');
    }
};

// 전역으로 내보내기
window.Game = Game;
