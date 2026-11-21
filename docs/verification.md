# Verificación de la web pública

## Cambio de alcance

Se retiraron del proyecto el panel administrativo, el login, los roles y empleados, la base de datos, migraciones SQL, clientes remotos, correo transaccional, límites de acceso y PWA privada. La aplicación utiliza exclusivamente datos locales.

También se retiraron las dependencias, fixtures y pruebas correspondientes a esas funcionalidades eliminadas. La suite actual comprueba que sus rutas y enlaces no existan, además de verificar la web pública.

## Comprobaciones

- Lint sin warnings.
- Tipos de Next y TypeScript correctos, tras regenerar los tipos de rutas que antes incluían el panel.
- **28 pruebas unitarias correctas**, cuatro archivos.
- Cobertura V8 ejecutada: 84,61 % de sentencias y 84,72 % de líneas en los módulos incluidos.
- Compilación de producción correcta, ejecutada por el runner E2E.
- Suite completa de navegador: **119 correctas y una omisión prevista**, con cuatro workers.
- `/admin`, `/acceso`, las antiguas pantallas de gestión y los recursos de la PWA privada responden 404.
- No se muestran enlaces de acceso al equipo, no se crean cookies de sesión y no se registra el antiguo service worker.
- Inicio, 92 platos, 134 bebidas y seis idiomas conservan datos, precios y comportamiento.
- Navegación sin JavaScript, selector de idioma, búsqueda traducida/original, filtros, fichas, foco, Escape, carrusel, navbar y menú móvil están cubiertos por Playwright.
- La matriz responsive comprende 320, 375, 430, 768, 1024, 1440 y 1920 px; se espera la actualización de layout tras cambiar el viewport.

El runner omite únicamente el swipe en el perfil de escritorio; el gesto se ejecuta en el perfil móvil. Los informes de Playwright y cobertura son artefactos locales excluidos de Git.

## Publicación

El código está en https://github.com/raaulstan/taberna-don-juan y el alias compartido es https://taberna-don-juan-prueba.vercel.app. Tras actualizar una preview se comprueban acceso sin sesión de Vercel, catálogos, idioma y HTTP 404 de las rutas retiradas.

Comprobación remota del 21/11/2026 tras publicar `f83df98`: inicio HTTP 200, sin enlaces de acceso al equipo; nueve rutas/recursos antiguos con HTTP 404; 92 platos y 134 bebidas; cambio ES→EN y búsqueda de bebidas en francés correctos; cero cookies de sesión, registros de service worker o errores de hidratación en el contexto probado.

## Alcance de la evidencia

Se comprueba Chromium de escritorio y emulación móvil. Axe y teclado no equivalen a una auditoría completa de accesibilidad. Lighthouse local, cuando se ejecuta, no representa Core Web Vitals de campo. Las páginas legales siguen necesitando la información empresarial definitiva; no se han inventado datos del titular.
