# KampAI

**Aplicación web de análisis de reuniones de ventas con IA**

La aplicación se encuentra desplegada en: https://v0-sales-meeting-analysis.vercel.app/

## Configuración de Desarrollo Local

### Prerrequisitos

- Node.js 20.9.0 o superior instalado

#### Instalación de Node.js con nvm

Si usas nvm para manejar versiones de Node.js:

```bash
# Instalar Node.js 20.9.0
nvm install 20.9.0

# Usar Node.js 20.9.0
nvm use 20.9.0

# Verificar la versión instalada
node --version
```

### Configuración del Entorno

Por simplicidad, el archivo `.env.local` con toda la configuración necesaria (URL de base de datos y claves de API) será proporcionado. No se requiere configuración adicional.

### Formato CSV

La aplicación espera archivos CSV con las siguientes columnas:

- `client_name` (string)
- `client_email` (string)
- `client_phone_number` (string)
- `meeting_date` (string, se convertirá a fecha)
- `sales_person` (string)
- `closed` (0 o 1, se convertirá a booleano)
- `transcript` (string)

**Importante:** El archivo CSV debe estar separado por el carácter `;` (punto y coma) para evitar problemas de formato.

### Ejecutar Localmente

Instala las dependencias e inicia el servidor de desarrollo:

```bash
# Usando npm
npm install
npm run dev

# O usando yarn
yarn install
yarn dev

# O usando pnpm
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### Flujo de la Aplicación

1. **Subir Datos** (`/upload`) - Sube archivos CSV con datos de reuniones
2. **Procesar** (`/process`) - Ejecuta análisis de IA en las transcripciones usando Groq para extraer insights
3. **Dashboard** (`/`) - Visualiza analytics con filtros e visualizaciones

## Supuestos del Sistema

Esta aplicación se basa en los siguientes supuestos:

1. **Enfoque en métricas generales**: No es necesario implementar una vista detallada para ver cada reunión individual con sus dolores específicos, ya que la plataforma está diseñada para proporcionar métricas generales y análisis agregados, no vistas específicas de reuniones individuales.

2. **Panel de administración existente**: Se asume que en una aplicación más completa ya existirá un panel de administración separado para visualizar y modificar manualmente los datos de la base de datos.

3. **Formato de datos válido**: Los archivos CSV subidos contienen datos en el formato correcto especificado, sin necesidad de validación adicional o limpieza de datos.
