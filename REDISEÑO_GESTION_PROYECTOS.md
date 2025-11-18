# 🏗️ REDISEÑO COMPLETO: MÓDULO DE GESTIÓN DE PROYECTOS

**Fecha:** 18 de Noviembre, 2025  
**Objetivo:** Transformar el CRUD básico actual en un sistema profesional de gestión de proyectos

---

## ❌ PROBLEMA ACTUAL

El módulo actual es solo una **lista de proyectos** con datos básicos:
- Solo muestra nombre, código, fechas y estado
- No hay seguimiento de avance real
- No hay gestión de archivos/documentos
- No hay control presupuestario
- No hay métricas útiles para toma de decisiones
- No cumple con las necesidades de un proyecto de construcción

**En resumen:** Es un CRUD, NO es gestión de proyectos.

---

## ✅ SOLUCIÓN: MÓDULO PROFESIONAL

### 🎯 **VISIÓN DEL NUEVO MÓDULO**

Cuando un usuario abra un proyecto, debe ver:

```
┌────────────────────────────────────────────────────────────┐
│ 🏗️ Proyecto: Edificio Residencial Tarapacá               │
│ Estado: 🚧 En Ejecución | Coordinador: Juan Pérez        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ 📊 Avance   │  │ 💰 Presup.  │  │ ⏱️ Tiempo   │      │
│  │   68%       │  │  85% usado  │  │  45 días    │      │
│  │ ▰▰▰▰▰▰▱▱▱▱ │  │ $85M/$100M  │  │  restantes  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ 📦 Material │  │ 📄 Archivos │  │ ⚠️ Alertas  │      │
│  │  12 aprobad.│  │  24 docs    │  │   3 activas │      │
│  │   3 pend.   │  │   8 planos  │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ 📋 PESTAÑAS PRINCIPALES                                    │
│                                                            │
│ [Dashboard] [Cronograma] [Presupuesto] [Archivos]        │
│ [Materiales] [Equipo] [Actas] [Reportes]                 │
└────────────────────────────────────────────────────────────┘
```

---

## 📊 **NUEVA ESTRUCTURA DE DATOS**

### 1. **Tabla `proyectos` (Actualizada)**
```sql
ALTER TABLE proyectos ADD COLUMN:
- presupuesto_total DECIMAL(15,2)        -- Presupuesto inicial
- presupuesto_gastado DECIMAL(15,2)      -- Acumulado gastado
- porcentaje_avance INTEGER              -- 0-100%
- fecha_inicio_real DATE                 -- Cuándo realmente empezó
- fecha_estimada_finalizacion DATE       -- Reestimación dinámica
- prioridad VARCHAR(20)                  -- Alta/Media/Baja
- nivel_riesgo VARCHAR(20)               -- Alto/Medio/Bajo
- observaciones TEXT                     -- Notas importantes
- responsable_tecnico UUID               -- Ingeniero a cargo
- cliente_nombre VARCHAR(255)            -- Cliente del proyecto
- cliente_contacto VARCHAR(100)          -- Email/teléfono
```

### 2. **Nueva Tabla: `archivos_proyecto`**
```sql
CREATE TABLE archivos_proyecto (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  nombre VARCHAR(255),
  nombre_original VARCHAR(255),
  ruta VARCHAR(500),
  tamaño BIGINT,                         -- Bytes
  tipo VARCHAR(100),                     -- mime-type
  categoria VARCHAR(50),                 -- Planos/Contratos/Fotos/Otros
  descripcion TEXT,
  subido_por UUID REFERENCES usuarios(id),
  fecha_subida TIMESTAMP,
  version INTEGER DEFAULT 1,
  es_publico BOOLEAN DEFAULT false
);
```

