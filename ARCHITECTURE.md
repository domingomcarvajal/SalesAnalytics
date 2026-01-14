# Arquitectura y Decisiones Técnicas

## Visión General

KampAI es una aplicación web para el análisis de reuniones de ventas que utiliza IA para extraer insights de transcripciones de reuniones. La aplicación permite cargar datos CSV, procesar transcripciones con IA y visualizar analytics en tiempo real.

## Stack Tecnológico

### Framework Principal: Next.js

**Decisión**: Utilizar Next.js como framework principal de la aplicación.

**Razones**:
- **Desarrollo inicial rápido**: Permite crear tanto frontend como backend en un solo proyecto
- **Vercel Integration**: Despliegue nativo y optimizado en Vercel
- **App Router**: Sistema de routing moderno y eficiente

### Base de Datos: Neon

**Decisión**: PostgreSQL Serverless con Neon como proveedor.

**Razones**:
- **Rapidez de despliegue**: Configuración instantánea sin infraestructura
- **PostgreSQL**: SQL estándar con características avanzadas (JSON, arrays)
- **Integración con Vercel**: Conexiones optimizadas

**Alternativas consideradas**:
- **Supabase**: Menor conocimiento por parte del equipo de desarrollo

### Despliegue: Vercel

**Decisión**: Despliegue en Vercel como plataforma principal.

**Razones**:
- **Rapidez de despliegue**: Deployments automáticos
- **Optimización Next.js**: Integración nativa con Next.js

**Alternativas consideradas**:
- **AWS/GCP**: Requeriría más configuración de infraestructura

## Arquitectura de la Aplicación

### Estructura de Directorios

```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── analytics/     # Analytics endpoints
│   │   ├── db/           # Database queries (raw SQL)
│   │   ├── export/       # Data export functionality
│   │   ├── filters/      # Filter options
│   │   └── process-transcripts/  # AI processing
│   ├── upload/           # CSV upload page
│   └── page.tsx          # Dashboard main page
├── components/           # React components
├── lib/                  # Utilities and services
│   ├── services/        # Business logic services
│   └── db.ts           # Database connection
└── types/               # TypeScript type definitions
```

### Patrón Arquitectónico

**Decisión**: Arquitectura en capas con separación clara de responsabilidades.

**Capas**:
1. **Presentation Layer** (Componentes React)
   - UI responsiva con Tailwind CSS
   - Componentes reutilizables
   - Estado local con React hooks

2. **API Layer** (Next.js API Routes)
   - Endpoints RESTful
   - Validación de entrada
   - Manejo de errores

3. **Service Layer** (Servicios de negocio)
   - Lógica de procesamiento de IA
   - Transformación de datos

4. **Data Layer** (Consultas SQL)
   - Queries parametrizadas
   - Optimización de performance
   - Seguridad SQL injection

### Decisiones de Diseño

#### Un Solo Repositorio

**Decisión**: Mantener frontend y backend en un solo repositorio.

**Razones**:
- **Simplicidad**: Un solo lugar para desarrollo y despliegue
- **No requiere APIs externas**: La API solo se consume internamente
- **Desarrollo más rápido**: Cambios coordinados entre frontend/backend
- **Deployment unificado**: Un solo pipeline de CI/CD

#### Procesamiento de IA

**Decisión**: Integración con Groq para procesamiento de transcripciones.

**Razones**:
- **Costo**: Más económico que alternativas similares
- **Simpleza**: Integración rápida y sin requerimientos previos

**Flujo de procesamiento**:
1. Extracción de texto de transcripciones
2. Prompt engineering con contexto de categorías
3. Parsing robusto de respuestas JSON
4. Almacenamiento estructurado en base de datos

#### Modelo de Datos

**Decisión**: Diseño de base de datos relacional con tablas normalizadas.

**Entidades principales**:
- `meetings`: Datos básicos de reuniones
- `industries`: Catálogo de industrias
- `pain_point_categories`: Categorías de dolores
- `discovery_trigger_categories`: Categorías de triggers
- `objective_categories`: Categorías de objetivos
- `technical_requirement_categories`: Categorías de requerimientos

**Relaciones**: Junction tables para muchos-a-muchos entre meetings y categorías.

## Decisiones de UX/UI

### Dashboard Analytics

**Decisión**: Dashboard con filtros dinámicos y visualizaciones interactivas.

**Características**:
- **Filtros múltiples**: Por vendedor, estado, industria y procesamiento
- **Visualizaciones**: Gráficos de barras horizontales y circulares
- **Loading states**: Esqueletos durante carga de datos
- **Responsive design**: Adaptable a diferentes tamaños de pantalla

### Procesamiento de Datos

**Decisión**: Procesamiento por lotes con feedback visual.

**Características**:
- **Progreso en tiempo real**: Indicadores de procesamiento
- **Manejo de errores**: Feedback claro en caso de fallos
- **Reintentos automáticos**: Robustez en procesamiento
- **Validación de datos**: Verificación antes del procesamiento

## Conclusión

La arquitectura elegida prioriza la **simplicidad** y **rapidez de desarrollo**. Next.js, Neon y Vercel forman una stack moderna y eficiente que permite desarrollo rápido de aplicaciones con IA, muy adecuadas para hacer prototipos.

La separación clara de responsabilidades y el diseño modular facilitan el mantenimiento y extensión futura de la aplicación.
