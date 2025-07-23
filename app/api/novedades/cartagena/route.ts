import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface NovedadRow extends RowDataPacket {
  id_novedad: number;
  consecutivo: string;
  fecha: Date;
  tipo: string;
  usuario: string;
  descripcion: string | null;
  gestion: string | null;
  critico: boolean;
  imagenes: string | null;
}

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
    const connection = await getConnection('cartagena');
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
      FROM novedades n
      JOIN users u ON n.id_usuario = u.id
      JOIN tipos_evento te ON n.id_tipo_evento = te.id_tipo_evento
      LEFT JOIN imagenes_novedades i ON n.id_novedad = i.id_novedad
      WHERE DATE(n.fecha_hora_novedad) BETWEEN ? AND ?
      GROUP BY n.id_novedad
      ORDER BY n.fecha_hora_novedad DESC
    `, [from, to]);
    await connection.end();

    console.log("Datos crudos de la base de datos:", rows);

    const standardizedData = {
      data: (Array.isArray(rows) ? rows : []).map((row: NovedadRow) => {
        console.log("Raw imagenes string for id_novedad:", row.id_novedad, row.imagenes);
        return {
          id_novedad: row.id_novedad,
          fecha: row.fecha.toISOString().split('T')[0],
          tipo: row.tipo,
          valor: 1,
          proyecto: "CARTAGENA",
          usuario: row.usuario,
          descripcion: row.descripcion || "",
          gestion: row.gestion || "",
          critico: row.critico || false,
          consecutivo: row.consecutivo,
          imagenes: row.imagenes
            ? (() => {
                try {
                  const parsed = JSON.parse(`[${row.imagenes}]`) as Imagen[];
                  console.log("Parsed imagenes for id_novedad:", row.id_novedad, parsed);
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

    console.log("Datos estandarizados enviados:", standardizedData);
    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching novedades de Cartagena:', error);
    return NextResponse.json({ error: 'Error al obtener datos de Cartagena' }, { status: 500 });
  }
}