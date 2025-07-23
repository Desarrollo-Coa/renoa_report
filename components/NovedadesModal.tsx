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
          {eventosSeleccionados.map((evento) => (
            <Card key={evento.id_novedad} className="overflow-hidden shadow-lg">
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                  {evento.proyecto} - {evento.tipo}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Consecutivo: {evento.consecutivo}
                </p>

                {evento.imagenes && evento.imagenes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {evento.imagenes.map((imagen, idx) => {
                        const imageUrl = imagen.url_imagen || imagen.url_archivo || "https://via.placeholder.com/150";
                        return (
                          <div
                            key={imagen.id_imagen || imagen.id_archivo || idx}
                            className="relative flex-shrink-0 w-32 h-32 sm:w-48 sm:h-48"
                          >
                            <Image
                              src={imageUrl}
                              alt={imagen.nombre_archivo || `Imagen ${idx + 1}`}
                              fill
                              className="rounded-lg object-cover"
                              sizes="(max-width: 640px) 128px, 192px"
                              priority={idx === 0}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4 bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:gap-8 text-sm text-gray-600">
                    <p>
                      Fecha:{" "}
                      {evento.fecha
                        .split("T")[0]
                        .split("-")
                        .reverse()
                        .join("/")}
                    </p>
                     <p>Puesto: {evento.puesto}</p>
                    <p>Cliente: {evento.cliente}</p>
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