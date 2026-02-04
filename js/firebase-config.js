// Firebase Configuration for Yacht Dice Game
// 도메인 제한 및 Security Rules로 보호됨

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

// Firebase 초기화
let app, auth, database;

function initializeFirebase() {
    // Firebase SDK 로드 확인
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        database = firebase.database();
        
        // 익명 로그인
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

// 현재 사용자 ID 가져오기
function getCurrentUserId() {
    return auth.currentUser ? auth.currentUser.uid : null;
}

// 데이터베이스 참조 가져오기
function getDbRef(path) {
    return database.ref(path);
}

export { 
    initializeFirebase, 
    signInAnonymously, 
    getCurrentUserId, 
    getDbRef,
    database,
    auth 
};
