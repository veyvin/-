import { EasingDefinition } from '../types';

const PI = Math.PI;
const c1 = 1.70158;
const c2 = c1 * 1.525;
const c3 = c1 + 1;
const c4 = (2 * PI) / 3;
const c5 = (2 * PI) / 4.5;

// --- Linear ---
const linear = (x: number): number => x;

// --- Sine ---
const easeInSine = (x: number): number => 1 - Math.cos((x * PI) / 2);
const easeOutSine = (x: number): number => Math.sin((x * PI) / 2);
const easeInOutSine = (x: number): number => -(Math.cos(PI * x) - 1) / 2;

// --- Quad ---
const easeInQuad = (x: number): number => x * x;
const easeOutQuad = (x: number): number => 1 - (1 - x) * (1 - x);
const easeInOutQuad = (x: number): number => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

// --- Cubic ---
const easeInCubic = (x: number): number => x * x * x;
const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number): number => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// --- Quart ---
const easeInQuart = (x: number): number => x * x * x * x;
const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
const easeInOutQuart = (x: number): number => x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;

// --- Quint ---
const easeInQuint = (x: number): number => x * x * x * x * x;
const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);
const easeInOutQuint = (x: number): number => x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;

// --- Expo ---
const easeInExpo = (x: number): number => x === 0 ? 0 : Math.pow(2, 10 * x - 10);
const easeOutExpo = (x: number): number => x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
const easeInOutExpo = (x: number): number => x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;

// --- Circ ---
const easeInCirc = (x: number): number => 1 - Math.sqrt(1 - Math.pow(x, 2));
const easeOutCirc = (x: number): number => Math.sqrt(1 - Math.pow(x - 1, 2));
const easeInOutCirc = (x: number): number => x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;

// --- Back ---
const easeInBack = (x: number): number => c3 * x * x * x - c1 * x * x;
const easeOutBack = (x: number): number => 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
const easeInOutBack = (x: number): number => {
  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (2 * x - 2) + c2) + 2) / 2;
};

// --- Elastic ---
const easeInElastic = (x: number): number => x === 0 ? 0 : x === 1 ? 1 : -Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
const easeOutElastic = (x: number): number => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
const easeInOutElastic = (x: number): number => x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : (Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5)) / 2 + 1;

// --- Bounce ---
const easeOutBounce = (x: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x < 1 / d1) return n1 * x * x;
  else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
  else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
  else return n1 * (x -= 2.625 / d1) * x + 0.984375;
};
const easeInBounce = (x: number): number => 1 - easeOutBounce(1 - x);
const easeInOutBounce = (x: number): number => x < 0.5 ? (1 - easeOutBounce(1 - 2 * x)) / 2 : (1 + easeOutBounce(2 * x - 1)) / 2;

// --- New Fun Functions ---

// Steps
const steps5 = (x: number): number => Math.floor(x * 5) / 5;

// Shake / Jitter
const shake = (x: number): number => x + Math.sin(x * PI * 20) * 0.03;

// Damped Spring
const spring = (x: number): number => {
  return 1 + -Math.exp(-6 * x) * Math.cos(PI * 4 * x);
  // Normalize for 0 start? A bit complex, let's stick to a fun "wobbly arrival"
};
// Actually let's use a simpler "Overshoot then wiggle"
const wiggle = (x: number): number => {
    return x + Math.sin(x * PI * 8) * (1 - x) * 0.1;
}


