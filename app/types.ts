// app/types.ts
export interface Novedad {
  id_novedad: number;
  fecha: string;
  tipo: string;
  usuario: string;
  descripcion: string;
  gestion: string;
  critico: boolean;
  consecutivo: string | number;
  proyecto: string;
  puesto: string;
  cliente: string;
  imagenes: {
    id_imagen?: number;
    id_archivo?: number;
    url_imagen?: string;
    url_archivo?: string;
    fecha_subida: string;
    nombre_archivo?: string;
  }[];
}

export interface DateRange {
  from: string;
  to: string;
}

export interface ProyectoData {
  proyecto: string;
  cantidad: number;
}

export interface FechaData {
  fecha: string;
  valor: number;
}

export interface TipoData {
  tipo: string;
  cantidad: number;
}

export interface DonutData {
  label: string;
  value: number;
}