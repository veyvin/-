import React, { useRef, useEffect, useState } from 'react';
import { EasingDefinition } from '../types';
import { CoasterCart } from './CoasterCart';
import { Play, Pause } from 'lucide-react';

interface CoasterTrackProps {
  easing: EasingDefinition;
  isPlayingGlobal: boolean;
  viewHeight?: number;
}

export const CoasterTrack: React.FC<CoasterTrackProps> = ({ easing, isPlayingGlobal, viewHeight = 150 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number | undefined>(undefined);
  
  // Track dimensions
  const width = 300;
  const height = viewHeight; // Use dynamic height
  // Increased vertical padding to handle "Elastic" and "Back" functions that overshoot 0 and 1
  const paddingX = 30;
  const paddingY = 45;
  const trackWidth = width - paddingX * 2;
  const trackHeight = height - paddingY * 2;

  // Sync with global play state
  useEffect(() => {
    setIsPlaying(isPlayingGlobal);
  }, [isPlayingGlobal]);

  // Animation Loop
  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      // Speed: Completes loop in approx 2.5 seconds
      const speed = 0.0004; 
      
      setProgress(prev => {
        const next = prev + deltaTime * speed;
        return next > 1 ? 0 : next; // Infinite loop
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

  // Generate Path Data
  const points: [number, number][] = [];
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = paddingX + t * trackWidth;
    const val = easing.fn(t);
    // Map 0->1 value to coordinates
    const y = (height - paddingY) - (val * trackHeight); 
    points.push([x, y]);
  }

  const pathData = `M ${points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ')}`;

  // Calculate Cart Position & Angle
  const t = progress;
  const xPos = paddingX + t * trackWidth;
  const yVal = easing.fn(t);
  const yPos = (height - paddingY) - (yVal * trackHeight);

  // Calculate derivative for angle (finite difference)
  const delta = 0.01;
  const tNext = Math.min(t + delta, 1);
  const xNext = paddingX + tNext * trackWidth;
  const yNextVal = easing.fn(tNext);
  const yNextPos = (height - paddingY) - (yNextVal * trackHeight);
  
  const dx = xNext - xPos;
  const dy = yNextPos - yPos;
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = angleRad * (180 / Math.PI);

  // Support Pillars (Vertical lines to create coaster structure)
  const pillars = [];
  for(let i=0; i<=10; i++) {
      const pt = i / 10;
      const px = paddingX + pt * trackWidth;
      const pyVal = easing.fn(pt);
      const py = (height - paddingY) - (pyVal * trackHeight);
      
      // Ensure pillar doesn't draw upwards if the track goes below bottom (rare but possible in elastic)
      // Just clamping drawing to height is fine
      pillars.push(
          <line 
            key={i} 
            x1={px} 
            y1={py} 
            x2={px} 
            y2={height} 
            stroke={easing.color} 
            strokeWidth="1" 
            strokeOpacity="0.2" 
            strokeDasharray="4 4"
          />
      );
  }

  return (
    <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col group hover:border-slate-600 transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: easing.color }}></span>
            {easing.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed h-8">{easing.description}</p>
        </div>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-slate-400 hover:text-white transition-colors p-2 bg-slate-800 rounded-lg hover:bg-slate-700"
        >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
      </div>

      {/* Visualization Area */}
      <div 
        className="relative flex-1 bg-slate-900 transition-all duration-300" 
        style={{ height: `${height}px` }}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
           {/* Axes */}
           <line x1={paddingX} y1={height-paddingY} x2={width-paddingX} y2={height-paddingY} stroke="#334155" strokeWidth="1" />
           <line x1={paddingX} y1={height-paddingY} x2={paddingX} y2={paddingY} stroke="#334155" strokeWidth="1" />

           {/* Support Pillars */}
           {pillars}

           {/* The Track */}
           <path 
             d={pathData} 
             fill="none" 
             stroke={easing.color} 
             strokeWidth="4" 
             strokeLinecap="round"
             className="drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]"
           />
           
           {/* Track Highlight/Glow */}
           <path 
             d={pathData} 
             fill="none" 
             stroke={easing.color} 
             strokeWidth="8" 
             strokeOpacity="0.2"
             className="blur-sm"
           />

           {/* The Cart */}
           <CoasterCart 
             x={xPos} 
             y={yPos} 
             angle={angleDeg} 
             color={easing.color}
             opacity={progress > 0.95 ? (1 - progress) / 0.05 : progress < 0.05 ? progress / 0.05 : 1}
           />
        </svg>
        
        {/* "Click to Start" Overlay if stopped */}
        {!isPlaying && progress === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer">
                <div className="bg-slate-900/90 px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300 font-medium flex items-center gap-2">
                    <Play size={12} fill="currentColor" /> 点击运行
                </div>
            </div>
        )}
      </div>
    </div>
  );
};