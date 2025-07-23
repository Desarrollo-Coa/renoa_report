==================================0
CEMENTOS : 
 

-- Create table for Departamentos
CREATE TABLE Departamentos (
    id_departamento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_departamento VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Create table for Municipios
CREATE TABLE Municipios (
    id_municipio INT AUTO_INCREMENT PRIMARY KEY,
    nombre_municipio VARCHAR(100) NOT NULL,
    id_departamento INT NOT NULL,
    FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento),
    UNIQUE (nombre_municipio, id_departamento)
) ENGINE=InnoDB;

-- Create table for Sedes
CREATE TABLE Sedes (
    id_sede INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sede VARCHAR(100) NOT NULL UNIQUE,
    id_departamento INT NOT NULL,
    id_municipio INT NOT NULL,
    id_zona INT NOT NULL,
    id_tipo_negocio INT NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_departamento) REFERENCES Departamentos(id_departamento),
    FOREIGN KEY (id_municipio) REFERENCES Municipios(id_municipio),
    FOREIGN KEY (id_zona) REFERENCES zonas_cementos_argos(id_zona),
    FOREIGN KEY (id_tipo_negocio) REFERENCES tipos_negocio_cementos(id_tipo_negocio)
) ENGINE=InnoDB;

-- Create table for Estados_Proceso
CREATE TABLE Estados_Proceso (
    id_estado_proceso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Create table for Tipos_Reporte
CREATE TABLE Tipos_Reporte (
    id_tipo_reporte INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo_reporte VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Create table for Tipos_Evento
CREATE TABLE Tipos_Evento (
    id_tipo_evento INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo_evento VARCHAR(100) NOT NULL,
    id_tipo_reporte INT NOT NULL,
    FOREIGN KEY (id_tipo_reporte) REFERENCES Tipos_Reporte(id_tipo_reporte),
    UNIQUE KEY unique_tipo_evento (nombre_tipo_evento, id_tipo_reporte)
) ENGINE=InnoDB;

-- Create table for destinatarios_cementos_argos
CREATE TABLE destinatarios_cementos_argos (
    id_destinatario INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Create table for asignaciones_destinatarios_cementos_argos
CREATE TABLE asignaciones_destinatarios_cementos_argos (
    id_asignacion INT AUTO_INCREMENT PRIMARY KEY,
    id_tipo_novedad INT NOT NULL,
    id_sede INT NOT NULL,
    id_unidad_negocio INT NOT NULL,
    id_destinatario INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_novedad) REFERENCES Tipos_Evento(id_tipo_evento),
    FOREIGN KEY (id_sede) REFERENCES Sedes(id_sede),
    FOREIGN KEY (id_unidad_negocio) REFERENCES unidades_negocio_cementos_argos(id_unidad),
    FOREIGN KEY (id_destinatario) REFERENCES destinatarios_cementos_argos(id_destinatario),
    UNIQUE KEY unique_asignacion (id_tipo_novedad, id_sede, id_unidad_negocio, id_destinatario)
) ENGINE=InnoDB;

-- Create table for novedades_cementos_argos
CREATE TABLE novedades_cementos_argos (
    id_novedad INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    consecutivo INT NOT NULL,
    fecha_hora_novedad DATETIME NOT NULL,
    id_estado_proceso INT NOT NULL,
    id_tipo_reporte INT NOT NULL,
    id_tipo_evento INT NOT NULL,
    id_tipo_negocio INT NOT NULL,
    id_sede INT NOT NULL,
    gestion TEXT,
    descripcion TEXT,
    fecha_hora_registro DATETIME NOT NULL,
    evento_critico BOOLEAN DEFAULT FALSE,
    UNIQUE (consecutivo),
    FOREIGN KEY (id_usuario) REFERENCES users(id),
    FOREIGN KEY (id_estado_proceso) REFERENCES Estados_Proceso(id_estado_proceso),
    FOREIGN KEY (id_tipo_reporte) REFERENCES Tipos_Reporte(id_tipo_reporte),
    FOREIGN KEY (id_tipo_evento) REFERENCES Tipos_Evento(id_tipo_evento),
    FOREIGN KEY (id_tipo_negocio) REFERENCES tipos_negocio_cementos(id_tipo_negocio),
    FOREIGN KEY (id_sede) REFERENCES Sedes(id_sede)
) ENGINE=InnoDB;

-- Create table for imagenes_novedades_cementos_argos
CREATE TABLE imagenes_novedades_cementos_argos (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_novedad) REFERENCES novedades_cementos_argos(id_novedad) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Create table for historial_envios_cementos_argos
CREATE TABLE historial_envios_cementos_argos (
    id_envio INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operador_id INT NOT NULL,
    destinatarios JSON NOT NULL,
    estado ENUM('enviado', 'error') NOT NULL,
    mensaje_error TEXT,
    FOREIGN KEY (id_novedad) REFERENCES novedades_cementos_argos(id_novedad),
    FOREIGN KEY (operador_id) REFERENCES users(id)
) ENGINE=InnoDB; 
 
====================================
GRUPO ARGOS: 

-- Tablas base para novedades
CREATE TABLE IF NOT EXISTS niveles_criticidad (
    id_nivel INT AUTO_INCREMENT PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipos_novedad (
    id_tipo_novedad INT AUTO_INCREMENT PRIMARY KEY,
    nombre_novedad VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tipos_destinatarios (
    id_tipo_destinatario INT AUTO_INCREMENT PRIMARY KEY,
    tipo_nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS puestos_para_reportes (
    id_puesto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_puesto VARCHAR(100) NOT NULL,
    codigo_puesto VARCHAR(50) UNIQUE
);

CREATE TABLE IF NOT EXISTS destinatarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(100),
    telefono VARCHAR(15),
    tipo_destinatario_id INT,
    FOREIGN KEY (tipo_destinatario_id) REFERENCES tipos_destinatarios(id_tipo_destinatario)
);

CREATE TABLE IF NOT EXISTS novedades (
    id_novedad INT AUTO_INCREMENT PRIMARY KEY,
    consecutivo VARCHAR(8) NOT NULL UNIQUE,
    fecha_novedad DATE NOT NULL,
    hora_novedad TIME NOT NULL,
    descripcion TEXT NOT NULL,
    gestion TEXT,
    id_puesto INT NOT NULL,
    id_tipo_novedad INT NOT NULL,
    id_nivel_criticidad INT NOT NULL,
    operador_registro_id INT NOT NULL,
    observacion_puesto TEXT,
    operador_realiza VARCHAR(100) NOT NULL,
    estado ENUM('enviado', 'no_enviado') NOT NULL DEFAULT 'no_enviado',
    FOREIGN KEY (id_puesto) REFERENCES puestos_para_reportes(id_puesto),
    FOREIGN KEY (id_tipo_novedad) REFERENCES tipos_novedad(id_tipo_novedad),
    FOREIGN KEY (id_nivel_criticidad) REFERENCES niveles_criticidad(id_nivel),
    FOREIGN KEY (operador_registro_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS archivos_novedad (
    id_archivo INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_novedad) REFERENCES novedades(id_novedad) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historial_envios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operador_id INT NOT NULL,
    destinatarios JSON NOT NULL,
    estado ENUM('enviado', 'error') NOT NULL DEFAULT 'enviado',
    mensaje_error TEXT,
    FOREIGN KEY (id_novedad) REFERENCES novedades(id_novedad) ON DELETE CASCADE,
    FOREIGN KEY (operador_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS eventos_criticos (
    id_evento_critico INT AUTO_INCREMENT PRIMARY KEY,
    id_novedad INT NOT NULL,
    FOREIGN KEY (id_novedad) REFERENCES novedades(id_novedad) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destinatario_id INT NOT NULL,
    tipo_novedad_id INT NOT NULL,
    FOREIGN KEY (destinatario_id) REFERENCES destinatarios(id),
    FOREIGN KEY (tipo_novedad_id) REFERENCES tipos_novedad(id_tipo_novedad)
);

CREATE TABLE IF NOT EXISTS destinatarios_envio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_historial INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(255),
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('enviado', 'error') DEFAULT 'enviado',
    error TEXT,
    FOREIGN KEY (id_historial) REFERENCES historial_envios(id) ON DELETE CASCADE
);
 
 

 
INSERT INTO unidad_negocio (nombre, descripcion) VALUES
('Grupo Argos', 'Unidad de Negocio fotox'),
('Baru', 'Unidad de Negocio fortox'),
('Sator', 'Unidad de Negocio ');




-- Insertar datos en tablas con dependencias
INSERT INTO puestos_para_reportes (nombre_puesto, unidad_negocio_id) VALUES
('SANTA ISABEL', 1),
('MIRAMAR', 1),
('JESUITA MIRAMAR', 1),
('ARROYO LEON', 1),
('INSIGNARES', 1),
('MORRO', 1),
('PAJONAL', 1),
('MALLORQUÍN', 1),
('LAS PAVAS', 1),
('PAVAS CORPORATIVO', 1),
('LAGOS DEL CACIQUE', 1),
('LOS PARAGÚITAS - Baru', 2),
('SATOR', 3),
('BARU', 2),
('LOTE VALLEDUPAR', 1),
('SAN JUAN DE DIOS', 1),
('REBOLO', 1),
('Otros predios', NULL);