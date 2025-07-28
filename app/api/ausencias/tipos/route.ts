import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface TipoAusenciaRow extends RowDataPacket {
  id_tipo_ausencia: number;
  nombre_tipo_ausencia: string;
  activo: boolean;
}

export async function GET(request: NextRequest) {
  try {
    let todosLosTipos: string[] = [];

    // Obtener tipos de Barranquilla
    try {
      const connectionBarranquilla = await getConnection('barranquilla');
      const [tiposBarranquilla] = await connectionBarranquilla.execute<TipoAusenciaRow[]>(`
        SELECT id_tipo_ausencia, nombre_tipo_ausencia, activo
        FROM tipos_ausencia
        WHERE activo = TRUE
        ORDER BY nombre_tipo_ausencia
      `);
      await connectionBarranquilla.end();
      
      todosLosTipos = [...todosLosTipos, ...tiposBarranquilla.map(t => t.nombre_tipo_ausencia)];
      console.log('Tipos de ausencia Barranquilla:', tiposBarranquilla.map(t => t.nombre_tipo_ausencia));
    } catch (error) {
      console.error('Error obteniendo tipos de Barranquilla:', error);
    }

    // Obtener tipos de Cartagena
    try {
      const connectionCartagena = await getConnection('cartagena');
      const [tiposCartagena] = await connectionCartagena.execute<TipoAusenciaRow[]>(`
        SELECT id_tipo_ausencia, nombre_tipo_ausencia, activo
        FROM tipos_ausencia
        WHERE activo = TRUE
        ORDER BY nombre_tipo_ausencia
      `);
      await connectionCartagena.end();
      
      todosLosTipos = [...todosLosTipos, ...tiposCartagena.map(t => t.nombre_tipo_ausencia)];
      console.log('Tipos de ausencia Cartagena:', tiposCartagena.map(t => t.nombre_tipo_ausencia));
    } catch (error) {
      console.error('Error obteniendo tipos de Cartagena:', error);
    }

    // Si no se obtuvieron tipos de ninguna base de datos, usar los tipos por defecto
    if (todosLosTipos.length === 0) {
      todosLosTipos = ['Enfermedad', 'Incumplimiento de horario', 'Accidente laboral'];
      console.log('Usando tipos de ausencia por defecto:', todosLosTipos);
    }

    // Eliminar duplicados y ordenar
    const tiposUnicos = [...new Set(todosLosTipos)].sort();
    console.log('Tipos de ausencia finales:', tiposUnicos);

    return NextResponse.json({
      data: tiposUnicos
    });
  } catch (error) {
    console.error('Error fetching tipos de ausencia:', error);
    // En caso de error, devolver tipos por defecto
    return NextResponse.json({
      data: ['Enfermedad', 'Incumplimiento de horario', 'Accidente laboral']
    });
  }
} 