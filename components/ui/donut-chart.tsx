"use client"
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  value: number; // Cambiamos a un solo número
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF6384', '#36A2EB'
];

// Datos ficticios con 6 segmentos para mostrar los 6 colores
const dummyData = [
  { label: 'Seg1', value: 1 },
  { label: 'Seg2', value: 1 },
  { label: 'Seg3', value: 1 },
  { label: 'Seg4', value: 1 },
  { label: 'Seg5', value: 1 },
  { label: 'Seg6', value: 1 },
];

export function DonutChart({ value }: DonutChartProps) {
  return (
    <div style={{ width: 80, height: 80, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dummyData} // Usamos 6 segmentos ficticios
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={34}
            outerRadius={39}
            fill="#8884d8"
            paddingAngle={2}
          >
            {dummyData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#222' }}>{value}</span> {/* Mostramos el valor pasado */}
      </div>
    </div>
  );
}