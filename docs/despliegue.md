# Despliegue: GitHub Pages y servidor Node

Esta guía prepara una publicación voluntaria. Crear los archivos no publica nada: en este subtrabajo no se ejecuta el workflow, no se hace push ni se cambia la visibilidad del repositorio.

## Elegir el modo

| Modo | Build | Ejecución | Contacto |
| --- | --- | --- | --- |
| GitHub Pages | `npm run build:pages` | Solo `app/dist/public` en Pages | Necesita una API HTTPS externa para enviar |
| Preview local | `npm run build:pages` | `npm run preview`, puerto 4173 | No hay backend local de preview; API externa opcional |
| Producción Node | `npm run build` | `npm start`, puerto `PORT` | API y estáticos en el mismo servidor; proveedor por configurar |

GitHub Pages no ejecuta `dist/boot.js`, Hono ni tRPC y no ofrece secretos de servidor. Un frontend publicado sin API puede navegar y mostrar el formulario, pero **no puede confirmar un envío**. No se activa un éxito ficticio ni una persistencia local del mensaje.

## GitHub Pages manual

### Requisitos y privacidad

- Repositorio previsto: [JuanNorenia/ITER_V.02](https://github.com/JuanNorenia/ITER_V.02). No se supone que Pages ya esté habilitado.
- El plan debe permitir Pages para ese repositorio privado. GitHub documenta Pages privado con Pro, Team o Enterprise; comprueba las condiciones aplicables a la cuenta. **No cambies el repositorio a público como solución automática.**
- La privacidad del código no garantiza privacidad del sitio. Revisa el acceso a Pages y asume que los estáticos, textos y `VITE_*` pueden ser públicos; el acceso privado al sitio depende de capacidades específicas del plan y su configuración.
- Actions debe estar permitido y el workflow debe estar disponible en la rama predeterminada para mostrar la ejecución manual. La rama elegida para la ejecución debe contener la integración completa; respeta las restricciones del entorno `github-pages`.
- Antes de una publicación real, completa la [verificación](verificacion.md), revisa la política provisional y confirma que quieres exponer el contenido.

Referencias: [disponibilidad y naturaleza estática de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) y [workflows personalizados](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

### Variables públicas de build

En **Settings → Secrets and variables → Actions → Variables**, configura únicamente las variables públicas que necesites. El workflow lee `vars.VITE_*`, no credenciales de proveedor.

| Variable del repositorio | Configuración |
| --- | --- |
| `VITE_BASE_PATH` | Vacía permite cálculo automático para proyecto/usuario; `/` obligatorio si usas dominio personalizado; también permite una base explícita válida. |
| `VITE_API_BASE_URL` | Vacía hasta tener una API; después, su origen HTTPS real, sin `/api/trpc`, ruta, query ni hash. |
| `VITE_CONTACT_EMAIL` | Vacía salvo que exista un correo público real y autorizado. No configura `CONTACT_TO_EMAIL`. |
| `VITE_SITE_URL` | Vacía hasta conocer la URL pública; para el Pages estándar previsto, `https://juannorenia.github.io/ITER_V.02/`, sin hash. Si usas dominio propio, usa la URL real correspondiente. |

**Nunca añadas `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` ni otras variables privadas al build de Pages, ni como `VITE_*` ni como secretos inyectados.** Se configuran únicamente en el host de la API. Las variables públicas quedan fijadas al compilar; cambiarlas en Settings exige ejecutar de nuevo el workflow.

### Cálculo de la base

Vite usa `/` por defecto en local. El workflow calcula `VITE_BASE_PATH` mediante una expresión de GitHub Actions, sin comandos de publicación:

```text
${{ vars.VITE_BASE_PATH || (github.event.repository.name == format('{0}.github.io', github.repository_owner) && '/' || format('/{0}/', github.event.repository.name)) }}
```

Orden de resolución:

1. Una variable de repositorio `VITE_BASE_PATH` no vacía prevalece. Para **dominio personalizado**, debes definirla como `/`.
2. Si el repositorio se llama exactamente como el sitio de usuario/organización (`propietario.github.io`), usa `/`.
3. En otro caso, usa `/nombre-del-repositorio/`. En este repositorio: **`/ITER_V.02/`**, respetando mayúsculas y barras.

No se detecta el dominio personalizado durante el build: configura expresamente `VITE_BASE_PATH=/` junto con el dominio en Pages y su DNS. `VITE_SITE_URL` no sustituye esta variable. La acción `configure-pages` se ejecuta en el job de despliegue, que sí tiene permiso de Pages; el job de build solo necesita `contents: read`.

URL prevista sin dominio personalizado: `https://juannorenia.github.io/ITER_V.02/`. Contacto: `https://juannorenia.github.io/ITER_V.02/#/contacto`. Método: `https://juannorenia.github.io/ITER_V.02/#/?section=metodo`. Estas URLs describen el destino esperado, no afirman que exista un sitio publicado.

### Flujo manual desde GitHub

Solo cuando decidas publicar:

1. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**. No hace falta una rama `gh-pages`.
2. Si corresponde, configura el dominio personalizado, su DNS y HTTPS según GitHub; actualiza la base, la URL pública y CORS de la API. No se incluye un dominio supuesto.
3. En **Actions**, abre **Desplegar Pages manualmente** y pulsa **Run workflow**. Selecciona una rama que contenga todos los cambios integrados y autorizados por el entorno.
4. El build usa Node 24, caché npm ligada a `app/package-lock.json`, y ejecuta `npm ci`, `npm run check`, `npm test` y `npm run build:pages` desde `app/`. Un fallo detiene el despliegue.
5. Se verifica `dist/public/index.html` y se sube **solo `app/dist/public`** con `upload-pages-artifact`. Nunca se sube `app/dist` completo, `.env` ni `dist/boot.js`.
6. El job dependiente lee la configuración existente con `configure-pages` (`enablement: false`) y publica con `deploy-pages`. Revisa la URL devuelta y realiza las pruebas manuales.

El archivo es [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml). Solo tiene `workflow_dispatch`: no hay eventos push, pull request ni programación periódica. Una ejecución manual autorizada **sí publica**; no es un ensayo. Los permisos globales están vacíos, el build tiene únicamente `contents: read`, y deploy únicamente `pages: write` e `id-token: write`. No requiere PAT ni habilita Pages automáticamente.

El flujo sube un sitio ya compilado, sin ejecutar Jekyll: **no necesita `.nojekyll`**. Tampoco necesita un `404.html` con redirección SPA, porque la navegación se resuelve en el hash.

### Probar la subruta antes de publicar

Desde `app/`, con dependencias instaladas y sin otro preview abierto. Hay que usar la misma base en build y preview.

PowerShell:

```powershell
$env:VITE_BASE_PATH = '/ITER_V.02/'
npm run build:pages
npm run preview
```

Después de detener preview con `Ctrl+C`, retira el override de esta sesión si lo creaste para la prueba:

```powershell
Remove-Item Env:VITE_BASE_PATH
```

Linux · Bash/sh:

```sh
VITE_BASE_PATH=/ITER_V.02/ npm run build:pages
VITE_BASE_PATH=/ITER_V.02/ npm run preview
```

Abre `http://localhost:4173/ITER_V.02/#/contacto` y recarga. Comprueba assets y `#/?section=metodo`. Para probar la raíz de un dominio personalizado, repite con base `/` tanto al compilar como en preview.

Esto no crea un backend. Un `VITE_API_BASE_URL` vacío debe terminar en un error honesto al enviar, con campos conservados en memoria. Si usas una API externa real durante la prueba, esta debe permitir el origen `http://localhost:4173`.

## API externa y CORS

La API se despliega en un host con Node compatible; Pages no la hospeda. El frontend llama a `/api/trpc` en el origen configurado por `VITE_API_BASE_URL`.

1. Configura en el host de API `CONTACT_PROVIDER=resend`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` y `CONTACT_TO_EMAIL` con valores propios. Resend requiere cuenta y dominio remitente verificado; revisa restricciones de destinatarios, cuotas y posibles costes de tu cuenta.
2. Publica la API por HTTPS, con la ruta `/api/trpc` y su preflight `OPTIONS` accesibles. El navegador no debe intentar una API HTTP desde un sitio HTTPS.
3. Configura `ALLOWED_ORIGINS` con los orígenes exactos autorizados. Para este Pages estándar:

   ```dotenv
   ALLOWED_ORIGINS=https://juannorenia.github.io
   ```

   **No** uses `https://juannorenia.github.io/ITER_V.02/`: eso es una URL con ruta, no el origen. Tampoco `*`, fragmentos ni barras finales.

4. Si necesitas pruebas locales contra esa API, puedes autorizar explícitamente esos orígenes, separados por comas:

   ```dotenv
   ALLOWED_ORIGINS=https://juannorenia.github.io,http://localhost:3000,http://localhost:4173
   ```

   Elimina los que no necesites en producción. `127.0.0.1` y `localhost`, o puertos distintos, son orígenes diferentes. Para dominio personalizado, añade su origen HTTPS real; no se adivina a partir del nombre del repositorio.

5. Mantén `TRUST_PROXY=false` salvo que un proxy confiable controle las cabeceras reenviadas y hayas revisado esa configuración. CORS no sustituye autenticación ni protección contra abuso.
6. Reinicia el servidor tras cambiar su entorno. Configura el origen público real en `VITE_API_BASE_URL` y reconstruye el frontend con el workflow cuando decidas publicar.

No se entrega una dirección de remitente, destinatario o API ficticia. `VITE_CONTACT_EMAIL` es una dirección pública opcional e independiente del correo al que el servidor entrega las consultas.

Una respuesta aceptada por Resend no prueba llegada a la bandeja de destino. El procedimiento de [envío real](verificacion.md#envío-real-con-credenciales-propias) requiere verificar proveedor y buzón; las pruebas automatizadas no lo realizan.

## Producción Node completa · Windows/Linux

En un host con Node.js >= 22.12, recomendado 24 LTS, utiliza `app/` como directorio de trabajo. Configura el entorno privado en el host, con base frontend `/` si publicas en la raíz y `VITE_API_BASE_URL` vacío si frontend y API comparten origen.

En PowerShell o Bash/sh:

```sh
npm ci
npm run check
npm test
npm run build
npm start
```

El build necesita las dependencias de desarrollo, por lo que no las omitas antes de compilar. Despliega el resultado completo de ese build y los archivos/dependencias de ejecución requeridos por tu host; conserva `dist/public`, `dist/boot.js` y el contexto ESM del proyecto. No reutilices un servidor residual tras ejecutar únicamente `build:pages`.

`npm start` debe arrancar Node de forma compatible con ambos sistemas. `PORT=3000` es el valor inicial; puedes cambiarlo en el entorno del host. Comprueba `http://localhost:3000/` en el propio host si ese es el puerto configurado. Para producción pública configura HTTPS, el proceso supervisado y el proxy según el proveedor, sin exponer `.env` ni credenciales como estáticos.

Si usas este mismo servidor como API de Pages, necesita igualmente su origen HTTPS público y el CORS descrito arriba. No se define un script separado de despliegue API-only ni se supone un proveedor de hosting contratado.

## Si algo falla

- **Pages no disponible en privado o `configure-pages` falla:** revisa plan, permisos de la cuenta y selección de source; no cambies la visibilidad ni amplíes permisos automáticamente.
- **Workflow no visible:** debe estar en la rama predeterminada y Actions permitido; la integración/versionado no se realiza en este subtrabajo.
- **Entorno bloquea deploy:** revisa las reglas de `github-pages` y aprueba solo la rama prevista; no las desactives para saltar la protección.
- **Pantalla vacía/assets 404:** revisa base de proyecto frente a dominio raíz y vuelve a compilar.
- **Contacto 404, HTML en vez de tRPC o error de red:** preview/Pages no incorpora API; comprueba el origen externo y `/api/trpc`.
- **Rechazo CORS:** compara el encabezado `Origin` real con la lista del servidor, sin la ruta del repositorio.
- **Proveedor ausente, error o timeout:** no des por recibido el mensaje; conserva los datos en memoria y revisa la API de forma privada, sin registrar claves ni contenido sensible.
