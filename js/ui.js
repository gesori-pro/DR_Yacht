// =====================================================
// Yacht Dice - UI 관리
// =====================================================

const UI = {
    // 현재 화면
    currentScreen: 'lobby',

    // 화면 전환
    showScreen(screenName) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
        });

        const targetScreen = document.getElementById(`${screenName}-screen`);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenName;
        }
    },

    // 토스트 알림 표시
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // 3초 후 제거
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // 로딩 표시
    showLoading(message = '로딩 중...') {
        let overlay = document.getElementById('loading-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="loading-spinner"></div>
                    <p class="loading-message">${message}</p>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            document.body.appendChild(overlay);
        }
    },

    // 로딩 숨기기
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },

    // 다크모드 토글
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        Utils.storage.set('theme', newTheme);
    },

    // 테마 초기화
    initTheme() {
        const savedTheme = Utils.storage.get('theme', 'light');
        document.documentElement.setAttribute('data-theme', savedTheme);
    },

    // 닉네임 글자수 카운터 업데이트
    updateCharCount(input) {
        const count = input.value.length;
        const countEl = document.getElementById('char-count');
        if (countEl) {
            countEl.textContent = count;
        }
    },

    // 플레이어 바 업데이트
    updatePlayerBar(players, currentTurnIndex) {
        for (let i = 0; i < 4; i++) {
            const playerInfo = document.getElementById(`player-info-${i}`);
            if (!playerInfo) continue;

            const player = players[i];
            const nameEl = playerInfo.querySelector('.player-name');
            const scoreEl = playerInfo.querySelector('.player-score');

            if (player) {
                nameEl.textContent = player.nickname || '플레이어';
                scoreEl.textContent = `${player.score || 0}점`;
                playerInfo.classList.remove('hidden');
                playerInfo.classList.toggle('active', i === currentTurnIndex);
                playerInfo.classList.toggle('disconnected', player.disconnected);
            } else {
                playerInfo.classList.add('hidden');
            }
        }
    },

    // 턴 정보 업데이트
    updateTurnInfo(playerName, timeLeft) {
        const turnPlayerEl = document.getElementById('current-turn-player');
        const timerEl = document.getElementById('turn-timer');

        if (turnPlayerEl) {
            turnPlayerEl.textContent = `${playerName}의 턴`;
        }

        if (timerEl) {
            timerEl.textContent = timeLeft;
            timerEl.classList.remove('warning', 'danger');

            if (timeLeft <= 10) {
                timerEl.classList.add('danger');
            } else if (timeLeft <= 20) {
                timerEl.classList.add('warning');
            }
        }
    },

    // 대기실 플레이어 목록 업데이트
    updateWaitingRoom(players, hostId) {
        for (let i = 0; i < 4; i++) {
            const slot = document.getElementById(`player-slot-${i}`);
            if (!slot) continue;

            const player = players[i];
            const nameEl = slot.querySelector('.player-name');

            if (player) {
                nameEl.textContent = player.nickname || '플레이어';
                slot.classList.add('filled');
                slot.classList.toggle('is-host', player.oderId === hostId);
            } else {
                nameEl.textContent = '대기중...';
                slot.classList.remove('filled', 'is-host');
            }
        }
    },

    // 대기 타이머 업데이트
    updateWaitingTimer(seconds) {
        const timerEl = document.getElementById('auto-start-timer');
        if (timerEl) {
            timerEl.textContent = Utils.formatTime(seconds);
        }
    },

    // 스코어보드 업데이트
    updateScoreboard(scores) {
        for (const category in scores) {
            const row = document.querySelector(`.score-row[data-category="${category}"]`);
            if (!row) continue;

            const scoreValueEl = row.querySelector('.score-value');
            if (scores[category] !== null && scores[category] !== undefined) {
                scoreValueEl.textContent = scores[category];
                row.classList.add('filled');
            } else {
                scoreValueEl.textContent = '-';
                row.classList.remove('filled');
            }
        }

        // 상단 섹션 합계 및 보너스
        const upperTotal = Scoreboard.calculateUpperTotal(scores);
        const bonus = Scoreboard.calculateBonus(scores);
        const bonusRow = document.querySelector('.bonus-row');

        if (bonusRow) {
            const bonusValueEl = bonusRow.querySelector('.score-value');
            if (bonus > 0) {
                bonusValueEl.textContent = `+${bonus}`;
                bonusRow.classList.add('achieved');
            } else {
                bonusValueEl.textContent = `${upperTotal}/63`;
            }
        }

        // 총점
        const total = Scoreboard.calculateTotalScore(scores);
        const totalEl = document.getElementById('total-score');
        if (totalEl) {
            totalEl.textContent = total;
        }
    },

    // 결과 화면 업데이트
    updateResultScreen(rankings) {
        rankings.forEach((player, index) => {
            const rankItem = document.getElementById(`rank-${index + 1}`);
            if (!rankItem) return;

            const nameEl = rankItem.querySelector('.rank-name');
            const scoreEl = rankItem.querySelector('.rank-score');

            if (player) {
                nameEl.textContent = player.nickname;
                scoreEl.textContent = `${player.score}점`;
                rankItem.classList.remove('hidden');
            } else {
                rankItem.classList.add('hidden');
            }
        });
    },

    // 룰렛 애니메이션 실행
    async playRouletteAnimation(players, finalOrder) {
        const container = document.getElementById('roulette-container');
        if (!container) return;

        // 룰렛 휠 생성
        const wheel = document.createElement('div');
        wheel.className = 'roulette-wheel';

        const colors = ['#FFB6C1', '#98D8C8', '#DDA0DD', '#FFE66D'];
        const segmentAngle = 360 / players.length;

        players.forEach((player, i) => {
            const segment = document.createElement('div');
            segment.className = 'roulette-segment';
            segment.style.backgroundColor = colors[i % colors.length];
            segment.style.transform = `rotate(${segmentAngle * i - 45}deg) skewY(${90 - segmentAngle}deg)`;
            segment.innerHTML = `<span style="transform: skewY(${segmentAngle - 90}deg) rotate(${segmentAngle / 2}deg)">${player.nickname}</span>`;
            wheel.appendChild(segment);
        });

        // 포인터 추가
        const pointer = document.createElement('div');
        pointer.className = 'roulette-pointer';

        container.innerHTML = '';
        container.appendChild(wheel);
        container.appendChild(pointer);

        // 스핀 애니메이션
        await Utils.delay(500);
        wheel.classList.add('spinning');

        await Utils.delay(3500);

        // 결과 표시
        const resultEl = document.getElementById('turn-order-result');
        if (resultEl) {
            resultEl.classList.remove('hidden');
            resultEl.innerHTML = `
                <h3>🎯 순서가 결정되었습니다!</h3>
                <div class="turn-order-list">
                    ${finalOrder.map((player, i) => `
                        <div class="turn-order-item zoom-in" style="animation-delay: ${i * 0.2}s">
                            <span class="order-number">${i + 1}번</span>
                            <span>${player.nickname}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        await Utils.delay(2000);
    },

    // 굴리기 버튼 활성화/비활성화
    setRollButtonEnabled(enabled) {
        const btn = document.getElementById('roll-dice-btn');
        if (btn) {
            btn.disabled = !enabled;
        }
    },

    // 게임 시작 버튼 활성화/비활성화
    setStartButtonEnabled(enabled) {
        const btn = document.getElementById('start-game-btn');
        if (btn) {
            btn.disabled = !enabled;
        }
    },

    // 방 코드 표시
    displayRoomCode(code) {
        const codeEl = document.getElementById('display-room-code');
        if (codeEl) {
            codeEl.textContent = code;
        }
    },

    // 확인 다이얼로그
    async confirm(message) {
        return window.confirm(message);
    }
};

// 전역으로 내보내기
window.UI = UI;
