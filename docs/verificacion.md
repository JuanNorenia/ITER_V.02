# Verificación antes de publicar

Esta es una lista de aceptación, **no un informe de pruebas superadas**. No se da por ejecutado `check`, `test`, ningún build del trabajo de integración, ni un envío de correo real. Registra los resultados únicamente después de comprobarlos.

## 1. Comprobaciones automatizadas

Desde `app/`, con Node.js 24.22.1 y el entorno local preparado, en PowerShell o Bash/sh:

```sh
npm ci
npm run check
npm test
npm run build
npm run build:pages
```

- `check` debe terminar sin errores de las comprobaciones del proyecto.
- `test` debe ejecutar las pruebas del contrato y la API con proveedor simulado; **no debe requerir ni usar credenciales reales para afirmar entrega**.
- El build completo debe producir `dist/public` y `dist/boot.js`.
- `build:pages` debe compilar solo frontend en `dist/public`. Un `dist/boot.js` residual de un build anterior no debe entrar en el artefacto.
- Revisa que el frontend no contenga claves, configuración privada ni un destinatario inventado.

No sustituyas un fallo de scripts por una publicación directa de `dist`. Si un comando falta o aún usa las exigencias heredadas de la plantilla, integra primero el contrato documentado.

## 2. UI, navegación e idiomas

