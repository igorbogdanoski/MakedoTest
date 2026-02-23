import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, query, addDoc, deleteDoc } from 'firebase/firestore';
import { 
  Plus, Trash2, Printer, Eye, Settings, Layout, Type, CheckSquare, Split, 
  ListOrdered, HelpCircle, Minus, List as ListIcon, Square, Table as TableIcon, 
  Grid3X3, Layers, CircleDot, CheckCircle2, Image as ImageIcon, FileText, 
  KeyRound, School, Shuffle, Columns, Info, Beaker, Sigma, MoveVertical,
  ChevronDown, BookOpen, Languages, Globe, History, Zap, Sparkles, ArrowRight,
  Cloud, Share2, Search, ExternalLink, X, Play, MousePointer2, AlignJustify, 
  Copy, AlertCircle, Check, Hash, RotateCcw, Target, Library, Save, HelpCircle as HelpIcon
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDCLqjU3Stllbj4Ny3oDaM0NAQx3_UmiPY",
  authDomain: "makedotest-b3b7f.firebaseapp.com",
  projectId: "makedotest-b3b7f",
  storageBucket: "makedotest-b3b7f.firebasestorage.app",
  messagingSenderId: "175945188992",
  appId: "1:175945188992:web:6efe266baa367df9710865"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'makedo-test-v6-ultimate';

// --- Компонента за прецизно СТЕМ рендерирање ---
const RenderContent = ({ text, view, className = "" }) => {
  if (!text) return null;
  
  const parts = text.split(/(\$.*?\$|\{.*?\}|\[.*?\])/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (!part) return null;

        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1)
            .replace(/\\sqrt\{(.+?)\}/g, '√$1')
            .replace(/\\sqrt/g, '√')
            .replace(/\^\{(.+?)\}/g, '<sup>$1</sup>')
            .replace(/\^(\d+)/g, '<sup>$1</sup>')
            .replace(/_\{(.+?)\}/g, '<sub>$1</sub>')
            .replace(/_(\d+)/g, '<sub>$1</sub>')
            .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '($1/$2)')
            .replace(/\\cdot/g, '·')
            .replace(/\\approx/g, '≈')
            .replace(/\\pi/g, 'π')
            .replace(/\\pm/g, '±');

          return (
            <span 
              key={`math-${i}`} 
              className="font-serif italic text-indigo-700 bg-indigo-50/50 px-1 rounded mx-0.5 border-b border-indigo-200 inline-block leading-none"
              dangerouslySetInnerHTML={{ __html: formula }}
            />
          );
        }

        if (part.startsWith('{') && part.endsWith('}')) {
          const content = part.slice(1, -1);
          const options = content.split('|');
          if (view === 'answerKey') {
            return <span key={`sel-${i}`} className="mx-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-black border border-emerald-300 underline shadow-sm">{options[0]}</span>;
          }
          return <span key={`sel-${i}`} className="mx-1 px-3 py-1 rounded-xl border-2 border-slate-200 bg-slate-50 italic text-slate-400 text-sm font-medium">избери одговор</span>;
        }

        if (part.startsWith('[') && part.endsWith(']')) {
          const answer = part.slice(1, -1);
          if (view === 'answerKey') {
            return <span key={`blank-${i}`} className="mx-1 font-bold text-indigo-600 underline decoration-indigo-400 decoration-2">{answer}</span>;
          }
          return <span key={`blank-${i}`} className="inline-block border-b-2 border-slate-900 min-w-[120px] mx-1 h-1 shadow-sm"></span>;
        }

        return <span key={`txt-${i}`}>{part}</span>;
      })}
    </span>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [sharedTests, setSharedTests] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [duplicateAlert, setDuplicateAlert] = useState(null);

  const [testInfo, setTestInfo] = useState({
    schoolType: "ООУ", school: "„Македонија“", subject: "Природни Науки",
    teacher: "Наставник", title: "Тест за знаење", date: new Date().toLocaleDateString('mk-MK'),
    grade: "VII", alignment: "left", zipGrade: false, watermark: "", subNumbering: false,
  });

  const [questions, setQuestions] = useState([
    {
      id: 1, type: 'multiple', text: 'Пресметај ја плоштината на круг со радиус $r = 5cm$ ако $\\pi \\approx 3.14$?',
      options: ['$78.5cm^2$', '$31.4cm^2$', '$25cm^2$'], correct: 0, columns: 3, points: 5, subNum: ""
    }
  ]);

  const totalPoints = useMemo(() => questions.reduce((acc, q) => acc + Number(q.points || 0), 0), [questions]);

  const questionTypes = [
    { id: 'multiple', label: 'Понудени одговори', icon: <CheckSquare size={16} />, cat: 'базични' },
    { id: 'true-false', label: 'Точно/Неточно', icon: <HelpCircle size={16} />, cat: 'базични' },
    { id: 'fill-blanks', label: 'Пополни празнини', icon: <Minus size={16} />, cat: 'текстуални' },
    { id: 'selection', label: 'Селекција (Инлајн)', icon: <CircleDot size={16} />, cat: 'напредни' },
    { id: 'multi-match', label: 'Мулти-поврзување', icon: <Grid3X3 size={16} />, cat: 'логички' },
    { id: 'short-answer', label: 'Краток одговор', icon: <Type size={16} />, cat: 'текстуални' },
    { id: 'essay', label: 'Есеј / Долг одговор', icon: <FileText size={16} />, cat: 'текстуални' },
    { id: 'matching', label: 'Поврзување', icon: <Split size={16} />, cat: 'логички' },
    { id: 'ordering', label: 'Подредување', icon: <ListOrdered size={16} />, cat: 'логички' },
    { id: 'list', label: 'Листа (набројување)', icon: <ListIcon size={16} />, cat: 'листа' },
    { id: 'table', label: 'Табела', icon: <TableIcon size={16} />, cat: 'напредни' },
    { id: 'multi-part', label: 'Мулти-дел (а, б, в)', icon: <Layers size={16} />, cat: 'напредни' },
    { id: 'diagram', label: 'Дијаграм / Цртеж', icon: <ImageIcon size={16} />, cat: 'напредни' },
    { id: 'statements', label: 'Изјави (Т/Н листа)', icon: <CheckCircle2 size={16} />, cat: 'базични' },
  ];

  const tutorialSteps = [
    { title: "Добредојдовте!", text: "Ова е МакедоТест Про v6.0. Ајде да ја разгледаме околината.", targetId: "main-nav" },
    { title: "Банка на Прашања", text: "Овде се чуваат Вашите омилени задачи за повторно користење.", targetId: "bank-tab" },
    { title: "Сите 16 Формати", text: "Додадете прашање со еден клик: СТЕМ табели, инлајн селекција и многу повеќе.", targetId: "toolbox-sidebar" },
    { title: "v6.0 Напредни Поставки", text: "Активирајте го ZipGrade стилот, оправданиот текст или под-нумерирањето.", targetId: "advanced-settings" },
    { title: "Вашиот Тест", text: "Ова е Вашето платно. Рендерирањето е во реално време со СТЕМ поддршка.", targetId: "test-paper" },
    { title: "Печатење", text: "Кога ќе завршите, испечатете го тестот на чист А4 формат.", targetId: "action-buttons" }
  ];

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubBank = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'question_bank'), (s) => {
      setQuestionBank(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubBank();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setDemoStep((p) => (p + 1) % 3), 4000);
    return () => clearInterval(timer);
  }, []);

  const handlePrint = () => {
    window.focus();
    window.print();
  };

  const addQuestion = (type) => {
    const baseQ = { id: Date.now(), type, text: '', points: 5, columns: 1 };
    if (type === 'multiple') { baseQ.options = ['', '', '']; baseQ.correct = 0; }
    else if (type === 'matching' || type === 'multi-match') { baseQ.matches = [{s:'', a:''}, {s:'', a:''}]; }
    else if (type === 'table') { baseQ.tableData = { rows: 3, cols: 3 }; }
    else if (type === 'selection') { baseQ.text = "Пример за {избор|погрешно}."; }
    setQuestions([...questions, baseQ]);
  };

  const saveToBank = async (q) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'question_bank'), { ...q });
    setDuplicateAlert("Додадено во банката!");
    setTimeout(() => setDuplicateAlert(null), 2000);
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans">
      <nav className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100"><Zap className="text-white" size={32} /></div>
          <span className="text-2xl font-black tracking-tighter uppercase text-slate-900">МакедоТест</span>
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

  if (view === 'landing') return <LandingPage />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 relative overflow-x-hidden">
      
      {showTutorial && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] z-[100] pointer-events-none"></div>
          <div className="fixed inset-0 z-[150] flex items-end justify-center pb-20 pointer-events-none px-4">
             <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] relative pointer-events-auto border border-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <button onClick={() => setShowTutorial(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><X size={24} /></button>
                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100"><Target size={32} /></div>
                <h2 className="text-3xl font-black mb-3 tracking-tighter text-slate-900 leading-none">{tutorialSteps[tutorialStep].title}</h2>
                <p className="text-slate-500 leading-relaxed mb-10 text-lg font-medium">{tutorialSteps[tutorialStep].text}</p>
                <div className="flex items-center justify-between">
                   <div className="flex gap-2">
                      {tutorialSteps.map((_, i) => (
                        <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === tutorialStep ? 'w-10 bg-indigo-600' : 'w-2 bg-slate-200'}`}></div>
                      ))}
                   </div>
                   <button 
                    onClick={() => tutorialStep < tutorialSteps.length - 1 ? setTutorialStep(s => s + 1) : setShowTutorial(false)} 
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition"
                   >
                     {tutorialStep < tutorialSteps.length - 1 ? 'Следно' : 'Започни'}
                   </button>
                </div>
             </div>
          </div>
        </>
      )}

      <nav id="main-nav" className={`bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-[110] shadow-sm print:hidden transition-all duration-500 ${showTutorial && tutorialStep === 0 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl bg-white' : ''}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Zap size={20} /></div>
          <span className="font-black text-lg uppercase tracking-tighter">МакедоТест</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
          {['editor', 'preview', 'answerKey'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase transition ${view === v ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
              {v === 'editor' ? 'Уреди' : v === 'preview' ? 'Тест' : 'Клуч'}
            </button>
          ))}
        </div>
        <div id="action-buttons" className={`flex items-center gap-3 transition-all duration-500 ${showTutorial && tutorialStep === 5 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl relative z-[120] bg-white rounded-3xl p-1' : ''}`}>
          <button onClick={handlePrint} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 transition active:scale-95"><Printer size={16} /> Печати</button>
          <button onClick={() => setView(view === 'editor' ? 'preview' : 'editor')} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 transition">{view === 'editor' ? <Eye size={16} /> : <Settings size={16} />} {view === 'editor' ? 'Преглед' : 'Поставки'}</button>
        </div>
      </nav>

      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        <aside id="toolbox-sidebar" className={`w-80 border-r border-slate-200 p-8 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar print:hidden transition-all duration-500 ${showTutorial && tutorialStep === 2 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl relative z-[120] bg-white' : ''}`}>
          <div className="space-y-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><Plus size={12} /> Додај задача</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {questionTypes.map(type => (
                  <button key={type.id} onClick={() => addQuestion(type.id)} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition group text-left shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">{type.icon}</div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-900">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div id="bank-tab" className={`transition-all duration-500 ${showTutorial && tutorialStep === 1 ? 'ring-4 ring-indigo-500 bg-indigo-50 p-4 rounded-3xl' : ''}`}>
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><History size={12} /> Банка ({questionBank.length})</h3>
               <div className="space-y-3">
                  {questionBank.map(bq => (
                    <div key={bq.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group cursor-pointer hover:bg-white hover:border-indigo-100 transition shadow-sm" onClick={() => setQuestions([...questions, {...bq, id: Date.now()}])}>
                       <p className="text-[10px] font-bold text-slate-500 line-clamp-2 leading-relaxed"><RenderContent text={bq.text} /></p>
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'question_bank', bq.id)); }} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"><Trash2 size={12} /></button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-12 bg-slate-50/50 flex flex-col items-center">
          <div id="advanced-settings" className={`w-full max-w-[800px] mb-8 bg-white p-6 rounded-[2rem] border border-slate-200 flex flex-wrap gap-6 items-center justify-center shadow-sm print:hidden transition-all duration-500 ${showTutorial && tutorialStep === 3 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl relative z-[120]' : ''}`}>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                <Layout size={14} className="text-slate-400" />
                <select value={testInfo.alignment} onChange={e => setTestInfo({...testInfo, alignment: e.target.value})} className="bg-transparent text-[11px] font-black uppercase outline-none cursor-pointer">
                   <option value="left">Лево порамнување</option>
                   <option value="justify">Оправдано (Justify)</option>
                </select>
             </div>
             <button onClick={() => setTestInfo({...testInfo, zipGrade: !testInfo.zipGrade})} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition ${testInfo.zipGrade ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}>
                <Hash size={14} />
                <span className="text-[11px] font-black uppercase">ZipGrade Стил</span>
             </button>
             <button onClick={() => setTestInfo({...testInfo, subNumbering: !testInfo.subNumbering})} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition ${testInfo.subNumbering ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}>
                <ListOrdered size={14} />
                <span className="text-[11px] font-black uppercase">Под-нумерирање</span>
             </button>
          </div>

          <div id="test-paper" className={`w-[210mm] min-h-[297mm] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-[20mm] relative flex flex-col transition-all duration-500 ${showTutorial && tutorialStep === 4 ? 'ring-[15px] ring-indigo-500/50 shadow-2xl relative z-[120]' : ''}`}>
             {testInfo.watermark && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-45deg] text-[120px] font-black uppercase select-none">{testInfo.watermark}</div>}
             
             <header className="relative z-10 mb-16 border-b-4 border-slate-900 pb-12">
                <div className="flex justify-between items-start mb-10">
                   <div className="space-y-1.5 flex-1 pr-10">
                      {view === 'editor' ? (
                        <>
                          <input className="block w-full text-xs font-black uppercase tracking-widest bg-slate-50 rounded px-2 py-1 outline-none border-b-2 border-transparent focus:border-indigo-500" value={`${testInfo.schoolType} ${testInfo.school}`} onChange={e => {
                            const val = e.target.value.split(' ');
                            setTestInfo({...testInfo, schoolType: val[0], school: val.slice(1).join(' ')});
                          }} />
                          <input className="block w-full text-4xl font-black tracking-tighter text-slate-900 bg-slate-50 rounded px-2 py-2 mt-2 outline-none border-b-2 border-transparent focus:border-indigo-500" value={testInfo.subject} onChange={e => setTestInfo({...testInfo, subject: e.target.value})} />
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">{testInfo.schoolType} {testInfo.school}</span>
                          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mt-4 leading-none">{testInfo.subject}</h1>
                        </>
                      )}
                   </div>
                   <div className="text-right flex flex-col items-end">
                      <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Одд.</span>
                         <input className="bg-transparent text-xl font-black w-10 text-center outline-none" value={testInfo.grade} onChange={e => setTestInfo({...testInfo, grade: e.target.value})} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 block mt-4 uppercase tracking-widest">Датум: {testInfo.date}</span>
                   </div>
                </div>
                {view !== 'answerKey' && (
                  <div className="grid grid-cols-6 gap-10 mt-16 font-sans">
                    <div className="col-span-4 border-b-2 border-slate-200 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Ученик:</div>
                    <div className="col-span-2 border-b-2 border-slate-200 pb-2 text-[10px] font-black text-slate-300 uppercase text-right">Поени: _____ / {totalPoints}</div>
                  </div>
                )}
             </header>

             <div className="relative z-10 space-y-20 flex-grow">
               {questions.map((q, idx) => {
                 let displayNum = (idx + 1).toString();
                 if (testInfo.subNumbering && q.subNum) displayNum = q.subNum;
                 return (
                 <div key={q.id} className="relative group">
                    {view === 'editor' && (
                       <div className="absolute -left-16 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition print:hidden z-20">
                          <button onClick={() => setQuestions(questions.filter(qu => qu.id !== q.id))} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={16} /></button>
                          <button onClick={() => saveToBank(q)} className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition shadow-sm" title="Зачувај"><Save size={16} /></button>
                          <div className="bg-white p-2 rounded-xl border flex flex-col items-center shadow-sm">
                             <span className="text-[8px] font-black text-slate-400 uppercase">Бод</span>
                             <input type="number" value={q.points} onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, points: e.target.value} : qu))} className="w-8 text-xs font-black text-center outline-none bg-slate-50 rounded" />
                          </div>
                       </div>
                    )}
                    <div className="flex gap-6 mb-6 items-start font-sans">
                       <span className="bg-slate-900 text-white w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 shadow-lg">{displayNum}</span>
                       <div className="flex-1">
                          {view === 'editor' ? (
                             <div className="space-y-4">
                               <textarea rows="2" value={q.text} onChange={e => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, text: e.target.value} : qu))} className={`w-full font-bold text-lg bg-slate-50/30 p-4 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-100 transition resize-none leading-relaxed ${testInfo.alignment === 'justify' ? 'text-justify' : ''}`} placeholder={q.type === 'selection' ? "Внесете текст со избори во формат: Ова е {точен|погрешен} пример." : "Внесете задача..."} />
                               {q.type === 'selection' && (
                                 <div className="flex gap-2 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                   <HelpCircle size={14} className="text-indigo-400 mt-0.5" />
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
                       {q.type === 'multiple' && (
                          <div className={`grid gap-4 grid-cols-${q.columns || 1}`}>
                             {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition ${view === 'answerKey' && q.correct === oIdx ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'border-slate-50 bg-slate-50/20'}`}>
                                   <div className={`w-8 h-8 ${testInfo.zipGrade ? 'rounded-[30%] rotate-45' : 'rounded-full'} border-2 flex items-center justify-center text-[11px] font-black ${view === 'answerKey' && q.correct === oIdx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-800 text-slate-800 bg-white shadow-sm'}`}>
                                      <span className={testInfo.zipGrade ? '-rotate-45' : ''}>{String.fromCharCode(97 + oIdx).toUpperCase()}</span>
                                   </div>
                                   {view === 'editor' ? <input value={opt} onChange={e => {
                                      const n = [...q.options]; n[oIdx] = e.target.value; setQuestions(questions.map(qu => qu.id === q.id ? {...qu, options: n} : qu));
                                   }} className="bg-transparent border-b w-full outline-none text-base font-bold" /> : <RenderContent text={opt} view={view} className="text-base font-bold text-slate-700" />}
                                   {view === 'editor' && <button onClick={() => setQuestions(questions.map(qu => qu.id === q.id ? {...qu, correct: oIdx} : qu))} className={`p-1 transition ${q.correct === oIdx ? 'text-emerald-500' : 'text-slate-200'}`}><CheckCircle2 size={18} /></button>}
                                </div>
                             ))}
                          </div>
                       )}
                       {q.type === 'multi-match' && (
                          <div className="space-y-4">
                             {view === 'editor' ? (
                               <div className="space-y-3">
                                 {(q.matches || [{s:'', a:''}]).map((m, mIdx) => (
                                   <div key={mIdx} className="flex gap-4 items-center">
                                      <input placeholder="Изјава..." value={m.s} onChange={e => {
                                        const nm = [...(q.matches || [])]; nm[mIdx].s = e.target.value;
                                        setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                                      }} className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold" />
                                      <ArrowRight size={16} className="text-slate-300" />
                                      <input placeholder="Одговор..." value={m.a} onChange={e => {
                                        const nm = [...(q.matches || [])]; nm[mIdx].a = e.target.value;
                                        setQuestions(questions.map(qu => qu.id === q.id ? {...qu, matches: nm} : qu));
                                      }} className="w-40 bg-indigo-50 p-3 rounded-xl border border-indigo-100 font-bold text-indigo-600" />
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
                                     {/* Shuffle answers for the test view */}
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
                       {(q.type === 'essay' || q.type === 'short-answer') && (
                          <div className="space-y-6 mt-8">
                             {[...Array(q.type === 'essay' ? 10 : 3)].map((_, i) => (
                                <div key={i} className="border-b-2 border-slate-100 border-dotted w-full h-10" />
                             ))}
                          </div>
                       )}
                    </div>
                 </div>
               )})}
             </div>

             <footer className="relative z-10 mt-40 pt-16 border-t-[6px] border-slate-900 flex justify-between items-end pb-8 text-slate-900 font-sans">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{testInfo.schoolType} {testInfo.school} • v6.0 Pro</p>
                <div className="text-center w-80">
                   <div className="border-b-4 border-slate-900 mb-4 h-16" />
                   <p className="text-xs font-black uppercase tracking-[0.4em] leading-none">Потпис на Наставник</p>
                </div>
             </footer>
          </div>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700;800&display=swap');
        body { font-family: 'Manrope', sans-serif; overflow-x: hidden; }

        @media print {
          @page { margin: 0; size: A4; }
          body { margin: 0 !important; padding: 0 !important; background: white !important; }
          #main-nav, aside, .print\\:hidden, #nav-tabs, #action-buttons, .fixed { display: none !important; }
          #test-canvas { 
            margin: 0 !important; padding: 0 !important; width: 100% !important; 
            position: absolute !important; left: 0 !important; top: 0 !important;
            box-shadow: none !important; transform: none !important;
            z-index: 1 !important;
          }
          #test-paper { border: none !important; border-radius: 0 !important; box-shadow: none !important; width: 100% !important; min-height: 100vh !important; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
      `}} />
    </div>
  );
};

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