### 3. **Nueva Tabla: `hitos_proyecto`**
```sql
CREATE TABLE hitos_proyecto (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  nombre VARCHAR(255),
  descripcion TEXT,
  fecha_programada DATE,
  fecha_real DATE,                       -- Cuándo se completó realmente
  porcentaje_peso INTEGER,               -- Qué % del proyecto representa
  estado VARCHAR(20),                    -- Pendiente/En Progreso/Completado/Atrasado
  responsable UUID REFERENCES usuarios(id),
  dependencias JSONB,                    -- IDs de hitos que deben completarse antes
  creado_por UUID,
  fecha_creacion TIMESTAMP
);
```

### 4. **Nueva Tabla: `actividades_proyecto`**
```sql
CREATE TABLE actividades_proyecto (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  hito_id UUID REFERENCES hitos_proyecto(id),
  nombre VARCHAR(255),
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  duracion_dias INTEGER,
  estado VARCHAR(20),
  asignado_a UUID REFERENCES usuarios(id),
  orden INTEGER,                         -- Para ordenar visualmente
  es_critica BOOLEAN DEFAULT false       -- Actividad del camino crítico
);
```

### 5. **Nueva Tabla: `gastos_proyecto`**
```sql
CREATE TABLE gastos_proyecto (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  categoria VARCHAR(100),                -- Materiales/Mano de obra/Equipos/Otros
  concepto VARCHAR(255),
  monto DECIMAL(15,2),
  fecha DATE,
  proveedor_id UUID REFERENCES proveedores(id),
  orden_compra_id UUID,
  comprobante_path VARCHAR(500),         -- Factura/boleta escaneada
  aprobado_por UUID REFERENCES usuarios(id),
  notas TEXT,
  creado_por UUID,
  fecha_registro TIMESTAMP
);
```

### 6. **Nueva Tabla: `alertas_proyecto`**
```sql
CREATE TABLE alertas_proyecto (
  id UUID PRIMARY KEY,
  proyecto_id UUID REFERENCES proyectos(id),
  tipo VARCHAR(50),                      -- presupuesto/tiempo/hito/material/otro
  nivel VARCHAR(20),                     -- info/warning/critical
  mensaje TEXT,
  fecha_generacion TIMESTAMP,
  fecha_leida TIMESTAMP,
  leida_por UUID REFERENCES usuarios(id),
  resuelta BOOLEAN DEFAULT false
);
```

---

## 🎨 **NUEVO DISEÑO DE INTERFAZ**

### **VISTA 1: Dashboard del Proyecto**

```jsx
<ProjectDashboard>
  {/* Header con info básica */}
  <ProjectHeader
    nombre={proyecto.nombre}
    estado={proyecto.estado}
    coordinador={proyecto.coordinador}
    cliente={proyecto.cliente_nombre}
  />

  {/* Cards de métricas principales */}
  <MetricsGrid>
    <MetricCard
      title="Avance General"
      value={proyecto.porcentaje_avance}
      icon="📊"
      type="progress"
      trend="+5% esta semana"
    />
    <MetricCard
      title="Presupuesto"
      value={`${proyecto.presupuesto_gastado}M / ${proyecto.presupuesto_total}M`}
      icon="💰"
      type="budget"
      alert={proyecto.presupuesto_gastado > proyecto.presupuesto_total * 0.9}
    />
    <MetricCard
      title="Tiempo Restante"
      value={diasRestantes}
      icon="⏱️"
      type="time"
      subtitle={`Fin: ${proyecto.fecha_termino}`}
    />
    <MetricCard
      title="Materiales"
      value={`${materialesAprobados} aprobados`}
      icon="📦"
      type="materials"
      subtitle={`${materialesPendientes} pendientes`}
    />
    <MetricCard
      title="Archivos"
      value={totalArchivos}
      icon="📄"
      type="files"
      breakdown={{
        planos: 8,
        contratos: 3,
        fotos: 13
      }}
    />
    <MetricCard
      title="Alertas Activas"
      value={alertasActivas.length}
      icon="⚠️"
      type="alerts"
      level={nivelAlertaMasAlta}
    />
  </MetricsGrid>

  {/* Gráficos */}
  <ChartsSection>
    <ProgressChart data={hitosCompletados} />
    <BudgetChart data={gastosP orCategoria} />
  </ChartsSection>

  {/* Actividades recientes */}
  <RecentActivity>
    <ActivityItem type="file" text="Juan subió 'Plano_Fundaciones_v2.pdf'" />
    <ActivityItem type="material" text="Se aprobaron 5 materiales" />
    <ActivityItem type="hito" text="Hito 'Excavación' completado" />
  </RecentActivity>
</ProjectDashboard>
```