export const easings: EasingDefinition[] = [
    // Standard
    { id: 'linear', name: 'Linear', description: '匀速运动。枯燥但实用。', fn: linear, color: '#94a3b8' },
    
    // Sine
    { id: 'easeInSine', name: 'Ease In Sine', description: '正弦加速。温柔的开始。', fn: easeInSine, color: '#22d3ee' },
    { id: 'easeOutSine', name: 'Ease Out Sine', description: '正弦减速。温柔的停止。', fn: easeOutSine, color: '#22d3ee' },
    { id: 'easeInOutSine', name: 'Ease InOut Sine', description: '平滑起止。最基础的缓动。', fn: easeInOutSine, color: '#22d3ee' },
    
    // Quad
    { id: 'easeInQuad', name: 'Ease In Quad', description: '二次方加速。', fn: easeInQuad, color: '#38bdf8' },
    { id: 'easeOutQuad', name: 'Ease Out Quad', description: '二次方减速。', fn: easeOutQuad, color: '#38bdf8' },
    { id: 'easeInOutQuad', name: 'Ease InOut Quad', description: '二次方起止。', fn: easeInOutQuad, color: '#38bdf8' },
    
    // Cubic
    { id: 'easeInCubic', name: 'Ease In Cubic', description: '三次方加速。更明显的加速感。', fn: easeInCubic, color: '#60a5fa' },
    { id: 'easeOutCubic', name: 'Ease Out Cubic', description: '三次方减速。', fn: easeOutCubic, color: '#60a5fa' },
    { id: 'easeInOutCubic', name: 'Ease InOut Cubic', description: '三次方起止。', fn: easeInOutCubic, color: '#60a5fa' },
    
    // Quart
    { id: 'easeInQuart', name: 'Ease In Quart', description: '四次方加速。', fn: easeInQuart, color: '#818cf8' },
    { id: 'easeOutQuart', name: 'Ease Out Quart', description: '四次方减速。', fn: easeOutQuart, color: '#818cf8' },
    { id: 'easeInOutQuart', name: 'Ease InOut Quart', description: '四次方起止。', fn: easeInOutQuart, color: '#818cf8' },
    
    // Quint
    { id: 'easeInQuint', name: 'Ease In Quint', description: '五次方加速。', fn: easeInQuint, color: '#a78bfa' },
    { id: 'easeOutQuint', name: 'Ease Out Quint', description: '五次方减速。', fn: easeOutQuint, color: '#a78bfa' },
    { id: 'easeInOutQuint', name: 'Ease InOut Quint', description: '五次方起止。极具戏剧性。', fn: easeInOutQuint, color: '#a78bfa' },
    
    // Expo
    { id: 'easeInExpo', name: 'Ease In Expo', description: '指数加速。就像火箭发射。', fn: easeInExpo, color: '#f87171' },
    { id: 'easeOutExpo', name: 'Ease Out Expo', description: '指数减速。', fn: easeOutExpo, color: '#f87171' },
    { id: 'easeInOutExpo', name: 'Ease InOut Expo', description: '极速起止。', fn: easeInOutExpo, color: '#f87171' },
    
    // Circ
    { id: 'easeInCirc', name: 'Ease In Circ', description: '圆形加速。', fn: easeInCirc, color: '#34d399' },
    { id: 'easeOutCirc', name: 'Ease Out Circ', description: '圆形减速。', fn: easeOutCirc, color: '#34d399' },
    { id: 'easeInOutCirc', name: 'Ease InOut Circ', description: '圆形起止。', fn: easeInOutCirc, color: '#34d399' },
    
    // Back
    { id: 'easeInBack', name: 'Ease In Back', description: '回拉加速。先向后退，再冲刺。', fn: easeInBack, color: '#fb923c' },
    { id: 'easeOutBack', name: 'Ease Out Back', description: '冲刺回弹。冲过头了再回来。', fn: easeOutBack, color: '#fb923c' },
    { id: 'easeInOutBack', name: 'Ease InOut Back', description: '双向回弹。', fn: easeInOutBack, color: '#fb923c' },
    
    // Elastic
    { id: 'easeInElastic', name: 'Ease In Elastic', description: '弹性加速。像拉伸的橡皮筋。', fn: easeInElastic, color: '#facc15' },
    { id: 'easeOutElastic', name: 'Ease Out Elastic', description: '弹性减速。Q弹果冻效果。', fn: easeOutElastic, color: '#facc15' },
    { id: 'easeInOutElastic', name: 'Ease InOut Elastic', description: '弹簧运动。', fn: easeInOutElastic, color: '#facc15' },
    
    // Bounce
    { id: 'easeInBounce', name: 'Ease In Bounce', description: '落地反弹(逆)。', fn: easeInBounce, color: '#f472b6' },
    { id: 'easeOutBounce', name: 'Ease Out Bounce', description: '皮球落地。经典的物理反弹。', fn: easeOutBounce, color: '#f472b6' },
    { id: 'easeInOutBounce', name: 'Ease InOut Bounce', description: '来回跳跃。', fn: easeInOutBounce, color: '#f472b6' },
    
    // Specials
    { id: 'steps5', name: 'Steps (5)', description: '阶梯运动。瞬间移动的机械感。', fn: steps5, color: '#a3e635' },
    { id: 'shake', name: 'Shake / Jitter', description: '抖动前行。路面不太平整。', fn: shake, color: '#f43f5e' },
    { id: 'wiggle', name: 'Wiggle', description: '摇摆前进。像蛇一样游走。', fn: wiggle, color: '#d946ef' },
];