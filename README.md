# ITER

Landing de ITER y flujo de contacto, conservando la identidad visual original. La aplicación vive en [`app/`](app/README.md): React 19, TypeScript, Vite 7 y Tailwind CSS 3; la API utiliza Hono y tRPC sobre Node.js.

Repositorio: [JuanNorenia/ITER_V.02](https://github.com/JuanNorenia/ITER_V.02).

> Esta documentación describe el contrato de integración de la aplicación. No acredita que los cambios de otros subtrabajos, las pruebas, un despliegue o un envío real de correo hayan sido verificados. Antes de publicar, completa la [lista de verificación](docs/verificacion.md).

## Desarrollo local

Requiere **Node.js 24.22.1** y npm. No hace falta una base de datos para la landing y el contacto.

Desde la raíz del repositorio, y **solo si todavía no existe `app/.env`**:

### Windows · PowerShell

```powershell
Set-Location .\app
Copy-Item .env.example .env
npm ci
npm run dev
```

### Linux · Bash/sh

```sh
cd app
cp .env.example .env
npm ci
npm run dev
```

Abre `http://localhost:3000/`. Vite reúne frontend y API durante el desarrollo. Las credenciales del proveedor se dejan vacías por defecto: arrancar la web no significa que el formulario pueda enviar correo.

## Modos de ejecución

Todos los comandos se ejecutan desde `app/`.

| Objetivo | Comandos | Resultado |
| --- | --- | --- |
| Desarrollo | `npm run dev` | Frontend y API en `localhost:3000` |
| Comprobar | `npm run check` y `npm test` | Comprobaciones del proyecto y pruebas; los mocks no prueban entrega de correo |
| Producción Node | `npm run build`, después `npm start` | Frontend en `dist/public` y servidor en `dist/boot.js` |
| Sitio estático | `npm run build:pages`, después `npm run preview` | Solo frontend; preview en `localhost:4173`, sin backend |

`build:pages` corresponde a `vite build --mode pages`. GitHub Pages solo recibe `app/dist/public`, nunca el servidor Node ni las variables privadas.

## Navegación e idiomas

- `HashRouter`: inicio `/#/` y contacto `/#/contacto`.
- Las secciones del inicio se expresan dentro del hash: `/#/?section=metodo`.
- En Pages de proyecto: `https://juannorenia.github.io/ITER_V.02/#/contacto` es la URL prevista, no una confirmación de publicación.
- Español por defecto; inglés y francés seleccionables, con preferencia de idioma en `localStorage`.
- El formulario conserva sus campos en memoria ante errores; no es un borrador persistente ni una bandeja de mensajes.

## Guías

- [Aplicación y contrato de comandos](app/README.md).
- [Desarrollo en Windows y Linux y variables de entorno](docs/desarrollo.md).
- [GitHub Pages manual y producción Node/API](docs/despliegue.md).
- [Arquitectura, identidad y límites reales](docs/arquitectura.md).
- [Pruebas técnicas, UI y envío con credenciales propias](docs/verificacion.md).

## Antes de publicar

El workflow de [Pages](.github/workflows/deploy-pages.yml) solo se activa mediante `workflow_dispatch`; no publica por un push. Su ejecución manual sí publicará el artefacto si Pages está habilitado y las comprobaciones pasan. Este subtrabajo no ejecuta el workflow ni cambia la visibilidad del repositorio.

La disponibilidad de Pages en un repositorio privado depende del plan de GitHub. Un repositorio privado tampoco garantiza que su sitio Pages sea privado. Consulta la guía de despliegue antes de habilitarlo.

Sin una API operativa y un proveedor configurado no debe aparecer una confirmación de envío. Resend requiere cuenta, dominio verificado y credenciales propias del servidor. La política del overlay existente es **provisional y está pendiente de revisión jurídica**, incluida la intervención de proveedores externos.
