import React from 'react';

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

export default RenderContent;
