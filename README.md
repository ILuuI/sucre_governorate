# Escala — Guía local de deporte, turismo y gastronomía

Borrador funcional (HTML + CSS + JS puro, sin frameworks ni build step) de una
guía local que combina **horarios deportivos**, **lugares turísticos** y
**comida típica** para tres destinos distintos, activados por **código QR**.

---

## 1. Cómo funciona el flujo de QR

Cada uno de los tres códigos QR físicos apunta a la misma página, pero con
un parámetro distinto en la URL:

```
https://iluui.github.io/sucre_governorate/?zona=1
https://iluui.github.io/sucre_governorate/?zona=2
https://iluui.github.io/sucre_governorate/?zona=3
```

En el arranque (`js/main.js → resolveZoneId()`), la página resuelve la zona
en este orden de prioridad:

1. **Parámetro `?zona=` en la URL** (lo que trae el QR escaneado). Tiene
   siempre la última palabra: si alguien escanea otro QR, cambia de zona
   aunque antes tuviera otra guardada.
2. **`localStorage`** con la última zona vista, por si el usuario vuelve a
   entrar sin volver a escanear (por ejemplo, reabre la pestaña).
3. **Selector manual** (modal "Elige tu destino"), si no hay ninguna de las
   dos anteriores o el parámetro no es válido.

Esto significa que **no hace falta tres páginas distintas**: es un único
sitio que se re-renderiza según la zona activa, lo cual facilita mantener
una sola base de código para los tres destinos (y para los que se agreguen
después).

## 2. Estructura de archivos

```
web1/
├── index.html          # Estructura semántica de todas las secciones
├── styles/
│   └── style.css        # Sistema de diseño (tokens + componentes) responsive
├── scripts/
│   ├── data.js           # Datos de las 3 zonas (EDITAR AQUÍ para contenido real)
│   └── main.js            # Lógica: resolución de zona, render, filtros, geo, mapa
└── README.md
└── requirements.txt
└── .gitignore
```

No hay build step. Se puede abrir `index.html` directamente o servirlo con
cualquier servidor estático (Netlify, Vercel, GitHub Pages, Nginx, etc.).

## 3. Cómo cargar datos reales

Todo el contenido vive en un único objeto `ZONES` dentro de `js/data.js`.
Cada zona tiene esta forma:

```js
"1": {
  id, slug, nombre, nombreCorto, descripcion, colorAcento, coords, zoom,
  deportes: [ { equipoLocal, equipoVisitante, deporte, fecha, hora, estadio, destacado } ],
  turismo:  [ { nombre, descripcion, horario, interes, coords } ],
  comidaTipica: [ { nombre, descripcion } ],
  restaurantes: [ { nombre, tipo, especialidad, coords } ],
  experiencias: [ { titulo, detalle } ],
}
```

Para producción, el paso natural es **reemplazar `data.js` por una llamada a
una API** (por ejemplo `fetch('/api/zonas/1')`) que devuelva el mismo
formato de objeto. El resto del código (render, filtros, mapa) no necesita
cambiar porque ya está desacoplado de la fuente de datos.

Puntos de integración futuros ya identificados en el código:
- Horarios deportivos → conectar a una API de resultados/calendarios (por
  ejemplo, un proveedor de datos deportivos) en vez del array estático.
- Coordenadas de eventos deportivos → en este borrador se aproximan con las
  coordenadas del centro de la zona; en producción cada evento debería tener
  sus propias coordenadas de estadio/recinto.
- Reseñas de restaurantes → se puede añadir un campo `rating` sin tocar la
  estructura general.

## 4. Mapa interactivo

- Librería: **Leaflet** + teselas de **OpenStreetMap**, cargadas por CDN.
  No requiere API key, por lo que es apta para un borrador y también para
  producción liviana (respetando la política de uso de OSM).
