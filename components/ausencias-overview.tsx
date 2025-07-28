import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { AusenciasModal } from "./AusenciasModal";
import { AusenciasPorPuestoModal } from "./AusenciasPorPuestoModal";

// Estilos para line-clamp
const lineClampStyle = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis' as const,
};

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

interface DateRange {
  from: string;
  to: string;
}

interface AusenciasOverviewProps {
  dateRange: DateRange;
}

export function AusenciasOverview({ dateRange }: AusenciasOverviewProps) {
  const [ausencias, setAusencias] = useState<Ausencia[]>([]);
  const [totalAusencias, setTotalAusencias] = useState(0);
  const [totalDiasAusencia, setTotalDiasAusencia] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteModalOpen, setClienteModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  const [ausenciasPorClienteSeleccionado, setAusenciasPorClienteSeleccionado] = useState<Ausencia[]>([]);
  const [tiposAusencia, setTiposAusencia] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barranquillaResp, cartagenaResp, tiposResp] = await Promise.all([
          fetch(`/api/ausencias/barranquilla?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/ausencias/cartagena?from=${dateRange.from}&to=${dateRange.to}`),
          fetch('/api/ausencias/tipos'),
        ]);

        const [barranquillaData, cartagenaData, tiposData] = await Promise.all([
          barranquillaResp.json(),
          cartagenaResp.json(),
          tiposResp.json(),
        ]);

        console.log("Barranquilla Ausencias Data:", barranquillaData);
        console.log("Cartagena Ausencias Data:", cartagenaData);
        console.log("Tipos de ausencia:", tiposData);

        const allAusencias = [
          ...(barranquillaData.data || []),
          ...(cartagenaData.data || []),
        ];

        // Eliminar duplicados basándose en id_ausencia y proyecto
        const uniqueAusencias = allAusencias.filter((ausencia, index, self) => 
          index === self.findIndex(a => 
            a.id_ausencia === ausencia.id_ausencia && a.proyecto === ausencia.proyecto
          )
        );

        console.log("Total ausencias antes de eliminar duplicados:", allAusencias.length);
        console.log("Total ausencias después de eliminar duplicados:", uniqueAusencias.length);

        console.log("All Ausencias in AusenciasOverview:", uniqueAusencias);
        setAusencias(uniqueAusencias);
        setTotalAusencias(uniqueAusencias.length);
        setTotalDiasAusencia(uniqueAusencias.reduce((total, ausencia) => total + ausencia.duracion_dias, 0));
        setTiposAusencia(tiposData.data || []);
      } catch (error) {
        console.error("Error al obtener datos de ausencias:", error);
      }
    };

    fetchData();
  }, [dateRange]);

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

  const promedioDiasAusencia = totalAusencias > 0 ? (totalDiasAusencia / totalAusencias).toFixed(1) : "0";

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
      value: promedioDiasAusencia,
      icon: Clock,
      description: "Días promedio por ausencia",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</p>
                    <p className="text-xs font-medium text-gray-600 mb-1 leading-tight" style={lineClampStyle}>{metric.title}</p>
                    <p className="text-xs text-gray-500 leading-tight" style={lineClampStyle}>{metric.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tipos de ausencia */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Distribución por tipo de ausencia</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(ausenciasPorTipo).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(ausenciasPorTipo)
                  .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                  .map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{tipo}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              count > 0 ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            style={{ width: count > 0 ? `${(count / totalAusencias) * 100}%` : '0%' }}
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
          </CardContent>
        </Card>

        {/* Gráfico de proyectos */}
        <Card className="bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Ausencias por proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(ausenciasPorProyecto).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(ausenciasPorProyecto).map(([proyecto, count]) => (
                  <div 
                    key={proyecto} 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    onClick={() => handleProyectoClick(proyecto)}
                  >
                    <span className="text-sm text-gray-600">{proyecto}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(count / totalAusencias) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No hay datos de proyectos para mostrar</p>
            )}
          </CardContent>
        </Card>
      </div>



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