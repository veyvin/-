import React, { useRef, useEffect, useState, useMemo } from 'react';
import { CoasterCart } from './CoasterCart';
import { Play, Pause, Code, AlertCircle, GripVertical, Plus } from 'lucide-react';
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
  viewWidth?: number;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragEnd?: () => void;
  onAdd?: (easing: EasingDefinition) => void;
}

export const CustomCoasterTrack: React.FC<CustomCoasterTrackProps> = ({ 
  isPlayingGlobal, 
  viewWidth = 300,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onAdd
}) => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);

  // Track dimensions
  const height = 250; 
  const width = viewWidth;
  
  const paddingX = 40;
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
      
      // Test run
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
      color: error ? '#ef4444' : '#8b5cf6' 
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

  // Generate Graph Path Data (Position vs Time)
  const points: [number, number][] = [];
  const steps = 100;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const val = easing.fn(t);
    // X is Position
    const x = paddingX + val * trackWidth; 
    // Y is Time 
    const y = (roadY - 30) - (t * graphHeight); 
    points.push([x, y]);
  }
  const pathData = `M ${points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')}`;

  const t = progress;
  const val = easing.fn(t);
  
  const xPos = paddingX + val * trackWidth;
  const yPos = roadY;
  const angleDeg = 0;

  const cursorX = xPos;
  const cursorY = (roadY - 30) - (t * graphHeight);

  const handleAdd = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (error) {
          alert("代码有错误，无法保存。");
          return;
      }
      
      const name = window.prompt("给你的缓动函数起个名字：", "我的自定义缓动");
      if (name && onAdd) {
        const uniqueId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        onAdd({
            id: uniqueId,
            name: name,
            description: 'Custom algorithm from DIY Lab',
            fn: customFn, 
            color: '#8b5cf6'
        });
      }
  };

  return (
    <div 
        className="col-span-1 md:col-span-2 lg:col-span-2 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col md:flex-row group hover:border-slate-600 transition-all duration-300 cursor-move relative"
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
        <div className="p-4 bg-slate-950/50 flex justify-between items-center border-b border-slate-800 relative z-10">
             <div className="flex items-center gap-2">
                <div className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={18} />
                </div>
                <Code size={18} className="text-purple-500" />
                <h3 className="text-lg font-bold text-white">{easing.name}</h3>
             </div>
             
             {/* Button Group */}
             <div 
                className="flex items-center gap-2 relative z-50 cursor-auto"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
             >
                {/* Add Button */}
                <button
                    type="button"
                    onClick={handleAdd}
                    title="保存为新卡片"
                    className="text-slate-400 hover:text-green-400 transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700 flex items-center gap-1 cursor-pointer"
                >
                    <Plus size={16} />
                </button>

                <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
                    className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
             </div>
        </div>
        
        <div 
            className="relative flex-1 bg-slate-900 transition-all duration-300 cursor-pointer" 
            style={{ height: '300px' }} 
            onClick={() => setIsPlaying(!isPlaying)}
        >
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
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
                <text x={paddingX - 10} y={roadY - 30 - graphHeight/2} fill="#64748b" fontSize="10" transform={`rotate(-90, ${paddingX - 10}, ${roadY - 30 - graphHeight/2})`} textAnchor="middle">Time (t)</text>
                <text x={width/2} y={roadY - 10} fill="#64748b" fontSize="10" textAnchor="middle">Position (x)</text>

                <line x1={paddingX} y1={roadY} x2={width-paddingX} y2={roadY} stroke="#334155" strokeWidth="2" />
                <line x1={paddingX} y1={roadY-5} x2={paddingX} y2={roadY+5} stroke="#475569" strokeWidth="2" />
                <line x1={width-paddingX} y1={roadY-5} x2={width-paddingX} y2={roadY+5} stroke="#475569" strokeWidth="2" />
                
                <line x1={paddingX} y1={roadY-30} x2={width-paddingX} y2={roadY-30} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
                <line x1={paddingX} y1={(roadY-30) - graphHeight} x2={width-paddingX} y2={(roadY-30) - graphHeight} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

                <path d={pathData} fill="none" stroke={easing.color} strokeWidth="2" strokeOpacity="0.3" />
                
                <line x1={cursorX} y1={roadY - 30} x2={cursorX} y2={cursorY} stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={cursorX} cy={cursorY} r="3" fill={easing.color} opacity="0.8" />

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
            // Prevent dragging from the editor area
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
            onKeyDown={(e) => e.stopPropagation()}
          />
          <div className="p-3 border-t border-slate-800 bg-slate-900/50 text-xs text-slate-500 font-mono">
              {'}'}
          </div>
      </div>
    </div>
  );
};