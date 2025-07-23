import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

// Define the interface for the database row
interface NovedadRow extends RowDataPacket {
  id_novedad: number;
  consecutivo: string | number;
  fecha: Date;
  tipo: string;
  usuario: string;
  descripcion: string | null;
  gestion: string | null;
  critico: boolean;
  imagenes: string | null; // GROUP_CONCAT result as a string
}

// Interface for the image objects after parsing
interface Imagen {
  id_imagen: number;
  url_imagen: string;
  nombre_archivo: string;
  fecha_subida: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'Parámetros "from" y "to" son requeridos' }, { status: 400 });
  }

  try {
    const connection = await getConnection('Argos');
    // Increase GROUP_CONCAT limit to handle long URLs
    await connection.execute('SET SESSION group_concat_max_len = 10000;');

    const [rows] = await connection.execute<NovedadRow[]>(`
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
      FROM novedades_cementos_argos n
      JOIN users u ON n.id_usuario = u.id
      JOIN Tipos_Evento te ON n.id_tipo_evento = te.id_tipo_evento
      LEFT JOIN imagenes_novedades_cementos_argos i ON n.id_novedad = i.id_novedad
      WHERE DATE(n.fecha_hora_novedad) BETWEEN ? AND ?
      GROUP BY n.id_novedad
      ORDER BY n.fecha_hora_novedad DESC
    `, [from, to]);

    await connection.end();

    // Debugging: Log raw database data
    console.log('Datos crudos de la base de datos (Cementos):', rows);

    const standardizedData = {
      data: (Array.isArray(rows) ? rows : []).map((row) => {
        console.log('Raw imagenes string for id_novedad:', row.id_novedad, row.imagenes);
        return {
          id_novedad: row.id_novedad,
          fecha: row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : row.fecha,
          tipo: row.tipo,
          valor: 1,
          proyecto: 'CEMENTOS',
          usuario: row.usuario,
          descripcion: row.descripcion || '',
          gestion: row.gestion || '',
          critico: row.critico || false,
          consecutivo: row.consecutivo,
          imagenes: row.imagenes
            ? (() => {
                try {
                  const parsed = JSON.parse(`[${row.imagenes}]`) as Imagen[];
                  console.log('Parsed imagenes for id_novedad:', row.id_novedad, parsed);
                  return parsed;
                } catch (e) {
                  console.error(`Error parsing imagenes for id_novedad ${row.id_novedad}:`, e);
                  return [];
                }
              })()
            : [],
        };
      }),
    };

    // Debugging: Log standardized data
    console.log('Datos estandarizados enviados (Cementos):', standardizedData);

    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching novedades de Cementos:', error);
    return NextResponse.json({ error: 'Error al obtener datos de Cementos' }, { status: 500 });
  }
}