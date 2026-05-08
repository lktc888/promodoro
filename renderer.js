const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const timerText = document.getElementById('timerText');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const modeLabel = document.getElementById('modeLabel');
const sessionCount = document.getElementById('sessionCount');
const switchModeBtn = document.getElementById('switchModeBtn');

let state = 'idle';
let currentMode = 'focus';
let timeLeft = FOCUS_TIME;
let sessionNumber = 1;
let timerInterval = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  timerText.textContent = formatTime(timeLeft);

  if (currentMode === 'focus') {
    modeLabel.textContent = '专注';
    modeLabel.classList.remove('rest');
  } else {
    modeLabel.textContent = '休息';
    modeLabel.classList.add('rest');
  }

  sessionCount.textContent = `第 ${sessionNumber} 个番茄`;

  if (state === 'running') {
    startBtn.textContent = '暂停';
    startBtn.classList.add('paused');
  } else {
    startBtn.textContent = '开始';
    startBtn.classList.remove('paused');
  }
}

function startTimer() {
  if (state === 'running') {
    state = 'paused';
    clearInterval(timerInterval);
  } else {
    state = 'running';
    timerInterval = setInterval(() => {
      timeLeft--;
      updateDisplay();

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        onTimerComplete();
      }
    }, 1000);
  }
  updateDisplay();
}

function resetTimer() {
  clearInterval(timerInterval);
  state = 'idle';
  timeLeft = currentMode === 'focus' ? FOCUS_TIME : BREAK_TIME;
  updateDisplay();
}

function switchMode() {
  clearInterval(timerInterval);
  state = 'idle';

  if (currentMode === 'focus') {
    currentMode = 'break';
    timeLeft = BREAK_TIME;
    switchModeBtn.textContent = '切换到专注';
  } else {
    currentMode = 'focus';
    timeLeft = FOCUS_TIME;
    sessionNumber++;
    switchModeBtn.textContent = '切换到休息';
  }

  updateDisplay();
}

function onTimerComplete() {
  state = 'idle';
  playSound();

  if (currentMode === 'focus') {
    showNotification('番茄钟', '专注时间结束！休息一下吧');
    currentMode = 'break';
    timeLeft = BREAK_TIME;
    switchModeBtn.textContent = '切换到专注';
  } else {
    showNotification('番茄钟', '休息结束！继续专注');
    currentMode = 'focus';
    timeLeft = FOCUS_TIME;
    sessionNumber++;
    switchModeBtn.textContent = '切换到休息';
  }

  updateDisplay();
}

function playSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1);
}

function showNotification(title, body) {
  if (window.electronAPI && window.electronAPI.showNotification) {
    window.electronAPI.showNotification(title, body);
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
switchModeBtn.addEventListener('click', switchMode);

if (window.electronAPI && window.electronAPI.onTrayToggle) {
  window.electronAPI.onTrayToggle(() => {
    startTimer();
  });
}

updateDisplay();
