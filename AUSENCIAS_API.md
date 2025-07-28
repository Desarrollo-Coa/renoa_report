# APIs de Ausencias

## Descripción
Se han creado nuevas APIs para obtener datos de ausencias de los proyectos Barranquilla y Cartagena. Los proyectos Cementos y Grupo Argos no tienen implementación de ausencias aún.

## Endpoints Disponibles

### 1. Ausencias de Barranquilla
- **URL**: `/api/ausencias/barranquilla`
- **Método**: GET
- **Parámetros**:
  - `from`: Fecha de inicio (YYYY-MM-DD)
  - `to`: Fecha de fin (YYYY-MM-DD)

### 2. Ausencias de Cartagena
- **URL**: `/api/ausencias/cartagena`
- **Método**: GET
- **Parámetros**:
  - `from`: Fecha de inicio (YYYY-MM-DD)
  - `to`: Fecha de fin (YYYY-MM-DD)

## Estructura de Respuesta

```json
{
  "data": [
    {
      "id_ausencia": 1,
      "fecha_inicio": "2024-01-15",
      "fecha_fin": "2024-01-17",
      "descripcion": "Descripción de la ausencia",
      "tipo_ausencia": "Enfermedad",
      "colaborador": "Juan Pérez",
      "puesto": "Operador",
      "usuario_registro": "Admin Usuario",
      "fecha_registro": "2024-01-14",
      "proyecto": "BARRANQUILLA",
      "duracion_dias": 3
    }
  ]
}
```

## Campos de la Respuesta

- `id_ausencia`: ID único de la ausencia
- `fecha_inicio`: Fecha de inicio de la ausencia
- `fecha_fin`: Fecha de fin de la ausencia
- `descripcion`: Descripción opcional de la ausencia
- `tipo_ausencia`: Tipo de ausencia (Enfermedad, Incumplimiento de horario, Accidente laboral)
- `colaborador`: Nombre completo del colaborador
- `puesto`: Puesto del colaborador
- `usuario_registro`: Usuario que registró la ausencia
- `fecha_registro`: Fecha de registro de la ausencia
- `proyecto`: Proyecto al que pertenece (BARRANQUILLA o CARTAGENA)
- `duracion_dias`: Duración en días de la ausencia (calculada automáticamente)

## Componente AusenciasOverview

El nuevo componente `AusenciasOverview` reemplaza al componente `OrdersOverview` y proporciona:

### Métricas Principales
1. **Total de ausencias**: Número total de ausencias en el período
2. **Total días de ausencia**: Suma de todos los días de ausencia
3. **Promedio días por ausencia**: Promedio de días por ausencia
4. **Tipo más frecuente**: Tipo de ausencia más común

### Gráficos
1. **Distribución por tipo de ausencia**: Gráfico de barras mostrando la distribución por tipo
2. **Ausencias por proyecto**: Gráfico de barras mostrando la distribución por proyecto

### Lista de Ausencias Recientes
- Muestra las 5 ausencias más recientes
- Incluye información detallada de cada ausencia
- Enlace para ver todas las ausencias

## Base de Datos

Las APIs utilizan las siguientes tablas:

### Tabla tipos_ausencia
```sql
CREATE TABLE tipos_ausencia (
    id_tipo_ausencia INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo_ausencia VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla ausencias
```sql
CREATE TABLE ausencias (
    id_ausencia INT AUTO_INCREMENT PRIMARY KEY,
    id_colaborador INT UNSIGNED NOT NULL,
    id_puesto INT NOT NULL,
    id_tipo_ausencia INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descripcion TEXT,
    soporte_url VARCHAR(255),
    id_usuario_registro INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_colaborador) REFERENCES colaboradores(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_puesto) REFERENCES puestos(id_puesto) ON DELETE RESTRICT,
    FOREIGN KEY (id_tipo_ausencia) REFERENCES tipos_ausencia(id_tipo_ausencia) ON DELETE RESTRICT,
    FOREIGN KEY (id_usuario_registro) REFERENCES users(id) ON DELETE RESTRICT
);
```

### Tabla archivos_ausencias
```sql
CREATE TABLE archivos_ausencias (
    id_archivo INT AUTO_INCREMENT PRIMARY KEY,
    id_ausencia INT NOT NULL,
    url_archivo VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_ausencia) REFERENCES ausencias(id_ausencia) ON DELETE CASCADE
);
```

## Tipos de Ausencia Iniciales
- Enfermedad
- Incumplimiento de horario
- Accidente laboral

## Notas Importantes

1. Solo Barranquilla y Cartagena tienen implementación de ausencias
2. Cementos y Grupo Argos no tienen esta funcionalidad aún
3. El componente calcula automáticamente la duración en días de cada ausencia
4. Las ausencias se filtran por fecha de inicio dentro del rango especificado
5. Solo se muestran ausencias activas (activo = TRUE) 