# Desarrollo en Windows y Linux

Esta guía utiliza el [contrato de comandos](../app/README.md). Las rutas se cuentan desde la raíz de `ITER_V.02`, salvo que se indique `app/`. No contiene operaciones de publicación ni requiere una base de datos.

## 1. Preparar el entorno

Instala [Node.js 24.22.1](https://nodejs.org/en/download/archive/v24.22.1) con npm. Usa una distribución compatible para tu sistema; no te bases en la indicación Node 20 heredada de la plantilla.

En PowerShell o Bash/sh:

```sh
node --version
npm --version
```

Abre la terminal en la raíz del repositorio. Si ya tienes `app/.env`, **consérvalo y revisa las claves que falten**; no ejecutes la copia sobre él.

### Windows · PowerShell

```powershell
Set-Location .\app
Copy-Item .env.example .env
npm ci
npm run dev
```

Si PowerShell bloquea `npm.ps1`, usa `npm.cmd` en los mismos comandos (`npm.cmd ci`, `npm.cmd run dev`) sin desactivar globalmente la política de ejecución.

### Linux · Bash/sh

```sh
cd app
cp .env.example .env
npm ci
npm run dev
```

`npm ci` utiliza `app/package-lock.json` y reinstala las dependencias de manera reproducible. No sustituyas el lockfile ni instales paquetes globales para sortear un fallo de instalación; revisa la versión de Node y el error original.

Abre `http://localhost:3000/`. El contrato es **un proceso Vite con frontend y API**, con tRPC bajo `/api/trpc`. Para detenerlo, usa `Ctrl+C`. Si el puerto está ocupado, libera el proceso o revisa la URL anunciada; un puerto distinto también cambia el origen CORS.

## 2. Configuración local

La referencia es [`app/.env.example`](../app/.env.example). El entorno se carga desde `app/`; ejecuta allí los scripts. No copies `.env` a `dist/public` ni compartas sus valores.

### Variables públicas del frontend

| Variable | Valor local inicial | Significado |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Vacío | Origen de API externa, sin rutas, parámetros, hash ni `/api/trpc`. Vacío usa mismo origen en desarrollo/Node; no crea una API en Pages/preview. |
| `VITE_CONTACT_EMAIL` | Vacío | Dirección pública autorizada, si existe. No se inventa un contacto ni se usa como configuración del destinatario del servidor. |
| `VITE_SITE_URL` | Vacío | URL pública final del sitio, sin fragmento de navegación. Solo rellenar cuando se conozca. |
| `VITE_BASE_PATH` | `/` | Base de los assets: `/` en local y dominio personalizado; `/ITER_V.02/` en el Pages de este proyecto. Conservar las barras inicial y final. |

Todo `VITE_*` queda incorporado en los estáticos que recibe el navegador. **No es un almacén de secretos**, aunque el repositorio sea privado. Un cambio requiere reiniciar Vite en desarrollo o reconstruir el frontend desplegado.

### Variables exclusivas del servidor/API

| Variable | Valor inicial | Uso |
| --- | --- | --- |
| `CONTACT_PROVIDER` | `smtp` | Selección explícita del proveedor; usa `smtp` para Hostinger Mail. |
| `RESEND_API_KEY` | Vacío | Clave propia de Resend; únicamente en el host de API o en el entorno local privado. |
| `CONTACT_FROM_EMAIL` | Vacío | Remitente del dominio; en Hostinger debe ser una dirección autorizada. |
| `CONTACT_TO_EMAIL` | Vacío | Destinatario real; se solicitó `contactanos@itercol.com`. |
| `SMTP_HOST` | `smtp.hostinger.com` | Servidor saliente de Hostinger Email. |
| `SMTP_PORT` | `465` | SSL/TLS implícito; el puerto `587` usa STARTTLS. |
| `SMTP_SECURE` | `true` en 465 | `true` para TLS implícito; `false` para STARTTLS. |
| `SMTP_USER` | Vacío | Usuario SMTP completo; solo en el entorno del servidor. |
| `SMTP_PASSWORD` | Vacío | Contraseña del buzón; secreto solo del servidor. |
| `ALLOWED_ORIGINS` | Vacío | Lista de orígenes exactos separados por comas para acceso externo. No admite rutas ni comodines. |
| `TRUST_PROXY` | `false` | Solo activar tras un proxy confiable que sustituya o sanee las cabeceras reenviadas. |
| `PORT` | `3000` | Puerto del servidor Node de producción; no cambia el puerto configurado del preview. |

Para desarrollo de mismo origen no hace falta añadir un origen externo. Si el frontend usa una API de otro origen, consulta la [configuración CORS](despliegue.md#api-externa-y-cors).

No hacen falta `DATABASE_URL`, migraciones, claves de IA ni credenciales de una plataforma ajena para la landing/contacto. Si el arranque aún exige variables de la plantilla, la integración del servidor está incompleta: no inventes secretos ni añadas una base de datos para ocultarlo.

Los cambios de configuración del servidor requieren reiniciar el proceso. Sin credenciales SMTP, la web debe arrancar y el formulario responder con un error honesto, no con una confirmación simulada.

## 3. Navegación e idiomas

| Vista | URL local |
| --- | --- |
| Inicio | `http://localhost:3000/#/` |
| Contacto | `http://localhost:3000/#/contacto` |
| Sección Método | `http://localhost:3000/#/?section=metodo` |

Las rutas internas de `HashRouter` son `/` y `/contacto`. La consulta `/?section=metodo` vive **dentro del hash**, no como una ruta de servidor ni como un segundo fragmento. Esto permite recargar enlaces de contacto en un host estático sin fallback SPA.

Español es el valor por defecto sin preferencia guardada. Inglés y francés son seleccionables; solo la preferencia de idioma se conserva en `localStorage`. El formulario no se guarda en almacenamiento persistente del navegador: sus campos se mantienen en memoria ante un error, pero pueden perderse al recargar, cerrar o desmontar la vista.

## 4. Comprobaciones y builds

Desde `app/`, en PowerShell o Bash/sh:

```sh
npm run check
npm test
npm run build
```

El build completo produce `dist/public` y `dist/boot.js`. Para probar frontend y API de producción:

```sh
npm start
```

El script de arranque debe ser compatible con ambos sistemas; no necesitas anteponer una asignación POSIX de `NODE_ENV` en PowerShell. Por defecto, abre `http://localhost:3000/` si `PORT=3000` está libre.

Para probar **solo estáticos**, detén el servidor anterior y ejecuta:

```sh
npm run build:pages
npm run preview
```

Abre `http://localhost:4173/`. Preview **no levanta la API**, aunque el directorio `dist` contenga un servidor de un build previo. Sin `VITE_API_BASE_URL` hacia una API operativa, el formulario debe informar que no se ha podido enviar y conservar sus campos; no se trata de una prueba de entrega de correo.

`npm test` utiliza simulaciones para las interacciones externas de contacto. Consulta la [verificación](verificacion.md) para las pruebas manuales y el envío real con credenciales propias. Los comandos anteriores son instrucciones, no resultados de pruebas ya ejecutadas.

## 5. Incidencias frecuentes

- **No existe `build:pages` o `start` falla en PowerShell:** falta integrar el contrato de scripts. No reemplaces el build de Pages por el build Node ni uses preview como backend.
- **Assets en blanco o 404:** revisa `VITE_BASE_PATH` y utiliza la misma base al compilar y al ejecutar preview. La guía de despliegue incluye la prueba de subruta.
- **El contacto falla en preview/Pages:** comprueba si hay API externa. No pongas la clave de Resend en Vite para evitar ese error.
- **La API rechaza el origen:** el esquema, host y puerto deben coincidir exactamente con `ALLOWED_ORIGINS`; la ruta `/ITER_V.02/` no pertenece al origen.
- **Cambiaste un `VITE_*` pero no se refleja:** reinicia Vite o reconstruye los estáticos; no se sustituye en tiempo de ejecución.
- **Se pierde el texto al recargar:** es un límite deliberado del estado en memoria. No hay una cola de mensajes ni recuperación persistente.
