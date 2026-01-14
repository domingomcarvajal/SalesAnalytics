# KampAI

**Aplicación web de análisis de reuniones de ventas con IA**

La aplicación se encuentra desplegada en: https://v0-sales-meeting-analysis.vercel.app/

## Configuración de Desarrollo Local

### Prerrequisitos

- Node.js 20+ instalado

### Configuración del Entorno

Por simplicidad, el archivo `.env.local` con toda la configuración necesaria (URL de base de datos y claves de API) será proporcionado. No se requiere configuración adicional.

### Formato CSV

<<<<<<< Updated upstream
Continue building your app on:

**[https://v0.app/chat/dWlkSEPFWQD](https://v0.app/chat/dWlkSEPFWQD)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- A Neon database (already connected to your v0 project)
- An OpenAI API key for transcript processing

### Environment Variables

1. Copy the example environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Fill in your actual values in `.env.local`:
   - `DATABASE_URL`: Get this from your [Neon dashboard](https://console.neon.tech)
   - `OPENAI_API_KEY`: Get this from [OpenAI Platform](https://platform.openai.com/api-keys)

### Database Setup

Run the SQL migration scripts in order:

1. `scripts/001-create-tables.sql` - Creates initial tables
2. `scripts/002-update-schema.sql` - Updates schema to match CSV format

You can run these directly from the v0 interface or using a Neon SQL client.

### CSV Format

The application expects CSV files with the following columns:
=======
La aplicación espera archivos CSV con las siguientes columnas:
>>>>>>> Stashed changes

- `client_name` (string)
- `client_email` (string)
- `client_phone_number` (string)
- `meeting_date` (string, se convertirá a fecha)
- `sales_person` (string)
- `closed` (0 o 1, se convertirá a booleano)
- `transcript` (string)

### Ejecutar Localmente

Instala las dependencias e inicia el servidor de desarrollo:

<<<<<<< Updated upstream
\`\`\`bash
npm install
npm run dev
\`\`\`
=======
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
>>>>>>> Stashed changes

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### Flujo de la Aplicación

1. **Subir Datos** (`/upload`) - Sube archivos CSV con datos de reuniones
2. **Procesar** (`/process`) - Ejecuta análisis de IA en las transcripciones usando Groq para extraer insights
3. **Dashboard** (`/`) - Visualiza analytics con filtros e visualizaciones
