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
  Download,
  ChevronDown,
  Briefcase,
  Phone
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    nombre: 'Juan Pérez García',
    edad: 45,
    sexo: 'Masculino',
    diagnostico: 'Colecistitis Crónica Litiásica',
    fechaIngreso: '2026-03-20',
    prioridad: 'media',
    asa: 'ASA II',
    padecimiento: 'Dolor abdominal tipo cólico en hipocondrio derecho de 12 horas de evolución, irradiado a región escapular derecha.',
    exploracion: 'Murphy positivo, abdomen blando, depresible, doloroso a la palpación profunda en hipocondrio derecho.',
    signosVitales: { ta: '120/80', fc: '72', fr: '18', temp: '36.5', satO2: '98' },
    proximaCita: '2026-03-26 09:00',
    consentimientoInformado: true,
    antecedentesQuirurgicos: 'Apendicectomía hace 10 años',
    alergias: 'Negadas',
    comorbilidades: 'Hipertensión Arterial Controlada',
    ultimaIngesta: '6 horas de ayuno'
  },
  {
    id: '2',
    nombre: 'María Rodríguez Sosa',
    edad: 32,
    sexo: 'Femenino',
    diagnostico: 'Hernia Inguinal Derecha',
    fechaIngreso: '2026-03-22',
    prioridad: 'baja',
    asa: 'ASA I',
    padecimiento: 'Aumento de volumen en región inguinal derecha de 3 meses de evolución, que aumenta al esfuerzo físico.',
    exploracion: 'Tumoración reductible en región inguinal derecha, maniobra de Valsalva positiva.',
    signosVitales: { ta: '110/70', fc: '68', fr: '16', temp: '36.2', satO2: '99' },
    proximaCita: '2026-03-26 11:30',
    consentimientoInformado: true,
    antecedentesQuirurgicos: 'Cesárea previa',
    alergias: 'Penicilina',
    comorbilidades: 'Ninguna',
    ultimaIngesta: '8 horas de ayuno'
  },
  {
    id: '3',
    nombre: 'Roberto Gómez Luna',
    edad: 68,
    sexo: 'Masculino',
    diagnostico: 'Apendicitis Aguda',
    fechaIngreso: '2026-03-25',
    prioridad: 'alta',
    asa: 'ASA III',
    padecimiento: 'Dolor periumbilical que migra a fosa iliaca derecha de 24 horas de evolución, acompañado de náuseas.',
    exploracion: 'McBurney positivo, rebote positivo, resistencia muscular en fosa iliaca derecha.',
    signosVitales: { ta: '135/85', fc: '92', fr: '22', temp: '38.2', satO2: '96' },
    proximaCita: '2026-03-26 14:00',
    consentimientoInformado: true,
    antecedentesQuirurgicos: 'Ninguno',
    alergias: 'Negadas',
    comorbilidades: 'Diabetes Mellitus Tipo 2',
    ultimaIngesta: '4 horas de ayuno'
  }
];

// --- Sub-Components ---

