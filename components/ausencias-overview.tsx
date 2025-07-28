import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { DonutChart } from "./ui/donut-chart";
import { AusenciasModal } from "./AusenciasModal";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [barranquillaResp, cartagenaResp] = await Promise.all([
          fetch(`/api/ausencias/barranquilla?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/ausencias/cartagena?from=${dateRange.from}&to=${dateRange.to}`),
        ]);

        const [barranquillaData, cartagenaData] = await Promise.all([
          barranquillaResp.json(),
          cartagenaResp.json(),
        ]);

        console.log("Barranquilla Ausencias Data:", barranquillaData);
        console.log("Cartagena Ausencias Data:", cartagenaData);

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

  const ausenciasPorProyecto = ausencias.reduce<Record<string, number>>((acc, ausencia) => {
    acc[ausencia.proyecto] = (acc[ausencia.proyecto] || 0) + 1;
    return acc;
  }, {});

  const topTipoAusencia = Object.entries(ausenciasPorTipo).reduce(
    (max, [tipo, count]) => (count > max.count ? { tipo, count } : max),
    { tipo: "Ninguna", count: 0 }
  );

  const promedioDiasAusencia = totalAusencias > 0 ? (totalDiasAusencia / totalAusencias).toFixed(1) : "0";

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
      title: "Total días de ausencia",
      value: totalDiasAusencia.toString(),
      icon: CalendarDays,
      description: "Días totales de ausencia",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Promedio días por ausencia",
      value: promedioDiasAusencia,
      icon: Clock,
      description: "Días promedio por ausencia",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Tipo más frecuente",
      value: `${topTipoAusencia.tipo} (${topTipoAusencia.count})`,
      icon: TrendingUp,
      description: "Tipo de ausencia más común",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {Object.entries(ausenciasPorTipo).map(([tipo, count]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{tipo}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(count / totalAusencias) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
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
                  <div key={proyecto} className="flex items-center justify-between">
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

      {/* Lista de ausencias recientes */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Ausencias recientes</CardTitle>
            {totalAusencias > 5 && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-sm text-blue-500 hover:text-blue-700 hover:underline"
              >
                Ver todas
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="max-h-[25rem] overflow-y-auto">
          <div className="space-y-4">
            {ausencias.length > 0 ? (
              ausencias
                .sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime())
                .slice(0, 5)
                .map((ausencia, index) => (
                  <div key={`${ausencia.id_ausencia}-${ausencia.proyecto}-${index}`} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {ausencia.colaborador} - {ausencia.tipo_ausencia}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {ausencia.fecha_inicio} a {ausencia.fecha_fin} ({ausencia.duracion_dias} días)
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {ausencia.puesto} • {ausencia.proyecto}
                      </p>
                      {ausencia.descripcion && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {ausencia.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500">No hay ausencias para mostrar.</p>
            )}
            {totalAusencias > 5 && (
              <p 
                className="text-center text-blue-500 text-sm hover:underline cursor-pointer"
                onClick={() => setModalOpen(true)}
              >
                Ver todas las {totalAusencias} ausencias
              </p>
            )}
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
    </div>
  );
} 