---

### **VISTA 2: Cronograma / Timeline**

```jsx
<ProjectTimeline>
  {/* Vista tipo Gantt simplificada */}
  <TimelineHeader
    fechaInicio={proyecto.fecha_inicio}
    fechaFin={proyecto.fecha_termino}
    hoy={new Date()}
  />

  <TimelineGrid>
    {hitos.map(hito => (
      <HitoRow key={hito.id}>
        <HitoInfo
          nombre={hito.nombre}
          peso={hito.porcentaje_peso}
          estado={hito.estado}
        />
        <HitoBar
          inicio={hito.fecha_programada}
          fin={hito.fecha_real || estimacion}
          estado={hito.estado}
          critico={hito.es_critico}
        />
        <HitoActions>
          <button>Marcar Completado</button>
          <button>Ver Actividades</button>
        </HitoActions>
      </HitoRow>
    ))}
  </TimelineGrid>

  {/* Línea de "hoy" */}
  <TodayMarker position={calculatedPosition} />

  {/* Panel de actividades del hito seleccionado */}
  <ActivityPanel hito={selectedHito}>
    {actividades.map(act => (
      <ActivityItem
        nombre={act.nombre}
        asignado={act.asignado_a}
        duracion={act.duracion_dias}
        estado={act.estado}
      />
    ))}
  </ActivityPanel>
</ProjectTimeline>
```

---

### **VISTA 3: Gestión de Presupuesto**

```jsx
<BudgetManager>
  {/* Resumen financiero */}
  <BudgetSummary>
    <SummaryCard
      label="Presupuesto Total"
      value={proyecto.presupuesto_total}
      color="blue"
    />
    <SummaryCard
      label="Gastado"
      value={proyecto.presupuesto_gastado}
      percentage={porcentajeGastado}
      color={porcentajeGastado > 85 ? 'red' : 'green'}
    />
    <SummaryCard
      label="Disponible"
      value={proyecto.presupuesto_total - proyecto.presupuesto_gastado}
      color="gray"
    />
  </BudgetSummary>

  {/* Gráfico de pastel: gastos por categoría */}
  <PieChart data={gastosPorCategoria} />

  {/* Tabla de gastos */}
  <ExpensesTable>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Categoría</th>
        <th>Concepto</th>
        <th>Proveedor</th>
        <th>Monto</th>
        <th>Comprobante</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {gastos.map(gasto => (
        <tr key={gasto.id}>
          <td>{formatDate(gasto.fecha)}</td>
          <td><CategoryBadge>{gasto.categoria}</CategoryBadge></td>
          <td>{gasto.concepto}</td>
          <td>{gasto.proveedor.nombre}</td>
          <td>${formatNumber(gasto.monto)}</td>
          <td>
            {gasto.comprobante_path && (
              <button onClick={() => descargarComprobante(gasto.id)}>
                📄 Ver
              </button>
            )}
          </td>
          <td>
            <button>✏️ Editar</button>
            <button>🗑️ Eliminar</button>
          </td>
        </tr>
      ))}
    </tbody>
  </ExpensesTable>

  {/* Botón para registrar nuevo gasto */}
  <FloatingButton onClick={abrirModalGasto}>
    ➕ Registrar Gasto
  </FloatingButton>
</BudgetManager>
```

---

### **VISTA 4: Gestor de Archivos**

