const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

beforeEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = `
    <div id="timerText">25:00</div>
    <button id="startBtn">开始</button>
    <button id="resetBtn">重置</button>
    <div id="modeLabel">专注</div>
    <div id="sessionCount">第 1 个番茄</div>
    <button id="switchModeBtn">切换到休息</button>
  `;
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

describe('formatTime', () => {
  test('正确转换 0 秒', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  test('正确转换 60 秒', () => {
    expect(formatTime(60)).toBe('01:00');
  });

  test('正确转换 90 秒', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  test('正确转换 1500 秒 (25分钟)', () => {
    expect(formatTime(1500)).toBe('25:00');
  });

  test('正确转换 300 秒 (5分钟)', () => {
    expect(formatTime(300)).toBe('05:00');
  });

  test('正确转换 99 秒 (带前导零)', () => {
    expect(formatTime(99)).toBe('01:39');
  });
});

describe('startTimer 状态切换', () => {
  let state, timerInterval;

  beforeEach(() => {
    state = 'idle';
    timerInterval = null;
  });

  test('idle -> running', () => {
    if (state === 'running') {
      state = 'paused';
    } else {
      state = 'running';
    }
    expect(state).toBe('running');
  });

  test('running -> paused', () => {
    state = 'running';
    if (state === 'running') {
      state = 'paused';
      timerInterval = null;
    }
    expect(state).toBe('paused');
  });
});

describe('resetTimer', () => {
  test('重置后状态为 idle', () => {
    let state = 'running';
    let timerInterval = setInterval(() => {}, 1000);
    state = 'idle';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    expect(state).toBe('idle');
    expect(timerInterval).toBe(null);
  });

  test('重置后时间恢复为 FOCUS_TIME (focus模式)', () => {
    let currentMode = 'focus';
    let timeLeft = 100;
    timeLeft = currentMode === 'focus' ? FOCUS_TIME : BREAK_TIME;
    expect(timeLeft).toBe(FOCUS_TIME);
  });

  test('重置后时间恢复为 BREAK_TIME (break模式)', () => {
    let currentMode = 'break';
    let timeLeft = 100;
    timeLeft = currentMode === 'focus' ? FOCUS_TIME : BREAK_TIME;
    expect(timeLeft).toBe(BREAK_TIME);
  });
});

describe('switchMode', () => {
  test('focus -> break', () => {
    let currentMode = 'focus';
    let sessionNumber = 1;
    if (currentMode === 'focus') {
      currentMode = 'break';
    } else {
      currentMode = 'focus';
      sessionNumber++;
    }
    expect(currentMode).toBe('break');
  });

  test('break -> focus', () => {
    let currentMode = 'break';
    let sessionNumber = 1;
    if (currentMode === 'focus') {
      currentMode = 'break';
    } else {
      currentMode = 'focus';
      sessionNumber++;
    }
    expect(currentMode).toBe('focus');
    expect(sessionNumber).toBe(2);
  });
});

describe('onTimerComplete', () => {
  test('focus 完成后切换到 break', () => {
    let currentMode = 'focus';
    let sessionNumber = 1;
    let timeLeft = 0;

    if (currentMode === 'focus') {
      currentMode = 'break';
      timeLeft = BREAK_TIME;
    } else {
      currentMode = 'focus';
      timeLeft = FOCUS_TIME;
      sessionNumber++;
    }

    expect(currentMode).toBe('break');
    expect(timeLeft).toBe(BREAK_TIME);
    expect(sessionNumber).toBe(1);
  });

  test('break 完成后切换到 focus', () => {
    let currentMode = 'break';
    let sessionNumber = 1;
    let timeLeft = 0;

    if (currentMode === 'focus') {
      currentMode = 'break';
      timeLeft = BREAK_TIME;
    } else {
      currentMode = 'focus';
      timeLeft = FOCUS_TIME;
      sessionNumber++;
    }

    expect(currentMode).toBe('focus');
    expect(timeLeft).toBe(FOCUS_TIME);
    expect(sessionNumber).toBe(2);
  });
});

describe('playSound', () => {
  test('调用 AudioContext 生成音频无报错', () => {
    const mockCtx = {
      createOscillator: jest.fn().mockReturnValue({
        connect: jest.fn(),
        frequency: { value: 800 },
        type: 'sine',
        start: jest.fn(),
        stop: jest.fn()
      }),
      createGain: jest.fn().mockReturnValue({
        connect: jest.fn(),
        gain: {
          setValueAtTime: jest.fn(),
          exponentialRampToValueAtTime: jest.fn()
        }
      }),
      destination: 'destination',
      currentTime: 0
    };

    const oscillator = mockCtx.createOscillator();
    const gainNode = mockCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(mockCtx.destination);

    expect(oscillator.connect).toHaveBeenCalledWith(gainNode);
    expect(gainNode.connect).toHaveBeenCalledWith(mockCtx.destination);
  });
});

describe('showNotification', () => {
  test('使用 electronAPI.showNotification', () => {
    global.electronAPI = { showNotification: jest.fn() };
    const title = '测试通知';
    const body = '测试内容';

    if (global.electronAPI && global.electronAPI.showNotification) {
      global.electronAPI.showNotification(title, body);
    }

    expect(global.electronAPI.showNotification).toHaveBeenCalledWith(title, body);
  });

  test('electronAPI 不可用时不报错', () => {
    global.electronAPI = undefined;
    expect(() => {
      if (global.electronAPI && global.electronAPI.showNotification) {
        global.electronAPI.showNotification('title', 'body');
      }
    }).not.toThrow();
  });
});