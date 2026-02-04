// =====================================================
// Yacht Dice - 주사위 로직
// 3D 회전 애니메이션 포함
// =====================================================

const Dice = {
    // 주사위 상태
    values: [1, 1, 1, 1, 1],      // 현재 주사위 값
    kept: [false, false, false, false, false], // 킵 상태
    rollsLeft: 3,                  // 남은 굴림 횟수
    isRolling: false,              // 굴리는 중인지

    // 주사위 눈금 표시용 위치 데이터
    dotPositions: {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [75, 25], [25, 75], [75, 75]],
        5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
        6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]]
    },

    // 초기화
    reset() {
        this.values = [1, 1, 1, 1, 1];
        this.kept = [false, false, false, false, false];
        this.rollsLeft = 3;
        this.isRolling = false;
        this.updateDisplay();
    },

    // 새 턴 시작
    newTurn() {
        this.values = [1, 1, 1, 1, 1];
        this.kept = [false, false, false, false, false];
        this.rollsLeft = 3;
        this.isRolling = false;
        this.updateDisplay();
    },

    // 주사위 굴리기
    async roll() {
        if (this.rollsLeft <= 0 || this.isRolling) {
            return false;
        }

        this.isRolling = true;
        this.rollsLeft--;

        // 킵되지 않은 주사위만 굴리기
        const diceElements = document.querySelectorAll('.dice');
        const animationPromises = [];

        for (let i = 0; i < 5; i++) {
            if (!this.kept[i]) {
                const diceEl = diceElements[i];
                diceEl.classList.add('rolling');

                // 랜덤 값 생성
                this.values[i] = Utils.randomInt(1, 6);

                // 애니메이션 끝나면 결과 표시
                const promise = new Promise(resolve => {
                    setTimeout(() => {
                        diceEl.classList.remove('rolling');
                        diceEl.dataset.value = this.values[i];
                        this.updateDiceFace(i);
                        resolve();
                    }, 600);
                });

                animationPromises.push(promise);
            }
        }

        await Promise.all(animationPromises);

        this.isRolling = false;
        this.updateDisplay();

        // 특별 조합 하이라이트
        this.highlightCombinations();

        return true;
    },

    // 주사위 킵/해제 토글
    toggleKeep(index) {
        if (this.rollsLeft === 3) {
            // 아직 굴리지 않았으면 킵 불가
            UI.showToast('먼저 주사위를 굴려주세요!', 'warning');
            return;
        }

        if (this.rollsLeft === 0) {
            // 굴림 횟수 소진 시 킵 변경 불가
            UI.showToast('점수를 선택해주세요!', 'info');
            return;
        }

        this.kept[index] = !this.kept[index];
        this.updateDisplay();
    },

    // 주사위 면 업데이트 (눈금 표시)
    updateDiceFace(index) {
        const diceEl = document.getElementById(`dice-${index}`);
        if (!diceEl) return;

        const value = this.values[index];
        const faces = diceEl.querySelectorAll('.dice-face');

        // 모든 면에 현재 값의 눈금 표시 (회전 중 빈 면 방지)
        faces.forEach(face => {
            face.innerHTML = ''; // 초기화

            const positions = this.dotPositions[value] || [];
            positions.forEach(pos => {
                const dot = document.createElement('div');
                dot.className = 'dice-dot';
                dot.style.left = `${pos[0]}%`;
                dot.style.top = `${pos[1]}%`;
                face.appendChild(dot);
            });
        });
    },

    // 디스플레이 업데이트
    updateDisplay() {
        const diceElements = document.querySelectorAll('.dice');

        diceElements.forEach((diceEl, index) => {
            // 킵 상태 표시
            diceEl.classList.toggle('kept', this.kept[index]);

            // 주사위 값 표시
            diceEl.dataset.value = this.values[index];
            this.updateDiceFace(index);
        });

        // 굴리기 버튼 업데이트
        const rollBtn = document.getElementById('roll-dice-btn');
        const rollsLeftSpan = document.getElementById('rolls-left');

        if (rollBtn && rollsLeftSpan) {
            rollsLeftSpan.textContent = this.rollsLeft;
            rollBtn.disabled = this.rollsLeft <= 0 || this.isRolling;
        }

        // 스코어보드 미리보기 업데이트
        this.updateScorePreview();
    },

    // 스코어보드 미리보기 업데이트
    updateScorePreview() {
        if (this.rollsLeft === 3) return; // 아직 굴리지 않았으면 미리보기 없음

        const possibleScores = Scoreboard.calculateAllPossibleScores(this.values);
        const scoreRows = document.querySelectorAll('.score-row[data-category]');

        scoreRows.forEach(row => {
            const category = row.dataset.category;
            const previewEl = row.querySelector('.score-preview');
            const scoreValueEl = row.querySelector('.score-value');

            if (!previewEl) return;

            // 이미 채워진 카테고리는 미리보기 없음
            if (scoreValueEl && scoreValueEl.textContent !== '-') {
                previewEl.textContent = '';
                return;
            }

            const score = possibleScores[category];
            if (score > 0) {
                previewEl.textContent = `+${score}`;
                row.classList.add('selectable');
            } else {
                previewEl.textContent = '(0)';
                row.classList.add('selectable');
            }
        });
    },

    // 특별 조합 하이라이트
    highlightCombinations() {
        // 기존 하이라이트 제거 (반짝임 효과만 제거하고 selectable은 유지해야 함? 
        // 아니, selectable은 updateScorePreview에서 관리함. 
        // highlightCombinations는 completed-highlight만 관리함.
        document.querySelectorAll('.score-row').forEach(row => {
            row.classList.remove('completed-highlight', 'yacht-highlight');
        });

        const combinations = Scoreboard.getCompletedCombinations(this.values);

        combinations.forEach(combo => {
            const row = document.querySelector(`.score-row[data-category="${combo}"]`);
            if (row && row.querySelector('.score-value').textContent === '-') {
                // 반짝임 효과
                const sparkleContainer = document.createElement('div');
                sparkleContainer.className = 'sparkle-container';
                row.style.position = 'relative';
                row.appendChild(sparkleContainer);
                Utils.createSparkles(sparkleContainer, 8);

                // Yacht는 레인보우, 나머지는 골드 하이라이트
                if (combo === 'yacht') {
                    row.classList.add('yacht-highlight');
                } else {
                    row.classList.add('completed-highlight');
                }

                // 잠시 후 반짝임 효과 제거 (하이라이트는 유지)
                setTimeout(() => {
                    sparkleContainer.remove();
                }, 1000);
            }
        });
    },

    // 하이라이트 제거
    clearHighlights() {
        document.querySelectorAll('.score-row').forEach(row => {
            row.classList.remove('completed-highlight', 'yacht-highlight', 'selectable');
            const preview = row.querySelector('.score-preview');
            if (preview) preview.textContent = '';
        });
    },

    // 주사위 클릭 이벤트 설정
    setupClickEvents() {
        const diceElements = document.querySelectorAll('.dice');
        diceElements.forEach((diceEl, index) => {
            diceEl.addEventListener('click', () => {
                if (!Game.isMyTurn()) {
                    UI.showToast('당신의 턴이 아닙니다!', 'warning');
                    return;
                }
                this.toggleKeep(index);
            });
        });
    },

    // 현재 주사위 값 가져오기
    getValues() {
        return [...this.values];
    },

    // 주사위 값 설정 (동기화용)
    setValues(values) {
        this.values = [...values];
        this.updateDisplay();
    },

    // 킵 상태 설정 (동기화용)
    setKept(kept) {
        this.kept = [...kept];
        this.updateDisplay();
    },

    // 남은 횟수 설정 (동기화용)
    setRollsLeft(count) {
        this.rollsLeft = count;
        this.updateDisplay();
    }
};

// 전역으로 내보내기
window.Dice = Dice;
