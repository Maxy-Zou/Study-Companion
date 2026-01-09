// ===== MOCK DATA =====
const mockSessions = [
    {
        date: '2026-01-08',
        startTime: '14:30',
        duration: 45,
        breaksAccepted: 2,
        breaksIgnored: 1
    },
    {
        date: '2026-01-08',
        startTime: '10:15',
        duration: 60,
        breaksAccepted: 3,
        breaksIgnored: 0
    },
    {
        date: '2026-01-07',
        startTime: '16:00',
        duration: 30,
        breaksAccepted: 1,
        breaksIgnored: 1
    },
    {
        date: '2026-01-07',
        startTime: '09:30',
        duration: 50,
        breaksAccepted: 2,
        breaksIgnored: 1
    },
    {
        date: '2026-01-06',
        startTime: '13:45',
        duration: 40,
        breaksAccepted: 2,
        breaksIgnored: 0
    },
    {
        date: '2026-01-05',
        startTime: '11:00',
        duration: 55,
        breaksAccepted: 3,
        breaksIgnored: 1
    },
    {
        date: '2026-01-04',
        startTime: '15:20',
        duration: 35,
        breaksAccepted: 1,
        breaksIgnored: 0
    }
];

// ===== STATE =====
let sessionState = {
    isActive: false,
    isPaused: false,
    startTime: null,
    timerInterval: null,
    remainingSeconds: 25 * 60, // 25 minutes default
    elapsedSeconds: 0,
    breaksTaken: 0,
    breakReminderTimeout: null,
    waterReminderTimeout: null,
    nextBreakReminder: null,
    nextWaterReminder: null
};

// ===== DOM ELEMENTS =====
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const timerDisplay = document.getElementById('timer');
const timerLabel = document.getElementById('timer-label');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const endBtn = document.getElementById('end-btn');
const sessionInfo = document.getElementById('session-info');
const elapsedTimeEl = document.getElementById('elapsed-time');
const breaksCountEl = document.getElementById('breaks-count');
const sessionsList = document.getElementById('sessions-list');

// Modal elements
const breakModal = document.getElementById('break-modal');
const waterModal = document.getElementById('water-modal');
const dismissBreakBtn = document.getElementById('dismiss-break');
const snoozeBreakBtn = document.getElementById('snooze-break');
const acceptBreakBtn = document.getElementById('accept-break');
const dismissWaterBtn = document.getElementById('dismiss-water');
const acceptWaterBtn = document.getElementById('accept-water');

