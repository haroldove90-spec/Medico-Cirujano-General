export interface MedicalAnalysis {
  resumenEjecutivo: string;
  signosYSintomas: {
    signo: string;
    valor: string;
    estado: 'normal' | 'alerta' | 'critico';
  }[];
  jsonEstructurado: any;
  conductaSugerida: string;
  riesgos: {
    asa: string;
    goldman: string;
    caprini: string;
    justificacion: string;
  };
  datosFaltantes: string[];
}

export interface PatientData {
  nombre?: string;
  edad?: number;
  sexo?: string;
  antecedentes: string[];
  alergias: string[];
  signosVitales: {
    ta?: string;
    fc?: number;
    fr?: number;
    temp?: number;
    satO2?: number;
  };
  laboratorios: Record<string, any>;
  cuadroClinico: string;
  tiempoAyuno?: string;
}
