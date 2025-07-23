import { NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';

interface Row {
  id_novedad: number | string;
  fecha: Date;
  tipo: string;
  usuario: string;
  descripcion: string | null;
  gestion: string | null;
  critico: boolean | null;
  consecutivo: number | string;
  imagenes: string | null;
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
    // Aumentar el límite de GROUP_CONCAT para manejar URLs largas 
    const [rows] = await connection.execute(`
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

    const standardizedData = {
      data: (Array.isArray(rows) ? rows as Row[] : []).map((row) => ({
 id_novedad: row.id_novedad,

        fecha: row.fecha.toISOString().split('T')[0], // Forzar solo YYYY-MM-DD
        tipo: row.tipo,
        valor: 1,
        proyecto: "CEMENTOS",
        usuario: row.usuario,
        descripcion: row.descripcion || "",
        gestion: row.gestion || "",
        critico: row.critico || false,
        consecutivo: row.consecutivo,
        imagenes: row.imagenes ? JSON.parse("[" + row.imagenes + "]") : [], // Parsear el GROUP_CONCAT como array de objetos
      })),
    };
    console.log(standardizedData);
    return NextResponse.json(standardizedData);
  } catch (error) {
    console.error('Error fetching novedades de Cementos:', error);
    return NextResponse.json({ error: 'Error al obtener datos de Cementos' }, { status: 500 });
  }
}