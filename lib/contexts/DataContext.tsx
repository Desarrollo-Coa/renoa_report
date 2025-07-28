"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DateRange {
  from: string;
  to: string;
}

interface Ausencia {
  id_ausencia: number;
  fecha_inicio: string;
  fecha_fin: string;
  descripcion: string;
  tipo_ausencia: string;
  colaborador: string;
  puesto: string;
  usuario_registro: string;
  fecha_registro: string;
  proyecto: string;
  duracion_dias: number;
  cliente: string;
}

interface Novedad {
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
  valor: number; 
  imagenes: {
    id_imagen?: number;
    id_archivo?: number;
    url_imagen?: string;
    url_archivo?: string;
    fecha_subida: string;
    nombre_archivo?: string;
  }[];
}

interface DataContextType {
  // Datos
  ausencias: Ausencia[];
  novedades: Novedad[];
  tiposAusencia: string[];
  
  // Estados de carga
  loading: boolean;
  error: string | null;
  
  // Métricas calculadas
  totalAusencias: number;
  totalNovedades: number;
  promedioDiasAusencia: number;
  
  // Funciones
  refetchData: (dateRange: DateRange) => Promise<void>;
  updateDateRange: (dateRange: DateRange) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  initialDateRange: DateRange;
}

export function DataProvider({ children, initialDateRange }: DataProviderProps) {
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [tiposAusencia, setTiposAusencia] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setDateRange] = useState(initialDateRange);

  const fetchAllData = async (range: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      // Peticiones paralelas para mejor rendimiento
      const [
        barranquillaResp, 
        cartagenaResp, 
        tiposResp,
        novedadesBarranquillaResp,
        novedadesCartagenaResp,
        novedadesCementosResp,
        novedadesGrupoArgosResp
      ] = await Promise.all([
        fetch(`/api/ausencias/barranquilla?from=${range.from}&to=${range.to}`),
        fetch(`/api/ausencias/cartagena?from=${range.from}&to=${range.to}`),
        fetch('/api/ausencias/tipos'),
        fetch(`/api/novedades/barranquilla?from=${range.from}&to=${range.to}`),
        fetch(`/api/novedades/cartagena?from=${range.from}&to=${range.to}`),
        fetch(`/api/novedades/cementos?from=${range.from}&to=${range.to}`),
        fetch(`/api/novedades/grupo-argos?from=${range.from}&to=${range.to}`)
      ]);

      const [
        barranquillaData,
        cartagenaData,
        tiposData,
        novedadesBarranquillaData,
        novedadesCartagenaData,
        novedadesCementosData,
        novedadesGrupoArgosData
      ] = await Promise.all([
        barranquillaResp.json(),
        cartagenaResp.json(),
        tiposResp.json(),
        novedadesBarranquillaResp.json(),
        novedadesCartagenaResp.json(),
        novedadesCementosResp.json(),
        novedadesGrupoArgosResp.json()
      ]);

      // Procesar ausencias
      const allAusencias = [
        ...(barranquillaData.data || []),
        ...(cartagenaData.data || [])
      ];

      // Eliminar duplicados de ausencias
      const uniqueAusencias = allAusencias.filter((ausencia, index, self) => 
        index === self.findIndex(a => 
          a.id_ausencia === ausencia.id_ausencia && a.proyecto === ausencia.proyecto
        )
      );

      // Procesar novedades
      const allNovedades = [
        ...(novedadesBarranquillaData.data || []),
        ...(novedadesCartagenaData.data || []),
        ...(novedadesCementosData.data || []),
        ...(novedadesGrupoArgosData.data || [])
      ];

      // Eliminar duplicados de novedades
      const uniqueNovedades = allNovedades.filter((novedad, index, self) => 
        index === self.findIndex(n => 
          n.id_novedad === novedad.id_novedad && n.proyecto === novedad.proyecto
        )
      );

      setAusencias(uniqueAusencias);
      setNovedades(uniqueNovedades);
      setTiposAusencia(tiposData.data || []);
      setDateRange(range);
      
    } catch (err) {
      console.error("Error al obtener datos:", err);
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchAllData(initialDateRange);
  }, [initialDateRange]);

  // Calcular métricas
  const totalAusencias = ausencias.length;
  const totalNovedades = novedades.length;
  const totalDiasAusencia = ausencias.reduce((total, ausencia) => total + ausencia.duracion_dias, 0);
  const promedioDiasAusencia = totalAusencias > 0 ? (totalDiasAusencia / totalAusencias) : 0;

  const updateDateRange = (newDateRange: DateRange) => {
    fetchAllData(newDateRange);
  };

  const value: DataContextType = {
    ausencias,
    novedades,
    tiposAusencia,
    loading,
    error,
    totalAusencias,
    totalNovedades,
    promedioDiasAusencia,
    refetchData: fetchAllData,
    updateDateRange
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
} 