"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { MetricsCards } from "@/components/metrics-cards";
import { ChartsSection } from "@/components/charts-section";
import { ProjectsTable } from "@/components/projects-table";
import { AusenciasOverview } from "@/components/ausencias-overview";
import { DataProvider, useData } from "@/lib/contexts/DataContext";

interface DateRange {
  from: string;
  to: string;
}

function getDefaultRange() {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const fromDate = new Date(today);
  fromDate.setDate(fromDate.getDate() - 7);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

function DashboardContent() {
  const { updateDateRange } = useData();
  const [dateRange, setDateRange] = useState(getDefaultRange());

  // Sincronizar el estado local con el contexto
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    updateDateRange(newDateRange);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CONSOLIDADO DE EVENTOS Y AUSENCIAS REGIONAL NORTE</h1>
        </div>

        <MetricsCards dateRange={dateRange} setDateRange={(newRange) => handleDateRangeChange(typeof newRange === 'function' ? newRange(dateRange) : newRange)} />
        <ChartsSection dateRange={dateRange} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-2">
            <ProjectsTable dateRange={dateRange} />
          </div>
          <div className="lg:col-span-3">
            <AusenciasOverview dateRange={dateRange} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Dashboard() {
  const initialDateRange = getDefaultRange();
  
  return (
    <DataProvider initialDateRange={initialDateRange}>
      <DashboardContent />
    </DataProvider>
  );
}