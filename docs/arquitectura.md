# Arquitectura, identidad y límites

Este documento resume el contrato de integración; no certifica que las pruebas o el despliegue estén terminados. La landing y el contacto no necesitan base de datos.

## Componentes

| Área | Responsabilidad |
| --- | --- |
| `app/src/` | React 19 y TypeScript: páginas, secciones, componentes, idioma y estado de formulario |
| `app/src/providers/` | Integración cliente de tRPC/React Query |
| `app/contracts/` | Tipos y validación compartidos entre cliente y API |
| `app/api/` | Hono y tRPC: validación de servidor y adaptación al proveedor de contacto |
| Vite 7 y Tailwind CSS 3 | Desarrollo y compilación del frontend y sus estilos |
| `app/dist/public` | Único contenido publicable en Pages |
| `app/dist/boot.js` | Servidor Node del build completo; no se ejecuta ni publica en Pages |

En desarrollo, `npm run dev` integra frontend y API en Vite, puerto 3000. En producción Node, `npm run build` genera ambos resultados y `npm start` sirve la aplicación y la API. En modo Pages, `npm run build:pages` ejecuta `vite build --mode pages`, sin compilar servidor; `npm run preview` solo sirve estáticos en el puerto 4173.

Los directorios y dependencias de base de datos heredados no convierten la landing/contacto en un flujo con almacenamiento: no se requieren migraciones, credenciales de DB ni registro de consultas en una base de datos para confirmar recepción.

## Flujo de contacto

1. El navegador valida los datos y el consentimiento del formulario.
2. El cliente llama a tRPC bajo `/api/trpc`: mismo origen en desarrollo/Node o el origen externo configurado por `VITE_API_BASE_URL`.
3. El servidor vuelve a validar; la configuración privada y la llamada a Resend permanecen en la API.
4. Solo una confirmación válida de la API y del proveedor permite mostrar el resultado de envío correspondiente. No se confirma por el mero hecho de pulsar el botón, ni se usa una DB o `localStorage` como sustituto del envío.
5. Ante API ausente, proveedor sin configurar, rechazo o timeout se informa del problema y se mantienen los campos en memoria, sin afirmar una entrega.

La aceptación por el proveedor no garantiza recepción, lectura ni respuesta humana. Un timeout puede dejar un resultado incierto: revisa proveedor y buzón antes de repetir envíos. No se promete una cola durable, recuperación del borrador ni envío cuando vuelva la conexión.

Las pruebas automatizadas simulan el proveedor; no necesitan una clave real ni acreditan correo entregado.

## Rutas y base de publicación

Se utiliza `HashRouter` con rutas internas `/` y `/contacto`. El servidor recibe la URL anterior al hash; no requiere reescritura SPA ni conocer las rutas React.

| Destino | Forma local o dominio raíz | Forma en Pages de proyecto |
| --- | --- | --- |
| Inicio | `/#/` | `/ITER_V.02/#/` |
| Contacto | `/#/contacto` | `/ITER_V.02/#/contacto` |
| Sección Método | `/#/?section=metodo` | `/ITER_V.02/#/?section=metodo` |

`VITE_BASE_PATH` resuelve la base de assets, no reemplaza el hash. El valor local es `/`; el workflow calcula la subruta del repositorio salvo override o sitio de usuario. Para dominio personalizado se configura explícitamente `/`.

El hash resuelve la navegación estática, pero no aporta SSR ni páginas HTML independientes por ruta/idioma. No se promete el mismo posicionamiento o indexación que con páginas prerenderizadas. `VITE_SITE_URL` por sí sola no proporciona esas capacidades.

## Idiomas y estado

- ES por defecto; EN y FR seleccionables.
- La preferencia de idioma se conserva en `localStorage` del origen del sitio, no en una cuenta de usuario ni entre dominios distintos.
- El formulario vive en memoria del navegador. Ante errores conserva sus campos, pero recargar, cerrar o desmontar la vista puede perderlos.
- No hay un historial persistente de mensajes ni un borrador en `localStorage`. Guardar el idioma no equivale a guardar datos de contacto.

## Identidad y referencias

La base es la identidad ya presente en el repositorio: composición, tipografía, hero y estudios de movimiento. Los componentes existentes [`AsciiStudy.tsx`](../app/src/components/AsciiStudy.tsx) y [`HorseStrip.tsx`](../app/src/components/HorseStrip.tsx) no se sustituyen por la nueva pieza de contacto.

La pieza ASCII de contacto es un recurso aislado de esa vista. Debe mantener la legibilidad del formulario, no provocar desbordamiento en móvil y respetar la preferencia de movimiento reducido. El hero y el caballo conservan su función original.

Las referencias se describen como recursos formales —caracteres tipográficos, secuencias de fotogramas y movimiento—, sin atribuirlas a artistas, estudios o autores no verificados. Cualquier atribución o material externo futuro exige una fuente y derechos comprobables. Tampoco se añaden clientes, casos, resultados o direcciones comerciales ficticias a la documentación.

## Seguridad, privacidad y operación

- `VITE_*` es configuración pública fijada al compilar. No almacena secretos aunque el repositorio sea privado.
- Las credenciales SMTP, el remitente, el destinatario y la configuración de servidor pertenecen al host de API, nunca al artefacto Pages.
- `ALLOWED_ORIGINS` admite orígenes exactos sin rutas. Para el Pages estándar de este repositorio, el origen es `https://juannorenia.github.io`, no la URL que incluye `/ITER_V.02/`.
- CORS controla acceso desde navegadores; no evita por sí solo llamadas directas ni sustituye controles de abuso. `TRUST_PROXY=false` es el punto de partida hasta revisar el proxy real.
- La ausencia de DB no significa ausencia de tratamiento de datos: API, proveedor de correo, buzones y hosting intervienen en el flujo. No registres contenido personal o claves para depurar.
- El [overlay de privacidad existente](../app/src/components/PrivacyOverlay.tsx) es **provisional y está pendiente de revisión jurídica**. Debe revisarse con los proveedores reales, responsable, finalidad, base aplicable, conservación, derechos y canal de contacto; no se declara cumplimiento certificado. En particular, hay que contrastar sus afirmaciones sobre terceros y almacenamiento con la operación real de Hostinger Mail y del hosting.
- Pages depende del plan y configuración de GitHub para repositorios privados; la privacidad del código no protege automáticamente el sitio publicado.

La [guía de despliegue](despliegue.md) y la [lista de verificación](verificacion.md) detallan cómo comprobar estos límites antes de una publicación o un envío real.
