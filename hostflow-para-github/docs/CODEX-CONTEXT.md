# Hostflow: Memoria de proyecto

Actualizado: 2026-07-15  
Commit base: `8baba7a` (`feat: build Hostflow operations and automation workspace`)

## Qué es Hostflow

Hostflow es un sistema operativo para alojamientos. Centraliza reservas, calendario, conversación con huéspedes, oportunidades, cotizaciones, catálogo comercial, ventas, unidades de negocio, constructor web y automatizaciones.

Stack: Next.js 16 (App Router), React 19, Tailwind, Prisma 7 y SQLite local.

## Cómo retomar una sesión

1. Leer `CLAUDE.md` y este archivo.
2. Usar el repositorio real: `/Users/alejandro/Desktop/Portal/Proyectos/hostflow`.
3. Instalar dependencias si hiciera falta: `npm install`.
4. Después de cambios a Prisma: `npx prisma generate`, aplicar la migración correspondiente y reconstruir/reiniciar el servidor.
5. Validar con `npm run lint` y `npm run build`.

La base local `dev.db` no está versionada. Las migraciones y seeds sí lo están.

## Navegación actual

El lateral está deliberadamente ordenado por contexto de trabajo:

1. Operación diaria: `Dashboard`, `Reservas`, `Bandeja`, `Calendario`.
2. `Unidades de negocio`: acordeón que lista dinámicamente las unidades activas desde `/api/business-units`. La pantalla principal es `/dashboard/unidades`.
3. `Ventas`: acordeón con `Oportunidades`, `Seguimiento`, `Ventas y órdenes`, `Catálogo` y `Punto de venta`.
4. `Herramientas`: acordeón con `Automatizaciones` y `Constructor web`.

La interfaz tiene soporte ES/EN mediante `src/app/language-provider.tsx`; cuando se agreguen áreas nuevas, agregar sus etiquetas allí en ambos idiomas.

## Fuente de verdad y dominio

`Reservation` es el objeto central. Una misma reservación se ve como:

- reserva operativa,
- estancia en calendario,
- conversación en Bandeja,
- oportunidad comercial,
- fuente para dashboard.

No crear una tabla de oportunidad separada a menos que la relación cambie de forma sustancial.

### Pipeline y estados

Las **etapas** son las columnas del tablero de oportunidades. Están centralizadas en `src/lib/pipeline.ts`:

1. `INQUIRY`: Nueva consulta.
2. `CONVERSATION`: En conversación.
3. `QUOTED`: Cotización enviada.
4. `BOOKED`: Reservada.
5. `STAYING`: Hospedado ahora.

Los **estados** son la salida del flujo, no columnas:

- `OPEN`
- `WON`
- `LOST` (requiere motivo)
- `ABANDONED`

Persistencia relevante en `Reservation`: `stage`, `opportunityStatus`, `lostReason`, `statusChangedAt`, `hasQuote`, `paidAmount`, `totalAmount`.

Regla de producto acordada:

- enviar cotización mantiene/mueve a `QUOTED`;
- confirmar pago por Stripe, transferencia o depósito mueve a `BOOKED`;
- al llegar el check-in pasa a `STAYING`;
- al iniciar estancia se marca `WON`.

No volver a mezclar “Pagada”, “Perdida”, “Ganada” o “Abandonada” como columnas.

## Automatizaciones

Ruta: `/dashboard/automatizaciones`.

Archivos clave:

- `src/lib/automation-types.ts`: triggers, acciones y metadatos compartidos con UI.
- `src/lib/automation.ts`: motor de ejecución y reglas base.
- `src/app/dashboard/automatizaciones/*`: lista, canvas, builder y server actions.
- `src/app/api/automations/check-ins/route.ts`: endpoint `POST` para un scheduler que procesa check-ins del día.

Triggers soportados: oportunidad creada, cambio de etapa, cotización enviada, pago recibido y fecha de check-in. Acciones soportadas: mover etapa, cambiar estado, mensaje del sistema y tarea operativa.

Workflows base creados automáticamente:

- Pago confirmado → Reservada.
- Check-in → Hospedado ahora y ganada.
- Cotización enviada → Cotización enviada.

El constructor es funcional, no solo visual: permite crear workflows, cambiar trigger, agregar/configurar acciones, publicar, probarlos y consultar el historial de ejecuciones.

## Cotizaciones, pagos y catálogo

Las cotizaciones viven dentro de la oportunidad/Bandeja. No se debe reconstruir un editor paralelo fuera de ese flujo.

- `src/app/dashboard/oportunidades/contact-workspace.tsx`: workspace de contacto, conceptos de cotización, envío y pagos manuales.
- `src/app/dashboard/ventas/actions.ts`: catálogo, cotizaciones y ventas.
- `src/app/dashboard/ventas/catalogo/*`: catálogo filtrable por unidad de negocio y alta en modal.
- `src/app/dashboard/ventas/cotizaciones/page.tsx`: seguimiento de cotizaciones/pagos, no editor primario.

