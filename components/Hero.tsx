import React from 'react';
import { Sparkles, Activity, TrendingUp } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-slate-950 py-16 sm:py-24">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 text-blue-400 text-sm font-medium mb-6 backdrop-blur-sm">
          <Sparkles size={16} />
          <span>Interactive Visualization</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 tracking-tight mb-6">
          缓动函数过山车
          <span className="block text-2xl sm:text-3xl mt-2 font-normal text-slate-400 font-serif italic">
            Easing Functions Roller Coaster
          </span>
        </h1>
        
        <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          在动画世界里，<span className="text-white font-semibold">Timing is everything</span>。
          这里不仅仅是枯燥的数学曲线，而是真实的物理体验。点击下方的轨道，观察小车如何在不同“缓动函数”构建的坡道上加速、减速和反弹。感受每一个像素的加速度。
        </p>

        <div className="mt-10 flex justify-center gap-6 text-slate-400 text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <Activity className="text-blue-400" size={24} />
            </div>
            <span>物理模拟</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <TrendingUp className="text-green-400" size={24} />
             </div>
            <span>直观曲线</span>
          </div>
        </div>
      </div>
    </div>
  );
};
