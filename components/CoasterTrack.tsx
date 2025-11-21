import React, { useRef, useEffect, useState } from 'react';
import { EasingDefinition } from '../types';
import { CoasterCart } from './CoasterCart';
import { Play, Pause, GripVertical } from 'lucide-react';

interface CoasterTrackProps {
  easing: EasingDefinition;
  isPlayingGlobal: boolean;
  viewWidth?: number;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragEnd?: () => void;
}

export const CoasterTrack: React.FC<CoasterTrackProps> = ({ 
  easing, 
  isPlayingGlobal, 
  viewWidth = 300,
  onDragStart,
  onDragEnter,
  onDragEnd
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  // Track dimensions
  const width = viewWidth;
  const height = 250; // Fixed height
  
  // Increased padding to prevent clipping of Back/Elastic functions
  const paddingX = 40; 
  const paddingY = 45;
  const roadY = height - 20; 
  
  const trackWidth = width - paddingX * 2;
  const graphHeight = height - paddingY - 40; 

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

  // Generate Graph Path Data (X = Position, Y = Time)
  const points: [number, number][] = [];
  const steps = 100;
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const val = easing.fn(t);
    
    // X is Position (Value) - Matches Car
    const x = paddingX + val * trackWidth; 
    
    // Y is Time - Bottom to Top
    const y = (roadY - 30) - (t * graphHeight); 
    
    points.push([x, y]);
  }

  const pathData = `M ${points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')}`;

  // Calculate Cart Position
  const t = progress;
  const val = easing.fn(t);
  
  const xPos = paddingX + val * trackWidth;
  const yPos = roadY;
  const angleDeg = 0;

  // Time Cursor Position
  const cursorX = xPos;
  const cursorY = (roadY - 30) - (t * graphHeight);

  return (
    <div 
        className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col group hover:border-slate-600 transition-all duration-300 cursor-move"
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
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-start relative z-10">
        <div className="flex items-start gap-2">
          <div className="mt-1 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing">
            <GripVertical size={16} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: easing.color }}></span>
                {easing.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed h-8 line-clamp-2">{easing.description}</p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}
          className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700 flex-shrink-0 ml-2"
        >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Visualization Area */}
      <div 
        className="relative flex-1 bg-slate-900 transition-all duration-300 cursor-pointer" 
        style={{ height: '250px' }}
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
           {/* Axis Labels */}
           <text x={paddingX - 10} y={roadY - 30 - graphHeight/2} fill="#64748b" fontSize="10" transform={`rotate(-90, ${paddingX - 10}, ${roadY - 30 - graphHeight/2})`} textAnchor="middle">Time (t)</text>
           <text x={width/2} y={roadY - 10} fill="#64748b" fontSize="10" textAnchor="middle">Position (x)</text>

           {/* The Road */}
           <line x1={paddingX} y1={roadY} x2={width-paddingX} y2={roadY} stroke="#334155" strokeWidth="2" />
           
           {/* Start/End Markers */}
           <line x1={paddingX} y1={roadY-5} x2={paddingX} y2={roadY+5} stroke="#475569" strokeWidth="2" />
           <line x1={width-paddingX} y1={roadY-5} x2={width-paddingX} y2={roadY+5} stroke="#475569" strokeWidth="2" />
           
           {/* Graph Axes */}
           <line x1={paddingX} y1={roadY-30} x2={width-paddingX} y2={roadY-30} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />
           <line x1={paddingX} y1={(roadY-30) - graphHeight} x2={width-paddingX} y2={(roadY-30) - graphHeight} stroke="#334155" strokeWidth="1" strokeDasharray="4 4" />

           {/* The Graph Curve */}
           <path 
             d={pathData} 
             fill="none" 
             stroke={easing.color} 
             strokeWidth="2" 
             strokeOpacity="0.3"
           />

           {/* Time Cursor Line */}
           <line 
             x1={cursorX} 
             y1={roadY - 30} 
             x2={cursorX} 
             y2={cursorY} 
             stroke="white" 
             strokeOpacity="0.2"
             strokeWidth="1"
             strokeDasharray="2 2"
           />
           
           <circle cx={cursorX} cy={cursorY} r="3" fill={easing.color} opacity="0.8" />

           {/* The Car */}
           <CoasterCart 
             x={xPos} 
             y={yPos} 
             angle={angleDeg} 
             color={easing.color}
             opacity={1}
           />
        </svg>
        
        {!isPlaying && progress === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity opacity-0 group-hover:opacity-100">
                <div className="bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300 font-medium flex items-center gap-2">
                    <Play size={12} fill="currentColor" /> 点击运行
                </div>
            </div>
        )}
      </div>
    </div>
  );
};