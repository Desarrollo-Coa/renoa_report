"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ListChecks, CalendarDays, Star } from "lucide-react"
import { DonutChart } from "./ui/donut-chart"

interface Novedad {
  fecha: string
  tipo: string
  valor: number
  proyecto: string
}

interface DateRange {
  from: string
  to: string
}
 

interface Metric {
  title: string
  value: string
  icon: React.ElementType
  description?: string
  custom?: React.ReactNode
}
 
 

interface MetricsCardsProps {
  dateRange: DateRange
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>
}

export function MetricsCards({ dateRange, setDateRange }: MetricsCardsProps) {
  const [novedades, setNovedades] = useState<Novedad[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartagenaResp, barranquillaResp, cementosResp, argosResp] = await Promise.all([
          fetch(`/api/novedades/cartagena?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/barranquilla?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/cementos?from=${dateRange.from}&to=${dateRange.to}`),
          fetch(`/api/novedades/grupo-argos?from=${dateRange.from}&to=${dateRange.to}`),
        ])

        if (!cartagenaResp.ok || !barranquillaResp.ok || !cementosResp.ok || !argosResp.ok) {
          throw new Error("Una o más respuestas de la API fallaron")
        }

        const [cartagenaData, barranquillaData, cementosData, argosData] = await Promise.all([
          cartagenaResp.json(),
          barranquillaResp.json(),
          cementosResp.json(),
          argosResp.json(),
        ])

        console.log("Cartagena Data:", cartagenaData)
        console.log("Barranquilla Data:", barranquillaData)
        console.log("Cementos Data:", cementosData)
        console.log("Argos Data:", argosData)

        const allNovedades = [
          ...(cartagenaData.data || []),
          ...(barranquillaData.data || []),
          ...(cementosData.data || []),
          ...(argosData.data || []),
        ]

        console.log("All Novedades in MetricsCards:", allNovedades)
        setNovedades(allNovedades)
      } catch (error) {
        console.error("Error al obtener datos:", error)
        setNovedades([])
      }
    }

    fetchData()
  }, [dateRange])

  const totalDaysInRange = Math.floor(
    (new Date(dateRange.to).setHours(23, 59, 59, 999) - new Date(dateRange.from).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  ) + 1

   const diaConMayorNovedad = novedades.length > 0 ? [...new Set(novedades.map(nov => nov.fecha))].reduce((maxDia, dia) =>
    novedades.filter(nov => nov.fecha === dia).length > novedades.filter(nov => nov.fecha === maxDia).length ? dia : maxDia
  ) : "Ninguno"

  const noveltyCount = novedades.reduce<Record<string, number>>((acc, nov) => {
    acc[nov.tipo] = (acc[nov.tipo] || 0) + 1
    return acc
  }, {})
  const topNovelty = Object.entries(noveltyCount).reduce(
    (max, [tipo, count]) => (count > max.count ? { tipo, count } : max),
    { tipo: "Ninguna", count: 0 }
  )

 
  const metrics: Metric[] = [
    {
      title: "Total de días analizados",
      value: totalDaysInRange.toString(),
      icon: ListChecks,
      custom: null,
    },
    {
      title: "Total de novedades",
      value: novedades.length.toString(),
      description: "Distribución del total de novedades por día",
      icon: CalendarDays,
      custom: <DonutChart value={novedades.length} />, 
    },
    {
      title: "Top novedades",
      value: `${topNovelty.tipo} (${topNovelty.count})`,
      description: "Novedad más frecuente",
      icon: Star,
      custom: null,
    },
    {
      title: "Día con mayor novedades registradas",
      value: diaConMayorNovedad,
      description: " ",
      icon: ListChecks,
      custom: null,
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const showFilters = index === 0
          return (
            <Card key={index} className="bg-white shadow-sm rounded-xl min-h-0">
              <CardContent className="p-3 relative flex flex-col items-start min-h-0 h-full justify-between">
                {Icon && (
                  <div className="absolute top-2 right-2 bg-gray-100 rounded-lg p-1">
                    <Icon className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                {metric.title && <p className="text-xs text-gray-500 mb-1 font-medium leading-tight">{metric.title}</p>}
                {showFilters && (
                  <div className="flex gap-2 mb-2 items-end w-full">
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-0.5">Desde</label>
                      <input
                        type="date"
                        className="border rounded px-1 py-0.5 text-xs"
                        value={dateRange.from}
                        max={dateRange.to}
                        onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 mb-0.5">Hasta</label>
                      <input
                        type="date"
                        className="border rounded px-1 py-0.5 text-xs"
                        value={dateRange.to}
                        min={dateRange.from}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                {metric.custom ? (
                  <div className="flex justify-center items-center w-full my-2">
                    {metric.custom}
                  </div>
                ) : metric.value ? (
                  <>
                    <h3 className="my-2 w-full text-left text-2xl font-bold text-gray-900">{metric.value}</h3>
                    <p className="text-xs text-gray-400 w-full text-left leading-tight mb-1">{metric.description}</p>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}