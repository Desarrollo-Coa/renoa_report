"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ListChecks, CalendarDays, Star } from "lucide-react"
import { DonutChart } from "./ui/donut-chart"
import { useData } from "@/lib/contexts/DataContext"

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
  const { novedades, loading, updateDateRange } = useData()

  // Actualizar datos cuando cambie el rango de fechas
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    updateDateRange(newDateRange);
  };

  const totalDaysInRange = Math.floor(
    (new Date(dateRange.to).setHours(23, 59, 59, 999) - new Date(dateRange.from).setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  ) + 1

   const diaConMayorNovedad = novedades.length > 0 ? (() => {
    const fechasUnicas = [...new Set(novedades.map(nov => nov.fecha))];
    const maxDia = fechasUnicas.reduce((maxDia, dia) => {
      const countDia = novedades.filter(nov => nov.fecha === dia).length;
      const countMaxDia = novedades.filter(nov => nov.fecha === maxDia).length;
      return countDia > countMaxDia ? dia : maxDia;
    });
    const cantidad = novedades.filter(nov => nov.fecha === maxDia).length;
    return `${maxDia} (${cantidad})`;
  })() : "Ninguno"

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
                        onChange={e => handleDateRangeChange({ ...dateRange, from: e.target.value })}
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
                        onChange={e => handleDateRangeChange({ ...dateRange, to: e.target.value })}
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