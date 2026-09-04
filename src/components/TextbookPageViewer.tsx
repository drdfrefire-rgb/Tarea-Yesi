import React from 'react';
import { PhysicsSolution } from '../types';
import { BookOpen, Printer, Download } from 'lucide-react';

interface TextbookPageViewerProps {
  solution: PhysicsSolution;
}

export const TextbookPageViewer: React.FC<TextbookPageViewerProps> = ({ solution }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 bg-white p-6 sm:p-12 md:p-16 flex flex-col items-center justify-start overflow-y-auto selection:bg-slate-200">
      {/* Top Action Toolbar for Print/Export */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8 pb-4 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-2 text-slate-700">
          <BookOpen className="w-5 h-5 text-slate-900" />
          <span className="font-serif text-sm font-bold tracking-wide uppercase">Vista de Libro Universitario / Electromagnetismo</span>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-serif font-medium flex items-center gap-2 shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Guardar PDF</span>
        </button>
      </div>

      {/* Academic Textbook Page Container */}
      <article className="w-full max-w-3xl bg-white text-black p-8 sm:p-14 md:p-16 font-serif leading-relaxed text-justify shadow-xs sm:border sm:border-slate-300 sm:rounded-xs print:shadow-none print:border-none print:p-0">
        {/* Header / Chapter / Page Number reference if desired */}
        <div className="flex justify-between items-center text-xs font-serif text-slate-500 mb-10 pb-2 border-b border-slate-200 print:mb-6">
          <span>CAPÍTULO: Electrodinámica y Ley de Gauss</span>
          <span>PROBLEMA PROPUESTO</span>
        </div>

        {/* Problem Statement Paragraph */}
        <div className="text-[15px] sm:text-[17px] md:text-[18px] text-black space-y-6 tracking-normal">
          <p className="indent-0">
            <span className="font-bold mr-2">10.</span>
            Un cilindro aislante de longitud infinita y de radio <span className="italic">R</span> tiene una densidad de carga volumétrica que varía en función del radio de la forma siguiente:
          </p>

          {/* Centered Mathematical Formula */}
          <div className="my-6 py-2 text-center">
            <span className="inline-block text-lg sm:text-xl md:text-2xl font-serif italic tracking-wide text-black">
              ρ = ρ₀(a − r/b)
            </span>
          </div>

          <p className="indent-0">
            siendo ρ₀, <span className="italic">a</span> y <span className="italic">b</span> constantes positivas y <span className="italic">r</span> la distancia al eje del cilindro. Utilice la ley de Gauss para determinar la magnitud del campo eléctrico a las siguientes distancias radiales:
          </p>

          {/* Subsections a, b, c */}
          <div className="space-y-3 pl-6 mt-4">
            <p className="indent-0">
              <span className="font-bold mr-2">a)</span> <span className="italic">r</span> &lt; <span className="italic">R</span>.
            </p>
            <p className="indent-0">
              <span className="font-bold mr-2">b)</span> <span className="italic">r</span> &gt; <span className="italic">R</span>.
            </p>
            <p className="indent-0">
              <span className="font-bold mr-2">c)</span> Realice un gráfico de la intensidad del campo eléctrico, tanto dentro como fuera del cilindro, en función de la distancia al eje, todo en el mismo plano.
            </p>
          </div>
        </div>

        {/* Footer page mark */}
        <div className="mt-24 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-serif print:mt-16">
          <span>Física Universitaria con Aplicaciones</span>
          <span>10</span>
        </div>
      </article>
    </div>
  );
};
