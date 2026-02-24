import React, { useState } from 'react';
import { Trash2, Save, AlertCircle, Shuffle, CheckCircle2, CheckSquare, Plus, ArrowRight, MoveVertical, Check, X, Sparkles, Flame, Globe, ChevronUp, ChevronDown, Sigma, Layout } from 'lucide-react';
import RenderContent from './RenderContent';

const STEMHelper = ({ onInsert }) => (
  <div className="flex flex-wrap gap-4 p-4 bg-white rounded-[2rem] border-4 border-indigo-100 w-fit shadow-2xl shadow-indigo-100/50 ring-12 ring-indigo-50/30">
    {[
      { label: '√', cmd: '$\\sqrt{}$' },
      { label: 'x²', cmd: '$^2$' },
      { label: 'xₙ', cmd: '$_n$' },
      { label: '½', cmd: '$\\frac{}{}$' },
      { label: 'π', cmd: '$\\pi$' },
      { label: '·', cmd: '$\\cdot$' },
      { label: '±', cmd: '$\\pm$' },
      { label: '∞', cmd: '$\\infty$' },
      { label: '≤', cmd: '$\\le$' },
      { label: '≥', cmd: '$\\ge$' }
    ].map(tool => (
      <button 
        key={tool.label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => { e.preventDefault(); onInsert(tool.cmd); }}
        className="w-14 h-14 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xl font-black hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all active:scale-90 shadow-sm hover:shadow-lg hover:shadow-indigo-200 flex items-center justify-center"
      >
        {tool.label}
      </button>
    ))}
    <div className="w-px bg-slate-200 mx-2" />
    <div className="flex items-center gap-3 text-xs font-black text-indigo-400 uppercase px-4 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100/50"><Sigma size={20} className="text-indigo-600" /> STEM TOOLBAR</div>
  </div>
);