// ===== TAB NAVIGATION =====
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Update active states
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${targetTab}-tab`) {
                content.classList.add('active');
            }
        });
        
        // Render history when switching to history tab
        if (targetTab === 'history') {
            renderHistory();
        }
    });
});

// ===== TIMER FUNCTIONS =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatElapsedTime(seconds) {
    const mins = Math.floor(seconds / 60);
    if (mins < 1) return `${seconds}s`;
    return `${mins}m`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(sessionState.remainingSeconds);
    elapsedTimeEl.textContent = formatElapsedTime(sessionState.elapsedSeconds);
}

function startTimer() {
    sessionState.timerInterval = setInterval(() => {
        try {
            if (sessionState.remainingSeconds > 0) {
                sessionState.remainingSeconds--;
                sessionState.elapsedSeconds++;
                updateTimerDisplay();
            } else {
                // Timer completed
                clearInterval(sessionState.timerInterval);
                timerLabel.textContent = 'Session Complete! 🎉';
                playCompletionAnimation();
            }
        } catch (error) {
            console.error('Timer error:', error);
        }
    }, 1000);
}

function stopTimer() {
    if (sessionState.timerInterval) {
        clearInterval(sessionState.timerInterval);
        sessionState.timerInterval = null;
    }
}

function playCompletionAnimation() {
    // Add a little celebration effect
    timerDisplay.style.animation = 'none';
    setTimeout(() => {
        timerDisplay.style.animation = 'bounce 0.5s ease';
    }, 10);
}

// ===== SESSION CONTROL =====
function startSession() {
    sessionState.isActive = true;
    sessionState.isPaused = false;
    sessionState.startTime = Date.now();
    sessionState.remainingSeconds = 25 * 60;
    sessionState.elapsedSeconds = 0;
    sessionState.breaksTaken = 0;
    
    // Update UI
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    endBtn.classList.remove('hidden');
    sessionInfo.classList.remove('hidden');
    timerLabel.textContent = 'Focus Time 🎯';
    
    updateTimerDisplay();
    startTimer();
    
    // Schedule reminders
    scheduleBreakReminder();
    scheduleWaterReminder();
}

function pauseSession() {
    sessionState.isPaused = true;
    stopTimer();
    
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    timerLabel.textContent = 'Paused ⏸️';
    
    // Clear reminders while paused
    clearReminders();
}

function resumeSession() {
    sessionState.isPaused = false;
    startTimer();
    
    resumeBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    timerLabel.textContent = 'Focus Time 🎯';
    
    // Reschedule reminders
    scheduleBreakReminder();
    scheduleWaterReminder();
}

function endSession() {
    sessionState.isActive = false;
    sessionState.isPaused = false;
    stopTimer();
    clearReminders();
    
    // Reset UI
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    resumeBtn.classList.add('hidden');
    endBtn.classList.add('hidden');
    sessionInfo.classList.add('hidden');
    
    sessionState.remainingSeconds = 25 * 60;
    sessionState.elapsedSeconds = 0;
    sessionState.breaksTaken = 0;
    
    updateTimerDisplay();
    timerLabel.textContent = 'Ready to Focus';
}

// ===== REMINDER SYSTEM =====
function scheduleBreakReminder() {
    // Clear any existing reminder
    if (sessionState.breakReminderTimeout) {
        clearTimeout(sessionState.breakReminderTimeout);
    }
    
    // Schedule next reminder (20-30 seconds for demo - quick to see)
    const delay = (20 + Math.random() * 10) * 1000; // 20-30 seconds in ms
    sessionState.breakReminderTimeout = setTimeout(() => {
        if (sessionState.isActive && !sessionState.isPaused) {
            showBreakReminder();
        }
    }, delay);
}

function scheduleWaterReminder() {
    // Clear any existing reminder
    if (sessionState.waterReminderTimeout) {
        clearTimeout(sessionState.waterReminderTimeout);
    }
    
    // Schedule next reminder (30-45 seconds for demo - quick to see)
    const delay = (30 + Math.random() * 15) * 1000; // 30-45 seconds in ms
    sessionState.waterReminderTimeout = setTimeout(() => {
        if (sessionState.isActive && !sessionState.isPaused) {
            showWaterReminder();
        }
    }, delay);
}

function clearReminders() {
    if (sessionState.breakReminderTimeout) {
        clearTimeout(sessionState.breakReminderTimeout);
        sessionState.breakReminderTimeout = null;
    }
    if (sessionState.waterReminderTimeout) {
        clearTimeout(sessionState.waterReminderTimeout);
        sessionState.waterReminderTimeout = null;
    }
}

function showBreakReminder() {
    const messages = [
        "You've been studying for a while. Taking short breaks helps maintain focus and prevents burnout.",
        "Time to rest your eyes! A quick break can boost your productivity.",
        "Your brain needs a moment to process. Take a short break!",
        "Stand up and stretch! Movement helps concentration."
    ];
    
    const breakMessage = document.getElementById('break-message');
    breakMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    
    breakModal.classList.remove('hidden');
}

function showWaterReminder() {
    waterModal.classList.remove('hidden');
}

function hideBreakReminder() {
    breakModal.classList.add('hidden');
}

function hideWaterReminder() {
    waterModal.classList.add('hidden');
}

// Show custom end session confirmation modal
function showEndSessionConfirm() {
    const existingModal = document.getElementById('end-confirm-modal');
    if (existingModal) {
        existingModal.classList.remove('hidden');
        return;
    }
    
    // Create modal dynamically
    const modalHtml = `
        <div class="modal-overlay" id="end-confirm-modal">
            <div class="modal">
                <div class="modal-icon">⚠️</div>
                <h2 class="modal-title">End Session?</h2>
                <p class="modal-message">
                    Are you sure you want to end this session? Your progress will be saved.
                </p>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="cancel-end">Cancel</button>
                    <button class="btn btn-danger" id="confirm-end">End Session</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('end-confirm-modal');
    const cancelBtn = document.getElementById('cancel-end');
    const confirmBtn = document.getElementById('confirm-end');
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    confirmBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        endSession();
    });
}