El catálogo contiene habitaciones, productos, servicios y paquetes. Cada uno pertenece a una unidad de negocio (Hospedaje, Restaurante, Spa u otra); esa relación alimenta los ingresos y reportes.

## Constructor web

Ruta: `/dashboard/sitio`.

El objetivo es un builder funcional con vista desktop/móvil, secciones, contenido HTML/texto y widgets, incluido un widget de reservación. Mantener el trabajo de edición dentro de los componentes de `src/app/dashboard/sitio/`.

Estado actualizado 2026-07-15:

- La pestaña principal `Editor` abre primero el administrador de tema; `Editar sitio` entra al lienzo visual de pantalla completa en `src/app/dashboard/sitio/catalog-builder.tsx`.
- El catálogo consume alojamientos y tarifas reales recibidos desde Prisma; no usa un inventario local duplicado.
- La interfaz conserva la identidad negro/crema/amarillo de Hostflow y separa el chrome del constructor de la marca del sitio previsualizado.
- El editor usa un árbol jerárquico `Encabezado / Plantilla / Pie de página`, con secciones y bloques anidados seleccionables tanto desde el lateral como desde el lienzo.
- El inspector contextual vive debajo del árbol lateral y cambia para anuncio, encabezado, menú, portada, botón, buscador, alojamientos, mapa, destacado, footer y utilidades.
- El chrome del editor incluye selector de página, estado del tema, escritorio/móvil, deshacer/rehacer, acciones y estado `Guardar / Guardado`; al entrar ocupa la pantalla completa y al volver regresa al administrador del tema.
- El árbol permite expandir/contraer grupos, ocultar secciones y retirar secciones de plantilla. `Agregar sección` y `Agregar bloque` abren bibliotecas con búsqueda, pestañas de componentes/apps, categorías, generación asistida y preview antes de insertar.
- Las secciones y bloques agregados desde la biblioteca aparecen en el árbol y en el lienzo durante la sesión de edición.
- Están funcionales la edición en vivo de portada, vista desktop/móvil, presentación cuadrícula/lista y controles de precio, servicios y mapa.
- El editor visual avanzado previo se conserva en `Secciones`; no eliminar su drag-and-drop al continuar el rediseño.
- `Sitio web` tiene un bloque propio en el menú lateral, separado de Herramientas, con accesos directos a Editor, Páginas y Preferencias mediante `?view=`.
- La vista principal de `Editor` es un administrador de tema inspirado en la estructura de Shopify: tema activo, preview desktop/móvil, estado, edición, generación asistida y galería de plantillas propias. `Editar sitio` abre el editor funcional del catálogo.

Estado actualizado 2026-07-16:

- `src/app/dashboard/sitio/theme-settings-panel.tsx` concentra el sistema global de tema. No volver a crear ajustes aislados que no actualicen el lienzo.
- Los ajustes globales funcionales cubren identidad, paleta, tipografía, ancho de página, animaciones, insignias, botones, carrito, cajones, iconos, campos, popovers, moneda, tarjetas de alojamiento, búsqueda, muestrarios, variantes y CSS personalizado.
- Los cambios se reflejan en vivo en portada, navegación, buscador, catálogo, mapa, destacados, pie de página, filtros y carrito. El carrito se puede previsualizar como página o cajón.
- `Guardar` persiste el tema en `localStorage` con la clave `hostflow-website-theme`. Una futura persistencia multiusuario debe mover ese contrato a Prisma/API sin cambiar la forma de `ThemeSettings`.
- Los logos y favicon cargados se previsualizan como data URL durante esta etapa. Antes de producción se deben mover a almacenamiento de medios.
- El responsive del lienzo depende de `previewMode`, no del ancho total de la ventana del administrador. Esto evita que los breakpoints del chrome compriman filtros o footer dentro del preview móvil.

## Dashboard

El dashboard agrega datos de reservas/oportunidades y debe respetar la fuente central anterior. Incluye histórico de reservas y procedencia de canales. Para referencias y pendientes de unificación, leer `docs/brief-unificacion-dashboard.md`.

## Reglas de implementación

- Preferir los patrones existentes de Server Actions y Prisma.
- Mantener los textos de interfaz en español por defecto y traducibles a inglés.
- No introducir PII real de huéspedes en los seeds o fixtures.
- Las migraciones Prisma van en `prisma/migrations/`; no editar `dev.db` para representar cambios de esquema.
- El menú lateral debe conservar esta jerarquía. No devolver Constructor web o Automatizaciones al bloque de operación diaria.

## Estado verificado al guardar esta memoria

- `npm run lint` pasó.
- `npm run build` pasó.
- La aplicación fue levantada en puertos alternos por procesos locales ya existentes; comprobar el puerto disponible antes de iniciar otra instancia.
- `dev.db` queda fuera de Git. El commit inicial de esta versión es `8baba7a`.
