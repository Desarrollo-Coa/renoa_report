import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

// Define the interface for the database row
interface NovedadRow extends RowDataPacket {
  id_novedad: number;
  consecutivo: string;
  fecha: Date;
  tipo: string;
  usuario: string;
  descripcion: string | null;
  gestion: string | null;
  critico: boolean;
  imagenes: string | null; // GROUP_CONCAT result as a string
  cliente: string; // From unidad_negocio.nombre via puestos_para_reportes
  puesto: string; // From puestos_para_reportes.nombre_puesto
}

// Interface for the image objects after parsing
interface Imagen {
  id_archivo: number;
  url_archivo: string;
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
        DATE(n.fecha_novedad) AS fecha, 
        tn.nombre_novedad AS tipo, 
        CONCAT(u.nombre, ' ', u.apellido) AS usuario, 
        n.descripcion, 
        n.gestion, 
        n.estado = 'no_enviado' AS critico,
        un.nombre AS cliente,
        ppr.nombre_puesto AS puesto,
        GROUP_CONCAT(
          JSON_OBJECT(
            'id_archivo', a.id_archivo,
            'url_archivo', a.url_archivo,
            'fecha_subida', a.fecha_subida
          )
        ) AS imagenes
      FROM novedades n
      JOIN users u ON n.operador_registro_id = u.id
      JOIN tipos_novedad tn ON n.id_tipo_novedad = tn.id_tipo_novedad
      LEFT JOIN puestos_para_reportes ppr ON n.id_puesto = ppr.id_puesto
      LEFT JOIN unidad_negocio un ON ppr.unidad_negocio_id = un.id
      LEFT JOIN archivos_novedad a ON n.id_novedad = a.id_novedad
      WHERE DATE(n.fecha_novedad) BETWEEN ? AND ?
      GROUP BY n.id_novedad
      ORDER BY n.fecha_novedad DESC, n.hora_novedad DESC
    `, [from, to]);

    await connection.end();

    // Debugging: Log raw database data
    console.log('Datos crudos de la base de datos (Grupo Argos):', rows);

    const standardizedData = {
      data: (Array.isArray(rows) ? rows : []).map((row) => {
        console.log('Raw imagenes string for id_novedad:', row.id_novedad, row.imagenes);
        return {
          id_novedad: row.id_novedad,
          fecha: row.fecha instanceof Date ? row.fecha.toISOString().split('T')[0] : row.fecha,
          tipo: row.tipo,
          valor: 1,
          proyecto: 'GRUPO ARGOS',
          usuario: row.usuario,
          descripcion: row.descripcion || '',
          gestion: row.gestion || '',
          critico: row.critico || false,
          consecutivo: row.consecutivo,
          puesto: row.puesto || 'N/A',
          cliente: row.cliente || 'N/A',
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
    console.log('Datos estandarizados enviados (Grupo Argos):', standardizedData);

    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching novedades de Grupo Argos:', error);
    return NextResponse.json({ error: 'Error al obtener datos de Grupo Argos' }, { status: 500 });
  }
}