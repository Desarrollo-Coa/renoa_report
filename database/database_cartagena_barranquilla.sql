-- Tabla de usuarios (solo para FK de novedades e historial_envios)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apellido VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

-- Tabla de Puestos (solo para FK de novedades y asignaciones_destinatarios)
CREATE TABLE puestos (
    id_puesto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_puesto VARCHAR(255) NOT NULL
);

-- Tipos de Reporte (para tipos_evento)
CREATE TABLE tipos_reporte (
    id_tipo_reporte INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo_reporte VARCHAR(100) NOT NULL UNIQUE
);

-- Inserts de tipos de reporte
INSERT INTO tipos_reporte (nombre_tipo_reporte) VALUES 
('SEGURIDAD FISICA'),
('ASEGURAMIENTO DE LA OPERACION'),
('SEGURIDAD ELECTRONICA'),
('INCUMPLIMIENTO A LOS PROCEDIMIENTOS PR');

-- Tipos de Evento (para novedades)
CREATE TABLE tipos_evento (
    id_tipo_evento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo_evento VARCHAR(100) NOT NULL,
    id_tipo_reporte INT NOT NULL,
    FOREIGN KEY (id_tipo_reporte) REFERENCES tipos_reporte(id_tipo_reporte),
    UNIQUE KEY unique_tipo_evento (nombre_tipo_evento, id_tipo_reporte)
);

-- Inserts de tipos de evento
INSERT INTO tipos_evento (nombre_tipo_evento, id_tipo_reporte) VALUES 
('PERTURBACION DE PREDIOS', 1),
('INFRAESTRUCTURA', 1),
('ELEMENTOS SIN ASEGURAR', 1),
('FALLAS ELÉCTRICAS', 2),
('LOGISTICA', 2),
('PODA', 2),
('EXTERNOS', 3),
('INTERNOS', 3);

-- Tabla de novedades
CREATE TABLE novedades (
    id_novedad INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_puesto INT NOT NULL,
    consecutivo INT NOT NULL,
    fecha_hora_novedad DATETIME NOT NULL,
    id_tipo_evento INT NOT NULL,
    descripcion TEXT,
    gestion TEXT,
    evento_critico BOOLEAN DEFAULT FALSE,
    fecha_hora_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (consecutivo),
    FOREIGN KEY (id_usuario) REFERENCES users(id),
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto),
    FOREIGN KEY (id_tipo_evento) REFERENCES tipos_evento(id_tipo_evento)
);

-- Tabla de imágenes de novedades
CREATE TABLE imagenes_novedades (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_novedad) REFERENCES novedades(id_novedad) ON DELETE CASCADE
);

-- Tabla para Historial de Envíos
CREATE TABLE historial_envios (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operador_id INT NOT NULL,
    destinatarios JSON NOT NULL,
    estado ENUM('enviado', 'error') NOT NULL,
    mensaje_error TEXT,
    FOREIGN KEY (id_novedad) REFERENCES novedades(id_novedad),
    FOREIGN KEY (operador_id) REFERENCES users(id)
);

-- Tabla para Destinatarios de Envío
CREATE TABLE destinatarios_envio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    estado ENUM('enviado', 'error') NOT NULL,
    error TEXT,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_historial) REFERENCES historial_envios(id_envio) ON DELETE CASCADE
);

-- Tabla para Destinatarios
CREATE TABLE destinatarios (
    id_destinatario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para Asignaciones de Destinatarios
CREATE TABLE asignaciones_destinatarios (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_evento INT NOT NULL,
    id_puesto INT NOT NULL,
    id_destinatario INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_evento) REFERENCES tipos_evento(id_tipo_evento),
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto),
    FOREIGN KEY (id_destinatario) REFERENCES destinatarios(id_destinatario),
    UNIQUE KEY unique_asignacion (id_tipo_evento, id_puesto, id_destinatario)
);