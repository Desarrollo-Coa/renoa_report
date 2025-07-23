"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import Image from "next/image";

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
  imagenes: {
    id_imagen?: number;
    id_archivo?: number;
    url_imagen?: string;
    url_archivo?: string;
    fecha_subida: string;
    nombre_archivo?: string;
  }[];
}

interface NovedadesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventosSeleccionados: Novedad[];
  titulo: string;
}

export function NovedadesModal({
  open,
  onOpenChange,
  eventosSeleccionados,
  titulo,
}: NovedadesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
        </DialogHeader>
        <div className="space-y-8">
          {eventosSeleccionados.map((evento) => (
            <Card key={evento.id_novedad} className="overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {evento.proyecto} - {evento.tipo}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Consecutivo: {evento.consecutivo}
                </p>

                {evento.imagenes && evento.imagenes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {evento.imagenes.map((imagen, idx) => (
                        <Image
                          key={imagen.id_imagen || imagen.id_archivo || idx}
                          src={imagen.url_imagen || "/placeholder.svg"}
                          alt={imagen.nombre_archivo || "Imagen"}
                          width={120}
                          height={120}
                          className="w-32 h-32 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                  <div className="flex gap-8 text-sm text-gray-600">
                    <p>
                      Fecha:{" "}
                      {evento.fecha
                        .split("T")[0]
                        .split("-")
                        .reverse()
                        .join("/")}
                    </p>
                    <p>Usuario: {evento.usuario}</p>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 text-base leading-relaxed">
                      {evento.descripcion}
                    </p>
                    {evento.gestion && (
                      <p className="text-gray-700 text-base leading-relaxed mt-4">
                        {evento.gestion}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
