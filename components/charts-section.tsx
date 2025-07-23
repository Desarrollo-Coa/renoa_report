"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Legend,
  LineChart,
  Line,
  TooltipProps,
} from "recharts";
import { NovedadesModal } from "./NovedadesModal";

interface Novedad {
  id_novedad: number;
  fecha: string;
  tipo: string;
  valor: number;
  proyecto: string;
  usuario: string;
  descripcion: string;
  gestion: string;
  critico: boolean;
  consecutivo: number | string;
  imagenes: { id_imagen?: number; id_archivo?: number; url_imagen?: string; url_archivo?: string; fecha_subida: string; nombre_archivo?: string }[];
}

interface ProyectoData {
  proyecto: string;
  cantidad: number;
}

interface FechaData {
  fecha: string;
  valor: number;
}

interface TipoData {
  tipo: string;
  cantidad: number;
}

interface CustomTooltipPayload {
  payload: ProyectoData | FechaData | TipoData;
  value: number;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  payload?: CustomTooltipPayload[];
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">
          {"proyecto" in data ? data.proyecto : "tipo" in data ? data.tipo : data.fecha}
        </p>
        <p className="text-gray-600">{`Valor: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
 

const getDateRange = (start: string, end: string): string[] => {
  const dates = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

interface ChartsSectionProps {
  dateRange: { from: string; to: string };
}

export function ChartsSection({ dateRange }: ChartsSectionProps) {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [eventosSeleccionados, setEventosSeleccionados] = useState<Novedad[]>([]);
  const [modalTitulo, setModalTitulo] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartagenaResp, barranquillaResp, cementosResp, argosResp] = await Promise.all([
          fetch(`/api/novedades/cartagena?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/barranquilla?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/cementos?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/grupo-argos?from=${dateRange.from}&to=${dateRange.to}`),
        ]);

        if (!cartagenaResp.ok || !barranquillaResp.ok || !cementosResp.ok || !argosResp.ok) {
          throw new Error("Una o más respuestas de la API fallaron");
        }

        const [cartagenaData, barranquillaData, cementosData, argosData] = await Promise.all([
          cartagenaResp.json(),
          barranquillaResp.json(),
          cementosResp.json(),
          argosResp.json(),
        ]);

        console.log("Cartagena Data:", cartagenaData);
        console.log("Barranquilla Data:", barranquillaData);
        console.log("Cementos Data:", cementosData);
        console.log("Argos Data:", argosData);

        const allNovedades = [
          ...(cartagenaData.data || []),
          ...(barranquillaData.data || []),
          ...(cementosData.data || []),
          ...(argosData.data || []),
        ];

        console.log("All Novedades in ChartsSection:", allNovedades);
        setNovedades(allNovedades);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNovedades([]);
      }
    };

    fetchData();
  }, [dateRange]);

  const dataPorProyecto = useMemo<ProyectoData[]>(() => {
    const eventos: Record<string, number> = {};
    for (const nov of novedades) {
      eventos[nov.proyecto] = (eventos[nov.proyecto] || 0) + 1;
    }
    return Object.entries(eventos).map(([proyecto, cantidad]) => ({
      proyecto,
      cantidad,
    }));
  }, [novedades]);

  const dataPorFecha = useMemo<FechaData[]>(() => {
    const allDates = getDateRange(dateRange.from, dateRange.to);
    const fechaCounts: Record<string, number> = {};
    for (const nov of novedades) {
      fechaCounts[nov.fecha] = (fechaCounts[nov.fecha] || 0) + nov.valor;
    }
    return allDates.map((fecha) => ({
      fecha,
      valor: fechaCounts[fecha] || 0,
    }));
  }, [novedades, dateRange]);

  const dataPorTipo = useMemo<TipoData[]>(() => {
    const tipos: Record<string, number> = {};
    for (const nov of novedades) {
      tipos[nov.tipo] = (tipos[nov.tipo] || 0) + 1;
    }
    return Object.entries(tipos).map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
    }));
  }, [novedades]);

  const maxProyecto = dataPorProyecto.length > 0 ? Math.max(...dataPorProyecto.map((d) => d.cantidad)) * 1.3 : 1;
  const maxFecha = dataPorFecha.length > 0 ? Math.max(...dataPorFecha.map((d) => d.valor)) * 1.3 : 1;
  const maxTipo = dataPorTipo.length > 0 ? Math.max(...dataPorTipo.map((d) => d.cantidad)) * 1.3 : 1;

  const handleProyectoClick = (data: ProyectoData) => {
    const selectedNovedades = novedades.filter((nov) => nov.proyecto === data.proyecto);
    setEventosSeleccionados(selectedNovedades);
    setModalTitulo(`Novedades de ${data.proyecto}`);
    setShowModal(true);
  };

  const handleFechaClick = (data: FechaData) => {
    const selectedNovedades = novedades.filter((nov) => nov.fecha === data.fecha);
    setEventosSeleccionados(selectedNovedades);
    setModalTitulo(`Novedades del ${data.fecha.split('-').reverse().join('/')}`);
    setShowModal(true);
  };

  const handleTipoClick = (data: TipoData) => {
    const selectedNovedades = novedades.filter((nov) => nov.tipo === data.tipo);
    setEventosSeleccionados(selectedNovedades);
    setModalTitulo(`Novedades de tipo ${data.tipo}`);
    setShowModal(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white shadow-lg rounded-xl border border-gray-100">
          <CardHeader className="pb-2 px-6 pt-4">
            <CardTitle className="text-xl font-bold text-gray-800">Novedades por Proyecto</CardTitle>
            <p className="text-sm text-gray-500">Distribución de eventos por proyecto</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataPorProyecto}
                  layout="vertical"
                  onClick={(data) => {
                    if (data && data.activeLabel) {
                      const proyectoData = dataPorProyecto.find(d => d.proyecto === data.activeLabel);
                      if (proyectoData) handleProyectoClick(proyectoData);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#6b7280" }} domain={[0, Math.ceil(maxProyecto)]} />
                  <YAxis dataKey="proyecto" type="category" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#6b7280" }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} animationDuration={1000}>
                    <LabelList dataKey="cantidad" position="right" fontSize={12} fill="#374151" angle={0} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <hr className="border-gray-200 mb-2" />
          
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-xl border border-gray-100">
          <CardHeader className="pb-2 px-6 pt-4">
            <CardTitle className="text-xl font-bold text-gray-800">Novedad por Día</CardTitle>
            <p className="text-sm text-gray-500">Progresión diaria de novedades</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dataPorFecha}
                  onClick={(event) => {
                    if (event && event.activeLabel) {
                      const fechaData = dataPorFecha.find(d => d.fecha === event.activeLabel);
                      if (fechaData) handleFechaClick(fechaData);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fecha" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#6b7280" }} tickFormatter={(date) => date} angle={-45} textAnchor="end" height={70} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#6b7280" }} domain={[0, Math.ceil(maxFecha)]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} activeDot={{ r: 6 }} animationDuration={1000} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <hr className="border-gray-200 mb-2" />
         
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg rounded-xl border border-gray-100">
          <CardHeader className="pb-2 px-6 pt-4">
            <CardTitle className="text-xl font-bold text-gray-800">Tipos de Novedades</CardTitle>
            <p className="text-sm text-gray-500">Distribución por tipo de evento</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataPorTipo}
                  layout="horizontal"
                  onClick={(data) => {
                    if (data && data.activeLabel) {
                      const tipoData = dataPorTipo.find(d => d.tipo === data.activeLabel);
                      if (tipoData) handleTipoClick(tipoData);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="tipo" type="category" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#6b7280" }} angle={-45} textAnchor="end" height={50} />
                  <YAxis type="number" allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#6b7280" }} domain={[0, Math.ceil(maxTipo)]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#8b5cf6" radius={[4, 4, 0, 0]} animationDuration={1000}>
                    <LabelList dataKey="cantidad" position="top" fontSize={12} fill="#374151" angle={0} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <hr className="border-gray-200 mb-2" />
          
          </CardContent>
        </Card>
      </div>

      <NovedadesModal
        open={showModal}
        onOpenChange={setShowModal}
        eventosSeleccionados={eventosSeleccionados}
        titulo={modalTitulo}
      />
    </>
  );
}
