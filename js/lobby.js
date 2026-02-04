// =====================================================
// Yacht Dice - 로비 로직
// =====================================================

const Lobby = {
    nickname: '',

    // 초기화
    init() {
        this.setupEventListeners();
        this.loadSavedNickname();
    },

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 닉네임 입력
        const nicknameInput = document.getElementById('nickname-input');
        if (nicknameInput) {
            nicknameInput.addEventListener('input', (e) => {
                UI.updateCharCount(e.target);
                this.nickname = e.target.value.trim();
            });
        }

        // 방 만들기 버튼
        const createRoomBtn = document.getElementById('create-room-btn');
        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.createRoom());
        }

        // 방 참가 버튼
        const joinRoomBtn = document.getElementById('join-room-btn');
        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.joinRoom());
        }

        // 랜덤 매칭 버튼
        const randomMatchBtn = document.getElementById('random-match-btn');
        if (randomMatchBtn) {
            randomMatchBtn.addEventListener('click', () => this.randomMatch());
        }

        // 방 코드 입력 엔터키
        const roomCodeInput = document.getElementById('room-code-input');
        if (roomCodeInput) {
            roomCodeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.joinRoom();
                }
            });

            // 대문자로 자동 변환
            roomCodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    },

    // 저장된 닉네임 불러오기
    loadSavedNickname() {
        const saved = Utils.storage.get('nickname', '');
        if (saved) {
            const nicknameInput = document.getElementById('nickname-input');
            if (nicknameInput) {
                nicknameInput.value = saved;
                this.nickname = saved;
                UI.updateCharCount(nicknameInput);
            }
        }
    },

    // 닉네임 저장
    saveNickname() {
        Utils.storage.set('nickname', this.nickname);
    },

    // 닉네임 검증
    validateNickname() {
        const result = Utils.validateNickname(this.nickname);
        if (!result.valid) {
            UI.showToast(result.message, 'error');
            return false;
        }
        return true;
    },

    // 방 만들기
    async createRoom() {
        if (!this.validateNickname()) return;

        try {
            UI.showLoading('방을 만드는 중...');

            const result = await Room.createRoom(this.nickname);
            this.saveNickname();

            UI.hideLoading();
            UI.displayRoomCode(result.roomCode);
            UI.showScreen('waiting-room');

            // 대기실 초기화
            WaitingRoom.init();

            UI.showToast(`방이 생성되었습니다! 코드: ${result.roomCode}`, 'success');
        } catch (error) {
            UI.hideLoading();
            UI.showToast(error.message || '방 생성 실패', 'error');
        }
    },

    // 방 참가
    async joinRoom() {
        if (!this.validateNickname()) return;

        const roomCodeInput = document.getElementById('room-code-input');
        const roomCode = roomCodeInput ? roomCodeInput.value.trim().toUpperCase() : '';

        if (!roomCode) {
            UI.showToast('방 코드를 입력해주세요.', 'warning');
            return;
        }

        if (roomCode.length !== 6) {
            UI.showToast('방 코드는 6자리입니다.', 'warning');
            return;
        }

        try {
            UI.showLoading('방에 참가하는 중...');

            const result = await Room.joinRoomByCode(roomCode, this.nickname);
            this.saveNickname();

            UI.hideLoading();
            UI.displayRoomCode(result.roomCode);
            UI.showScreen('waiting-room');

            // 대기실 초기화
            WaitingRoom.init();

            UI.showToast('방에 참가했습니다!', 'success');
        } catch (error) {
            UI.hideLoading();
            UI.showToast(error.message || '방 참가 실패', 'error');
        }
    },

    // 랜덤 매칭
    async randomMatch() {
        if (!this.validateNickname()) return;

        try {
            UI.showLoading('매칭 중...');

            const result = await Room.joinRandomMatch(this.nickname);
            this.saveNickname();

            UI.hideLoading();
            UI.displayRoomCode(result.roomCode);
            UI.showScreen('waiting-room');

            // 대기실 초기화
            WaitingRoom.init();

            UI.showToast('매칭 완료!', 'success');
        } catch (error) {
            UI.hideLoading();
            UI.showToast(error.message || '매칭 실패', 'error');
        }
    }
};

// =====================================================
// 대기실 로직
// =====================================================

const WaitingRoom = {
    timerInterval: null,
    timeLeft: 120, // 2분

    // 초기화
    init() {
        this.setupEventListeners();
        this.startTimer();
    },

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 방 코드 복사
        const copyBtn = document.getElementById('copy-code-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const code = document.getElementById('display-room-code').textContent;
                const success = await Utils.copyToClipboard(code);
                UI.showToast(success ? '복사되었습니다!' : '복사 실패', success ? 'success' : 'error');
            });
        }

        // 게임 시작 버튼
        const startBtn = document.getElementById('start-game-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // 나가기 버튼
        const leaveBtn = document.getElementById('leave-room-btn');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => this.leaveRoom());
        }
    },

    // 타이머 시작
    startTimer() {
        this.timeLeft = 120;
        UI.updateWaitingTimer(this.timeLeft);

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timerInterval = setInterval(async () => {
            this.timeLeft--;
            UI.updateWaitingTimer(this.timeLeft);

            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);

                // 방장이면 자동 시작
                const isHost = await Room.isHost();
                if (isHost) {
                    this.startGame();
                }
            }
        }, 1000);
    },

    // 타이머 정지
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },

    // 게임 시작
    async startGame() {
        try {
            const isHost = await Room.isHost();
            if (!isHost) {
                UI.showToast('방장만 게임을 시작할 수 있습니다.', 'warning');
                return;
            }

            this.stopTimer();
            UI.showLoading('게임을 시작하는 중...');

            const result = await Room.startGame();

            UI.hideLoading();

            // 턴 순서 결정 화면으로 이동
            UI.showScreen('turn-order');

            // 룰렛 애니메이션
            const players = Object.values(result.turnOrder).map(id => ({
                oderId: oderId,
                nickname: result.players[id]?.nickname || '플레이어'
            }));

            const orderedPlayers = result.turnOrder.map(id => ({
                oderId: oderId,
                nickname: result.players[id]?.nickname || '플레이어'
            }));

            await UI.playRouletteAnimation(players, orderedPlayers);

            // 게임 화면으로 이동
            await Utils.delay(1000);
            Game.start();

        } catch (error) {
            UI.hideLoading();
            UI.showToast(error.message || '게임 시작 실패', 'error');
        }
    },

    // 방 나가기
    async leaveRoom() {
        const confirm = await UI.confirm('정말 나가시겠습니까?');
        if (!confirm) return;

        this.stopTimer();
        await Room.leaveRoom();
        UI.showScreen('lobby');
        UI.showToast('방을 나갔습니다.', 'info');
    },

    // 플레이어 업데이트 콜백
    updatePlayers(players, hostId) {
        UI.updateWaitingRoom(Object.values(players), hostId);

        const playerCount = Object.keys(players).length;
        UI.setStartButtonEnabled(playerCount >= 2);
    }
};

// 전역으로 내보내기
window.Lobby = Lobby;
window.WaitingRoom = WaitingRoom;