```jsx
<FileManager>
  {/* Tabs por categoría */}
  <FileTabs>
    <Tab active={categoria === 'todos'}>📁 Todos ({totalArchivos})</Tab>
    <Tab active={categoria === 'planos'}>📐 Planos ({archivosPlanos.length})</Tab>
    <Tab active={categoria === 'contratos'}>📝 Contratos ({archivosContratos.length})</Tab>
    <Tab active={categoria === 'fotos'}>📸 Fotos ({archivosFotos.length})</Tab>
    <Tab active={categoria === 'otros'}>📄 Otros ({archivosOtros.length})</Tab>
  </FileTabs>

  {/* Área de drag & drop */}
  <UploadZone onDrop={subirArchivos}>
    <p>Arrastra archivos aquí o haz click para seleccionar</p>
    <p className="text-sm">Máx. 50MB por archivo</p>
  </UploadZone>

  {/* Lista de archivos */}
  <FileGrid>
    {archivos.map(archivo => (
      <FileCard key={archivo.id}>
        <FileIcon type={archivo.tipo} />
        <FileName>{archivo.nombre}</FileName>
        <FileMetadata>
          <span>{formatFileSize(archivo.tamaño)}</span>
          <span>{formatDate(archivo.fecha_subida)}</span>
          <span>por {archivo.subido_por.nombre}</span>
        </FileMetadata>
        <FileActions>
          <button onClick={() => descargar(archivo.id)}>⬇️ Descargar</button>
          <button onClick={() => previsualizar(archivo.id)}>👁️ Ver</button>
          <button onClick={() => eliminar(archivo.id)}>🗑️ Eliminar</button>
        </FileActions>
        {archivo.version > 1 && (
          <VersionBadge>v{archivo.version}</VersionBadge>
        )}
      </FileCard>
    ))}
  </FileGrid>
</FileManager>
```

---

### **VISTA 5: Alertas y Notificaciones**

```jsx
<AlertsPanel>
  <AlertsHeader>
    <h2>⚠️ Alertas del Proyecto ({alertasActivas.length})</h2>
    <button onClick={marcarTodasLeidas}>Marcar todas como leídas</button>
  </AlertsHeader>

  <AlertsList>
    {alertas.map(alerta => (
      <AlertCard key={alerta.id} nivel={alerta.nivel}>
        <AlertIcon nivel={alerta.nivel} />
        <AlertContent>
          <AlertTitle>{getTituloAlerta(alerta.tipo)}</AlertTitle>
          <AlertMessage>{alerta.mensaje}</AlertMessage>
          <AlertTimestamp>{timeAgo(alerta.fecha_generacion)}</AlertTimestamp>
        </AlertContent>
        <AlertActions>
          <button onClick={() => resolverAlerta(alerta.id)}>
            ✓ Resolver
          </button>
          <button onClick={() => verDetalles(alerta.id)}>
            👁️ Ver más
          </button>
        </AlertActions>
      </AlertCard>
    ))}
  </AlertsList>
</AlertsPanel>
```

**Tipos de alertas automáticas:**
- 🔴 **Críticas:**
  - Presupuesto excedido
  - Proyecto atrasado más de 7 días
  - Hito crítico sin completar en fecha límite
  
- 🟡 **Advertencias:**
  - Presupuesto al 85%
  - Fecha de término en menos de 15 días
  - Material pendiente por más de 7 días
  
- 🔵 **Información:**
  - Hito completado
  - Nuevo archivo subido
  - Gasto registrado

---

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Backend - Nuevos Endpoints**

