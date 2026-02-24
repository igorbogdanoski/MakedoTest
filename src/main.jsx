import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { 
  Plus, Trash2, Printer, Eye, Settings, Layout, Type, CheckSquare, Split, 
  ListOrdered, HelpCircle, Minus, List as ListIcon, Square, Table as TableIcon, 
  Grid3X3, Layers, CircleDot, CheckCircle2, Image as ImageIcon, FileText, 
  KeyRound, School, Shuffle, Columns, Info, Beaker, Sigma, MoveVertical,
  ChevronDown, BookOpen, Languages, Globe, History, Zap, Sparkles, ArrowRight, Clock, Trophy,
  Cloud, Share2, Search, ExternalLink, X, Play, MousePointer2, AlignJustify, 
  Copy, AlertCircle, Check, Hash, RotateCcw, Target, Library, Save
} from 'lucide-react';

// Import refactored components
import RenderContent from './components/RenderContent';
import LandingPage from './components/LandingPage';
import Question from './components/Question';

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

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing'); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [questionBank, setQuestionBank] = useState([]);
  const [demoStep, setDemoStep] = useState(0);
  const [duplicateAlert, setDuplicateAlert] = useState(null);
  const [showHelp, setShowHelp] = useState(null);

  const helpContent = {
    'multiple': {
      desc: 'Најчест формат за брза проверка на знаењето со еден точен одговор.',
      use: 'Идеално за дефиниции, години, имиња или математички резултати.',
      example: 'Која планета е позната како „Црвената планета“? (Марс, Венера, Јупитер)',
      tip: 'Кликнете на кругот до одговорот за да го означите како точен за „Клучот“.'
    },
    'true-false': {
      desc: 'Едноставен избор помеѓу две спротивставени тврдења.',
      use: 'За проверка на фактичка точност или препознавање на заблуди.',
      example: 'Сонцето е планета. (Точно / Неточно)',
      tip: 'Користете го копчето со стрелки во едиторот за да го смените распоредот од хоризонтален во вертикален.'
    },
    'fill-blanks': {
      desc: 'Текст каде ученикот треба сам да го допише зборот што недостасува.',
      use: 'За проверка на меморија на клучни поими во контекст на реченица.',
      example: 'Процесот во кој растенијата создаваат храна се нарекува [фотосинтеза].',
      tip: 'Зборот што го сакате како празно место ставете го во средни загради [ ].'
    },
    'selection': {
      desc: 'Инлајн верзија на повеќекратен избор директно во реченицата.',
      use: 'За граматички вежби (избор на времиња) или логички избори во текст.',
      example: 'Водата врие на {100|0|50} степени Целзиусови.',
      tip: 'Користете {точен|погрешен|погрешен}. Првиот збор е секогаш точниот одговор.'
    },
    'multi-match': {
      desc: 'Напредно поврзување каде една вредност од десно може да одговара на повеќе од лево.',
      use: 'За класификација на поими во категории.',
      example: 'Лав -> Цицач, Орел -> Птица, Делфин -> Цицач.',
      tip: 'Додајте редови и внесете го парот. Системот автоматски ќе ги измеша за ученикот.'
    },
    'table': {
      desc: 'Табеларен приказ за организирани податоци.',
      use: 'За физички/хемиски мерења, хронологија или споредби.',
      example: 'Табела со елементи и нивните атомски броеви.',
      tip: 'Кликнете на иконата со штиклирање во аголот на секоја келија за да ја претворите во поле за одговор.'
    },
    'checklist': {
      desc: 'Задача со повеќе точни одговори од понудените.',
      use: 'За комплексни прашања каде треба да се изберат сите карактеристики на некој поим.',
      example: 'Кои од следниве се цицачи? (Кит, Куче, Жаба, Човек)',
      tip: 'Можете да означите неограничен број точни одговори со кликање на квадратчињата.'
    },
    'ordering': {
      desc: 'Подредување на поими по хронолошки или логички редослед.',
      use: 'За историски настани, чекори во експеримент или фази на развој.',
      example: 'Подреди ги фазите на развој на пеперутка: (Јајце, Гасеница, Кукла, Пеперутка)',
      tip: 'Внесете ги поимите во правилен редослед, а системот ќе ги прикаже со празни места за бројки.'
    },
    'short-answer': {
      desc: 'Задачи кои бараат неколку зборови или една реченица како одговор.',
      use: 'За дефиниции или кратки објаснувања.',
      example: 'Што е фотосинтеза?',
      tip: 'Можете да додадете линии за пишување во поставките на задачата.'
    },
    'essay': {
      desc: 'За подолги одговори и критичко размислување.',
      use: 'За анализи, раскази или есеи.',
      example: 'Опиши го значењето на Илинденското востание.',
      tip: 'Прилагодете ја висината на просторот за пишување за да одговара на очекуваната должина.'
    },
    'matching': {
      desc: 'Поврзување на два поими во парови 1-на-1.',
      use: 'За термини и дефиниции, држави и главни градови.',
      example: 'Македонија - Скопје, Германија - Берлин.',
      tip: 'Системот автоматски ќе ги измеша левата и десната колона.'
    },
    'multi-part': {
      desc: 'Комплексна задача поделена на неколку под-прашања (а, б, в).',
      use: 'За математички проблеми со повеќе чекори или анализа на текст.',
      example: 'Задача 1: а) Пресметај го х; б) Нацртај го графикот.',
      tip: 'Можете да доделите посебни бодови за секој дел.'
    },
    'diagram': {
      desc: 'Визуелна задача каде се бара означување на слика.',
      use: 'За анатомија, географија (карти) или технички шеми.',
      example: 'Означи ги деловите на цветот на дадената слика.',
      tip: 'Поставете ја сликата во едиторот и користете го просторот под неа за прашања.'
    }
  };

  const [testInfo, setTestInfo] = useState({
    schoolType: "ООУ", school: "„Македонија“", subject: "Природни Науки",
    teacher: "Наставник", title: "Тест за знаење", date: new Date().toLocaleDateString('mk-MK'),
    grade: "VII", alignment: "left", zipGrade: false, watermark: "", subNumbering: false, layout: 'single',
    showScale: false
  });

  const [questions, setQuestions] = useState([
    {
      id: 1, type: 'multiple', text: 'Пресметај ја плоштината на круг со радиус $r = 5cm$ ако $\\pi \\approx 3.14$?',
      options: ['$78.5cm^2$', '$31.4cm^2$', '$25cm^2$'], correct: 0, columns: 2, points: 5, subNum: "", difficulty: 'medium'
    }
  ]);

  const totalPoints = useMemo(() => questions.reduce((acc, q) => acc + Number(q.points || 0), 0), [questions]);

  const estimatedTime = useMemo(() => {
    return questions.reduce((acc, q) => {
      let mins = 2; 
      if (q.difficulty === 'easy') mins = 1;
      if (q.difficulty === 'hard') mins = 5;
      if (['essay', 'multi-part'].includes(q.type)) mins += 5;
      if (['table', 'diagram'].includes(q.type)) mins += 2;
      return acc + mins;
    }, 0);
  }, [questions]);

  const gradingScale = useMemo(() => ({
    '5': Math.ceil(totalPoints * 0.9),
    '4': Math.ceil(totalPoints * 0.75),
    '3': Math.ceil(totalPoints * 0.6),
    '2': Math.ceil(totalPoints * 0.45)
  }), [totalPoints]);

  const duplicates = useMemo(() => {
    const texts = questions.map(q => q.text.trim().toLowerCase()).filter(t => t.length > 5);
    return texts.filter((item, index) => texts.indexOf(item) !== index);
  }, [questions]);

  const questionTypes = [
    { id: 'multiple', label: 'Понудени одговори', icon: <CheckSquare size={16} />, cat: 'базични', subjects: ['all'] },
    { id: 'true-false', label: 'Точно/Неточно', icon: <HelpCircle size={16} />, cat: 'базични', subjects: ['all'] },
    { id: 'fill-blanks', label: 'Пополни празнини', icon: <Minus size={16} />, cat: 'текстуални', subjects: ['languages', 'history'] },
    { id: 'selection', label: 'Селекција (Инлајн)', icon: <CircleDot size={16} />, cat: 'напредни', subjects: ['languages'] },
    { id: 'multi-match', label: 'Мулти-поврзување', icon: <Grid3X3 size={16} />, cat: 'логички', subjects: ['stem', 'all'] },
    { id: 'short-answer', label: 'Краток одговор', icon: <Type size={16} />, cat: 'текстуални', subjects: ['all'] },
    { id: 'essay', label: 'Есеј / Долг одговор', icon: <FileText size={16} />, cat: 'текстуални', subjects: ['languages', 'history'] },
    { id: 'matching', label: 'Поврзување', icon: <Split size={16} />, cat: 'логички', subjects: ['all'] },
    { id: 'ordering', label: 'Подредување', icon: <ListOrdered size={16} />, cat: 'логички', subjects: ['history', 'stem'] },
    { id: 'list', label: 'Листа (набројување)', icon: <ListIcon size={16} />, cat: 'листа', subjects: ['all'] },
    { id: 'table', label: 'Табела', icon: <TableIcon size={16} />, cat: 'напредни', subjects: ['stem'] },
    { id: 'multi-part', label: 'Мулти-дел (а, б, в)', icon: <Layers size={16} />, cat: 'напредни', subjects: ['stem'] },
    { id: 'section', label: 'Наслов на Секција', icon: <AlignJustify size={16} />, cat: 'напредни', subjects: ['all'] },
    { id: 'diagram', label: 'Дијаграм / Цртеж', icon: <ImageIcon size={16} />, cat: 'напредни', subjects: ['stem', 'geography'] },
    { id: 'statements', label: 'Изјави (Т/Н листа)', icon: <CheckCircle2 size={16} />, cat: 'базични', subjects: ['all'] },
    { id: 'checklist', label: 'Повеќекратен избор', icon: <CheckSquare size={16} />, cat: 'базични', subjects: ['all'] },
  ];

  const categories = [
    { id: 'all', label: 'Сите' },
    { id: 'stem', label: 'СТЕМ (Мат/Физ/Хем)' },
    { id: 'languages', label: 'Јазици (Мак/Анг)' },
    { id: 'history', label: 'Историја/Гео' }
  ];

  const [activeCategory, setActiveCategory] = useState('all');
  const [typeSearch, setTypeSearch] = useState('');

  const filteredTypes = useMemo(() => {
    let types = [...questionTypes];
    
    // 1. Search filter
    if (typeSearch) {
      types = types.filter(t => t.label.toLowerCase().includes(typeSearch.toLowerCase()));
    }

    // 2. Smart Subject-Aware Sorting
    const subj = testInfo.subject.toLowerCase();
    const isSTEM = subj.includes('мат') || subj.includes('физ') || subj.includes('хем') || subj.includes('наук');
    const isLang = subj.includes('мак') || subj.includes('анг') || subj.includes('јаз');

    types.sort((a, b) => {
      if (isSTEM) {
        if (a.subjects.includes('stem') && !b.subjects.includes('stem')) return -1;
        if (!a.subjects.includes('stem') && b.subjects.includes('stem')) return 1;
      }
      if (isLang) {
        if (a.subjects.includes('languages') && !b.subjects.includes('languages')) return -1;
        if (!a.subjects.includes('languages') && b.subjects.includes('languages')) return 1;
      }
      return 0;
    });

    // 3. Category Filter
    if (activeCategory === 'all') return types;
    return types.filter(t => t.subjects.includes(activeCategory) || t.subjects.includes('all'));
  }, [activeCategory, typeSearch, testInfo.subject]);

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
      try { await signInAnonymously(auth); } catch (err) { console.error(err); }
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
    const originalView = view;
    if (originalView === 'editor') {
      setView('preview');
      setTimeout(() => {
        window.print();
        setView(originalView);
      }, 300);
    } else {
      window.print();
    }
  };

  const addQuestion = (type) => {
    const baseQ = { id: Date.now(), type, text: '', points: 5, columns: (type === 'multiple' || type === 'checklist' ? 2 : 1), difficulty: 'medium' };
    if (type === 'multiple' || type === 'checklist') { baseQ.options = ['', '', '']; baseQ.correct = 0; baseQ.corrects = []; }
    else if (type === 'true-false') { baseQ.correct = 0; baseQ.layout = 'horizontal'; }
    else if (type === 'matching' || type === 'multi-match') { baseQ.matches = [{s:'', a:''}, {s:'', a:''}]; }
    else if (type === 'table') { baseQ.tableData = { rows: 3, cols: 3, data: {} }; }
    else if (type === 'selection') { baseQ.text = "Пример за {избор|погрешно}."; }
    else if (type === 'section') { baseQ.points = 0; baseQ.fullWidth = true; baseQ.text = "НОВА СЕКЦИЈА"; }
    setQuestions([...questions, baseQ]);
  };

  const saveToBank = async (q) => {
    if (!user) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'question_bank'), { ...q });
    setDuplicateAlert("Додадено во банката!");
    setTimeout(() => setDuplicateAlert(null), 2000);
  };

  const randomizeQuestions = () => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setDuplicateAlert("Прашањата се измешани!");
    setTimeout(() => setDuplicateAlert(null), 2000);
  };

  const randomizeAnswers = (qId) => {
    setQuestions(questions.map(q => {
      if (q.id === qId && q.options) {
        const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
        return { ...q, options: shuffledOptions };
      }
      return q;
    }));
  };

  const moveQuestion = (idx, dir) => {
    const newQs = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    [newQs[idx], newQs[target]] = [newQs[target], newQs[idx]];
    setQuestions(newQs);
  };

  if (view === 'landing') return <LandingPage setView={setView} setShowTutorial={setShowTutorial} setTutorialStep={setTutorialStep} demoStep={demoStep} />;

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

      {/* Navbar */}
      <nav id="main-nav" className={`bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-[110] shadow-sm print:hidden transition-all duration-500 ${showTutorial && tutorialStep === 0 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl bg-white' : ''}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('landing')}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg"><Zap size={20} /></div>
          <span className="font-black text-lg uppercase tracking-tighter">МакедоТест</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
          {['editor', 'preview', 'answerKey', 'answerSheet'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase transition ${view === v ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-900'}`}>
              {v === 'editor' ? 'Уреди' : v === 'preview' ? 'Тест' : v === 'answerKey' ? 'Клуч' : 'Лист'}
            </button>
          ))}
        </div>
        <div id="action-buttons" className={`flex items-center gap-3 transition-all duration-500 ${showTutorial && tutorialStep === 5 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl relative z-[120] bg-white rounded-3xl p-1' : ''}`}>
          <div className="flex bg-slate-100 p-1 rounded-2xl mr-4 print:hidden">
             <button onClick={() => {
                const qti = `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1" title="${testInfo.subject}">
  ${questions.map(q => `
  <assessmentItem identifier="${q.id}" title="${q.type}">
    <itemBody><p>${q.text}</p></itemBody>
  </assessmentItem>`).join('')}
</assessmentTest>`;
                const blob = new Blob([qti], {type: 'text/xml'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'test-qti.xml';
                a.click();
             }} className="px-4 py-2 text-[9px] font-black uppercase text-slate-500 hover:text-indigo-600 flex items-center gap-1"><Share2 size={12} /> Export QTI</button>
             <label className="px-4 py-2 text-[9px] font-black uppercase text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer">
                <Cloud size={12} /> Import QTI
                <input type="file" className="hidden" accept=".xml" onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(ev.target.result, "text/xml");
                    const items = xmlDoc.getElementsByTagName("assessmentItem");
                    const newQs = Array.from(items).map((item, i) => ({
                      id: Date.now() + i,
                      type: 'multiple',
                      text: item.getElementsByTagName("p")[0]?.textContent || "Увезена задача",
                      points: 5,
                      options: ['', '', ''],
                      correct: 0
                    }));
                    if (newQs.length > 0) setQuestions([...questions, ...newQs]);
                  };
                  reader.readAsText(file);
                }} />
             </label>
          </div>
          <button onClick={handlePrint} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-100 hover:scale-105 transition active:scale-95"><Printer size={16} /> Печати</button>
          <button onClick={() => setView(view === 'editor' ? 'preview' : 'editor')} className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase flex items-center gap-2 hover:bg-slate-50 transition">{view === 'editor' ? <Eye size={16} /> : <Settings size={16} />} {view === 'editor' ? 'Преглед' : 'Поставки'}</button>
        </div>
      </nav>

      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside id="toolbox-sidebar" className={`w-80 border-r border-slate-200 p-8 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar print:hidden transition-all duration-500 ${showTutorial && tutorialStep === 2 ? 'ring-[8px] ring-indigo-500/50 shadow-2xl relative z-[120] bg-white' : ''}`}>
          <div className="space-y-10">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={12} /> Блокови за задачи</h3>
                {testInfo.subject.length > 5 && (
                  <div className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-[8px] font-black uppercase animate-pulse">Smart: {testInfo.subject.split(' ')[0]}</div>
                )}
              </div>

              <div className="relative mb-6">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                  type="text" 
                  placeholder="Пребарај формат..." 
                  value={typeSearch}
                  onChange={e => setTypeSearch(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
                 />
              </div>

              <div className="flex flex-wrap gap-1 mb-8 bg-slate-100 p-1 rounded-xl">
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${activeCategory === cat.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {cat.label.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {filteredTypes.map(type => (
                  <button 
                    key={type.id} 
                    onClick={() => addQuestion(type.id)} 
                    className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-indigo-50/30 transition group text-center shadow-sm relative overflow-hidden"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                      {type.icon}
                    </div>
                    <span className="text-[9px] font-black text-slate-500 group-hover:text-indigo-900 leading-tight uppercase tracking-tighter">{type.label}</span>
                    {type.subjects.includes('stem') && <div className="absolute top-1 right-1 w-1 h-1 bg-indigo-400 rounded-full" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="bg-white/20 p-2 rounded-xl"><Clock size={20} /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase opacity-60">Проценето време</p>
                    <p className="text-xl font-black">{estimatedTime} мин.</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-2 opacity-60"><Trophy size={14} /><span className="text-[10px] font-black uppercase">Скала на оценки</span></div>
                 <div className="grid grid-cols-4 gap-2">
                    {[5, 4, 3, 2].map(grade => (
                      <div key={grade} className="bg-white/10 rounded-xl p-2 text-center border border-white/10">
                         <p className="text-[10px] font-black opacity-60">{grade}</p>
                         <p className="text-sm font-black">{gradingScale[grade]}</p>
                      </div>
                    ))}
                 </div>
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
             <button onClick={() => setTestInfo({...testInfo, layout: testInfo.layout === 'single' ? 'double' : 'single'})} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition ${testInfo.layout === 'double' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}>
                <Columns size={14} />
                <span className="text-[11px] font-black uppercase">{testInfo.layout === 'single' ? '2 Колони' : '1 Колона'}</span>
             </button>
             <button onClick={() => setTestInfo({...testInfo, showScale: !testInfo.showScale})} className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition ${testInfo.showScale ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white'}`}>
                <Trophy size={14} />
                <span className="text-[11px] font-black uppercase">Прикажи Скала</span>
             </button>
             <button onClick={randomizeQuestions} className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-white transition">
                <Shuffle size={14} />
                <span className="text-[11px] font-black uppercase">Измешај задачи</span>
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
                {view !== 'answerKey' && view !== 'answerSheet' && (
                  <div className="grid grid-cols-6 gap-10 mt-16 font-sans">
                    <div className="col-span-4 border-b-2 border-slate-200 pb-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Ученик:</div>
                    <div className="col-span-2 border-b-2 border-slate-200 pb-2 text-[10px] font-black text-slate-300 uppercase text-right">Поени: _____ / {totalPoints}</div>
                  </div>
                )}
             </header>

             <div className={`relative z-10 flex-grow ${testInfo.layout === 'double' && view !== 'answerSheet' ? 'grid grid-cols-2 gap-x-12 gap-y-20' : 'space-y-20'}`}>
               {view === 'answerSheet' ? (
                 <div className="grid grid-cols-2 gap-10">
                   {questions.map((q, idx) => (
                     <div key={q.id} className="flex items-center gap-4 p-4 border-b border-slate-100">
                       <span className="font-black text-slate-900 w-6">{idx + 1}.</span>
                       <div className="flex gap-2">
                         {q.type === 'multiple' || q.type === 'checklist' || q.type === 'true-false' ? (
                           (q.type === 'true-false' ? ['Т', 'Н'] : q.options).map((_, oIdx) => (
                             <div key={oIdx} className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-300">
                               {q.type === 'true-false' ? (oIdx === 0 ? 'Т' : 'Н') : String.fromCharCode(65 + oIdx)}
                             </div>
                           ))
                         ) : (
                           <div className="border-b-2 border-slate-200 w-40 h-6" />
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 questions.map((q, idx) => (
                   <div key={q.id} className={testInfo.layout === 'double' && q.fullWidth ? 'col-span-2' : ''}>
                     <Question 
                       q={q} 
                       idx={idx} 
                       view={view} 
                       testInfo={testInfo} 
                       questions={questions}
                       setQuestions={setQuestions}
                       saveToBank={saveToBank}
                       showHelp={showHelp}
                       setShowHelp={setShowHelp}
                       helpContent={helpContent}
                       randomizeAnswers={randomizeAnswers}
                       duplicates={duplicates}
                       moveQuestion={moveQuestion}
                     />
                   </div>
                 ))
               )}
             </div>

             {testInfo.showScale && (
                <div className="mt-20 p-8 border-4 border-slate-900 rounded-[2rem] w-fit relative z-10">
                   <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-4 text-slate-400">Скала на оцени</h3>
                   <div className="flex gap-6">
                      {[5, 4, 3, 2].map(g => (
                        <div key={g} className="flex flex-col items-center border-r-2 border-slate-100 pr-6 last:border-0">
                           <span className="text-2xl font-black text-slate-900">{g}</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{gradingScale[g]}+</span>
                        </div>
                      ))}
                   </div>
                </div>
             )}
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
      
      {duplicateAlert && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-2xl animate-in slide-in-from-bottom-5 z-[200]">
          {duplicateAlert}
        </div>
      )}
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