// ===== MODAL ACTIONS =====
dismissBreakBtn.addEventListener('click', () => {
    hideBreakReminder();
    // Don't reschedule - user dismissed
});

snoozeBreakBtn.addEventListener('click', () => {
    hideBreakReminder();
    // Reschedule for 5 minutes later
    sessionState.breakReminderTimeout = setTimeout(() => {
        if (sessionState.isActive && !sessionState.isPaused) {
            showBreakReminder();
        }
    }, 5 * 60 * 1000);
});

acceptBreakBtn.addEventListener('click', () => {
    hideBreakReminder();
    sessionState.breaksTaken++;
    breaksCountEl.textContent = sessionState.breaksTaken;
    
    // Pause session for break
    if (!sessionState.isPaused) {
        pauseSession();
    }
    
    // Show feedback
    timerLabel.textContent = 'Taking a Break ☕';
    
    // Reschedule for after break
    scheduleBreakReminder();
});

dismissWaterBtn.addEventListener('click', () => {
    hideWaterReminder();
    scheduleWaterReminder();
});

acceptWaterBtn.addEventListener('click', () => {
    hideWaterReminder();
    scheduleWaterReminder();
});

// ===== SESSION CONTROLS =====
startBtn.addEventListener('click', startSession);
pauseBtn.addEventListener('click', pauseSession);
resumeBtn.addEventListener('click', resumeSession);
endBtn.addEventListener('click', () => {
    // Show custom confirmation modal instead of browser confirm
    showEndSessionConfirm();
});

// ===== HISTORY RENDERING =====
function renderHistory() {
    renderSessions();
    renderChart();
}

function renderSessions() {
    sessionsList.innerHTML = '';
    
    mockSessions.forEach(session => {
        const sessionEl = document.createElement('div');
        sessionEl.className = 'session-item';
        
        const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        sessionEl.innerHTML = `
            <div class="session-header">
                <div class="session-date">${formattedDate} at ${session.startTime}</div>
                <div class="session-duration">${session.duration} min</div>
            </div>
            <div class="session-stats">
                <div class="session-stat">
                    <span class="session-stat-label">Breaks Taken</span>
                    <span class="session-stat-value">${session.breaksAccepted}</span>
                </div>
                <div class="session-stat">
                    <span class="session-stat-label">Breaks Missed</span>
                    <span class="session-stat-value">${session.breaksIgnored}</span>
                </div>
            </div>
        `;
        
        sessionsList.appendChild(sessionEl);
    });
}

function renderChart() {
    const canvas = document.getElementById('activity-chart');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = 300 * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Aggregate data by day
    const dailyData = {};
    mockSessions.forEach(session => {
        if (!dailyData[session.date]) {
            dailyData[session.date] = 0;
        }
        dailyData[session.date] += session.duration;
    });
    
    // Get last 7 days
    const days = [];
    const values = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        days.push(dayName);
        values.push(dailyData[dateStr] || 0);
    }
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = 300 - padding * 2;
    const barWidth = chartWidth / days.length - 10;
    const maxValue = Math.max(...values, 60); // At least 60 for scale
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, 300);
    
    // Draw bars
    values.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + 10);
        const y = padding + chartHeight - barHeight;
        
        // Gradient for bars
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        // Draw bar
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 8);
        ctx.fill();
        
        // Draw value on top
        ctx.fillStyle = '#f8fafc';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        if (value > 0) {
            ctx.fillText(`${value}m`, x + barWidth / 2, y - 5);
        }
        
        // Draw day label
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(days[index], x + barWidth / 2, padding + chartHeight + 25);
    });
    
    // Draw y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const value = Math.round((maxValue / 4) * i);
        const y = padding + chartHeight - (chartHeight / 4) * i;
        ctx.fillText(`${value}m`, padding - 10, y + 4);
        
        // Draw grid line
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
    }
}

// Polyfill for roundRect if not available
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    updateTimerDisplay();
    renderHistory();
    
    // Demo control buttons
    const triggerBreakBtn = document.getElementById('trigger-break-demo');
    const triggerWaterBtn = document.getElementById('trigger-water-demo');
    
    if (triggerBreakBtn) {
        triggerBreakBtn.addEventListener('click', () => {
            showBreakReminder();
        });
    }
    
    if (triggerWaterBtn) {
        triggerWaterBtn.addEventListener('click', () => {
            showWaterReminder();
        });
    }
});
