import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface AusenciaRow extends RowDataPacket {
  id_ausencia: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  descripcion: string | null;
  nombre_tipo_ausencia: string;
  nombre_colaborador: string;
  apellido_colaborador: string;
  nombre_puesto: string;
  nombre_usuario_registro: string;
  apellido_usuario_registro: string;
  fecha_registro: Date;
  nombre_cliente: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'Parámetros "from" y "to" son requeridos' }, { status: 400 });
  }

  try {
    const connection = await getConnection('barranquilla');
    
    const [rows] = await connection.execute<AusenciaRow[]>(`
      SELECT 
        a.id_ausencia,
        a.fecha_inicio,
        a.fecha_fin,
        a.descripcion,
        ta.nombre_tipo_ausencia,
        CONCAT(c.nombre, ' ', c.apellido) AS nombre_colaborador,
        c.nombre AS nombre_colaborador_nombre,
        c.apellido AS apellido_colaborador,
        p.nombre_puesto,
        CONCAT(u.nombre, ' ', u.apellido) AS nombre_usuario_registro,
        u.nombre AS nombre_usuario_registro_nombre,
        u.apellido AS apellido_usuario_registro,
        a.fecha_registro,
        COALESCE(neg.nombre_negocio, 'BARRANQUILLA') AS nombre_cliente
      FROM ausencias a
      JOIN colaboradores c ON a.id_colaborador = c.id
      JOIN puestos p ON a.id_puesto = p.id_puesto
      JOIN tipos_ausencia ta ON a.id_tipo_ausencia = ta.id_tipo_ausencia
      JOIN users u ON a.id_usuario_registro = u.id
      LEFT JOIN unidades_negocio un ON p.id_unidad = un.id_unidad
      LEFT JOIN negocios neg ON un.id_negocio = neg.id_negocio
      WHERE a.activo = TRUE 
        AND DATE(a.fecha_inicio) BETWEEN ? AND ?
      ORDER BY a.fecha_inicio DESC
    `, [from, to]);

    await connection.end();

    console.log('Datos crudos de ausencias (Barranquilla):', rows);

    const standardizedData = {
      data: (Array.isArray(rows) ? rows : []).map((row) => {
        return {
          id_ausencia: row.id_ausencia,
          fecha_inicio: row.fecha_inicio instanceof Date ? row.fecha_inicio.toISOString().split('T')[0] : row.fecha_inicio,
          fecha_fin: row.fecha_fin instanceof Date ? row.fecha_fin.toISOString().split('T')[0] : row.fecha_fin,
          descripcion: row.descripcion || '',
          tipo_ausencia: row.nombre_tipo_ausencia,
          colaborador: row.nombre_colaborador,
          puesto: row.nombre_puesto,
          usuario_registro: row.nombre_usuario_registro,
          fecha_registro: row.fecha_registro instanceof Date ? row.fecha_registro.toISOString().split('T')[0] : row.fecha_registro,
          proyecto: 'BARRANQUILLA',
          duracion_dias: Math.ceil((new Date(row.fecha_fin).getTime() - new Date(row.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24)) + 1,
          cliente: row.nombre_cliente || 'BARRANQUILLA' 
        };
      }),
    };

    console.log('Datos estandarizados de ausencias enviados (Barranquilla):', standardizedData);
    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching ausencias de Barranquilla:', error);
    return NextResponse.json({ error: 'Error al obtener datos de ausencias de Barranquilla' }, { status: 500 });
  }
} 