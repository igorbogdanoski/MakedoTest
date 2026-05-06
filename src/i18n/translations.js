/**
 * UI translations за МакедоТест.
 *
 * Поддржани јазици: mk (македонски), sq (албански).
 * Идна мигрција: i18next (види FUTURE_PLAN.md, фаза 6.1).
 *
 * Правило: ако клучот недостасува во даден јазик, `t(key)` го враќа самиот клуч
 * (за лесна детекција на missing strings во dev).
 */

export const SUPPORTED_LANGUAGES = ['mk', 'sq'];
export const DEFAULT_LANGUAGE = 'mk';

export const translations = {
  mk: {
    quickStart: 'Брз почеток',
    howItWorks: 'Види како работи',
    editor: 'Едитор',
    preview: 'Преглед',
    print: 'Печатење',
    saveTest: 'Зачувај Тест',
    saving: 'Зачувувам...',
    myTests: 'Мои Тестови',
    questionBank: 'Банка',
    addQuestion: 'Додај прашање',
    toolbox: 'Блокови за задачи',
    searchFormat: 'Пребарај формат...',
    points: 'Поени',
    difficulty: 'Тежина',
    easy: 'Лесно',
    medium: 'Средно',
    hard: 'Тешко',
    totalPoints: 'Вкупно поени',
    estimatedTime: 'Проценето време',
    gradingScale: 'Скала на оценки',
    student: 'Ученик',
    grade: 'Одд.',
    date: 'Датум',
    teacherSignature: 'Потпис на Наставник',
    geometry: 'Геометрија',
    базични: 'Базични',
    текстуални: 'Текстуални',
    логички: 'Логички',
    листа: 'Листа',
    напредни: 'Напредни',
  },
  sq: {
    quickStart: 'Fillim i shpejtë',
    howItWorks: 'Shih si funksionon',
    editor: 'Redaktues',
    preview: 'Paraqitje',
    print: 'Printo',
    saveTest: 'Ruaj Testin',
    saving: 'Duke ruajtur...',
    myTests: 'Testet e mia',
    questionBank: 'Banka e pyetjeve',
    addQuestion: 'Shto pyetje',
    toolbox: 'Blloqet e pyetjeve',
    searchFormat: 'Kërko formatin...',
    points: 'Pikët',
    difficulty: 'Vështirësia',
    easy: 'Lehtë',
    medium: 'Mesatare',
    hard: 'Vështirë',
    totalPoints: 'Gjithsej pikë',
    estimatedTime: 'Koha e parashikuar',
    gradingScale: 'Shkalla e notimit',
    student: 'Nxënësi',
    grade: 'Klasa',
    date: 'Data',
    teacherSignature: 'Nënshkrimi i mësimdhënësit',
    geometry: 'Gjeometria',
    базични: 'Bazat',
    текстуални: 'Tekstuale',
    логички: 'Logjike',
    листа: 'Lista',
    напредни: 'Të avancuara',
  },
};

/**
 * Враќа локализиран стринг за даден јазик и клуч.
 * @param {string} lang - јазичен код (mk | sq)
 * @param {string} key  - преведлив клуч
 * @returns {string} превод или самиот клуч ако недостига
 */
export function translate(lang, key) {
  const dict = translations[lang] ?? translations[DEFAULT_LANGUAGE];
  return dict[key] ?? key;
}

/**
 * Креира `t(key)` функција врзана за даден јазик.
 * @param {string} lang
 * @returns {(key: string) => string}
 */
export function createTranslator(lang) {
  return (key) => translate(lang, key);
}
