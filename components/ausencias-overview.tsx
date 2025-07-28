import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";
import { AusenciasModal } from "./AusenciasModal";
import { AusenciasPorPuestoModal } from "./AusenciasPorPuestoModal";
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

// Estilos para line-clamp
const lineClampStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis' as const,
};

interface DateRange {
  from: string;
  to: string;
}

interface AusenciasOverviewProps {
  dateRange: DateRange;
}

export function AusenciasOverview({ dateRange: _dateRange }: AusenciasOverviewProps) {
  const { ausencias, totalAusencias, promedioDiasAusencia, tiposAusencia } = useData();
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [ausenciasPorClienteSeleccionado, setAusenciasPorClienteSeleccionado] = useState<typeof ausencias>([]);

  // Calcular métricas
  const ausenciasPorTipo = ausencias.reduce<Record<string, number>>((acc, ausencia) => {
    acc[ausencia.tipo_ausencia] = (acc[ausencia.tipo_ausencia] || 0) + 1;
    return acc;
  }, {});

  // Asegurar que todos los tipos de la DB aparezcan, incluso con 0
  tiposAusencia.forEach(tipo => {
    if (!ausenciasPorTipo[tipo]) {
      ausenciasPorTipo[tipo] = 0;
    }
  });

  const ausenciasPorProyecto = ausencias.reduce<Record<string, number>>((acc, ausencia) => {
    acc[ausencia.proyecto] = (acc[ausencia.proyecto] || 0) + 1;
    return acc;
  }, {});

  // Asegurar que todos los proyectos aparezcan, incluso con 0 ausencias
  const proyectosDisponibles = ['BARRANQUILLA', 'CARTAGENA'];
  proyectosDisponibles.forEach(proyecto => {
    if (!ausenciasPorProyecto[proyecto]) {
      ausenciasPorProyecto[proyecto] = 0;
    }
  });

  const handleProyectoClick = (proyecto: string) => {
    const ausenciasDelProyecto = ausencias.filter(ausencia => ausencia.proyecto === proyecto);
    console.log(`Ausencias filtradas para ${proyecto}:`, ausenciasDelProyecto);
    console.log(`Clientes únicos en ${proyecto}:`, [...new Set(ausenciasDelProyecto.map(ausencia => ausencia.cliente))]);
    setClienteSeleccionado(proyecto);
    setAusenciasPorClienteSeleccionado(ausenciasDelProyecto);
    setClienteModalOpen(true);
  };

  const metrics = [
    {
      title: "Total de ausencias",
      value: totalAusencias.toString(),
      icon: Users,
      description: "Ausencias registradas en el período",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Promedio días por ausencia",
      value: promedioDiasAusencia.toFixed(1),
      icon: Clock,
      description: "Días promedio por ausencia",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Información de Ausencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-1.5 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-gray-900 mb-1">{metric.value}</p>
                    <p className="text-xs font-medium text-gray-600 mb-1 leading-tight" style={lineClampStyle}>{metric.title}</p>
                    <p className="text-xs text-gray-500 leading-tight" style={lineClampStyle}>{metric.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de tipos de ausencia */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold mb-3">Distribución por tipo de ausencia</h3>
              {Object.keys(ausenciasPorTipo).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(ausenciasPorTipo)
                    .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                    .map(([tipo, count], index) => (
                      <div key={tipo} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{tipo}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: count > 0 ? `${(count / totalAusencias) * 100}%` : '0%',
                                backgroundColor: count > 0 ? getColorByIndex(index) : '#d1d5db'
                              }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No hay datos de ausencias para mostrar</p>
              )}
            </div>

            {/* Gráfico de proyectos */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h3 className="text-base font-semibold mb-3">Ausencias por proyecto</h3>
              <div className="space-y-2">
                {Object.entries(ausenciasPorProyecto)
                  .sort(([a], [b]) => a.localeCompare(b)) // Ordenar alfabéticamente
                  .map(([proyecto, count], index) => (
                    <div 
                      key={proyecto} 
                      className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                        count > 0 ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'
                      }`}
                      onClick={() => count > 0 ? handleProyectoClick(proyecto) : null}
                    >
                      <span className={`text-sm ${count > 0 ? 'text-gray-600' : 'text-gray-400'}`}>{proyecto}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: count > 0 ? `${(count / totalAusencias) * 100}%` : '0%',
                              backgroundColor: count > 0 ? getColorByIndex(index) : '#d1d5db'
                            }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${count > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal para mostrar todas las ausencias */}
      <AusenciasModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ausencias={ausencias}
        titulo={`Todas las ausencias (${totalAusencias})`}
      />

      {/* Modal para mostrar ausencias por puesto del cliente */}
      <AusenciasPorPuestoModal
        open={clienteModalOpen}
        onOpenChange={setClienteModalOpen}
        ausencias={ausenciasPorClienteSeleccionado}
        proyecto={clienteSeleccionado}
      />
    </div>
  );
} 