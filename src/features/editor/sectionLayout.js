export function buildQuestionSections(questions = [], defaultLayout = 'single') {
  const sections = [];
  let currentSection = { layout: defaultLayout, questions: [] };

  questions.forEach((question, idx) => {
    if (question.type === 'section') {
      if (currentSection.questions.length > 0) {
        sections.push(currentSection);
      }

      sections.push({ isHeader: true, q: question, idx });
      currentSection = {
        layout: question.sectionLayout || defaultLayout,
        questions: [],
      };
      return;
    }

    currentSection.questions.push({ q: question, idx });
  });

  // Keep trailing empty section for compatibility with existing render flow.
  sections.push(currentSection);

  return sections;
}