- Marcadores diferenciados por color según categoría (deporte / turismo /
  gastronomía), con capas independientes que se pueden mostrar/ocultar
  desde los filtros de la sección "Mapa".
- El marcador de usuario (azul) solo aparece si se concede el permiso de
  geolocalización.

## 5. Geolocalización

- Se solicita **solo cuando el usuario la pide explícitamente** (botón
  "Usar mi ubicación" o "Ordenar por cercanía"), nunca automáticamente al
  cargar la página — esto es intencional por buenas prácticas de permisos y
  UX respetuosa.
- Estados manejados explícitamente: `requesting`, `ok`, `denied`,
  `unsupported`, con mensaje visible en pantalla para cada uno
  (`aria-live="polite"` para que lectores de pantalla lo anuncien).
- Las distancias se calculan en el cliente con la fórmula de Haversine
  (`main.js → haversineKm`), sin llamadas externas.

## 6. Filtros implementados en este borrador

- Deportes: Todos / Hoy / Esta semana.
- Turismo: por nivel de interés + orden por cercanía (usa geolocalización).
- Gastronomía / recomendaciones: por tipo de local (Restaurante, Cafetería,
  Mercado).
- Mapa: mostrar/ocultar cada capa de categoría.

## 7. Accesibilidad

- Encabezados jerárquicos (`h1` único por página, `h2` por sección).
- `skip link` al contenido principal.
- Foco visible (`:focus-visible`) en todos los elementos interactivos.
- Roles y `aria-*` en el modal (`role="dialog"`, `aria-modal`), en el estado
  de geolocalización (`aria-live="polite"`) y en el contenedor del mapa.
- Contraste calculado sobre fondo oscuro (`#10202E`) con texto claro
  (`#EDEAE0`) y acentos suficientemente saturados para AA en texto grande.
- `prefers-reduced-motion` respetado (desactiva animaciones/transiciones).

## 8. SEO básico

- `<title>` dinámico por zona (`Escala — [nombre corto de la zona]`).
- `meta description` y Open Graph base en `index.html` (a completar con
  imagen y URL reales antes de publicar).
- HTML semántico (`header`, `nav`, `main`, `section`, `footer`) con
  `aria-labelledby` en cada sección apuntando a su propio `h2`.

## 9. Rendimiento y buenas prácticas técnicas ya aplicadas

- Mobile-first: todo el CSS parte de una columna y agrega columnas con
  `min-width` media queries.
- Sin frameworks pesados: HTML/CSS/JS vanilla + Leaflet (única dependencia
  externa, cargada por CDN).
- `scrollWheelZoom: false` en el mapa para no "atrapar" el scroll de la
  página en móvil.
- Separación estricta de responsabilidades: contenido (`data.js`), lógica
  (`main.js`), presentación (`style.css`), estructura (`index.html`).
- Componentes repetibles vía funciones de render (`renderDeportes`,
  `renderTurismo`, etc.), listos para escalar a más zonas sin duplicar
  código HTML.

## 10. Cómo agregar una cuarta zona en el futuro

1. Agregar un nuevo bloque `"4": { ... }` en `ZONES` dentro de `js/data.js`
   con la misma forma que las otras tres.
2. Agregar la tarjeta correspondiente aparecerá automáticamente en el
   selector de destino (se genera dinámicamente desde `ZONES`).
3. Generar un nuevo QR apuntando a `?zona=4`. No se requiere tocar HTML, CSS
   ni la lógica de `main.js`.

## 11. Limitaciones conocidas de este borrador (a resolver antes de producción)

- Los datos son de ejemplo y no están verificados.
- Las coordenadas de eventos deportivos usan el centro de la zona como
  aproximación, no la ubicación real del recinto.
- No hay backend ni panel de administración: todo el contenido se edita
  directamente en `data.js`.
- No se calculan rutas (solo distancia en línea recta); una integración de
  rutas reales requeriría un servicio de enrutamiento (por ejemplo OSRM o
  Google Directions).
