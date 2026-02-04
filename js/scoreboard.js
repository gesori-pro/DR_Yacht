// =====================================================
// Yacht Dice - 점수 계산 로직
// 닌텐도 스위치 세계 게임전집 51 버전
// =====================================================

const Scoreboard = {
    // 카테고리 정의
    categories: {
        // 상단 섹션
        ones: { name: '1️⃣ Ones', type: 'upper', value: 1 },
        twos: { name: '2️⃣ Twos', type: 'upper', value: 2 },
        threes: { name: '3️⃣ Threes', type: 'upper', value: 3 },
        fours: { name: '4️⃣ Fours', type: 'upper', value: 4 },
        fives: { name: '5️⃣ Fives', type: 'upper', value: 5 },
        sixes: { name: '6️⃣ Sixes', type: 'upper', value: 6 },

        // 하단 섹션
        threeOfAKind: { name: '🎯 Three of a Kind', type: 'lower' },
        fourOfAKind: { name: '🎯 Four of a Kind', type: 'lower' },
        fullHouse: { name: '🏠 Full House', type: 'lower' },
        smallStraight: { name: '📏 Small Straight', type: 'lower' },
        largeStraight: { name: '📐 Large Straight', type: 'lower' },
        chance: { name: '❓ Chance', type: 'lower' },
        yacht: { name: '🚢 Yacht', type: 'lower' }
    },

    // 주사위 합계 계산
    sumDice(dice) {
        return dice.reduce((sum, val) => sum + val, 0);
    },

    // 주사위 카운트 (각 눈 개수)
    countDice(dice) {
        const counts = [0, 0, 0, 0, 0, 0, 0]; // 인덱스 1-6 사용
        dice.forEach(val => counts[val]++);
        return counts;
    },

    // 특정 숫자의 합계 (상단 섹션용)
    sumOfNumber(dice, number) {
        return dice.filter(val => val === number).reduce((sum, val) => sum + val, 0);
    },

    // n개 이상 같은 숫자가 있는지 확인
    hasNOfAKind(dice, n) {
        const counts = this.countDice(dice);
        return counts.some(count => count >= n);
    },

    // Full House 확인 (3+2 조합)
    isFullHouse(dice) {
        const counts = this.countDice(dice);
        const hasThree = counts.some(count => count === 3);
        const hasTwo = counts.some(count => count === 2);
        return hasThree && hasTwo;
    },

    // Small Straight 확인 (연속 4개)
    isSmallStraight(dice) {
        const uniqueSorted = [...new Set(dice)].sort((a, b) => a - b);
        const straights = [
            [1, 2, 3, 4],
            [2, 3, 4, 5],
            [3, 4, 5, 6]
        ];

        return straights.some(straight =>
            straight.every(num => uniqueSorted.includes(num))
        );
    },

    // Large Straight 확인 (연속 5개)
    isLargeStraight(dice) {
        const sorted = [...dice].sort((a, b) => a - b);
        const straights = [
            [1, 2, 3, 4, 5],
            [2, 3, 4, 5, 6]
        ];

        return straights.some(straight =>
            straight.every((num, i) => sorted[i] === num)
        );
    },

    // Yacht 확인 (5개 모두 같음)
    isYacht(dice) {
        return dice.every(val => val === dice[0]);
    },

    // 카테고리별 점수 계산
    calculateScore(category, dice) {
        switch (category) {
            // 상단 섹션
            case 'ones':
                return this.sumOfNumber(dice, 1);
            case 'twos':
                return this.sumOfNumber(dice, 2);
            case 'threes':
                return this.sumOfNumber(dice, 3);
            case 'fours':
                return this.sumOfNumber(dice, 4);
            case 'fives':
                return this.sumOfNumber(dice, 5);
            case 'sixes':
                return this.sumOfNumber(dice, 6);

            // 하단 섹션
            case 'threeOfAKind':
                return this.hasNOfAKind(dice, 3) ? this.sumDice(dice) : 0;

            case 'fourOfAKind':
                return this.hasNOfAKind(dice, 4) ? this.sumDice(dice) : 0;

            case 'fullHouse':
                // 닌텐도 버전: 주사위 합계로 점수
                return this.isFullHouse(dice) ? this.sumDice(dice) : 0;

            case 'smallStraight':
                // 닌텐도 버전: 15점
                return this.isSmallStraight(dice) ? 15 : 0;

            case 'largeStraight':
                // 닌텐도 버전: 30점
                return this.isLargeStraight(dice) ? 30 : 0;

            case 'chance':
                return this.sumDice(dice);

            case 'yacht':
                return this.isYacht(dice) ? 50 : 0;

            default:
                return 0;
        }
    },

    // 모든 카테고리의 가능한 점수 계산
    calculateAllPossibleScores(dice) {
        const scores = {};
        for (const category in this.categories) {
            scores[category] = this.calculateScore(category, dice);
        }
        return scores;
    },

    // 상단 섹션 합계 계산
    calculateUpperTotal(scores) {
        const upperCategories = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
        let total = 0;

        for (const cat of upperCategories) {
            if (scores[cat] !== null && scores[cat] !== undefined) {
                total += scores[cat];
            }
        }

        return total;
    },

    // 보너스 계산 (상단 63점 이상 시 +35점)
    calculateBonus(scores) {
        const upperTotal = this.calculateUpperTotal(scores);
        return upperTotal >= 63 ? 35 : 0;
    },

    // 총점 계산
    calculateTotalScore(scores) {
        let total = 0;

        for (const category in scores) {
            if (scores[category] !== null && scores[category] !== undefined) {
                total += scores[category];
            }
        }

        // 보너스 추가
        total += this.calculateBonus(scores);

        return total;
    },

    // 빈 점수판 생성
    createEmptyScoreSheet() {
        const sheet = {};
        for (const category in this.categories) {
            sheet[category] = null;
        }
        return sheet;
    },

    // 점수판이 완전히 채워졌는지 확인
    isScoreSheetComplete(scores) {
        for (const category in this.categories) {
            if (scores[category] === null || scores[category] === undefined) {
                return false;
            }
        }
        return true;
    },

    // 사용 가능한 카테고리 목록 반환
    getAvailableCategories(scores) {
        const available = [];
        for (const category in this.categories) {
            if (scores[category] === null || scores[category] === undefined) {
                available.push(category);
            }
        }
        return available;
    },

    // 최고 점수 카테고리 추천
    getBestCategory(dice, scores) {
        const available = this.getAvailableCategories(scores);
        let bestCategory = null;
        let bestScore = -1;

        for (const category of available) {
            const score = this.calculateScore(category, dice);
            if (score > bestScore) {
                bestScore = score;
                bestCategory = category;
            }
        }

        return { category: bestCategory, score: bestScore };
    },

    // 특별 조합 확인 (하이라이트용)
    getCompletedCombinations(dice) {
        const combinations = [];

        if (this.isYacht(dice)) {
            combinations.push('yacht');
        }
        if (this.isLargeStraight(dice)) {
            combinations.push('largeStraight');
        }
        if (this.isSmallStraight(dice)) {
            combinations.push('smallStraight');
        }
        if (this.isFullHouse(dice)) {
            combinations.push('fullHouse');
        }
        if (this.hasNOfAKind(dice, 4)) {
            combinations.push('fourOfAKind');
        }
        if (this.hasNOfAKind(dice, 3)) {
            combinations.push('threeOfAKind');
        }

        return combinations;
    }
};

// 전역으로 내보내기
window.Scoreboard = Scoreboard;
