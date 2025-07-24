import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, AlertTriangle, CheckCircle } from "lucide-react";

interface Novedad {
  fecha: string;
  tipo: string;
  valor: number;
  proyecto: string;
  usuario: string;
  descripcion: string;
  gestion: string;
  critico: boolean;
  consecutivo: number;
}

interface DateRange {
  from: string;
  to: string;
}

interface Order {
  icon: React.ElementType;
  title: string;
  time: string;
  status: string;
  color: string;
  description: string;
}

interface OrdersOverviewProps {
  dateRange: DateRange;
}

export function OrdersOverview({ dateRange }: OrdersOverviewProps) {
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [totalNovedades, setTotalNovedades] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartagenaResp, barranquillaResp, cementosResp, argosResp] = await Promise.all([
          fetch(`/api/novedades/cartagena?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/barranquilla?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/cementos?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/grupo-argos?from=${dateRange.from}&to=${dateRange.to}`),
        ]);

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

        console.log("All Novedades in OrdersOverview:", allNovedades);
        setNovedades(allNovedades);
        setTotalNovedades(allNovedades.length);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [dateRange]);

  const orders: Order[] = novedades
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5)
    .map(nov => ({
      icon: nov.critico ? AlertTriangle : CheckCircle,
      title: `${nov.proyecto} - ${nov.tipo.trim()}`,
      time: nov.fecha,
      status: nov.gestion ? "Gestionada" : "Pendiente",
      color: nov.critico ? "text-red-500" : "text-green-500",
      description: nov.descripcion,
    }));

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Resumen de novedades</CardTitle>
        <p className="text-sm text-gray-600 flex items-center">
          <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
          <span className="font-semibold">{totalNovedades}</span> novedades este período
        </p>
      </CardHeader>
      <CardContent className="max-h-[25rem] overflow-y-auto">
        <div className="space-y-4">
          {orders.length > 0 ? (
            orders.map((order, index) => {
              const Icon = order.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${order.color} bg-opacity-10`}>
                    <Icon className={`h-4 w-4 ${order.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{order.title}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      {order.time} <span className={`ml-2 text-xs ${order.color}`}>{order.status}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-3">{order.description}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No hay novedades para mostrar.</p>
          )}
          {totalNovedades > 5 && (
            <p className="text-center text-blue-500 text-sm hover:underline cursor-pointer">
              Ver todas las {totalNovedades} novedades
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}