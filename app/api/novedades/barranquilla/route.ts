 import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface NovedadRow extends RowDataPacket {
  id_novedad: number;
  consecutivo: string | number;
  fecha: Date;
  tipo: string;
  usuario: string;
  descripcion: string | null;
  gestion: string | null;
  critico: boolean;
  imagenes: string | null;
  puesto: string;
  cliente: string | null;
}

interface Imagen {
  id_imagen: number;
  url_imagen: string;
  nombre_archivo: string;
  fecha_subida: string;
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
        p.nombre_puesto AS puesto,
        neg.nombre_negocio AS cliente,
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
      JOIN puestos p ON n.id_puesto = p.id_puesto
      JOIN unidades_negocio un ON p.id_unidad = un.id_unidad
      JOIN negocios neg ON un.id_negocio = neg.id_negocio
      LEFT JOIN imagenes_novedades i ON n.id_novedad = i.id_novedad
      WHERE DATE(n.fecha_hora_novedad) BETWEEN ? AND ?
      GROUP BY n.id_novedad
      ORDER BY n.fecha_hora_novedad DESC
    `, [from, to]);

    await connection.end();

    console.log('Datos crudos de la base de datos (Barranquilla):', rows);

    const standardizedData = {
      data: (Array.isArray(rows) ? rows : []).map((row) => {
        console.log('Raw imagenes string for id_novedad:', row.id_novedad, row.imagenes);
        return {
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

    console.log('Datos estandarizados enviados (Barranquilla):', standardizedData);
    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching novedades de Barranquilla:', error);
    return NextResponse.json({ error: 'Error al obtener datos de Barranquilla' }, { status: 500 });
  }
} 