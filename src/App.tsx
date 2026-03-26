import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  Activity, 
  AlertTriangle, 
  ClipboardList, 
  FileJson, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ShieldAlert,
  Clock,
  User
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeMedicalNote } from './services/geminiService';
import { MedicalAnalysis } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<MedicalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMedicalNote(input);
      setAnalysis(result);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError('Error al procesar la nota médica. Intente de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      normal: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      alerta: 'bg-amber-100 text-amber-700 border-amber-200',
      critico: 'bg-red-100 text-red-700 border-red-200',
    };
    const colorClass = colors[status as keyof typeof colors] || colors.normal;
    
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border", colorClass)}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-medical-accent rounded-lg flex items-center justify-center text-white">
              <Stethoscope size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">CirujanoIA <span className="text-slate-400 font-normal">v1.0</span></h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1"><Activity size={14} /> Sistema Operativo</span>
            <span className="w-2 h-2 bg-medical-success rounded-full animate-pulse"></span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        {/* Input Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="text-medical-accent" size={20} />
            <h2 className="font-bold text-slate-800">Entrada de Datos Clínicos</h2>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-medical-accent/20 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pegue aquí la nota médica, transcripción de audio o descripción del paciente..."
              className="w-full h-48 p-6 resize-none outline-none text-slate-700 leading-relaxed"
            />
            <div className="bg-slate-50 px-6 py-3 flex items-center justify-between border-t border-slate-100">
              <p className="text-xs text-slate-400 italic">
                {input.length > 0 ? `${input.length} caracteres detectados` : 'Esperando entrada...'}
              </p>
              <button
                onClick={handleAnalyze}
                disabled={loading || !input.trim()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all",
                  loading || !input.trim() 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-medical-accent text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95"
                )}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? 'Procesando...' : 'Analizar Nota'}
              </button>
            </div>
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 text-sm"
            >
              <AlertTriangle size={18} />
              {error}
            </motion.div>
          )}
        </section>

        {/* Results Section */}
        <AnimatePresence>
          {analysis && (
            <motion.div 
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Resumen Ejecutivo */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info size={18} className="text-blue-400" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Resumen Ejecutivo</h3>
                  </div>
                  <CheckCircle2 size={18} className="text-medical-success" />
                </div>
                <div className="p-6">
                  <p className="text-slate-700 leading-relaxed italic border-l-4 border-medical-accent pl-4">
                    "{analysis.resumenEjecutivo}"
                  </p>
                </div>
              </div>

              {/* Grid de Datos Técnicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Signos y Síntomas */}
                <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <Activity size={18} className="text-medical-accent" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Signos y Síntomas Detectados</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {analysis.signosYSintomas.map((item, idx) => (
                      <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="label-mono">{item.signo}</p>
                          <p className="font-bold text-slate-800">{item.valor}</p>
                        </div>
                        <StatusBadge status={item.estado} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Riesgos Quirúrgicos */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-medical-alert" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Escalas de Riesgo</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <p className="label-mono">ASA Physical Status</p>
                      <p className="text-2xl font-black text-slate-900">{analysis.riesgos.asa}</p>
                    </div>
                    <div>
                      <p className="label-mono">Goldman (Cardíaco)</p>
                      <p className="text-xl font-bold text-slate-800">{analysis.riesgos.goldman}</p>
                    </div>
                    <div>
                      <p className="label-mono">Caprini (Trombótico)</p>
                      <p className="text-xl font-bold text-slate-800">{analysis.riesgos.caprini}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <span className="font-bold text-slate-700">Justificación:</span> {analysis.riesgos.justificacion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conducta y Datos Faltantes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                    <ChevronRight size={18} className="text-medical-accent" />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Conducta Sugerida</h3>
                  </div>
                  <div className="p-6 prose prose-slate prose-sm max-w-none">
                    <ReactMarkdown>{analysis.conductaSugerida}</ReactMarkdown>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl border border-amber-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-amber-100 flex items-center gap-2">
                    <Clock size={18} className="text-amber-600" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-amber-800">Datos Faltantes / Omisiones</h3>
                  </div>
                  <div className="p-6">
                    {analysis.datosFaltantes.length > 0 ? (
                      <ul className="space-y-3">
                        {analysis.datosFaltantes.map((dato, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                            {dato}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-emerald-700 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Información completa para evaluación inicial.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* JSON Estructurado */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson size={18} className="text-blue-400" />
                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-300">JSON Estructurado (Base de Datos)</h3>
                  </div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(analysis.jsonEstructurado, null, 2))}
                    className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Copiar JSON
                  </button>
                </div>
                <div className="p-6 overflow-x-auto">
                  <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                    {JSON.stringify(analysis.jsonEstructurado, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="mt-20 flex flex-col items-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
              <User size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Listo para Evaluar</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Ingrese los datos del paciente para generar el análisis quirúrgico, escalas de riesgo y JSON estructurado.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 py-8 text-center">
        <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">
          Inteligencia Artificial Médica • Protocolo de Seguridad Quirúrgica
        </p>
      </footer>
    </div>
  );
}
