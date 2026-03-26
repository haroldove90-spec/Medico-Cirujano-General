import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  User, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Activity,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Stethoscope,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { cn } from './lib/utils';

// --- Types & Constants ---

type UserRole = 'admin' | 'asistente';

interface Patient {
  id: string;
  nombre: string;
  edad: number;
  sexo: string;
  diagnostico: string;
  fechaIngreso: string;
  prioridad: 'alta' | 'media' | 'baja';
  padecimiento: string;
  exploracion: string;
  asa: string;
  proximaCita?: string;
  // Nuevos campos Checklist
  ocupacion?: string;
  contactoEmergencia?: string;
  antecedentesQuirurgicos?: string;
  alergias?: string;
  comorbilidades?: string;
  semiologiaDolor?: string;
  sintomasAsociados?: string;
  ultimaIngesta?: string;
  signosVitales?: { ta: string, fc: string, fr: string, temp: string, satO2: string };
  habitusExterior?: string;
  abdomen?: string;
  viaAerea?: string;
  laboratorio?: string;
  gabinete?: string;
  goldman?: string;
  consentimientoInformado?: boolean;
}

const MOCK_DATA: Patient[] = [
  {
    id: '1',
    nombre: 'Juan Pérez',
    edad: 45,
    sexo: 'Masculino',
    diagnostico: 'Colecistitis Aguda',
    fechaIngreso: '2026-03-20',
    prioridad: 'alta',
    padecimiento: 'Dolor abdominal en hipocondrio derecho de 6 horas de evolución.',
    exploracion: 'Murphy positivo, ruidos intestinales disminuidos.',
    asa: 'ASA II',
    proximaCita: '2026-03-27 09:00'
  },
  {
    id: '2',
    nombre: 'María García',
    edad: 32,
    sexo: 'Femenino',
    diagnostico: 'Hernia Inguinal',
    fechaIngreso: '2026-03-22',
    prioridad: 'media',
    padecimiento: 'Aumento de volumen en región inguinal derecha al esfuerzo.',
    exploracion: 'Tumoración reductible en canal inguinal.',
    asa: 'ASA I',
    proximaCita: '2026-03-28 11:30'
  },
  {
    id: '3',
    nombre: 'Roberto Sánchez',
    edad: 68,
    sexo: 'Masculino',
    diagnostico: 'Apendicitis Fase II',
    fechaIngreso: '2026-03-25',
    prioridad: 'alta',
    padecimiento: 'Dolor periumbilical que migra a fosa iliaca derecha.',
    exploracion: 'McBurney positivo, rebote positivo.',
    asa: 'ASA III',
    proximaCita: '2026-03-26 14:00'
  }
];

// --- Sub-Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const Badge = ({ variant, children }: { variant: 'alta' | 'media' | 'baja' | 'asa', children: string }) => {
  const styles = {
    alta: 'bg-red-50 text-red-700 border-red-100',
    media: 'bg-amber-50 text-amber-700 border-amber-100',
    baja: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    asa: 'bg-blue-50 text-blue-700 border-blue-100'
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border", styles[variant as keyof typeof styles])}>
      {children}
    </span>
  );
};

