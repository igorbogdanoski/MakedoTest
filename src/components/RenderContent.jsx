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
            .replace(/\\sqrt\{(.+?)\}/g, '<span class="mr-1">√</span><span class="border-t border-indigo-400">$1</span>')
            .replace(/\\sqrt/g, '√')
            .replace(/\^\{(.+?)\}/g, '<sup class="text-[0.6em] ml-0.5">$1</sup>')
            .replace(/\^(\d+)/g, '<sup class="text-[0.6em] ml-0.5">$1</sup>')
            .replace(/_\{(.+?)\}/g, '<sub class="text-[0.6em] ml-0.5">$1</sub>')
            .replace(/_(\d+)/g, '<sub class="text-[0.6em] ml-0.5">$1</sub>')
            .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '<span class="inline-flex flex-col items-center align-middle mx-1"><span class="border-b border-indigo-400 px-1">$1</span><span class="px-1">$2</span></span>')
            .replace(/\\cdot/g, ' · ')
            .replace(/\\approx/g, ' ≈ ')
            .replace(/\\pi/g, 'π')
            .replace(/\\pm/g, ' ± ')
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\Delta/g, 'Δ');

          return (
            <span 
              key={`math-${i}`} 
              className="font-serif italic text-indigo-700 bg-indigo-50/30 px-1.5 py-0.5 rounded-lg mx-0.5 border-b-2 border-indigo-100 inline-flex items-center leading-none"
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
