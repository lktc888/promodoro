global.electronAPI = {
  showNotification: jest.fn()
};

global.AudioContext = jest.fn().mockReturnValue({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    frequency: { value: 800 },
    type: 'sine',
    start: jest.fn(),
    stop: jest.fn()
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() }
  }),
  destination: 'destination'
});

global.Notification = { permission: 'granted' };