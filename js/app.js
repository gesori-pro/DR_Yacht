// =====================================================
// Yacht Dice - 앱 초기화
// =====================================================

// Firebase 설정 (firebase-config.js에서 가져옴)
const firebaseConfig = {
    apiKey: "AIzaSyBSkizTO7o70NqUz90GLkYiwj9XGMKTCQU",
    authDomain: "rockscissorpaper-3b569.firebaseapp.com",
    databaseURL: "https://rockscissorpaper-3b569-default-rtdb.firebaseio.com",
    projectId: "rockscissorpaper-3b569",
    storageBucket: "rockscissorpaper-3b569.firebasestorage.app",
    messagingSenderId: "55192953735",
    appId: "1:55192953735:web:6cba6b4d46da0dc1c0a922",
    measurementId: "G-S3SF1Y9HR9"
};

// 전역 Firebase 참조
let app, auth, database;

// Firebase 초기화
function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
        return signInAnonymously();
    } else {
        console.error('Firebase SDK가 로드되지 않았습니다.');
        return Promise.reject(new Error('Firebase SDK not loaded'));
    }
}

// 익명 로그인
function signInAnonymously() {
    return auth.signInAnonymously()
        .then((userCredential) => {
            console.log('익명 로그인 성공:', userCredential.user.uid);
            return userCredential.user;
        })
        .catch((error) => {
            console.error('익명 로그인 실패:', error);
            throw error;
        });
}

// 현재 사용자 ID
function getCurrentUserId() {
    return auth?.currentUser?.uid || null;
}

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

        // 로비 초기화
        Lobby.init();

        // 로비로 돌아가기 버튼
        const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
        if (backToLobbyBtn) {
            backToLobbyBtn.addEventListener('click', () => Game.backToLobby());
        }

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
