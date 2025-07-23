import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

// Define el tipo de fila retornada por la consulta SQL
interface NovedadRow {
  id_novedad: number;
  consecutivo: string | number;
  fecha: Date;
  tipo: string;
  usuario: string;
  descripcion: string | null;
  gestion: string | null;
  critico: boolean;
  imagenes: string | null; // GROUP_CONCAT retorna una cadena
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
    // Aumentar el límite de GROUP_CONCAT para manejar URLs largas
    await connection.execute('SET SESSION group_concat_max_len = 10000;');

    const [rows] = await connection.execute(
      `
      SELECT 
        n.id_novedad, 
        n.consecutivo, 
        DATE(n.fecha_hora_novedad) AS fecha, 
        te.nombre_tipo_evento AS tipo, 
        CONCAT(u.nombre, ' ', u.apellido) AS usuario, 
        n.descripcion, 
        n.gestion, 
        n.evento_critico AS critico,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id_imagen', i.id_imagen,
            'url_imagen', i.url_imagen,
            'nombre_archivo', i.nombre_archivo,
            'fecha_subida', i.fecha_subida
          )
        ) AS imagenes
      FROM novedades n
      JOIN users u ON n.id_usuario = u.id
      JOIN tipos_evento te ON n.id_tipo_evento = te.id_tipo_evento
      LEFT JOIN imagenes_novedades i ON n.id_novedad = i.id_novedad
      WHERE DATE(n.fecha_hora_novedad) BETWEEN ? AND ?
      GROUP BY n.id_novedad
      ORDER BY n.fecha_hora_novedad DESC
      `,
      [from, to]
    ) as unknown as [NovedadRow[]];

    await connection.end();

    const standardizedData = {
      data: rows.map((row) => ({
        id_novedad: row.id_novedad,
        fecha: row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : row.fecha,
        tipo: row.tipo,
        valor: 1,
        proyecto: 'BARRANQUILLA',
        usuario: row.usuario,
        descripcion: row.descripcion || '',
        gestion: row.gestion || '',
        critico: row.critico || false,
        consecutivo: row.consecutivo,
        imagenes: row.imagenes ? JSON.parse(`[${row.imagenes}]`) : [],
      })),
    };

    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching novedades de Barranquilla:', error);
    return NextResponse.json({ error: 'Error al obtener datos de Barranquilla' }, { status: 500 });
  }
}
