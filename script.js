// ============================================
// PLAYER PROFILE INTEGRATION
// ============================================

function updatePlayerDisplay() {
    const playerData = localStorage.getItem('logicMatrixPlayer');
    if (playerData) {
        try {
            const player = JSON.parse(playerData);
            
            // Update player stats in game header
            let playerStats = document.getElementById('player-stats');
            if (!playerStats) {
                const gameHeader = document.querySelector('.game-header');
                playerStats = document.createElement('div');
                playerStats.className = 'player-stats';
                playerStats.id = 'player-stats';
                playerStats.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; color: #93c5fd;">
                        <i class="fas fa-user"></i>
                        <span style="color:#60a5fa">${player.name}</span>
                        <span style="color: #fbbf24;">| Level: ${gameState.level}</span>
                    </div>
                `;
                gameHeader.appendChild(playerStats);
            } else {
                playerStats.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; color: #93c5fd;">
                        <i class="fas fa-user"></i>
                        <span style="color:#60a5fa">${player.name}</span>
                        <span style="color: #fbbf24;">| Level: ${gameState.level}</span>
                    </div>
                `;
            }
        } catch (e) {
            console.error('Error updating player display:', e);
        }
    }
}

// Modify the updateUI function to include player display
const originalUpdateUI = updateUI;
updateUI = function() {
    if (originalUpdateUI) originalUpdateUI();
    updatePlayerDisplay();
};

// Initialize player display on game start
updatePlayerDisplay();






// ============================================
// LOGIC MATRIX PUZZLE - DISCRETE MATH GAME
// ============================================

// Game State
const gameState = {
    score: 0,
    level: 1,
    timeLeft: 120,
    timerInterval: null,
    booleanAnswered: false,
    matrixAnswered: false,
    setAnswered: false,
    currentBooleanAnswer: "A",
    currentSetAnswer: "{3,4}",
    correctMatrixResult: null,
    currentKMap: null
};




// ============================================
// HIGH SCORE SYSTEM
// ============================================

