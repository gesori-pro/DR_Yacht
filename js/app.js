// =====================================================
// Yacht Dice - 앱 초기화
// =====================================================

// firebase-config.js에서 Firebase 설정을 가져옴
// app, auth, database 변수는 firebase-config.js에서 전역으로 선언됨

// 앱 초기화
async function initApp() {
    try {
        // 테마 초기화
        UI.initTheme();

        // 다크모드 토글 이벤트
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => UI.toggleTheme());
        }

        // Firebase 초기화
        UI.showLoading('연결 중...');
        await initializeFirebase();
        UI.hideLoading();

        // 메인 화면 로드 (로비)
        UI.showScreen('lobby');


        // 페이지 이탈 시 방 나가기
        window.addEventListener('beforeunload', async (e) => {
            if (Room.currentRoom) {
                await Room.leaveRoom();
            }
        });

        // 연결 상태 모니터링
        const connectedRef = database.ref('.info/connected');
        connectedRef.on('value', (snap) => {
            if (snap.val() === true) {
                console.log('Firebase 연결됨');
            } else {
                console.log('Firebase 연결 끊김');
            }
        });

        console.log('Yacht Dice 앱 초기화 완료!');
        UI.showToast('게임에 오신 것을 환영합니다! 🎲', 'success');

    } catch (error) {
        console.error('앱 초기화 실패:', error);
        UI.hideLoading();
        UI.showToast('연결에 실패했습니다. 페이지를 새로고침해주세요.', 'error');
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initApp);