const ActionMenu = ({ 
  patient, 
  module, 
  activeMenu, 
  setActiveMenu, 
  handleEdit, 
  handleDelete, 
  exportToPDF, 
  userRole 
}: { 
  patient: Patient; 
  module: string;
  activeMenu: string | null;
  setActiveMenu: (val: string | null) => void;
  handleEdit: (p: Patient) => void;
  handleDelete: (id: string) => void;
  exportToPDF: (title: string) => void;
  userRole: UserRole;
}) => {
  const menuId = `${module}-${patient.id}`;
  const isOpen = activeMenu === menuId;

  return (
    <div className="relative">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenu(isOpen ? null : menuId);
        }}
        className="p-2 text-slate-400 hover:text-brand-primary transition-colors rounded-full hover:bg-slate-100"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 overflow-hidden animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {userRole === 'admin' && (
            <>
              <button 
                onClick={() => { handleEdit(patient); setActiveMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Eye size={16} className="text-brand-primary" /> Ver Detalle
              </button>
              <button 
                onClick={() => { handleEdit(patient); setActiveMenu(null); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit2 size={16} className="text-amber-500" /> Editar Registro
              </button>
            </>
          )}
          <button 
            onClick={() => { exportToPDF(`Registro_${patient.nombre}`); setActiveMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download size={16} className="text-emerald-500" /> Guardar (PDF)
          </button>
          {userRole === 'admin' && (
            <button 
              onClick={() => { handleDelete(patient.id); setActiveMenu(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} /> Borrar Registro
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("modern-card p-6", className)}>
    {children}
  </div>
);

const Badge = ({ variant, children }: { variant: 'alta' | 'media' | 'baja' | 'asa', children: string }) => {
  const styles = {
    alta: 'bg-red-50 text-red-700 border-red-100',
    media: 'bg-amber-50 text-amber-700 border-amber-100',
    baja: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    asa: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
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
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formTab, setFormTab] = useState(0);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Moved from CalendarComponent
  const [clinicalSearchTerm, setClinicalSearchTerm] = useState(''); // Moved from ClinicalHistoryView

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setShowInstallPopup(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Partial<Patient>>({
    nombre: '',
    edad: 0,
    sexo: 'Masculino',
    diagnostico: '',
    prioridad: 'baja',
    proximaCita: new Date().toISOString().split('T')[0] + ' 09:00',
    asa: 'ASA I'
  });

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

  // Role-based Access Control
  useEffect(() => {
    const sidebarItems = [
      { id: 'dashboard', roles: ['admin', 'asistente'] },
      { id: 'agenda', roles: ['admin', 'asistente'] },
      { id: 'pacientes', roles: ['admin', 'asistente'] },
      { id: 'historial', roles: ['admin'] },
      { id: 'perfil', roles: ['admin', 'asistente'] },
    ];
    
    const currentItem = sidebarItems.find(item => item.id === activeTab);
    if (currentItem && !currentItem.roles.includes(userRole)) {
      setActiveTab('dashboard');
    }
  }, [userRole, activeTab]);

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
  const exportToPDF = (title: string = 'Listado de Pacientes', data?: any[][], headers?: string[]) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(title, 14, 20);
      doc.setFontSize(10);
      doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, 14, 28);
      
      const defaultHeaders = ['Nombre', 'Edad', 'Sexo', 'Diagnóstico', 'Prioridad', 'ASA'];
      const defaultData = patients.map(p => [
        p.nombre,
        p.edad,
        p.sexo,
        p.diagnostico,
        p.prioridad.toUpperCase(),
        p.asa
      ]);

      autoTable(doc, {
        head: [headers || defaultHeaders],
        body: data || defaultData,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [255, 107, 129], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      // No alert in iframe
    }
  };

  const exportAgendaPDF = () => {
    const headers = ['Hora', 'Paciente', 'Diagnóstico', 'Prioridad'];
    const data = patients.map(p => [
      p.proximaCita?.split(' ')[1] || 'N/A',
      p.nombre,
      p.diagnostico,
      p.prioridad.toUpperCase()
    ]);
    exportToPDF('Agenda de Consultas', data, headers);
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
  const MetricsView = () => {
    const stats = [
      { label: 'Pacientes Totales', value: patients.length, icon: Users, color: 'bg-brand-primary', textColor: 'text-brand-primary' },
      { label: 'Cirugías Mes', value: '12', icon: Activity, color: 'bg-brand-primary', textColor: 'text-brand-primary' },
      { label: 'Riesgo Alto', value: patients.filter(p => p.prioridad === 'alta').length, icon: ShieldAlert, color: 'bg-brand-primary', textColor: 'text-brand-primary' },
      { label: 'Citas Hoy', value: patients.filter(p => p.proximaCita?.startsWith(new Date().toISOString().split('T')[0])).length, icon: Clock, color: 'bg-brand-primary', textColor: 'text-brand-primary' },
    ];

    return (
      <div className="space-y-10">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="flex flex-col justify-between h-48 p-8 hover:scale-105 transition-transform cursor-default">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <h3 className="text-4xl sm:text-5xl font-black text-brand-primary tracking-tighter">{stat.value}</h3>
              </Card>
            ))}
          </div>

          <div className="space-y-8">
            <Card className="p-8">
              <h3 className="text-lg font-black text-brand-primary uppercase tracking-tight mb-6">Equipo Médico</h3>
              <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {[
                  { name: 'Johana', role: 'Admin', color: 'bg-brand-primary' },
                  { name: 'Sandra', role: 'Asistente', color: 'bg-brand-primary' },
                  { name: 'Carlos', role: 'Enfermero', color: 'bg-brand-accent' },
                  { name: 'Lucía', role: 'Anestesista', color: 'bg-brand-primary' },
                  { name: 'Miguel', role: 'Residente', color: 'bg-brand-primary' },
                ].map((member, i) => (
                  <div key={i} className="flex flex-col items-center shrink-0">
                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg mb-2", member.color)}>
                      {member.name[0]}
                    </div>
                    <p className="text-[10px] font-black text-brand-primary uppercase">{member.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{member.role}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-6">
              {[
                { label: 'Agenda', icon: Calendar, color: 'bg-brand-primary', id: 'agenda' },
                { label: 'Pacientes', icon: Users, color: 'bg-brand-primary', id: 'pacientes' },
                { label: 'Historial', icon: FileText, color: 'bg-brand-primary', id: 'historial' },
                { label: 'Perfil', icon: Settings, color: 'bg-brand-primary', id: 'perfil' },
                ...(userRole === 'asistente' ? [{ label: 'Nueva Cita', icon: Plus, color: 'bg-brand-primary', id: 'agenda', action: () => { setActiveTab('agenda'); setIsAddingAppointment(true); } }] : [])
              ].filter(d => d.id !== 'historial' || userRole === 'admin').map((device, i) => (
                <button 
                  key={i} 
                  onClick={() => device.action ? device.action() : setActiveTab(device.id)}
                  className="modern-card p-6 flex flex-col items-center justify-center gap-4 hover:scale-105 transition-all group"
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform", device.color)}>
                    <device.icon size={24} />
                  </div>
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{device.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CalendarComponent = () => {
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    
    const getAppointmentsForDay = (day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return patients.filter(p => p.proximaCita?.startsWith(dateStr));
    };

    const isToday = (day: number) => {
      const today = new Date();
      return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    };

    return (
      <div className="p-0">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-[32px]">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                {monthNames[month]} <span className="text-brand-primary">{year}</span>
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Gestión de Agenda Quirúrgica</p>
            </div>
            {userRole === 'asistente' && (
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="px-4 py-2 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
              >
                ← Volver a Lista
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
              <button 
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))} 
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"
              >
                <ChevronRight size={18} className="rotate-180" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())} 
                className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-primary transition-colors"
              >
                Hoy
              </button>
              <button 
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))} 
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-500"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            {userRole === 'asistente' && (
              <button 
                onClick={() => setIsAddingAppointment(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
              >
                <Plus size={16} /> Nueva Cita
              </button>
            )}
            <button 
              onClick={exportAgendaPDF}
              className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
              title="Exportar Agenda"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 bg-slate-50">
          {["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"].map(d => (
            <div key={d} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-r border-b border-slate-100 last:border-r-0">
              {d.substring(0, 3)}
            </div>
          ))}
          {days.map((day, i) => {
            const appointments = day ? getAppointmentsForDay(day) : [];
            const today = isToday(day || 0);
            
            return (
              <div key={i} className={cn(
                "min-h-[120px] md:min-h-[150px] p-3 border-r border-b border-slate-100 last:border-r-0 transition-all group relative",
                !day ? "bg-slate-50/50" : "bg-white hover:bg-slate-50/30"
              )}>
                {day && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "text-xs font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                        today ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110" : "text-slate-400 group-hover:text-slate-600"
                      )}>
                        {day}
                      </span>
                      {appointments.length > 0 && (
                        <span className="text-[9px] font-black text-brand-primary/40 uppercase tracking-widest">
                          {appointments.length} {appointments.length === 1 ? 'Cita' : 'Citas'}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {appointments.map((app, idx) => (
                        <motion.div 
                          key={idx} 
                          whileHover={{ x: 4 }}
                          onClick={() => handleEdit(app)}
                          className={cn(
                            "p-2 rounded-lg text-[9px] font-bold truncate cursor-pointer transition-all border-l-4",
                            app.prioridad === 'alta' ? "bg-red-50 text-red-600 border-red-500 hover:bg-red-100" :
                            app.prioridad === 'media' ? "bg-amber-50 text-amber-600 border-amber-500 hover:bg-amber-100" :
                            "bg-brand-primary/5 text-brand-primary border-brand-primary hover:bg-brand-primary/10"
                          )}
                        >
                          <span className="font-mono opacity-60 mr-1">{app.proximaCita?.split(' ')[1]}</span>
                          {app.nombre}
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const AgendaView = () => {
    if (isAddingAppointment) {
      return (
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Programar Nueva Cita</h3>
            <button onClick={() => setIsAddingAppointment(false)} className="p-2 text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const patient: Patient = {
              ...newAppointment as Patient,
              id: Date.now().toString(),
              fechaIngreso: new Date().toISOString().split('T')[0],
              padecimiento: 'Cita programada por asistente',
              exploracion: 'Pendiente de valoración',
              consentimientoInformado: false
            };
            saveToLocalStorage([...patients, patient]);
            setIsAddingAppointment(false);
            setNewAppointment({
              nombre: '',
              edad: 0,
              sexo: 'Masculino',
              diagnostico: '',
              prioridad: 'baja',
              proximaCita: new Date().toISOString().split('T')[0] + ' 09:00',
              asa: 'ASA I'
            });
          }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="label-mono">Nombre del Paciente</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input 
                    required
                    type="text" 
                    value={newAppointment.nombre}
                    onChange={(e) => setNewAppointment({...newAppointment, nombre: e.target.value})}
                    className="modern-input pl-12" 
                    placeholder="Nombre completo"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-mono">Edad</label>
                  <input 
                    required
                    type="number" 
                    value={newAppointment.edad}
                    onChange={(e) => setNewAppointment({...newAppointment, edad: parseInt(e.target.value)})}
                    className="modern-input" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-mono">Sexo</label>
                  <div className="relative">
                    <select 
                      value={newAppointment.sexo}
                      onChange={(e) => setNewAppointment({...newAppointment, sexo: e.target.value})}
                      className="modern-select"
                    >
                      <option>Masculino</option>
                      <option>Femenino</option>
                      <option>Otro</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="label-mono">Diagnóstico Presuntivo</label>
                <div className="relative">
                  <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input 
                    required
                    type="text" 
                    value={newAppointment.diagnostico}
                    onChange={(e) => setNewAppointment({...newAppointment, diagnostico: e.target.value})}
                    className="modern-input pl-12" 
                    placeholder="Ej. Colecistitis, Hernia, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="label-mono">Fecha y Hora de Cita</label>
                <div className="relative">
                  <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                  <input 
                    required
                    type="datetime-local" 
                    value={newAppointment.proximaCita?.replace(' ', 'T')}
                    onChange={(e) => setNewAppointment({...newAppointment, proximaCita: e.target.value.replace('T', ' ')})}
                    className="modern-input pl-12" 
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="label-mono">Prioridad</label>
                <div className="relative">
                  <select 
                    value={newAppointment.prioridad}
                    onChange={(e) => setNewAppointment({...newAppointment, prioridad: e.target.value as any})}
                    className="modern-select"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="label-mono">Riesgo ASA (Inicial)</label>
                <div className="relative">
                  <select 
                    value={newAppointment.asa}
                    onChange={(e) => setNewAppointment({...newAppointment, asa: e.target.value})}
                    className="modern-select"
                  >
                    <option>ASA I</option>
                    <option>ASA II</option>
                    <option>ASA III</option>
                    <option>ASA IV</option>
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="pt-6 flex gap-4">
              <button 
                type="submit"
                className="flex-1 py-4 bg-brand-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
              >
                Guardar Cita
              </button>
              <button 
                type="button"
                onClick={() => setIsAddingAppointment(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      );
    }

    if (userRole === 'admin' || showFullCalendar) {
      return (
        <Card className="p-0">
          <CalendarComponent />
        </Card>
      );
    }

    return (
      <Card className="p-0 border-none shadow-xl shadow-slate-200/50">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white rounded-t-[32px]">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Agenda de Consultas</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Listado diario de pacientes programados</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsAddingAppointment(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
            >
              <Plus size={16} /> Nueva Cita
            </button>
            <button 
              onClick={exportAgendaPDF}
              className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={() => setShowFullCalendar(true)}
              className="px-4 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
            >
              Calendario
            </button>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {patients.length > 0 ? patients.map((p, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-all group"
            >
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center justify-center bg-slate-50 w-20 h-20 rounded-2xl border border-slate-100 group-hover:border-brand-primary/30 group-hover:bg-brand-primary/5 transition-all">
                  <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{p.proximaCita?.split(' ')[1].split(':')[0]}:{p.proximaCita?.split(' ')[1].split(':')[1]}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">HRS</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-900 tracking-tight group-hover:text-brand-primary transition-colors">{p.nombre}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{p.diagnostico}</p>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sexo} • {p.edad} años</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Riesgo Quirúrgico</p>
                  <Badge variant="asa">{p.asa}</Badge>
                </div>
                <div className="h-12 w-[1px] bg-slate-100" />
                <div className="flex items-center gap-4">
                  <Badge variant={p.prioridad}>{p.prioridad}</Badge>
                  <ActionMenu 
                    patient={p} 
                    module="agenda" 
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    exportToPDF={exportToPDF}
                    userRole={userRole}
                  />
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-slate-200" />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No hay citas programadas</p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  const PatientsView = () => {
    const filteredPatients = patients.filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card className="p-0">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar paciente por nombre o diagnóstico..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => exportToPDF('Listado de Pacientes')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
            >
              <Download size={18} /> Exportar PDF
            </button>
            {userRole === 'admin' && (
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
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20 transition-all active:scale-95"
              >
                <Plus size={18} /> Nuevo Paciente
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">
                <th className="px-6 py-6">Paciente</th>
                <th className="px-6 py-6">Diagnóstico</th>
                <th className="px-6 py-6">Prioridad</th>
                <th className="px-6 py-6">Riesgo</th>
                <th className="px-6 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{p.nombre}</p>
                    <p className="text-xs text-slate-500 whitespace-nowrap">{p.edad} años • {p.sexo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-1 max-w-[200px]">{p.diagnostico}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={p.prioridad}>{p.prioridad}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="asa">{p.asa}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ActionMenu 
                        patient={p} 
                        module="pacientes" 
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        exportToPDF={exportToPDF}
                        userRole={userRole}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    No se encontraron pacientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  const ClinicalHistoryView = () => {
    const filteredPatients = patients.filter(p => 
      p.nombre.toLowerCase().includes(clinicalSearchTerm.toLowerCase()) || 
      p.diagnostico.toLowerCase().includes(clinicalSearchTerm.toLowerCase())
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
            className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20 transition-all active:scale-95"
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
                value={clinicalSearchTerm}
                onChange={(e) => setClinicalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
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
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-lg group-hover:bg-brand-primary group-hover:text-white transition-all">
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
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
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
        <div className="bg-slate-50 border-b border-slate-100 flex items-center justify-between pr-6">
          <div className="flex overflow-x-auto">
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setFormTab(i)}
                className={cn(
                  "px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                  formTab === i ? "border-brand-primary text-brand-primary bg-white" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <button 
            onClick={() => exportToPDF(`Historial_${editingPatient.nombre}`)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            <Download size={14} /> Exportar PDF
          </button>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="label-mono">Nombre Completo</label>
                      <div className="relative">
                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input 
                          type="text" 
                          value={editingPatient.nombre}
                          onChange={e => setEditingPatient({...editingPatient, nombre: e.target.value})}
                          className="modern-input pl-12"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="label-mono">Edad</label>
                        <input 
                          type="number" 
                          value={editingPatient.edad}
                          onChange={e => setEditingPatient({...editingPatient, edad: parseInt(e.target.value)})}
                          className="modern-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Sexo</label>
                        <div className="relative">
                          <select 
                            value={editingPatient.sexo}
                            onChange={e => setEditingPatient({...editingPatient, sexo: e.target.value})}
                            className="modern-select"
                          >
                            <option>Masculino</option>
                            <option>Femenino</option>
                            <option>Otro</option>
                          </select>
                          <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Ocupación</label>
                      <div className="relative">
                        <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input 
                          type="text" 
                          value={editingPatient.ocupacion || ''}
                          onChange={e => setEditingPatient({...editingPatient, ocupacion: e.target.value})}
                          className="modern-input pl-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Contacto de Emergencia</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input 
                          type="text" 
                          value={editingPatient.contactoEmergencia || ''}
                          onChange={e => setEditingPatient({...editingPatient, contactoEmergencia: e.target.value})}
                          className="modern-input pl-12"
                        />
                      </div>
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
                          className="modern-textarea"
                          placeholder="Tipo de cirugía, fecha y complicaciones anestésicas..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Alergias</label>
                        <textarea 
                          rows={2}
                          value={editingPatient.alergias || ''}
                          onChange={e => setEditingPatient({...editingPatient, alergias: e.target.value})}
                          className="modern-textarea"
                          placeholder="Medicamentos, látex, cintas adhesivas..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Comorbilidades</label>
                        <textarea 
                          rows={2}
                          value={editingPatient.comorbilidades || ''}
                          onChange={e => setEditingPatient({...editingPatient, comorbilidades: e.target.value})}
                          className="modern-textarea"
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
                      className="modern-textarea"
                      placeholder="Antigüedad, Localización, Irradiación, Carácter, Intensidad, Atenuación/Agravamiento..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-mono">Síntomas Asociados</label>
                    <textarea 
                      rows={3}
                      value={editingPatient.sintomasAsociados || ''}
                      onChange={e => setEditingPatient({...editingPatient, sintomasAsociados: e.target.value})}
                      className="modern-textarea"
                      placeholder="Náuseas, vómito, fiebre, cambios en el hábito intestinal o urinario..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-mono">Última ingesta (Ayuno)</label>
                    <div className="relative">
                      <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                      <input 
                        type="text" 
                        value={editingPatient.ultimaIngesta || ''}
                        onChange={e => setEditingPatient({...editingPatient, ultimaIngesta: e.target.value})}
                        className="modern-input pl-12"
                        placeholder="Hora y tipo de alimento..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {formTab === 2 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Signos Vitales</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                      <div className="space-y-2">
                        <label className="label-mono">TA</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.ta || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), ta: e.target.value}})}
                          className="modern-input text-center p-2"
                          placeholder="120/80"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">FC</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.fc || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), fc: e.target.value}})}
                          className="modern-input text-center p-2"
                          placeholder="75 bpm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">FR</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.fr || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), fr: e.target.value}})}
                          className="modern-input text-center p-2"
                          placeholder="18 rpm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">Temp</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.temp || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), temp: e.target.value}})}
                          className="modern-input text-center p-2"
                          placeholder="36.5 °C"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-mono">SatO2</label>
                        <input 
                          type="text" 
                          value={editingPatient.signosVitales?.satO2 || ''}
                          onChange={e => setEditingPatient({...editingPatient, signosVitales: {...(editingPatient.signosVitales || {ta:'',fc:'',fr:'',temp:'',satO2:''}), satO2: e.target.value}})}
                          className="modern-input text-center p-2"
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
                        className="modern-textarea"
                        placeholder="Estado nutricional y fragilidad..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Evaluación de Vía Aérea</label>
                      <textarea 
                        rows={3}
                        value={editingPatient.viaAerea || ''}
                        onChange={e => setEditingPatient({...editingPatient, viaAerea: e.target.value})}
                        className="modern-textarea"
                        placeholder="Mallampati, apertura bucal, distancia tiromentoniana..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="label-mono">Abdomen</label>
                      <textarea 
                        rows={4}
                        value={editingPatient.abdomen || ''}
                        onChange={e => setEditingPatient({...editingPatient, abdomen: e.target.value})}
                        className="modern-textarea"
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
                        className="modern-textarea"
                        placeholder="Hemoglobina, TP/TPT, Creatinina..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-mono">Gabinete</label>
                      <textarea 
                        rows={3}
                        value={editingPatient.gabinete || ''}
                        onChange={e => setEditingPatient({...editingPatient, gabinete: e.target.value})}
                        className="modern-textarea"
                        placeholder="Interpretación de TAC, Ultrasonido o Rx de Tórax..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="label-mono">Riesgo Quirúrgico (ASA)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['ASA I', 'ASA II', 'ASA III', 'ASA IV', 'ASA V'].map(asa => (
                          <button
                            key={asa}
                            type="button"
                            onClick={() => setEditingPatient({...editingPatient, asa})}
                            className={cn(
                              "p-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all active:scale-95",
                              editingPatient.asa === asa 
                                ? "bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20" 
                                : "bg-slate-50 border-slate-100 text-slate-400 hover:border-brand-primary/30"
                            )}
                          >
                            {asa}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="label-mono">Escala de Goldman</label>
                      <div className="relative">
                        <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        <input 
                          type="text" 
                          value={editingPatient.goldman || ''}
                          onChange={e => setEditingPatient({...editingPatient, goldman: e.target.value})}
                          className="modern-input pl-12"
                          placeholder="Clase I, II, III o IV..."
                        />
                      </div>
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
              className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex items-center gap-3 px-10 py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary/90 shadow-xl shadow-brand-primary/20 transition-all active:scale-95"
            >
              <Save size={18} /> Guardar Historial
            </button>
          </div>
        </form>
      </Card>
    );
  };

  const ProfileView = () => (
    <div className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-md">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-brand-primary flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-brand-primary/20">
              {userRole === 'admin' ? 'DRA' : 'AS'}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {userRole === 'admin' ? 'Dra. Johana Bribiesca' : 'Sandra Santiago'}
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                {userRole === 'admin' ? 'Cirujano General • Laparoscopia' : 'Asistente Médico Quirúrgico'}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="label-mono">Cédula Profesional</label>
                <input type="text" defaultValue={userRole === 'admin' ? '12345678' : 'AS-987654'} className="modern-input" />
              </div>
              <div className="space-y-2">
                <label className="label-mono">Especialidad</label>
                <input type="text" defaultValue={userRole === 'admin' ? 'Cirugía General' : 'Administración Médica'} className="modern-input" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="label-mono">Correo Electrónico</label>
              <input type="email" defaultValue={userRole === 'admin' ? 'dra.bribiesca@hospital.com' : 'sandra.santiago@hospital.com'} className="modern-input" />
            </div>
            <button className="w-full py-5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 active:scale-95">
              Actualizar Perfil
            </button>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-md">
          <h3 className="text-lg font-black uppercase tracking-tight mb-8">Configuración del Sistema</h3>
          <div className="space-y-6">
            {[
              { label: 'Notificaciones Push', desc: 'Alertas de nuevas citas y cambios', active: true },
              { label: 'Sincronización en la Nube', desc: 'Respaldo automático de datos', active: false },
              { label: 'Modo Oscuro', desc: 'Interfaz optimizada para baja luz', active: false },
              { label: 'Exportación Automática', desc: 'Generar PDF al guardar historial', active: true },
            ].map((setting, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">{setting.label}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{setting.desc}</p>
                </div>
                <div className={cn(
                  "w-12 h-6 rounded-full p-1 transition-all cursor-pointer",
                  setting.active ? "bg-brand-primary" : "bg-slate-300"
                )}>
                  <div className={cn(
                    "w-4 h-4 bg-white rounded-full transition-all",
                    setting.active ? "translate-x-6" : "translate-x-0"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <Card className="p-8 border-red-100 bg-red-50/30 border-none shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-red-100 text-red-600">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <h4 className="font-black text-red-800 uppercase tracking-tight mb-1">Zona de Peligro</h4>
            <p className="text-xs text-red-600 font-bold mb-6 uppercase tracking-widest">Estas acciones son permanentes y afectarán a todos los datos del sistema.</p>
            <button 
              onClick={() => { if(confirm('¿Estás seguro de restablecer todos los datos?')) { localStorage.removeItem('cirujano_ia_data'); window.location.reload(); } }}
              className="px-6 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              Restablecer Base de Datos
            </button>
          </div>
        </div>
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
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-primary/20 overflow-hidden border-4 border-brand-primary/10">
            <img 
              src="https://w7.pngwing.com/pngs/590/717/png-transparent-medicine-medical-purple-violet-logo.png" 
              alt="Logo Medico Cirujano" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 uppercase">
            MEDICO <span className="text-brand-primary">CIRUJANO</span>
          </h1>
          <p className="text-slate-500 text-xs mb-10 font-black uppercase tracking-[0.3em]">Asistente Médico Quirúrgico IA</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin('admin')}
              className="w-full group flex items-center justify-between p-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-brand-primary transition-colors">
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
              className="w-full group flex items-center justify-between p-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-bold hover:border-brand-primary transition-all active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-brand-primary/10 transition-colors">
                  <Users size={20} className="text-brand-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm">Rol Asistente</p>
                  <p className="text-[10px] text-slate-500 font-normal uppercase tracking-widest">Gestión y Consultas</p>
                </div>
              </div>
              <ChevronRight size={18} className="opacity-30 group-hover:opacity-100 transition-opacity text-brand-primary" />
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'asistente'] },
    { id: 'agenda', label: 'Agenda', icon: Calendar, roles: ['admin', 'asistente'] },
    { id: 'pacientes', label: 'Pacientes', icon: Users, roles: ['admin', 'asistente'] },
    { id: 'historial', label: 'Historial Clínico', icon: FileText, roles: ['admin'] },
    { id: 'perfil', label: 'Perfil y Config', icon: Settings, roles: ['admin', 'asistente'] },
  ].filter(item => item.roles.includes(userRole));

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans text-brand-text overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 100 }}
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        className="hidden md:flex flex-col bg-brand-primary m-6 rounded-[32px] shadow-2xl shadow-brand-primary/20 z-30 relative overflow-hidden"
      >
        <div className="h-24 flex items-center justify-center border-b border-white/10">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden border-2 border-white/20">
            <img 
              src="https://w7.pngwing.com/pngs/590/717/png-transparent-medicine-medical-purple-violet-logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "bg-white text-brand-primary shadow-xl" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <item.icon size={24} className="shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-4 text-sm font-black uppercase tracking-widest whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-8 bg-brand-primary rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className={cn("flex items-center p-3 rounded-2xl bg-white/10 mb-4", !sidebarOpen && "justify-center")}>
            <button 
              onClick={() => setUserRole(userRole === 'admin' ? 'asistente' : 'admin')}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-brand-primary font-bold text-xs shrink-0 hover:scale-110 transition-transform"
            >
              {userRole === 'admin' ? 'AD' : 'AS'}
            </button>
            {sidebarOpen && (
              <div className="ml-3 overflow-hidden flex-1">
                <p className="text-[10px] font-black text-white truncate uppercase">{userRole}</p>
                <p className="text-[8px] text-white/50 truncate uppercase tracking-widest">Cambiar Rol</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-4 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={24} className="shrink-0" />
            {sidebarOpen && <span className="ml-4 text-sm font-black uppercase tracking-widest">Salir</span>}
          </button>
        </div>
      </motion.aside>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-brand-primary rounded-[24px] shadow-2xl shadow-brand-primary/30 z-40 flex items-center justify-around p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "p-4 rounded-2xl transition-all",
              activeTab === item.id ? "bg-white text-brand-primary shadow-lg" : "text-white/60"
            )}
          >
            <item.icon size={20} />
          </button>
        ))}
        <button 
          onClick={handleLogout}
          className="p-4 text-white/60"
        >
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden p-6 md:p-10 md:pl-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-brand-primary tracking-tighter">
              Hola, <span className="text-brand-primary">{userRole === 'admin' ? 'Dra. Johana' : 'Sandra'}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Bienvenida de nuevo al sistema</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white rounded-full px-6 py-3 shadow-sm border border-slate-100">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="ml-3 bg-transparent outline-none text-sm font-medium w-48"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm hover:text-brand-primary transition-all relative">
                <Activity size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-brand-primary rounded-full border-2 border-white" />
              </button>
              <button className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm hover:text-brand-primary transition-all">
                <Settings size={20} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg overflow-hidden">
                <User size={24} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && MetricsView()}
              {activeTab === 'agenda' && AgendaView()}
              {activeTab === 'pacientes' && PatientsView()}
              {activeTab === 'historial' && userRole === 'admin' && ClinicalHistoryView()}
              {activeTab === 'perfil' && ProfileView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-8 right-8 bg-brand-primary text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="font-bold text-sm">Operación Exitosa</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Base de datos actualizada</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Popup */}
      <AnimatePresence>
        {showInstallPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-96 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-8 z-[100] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-primary" />
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-slate-100 overflow-hidden">
                <img 
                  src="https://w7.pngwing.com/pngs/590/717/png-transparent-medicine-medical-purple-violet-logo.png" 
                  alt="App Icon" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-tight">Instalar Aplicación</h4>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Medico Cirujano</p>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">Accede más rápido y trabaja sin conexión instalando el dashboard en tu dispositivo.</p>
                
                <div className="flex items-center gap-3 mt-6">
                  <button 
                    onClick={() => setShowInstallPopup(false)}
                    className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Después
                  </button>
                  <button 
                    onClick={handleInstallClick}
                    className="flex-[2] py-3 bg-brand-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all active:scale-95"
                  >
                    Instalar Ahora
                  </button>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallPopup(false)}
              className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