```javascript
// === GESTIÓN DE ARCHIVOS ===
POST   /api/projects/:id/files/upload
GET    /api/projects/:id/files
GET    /api/projects/:id/files/:fileId/download
DELETE /api/projects/:id/files/:fileId

// === HITOS Y ACTIVIDADES ===
POST   /api/projects/:id/hitos
GET    /api/projects/:id/hitos
PUT    /api/projects/:id/hitos/:hitoId
DELETE /api/projects/:id/hitos/:hitoId
POST   /api/projects/:id/hitos/:hitoId/completar
GET    /api/projects/:id/actividades

// === PRESUPUESTO Y GASTOS ===
POST   /api/projects/:id/gastos
GET    /api/projects/:id/gastos
PUT    /api/projects/:id/gastos/:gastoId
DELETE /api/projects/:id/gastos/:gastoId
GET    /api/projects/:id/resumen-financiero

// === MÉTRICAS Y DASHBOARD ===
GET    /api/projects/:id/dashboard
GET    /api/projects/:id/estadisticas
PUT    /api/projects/:id/avance  // Actualizar porcentaje

// === ALERTAS ===
GET    /api/projects/:id/alertas
POST   /api/projects/:id/alertas/:alertaId/resolver
POST   /api/projects/:id/alertas/:alertaId/marcar-leida

// === REPORTES ===
GET    /api/projects/:id/reporte/ejecutivo
GET    /api/projects/:id/reporte/financiero
GET    /api/projects/:id/reporte/cronograma
```

### **Frontend - Nuevos Componentes**

```
src/pages/Projects/
├── ProjectsList.jsx              # Lista principal (ya existe)
├── ProjectDashboard.jsx          # ⭐ NUEVO - Dashboard principal
├── ProjectTimeline.jsx           # ⭐ NUEVO - Cronograma
├── ProjectBudget.jsx             # ⭐ NUEVO - Gestión financiera
├── ProjectFiles.jsx              # ⭐ NUEVO - Gestor de archivos
├── ProjectAlerts.jsx             # ⭐ NUEVO - Panel de alertas
│
└── components/
    ├── MetricCard.jsx            # Card de métrica
    ├── ProgressBar.jsx           # Barra de progreso
    ├── BudgetChart.jsx           # Gráfico de presupuesto
    ├── TimelineGrid.jsx          # Grid del cronograma
    ├── HitoCard.jsx              # Card de hito
    ├── FileUploadZone.jsx        # Zona de drag & drop
    ├── FileCard.jsx              # Card de archivo
    ├── AlertCard.jsx             # Card de alerta
    ├── ExpenseForm.jsx           # Formulario de gasto
    └── ReportGenerator.jsx       # Generador de reportes
```

---

## 📦 **LIBRERÍAS RECOMENDADAS**

```json
{
  "dependencies": {
    // Gráficos
    "recharts": "^2.10.0",           // Gráficos bonitos y simples
    "chart.js": "^4.4.0",            // Alternativa popular
    
    // Gestión de archivos
    "react-dropzone": "^14.2.3",     // Drag & drop de archivos
    "file-saver": "^2.0.5",          // Descargar archivos
    
    // Fechas y timeline
    "date-fns": "^2.30.0",           // Manejo de fechas
    "react-big-calendar": "^1.8.5",  // Calendario/Timeline avanzado
    
    // Exportar PDF
    "jspdf": "^2.5.1",               // Generar PDFs
    "html2canvas": "^1.4.1",         // Capturar HTML como imagen
    
    // UI mejorada
    "react-toastify": "^9.1.3",      // Notificaciones toast
    "react-icons": "^4.12.0",        // Iconos
    "framer-motion": "^10.16.0"      // Animaciones suaves
  }
}
```

---

## 🚀 **PLAN DE IMPLEMENTACIÓN (3 FASES)**

### **FASE 1: Fundamentos (Semana 1-2)** ⭐ PRIORITARIO

1. ✅ Crear nuevas tablas en PostgreSQL
2. ✅ Migrar datos existentes
3. ✅ Backend - Endpoints de archivos
4. ✅ Backend - Endpoints de hitos
5. ✅ Backend - Endpoints de gastos
6. ✅ Frontend - Dashboard básico con métricas
7. ✅ Frontend - Gestor de archivos con upload

**Entregable:** Proyecto muestra progreso real, tiene archivos y control básico de gastos

---

