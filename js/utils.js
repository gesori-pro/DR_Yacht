// =====================================================
// Yacht Dice - 유틸리티 함수
// =====================================================

const Utils = {
    // 방 코드 생성 (4자리 숫자)
    generateRoomCode() {
        // 0000 ~ 9999 랜덤 숫자
        const code = Math.floor(Math.random() * 10000);
        return code.toString().padStart(4, '0');
    },

    // 시간 포맷 (mm:ss)
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    // 배열 섞기 (Fisher-Yates 알고리즘)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // 랜덤 정수 생성 (min 이상 max 이하)
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    // 딜레이 함수
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 클립보드 복사
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // 폴백: 구형 브라우저용
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    // 로컬 스토리지 헬퍼
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch {
                return false;
            }
        }
    },

    // 디바운스 함수
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 스로틀 함수
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 한글 글자수 체크 (10자 제한)
    validateNickname(nickname) {
        const trimmed = nickname.trim();
        if (trimmed.length === 0) {
            return { valid: false, message: '닉네임을 입력해주세요.' };
        }
        if (trimmed.length > 10) {
            return { valid: false, message: '닉네임은 10자까지만 가능합니다.' };
        }
        return { valid: true, message: '' };
    },

    // 타임스탬프 생성
    getTimestamp() {
        return Date.now();
    },

    // 상대 시간 계산
    getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    },

    // 이벤트 리스너 헬퍼
    on(element, event, handler) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.addEventListener(event, handler);
        }
    },

    // 요소 선택 헬퍼
    $(selector) {
        return document.querySelector(selector);
    },

    $$(selector) {
        return document.querySelectorAll(selector);
    },

    // 클래스 토글 헬퍼
    toggleClass(element, className, force) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.classList.toggle(className, force);
        }
    },

    // HTML 이스케이프
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // 반짝임 효과 생성
    createSparkle(container, x, y) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        container.appendChild(sparkle);

        setTimeout(() => {
            sparkle.remove();
        }, 600);
    },

    // 여러 반짝임 효과 생성
    createSparkles(container, count = 10) {
        const rect = container.getBoundingClientRect();
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const x = Math.random() * rect.width;
                const y = Math.random() * rect.height;
                this.createSparkle(container, x, y);
            }, i * 50);
        }
    }
};

// 전역으로 내보내기
window.Utils = Utils;
