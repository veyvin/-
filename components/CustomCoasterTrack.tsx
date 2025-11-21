import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CoasterCart } from './CoasterCart';
import { Play, Pause, Code, AlertCircle, GripVertical } from 'lucide-react';
import { EasingDefinition } from '../types';

const DEFAULT_CODE = `// 自定义算法模板
// 变量 t: 0 到 1 (时间)
// 返回值: 小车的水平位置 (通常 0 到 1，可以溢出)

const bounces = 4;
const decay = 3;

// 一个衰减的正弦波 (Damped Sine Wave)
return t + Math.sin(t * Math.PI * bounces) * 0.1 * Math.exp(-t * decay);`;

interface CustomCoasterTrackProps {
  isPlayingGlobal: boolean;
  viewHeight?: number;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragEnd?: () => void;
}

export const CustomCoasterTrack: React.FC<CustomCoasterTrackProps> = ({ 
  isPlayingGlobal, 
  viewHeight = 150,
  onDragStart,
  onDragEnter,
  onDragEnd
}) => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  // Track dimensions
  const width = 300;
  const height = viewHeight;
  const paddingX = 30;
  const paddingY = 45;
  const roadY = height - 20;
  
  const trackWidth = width - paddingX * 2;
  const graphHeight = height - paddingY - 40;

  // Compile the user code into a function safely
  const customFn = useMemo(() => {
    try {
      // eslint-disable-next-line no-new-func
      const fnBody = new Function('t', `
        try {
          ${code}
        } catch (e) {
          return 0;
        }
      `);
      
      // Test run to catch runtime errors immediately
      const testVal = fnBody(0.5);
      if (typeof testVal !== 'number' || isNaN(testVal)) {
        throw new Error("代码必须返回一个数字 (Number)");
      }
      
      setError(null);
      return (t: number) => {
        const val = fnBody(t);
        return typeof val === 'number' ? val : 0;
      };
    } catch (e: any) {
      setError(e.message || "Syntax Error");
      return (t: number) => t; // Fallback to linear
    }
  }, [code]);

  const easing: EasingDefinition = {
      id: 'custom',
      name: 'DIY 实验室',
      description: '编写你自己的缓动算法',
      fn: customFn,
      color: error ? '#ef4444' : '#8b5cf6' // Red on error, Purple on success
  };

  // Sync with global play state
  useEffect(() => {
    setIsPlaying(isPlayingGlobal);
    if (isPlayingGlobal) {
      setProgress(0);
    }
  }, [isPlayingGlobal]);

  // Animation Loop
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      const speed = 0.0005; 
      
      setProgress(prev => {
        const next = prev + deltaTime * speed;
        if (next >= 1) {
            return next % 1;
        }
        return next; 
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      previousTimeRef.current = undefined;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying]);

  // Generate Graph Path Data
  const points: [number, number][] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = paddingX + t * trackWidth; // X is Time
    const val = easing.fn(t);
    const y = (roadY - 30) - (val * graphHeight); 
    points.push([x, y]);
  }
  const pathData = `M ${points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')}`;

  // Cart calculation
  const t = progress;
  const val = easing.fn(t);
  
  const xPos = paddingX + val * trackWidth;
  const yPos = roadY;
  const angleDeg = 0;

  // Time Cursor
  const cursorX = paddingX + t * trackWidth;
  const cursorYVal = easing.fn(t);
  const cursorY = (roadY - 30) - (cursorYVal * graphHeight);


  return (
    <div 
        className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col md:flex-row group hover:border-slate-600 transition-all duration-300 cursor-move"
        draggable
        onDragStart={(e) => {
            e.currentTarget.style.opacity = '0.5';
            onDragStart?.();
        }}
        onDragEnd={(e) => {
            e.currentTarget.style.opacity = '1';
            onDragEnd?.();
        }}
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
    >
      
      {/* Visualization Side */}
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
        <div className="p-4 bg-slate-950/50 flex justify-between items-center border-b border-slate-800">
             <div className="flex items-center gap-2">
                <div className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={18} />
                </div>
                <Code size={18} className="text-purple-500" />
                <h3 className="text-lg font-bold text-white">{easing.name}</h3>
             </div>
             <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
              >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
        </div>
        
        <div 
            className="relative flex-1 bg-slate-900 transition-all duration-300 cursor-pointer" 
            style={{ height: '300px' }} 
            onClick={() => setIsPlaying(!isPlaying)}
        >
            <div className="absolute inset-0 opacity-10" 
                style={{ 
                    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
                    backgroundSize: '20px 20px' 
                }}>
            </div>
            <svg 
                width="100%" 
                height="100%" 
                viewBox={`0 0 ${width} ${height}`} 
                preserveAspectRatio="xMidYMid meet"
                className="overflow-visible"
            >
                {/* Road */}
                <line x1={paddingX} y1={roadY} x2={width-paddingX} y2={roadY} stroke="#334155" strokeWidth="2" />
                <line x1={paddingX} y1={roadY-5} x2={paddingX} y2={roadY+5} stroke="#475569" strokeWidth="2" />
                <line x1={width-paddingX} y1={roadY-5} x2={width-paddingX} y2={roadY+5} stroke="#475569" strokeWidth="2" />
                
                {/* Graph Axis */}
                <line x1={paddingX} y1={roadY-30} x2={width-paddingX} y2={roadY-30} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                {/* Graph */}
                <path d={pathData} fill="none" stroke={easing.color} strokeWidth="2" strokeOpacity="0.3" />
                
                {/* Cursor */}
                <line x1={cursorX} y1={roadY - 30} x2={cursorX} y2={(roadY - 30) - graphHeight - 10} stroke="white" strokeOpacity="0.1" strokeWidth="1" />
                <circle cx={cursorX} cy={cursorY} r="3" fill={easing.color} opacity="0.5" />

                {/* Cart */}
                <CoasterCart x={xPos} y={yPos} angle={angleDeg} color={easing.color} />
            </svg>
             {!isPlaying && progress === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                     <div className="bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                        <Play size={12} /> 点击预览
                    </div>
                </div>
             )}
        </div>
      </div>

      {/* Editor Side */}
      <div 
        className="w-full md:w-1/2 lg:w-96 bg-slate-950 flex flex-col h-[300px] md:h-auto cursor-auto"
        onDragStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
        }}
        draggable={true}
      >
          <div className="p-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-mono text-slate-500">function(t) {'{'}</span>
              {error && <span className="flex items-center gap-1 text-xs text-red-400"><AlertCircle size={12}/> 语法错误</span>}
          </div>
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-slate-950 text-blue-300 p-4 text-xs font-mono focus:outline-none resize-none leading-relaxed selection:bg-blue-500/30"
            spellCheck={false}
          />
          <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500 font-mono">
              {'}'}
          </div>
      </div>
    </div>
  );
};