const Question = ({ 
  q, idx, view, testInfo, questions, setQuestions, 
  saveToBank, showHelp, setShowHelp, helpContent, 
  randomizeAnswers, duplicates, moveQuestion 
}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  let displayNum = (idx + 1).toString();
  if (testInfo.subNumbering && q.subNum) displayNum = q.subNum;
  const isDuplicate = q.text && duplicates.includes(q.text.trim().toLowerCase());

  if (q.type === 'section') {
    return (
      <div className={`relative group py-12 border-b-4 border-slate-900 mb-10 col-span-2`}>
        {view === 'editor' && (
          <div className="absolute -left-16 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition print:hidden z-20">
            <button onClick={() => setQuestions(questions.filter(qu => qu.id !== q.id))} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={16} /></button>
            <button onClick={() => moveQuestion(idx, -1)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm"><ChevronUp size={16} /></button>
            <button onClick={() => moveQuestion(idx, 1)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm"><ChevronDown size={16} /></button>
            <button 
              onClick={() => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, sectionLayout: qu.sectionLayout === 'double' ? 'single' : 'double'} : qu))} 
              className={`p-2.5 rounded-xl transition shadow-sm ${q.sectionLayout === 'double' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white'}`} 
              title="Распоред на секција"
            >
              <Layout size={16} />
            </button>
          </div>
        )}
        {view === 'editor' ? (
          <input 
            value={q.text} 
            onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, text: e.target.value.toUpperCase()} : qu))}
            className="w-full text-4xl font-black uppercase tracking-[0.2em] bg-slate-50 p-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 transition"
          />
        ) : (
          <h2 className="text-4xl font-black uppercase tracking-[0.3em] text-slate-900">{q.text}</h2>
        )}
      </div>
    );
  }

  return (
    <div key={q.id} className={`relative group p-4 rounded-3xl transition-all ${isDuplicate ? 'bg-red-50/50 ring-2 ring-red-100 mb-10' : ''}`}>
      {view === 'editor' && isDuplicate && (
        <div className="absolute -top-4 right-0 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-2 shadow-lg animate-bounce">
          <AlertCircle size={12} /> Постои дупликат задача!
        </div>
      )}
      {view === 'editor' && (
        <div className="absolute -left-16 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition print:hidden z-20">
          <button onClick={() => setQuestions(questions.filter(qu => qu.id !== q.id))} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={16} /></button>
          <button onClick={() => moveQuestion(idx, -1)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm"><ChevronUp size={16} /></button>
          <button onClick={() => moveQuestion(idx, 1)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm"><ChevronDown size={16} /></button>
          <button onClick={() => saveToBank(q)} className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition shadow-sm" title="Зачувај"><Save size={16} /></button>
          <button onClick={() => setShowHelp(showHelp === q.id ? null : q.id)} className={`p-2.5 rounded-xl transition shadow-sm ${showHelp === q.id ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white'}`} title="Помош"><AlertCircle size={16} /></button>
          <button 
            onClick={() => {
              const diffs = ['easy', 'medium', 'hard'];
              const next = diffs[(diffs.indexOf(q.difficulty || 'medium') + 1) % 3];
              setQuestions(questions.map(qu => qu.id === q.id ? {...qu, difficulty: next} : qu));
            }} 
            className={`p-2.5 rounded-xl transition shadow-sm ${
              q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 
              q.difficulty === 'hard' ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white' : 
              'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white'
            }`} 
            title="Тежина"
          >
            <Flame size={16} fill={q.difficulty === 'hard' ? 'currentColor' : 'none'} />
          </button>
          {testInfo.layout === 'double' && (
            <button onClick={() => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, fullWidth: !qu.fullWidth} : qu))} className={`p-2.5 rounded-xl transition shadow-sm ${q.fullWidth ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white'}`} title="Цела ширина"><MoveVertical size={16} className="rotate-90" /></button>
          )}
          {(q.type === 'multiple' || q.type === 'checklist') && (
            <>
              <button onClick={() => randomizeAnswers(q.id)} className="p-2.5 bg-indigo-50 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition shadow-sm" title="Измешај одговори"><Shuffle size={16} /></button>
              <button onClick={() => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, columns: qu.columns === 2 ? 1 : 2} : qu))} className={`p-2.5 rounded-xl transition shadow-sm ${q.columns === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white'}`} title="Колони (1 или 2)"><Layout size={16} /></button>
            </>
          )}
          <div className="bg-white p-2 rounded-xl border flex flex-col items-center shadow-sm">
            <span className="text-[8px] font-black text-slate-400 uppercase">Бод</span>
            <input type="number" value={q.points} onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, points: e.target.value} : qu))} className="w-8 text-xs font-black text-center outline-none bg-slate-50 rounded" />
          </div>
        </div>
      )}
      {view === 'editor' && showHelp === q.id && (
        <div className="absolute left-0 -top-40 w-full bg-white border border-amber-200 p-6 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-300 z-50 ring-4 ring-amber-50">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">Помош за наставникот</h4>
                <button onClick={() => setShowHelp(null)} className="text-slate-300 hover:text-slate-900 transition"><X size={18} /></button>
              </div>
              {helpContent[q.type] ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">{helpContent[q.type].desc}</p>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-indigo-500 block mb-1">Кога да се користи:</span>
                      <p className="text-[11px] font-medium text-slate-600">{helpContent[q.type].use}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-black uppercase text-emerald-600 block mb-1">Пример:</span>
                      <p className="text-[11px] font-bold text-emerald-800 italic">"{helpContent[q.type].example}"</p>
                    </div>
                    <div className="flex gap-2 items-center text-amber-600">
                      <Sparkles size={12} />
                      <p className="text-[10px] font-black uppercase tracking-tight">Совет: {helpContent[q.type].tip}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400 italic">Нема достапни детални информации за овој формат.</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="flex gap-6 mb-6 items-start font-sans">
        <div className="flex flex-col items-center gap-1">
          {view === 'editor' && testInfo.subNumbering ? (
            <input 
              value={q.subNum || (idx + 1)} 
              onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, subNum: e.target.value} : qu))}
              className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-xs font-black text-center outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg"
            />
          ) : (
            <span className="bg-slate-900 text-white w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg">{displayNum}</span>
          )}
          {view !== 'editor' && q.difficulty && (
            <div className={`mt-2 flex gap-0.5 ${
              q.difficulty === 'easy' ? 'text-emerald-400' : 
              q.difficulty === 'hard' ? 'text-red-400' : 'text-amber-400'
            }`}>
              <Flame size={10} fill="currentColor" />
              {q.difficulty !== 'easy' && <Flame size={10} fill="currentColor" />}
              {q.difficulty === 'hard' && <Flame size={10} fill="currentColor" />}
            </div>
          )}
          {view === 'editor' && testInfo.subNumbering && <span className="text-[8px] font-black uppercase text-slate-400">Број</span>}
        </div>
        <div className="flex-1 relative">
          {view !== 'editor' && q.qrLink && (
            <div className="absolute -top-12 right-0 p-1.5 bg-white border-2 border-slate-900 rounded-xl shadow-sm z-10 flex flex-col items-center">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(q.qrLink)}`} 
                alt="QR Code" 
                className="w-12 h-12"
              />
              <p className="text-[6px] font-black uppercase mt-1 text-slate-900">Ресурс</p>
            </div>
          )}
          {view === 'editor' ? (
            <div className="space-y-4">
              <div className="relative h-2">
                {focusedInput === 'text' && (
                  <div className="absolute -top-20 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <STEMHelper onInsert={(cmd) => {
                      const newText = q.text + cmd;
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, text: newText} : qu));
                    }} />
                  </div>
                )}
              </div>
              <textarea 
                onFocus={() => setFocusedInput('text')}
                onBlur={() => setFocusedInput(null)}
                rows="2" value={q.text} onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, text: e.target.value} : qu))} className={`w-full font-bold text-lg bg-slate-50/30 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-100 transition resize-none leading-relaxed ${testInfo.alignment === 'justify' ? 'text-justify' : ''}`} placeholder={q.type === 'selection' ? "Внесете текст со избори во формат: Ова е {точен|погрешен} пример." : "Внесете задача..."} />
              <div className="bg-white border border-slate-100 p-4 rounded-2xl text-sm font-bold text-slate-800 shadow-inner">
                <span className="text-[9px] font-black uppercase text-indigo-400 block mb-2 tracking-widest">Преглед во реално време:</span>
                <RenderContent text={q.text} view="preview" />
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="bg-slate-50 p-2 rounded-xl text-slate-400"><Globe size={14} /></div>
                <input 
                  placeholder="Линк до ресурс (видео, текст...) за QR код..." 
                  value={q.qrLink || ''} 
                  onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, qrLink: e.target.value} : qu))}
                  className="flex-1 bg-transparent text-xs font-bold outline-none text-slate-600"
                />
              </div>
              {q.type === 'selection' && (
                <div className="flex gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <AlertCircle size={14} className="text-indigo-400 mt-0.5" />
                  <p className="text-[10px] font-medium text-indigo-600 leading-normal">Користете <code className="bg-white px-1 rounded border border-indigo-200">{"{опција1|опција2}"}</code> за да креирате паѓачко мени во текстот. Првата опција е секогаш точната.</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-lg font-bold text-slate-800 leading-relaxed pr-10 ${testInfo.alignment === 'justify' ? 'text-justify' : ''}`}>
              <RenderContent text={q.text} view={view} />
            </div>
          )}
        </div>
      </div>
      <div className="ml-16 font-sans">
        {(q.type === 'multiple' || q.type === 'checklist') && (
          <div className={`grid gap-8 ${q.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'} w-full`}>
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className={`flex flex-col gap-4 rounded-[2rem] border-2 transition p-6 min-h-[140px] shadow-sm ${view === 'answerKey' && (q.type === 'multiple' ? q.correct === oIdx : (q.corrects || []).includes(oIdx)) ? 'bg-emerald-50 border-emerald-400 shadow-emerald-100' : 'border-slate-100 bg-white hover:border-indigo-100 hover:shadow-indigo-50'}`}>
                <div className="flex items-start gap-6">
                  <div 
                    onClick={() => {
                      if (view !== 'editor') return;
                      if (q.type === 'multiple') {
                        setQuestions(questions.map(qu => qu.id === q.id ? {...qu, correct: oIdx} : qu));
                      } else {
                        const cur = q.corrects || [];
                        const next = cur.includes(oIdx) ? cur.filter(c => c !== oIdx) : [...cur, oIdx];
                        setQuestions(questions.map(qu => qu.id === q.id ? {...qu, corrects: next} : qu));
                      }
                    }}
                    className={`w-14 h-14 flex-shrink-0 cursor-pointer ${testInfo.zipGrade ? 'rounded-2xl rotate-45' : (q.type === 'checklist' ? 'rounded-2xl' : 'rounded-full')} border-4 flex items-center justify-center text-lg font-black transition-all duration-300 ${view === 'answerKey' && (q.type === 'multiple' ? q.correct === oIdx : (q.corrects || []).includes(oIdx)) ? 'bg-emerald-500 border-emerald-500 text-white rotate-0' : (view === 'editor' && (q.type === 'multiple' ? q.correct === oIdx : (q.corrects || []).includes(oIdx)) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-400 bg-white hover:border-indigo-300')}`}
                  >
                    <span className={testInfo.zipGrade ? '-rotate-45' : ''}>{String.fromCharCode(65 + oIdx)}</span>
                  </div>
                  
                  {view === 'editor' ? (
                    <div className="flex-1 relative pt-2">
                      {focusedInput === `option-${oIdx}` && (
                        <div className="absolute -top-32 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
                          <STEMHelper onInsert={(cmd) => {
                            const n = [...q.options]; n[oIdx] = (n[oIdx] || '') + cmd; 
                            setQuestions(questions.map(qu => qu.id === q.id ? {...qu, options: n} : qu));
                          }} />
                        </div>
                      )}
                      <input 
                        onFocus={() => setFocusedInput(`option-${oIdx}`)}
                        onBlur={() => setFocusedInput(null)}
                        value={opt} onChange={e => {
                        const n = [...q.options]; n[oIdx] = e.target.value; setQuestions(questions.map(qu => qu.id === q.id ? {...qu, options: n} : qu));
                      }} className="w-full bg-transparent border-b-2 border-slate-100 focus:border-indigo-400 outline-none text-xl font-black h-12 transition-colors" placeholder={`Опција ${String.fromCharCode(65 + oIdx)}...`} />
                    </div>
                  ) : (
                    <div className="flex-1 pt-2">
                      <RenderContent text={opt} view={view} className="text-xl font-black text-slate-800 leading-tight" />
                    </div>
                  )}

                  {view === 'editor' && q.options.length > 2 && (
                    <button onClick={() => {
                      const n = q.options.filter((_, i) => i !== oIdx);
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, options: n} : qu));
                    }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><X size={20} /></button>
                  )}
                </div>
                {view === 'editor' && opt && (
                  <div className="mt-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50 shadow-inner">
                    <span className="text-[9px] font-black uppercase text-indigo-400 block mb-2 tracking-widest">СТЕМ Преглед:</span>
                    <RenderContent text={opt} view="preview" className="text-sm font-bold text-indigo-900" />
                  </div>
                )}
              </div>
            ))}
            {view === 'editor' && (
              <button onClick={() => {
                const n = [...q.options, ''];
                setQuestions(questions.map(qu => qu.id === q.id ? {...qu, options: n} : qu));
              }} className="col-span-full py-6 border-4 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 hover:border-indigo-200 hover:text-indigo-400 transition-all font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 bg-slate-50/30"><Plus size={20} /> Додај нова опција</button>
            )}
          </div>
        )}
        {q.type === 'true-false' && (
          <div className={`flex ${q.layout === 'vertical' ? 'flex-col w-40' : 'flex-row w-full'} gap-4`}>
            {['Точно', 'Неточно'].map((opt, oIdx) => (
              <div key={oIdx} className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border-2 transition ${view === 'answerKey' && q.correct === oIdx ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'border-slate-50 bg-slate-50/20'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${view === 'answerKey' && q.correct === oIdx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-800 text-slate-800 bg-white'}`}>
                  {oIdx === 0 ? 'Т' : 'Н'}
                </div>
                <span className="text-sm font-bold text-slate-700">{opt}</span>
                {view === 'editor' && (
                  <button onClick={() => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, correct: oIdx} : qu))} className={`p-1 ml-auto transition ${q.correct === oIdx ? 'text-emerald-500' : 'text-slate-200'}`}>
                    <CheckCircle2 size={18} />
                  </button>
                )}
              </div>
            ))}
            {view === 'editor' && (
              <button onClick={() => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, layout: q.layout === 'vertical' ? 'horizontal' : 'vertical'} : qu))} className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition" title="Промени распоред">
                <MoveVertical size={16} className={q.layout === 'vertical' ? 'rotate-90' : ''} />
              </button>
            )}
          </div>
        )}
        {q.type === 'multi-match' && (
          <div className="space-y-4">
            {view === 'editor' ? (
              <div className="space-y-3">
                {(q.matches || [{s:'', a:''}]).map((m, mIdx) => (
                  <div key={mIdx} className="space-y-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 flex flex-col relative">
                         {focusedInput === `match-s-${mIdx}` && (
                           <div className="absolute -top-24 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
                             <STEMHelper onInsert={(cmd) => {
                               const nm = [...(q.matches || [])]; nm[mIdx].s = (nm[mIdx].s || '') + cmd;
                               setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                             }} />
                           </div>
                         )}
                         <input 
                            onFocus={() => setFocusedInput(`match-s-${mIdx}`)}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="Изјава..." value={m.s} onChange={e => {
                           const nm = [...(q.matches || [])]; nm[mIdx].s = e.target.value;
                           setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                         }} className="w-full bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold" />
                      </div>
                      <ArrowRight size={16} className="text-slate-300" />
                      <div className="w-40 flex flex-col relative">
                         {focusedInput === `match-a-${mIdx}` && (
                           <div className="absolute -top-24 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
                             <STEMHelper onInsert={(cmd) => {
                               const nm = [...(q.matches || [])]; nm[mIdx].a = (nm[mIdx].a || '') + cmd;
                               setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                             }} />
                           </div>
                         )}
                         <input 
                            onFocus={() => setFocusedInput(`match-a-${mIdx}`)}
                            onBlur={() => setFocusedInput(null)}
                            placeholder="Одговор..." value={m.a} onChange={e => {
                           const nm = [...(q.matches || [])]; nm[mIdx].a = e.target.value;
                           setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                         }} className="w-full bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-bold text-indigo-600" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => {
                  const nm = [...(q.matches || [{s:'', a:''}]), {s:'', a:''}];
                  setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                }} className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} /> Додај ред</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-6">
                  {(q.matches || []).map((m, mIdx) => (
                    <div key={mIdx} className="flex gap-4 items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-black text-slate-400">{mIdx + 1}.</span>
                      <RenderContent text={m.s} view={view} className="text-base font-bold" />
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {(q.matches || []).map((m, mIdx) => (
                    <div key={mIdx} className="flex gap-4 items-center border-b border-slate-100 pb-2">
                      <span className="w-8 h-8 rounded-lg border-2 border-slate-800 flex items-center justify-center text-xs font-black">{String.fromCharCode(65 + mIdx)}</span>
                      {view === 'answerKey' ? <span className="text-base font-black text-emerald-600 underline">{m.a}</span> : <div className="h-6 w-32 border-b-2 border-slate-200" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {q.type === 'table' && (
          <div className="space-y-4">
            {view === 'editor' && (
              <div className="flex gap-4 mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase text-slate-400">Редови</span>
                  <input type="number" min="1" max="10" value={q.tableData?.rows || 3} onChange={e => {
                    const rows = parseInt(e.target.value);
                    const data = q.tableData?.data || {};
                    setQuestions(questions.map(qu => qu.id === q.id ? {...qu, tableData: {...qu.tableData, rows, data}} : qu));
                  }} className="w-12 p-2 rounded-lg border text-xs font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase text-slate-400">Колони</span>
                  <input type="number" min="1" max="6" value={q.tableData?.cols || 3} onChange={e => {
                    const cols = parseInt(e.target.value);
                    const data = q.tableData?.data || {};
                    setQuestions(questions.map(qu => qu.id === q.id ? {...qu, tableData: {...qu.tableData, cols, data}} : qu));
                  }} className="w-12 p-2 rounded-lg border text-xs font-bold" />
                </div>
                <div className="flex-1 flex items-center justify-end text-[10px] font-bold text-slate-400 italic">Кликни на келија за да ја означиш како одговор</div>
              </div>
            )}
            <div className="overflow-x-auto rounded-xl border-2 border-slate-900 shadow-[4px_4px_0_0_#0f172a]">
              <table className="w-full border-collapse">
                <tbody>
                  {[...Array(q.tableData?.rows || 3)].map((_, r) => (
                    <tr key={r}>
                      {[...Array(q.tableData?.cols || 3)].map((_, c) => {
                        const cellId = `${r}-${c}`;
                        const cell = q.tableData?.data?.[cellId] || { val: '', isAns: false };
                        return (
                          <td key={c} className="border border-slate-200 p-0 min-w-[120px]">
                            {view === 'editor' ? (
                              <div className={`relative group/cell ${cell.isAns ? 'bg-emerald-50' : 'bg-white'}`}>
                                {focusedInput === `table-${cellId}` && (
                                  <div className="absolute -top-24 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 whitespace-nowrap">
                                    <STEMHelper onInsert={(cmd) => {
                                      const data = {...(q.tableData?.data || {})};
                                      data[cellId] = {...cell, val: (cell.val || '') + cmd};
                                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, tableData: {...qu.tableData, data}} : qu));
                                    }} />
                                  </div>
                                )}
                                <input 
                                  onFocus={() => setFocusedInput(`table-${cellId}`)}
                                  onBlur={() => setFocusedInput(null)}
                                  value={cell.val} onChange={e => {
                                  const data = {...(q.tableData?.data || {})};
                                  data[cellId] = {...cell, val: e.target.value};
                                  setQuestions(questions.map(qu => qu.id === q.id ? {...qu, tableData: {...qu.tableData, data}} : qu));
                                }} className="w-full p-4 text-sm font-bold bg-transparent outline-none focus:bg-indigo-50/30" />
                                <button onClick={() => {
                                  const data = {...(q.tableData?.data || {})};
                                  data[cellId] = {...cell, isAns: !cell.isAns};
                                  setQuestions(questions.map(qu => qu.id === q.id ? {...qu, tableData: {...qu.tableData, data}} : qu));
                                }} className={`absolute top-1 right-1 p-1 rounded transition ${cell.isAns ? 'text-emerald-500' : 'text-slate-200 group-hover/cell:text-slate-400'}`}>
                                  <Check size={12} strokeWidth={3} />
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 min-h-[50px] flex items-center justify-center text-sm font-bold">
                                {cell.isAns ? (
                                  view === 'answerKey' ? <span className="text-emerald-600 underline">{cell.val}</span> : <div className="border-b-2 border-slate-900 w-full h-4 mx-2" />
                                ) : <RenderContent text={cell.val} view={view} />}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(q.type === 'list' || q.type === 'ordering') && (
          <div className="space-y-4">
            {(q.items || []).map((item, iIdx) => (
              <div key={iIdx} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black">{q.type === 'ordering' ? '____' : '•'}</span>
                {view === 'editor' ? (
                  <input 
                    value={item} 
                    onChange={e => {
                      const ni = [...q.items]; ni[iIdx] = e.target.value;
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, items: ni} : qu));
                    }}
                    className="flex-1 bg-transparent border-b-2 border-slate-100 focus:border-indigo-400 outline-none font-bold"
                    placeholder="Внесете ставка..."
                  />
                ) : (
                  <div className="flex-1">
                    <RenderContent text={item} view={view} className="font-bold" />
                  </div>
                )}
                {view === 'editor' && q.items.length > 1 && (
                  <button onClick={() => {
                    const ni = q.items.filter((_, i) => i !== iIdx);
                    setQuestions(questions.map(qu => qu.id === q.id ? {...qu, items: ni} : qu));
                  }} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                )}
              </div>
            ))}
            {view === 'editor' && (
              <button onClick={() => {
                const ni = [...(q.items || []), ''];
                setQuestions(questions.map(qu => qu.id === q.id ? {...qu, items: ni} : qu));
              }} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Plus size={12} /> Додај ставка</button>
            )}
          </div>
        )}

        {q.type === 'statements' && (
          <div className="space-y-4">
            {(q.items || []).map((item, iIdx) => (
              <div key={iIdx} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100">
                <div className="flex-1">
                  {view === 'editor' ? (
                    <input value={item.s} onChange={e => {
                      const ni = [...q.items]; ni[iIdx].s = e.target.value;
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, items: ni} : qu));
                    }} className="w-full bg-transparent outline-none font-bold" placeholder="Изјава..." />
                  ) : <RenderContent text={item.s} view={view} className="font-bold" />}
                </div>
                <div className="flex gap-2">
                  {['Т', 'Н'].map((lbl, lIdx) => (
                    <button 
                      key={lbl}
                      onClick={() => view === 'editor' && setQuestions(questions.map(qu => qu.id === q.id ? {...qu, items: q.items.map((it, idx) => idx === iIdx ? {...it, correct: lIdx} : it)} : qu))}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-black ${ (view === 'answerKey' || view === 'editor') && item.correct === lIdx ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 text-slate-300'}`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {view === 'editor' && (
              <button onClick={() => {
                const ni = [...(q.items || []), {s: '', correct: 0}];
                setQuestions(questions.map(qu => qu.id === q.id ? {...qu, items: ni} : qu));
              }} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Plus size={12} /> Додај изјава</button>
            )}
          </div>
        )}

        {q.type === 'multi-part' && (
          <div className="space-y-6">
            {(q.parts || []).map((part, pIdx) => (
              <div key={pIdx} className="space-y-2">
                <div className="flex gap-4">
                  <span className="font-black text-indigo-600">{String.fromCharCode(97 + pIdx)})</span>
                  {view === 'editor' ? (
                    <input value={part} onChange={e => {
                      const np = [...q.parts]; np[pIdx] = e.target.value;
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, parts: np} : qu));
                    }} className="flex-1 bg-transparent border-b-2 border-slate-100 focus:border-indigo-400 outline-none font-bold" placeholder="Под-задача..." />
                  ) : <RenderContent text={part} view={view} className="font-bold" />}
                </div>
                <div className="ml-10 border-b-2 border-slate-100 border-dotted h-10 w-full" />
              </div>
            ))}
            {view === 'editor' && (
              <button onClick={() => {
                const np = [...(q.parts || []), ''];
                setQuestions(questions.map(qu => qu.id === q.id ? {...qu, parts: np} : qu));
              }} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Plus size={12} /> Додај дел</button>
            )}
          </div>
        )}

        {q.type === 'diagram' && (
          <div className="space-y-4">
            {view === 'editor' ? (
              <input placeholder="Линк до слика на дијаграм..." value={q.imageUrl || ''} onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, imageUrl: e.target.value} : qu))} className="w-full bg-slate-50 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-100 font-bold" />
            ) : null}
            {q.imageUrl && (
              <div className="relative border-4 border-slate-900 rounded-[2rem] overflow-hidden bg-slate-100">
                <img src={q.imageUrl} alt="Diagram" className="w-full h-auto" />
              </div>
            )}
            <div className="space-y-4 mt-6">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className="flex items-center gap-4">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                    <div className="border-b-2 border-slate-200 flex-1 h-6" />
                 </div>
               ))}
            </div>
          </div>
        )}

        {q.type === 'matching' && (
          <div className="grid grid-cols-2 gap-10">
            {view === 'editor' ? (
              <div className="col-span-2 space-y-3">
                {(q.matches || []).map((m, mIdx) => (
                  <div key={mIdx} className="flex gap-4 items-center">
                    <input placeholder="Лева страна..." value={m.s} onChange={e => {
                      const nm = [...q.matches]; nm[mIdx].s = e.target.value;
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                    }} className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold" />
                    <ArrowRight size={16} className="text-slate-300" />
                    <input placeholder="Десна страна..." value={m.a} onChange={e => {
                      const nm = [...q.matches]; nm[mIdx].a = e.target.value;
                      setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                    }} className="flex-1 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-bold text-indigo-600" />
                  </div>
                ))}
                <button onClick={() => {
                  const nm = [...(q.matches || []), {s: '', a: ''}];
                  setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                }} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Plus size={12} /> Додај пар</button>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {(q.matches || []).map((m, mIdx) => (
                    <div key={mIdx} className="flex gap-4 items-center">
                      <span className="text-xs font-black text-slate-400">{mIdx + 1}.</span>
                      <RenderContent text={m.s} view={view} className="text-base font-bold" />
                    </div>
                  ))}
                </div>
                <div className="space-y-6">
                  {(q.matches || []).map((m, mIdx) => (
                    <div key={mIdx} className="flex gap-4 items-center">
                      <span className="w-8 h-8 rounded-lg border-2 border-slate-800 flex items-center justify-center text-xs font-black">{String.fromCharCode(65 + mIdx)}</span>
                      {view === 'answerKey' ? <span className="text-base font-black text-emerald-600 underline">{m.a}</span> : <div className="h-6 w-32 border-b-2 border-slate-200" />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {(q.type === 'essay' || q.type === 'short-answer') && (
          <div className="space-y-6 mt-8">
            {[...Array(q.type === 'essay' ? 10 : 3)].map((_, i) => (
              <div key={i} className="border-b-2 border-slate-100 border-dotted w-full h-10" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Question;
