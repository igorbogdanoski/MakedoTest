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
// Note: In a real production app, these should come from environment variables
const firebaseConfig = window.__firebase_config ? JSON.parse(window.__firebase_config) : {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'makedo-test-v6-ultimate';

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
        if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else { await signInAnonymously(auth); }
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
  }, [user, appId]);

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
    else if (type === 'matching') { baseQ.pairs = [{l:'', r:''}, {l:'', r:''}]; }
    else if (type === 'table') { baseQ.tableData = { rows: 3, cols: 3 }; }
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
      {/* ... rest of your existing JSX ... */}
      <div className="max-w-7xl mx-auto px-8 pt-10">
          <h1 className="text-2xl font-black">Editor View Placeholder</h1>
          <p>This is where the editor content from index.html would go.</p>
          <button onClick={handlePrint} className="bg-indigo-600 text-white p-2 rounded">Print Test</button>
      </div>
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
