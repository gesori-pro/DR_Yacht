const Templates = {
    'lobby': `
    <section id="lobby-screen" class="screen active">
        <div class="container">
            <div class="lobby-header">
                <h1 class="game-title">🎲 Yacht Dice</h1>
                <span class="version">v1.0.0</span>
            </div>
            <p class="subtitle">4인 실시간 온라인 게임</p>
            
            <!-- 온라인 상태 표시 -->
            <div class="online-status">
                <div class="status-item">
                    <span class="status-icon">🌐</span>
                    <span>접속 중: <strong id="online-count">-</strong>명</span>
                </div>
                <div class="status-item">
                    <span class="status-icon">🎮</span>
                    <span>플레이 중: <strong id="playing-count">-</strong>명</span>
                </div>
            </div>
            
            <!-- 닉네임 입력 -->
            <div class="nickname-section">
                <label for="nickname-input">닉네임</label>
                <input type="text" id="nickname-input" maxlength="10" placeholder="한글 10자까지">
                <p class="char-count"><span id="char-count">0</span>/10</p>
            </div>
            
            <!-- 게임 모드 선택 -->
            <div class="game-modes">
                <!-- 랜덤 매칭 -->
                <div class="mode-section random-mode">
                    <h3>⚡ 빠른 매칭</h3>
                    <p class="mode-desc">랜덤한 유저와 바로 게임!</p>
                    <button id="random-match-btn" class="btn btn-accent btn-large">
                        <span class="btn-icon">🎯</span>
                        랜덤 매칭
                    </button>
                </div>
                
                <div class="mode-divider">
                    <span>OR</span>
                </div>
                
                <!-- 커스텀 방 -->
                <div class="mode-section custom-mode">
                    <h3>🏠 커스텀 방</h3>
                    <p class="mode-desc">친구와 함께 플레이!</p>
                    
                    <div class="custom-buttons">
                        <button id="create-room-btn" class="btn btn-primary">
                            <span class="btn-icon">➕</span>
                            방 만들기
                        </button>
                        
                        <div class="join-room-section">
                            <input type="text" id="room-code-input" maxlength="4" placeholder="4자리 숫자" inputmode="numeric" pattern="[0-9]*">
                            <button id="join-room-btn" class="btn btn-secondary">참가</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>`,

    'waiting-room': `
    <section id="waiting-room-screen" class="screen active">
        <div class="container">
            <h2>대기실</h2>
            
            <!-- 방 코드 -->
            <div class="room-code-display">
                <span>방 코드:</span>
                <strong id="display-room-code">ABC123</strong>
                <button id="copy-code-btn" class="btn-icon-only" title="복사">📋</button>
            </div>
            
            <!-- 타이머 -->
            <div class="waiting-timer">
                <span>자동 시작까지</span>
                <strong id="auto-start-timer">2:00</strong>
            </div>
            
            <!-- 플레이어 목록 -->
            <div class="player-list">
                <div class="player-slot" id="player-slot-0">
                    <span class="player-crown">👑</span>
                    <span class="player-name">대기중...</span>
                </div>
                <div class="player-slot" id="player-slot-1">
                    <span class="player-name">대기중...</span>
                </div>
                <div class="player-slot" id="player-slot-2">
                    <span class="player-name">대기중...</span>
                </div>
                <div class="player-slot" id="player-slot-3">
                    <span class="player-name">대기중...</span>
                </div>
            </div>
            
            <!-- 버튼 -->
            <div class="waiting-actions">
                <button id="start-game-btn" class="btn btn-primary" disabled>
                    게임 시작
                </button>
                <button id="leave-room-btn" class="btn btn-danger">
                    나가기
                </button>
            </div>
        </div>
    </section>`,

    'turn-order': `
    <section id="turn-order-screen" class="screen active">
        <div class="container">
            <h2>순서 결정 중...</h2>
            <div id="roulette-container" class="roulette-container">
                <!-- 룰렛 애니메이션 -->
            </div>
            <div id="turn-order-result" class="turn-order-result hidden">
                <!-- 결과 표시 -->
            </div>
        </div>
    </section>`,

    'game': `
    <section id="game-screen" class="screen active">
        <!-- 상단 플레이어 바 -->
        <div class="player-bar">
            <div class="player-info" id="player-info-0">
                <span class="player-name">플레이어1</span>
                <span class="player-score">0점</span>
            </div>
            <div class="player-info" id="player-info-1">
                <span class="player-name">플레이어2</span>
                <span class="player-score">0점</span>
            </div>
            <div class="player-info" id="player-info-2">
                <span class="player-name">플레이어3</span>
                <span class="player-score">0점</span>
            </div>
            <div class="player-info" id="player-info-3">
                <span class="player-name">플레이어4</span>
                <span class="player-score">0점</span>
            </div>
        </div>

        <!-- 턴 정보 -->
        <div class="turn-info">
            <span id="current-turn-player">플레이어1의 턴</span>
            <div class="turn-timer">
                <span id="turn-timer">45</span>초
            </div>
        </div>

        <!-- 상대 턴 오버레이 -->
        <div id="opponent-turn-overlay" class="opponent-turn-overlay hidden">
            <div class="opponent-turn-content">
                <span id="opponent-turn-text">플레이어님의 턴</span>
                <div id="opponent-scoreboard" class="opponent-scoreboard">
                    <!-- 동적으로 점수표가 채워짐 -->
                </div>
            </div>
        </div>

        <!-- 주사위 영역 -->
        <div class="dice-area">
            <div class="dice-container">
                <div class="dice" id="dice-0" data-value="1">
                    <div class="dice-face front"></div>
                    <div class="dice-face back"></div>
                    <div class="dice-face right"></div>
                    <div class="dice-face left"></div>
                    <div class="dice-face top"></div>
                    <div class="dice-face bottom"></div>
                </div>
                <div class="dice" id="dice-1" data-value="1">
                    <div class="dice-face front"></div>
                    <div class="dice-face back"></div>
                    <div class="dice-face right"></div>
                    <div class="dice-face left"></div>
                    <div class="dice-face top"></div>
                    <div class="dice-face bottom"></div>
                </div>
                <div class="dice" id="dice-2" data-value="1">
                    <div class="dice-face front"></div>
                    <div class="dice-face back"></div>
                    <div class="dice-face right"></div>
                    <div class="dice-face left"></div>
                    <div class="dice-face top"></div>
                    <div class="dice-face bottom"></div>
                </div>
                <div class="dice" id="dice-3" data-value="1">
                    <div class="dice-face front"></div>
                    <div class="dice-face back"></div>
                    <div class="dice-face right"></div>
                    <div class="dice-face left"></div>
                    <div class="dice-face top"></div>
                    <div class="dice-face bottom"></div>
                </div>
                <div class="dice" id="dice-4" data-value="1">
                    <div class="dice-face front"></div>
                    <div class="dice-face back"></div>
                    <div class="dice-face right"></div>
                    <div class="dice-face left"></div>
                    <div class="dice-face top"></div>
                    <div class="dice-face bottom"></div>
                </div>
            </div>
            
            <div class="dice-actions">
                <button id="roll-dice-btn" class="btn btn-primary btn-large">
                    🎲 주사위 굴리기 (<span id="rolls-left">3</span>회 남음)
                </button>
            </div>
        </div>

        <!-- 스코어보드 -->
        <div class="scoreboard-area">
            <div class="scoreboard">
                <h3>점수표</h3>
                
                <!-- 상단 섹션 -->
                <div class="score-section upper-section">
                    <div class="score-row" data-category="ones">
                        <span class="category-name">1️⃣ Ones</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="twos">
                        <span class="category-name">2️⃣ Twos</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="threes">
                        <span class="category-name">3️⃣ Threes</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="fours">
                        <span class="category-name">4️⃣ Fours</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="fives">
                        <span class="category-name">5️⃣ Fives</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="sixes">
                        <span class="category-name">6️⃣ Sixes</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row bonus-row">
                        <span class="category-name">⭐ 보너스 (63+)</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                </div>
                
                <!-- 하단 섹션 -->
                <div class="score-section lower-section">
                    <div class="score-row" data-category="threeOfAKind">
                        <span class="category-name">🎯 Three of a Kind</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="fourOfAKind">
                        <span class="category-name">🎯 Four of a Kind</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="fullHouse">
                        <span class="category-name">🏠 Full House</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="smallStraight">
                        <span class="category-name">📏 Small Straight</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="largeStraight">
                        <span class="category-name">📐 Large Straight</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="chance">
                        <span class="category-name">❓ Chance</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                    <div class="score-row" data-category="yacht">
                        <span class="category-name">🚢 Yacht</span>
                        <span class="score-preview"></span>
                        <span class="score-value">-</span>
                    </div>
                </div>
                
                <!-- 총점 -->
                <div class="total-score">
                    <span>총점</span>
                    <strong id="total-score">0</strong>
                </div>
            </div>
        </div>
    </section>`,

    'result': `
    <section id="result-screen" class="screen active">
        <div class="container">
            <h2>🏆 게임 종료!</h2>
            
            <div class="result-ranking">
                <div class="rank-item rank-1" id="rank-1">
                    <span class="rank-medal">🥇</span>
                    <span class="rank-name">플레이어</span>
                    <span class="rank-score">0점</span>
                </div>
                <div class="rank-item rank-2" id="rank-2">
                    <span class="rank-medal">🥈</span>
                    <span class="rank-name">플레이어</span>
                    <span class="rank-score">0점</span>
                </div>
                <div class="rank-item rank-3" id="rank-3">
                    <span class="rank-medal">🥉</span>
                    <span class="rank-name">플레이어</span>
                    <span class="rank-score">0점</span>
                </div>
                <div class="rank-item rank-4" id="rank-4">
                    <span class="rank-medal">4️⃣</span>
                    <span class="rank-name">플레이어</span>
                    <span class="rank-score">0점</span>
                </div>
            </div>
            
            <button id="back-to-lobby-btn" class="btn btn-primary">
                로비로 돌아가기
            </button>
        </div>
    </section>`
};

window.Templates = Templates;
