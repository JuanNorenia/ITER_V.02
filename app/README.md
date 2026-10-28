# Aplicación ITER

Frontend React 19 + TypeScript + Vite 7 + Tailwind CSS 3, con API Hono/tRPC y producción Node.js. Este README sustituye la plantilla inicial de Vite; la [entrada del repositorio](../README.md) y las [guías](../docs/desarrollo.md) describen el proyecto.

> Los comandos y comportamientos siguientes son el contrato de integración. Si falta un script o su comportamiento no coincide, integra el cambio correspondiente antes de desplegar: este documento y el workflow no implementan código de la app ni certifican pruebas superadas.

## Requisitos e instalación

- Node.js **24.22.1** (fijado en `engines` y `.nvmrc`).
- npm y el `package-lock.json` de esta carpeta: utiliza `npm ci`.
- No se requiere base de datos para la landing y el formulario de contacto.

Abre una terminal en `app/`. Crea el entorno local **solo si no tienes `.env`**:

```powershell
# PowerShell
Copy-Item .env.example .env
```

```sh
# Linux
cp .env.example .env
```

Después, en cualquiera de los dos sistemas:

```sh
npm ci
npm run dev
```

Frontend y API: `http://localhost:3000/`. Consulta la [guía de desarrollo](../docs/desarrollo.md) para configurar las variables y resolver incidencias.

## Contrato de scripts

| Comando | Uso |
| --- | --- |
| `npm run dev` | Vite en el puerto 3000, frontend y API en el mismo origen |
| `npm run check` | Comprobaciones estáticas del proyecto |
| `npm test` | Pruebas automatizadas; proveedor externo simulado, sin entrega real |
| `npm run build` | Compila `dist/public` y el servidor Node `dist/boot.js` |
| `npm run build:pages` | Ejecuta `vite build --mode pages`; compila solo el frontend |
| `npm run preview` | Sirve estáticos en el puerto 4173; no ejecuta Hono/tRPC |
| `npm start` | Arranca la producción Node tras un build completo, con script compatible con Windows y Linux |

No uses `npm run preview` como prueba de backend ni `npm start` para validar un build exclusivamente Pages. Un `dist/boot.js` de un build anterior puede seguir existiendo: no convierte el build estático en un build completo.

## Entorno

La referencia es [`.env.example`](.env.example); indica `contactanos@itercol.com` como remitente/destino solicitado, pero deja vacía la contraseña SMTP. El envío real requiere configurar esa credencial de forma privada.

- Públicas, incorporadas por Vite al build: `VITE_API_BASE_URL`, `VITE_CONTACT_EMAIL`, `VITE_SITE_URL`, `VITE_BASE_PATH`.
- Solo API/servidor: `CONTACT_PROVIDER`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `ALLOWED_ORIGINS`, `TRUST_PROXY`, `PORT`.
- Nunca pongas secretos en variables `VITE_*`, en el navegador ni en variables del repositorio destinadas al build de Pages.
- `VITE_API_BASE_URL` es un origen externo sin `/api/trpc`. Vacío permite mismo origen en desarrollo/Node; Pages y preview sin API no pueden confirmar envío.
- `VITE_CONTACT_EMAIL` no configura el destinatario del backend. No se proporciona ninguna dirección ficticia como contacto real.

Los cambios en `VITE_*` requieren reiniciar desarrollo o reconstruir los estáticos. Los cambios del servidor requieren reiniciarlo.

## Rutas, idiomas e identidad

`HashRouter` utiliza `/` y `/contacto` como rutas internas: `/#/` y `/#/contacto`. Un enlace a una sección tiene la forma `/#/?section=metodo`; no se pide `/contacto` al servidor de Pages.

Español es el idioma inicial; inglés y francés se seleccionan en la UI y la preferencia se conserva en `localStorage`. Los datos del formulario no se guardan allí. Ante API ausente o error del proveedor, se informa del problema y se mantienen los campos en memoria, sin simular éxito.

Se mantienen el hero, el caballo y la identidad original. La nueva pieza ASCII de contacto es independiente, no una sustitución. El overlay de privacidad existente sigue siendo un documento provisional pendiente de revisión.

## Guías de trabajo

- [Desarrollo Windows/Linux y entorno](../docs/desarrollo.md).
- [Despliegue manual a Pages, bases de ruta y API externa](../docs/despliegue.md).
- [Arquitectura y límites](../docs/arquitectura.md).
- [Verificación de UI, errores y envío real](../docs/verificacion.md).