// --- Main Dashboard Component ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('asistente');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formTab, setFormTab] = useState(0);

  // Persistence Logic
  useEffect(() => {
    const savedData = localStorage.getItem('cirujano_ia_data');
    if (savedData) {
      setPatients(JSON.parse(savedData));
    } else {
      setPatients(MOCK_DATA);
      localStorage.setItem('cirujano_ia_data', JSON.stringify(MOCK_DATA));
    }
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('dashboard');
  };

  const saveToLocalStorage = (newData: Patient[]) => {
    setPatients(newData);
    localStorage.setItem('cirujano_ia_data', JSON.stringify(newData));
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // PDF Export
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Listado de Pacientes - Cirujano IA', 14, 15);
    
    const tableData = patients.map(p => [
      p.nombre,
      p.edad,
      p.sexo,
      p.diagnostico,
      p.prioridad.toUpperCase(),
      p.asa
    ]);

    (doc as any).autoTable({
      head: [['Nombre', 'Edad', 'Sexo', 'Diagnóstico', 'Prioridad', 'ASA']],
      body: tableData,
      startY: 25,
    });

    doc.save('pacientes_cirujano_ia.pdf');
  };

  // Actions
  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setActiveTab('historial');
    setFormTab(0);
  };

  const handleDelete = (id: string) => {
    const filtered = patients.filter(p => p.id !== id);
    saveToLocalStorage(filtered);
  };

  const handleSavePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    const exists = patients.find(p => p.id === editingPatient.id);
    let updated;
    if (exists) {
      updated = patients.map(p => p.id === editingPatient.id ? editingPatient : p);
    } else {
      updated = [...patients, { ...editingPatient, id: Date.now().toString() }];
    }
    
    saveToLocalStorage(updated);
    setActiveTab('pacientes');
    setEditingPatient(null);
  };

  // Views
  const MetricsView = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Cirugías', value: '124', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pacientes Mes', value: '48', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Riesgos Altos', value: '12', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Pendientes', value: '08', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 hover:shadow-md transition-shadow cursor-default group">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live</span>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" /> Próximas Intervenciones
          </h3>
          <div className="space-y-4">
            {patients.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-600">
                    {p.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.nombre}</p>
                    <p className="text-xs text-slate-500">{p.diagnostico}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{p.proximaCita?.split(' ')[1]}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Hoy</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6 bg-slate-900 text-white border-none">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" /> Rendimiento Quirúrgico
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 px-4">
            {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-blue-500/20 border-t-2 border-blue-400 rounded-t-sm"
                />
                <span className="text-[10px] text-slate-500 font-bold uppercase">D{i+1}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const AgendaView = () => (
    <Card className="p-0">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800">Agenda de Consultas</h3>
        <button className="text-xs font-bold text-blue-600 hover:underline">Ver Calendario Completo</button>
      </div>
      <div className="divide-y divide-slate-50">
        {patients.map((p, i) => (
          <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-6">
              <div className="text-center min-w-[60px]">
                <p className="text-xl font-black text-slate-900">{p.proximaCita?.split(' ')[1].split(':')[0]}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AM</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <p className="font-bold text-slate-800">{p.nombre}</p>
                <p className="text-xs text-slate-500">{p.diagnostico}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant={p.prioridad}>{p.prioridad}</Badge>
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  const PatientsView = () => (
    <Card className="p-0">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar paciente por nombre o diagnóstico..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
          >
            <Download size={18} /> Exportar PDF
          </button>
          <button 
            onClick={() => {
              setEditingPatient({ 
                id: '', 
                nombre: '', 
                edad: 0, 
                sexo: 'Masculino', 
                diagnostico: '', 
                fechaIngreso: new Date().toISOString().split('T')[0], 
                prioridad: 'baja', 
                padecimiento: '', 
                exploracion: '', 
                asa: 'ASA I',
                ocupacion: '',
                contactoEmergencia: '',
                antecedentesQuirurgicos: '',
                alergias: '',
                comorbilidades: '',
                semiologiaDolor: '',
                sintomasAsociados: '',
                ultimaIngesta: '',
                signosVitales: { ta: '', fc: '', fr: '', temp: '', satO2: '' },
                habitusExterior: '',
                abdomen: '',
                viaAerea: '',
                laboratorio: '',
                gabinete: '',
                goldman: '',
                consentimientoInformado: false
              });
              setActiveTab('historial');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Nuevo Paciente
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Diagnóstico</th>
              <th className="px-6 py-4">Prioridad</th>
              <th className="px-6 py-4">Riesgo</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {patients.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800 text-sm">{p.nombre}</p>
                  <p className="text-xs text-slate-500">{p.edad} años • {p.sexo}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600">{p.diagnostico}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={p.prioridad}>{p.prioridad}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="asa">{p.asa}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Ver Detalles">
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(p)}
                      className="p-2 text-slate-400 hover:text-amber-600 transition-colors" 
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors" 
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const ClinicalHistoryView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredPatients = patients.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!editingPatient) return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Historial Clínico Quirúrgico</h3>
            <p className="text-sm text-slate-500">Seleccione un paciente para gestionar su checklist y antecedentes.</p>
          </div>
          <button 
            onClick={() => {
              setEditingPatient({ 
                id: '', 
                nombre: '', 
                edad: 0, 
                sexo: 'Masculino', 
                diagnostico: '', 
                fechaIngreso: new Date().toISOString().split('T')[0], 
                prioridad: 'baja', 
                padecimiento: '', 
                exploracion: '', 
                asa: 'ASA I',
                ocupacion: '',
                contactoEmergencia: '',
                antecedentesQuirurgicos: '',
                alergias: '',
                comorbilidades: '',
                semiologiaDolor: '',
                sintomasAsociados: '',
                ultimaIngesta: '',
                signosVitales: { ta: '', fc: '', fr: '', temp: '', satO2: '' },
                habitusExterior: '',
                abdomen: '',
                viaAerea: '',
                laboratorio: '',
                gabinete: '',
                goldman: '',
                consentimientoInformado: false
              });
              setFormTab(0);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Nuevo Registro
          </button>
        </div>

        <Card className="p-0">
          <div className="p-6 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nombre o diagnóstico..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => handleEdit(p)}
                  className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {p.nombre.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{p.nombre}</p>
                      <p className="text-xs text-slate-500">{p.diagnostico} • {p.prioridad.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Última Actualización</p>
                      <p className="text-xs font-bold text-slate-700">{p.fechaIngreso}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">No se encontraron pacientes.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    );

    const tabs = ['A. Identificación', 'B. Padecimiento', 'C. Exploración', 'D. Diagnóstico y Plan'];

    return (
      <Card className="p-0">
        <div className="bg-slate-50 border-b border-slate-100 flex overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={i}
              onClick={() => setFormTab(i)}
              className={cn(
                "px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                formTab === i ? "border-blue-600 text-blue-600 bg-white" : "border-transparent text-slate-400 hover:text-slate-600"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <form onSubmit={handleSavePatient} className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={formTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {formTab === 0 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-mono">Nombre Completo</label>
                      <input 
                        type="text" 
                        value={editingPatient.nombre}
                        onChange={e => setEditingPatient({...editingPatient, nombre: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="label-mono">Edad</label>
                        <input 
                          type="number" 
                          value={editingPatient.edad}
                          onChange={e => setEditingPatient({...editingPatient, edad: parseInt(e.target.value)})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Sexo</label>
                        <select 
                          value={editingPatient.sexo}
                          onChange={e => setEditingPatient({...editingPatient, sexo: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                          <option>Masculino</option>
                          <option>Femenino</option>
                          <option>Otro</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Ocupación</label>
                      <input 
                        type="text" 
                        value={editingPatient.ocupacion || ''}
                        onChange={e => setEditingPatient({...editingPatient, ocupacion: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Contacto de Emergencia</label>
                      <input 
                        type="text" 
                        value={editingPatient.contactoEmergencia || ''}
                        onChange={e => setEditingPatient({...editingPatient, contactoEmergencia: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Antecedentes Críticos</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="label-mono">Antecedentes Quirúrgicos (Previos)</label>
                        <textarea 
                          rows={2}
                          value={editingPatient.antecedentesQuirurgicos || ''}
                          onChange={e => setEditingPatient({...editingPatient, antecedentesQuirurgicos: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                          placeholder="Tipo de cirugía, fecha y complicaciones anestésicas..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Alergias</label>
                        <textarea 
                          rows={2}
                          value={editingPatient.alergias || ''}
                          onChange={e => setEditingPatient({...editingPatient, alergias: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                          placeholder="Medicamentos, látex, cintas adhesivas..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Comorbilidades</label>
                        <textarea 
                          rows={2}
                          value={editingPatient.comorbilidades || ''}
                          onChange={e => setEditingPatient({...editingPatient, comorbilidades: e.target.value})}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                          placeholder="HTA, Diabetes, enfermedades cardiovasculares o pulmonares..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formTab === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="label-mono">Semiología del Dolor (ALICIA)</label>
                    <textarea 
                      rows={4}
                      value={editingPatient.semiologiaDolor || ''}
                      onChange={e => setEditingPatient({...editingPatient, semiologiaDolor: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      placeholder="Antigüedad, Localización, Irradiación, Carácter, Intensidad, Atenuación/Agravamiento..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-mono">Síntomas Asociados</label>
                    <textarea 
                      rows={3}
                      value={editingPatient.sintomasAsociados || ''}
                      onChange={e => setEditingPatient({...editingPatient, sintomasAsociados: e.target.value})}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      placeholder="Náuseas, vómito, fiebre, cambios en el hábito intestinal o urinario..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-mono">Última ingesta (Ayuno)</label>
                    <input 
                      type="text" 
                      value={editingPatient.ultimaIngesta || ''}
                      onChange={e => setEditingPatient({...editingPatient, ultimaIngesta: e.target.value})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Hora y tipo de alimento..."
                    />
                  </div>
                </div>
              )}

              {formTab === 2 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Signos Vitales</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TA</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.ta || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), ta: e.target.value}})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                          placeholder="120/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FC</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.fc || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), fc: e.target.value}})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                          placeholder="75 bpm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">FR</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.fr || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), fr: e.target.value}})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                          placeholder="18 rpm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temp</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.temp || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), temp: e.target.value}})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                          placeholder="36.5 °C"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SatO2</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.satO2 || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), satO2: e.target.value}})}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                          placeholder="98%"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-mono">Habitus Exterior</label>
                      <textarea 
                        rows={3}
                        value={editingPatient.habitusExterior || ''}
                        onChange={e => setEditingPatient({...editingPatient, habitusExterior: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        placeholder="Estado nutricional y fragilidad..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Evaluación de Vía Aérea</label>
                      <textarea 
                        rows={3}
                        value={editingPatient.viaAerea || ''}
                        onChange={e => setEditingPatient({...editingPatient, viaAerea: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        placeholder="Mallampati, apertura bucal, distancia tiromentoniana..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="label-mono">Abdomen</label>
                      <textarea 
                        rows={4}
                        value={editingPatient.abdomen || ''}
                        onChange={e => setEditingPatient({...editingPatient, abdomen: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        placeholder="Inspección, auscultación, palpación (Murphy, McBurney, rebote) y percusión..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {formTab === 3 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-mono">Laboratorio</label>
                      <textarea 
                        rows={3}
                        value={editingPatient.laboratorio || ''}
                        onChange={e => setEditingPatient({...editingPatient, laboratorio: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        placeholder="Hemoglobina, TP/TPT, Creatinina..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Gabinete</label>
                      <textarea 
                        rows={3}
                        value={editingPatient.gabinete || ''}
                        onChange={e => setEditingPatient({...editingPatient, gabinete: e.target.value})}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                        placeholder="Interpretación de TAC, Ultrasonido o Rx de Tórax..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="label-mono">Riesgo Quirúrgico (ASA)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['ASA I', 'ASA II', 'ASA III', 'ASA IV', 'ASA V'].map(asa => (
                          <button
                            key={asa}
                            type="button"
                            onClick={() => setEditingPatient({...editingPatient, asa})}
                            className={cn(
                              "p-3 rounded-lg text-xs font-bold border transition-all",
                              editingPatient.asa === asa ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                            )}
                          >
                            {asa}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="label-mono">Escala de Goldman</label>
                      <input 
                        type="text" 
                        value={editingPatient.goldman || ''}
                        onChange={e => setEditingPatient({...editingPatient, goldman: e.target.value})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Clase I, II, III o IV..."
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                        editingPatient.consentimientoInformado ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
                      )}>
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Consentimiento Informado</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Documento firmado y explicado</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingPatient({...editingPatient, consentimientoInformado: !editingPatient.consentimientoInformado})}
                      className={cn(
                        "px-6 py-2 rounded-lg text-xs font-bold transition-all",
                        editingPatient.consentimientoInformado ? "bg-green-600 text-white" : "bg-white border border-slate-200 text-slate-500"
                      )}
                    >
                      {editingPatient.consentimientoInformado ? 'Confirmado' : 'Pendiente'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
            <button 
              type="button"
              onClick={() => { setEditingPatient(null); setActiveTab('pacientes'); }}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Save size={18} /> Guardar Historial
            </button>
          </div>
        </form>
      </Card>
    );
  };

  const ProfileView = () => (
    <div className="max-w-2xl space-y-6">
      <Card className="p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black">
            DR
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Dr. Alejandro Martínez</h3>
            <p className="text-sm text-slate-500">Cirujano General • Especialista en Laparoscopia</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="label-mono">Cédula Profesional</label>
              <input type="text" defaultValue="12345678" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
            </div>
            <div className="space-y-2">
              <label className="label-mono">Especialidad</label>
              <input type="text" defaultValue="Cirugía General" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="label-mono">Correo Electrónico</label>
            <input type="email" defaultValue="dr.martinez@hospital.com" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
          </div>
          <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">
            Actualizar Perfil
          </button>
        </div>
      </Card>
      
      <Card className="p-8 border-red-100 bg-red-50/30">
        <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle size={18} /> Zona de Peligro
        </h4>
        <p className="text-xs text-red-600 mb-4">Estas acciones son permanentes y afectarán a todos los datos del sistema.</p>
        <button 
          onClick={() => { localStorage.removeItem('cirujano_ia_data'); window.location.reload(); }}
          className="px-4 py-2 border border-red-200 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
        >
          Restablecer Base de Datos
        </button>
      </Card>
    </div>
  );

  const LoginView = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="p-10 text-center shadow-2xl border-none">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-500/30">
            <Stethoscope size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
            CIRUJANO<span className="text-blue-600">IA</span>
          </h1>
          <p className="text-slate-500 text-sm mb-10 font-medium">Asistente Médico Quirúrgico Inteligente</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('admin')}
              className="w-full group flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <ShieldAlert size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm">Rol Especialista</p>
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">Acceso Total</p>
                </div>
              </div>
              <ChevronRight size={18} className="opacity-30 group-hover:opacity-100 transition-opacity" />
            </button>

            <button 
              onClick={() => handleLogin('asistente')}
              className="w-full group flex items-center justify-between p-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:border-blue-500 transition-all active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm">Rol Asistente</p>
                  <p className="text-[10px] text-slate-500 font-normal uppercase tracking-widest">Gestión y Consultas</p>
                </div>
              </div>
              <ChevronRight size={18} className="opacity-30 group-hover:opacity-100 transition-opacity text-blue-600" />
            </button>
          </div>

          <p className="mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Demo v1.0 • 2026
          </p>
        </Card>
      </motion.div>
    </div>
  );

  if (!isLoggedIn) return <LoginView />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Stethoscope size={20} />
          </div>
          {sidebarOpen && <span className="ml-3 font-black text-lg tracking-tighter uppercase">MÉDICO<span className="text-blue-600"> CIRUJANO GRAL.</span></span>}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'asistente'] },
            { id: 'agenda', label: 'Agenda', icon: Calendar, roles: ['admin', 'asistente'] },
            { id: 'pacientes', label: 'Pacientes', icon: Users, roles: ['admin', 'asistente'] },
            { id: 'historial', label: 'Historial Clínico', icon: FileText, roles: ['admin', 'asistente'] },
            { id: 'perfil', label: 'Perfil y Config', icon: Settings, roles: ['admin', 'asistente'] },
          ].filter(item => item.roles.includes(userRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center p-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", activeTab === item.id ? "text-white" : "group-hover:text-blue-600")} />
              {sidebarOpen && <span className="ml-3 text-sm font-bold">{item.label}</span>}
              {activeTab === item.id && sidebarOpen && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={cn("flex items-center p-3 rounded-xl bg-slate-50 border border-slate-100", !sidebarOpen && "justify-center")}>
            <button 
              onClick={() => setUserRole(userRole === 'admin' ? 'asistente' : 'admin')}
              className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0 hover:bg-blue-200 transition-colors"
            >
              {userRole === 'admin' ? 'AD' : 'AS'}
            </button>
            {sidebarOpen && (
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-900 truncate uppercase">{userRole}</p>
                <p className="text-[10px] text-slate-500 truncate">Click para cambiar</p>
              </div>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className={cn(
              "w-full mt-4 flex items-center p-3 text-slate-400 hover:text-red-600 transition-colors cursor-pointer", 
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="ml-3 text-sm font-bold">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-xl font-bold text-slate-900 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Sincronizado
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
              <User size={20} />
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <MetricsView />}
              {activeTab === 'agenda' && <AgendaView />}
              {activeTab === 'pacientes' && <PatientsView />}
              {activeTab === 'historial' && <ClinicalHistoryView />}
              {activeTab === 'perfil' && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border border-slate-800"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="font-bold text-sm">Operación Exitosa</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Base de datos actualizada</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
