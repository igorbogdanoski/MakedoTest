import React from 'react';
import { Zap, Sparkles, Play, ArrowRight } from 'lucide-react';
import RenderContent from './RenderContent';

const LandingPage = ({ setView, setShowTutorial, setTutorialStep, demoStep }) => (
  <div className="min-h-screen bg-white relative overflow-hidden font-sans">
    <nav className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto relative z-10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
        <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100"><Zap className="text-white" size={32} /></div>
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter uppercase text-slate-900">МакедоТест</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Автор: Игор Богданоски</span>
        </div>
      </div>
      <button onClick={() => setView('editor')} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl hover:scale-105 transition">Едитор</button>
    </nav>

    <main className="max-w-7xl mx-auto px-8 pt-20 grid lg:grid-cols-2 gap-16 items-center relative z-10">
      <div className="space-y-10 animate-in slide-in-from-left duration-700">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
          <Sparkles size={16} className="text-indigo-600" />
          <span className="text-xs font-black text-indigo-700 uppercase tracking-widest tracking-tighter">v6.0 Pro со СТЕМ поддршка</span>
        </div>
        <h1 className="text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter text-balance">Креирајте <span className="text-indigo-600">професионални</span> тестови во минути.</h1>
        <div className="flex items-center gap-3 py-2">
           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">ИБ</div>
           <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 leading-tight">Игор Богданоски</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Главен архитект и EdTech експерт</span>
           </div>
        </div>
        <p className="text-xl text-slate-500 leading-relaxed max-w-md font-medium">Најнапредниот софтвер за наставници во Македонија. Подготвен за печатење на А4.</p>
        <div className="flex gap-6">
          <button onClick={() => setView('editor')} className="bg-indigo-600 text-white px-10 py-5 rounded-3xl font-black shadow-2xl flex items-center gap-3 hover:bg-indigo-700 transition active:scale-95 text-lg">Креирај нов тест <ArrowRight size={22} /></button>
          <button onClick={() => { setView('editor'); setShowTutorial(true); setTutorialStep(0); }} className="bg-white border-2 border-slate-100 px-10 py-5 rounded-3xl font-black flex items-center gap-3 hover:border-indigo-100 transition text-lg"><Play size={22} /> Види како работи</button>
        </div>
      </div>

      <div className="relative group cursor-pointer" onClick={() => setView('editor')}>
        <div className="absolute -inset-10 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col gap-10 transform group-hover:scale-[1.02] transition-all duration-500">
           <div className="flex justify-between items-center">
              <div className="bg-indigo-50 text-indigo-600 px-5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest">v6.0 ДЕМО</div>
              <div className="flex gap-2">
                 {[0, 1, 2].map(i => <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${demoStep === i ? 'bg-indigo-500 w-6' : 'bg-slate-100 w-2.5'}`} />)}
              </div>
           </div>
           <div className="min-h-[140px] flex items-center text-4xl font-black text-slate-900 leading-tight">
              {demoStep === 0 ? <RenderContent text="Сила $F = m \\cdot a$" /> : demoStep === 1 ? <RenderContent text="$\\sqrt{144} + 2^3$" /> : <RenderContent text="Процес: [фотосинтеза]" />}
           </div>
           <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold italic text-xl shadow-inner">
              Пример за СТЕМ приказ
           </div>
        </div>
      </div>
    </main>
  </div>
);

export default LandingPage;
