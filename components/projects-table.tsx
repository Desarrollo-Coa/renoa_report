"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, MoreHorizontal } from "lucide-react";
import { NovedadesModal } from "@/components/NovedadesModal";
import Image from "next/image";
import { useData } from "@/lib/contexts/DataContext";

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

// Función para obtener el logo del proyecto
const getProjectLogo = (proyecto: string): string => {
  switch (proyecto) {
    case "GRUPO ARGOS":
      return "/img/GA.jpeg";
    case "CEMENTOS":
      return "/img/CEMENTO.jpeg";
    case "BARRANQUILLA":
      return "/img/BARRANQUILLA.jpeg";
    case "CARTAGENA":
      return "/img/CARTAGENA.jpeg";
    default:
      return "/img/globe.svg";
  }
};

interface DateRange {
  from: string;
  to: string;
}

interface ProjectsTableProps {
  dateRange: DateRange;
} 

export function ProjectsTable({ dateRange: _dateRange }: ProjectsTableProps) {
  const { novedades } = useData();
  const [showModal, setShowModal] = useState(false);
  const [eventosSeleccionados, setEventosSeleccionados] = useState<typeof novedades>([]);

  // Calcular datos de proyectos usando useMemo
  const projectsData = useMemo(() => {
    const projectsMap = new Map<string, { cantidad: number; negocios: Set<string> }>();

    // Inicializar todos los proyectos disponibles
    const proyectosDisponibles = ['GRUPO ARGOS', 'CEMENTOS', 'BARRANQUILLA', 'CARTAGENA'];
    proyectosDisponibles.forEach(proyecto => {
      projectsMap.set(proyecto, { cantidad: 0, negocios: new Set() });
    });

    // Contar novedades por proyecto
    novedades.forEach(novedad => {
      const proyecto = novedad.proyecto;
      if (projectsMap.has(proyecto)) {
        const projectData = projectsMap.get(proyecto)!;
        projectData.cantidad++;
        if (novedad.cliente) {
          projectData.negocios.add(novedad.cliente);
        }
      }
    });

    const totalNovedades = novedades.length;
    return Array.from(projectsMap.entries()).map(([proyecto, data]) => ({
      proyecto,
      cantidadEventos: data.cantidad,
      porcentaje: totalNovedades > 0 ? (data.cantidad / totalNovedades) * 100 : 0,
      logo: getProjectLogo(proyecto),
      negocios: Array.from(data.negocios)
    }));
  }, [novedades]);

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
                    className={`border-b border-gray-100 ${
                      project.cantidadEventos > 0 
                        ? 'hover:bg-gray-50 cursor-pointer' 
                        : 'opacity-60'
                    }`}
                    onClick={() => project.cantidadEventos > 0 ? handleRowClick(project.proyecto) : null}
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
                        <span className={`font-medium ${
                          project.cantidadEventos > 0 ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {project.proyecto}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center">
                        <div className="w-24">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-semibold ${
                              project.cantidadEventos > 0 ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {project.porcentaje.toFixed(2)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${project.porcentaje}%`,
                                backgroundColor: project.cantidadEventos > 0 ? getColorByIndex(index) : '#d1d5db'
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