Arranca `npm run dev` y comprueba `http://localhost:3000/`. Repite las rutas principales en un preview compilado con la subruta `/ITER_V.02/` según la [guía de despliegue](despliegue.md#probar-la-subruta-antes-de-publicar).

Prueba al menos anchos de **320, 375, 768, 1024 y 1440 px**, en ES, EN y FR, incluyendo una pantalla estrecha con contenido de formulario y errores visibles.

| Caso | Resultado a verificar |
| --- | --- |
| Inicio `/#/` | Hero, caballo, composición y contenido original conservados; no desbordamiento horizontal global |
| Contacto `/#/contacto` | Vista de contacto accesible por enlace directo y navegación; nueva pieza ASCII aislada |
| Método `/#/?section=metodo` | Resuelve la sección en el inicio; la consulta queda dentro del hash |
| Recarga, atrás y adelante | Las rutas con hash se recuperan sin pedir `/contacto` al servidor ni devolver 404 de Pages |
| Cambio ES → EN → FR | Navegación, formulario, validaciones, estados y controles legibles y coherentes, sin mezclar idiomas accidentalmente |
| Primera visita sin preferencia | Español por defecto; compruébalo en un contexto de navegador sin almacenamiento previo |
| Recarga tras elegir idioma | Preferencia conservada en `localStorage`; no se guardan allí los campos de contacto |
| Teclado y foco | Enlaces, selector, campos, consentimiento, submit y overlay utilizables sin ratón; foco visible y errores identificables |
| Overlay de privacidad | Abre desde los enlaces correspondientes, puede cerrarse y declara su carácter provisional; no se presenta como una política jurídicamente aprobada |
| Movimiento reducido | La UI y el ASCII no impiden la lectura ni la interacción al activar la preferencia del sistema |
| Texto largo y zoom | No tapa el submit ni los mensajes; contenido accesible con zoom y navegación por teclado |

Comprueba también que la nueva pieza de contacto no sustituya el hero o el caballo y que no añada atribuciones artísticas no verificadas.

## 3. Validación y errores del formulario

Usa solo datos propios de prueba, sin información sensible. No hacen falta contactos ni empresas ficticias presentadas como reales.

| Escenario | Resultado a verificar |
| --- | --- |
| Campos obligatorios vacíos | No hay envío; errores comprensibles en el idioma seleccionado y asociados al campo |
| Correo con formato inválido | Se rechaza sin contactar al proveedor |
| Consentimiento sin marcar | No se envía; acceso a la política provisional disponible |
| Límites de longitud y opciones inválidas | Validación consistente entre cliente y contrato de servidor; sin aceptar datos fuera del contrato |
| Submit repetido mientras espera | Estado pendiente claro; no se presenta éxito anticipado ni se generan solicitudes involuntarias |
| API de desarrollo sin credenciales de proveedor | Error de servicio no configurado; no éxito, no falsa recepción en DB, campos conservados en memoria |
| Preview/Pages con `VITE_API_BASE_URL` vacío | No confirma envío: no existe backend de Pages/preview; informa el problema y conserva campos |
| API inaccesible o sin conexión | Mensaje de error útil, submit vuelve a ser utilizable y datos conservados |
| Origen CORS no permitido | No éxito; revisar el origen exacto del frontend y la configuración del host API |
| Rechazo, respuesta inválida o timeout del proveedor | No se afirma entrega; error sin filtrar claves ni respuestas internas sensibles |
| Respuesta de limitación de la API | Se comunica el error o la espera indicada, sin perder el formulario ni simular éxito |
| Recarga tras escribir | El borrador puede perderse: se comprueba el límite del estado en memoria, no una persistencia inexistente |

Para el caso sin proveedor, deja vacías `RESEND_API_KEY`, `CONTACT_FROM_EMAIL` y `CONTACT_TO_EMAIL` en tu entorno privado, con `CONTACT_PROVIDER=resend`, y reinicia desarrollo/servidor. El arranque no debe requerir DB y el intento válido de contacto debe fallar de forma explícita.

Para errores de proveedor usa las pruebas con mocks o un entorno controlado; no publiques credenciales inválidas ni fuerces fallos en una API en uso. Recuerda que un timeout no prueba que el proveedor no haya aceptado el mensaje: comprueba el panel antes de insistir con reenvíos.

## 4. Preview estático y Node completo

### Solo frontend

Desde `app/` y con la base local `/`:

```sh
npm run build:pages
npm run preview
```

Abre `http://localhost:4173/#/contacto`. Sin API externa no debe confirmar envío. Si configuras una API externa real, reconstruye y autoriza `http://localhost:4173` en su CORS. Repite con base `/ITER_V.02/` para detectar rutas de assets incorrectas antes de Pages.

### Frontend y API de producción

Detén el proceso anterior. Desde `app/`:

```sh
npm run build
npm start
```

Con `PORT=3000`, abre `http://localhost:3000/#/contacto`. Esta es la prueba del servidor Node completo; preview no lo sustituye. Repite los errores de proveedor ausente y la navegación con hash. Confirma que el arranque es válido en Windows y Linux y no depende de un prefijo POSIX en PowerShell.

## Envío real con credenciales propias

Este paso es independiente de `npm test` y **no se ha realizado por documentarlo**. Requiere decisión del responsable y recursos propios; puede consumir cuota y generar costes del proveedor.

1. Revisa primero el aviso de privacidad provisional para el entorno y los proveedores reales. Mientras esté pendiente, no lo presentes como cumplimiento jurídico aprobado ni envíes datos de terceros para probar.
2. Confirma que el buzón `contactanos@itercol.com` está activo y permite SMTP. Comprueba los MX, SPF, DKIM y DMARC en el DNS de `itercol.com`.
3. Configura **solo en el host Node o en el entorno local privado** `CONTACT_PROVIDER=smtp`, `SMTP_HOST=smtp.hostinger.com`, `SMTP_PORT=465`, `SMTP_SECURE=true`, `SMTP_USER`, `SMTP_PASSWORD`, `CONTACT_FROM_EMAIL` y `CONTACT_TO_EMAIL`. Nunca pongas credenciales SMTP en `VITE_*` ni en variables del build de Pages.
4. Para desarrollo/Node de mismo origen, `VITE_API_BASE_URL` puede quedar vacío. Para Pages/preview, configura el origen HTTPS real de API, reconstruye los estáticos y autoriza el origen del frontend en `ALLOWED_ORIGINS`.
5. Envía una única consulta identificable con datos propios de prueba y consentimiento. Comprueba que la respuesta del cliente corresponde a una confirmación válida de la API, no solo a un cambio visual.
6. Revisa el buzón de destino, incluida la carpeta de spam. El servidor SMTP aceptando el mensaje y su recepción en la bandeja son hechos distintos; anota ambos por separado. Comprueba que la respuesta al correo se dirige al remitente del formulario cuando corresponda.
7. Registra fecha, entorno y resultado sin incluir la clave, contenido personal ni cabeceras sensibles. Elimina los datos de prueba según la política que corresponda.

Si no hay confirmación o no llega el correo, conserva el estado como **no confirmado** y diagnostica proveedor, DNS, límites y bandeja; no presentes las pruebas con mocks como evidencia sustitutiva.

## 5. Puerta de publicación manual

- [ ] `npm run check`, `npm test`, build completo y build de Pages ejecutados y resultados registrados.
- [ ] UI 320–1440 px, ES/EN/FR, teclado, movimiento reducido y rutas con hash revisados.
- [ ] Errores de API ausente y proveedor sin configurar no muestran éxito y conservan campos en memoria.
- [ ] Base de assets y dominio elegidos; origen de API y CORS compatibles, o contacto explícitamente no operativo.
- [ ] Sin secretos ni destinatarios inventados en estáticos y variables públicas.
- [ ] Política provisional revisada antes de captar datos reales; límites de Pages, proveedor y privacidad entendidos.
- [ ] Si se necesita contacto operativo, envío real autorizado comprobado en proveedor y buzón; si no, no se afirma que funcione.
- [ ] Plan y configuración de Pages compatibles con el repositorio privado, sin cambios automáticos de visibilidad.
- [ ] Publicación decidida expresamente: Settings Pages como GitHub Actions y ejecución manual del workflow.

Nada de esta lista debe marcarse como completado únicamente porque exista documentación o un workflow.
