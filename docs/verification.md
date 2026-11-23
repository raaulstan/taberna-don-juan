# Verificación de la web pública

## Cambio de alcance

Se retiraron del proyecto el panel administrativo, el login, los roles y empleados, la base de datos, migraciones SQL, clientes remotos, correo transaccional, límites de acceso y PWA privada. La aplicación utiliza exclusivamente datos locales.

También se retiraron las dependencias, fixtures y pruebas correspondientes a esas funcionalidades eliminadas. La suite actual comprueba que sus rutas y enlaces no existan, además de verificar la web pública.

## Comprobaciones

- Lint sin warnings.
- Tipos de Next y TypeScript correctos, tras regenerar los tipos de rutas que antes incluían el panel.
- **31 pruebas unitarias correctas**, cinco archivos.
- Cobertura V8 ejecutada: 84,61 % de sentencias y 84,72 % de líneas en los módulos incluidos.
- Compilación de producción correcta, ejecutada por el runner E2E.
- Suite completa de navegador: **123 correctas y una omisión prevista**, con cuatro workers.
- `/admin`, `/acceso`, las antiguas pantallas de gestión y los recursos de la PWA privada responden 404.
- No se muestran enlaces de acceso al equipo, no se crean cookies de sesión y no se registra el antiguo service worker.
- Inicio, 92 platos, 134 bebidas y seis idiomas conservan datos, precios y comportamiento.
- Navegación sin JavaScript, selector de idioma, búsqueda traducida/original, filtros, fichas, foco, Escape, carrusel, navbar y menú móvil están cubiertos por Playwright.
- La matriz responsive comprende 320, 375, 430, 768, 1024, 1440 y 1920 px; se espera la actualización de layout tras cambiar el viewport.

El runner omite únicamente el swipe en el perfil de escritorio; el gesto se ejecuta en el perfil móvil. Los informes de Playwright y cobertura son artefactos locales excluidos de Git.

## Publicación

### Textos legales y descripciones · 23/11/2026

Privacidad, cookies y aviso legal redactados con apartados e índices en seis idiomas, incluyendo alojamiento, datos técnicos, contacto, derechos, conservación, enlaces externos y uso de la web. La identificación del titular y las condiciones contractuales/conservación no verificadas se señalan como pendientes desde `src/config/legal.ts`; no se han creado datos empresariales ni correos ficticios. Se han consultado las políticas oficiales de Vercel, sin afirmar un acuerdo de tratamiento aplicable a un plan no confirmado.

Los 92 platos mantienen su descripción de origen y añaden una frase editorial breve en los seis idiomas. Se comprueba un tamaño limitado, con hasta dos líneas en las tarjetas y lectura completa en ficha. Los precios, nombres, alérgenos y las bebidas sin descripción se conservan. Pruebas de documentos, campos pendientes, ausencia de cookies y presentación responsive correctas.

### Ajuste posterior del carrusel móvil

La altura mínima de 175 px hacía que, a 320 px de viewport, la imagen intentara medir 311 px dentro de una tarjeta de 288 px. El carrusel ahora define una columna móvil explícita y columnas de escritorio con mínimos cero; la figura mide el 100 % del ancho disponible sin imponer esa altura mínima. El dibujo interior se adapta sin encogerse ni salir de su zona.

Verificados los tres platos con Chromium y WebKit en 320, 360, 375, 390, 430, 768 y 1440 px: la imagen llena su figura y permanece dentro de la tarjeta. Capturas móviles revisadas en ambos motores. Lint y build correctos; 39 E2E afectadas correctas y una omisión prevista del swipe desktop.

El código está en https://github.com/raaulstan/taberna-don-juan y el alias compartido es https://taberna-don-juan-prueba.vercel.app. Tras actualizar una preview se comprueban acceso sin sesión de Vercel, catálogos, idioma y HTTP 404 de las rutas retiradas.

Comprobación remota del 21/11/2026 tras publicar `f83df98`: inicio HTTP 200, sin enlaces de acceso al equipo; nueve rutas/recursos antiguos con HTTP 404; 92 platos y 134 bebidas; cambio ES→EN y búsqueda de bebidas en francés correctos; cero cookies de sesión, registros de service worker o errores de hidratación en el contexto probado.

## Alcance de la evidencia

Se comprueba Chromium de escritorio y emulación móvil. Axe y teclado no equivalen a una auditoría completa de accesibilidad. Lighthouse local, cuando se ejecuta, no representa Core Web Vitals de campo. Las páginas legales siguen necesitando la información empresarial definitiva; no se han inventado datos del titular.
