"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock, User, MapPin } from "lucide-react";

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

interface AusenciasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ausencias: Ausencia[];
  titulo: string;
}

export function AusenciasModal({
  open,
  onOpenChange,
  ausencias,
  titulo,
}: AusenciasModalProps) {
  const formatDate = (dateString: string) => {
    return dateString.split("-").reverse().join("/");
  };

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
          <DialogTitle className="text-xl sm:text-2xl font-bold">{titulo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 sm:space-y-8">
          {ausencias.length > 0 ? (
            ausencias.map((ausencia, index) => (
              <Card key={`${ausencia.id_ausencia}-${ausencia.proyecto}-${index}`} className="overflow-hidden shadow-lg">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {ausencia.colaborador}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {ausencia.tipo_ausencia}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        {ausencia.proyecto}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Período</p>
                        <p className="text-sm font-medium">
                          {formatDate(ausencia.fecha_inicio)} - {formatDate(ausencia.fecha_fin)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Duración</p>
                        <p className="text-sm font-medium">{ausencia.duracion_dias} días</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Puesto</p>
                        <p className="text-sm font-medium">{ausencia.puesto}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Registrado por</p>
                        <p className="text-sm font-medium">{ausencia.usuario_registro}</p>
                      </div>
                    </div>
                  </div>

                  {ausencia.descripcion && (
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Descripción</h3>
                      <p className="text-gray-700 text-base leading-relaxed">
                        {ausencia.descripcion}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Registrado el {formatDate(ausencia.fecha_registro)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay ausencias para mostrar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 