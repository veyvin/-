import React, { useState, useRef, useCallback } from 'react';
import { Hero } from './components/Hero';
import { CoasterTrack } from './components/CoasterTrack';
import { CustomCoasterTrack } from './components/CustomCoasterTrack';
import { easings } from './utils/easings';
import { PlayCircle, PauseCircle, ChevronsLeftRight } from 'lucide-react';
import { EasingDefinition } from './types';

// Define a union type for our grid items
type GridItem = 
  | { type: 'custom'; id: 'custom-track' }
  | { type: 'standard'; id: string; data: EasingDefinition };

const App: React.FC = () => {
  const [isAllPlaying, setIsAllPlaying] = useState(false);
  const [trackHeight, setTrackHeight] = useState(300);

  // Initialize state with Custom track first, followed by standard easings
  const [gridItems, setGridItems] = useState<GridItem[]>(() => {
    const initialItems: GridItem[] = [
        { type: 'custom', id: 'custom-track' },
        ...easings.map(e => ({ type: 'standard' as const, id: e.id, data: e }))
    ];
    return initialItems;
  });

  // Drag and Drop Refs
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const toggleAll = () => {
    setIsAllPlaying(!isAllPlaying);
  };

  // Add new track handler - wrapped in useCallback
  const handleAddTrack = useCallback((newEasing: EasingDefinition) => {
    setGridItems(prev => {
      // Find current index of the custom track
      const customIndex = prev.findIndex(item => item.id === 'custom-track');
      // Insert immediately after it, or at index 1 if not found for some reason
      const insertIndex = customIndex !== -1 ? customIndex + 1 : 1;
      
      const newItems = [...prev];
      newItems.splice(insertIndex, 0, { type: 'standard', id: newEasing.id, data: newEasing });
      return newItems;
    });
  }, []);

  // DND Handlers
  const handleDragStart = (position: number) => {
    dragItem.current = position;
  };

  const handleDragEnter = (position: number) => {
    dragOverItem.current = position;
    
    // If we are over a different item, swap them immediately for visual feedback
    if (dragItem.current !== null && dragItem.current !== position) {
        const newItems = [...gridItems];
        const draggedItemContent = newItems[dragItem.current];
        
        // Remove from old pos
        newItems.splice(dragItem.current, 1);
        // Insert at new pos
        newItems.splice(position, 0, draggedItemContent);
        
        dragItem.current = position; // Update reference to new position
        setGridItems(newItems);
    }
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        
        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center mb-8 sticky top-4 z-50 bg-slate-950/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800/50 shadow-2xl">
            <div className="flex-1 w-full lg:w-auto">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    轨道总览 
                    <span className="text-xs font-normal text-slate-500 px-2 py-0.5 bg-slate-900 rounded-full border border-slate-800">
                        {gridItems.length} Tracks
                    </span>
                </h2>
                <p className="text-sm text-slate-500 hidden sm:block mt-1">
                   <span className="text-blue-400 font-medium">提示:</span> 拖动卡片可调整顺序进行对比
                </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
                {/* Height Slider */}
                <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800 flex-1">
                    <ChevronsLeftRight size={18} className="text-slate-400 rotate-90" />
                    <div className="flex flex-col w-full sm:w-32 lg:w-40">
                        <label htmlFor="height-slider" className="text-xs text-slate-400 font-medium flex justify-between">
                            <span>高度 (Height)</span>
                            <span className="text-white">{trackHeight}px</span>
                        </label>
                        <input 
                            id="height-slider"
                            type="range" 
                            min="200" 
                            max="500" 
                            step="10"
                            value={trackHeight}
                            onChange={(e) => setTrackHeight(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-2"
                        />
                    </div>
                </div>
            </div>

            <button 
                onClick={toggleAll}
                className={`w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg whitespace-nowrap ${
                    isAllPlaying 
                    ? 'bg-slate-800 text-red-400 hover:bg-slate-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'
                }`}
            >
                {isAllPlaying ? (
                    <>
                        <PauseCircle size={20} /> 紧急制动
                    </>
                ) : (
                    <>
                        <PlayCircle size={20} /> 全园发车
                    </>
                )}
            </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {gridItems.map((item, index) => {
              if (item.type === 'custom') {
                  return (
                    <CustomCoasterTrack 
                        key={item.id}
                        isPlayingGlobal={isAllPlaying} 
                        viewWidth={trackHeight} 
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onAdd={handleAddTrack}
                    />
                  );
              } else {
                  return (
                    <CoasterTrack 
                        key={item.id} 
                        easing={item.data} 
                        isPlayingGlobal={isAllPlaying}
                        viewWidth={trackHeight}
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                    />
                  );
              }
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-20 border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>
                缓动函数本质是 Time ($t$) 到 Progress ($p$) 的映射。
                <br className="sm:hidden"/>
                <span className="hidden sm:inline"> • </span>
                当 $t$ 均匀增加时，$p$ 的变化率决定了速度。
            </p>
        </div>
      </main>
    </div>
  );
};

export default App;