const HighScoreManager = {
    // Maximum levels before game completion
    MAX_LEVELS: 10,
    
    // Get all high scores from localStorage
    getAllScores() {
        try {
            const scores = localStorage.getItem('logicMatrixHighScores');
            return scores ? JSON.parse(scores) : [];
        } catch (e) {
            console.error('Error loading high scores:', e);
            return [];
        }
    },
    
    // Save a high score
    saveScore(playerName, score, level, completionTime) {
        const scores = this.getAllScores();
        const playerData = localStorage.getItem('logicMatrixPlayer');
        let playerAge = '--';
        
        if (playerData) {
            try {
                const player = JSON.parse(playerData);
                playerAge = player.age;
            } catch (e) {
                console.error('Error parsing player data:', e);
            }
        }
        
        const newScore = {
            name: playerName,
            score: score,
            level: level,
            age: playerAge,
            date: new Date().toISOString(),
            completed: level >= this.MAX_LEVELS,
            completionTime: completionTime || null
        };
        
        scores.push(newScore);
        
        // Sort by score (highest first)
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10 scores
        const topScores = scores.slice(0, 10);
        
        localStorage.setItem('logicMatrixHighScores', JSON.stringify(topScores));
        
        return this.getRank(score);
    },
    
    // Get player's rank
    getRank(score) {
        const scores = this.getAllScores();
        let rank = 1;
        
        for (const s of scores) {
            if (s.score > score) {
                rank++;
            }
        }
        
        return rank;
    },
    
    // Display high scores
    displayHighScores() {
        const container = document.getElementById('high-scores-list');
        if (!container) return;
        
        const scores = this.getAllScores();
        
        if (scores.length === 0) {
            container.innerHTML = '<div style="color: #9ca3af; text-align: center;">No scores yet</div>';
            return;
        }
        
        let html = '';
        scores.forEach((score, index) => {
            const medal = index === 0 ? '🥇' : 
                         index === 1 ? '🥈' : 
                         index === 2 ? '🥉' : 
                         `${index + 1}.`;
            
            html += `
                <div class="high-score-item">
                    <div class="high-score-name">
                        ${medal} ${score.name}
                    </div>
                    <div class="high-score-value">
                        ${score.score}
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Check if game is complete
    isGameComplete() {
        return gameState.level > this.MAX_LEVELS;
    },
    
    // Show game complete modal
    showGameComplete() {
        const modal = document.getElementById('game-complete-modal');
        const finalScore = document.getElementById('final-score-display');
        const totalScore = document.getElementById('total-score-display');
        const rankNumber = document.getElementById('rank-number');
        const newHighScore = document.getElementById('new-high-score');
        const medalDisplay = document.getElementById('medal-display');
        
        if (!modal) return;
        
        // Stop timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Calculate time bonus
        const timeBonus = Math.floor(gameState.timeLeft / 5);
        const totalScoreValue = gameState.score + timeBonus;
        
        // Get player data
        const playerData = localStorage.getItem('logicMatrixPlayer');
        let playerName = 'Player';
        
        if (playerData) {
            try {
                const player = JSON.parse(playerData);
                playerName = player.name;
            } catch (e) {
                console.error('Error parsing player data:', e);
            }
        }
        
        // Save score and get rank
        const rank = this.saveScore(playerName, totalScoreValue, gameState.level, new Date().toISOString());
        
        // Update display
        finalScore.textContent = totalScoreValue;
        totalScore.textContent = totalScoreValue;
        rankNumber.textContent = rank;
        
        // Show new high score message if in top 3
        if (rank <= 3) {
            newHighScore.style.display = 'block';
            // Set medal color
            const medalClasses = ['gold', 'silver', 'bronze'];
            medalDisplay.className = `medal ${medalClasses[rank - 1]}`;
            medalDisplay.innerHTML = rank === 1 ? '🏆' : rank === 2 ? '🥈' : '🥉';
        }
        
        // Show modal
        modal.style.display = 'flex';
        
        // Add event listeners to buttons
        document.getElementById('play-again-btn').addEventListener('click', () => {
            modal.style.display = 'none';
            resetGame();
        });
        
        document.getElementById('new-player-btn').addEventListener('click', () => {
            modal.style.display = 'none';
            localStorage.removeItem('logicMatrixPlayer');
            window.location.href = 'login.html';
        });
    },
    
    // Initialize high score system
    init() {
        this.displayHighScores();
        
        // Update high scores every 30 seconds
        setInterval(() => {
            this.displayHighScores();
        }, 30000);
    }
};

// Modify the goToNextLevel function in script.js:
// Find the goToNextLevel function and add this check at the beginning:

function goToNextLevel() {
    if (!gameState.booleanAnswered || !gameState.matrixAnswered || !gameState.setAnswered) {
        alert("⚠️ Please complete all three sections before advancing!");
        console.log("Cannot advance: Not all sections completed");
        return;
    }
    
    console.log("Advancing to next level...");
    
    // ========== CHECK IF GAME IS COMPLETE ==========
    if (gameState.level >= HighScoreManager.MAX_LEVELS) {
        // Show game complete modal
        HighScoreManager.showGameComplete();
        return;
    }
    
    // ... rest of the existing code ...
}




// Question Databases
const questionDatabase = {
    booleanProblems: [
        // Level 1
        { 
            question: "Simplify the expression: (A ∧ B) ∨ (A ∧ ¬B)",
            answer: "A",
            options: ["A", "B", "A ∧ B", "A ∨ B"],
            kMap: { '00': 0, '01': 0, '10': 1, '11': 1 },
            explanation: "Factor out A: A ∧ (B ∨ ¬B) = A ∧ 1 = A"
        },
        // Level 2
        { 
            question: "Simplify the expression: ¬(A ∨ B) ∧ ¬(¬A ∧ B)",
            answer: "¬A ∧ ¬B",
            options: ["¬A ∧ ¬B", "A ∧ B", "A ∨ B", "¬A ∨ ¬B"],
            kMap: { '00': 1, '01': 0, '10': 0, '11': 0 },
            explanation: "Using De Morgan's laws: ¬(A ∨ B) = ¬A ∧ ¬B, and ¬(¬A ∧ B) = A ∨ ¬B"
        },
        // Level 3
        { 
            question: "Simplify the expression: (A ∨ B) ∧ (¬A ∨ B)",
            answer: "B",
            options: ["A", "B", "A ∧ B", "A ∨ B"],
            kMap: { '00': 0, '01': 1, '10': 0, '11': 1 },
            explanation: "Distributive law: (A ∧ ¬A) ∨ B = 0 ∨ B = B"
        },
        // Level 4
        { 
            question: "Simplify: A ∧ (A ∨ B)",
            answer: "A",
            options: ["A", "B", "A ∧ B", "A ∨ B"],
            kMap: { '00': 0, '01': 0, '10': 1, '11': 1 },
            explanation: "Absorption law: A ∧ (A ∨ B) = A"
        },
        // Level 5
        { 
            question: "Simplify: ¬(A ∧ B) ∨ (¬A ∧ B)",
            answer: "¬A ∨ ¬B",
            options: ["¬A ∨ ¬B", "A ∧ B", "A ∨ B", "¬A ∧ ¬B"],
            kMap: { '00': 1, '01': 1, '10': 1, '11': 0 },
            explanation: "De Morgan's law: ¬(A ∧ B) = ¬A ∨ ¬B"
        },
        // Level 6
        { 
            question: "Simplify: (A ∨ ¬B) ∧ (B ∨ ¬A)",
            answer: "A ⊕ B",
            options: ["A ⊕ B", "A ∧ B", "A ∨ B", "¬A ∧ ¬B"],
            kMap: { '00': 0, '01': 1, '10': 1, '11': 0 },
            explanation: "This is the XOR operation: A ⊕ B"
        },
        // Level 7
        { 
            question: "Simplify: (A ∧ B) ∨ (¬A ∧ B) ∨ (A ∧ ¬B)",
            answer: "A ∨ B",
            options: ["A ∨ B", "A ∧ B", "A ⊕ B", "¬A ∨ ¬B"],
            kMap: { '00': 0, '01': 1, '10': 1, '11': 1 },
            explanation: "Covers all minterms except ¬A ∧ ¬B"
        },
        // Level 8
        { 
            question: "Simplify: ¬(¬A ∨ B) ∧ ¬(A ∨ ¬B)",
            answer: "A ∧ B",
            options: ["A ∧ B", "¬A ∧ ¬B", "A ∨ B", "¬A ∨ ¬B"],
            kMap: { '00': 0, '01': 0, '10': 0, '11': 1 },
            explanation: "Double negation and De Morgan's laws"
        },
        // Level 9
        { 
            question: "Simplify: (A ∧ ¬B) ∨ (¬A ∧ B) ∨ (A ∧ B)",
            answer: "A ∨ B",
            options: ["A ∨ B", "A ∧ B", "A ⊕ B", "¬A ∧ ¬B"],
            kMap: { '00': 0, '01': 1, '10': 1, '11': 1 },
            explanation: "Combines all cases where A or B is true"
        },
        // Level 10
        { 
            question: "Simplify: ¬A ∧ (A ∨ B) ∧ (¬A ∨ ¬B)",
            answer: "¬A ∧ ¬B",
            options: ["¬A ∧ ¬B", "A ∧ B", "0", "1"],
            kMap: { '00': 1, '01': 0, '10': 0, '11': 0 },
            explanation: "¬A must be true, and if ¬A is true, ¬B must also be true"
        }
    ],
    
    setProblems: [
        // Level 1
        {
            setA: [1, 2, 3, 4],
            setB: [3, 4, 5, 6],
            question: "What is A ∩ B (Intersection)?",
            answer: "{3,4}",
            options: ["{1,2}", "{3,4}", "{5,6}", "{1,2,3,4,5,6}"]
        },
        // Level 2
        {
            setA: [2, 4, 6, 8],
            setB: [3, 6, 9, 12],
            question: "What is A ∩ B (Intersection)?",
            answer: "{6}",
            options: ["{2,4}", "{6}", "{3,9}", "{2,3,4,6,8,9,12}"]
        },
        // Level 3
        {
            setA: [1, 3, 5, 7, 9],
            setB: [2, 3, 5, 7, 11],
            question: "What is A ∩ B (Intersection)?",
            answer: "{3,5,7}",
            options: ["{1,9}", "{3,5,7}", "{2,11}", "{1,2,3,5,7,9,11}"]
        },
        // Level 4
        {
            setA: [10, 20, 30, 40],
            setB: [15, 30, 45, 60],
            question: "What is A ∩ B (Intersection)?",
            answer: "{30}",
            options: ["{10,20}", "{30}", "{15,45}", "{10,15,20,30,40,45,60}"]
        },
        // Level 5
        {
            setA: [2, 3, 5, 7, 11],
            setB: [1, 3, 5, 7, 9],
            question: "What is A ∩ B (Intersection)?",
            answer: "{3,5,7}",
            options: ["{2,11}", "{3,5,7}", "{1,9}", "{1,2,3,5,7,9,11}"]
        },
        // Level 6
        {
            setA: [1, 4, 9, 16, 25],
            setB: [4, 16, 36, 64, 100],
            question: "What is A ∩ B (Intersection)?",
            answer: "{4,16}",
            options: ["{1,9,25}", "{4,16}", "{36,64,100}", "{1,4,9,16,25,36,64,100}"]
        },
        // Level 7
        {
            setA: [5, 10, 15, 20, 25],
            setB: [3, 6, 9, 12, 15, 18],
            question: "What is A ∩ B (Intersection)?",
            answer: "{15}",
            options: ["{5,10,20,25}", "{15}", "{3,6,9,12,18}", "{3,5,6,9,10,12,15,18,20,25}"]
        },
        // Level 8
        {
            setA: [12, 24, 36, 48],
            setB: [18, 36, 54, 72],
            question: "What is A ∩ B (Intersection)?",
            answer: "{36}",
            options: ["{12,24,48}", "{36}", "{18,54,72}", "{12,18,24,36,48,54,72}"]
        },
        // Level 9
        {
            setA: [7, 14, 21, 28, 35],
            setB: [5, 10, 15, 20, 25, 30, 35],
            question: "What is A ∩ B (Intersection)?",
            answer: "{35}",
            options: ["{7,14,21,28}", "{35}", "{5,10,15,20,25,30}", "{5,7,10,14,15,20,21,25,28,30,35}"]
        },
        // Level 10
        {
            setA: [100, 200, 300, 400, 500],
            setB: [150, 300, 450, 600],
            question: "What is A ∩ B (Intersection)?",
            answer: "{300}",
            options: ["{100,200,400,500}", "{300}", "{150,450,600}", "{100,150,200,300,400,450,500,600}"]
        }
    ],
    
    matrixProblems: [
        // Level 1-5: Simple binary matrices
        // Level 6-10: More complex operations
    ]
};

// DOM Elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const timerElement = document.getElementById('timer');
const booleanOptions = document.querySelectorAll('.boolean-option');
const booleanFeedback = document.getElementById('boolean-feedback');
const setOptions = document.querySelectorAll('.set-option');
const setFeedback = document.getElementById('set-feedback');
const matrixCalculateBtn = document.getElementById('calculate-matrix');
const matrixCheckBtn = document.getElementById('check-matrix');
const matrixFeedback = document.getElementById('matrix-feedback');
const matrixOperation = document.getElementById('matrix-operation');
const nextLevelBtn = document.getElementById('next-level');
const resetGameBtn = document.getElementById('reset-game');
const hintBtn = document.getElementById('hint');
const showMathBtn = document.getElementById('show-math');
const mathModal = document.getElementById('math-modal');
const closeModal = document.querySelector('.close-modal');
const booleanQuestionText = document.getElementById('boolean-question-text');

// New DOM elements for set theory
const setQuestionText = document.querySelector('.set-problem p:nth-child(2)');
const setAElement = document.querySelector('.set-problem p:nth-child(1)');
const vennSetA = document.querySelector('.legend-item:nth-child(1)');
const vennSetB = document.querySelector('.legend-item:nth-child(2)');
const vennIntersection = document.querySelector('.legend-item:nth-child(3)');

// K-Map Cells
const kMapCells = {
    'cell-00': document.getElementById('cell-00'),
    'cell-01': document.getElementById('cell-01'),
    'cell-10': document.getElementById('cell-10'),
    'cell-11': document.getElementById('cell-11')
};

// Matrix Elements
const matrixA = {
    'a11': document.getElementById('a11'),
    'a12': document.getElementById('a12'),
    'a21': document.getElementById('a21'),
    'a22': document.getElementById('a22')
};

const matrixB = {
    'b11': document.getElementById('b11'),
    'b12': document.getElementById('b12'),
    'b21': document.getElementById('b21'),
    'b22': document.getElementById('b22')
};

const resultMatrix = {
    'r11': document.getElementById('r11'),
    'r12': document.getElementById('r12'),
    'r21': document.getElementById('r21'),
    'r22': document.getElementById('r22')
};















// ============================================
// INITIALIZATION FUNCTIONS
// ============================================

// Initialize the game
function initGame() {
    console.log("🚀 Game Initializing...");
    
    // ========== INITIALIZE HIGH SCORE SYSTEM ==========
    if (typeof HighScoreManager !== 'undefined') {
        HighScoreManager.init();
    }
    
    // ========== INITIALIZE SOUND MANAGER ==========
    if (typeof SoundManager !== 'undefined') {
        // Initialize sound manager on user interaction
        document.body.addEventListener('click', () => {
            if (!SoundManager.audioContext) {
                SoundManager.init();
            }
        }, { once: true });
    }
    
    // ========== INITIALIZE EFFECTS ==========
    if (typeof EffectsManager !== 'undefined') {
        EffectsManager.updateProgressBar();
    }
    
    updateUI();
    startTimer();
    setupEventListeners();
    loadLevelProblems();
    setupKMapInteractivity();
    
    console.log("✅ Game Ready!");
    
    // Add welcome effect
    setTimeout(() => {
        if (typeof EffectsManager !== 'undefined') {
            EffectsManager.createConfetti(20);
        }
    }, 1000);
}

// Load problems for current level
function loadLevelProblems() {
    console.log(`Loading problems for Level ${gameState.level}...`);
    
    // Get Boolean problem for current level
    const boolIndex = Math.min(gameState.level - 1, questionDatabase.booleanProblems.length - 1);
    const boolProblem = questionDatabase.booleanProblems[boolIndex];
    
    // Get Set problem for current level
    const setIndex = Math.min(gameState.level - 1, questionDatabase.setProblems.length - 1);
    const setProblem = questionDatabase.setProblems[setIndex];
    
    // Load Boolean problem
    booleanQuestionText.textContent = boolProblem.question;
    gameState.currentBooleanAnswer = boolProblem.answer;
    gameState.currentKMap = boolProblem.kMap;
    
    // Update Boolean options
    booleanOptions.forEach((option, index) => {
        option.textContent = boolProblem.options[index];
        option.dataset.value = boolProblem.options[index];
    });
    
    // Update K-Map
    updateKMap();
    
    // Load Set problem
    setAElement.textContent = `Given: A = {${setProblem.setA.join(', ')}}, B = {${setProblem.setB.join(', ')}}`;
    setQuestionText.textContent = setProblem.question;
    gameState.currentSetAnswer = setProblem.answer;
    
    // Update Set options
    setOptions.forEach((option, index) => {
        option.textContent = setProblem.options[index];
        option.dataset.value = setProblem.options[index];
    });
    
    // Update Venn diagram legend
    vennSetA.innerHTML = `<span class="legend-color a-color"></span> Set A: {${setProblem.setA.join(', ')}}`;
    vennSetB.innerHTML = `<span class="legend-color b-color"></span> Set B: {${setProblem.setB.join(', ')}}`;
    vennIntersection.innerHTML = `<span class="legend-color int-color"></span> A ∩ B: ${setProblem.answer}`;
    
    // Randomize matrices with level-based complexity
    randomizeMatrices();
    
    console.log(`✅ Level ${gameState.level} problems loaded`);
}

// Update UI with current game state
function updateUI() {
    scoreElement.textContent = gameState.score;
    levelElement.textContent = gameState.level;
    timerElement.textContent = gameState.timeLeft;
    
    // Update Next Level button state
    const allAnswered = gameState.booleanAnswered && gameState.matrixAnswered && gameState.setAnswered;
    nextLevelBtn.disabled = !allAnswered;
    nextLevelBtn.style.opacity = allAnswered ? "1" : "0.6";
    nextLevelBtn.style.cursor = allAnswered ? "pointer" : "not-allowed";
    
    // Update level display with special effects for high levels
    if (gameState.level >= 5) {
        levelElement.style.color = "#fbbf24";
        levelElement.style.textShadow = "0 0 10px rgba(251, 191, 36, 0.7)";
    } else {
        levelElement.style.color = "";
        levelElement.style.textShadow = "";
    }
}

// ============================================
// TIMER FUNCTIONS
// ============================================

function startTimer() {
    // Clear any existing timer
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Start new timer
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerElement.textContent = gameState.timeLeft;
        
        // ========== TIME WARNING EFFECTS ==========
        if (gameState.timeLeft === 30) {
            EffectsManager.showTimeWarning();
            if (typeof SoundManager !== 'undefined') {
                SoundManager.play('timeWarning');
            }
        }
        
        if (gameState.timeLeft === 10) {
            if (typeof SoundManager !== 'undefined') {
                SoundManager.play('timeWarning');
            }
        }
        
        // Time's up
        if (gameState.timeLeft <= 0) {
            endGame();
        }
        // Warning when time is low
        else if (gameState.timeLeft <= 30) {
            timerElement.style.color = "#ef4444";
            timerElement.style.fontWeight = "bold";
        }
    }, 1000);
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    console.log("🔗 Setting up event listeners...");
    
    // Boolean Algebra Options
    booleanOptions.forEach(option => {
        option.addEventListener('click', function() {
            // ========== CLICK SOUND ==========
            if (typeof SoundManager !== 'undefined') {
                SoundManager.play('click');
            }
            
            console.log("Boolean option clicked:", this.dataset.value);
            checkBooleanAnswer(this.dataset.value);
        });
    });
    
    // Set Theory Options
    setOptions.forEach(option => {
        option.addEventListener('click', function() {
            // ========== CLICK SOUND ==========
            if (typeof SoundManager !== 'undefined') {
                SoundManager.play('click');
            }
            
            console.log("Set option clicked:", this.dataset.value);
            checkSetAnswer(this.dataset.value);
        });
    });
    
    // Matrix Buttons
    matrixCalculateBtn.addEventListener('click', function() {
        // ========== CALCULATE SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('calculate');
        }
        
        console.log("Calculate Matrix clicked");
        calculateMatrixResult();
    });
    
    matrixCheckBtn.addEventListener('click', function() {
        // ========== CLICK SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
        
        console.log("Check Matrix clicked");
        checkMatrixAnswer();
    });
    
    // Game Control Buttons
    nextLevelBtn.addEventListener('click', function() {
        // ========== CLICK SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
        
        console.log("Next Level clicked");
        goToNextLevel();
    });
    
    resetGameBtn.addEventListener('click', function() {
        // ========== CLICK SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
        
        console.log("Reset Game clicked");
        resetGame();
    });
    
    hintBtn.addEventListener('click', function() {
        // ========== HINT SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('hint');
        }
        
        console.log("Hint clicked");
        showHint();
    });
    
    showMathBtn.addEventListener('click', function() {
        // ========== CLICK SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
        
        console.log("Show Math clicked");
        mathModal.style.display = "block";
    });
    
    // Modal Close
    closeModal.addEventListener('click', function() {
        // ========== CLICK SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
        
        mathModal.style.display = "none";
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === mathModal) {
            // ========== CLICK SOUND ==========
            if (typeof SoundManager !== 'undefined') {
                SoundManager.play('click');
            }
            
            mathModal.style.display = "none";
        }
    });
    
    // Matrix operation change
    matrixOperation.addEventListener('change', function() {
        // ========== CLICK SOUND ==========
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
        
        console.log("Matrix operation changed to:", this.value);
        calculateMatrixResult();
    });
    
    console.log("✅ Event listeners setup complete");
}

// ============================================
// BOOLEAN ALGEBRA FUNCTIONS
// ============================================

function updateKMap() {
    if (!gameState.currentKMap) return;
    
    console.log("Updating K-Map:", gameState.currentKMap);
    
    for (const [key, value] of Object.entries(gameState.currentKMap)) {
        const cellId = `cell-${key}`;
        if (kMapCells[cellId]) {
            kMapCells[cellId].textContent = value;
            // Reset color
            kMapCells[cellId].style.backgroundColor = value === 1 ? "#3b82f6" : "#1e293b";
        }
    }
}

function setupKMapInteractivity() {
    console.log("Setting up K-Map interactivity...");
    
    for (const [key, element] of Object.entries(kMapCells)) {
        element.addEventListener('click', function() {
            console.log("K-Map cell clicked:", key);
            const currentValue = parseInt(this.textContent);
            const newValue = currentValue === 1 ? 0 : 1;
            this.textContent = newValue;
            this.style.backgroundColor = newValue === 1 ? "#3b82f6" : "#1e293b";
        });
    }
}

function checkBooleanAnswer(selectedAnswer) {
    if (gameState.booleanAnswered) {
        console.log("Boolean already answered");
        return;
    }
    
    console.log("Checking Boolean answer:", selectedAnswer);
    console.log("Correct answer:", gameState.currentBooleanAnswer);
    
    const isCorrect = selectedAnswer === gameState.currentBooleanAnswer;
    
    // After determining correctness
    const option = Array.from(booleanOptions).find(opt => opt.dataset.value === selectedAnswer);
    
    if (isCorrect) {
        // Add sound
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('correct');
        }
        
        // Add visual effects
        EffectsManager.showScorePopup(10, booleanFeedback);
        option.classList.add('correct');
        setTimeout(() => option.classList.remove('correct'), 500);
        
        // Update progress bar
        EffectsManager.updateProgressBar();
        
        booleanFeedback.textContent = `✓ Correct! The expression simplifies to ${gameState.currentBooleanAnswer}`;
        booleanFeedback.className = "boolean-feedback correct";
        gameState.score += 10;
        gameState.booleanAnswered = true;
        console.log("✅ Boolean answer correct! +10 points");
    } else {
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('incorrect');
        }
        
        EffectsManager.showScorePopup(-5, booleanFeedback);
        option.classList.add('incorrect');
        setTimeout(() => option.classList.remove('incorrect'), 500);
        
        booleanFeedback.textContent = `✗ Incorrect. The correct answer is ${gameState.currentBooleanAnswer}`;
        booleanFeedback.className = "boolean-feedback incorrect";
        gameState.score = Math.max(0, gameState.score - 5);
        console.log("❌ Boolean answer incorrect! -5 points");
    }
    
    updateUI();
}

// ============================================
// MATRIX OPERATIONS FUNCTIONS
// ============================================

function randomizeMatrices() {
    console.log("Randomizing matrices for Level", gameState.level);
    
    // Adjust matrix complexity based on level
    const complexity = Math.min(gameState.level, 5); // Max complexity at level 5
    
    // Generate matrix A with level-appropriate values
    for (const key in matrixA) {
        let value;
        if (complexity <= 2) {
            // Levels 1-2: Simple binary (0 or 1)
            value = Math.random() > 0.5 ? 1 : 0;
        } else if (complexity <= 4) {
            // Levels 3-4: Small integers (0-3)
            value = Math.floor(Math.random() * 4);
        } else {
            // Level 5+: Larger integers (0-9)
            value = Math.floor(Math.random() * 10);
        }
        matrixA[key].textContent = value;
    }
    
    // Generate matrix B with level-appropriate values
    for (const key in matrixB) {
        let value;
        if (complexity <= 2) {
            value = Math.random() > 0.5 ? 1 : 0;
        } else if (complexity <= 4) {
            value = Math.floor(Math.random() * 4);
        } else {
            value = Math.floor(Math.random() * 10);
        }
        matrixB[key].textContent = value;
    }
    
    // Clear result matrix
    for (const key in resultMatrix) {
        resultMatrix[key].textContent = "?";
        resultMatrix[key].style.backgroundColor = "#1e3a8a";
    }
    
    gameState.matrixAnswered = false;
    gameState.correctMatrixResult = null;
    matrixFeedback.textContent = "";
    matrixFeedback.className = "matrix-feedback";
    
    console.log("Matrices randomized for level", gameState.level);
}

function calculateMatrixResult() {
    console.log("Calculating matrix result...");
    
    const operation = matrixOperation.value;
    
    // Get matrix values
    const a11 = parseInt(matrixA.a11.textContent) || 0;
    const a12 = parseInt(matrixA.a12.textContent) || 0;
    const a21 = parseInt(matrixA.a21.textContent) || 0;
    const a22 = parseInt(matrixA.a22.textContent) || 0;
    
    const b11 = parseInt(matrixB.b11.textContent) || 0;
    const b12 = parseInt(matrixB.b12.textContent) || 0;
    const b21 = parseInt(matrixB.b21.textContent) || 0;
    const b22 = parseInt(matrixB.b22.textContent) || 0;
    
    console.log(`Matrix A: [[${a11}, ${a12}], [${a21}, ${a22}]]`);
    console.log(`Matrix B: [[${b11}, ${b12}], [${b21}, ${b22}]]`);
    console.log(`Operation: ${operation}`);
    
    let r11, r12, r21, r22;
    
    switch(operation) {
        case 'add':
            r11 = a11 + b11;
            r12 = a12 + b12;
            r21 = a21 + b21;
            r22 = a22 + b22;
            break;
        case 'multiply':
            r11 = (a11 * b11) + (a12 * b21);
            r12 = (a11 * b12) + (a12 * b22);
            r21 = (a21 * b11) + (a22 * b21);
            r22 = (a21 * b12) + (a22 * b22);
            break;
        case 'and':
            r11 = a11 && b11 ? 1 : 0;
            r12 = a12 && b12 ? 1 : 0;
            r21 = a21 && b21 ? 1 : 0;
            r22 = a22 && b22 ? 1 : 0;
            break;
        case 'or':
            r11 = a11 || b11 ? 1 : 0;
            r12 = a12 || b12 ? 1 : 0;
            r21 = a21 || b21 ? 1 : 0;
            r22 = a22 || b22 ? 1 : 0;
            break;
        default:
            r11 = r12 = r21 = r22 = 0;
    }
    
    // Update result matrix
    resultMatrix.r11.textContent = r11;
    resultMatrix.r12.textContent = r12;
    resultMatrix.r21.textContent = r21;
    resultMatrix.r22.textContent = r22;
    
    // Store correct answer for checking
    gameState.correctMatrixResult = { r11, r12, r21, r22 };
    
    console.log(`Result: [[${r11}, ${r12}], [${r21}, ${r22}]]`);
    matrixFeedback.textContent = "Result calculated! Click 'Check Answer' to verify.";
    matrixFeedback.className = "matrix-feedback neutral";
}

function checkMatrixAnswer() {
    if (gameState.matrixAnswered) {
        console.log("Matrix already answered");
        matrixFeedback.textContent = "You already answered this matrix!";
        return;
    }
    
    if (!gameState.correctMatrixResult) {
        matrixFeedback.textContent = "Please calculate the result first!";
        matrixFeedback.className = "matrix-feedback incorrect";
        console.log("No result calculated yet");
        return;
    }
    
    // Check if result matrix has been filled
    const userR11 = resultMatrix.r11.textContent;
    const userR12 = resultMatrix.r12.textContent;
    const userR21 = resultMatrix.r21.textContent;
    const userR22 = resultMatrix.r22.textContent;
    
    if (userR11 === "?" || userR12 === "?" || userR21 === "?" || userR22 === "?") {
        matrixFeedback.textContent = "Please calculate the result first!";
        matrixFeedback.className = "matrix-feedback incorrect";
        console.log("Result matrix not fully calculated");
        return;
    }
    
    // Parse user results
    const userResults = {
        r11: parseInt(userR11),
        r12: parseInt(userR12),
        r21: parseInt(userR21),
        r22: parseInt(userR22)
    };
    
    console.log("User results:", userResults);
    console.log("Correct results:", gameState.correctMatrixResult);
    
    // Compare results
    const isCorrect = 
        userResults.r11 === gameState.correctMatrixResult.r11 &&
        userResults.r12 === gameState.correctMatrixResult.r12 &&
        userResults.r21 === gameState.correctMatrixResult.r21 &&
        userResults.r22 === gameState.correctMatrixResult.r22;
    
    // ========== SOUND EFFECTS ==========
    if (typeof SoundManager !== 'undefined') {
        if (isCorrect) {
            SoundManager.play('correct');
        } else {
            SoundManager.play('incorrect');
        }
    }
    
    if (isCorrect) {
        matrixFeedback.textContent = "✓ Correct! Matrix operation performed successfully.";
        matrixFeedback.className = "matrix-feedback correct";
        gameState.score += 15;
        gameState.matrixAnswered = true;
        
        // ========== VISUAL EFFECTS ==========
        EffectsManager.showScorePopup(15, matrixFeedback);
        EffectsManager.highlightMatrixCells(true);
        
        // Highlight correct matrix in green
        for (const key in resultMatrix) {
            resultMatrix[key].style.backgroundColor = "#10b981";
        }
        
        console.log("✅ Matrix answer correct! +15 points");
    } else {
        matrixFeedback.textContent = "✗ Incorrect. Try again or recalculate.";
        matrixFeedback.className = "matrix-feedback incorrect";
        gameState.score = Math.max(0, gameState.score - 5);
        
        // ========== VISUAL EFFECTS ==========
        EffectsManager.showScorePopup(-5, matrixFeedback);
        
        // Highlight incorrect cells in red
        const cells = [
            {element: resultMatrix.r11, correct: gameState.correctMatrixResult.r11, user: userResults.r11},
            {element: resultMatrix.r12, correct: gameState.correctMatrixResult.r12, user: userResults.r12},
            {element: resultMatrix.r21, correct: gameState.correctMatrixResult.r21, user: userResults.r21},
            {element: resultMatrix.r22, correct: gameState.correctMatrixResult.r22, user: userResults.r22}
        ];
        
        cells.forEach(cell => {
            if (cell.user !== cell.correct) {
                cell.element.style.backgroundColor = "#ef4444";
            }
        });
        
        console.log("❌ Matrix answer incorrect! -5 points");
    }
    
    // ========== PROGRESS BAR UPDATE ==========
    EffectsManager.updateProgressBar();
    
    updateUI();
}

// ============================================
// SET THEORY FUNCTIONS
// ============================================

function checkSetAnswer(selectedAnswer) {
    if (gameState.setAnswered) {
        console.log("Set already answered");
        return;
    }
    
    console.log("Checking set answer:", selectedAnswer);
    console.log("Correct answer:", gameState.currentSetAnswer);
    
    const isCorrect = selectedAnswer === gameState.currentSetAnswer;
    
    // ========== SOUND EFFECTS ==========
    if (typeof SoundManager !== 'undefined') {
        if (isCorrect) {
            SoundManager.play('correct');
        } else {
            SoundManager.play('incorrect');
        }
    }
    
    // ========== VISUAL EFFECTS ==========
    const option = Array.from(setOptions).find(opt => opt.dataset.value === selectedAnswer);
    if (option) {
        if (isCorrect) {
            EffectsManager.showScorePopup(10, setFeedback);
            option.classList.add('correct');
            setTimeout(() => option.classList.remove('correct'), 500);
        } else {
            EffectsManager.showScorePopup(-5, setFeedback);
            option.classList.add('incorrect');
            setTimeout(() => option.classList.remove('incorrect'), 500);
        }
    }
    
    if (isCorrect) {
        setFeedback.textContent = `✓ Correct! A ∩ B = ${gameState.currentSetAnswer}`;
        setFeedback.className = "set-feedback correct";
        gameState.score += 10;
        gameState.setAnswered = true;
        console.log("✅ Set answer correct! +10 points");
    } else {
        setFeedback.textContent = `✗ Incorrect. The intersection A ∩ B is ${gameState.currentSetAnswer}`;
        setFeedback.className = "set-feedback incorrect";
        gameState.score = Math.max(0, gameState.score - 5);
        console.log("❌ Set answer incorrect! -5 points");
    }
    
    // ========== PROGRESS BAR UPDATE ==========
    EffectsManager.updateProgressBar();
    
    updateUI();
}

// ============================================
// GAME CONTROL FUNCTIONS
// ============================================

function goToNextLevel() {
    if (!gameState.booleanAnswered || !gameState.matrixAnswered || !gameState.setAnswered) {
        alert("⚠️ Please complete all three sections before advancing!");
        console.log("Cannot advance: Not all sections completed");
        return;
    }
    
    console.log("Advancing to next level...");
    
    // ========== SOUND & VISUAL EFFECTS ==========
    if (typeof SoundManager !== 'undefined') {
        SoundManager.play('levelUp');
    }
    
    EffectsManager.createConfetti(100);
    EffectsManager.showLevelUp();
    
    gameState.level++;
    gameState.timeLeft += 30; // Add time bonus
    
    // Reset section states
    gameState.booleanAnswered = false;
    gameState.matrixAnswered = false;
    gameState.setAnswered = false;
    gameState.correctMatrixResult = null;
    
    // ========== RESET PROGRESS BAR ==========
    EffectsManager.updateProgressBar();
    
    // Load new problems for the next level
    loadLevelProblems();
    
    // Reset feedback areas
    booleanFeedback.textContent = "";
    booleanFeedback.className = "boolean-feedback";
    matrixFeedback.textContent = "";
    matrixFeedback.className = "matrix-feedback";
    setFeedback.textContent = "";
    setFeedback.className = "set-feedback";
    
    updateUI();
    
    alert(`🎉 Level ${gameState.level}! New challenges await. +30 seconds added!`);
    console.log(`Now at Level ${gameState.level}`);
}

function showHint() {
    const boolIndex = Math.min(gameState.level - 1, questionDatabase.booleanProblems.length - 1);
    const boolProblem = questionDatabase.booleanProblems[boolIndex];
    
    const setIndex = Math.min(gameState.level - 1, questionDatabase.setProblems.length - 1);
    const setProblem = questionDatabase.setProblems[setIndex];
    
    let hintMessage = "";
    
    if (!gameState.booleanAnswered) {
        hintMessage = `💡 Boolean Algebra Hint (Level ${gameState.level}):\n${boolProblem.question}\n\n${boolProblem.explanation}`;
    } else if (!gameState.matrixAnswered) {
        hintMessage = `💡 Matrix Hint (Level ${gameState.level}):\n- ADDITION: Add corresponding elements\n- MULTIPLICATION: Row × column dot product\n- AND: 1 only if both are 1\n- OR: 1 if at least one is 1\n\nHigher levels have more complex numbers!`;
    } else if (!gameState.setAnswered) {
        hintMessage = `💡 Set Theory Hint (Level ${gameState.level}):\nA = {${setProblem.setA.join(', ')}}\nB = {${setProblem.setB.join(', ')}}\n\nA ∩ B means elements that are in BOTH set A AND set B.\nLook for numbers that appear in both sets.`;
    } else {
        hintMessage = "🎯 You've completed all sections! Click 'Next Level' to continue.";
    }
    
    alert(hintMessage);
    gameState.score = Math.max(0, gameState.score - 3); // Penalty for hint
    updateUI();
    console.log("Hint used: -3 points");
}

function resetGame() {
    if (confirm("⚠️ Are you sure you want to reset the game?\nAll progress will be lost.")) {
        console.log("Resetting game...");
        
        // Reset game state
        gameState.score = 0;
        gameState.level = 1;
        gameState.timeLeft = 120;
        gameState.booleanAnswered = false;
        gameState.matrixAnswered = false;
        gameState.setAnswered = false;
        gameState.correctMatrixResult = null;
        
        // Clear timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // Reset timer color
        timerElement.style.color = "#10b981";
        timerElement.style.fontWeight = "normal";
        
        // Clear feedback areas
        booleanFeedback.textContent = "";
        booleanFeedback.className = "boolean-feedback";
        matrixFeedback.textContent = "";
        matrixFeedback.className = "matrix-feedback";
        setFeedback.textContent = "";
        setFeedback.className = "set-feedback";
        
        // Reset problems for level 1
        loadLevelProblems();
        
        // Restart timer
        startTimer();
        updateUI();
        
        console.log("✅ Game reset complete");
        alert("🔄 Game has been reset!");
    }
}

function endGame() {
    console.log("Game Over!");
    
    // ========== SOUND & VISUAL EFFECTS ==========
    if (typeof SoundManager !== 'undefined') {
        SoundManager.play('gameOver');
    }
    
    EffectsManager.createConfetti(30); // Sad confetti
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    // Calculate time bonus
    const timeBonus = Math.floor(gameState.timeLeft / 5);
    gameState.score += timeBonus;
    
    alert(`⏰ GAME OVER!\n\nFinal Score: ${gameState.score}\nLevel Reached: ${gameState.level}\nTime Bonus: +${timeBonus} points\n\nClick OK to restart.`);
    
    // Auto-reset after game over
    resetGame();
}

// ============================================
// ENHANCED EFFECTS MANAGER
// ============================================

const EffectsManager = {
    // Create confetti effect
    createConfetti(count = 50) {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Random colors
            const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random position and size
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.width = Math.random() * 15 + 5 + 'px';
            confetti.style.height = Math.random() * 15 + 5 + 'px';
            
            // Random animation duration
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.animationDelay = Math.random() * 1 + 's';
            
            container.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }
    },
    
    // Show level up message
    showLevelUp() {
        const message = document.getElementById('level-up-message');
        if (!message) return;
        
        message.textContent = `LEVEL ${gameState.level}!`;
        message.style.display = 'block';
        
        // Animate
        message.style.animation = 'glow 1s infinite alternate';
        
        // Hide after 2 seconds
        setTimeout(() => {
            message.style.display = 'none';
        }, 2000);
    },
    
    // Show score popup
    showScorePopup(amount, element) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = (amount > 0 ? '+' : '') + amount;
        popup.style.left = Math.random() * 100 + 'px';
        popup.style.top = '50%';
        
        element.appendChild(popup);
        
        // Remove after animation
        setTimeout(() => {
            popup.remove();
        }, 1000);
    },
    
    // Highlight correct matrix cells
    highlightMatrixCells(correct) {
        if (correct) {
            Object.values(resultMatrix).forEach(cell => {
                cell.classList.add('cell-highlight');
                setTimeout(() => cell.classList.remove('cell-highlight'), 1000);
            });
        }
    },
    
    // Update progress bar
    updateProgressBar() {
        const sections = [gameState.booleanAnswered, gameState.matrixAnswered, gameState.setAnswered];
        const completed = sections.filter(Boolean).length;
        const progress = (completed / 3) * 100;
        
        // Create or update progress bar
        let progressBar = document.querySelector('.progress-bar');
        if (!progressBar) {
            const container = document.createElement('div');
            container.className = 'progress-container';
            progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            container.appendChild(progressBar);
            document.querySelector('.game-controls').before(container);
        }
        
        progressBar.style.width = progress + '%';
        
        // Add checkmarks to completed sections
        document.querySelectorAll('.game-section h3').forEach((header, index) => {
            if (sections[index]) {
                header.classList.add('section-complete');
            } else {
                header.classList.remove('section-complete');
            }
        });
    },
    
    // Time warning effect
    showTimeWarning() {
        timerElement.classList.add('timer-warning');
        
        // Flash effect
        let flashCount = 0;
        const flashInterval = setInterval(() => {
            timerElement.style.visibility = timerElement.style.visibility === 'hidden' ? 'visible' : 'hidden';
            flashCount++;
            
            if (flashCount >= 6) {
                clearInterval(flashInterval);
                timerElement.style.visibility = 'visible';
            }
        }, 300);
    }
};









// ============================================
// START THE GAME WHEN PAGE LOADS
// ============================================

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM fully loaded");
    console.log("🎮 Starting Logic Matrix Puzzle...");
    
    // Check if player is logged in
    const playerData = localStorage.getItem('logicMatrixPlayer');
    if (!playerData) {
        console.log("⚠️ No player data found, redirecting to login");
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize the game
    initGame();
    
    // Add startup message
    setTimeout(() => {
        console.log("🚀 Game started successfully!");
        alert("🎮 Welcome to LOGIC MATRIX PUZZLE!\n\n• Each level has unique questions\n• Complete all 3 sections to advance\n• Questions get more challenging\n• Earn bonus time each level\n\nGood luck!");
    }, 500);
});

// Also initialize if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        const playerData = localStorage.getItem('logicMatrixPlayer');
        if (playerData) {
            initGame();
        }
    }, 1);
}