### **FASE 2: Visualización (Semana 3-4)**

1. ✅ Frontend - Cronograma/Timeline visual
2. ✅ Frontend - Gráficos de presupuesto
3. ✅ Backend - Sistema de alertas automáticas
4. ✅ Frontend - Panel de alertas
5. ✅ Cálculo automático de % avance basado en hitos

**Entregable:** Usuario ve visualmente el avance del proyecto en el tiempo

---

### **FASE 3: Inteligencia (Semana 5-6)**

1. ✅ Generación de reportes PDF
2. ✅ Predicción de fecha de finalización (ML básico)
3. ✅ Análisis de riesgos automático
4. ✅ Recomendaciones de optimización
5. ✅ Exportar/importar proyectos completos

**Entregable:** Sistema inteligente que ayuda en la toma de decisiones

---

## 💡 **CASOS DE USO REALES**

### **Escenario 1: Supervisor revisa proyecto**
```
1. Abre "Edificio Tarapacá"
2. Dashboard muestra:
   - ✅ Avance: 68% (en meta)
   - ⚠️ Presupuesto: 85% usado con 32% pendiente
   - ✅ Tiempo: 45 días restantes
   - 🔴 Alerta: "Hito 'Instalaciones' atrasado 3 días"
3. Click en alerta → Ve cronograma
4. Identifica actividad bloqueada
5. Reasigna responsable
6. Marca hito como completado cuando termina
```

### **Escenario 2: Registrar gasto de materiales**
```
1. En vista Presupuesto
2. Click "Registrar Gasto"
3. Llena formulario:
   - Categoría: Materiales
   - Concepto: Cemento Portland (50 sacos)
   - Proveedor: Ferretería Central
   - Monto: $275,000
   - Sube foto de factura
4. Sistema actualiza:
   - Presupuesto gastado
   - Gráfico de gastos
   - Si excede 90% → genera alerta
```

### **Escenario 3: Subir plano actualizado**
```
1. En vista Archivos
2. Tab "Planos"
3. Arrastra "Plano_Estructural_v3.pdf"
4. Sistema:
   - Sube archivo
   - Detecta v2 existente
   - Incrementa versión a v3
   - Notifica al equipo del proyecto
```

---

## 📊 **MÉTRICAS DE ÉXITO**

Al final de la implementación, el módulo debe:

✅ **Mostrar 6 métricas principales en dashboard**
✅ **Permitir subir/descargar mínimo 3 tipos de archivos**
✅ **Calcular automáticamente % avance basado en hitos**
✅ **Generar 3 tipos de alertas automáticas**
✅ **Mostrar cronograma visual con mínimo 5 hitos**
✅ **Registrar y categorizar gastos del proyecto**
✅ **Exportar reporte ejecutivo en PDF**
✅ **Tiempo de carga < 2 segundos**

---

## 🎯 **DIFERENCIA ANTES Y DESPUÉS**

### ANTES (Actual) ❌
```
Lista simple → Click proyecto → Formulario básico
- Solo datos de texto
- Sin seguimiento
- Sin archivos
- Sin métricas
```

### DESPUÉS (Nuevo) ✅
```
Lista → Dashboard completo → 8 pestañas funcionales
- Métricas en tiempo real
- Avance visual
- Archivos organizados
- Control presupuestario
- Cronograma interactivo
- Alertas inteligentes
- Reportes exportables
```

---

## 🤝 **PRÓXIMOS PASOS**

**Cuando el servidor PostgreSQL esté listo:**

1. 🗄️ Ejecutar scripts de migración (crear tablas nuevas)
2. 🔧 Implementar endpoints del backend (empezar con archivos y hitos)
3. 🎨 Crear componente ProjectDashboard.jsx
4. 🧪 Probar con datos de ejemplo
5. 🚀 Desplegar FASE 1

**¿Estás listo para empezar cuando levanten el servidor? 🔥**

---

*Documento generado el 18/11/2025 - Sistema ERP Tarapacá*
