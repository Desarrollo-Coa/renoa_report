"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

interface AusenciasPorPuestoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ausencias: Ausencia[];
  proyecto: string; // Cambio de 'cliente' a 'proyecto' para mayor claridad
}

export function AusenciasPorPuestoModal({
  open,
  onOpenChange,
  ausencias,
  proyecto,
}: AusenciasPorPuestoModalProps) {
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('');
  
  // Calcular clientes únicos del proyecto
  const clientesUnicos = [...new Set(ausencias.map(ausencia => ausencia.cliente))];
  
  console.log(`Modal abierto para proyecto: ${proyecto}`);
  console.log(`Total ausencias recibidas: ${ausencias.length}`);
  console.log(`Clientes únicos encontrados:`, clientesUnicos);
  
  // Calcular ausencias por cliente
  const ausenciasPorCliente = ausencias.reduce<Record<string, number>>((acc, ausencia) => {
    acc[ausencia.cliente] = (acc[ausencia.cliente] || 0) + 1;
    return acc;
  }, {});

  // Calcular ausencias por puesto del cliente seleccionado
  const ausenciasPorPuesto = clienteSeleccionado 
    ? ausencias
        .filter(ausencia => ausencia.cliente === clienteSeleccionado)
        .reduce<Record<string, number>>((acc, ausencia) => {
          acc[ausencia.puesto] = (acc[ausencia.puesto] || 0) + 1;
          return acc;
        }, {})
    : {};

  const totalAusencias = ausencias.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[90vw] max-w-4xl max-h-[70dvh] overflow-y-auto p-4 sm:p-6
          md:w-[80vw] md:max-w-5xl
          lg:max-w-6xl
          xl:max-w-7xl
          [@media(max-width:640px)]:w-full [@media(max-width:640px)]:max-h-[90vh]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Ausencias por cliente y puesto - {proyecto} ({totalAusencias})
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de clientes */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Clientes de {proyecto}</CardTitle>
            </CardHeader>
            <CardContent>
              {clientesUnicos.length > 0 ? (
                <div className="space-y-3">
                  {clientesUnicos.map((clienteItem) => (
                    <div 
                      key={clienteItem}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        clienteSeleccionado === clienteItem 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setClienteSeleccionado(clienteItem)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{clienteItem}</span>
                        <span className="text-sm font-bold text-gray-900">{ausenciasPorCliente[clienteItem]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${(ausenciasPorCliente[clienteItem] / totalAusencias) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No hay clientes para mostrar</p>
              )}
            </CardContent>
          </Card>

          {/* Puestos del cliente seleccionado */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">
                {clienteSeleccionado ? `Puestos - ${clienteSeleccionado}` : 'Selecciona un cliente'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clienteSeleccionado && Object.keys(ausenciasPorPuesto).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(ausenciasPorPuesto)
                    .sort(([,a], [,b]) => b - a) // Ordenar por cantidad descendente
                    .map(([puesto, count]) => (
                      <div key={puesto} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{puesto}</span>
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${(count / ausenciasPorCliente[clienteSeleccionado]) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {((count / ausenciasPorCliente[clienteSeleccionado]) * 100).toFixed(1)}% del cliente
                        </div>
                      </div>
                    ))}
                </div>
              ) : clienteSeleccionado ? (
                <p className="text-center text-gray-500">No hay puestos para mostrar</p>
              ) : (
                <p className="text-center text-gray-500">Selecciona un cliente para ver sus puestos</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 