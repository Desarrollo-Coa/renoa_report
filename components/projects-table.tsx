"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, MoreHorizontal } from "lucide-react";
import { NovedadesModal } from "@/components/NovedadesModal";
import Image from "next/image";

// Paleta de colores para las barras de progreso
const colorPalette = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f43f5e', // rose-500
];

// Función para obtener color por índice
const getColorByIndex = (index: number): string => {
  return colorPalette[index % colorPalette.length];
};

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
  imagenes: {
    id_imagen?: number;
    id_archivo?: number;
    url_imagen?: string;
    url_archivo?: string;
    fecha_subida: string;
    nombre_archivo?: string;
  }[];
}

interface DateRange {
  from: string;
  to: string;
}

interface Project {
  proyecto: string;
  cantidadEventos: number;
  porcentaje: number;
  logo: string;
  negocios: string[];
}

interface ProjectsTableProps {
  dateRange: DateRange;
} 

export function ProjectsTable({ dateRange }: ProjectsTableProps) {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [eventosSeleccionados, setEventosSeleccionados] = useState<Novedad[]>([]);

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

        const totalEventos =
          (cartagenaData.data?.length || 0) +
          (barranquillaData.data?.length || 0) +
          (cementosData.data?.length || 0) +
          (argosData.data?.length || 0);

        const newProjectsData: Project[] = [
          {
            proyecto: "GRUPO ARGOS",
            cantidadEventos: argosData.data?.length || 0,
            porcentaje: totalEventos > 0 ? ((argosData.data?.length || 0) / totalEventos) * 100 : 0,
            logo: "/img/GA.jpeg",
            negocios: ["S", "B", "NDU"],
          },
          {
            proyecto: "CEMENTOS",
            cantidadEventos: cementosData.data?.length || 0,
            porcentaje: totalEventos > 0 ? ((cementosData.data?.length || 0) / totalEventos) * 100 : 0,
            logo: "/img/CEMENTO.jpeg",
            negocios: ["ZN", "ZC", "ZNO", "ZS"],
          },
          {
            proyecto: "BARRANQUILLA",
            cantidadEventos: barranquillaData.data?.length || 0,
            porcentaje: totalEventos > 0 ? ((barranquillaData.data?.length || 0) / totalEventos) * 100 : 0,
            logo: "/img/BARRANQUILLA.jpeg",
            negocios: ["D", "F", "C"],
          },
          {
            proyecto: "CARTAGENA",
            cantidadEventos: cartagenaData.data?.length || 0,
            porcentaje: totalEventos > 0 ? ((cartagenaData.data?.length || 0) / totalEventos) * 100 : 0,
            logo: "/img/CARTAGENA.jpeg",
            negocios: ["O", "L", "P"],
          },
        ];

        console.log("Projects Data:", newProjectsData);
        setProjectsData(newProjectsData);
        setNovedades(allNovedades);
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setProjectsData([]);
        setNovedades([]);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleRowClick = (proyecto: string) => {
    const selectedNovedades = novedades.filter((nov) => nov.proyecto === proyecto);
    setEventosSeleccionados(selectedNovedades);
    setShowModal(true);
  };

  return (
    <>
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Check className="h-4 w-4 text-blue-500 mr-1" />
                  Novedades por proyecto
                </div>
              </CardTitle>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  {/* <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Negocios
                  </th>
                  <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Cantidad de Novedades
                  </th> */}
                  <th className="text-center py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Porcentaje
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectsData.map((project, index) => (
                  <tr
                    key={project.proyecto}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(project.proyecto)}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <Image
                          src={project.logo || "/placeholder.svg"}
                          alt={project.proyecto}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span className="font-medium text-gray-900">{project.proyecto}</span>
                      </div>
                    </td>
                    {/* <td className="py-4 px-6">
                      <div className="flex -space-x-2">
                        {project.negocios.slice(0, 4).map((negocio, negocioIndex) => (
                          <Avatar key={negocioIndex} className="w-8 h-8 border-2 border-white">
                            <AvatarFallback className="text-xs">{negocio}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`text-sm font-semibold ${getEventColor(project.cantidadEventos)} cursor-pointer hover:underline`}
                        onClick={() => handleRowClick(project.proyecto)}
                      >
                        {project.cantidadEventos}
                      </span>
                    </td> */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-900">{project.porcentaje.toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${project.porcentaje}%`,
                                backgroundColor: getColorByIndex(index)
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NovedadesModal
        open={showModal}
        onOpenChange={setShowModal}
        eventosSeleccionados={eventosSeleccionados}
        titulo={`Novedades de ${eventosSeleccionados[0]?.proyecto || 'Proyecto'}`}
      />
    </>
  );
}