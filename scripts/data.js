/**
 * data.js — sin cambios de lógica/contenido, solo se traslada tal cual
 * (el rediseño es 100% visual vía CSS, según lo solicitado).
 */

const ZONES = {
  "1": {
    id: "1",
    slug: "zona-1",
    nombre: "Zona 1 — Distrito Estadio",
    nombreCorto: "Distrito Estadio",
    descripcion:
      "Zona de ejemplo organizada alrededor del recinto deportivo principal. Reemplazar por la descripción real del destino.",
    colorAcento: "brass",
    coords: { lat: 10.4236, lng: -75.5378 },
    zoom: 15,
    deportes: [
      { id: "d1-1", equipoLocal: "Equipo A", equipoVisitante: "Equipo B", deporte: "Fútbol", fecha: "2026-07-05", hora: "19:30", estadio: "Estadio Central", destacado: true },
      { id: "d1-2", equipoLocal: "Equipo C", equipoVisitante: "Equipo D", deporte: "Baloncesto", fecha: "2026-07-06", hora: "20:00", estadio: "Coliseo Norte", destacado: false },
    ],
    turismo: [
      { id: "t1-1", nombre: "Plaza Histórica", descripcion: "Plaza central de ejemplo, punto de encuentro típico de la zona.", horario: "Todo el día", interes: "Alto", coords: { lat: 10.4239, lng: -75.5382 } },
      { id: "t1-2", nombre: "Mirador de la Bahía", descripcion: "Mirador de ejemplo con vista panorámica.", horario: "6:00 – 18:00", interes: "Medio", coords: { lat: 10.4225, lng: -75.5361 } },
      { id: "t1-3", nombre: "Museo Local", descripcion: "Museo de ejemplo dedicado a la historia de la región.", horario: "9:00 – 17:00", interes: "Medio", coords: { lat: 10.4248, lng: -75.5390 } },
    ],
    comidaTipica: [
      { id: "c1-1", nombre: "Plato típico A", descripcion: "Descripción breve del plato representativo de la zona." },
      { id: "c1-2", nombre: "Plato típico B", descripcion: "Descripción breve de una segunda especialidad local." },
    ],
    restaurantes: [
      { id: "r1-1", nombre: "Restaurante Central", tipo: "Restaurante", especialidad: "Plato típico A", coords: { lat: 10.4231, lng: -75.5370 } },
      { id: "r1-2", nombre: "Mercado del Puerto", tipo: "Mercado", especialidad: "Plato típico B", coords: { lat: 10.4218, lng: -75.5355 } },
    ],
    experiencias: [
      { titulo: "Plan deportivo + comida típica", detalle: "Ver el partido en Estadio Central y comer después en Restaurante Central." },
      { titulo: "Ruta turística cerca del estadio", detalle: "Visitar Plaza Histórica antes del partido, a poca distancia del recinto." },
    ],
  },

  "2": {
    id: "2",
    slug: "zona-2",
    nombre: "Zona 2 — Casco Antiguo",
    nombreCorto: "Casco Antiguo",
    descripcion:
      "Zona de ejemplo centrada en el área histórica/turística. Reemplazar por la descripción real del destino.",
    colorAcento: "jade",
    coords: { lat: 10.4236, lng: -75.5510 },
    zoom: 15,
    deportes: [
      { id: "d2-1", equipoLocal: "Equipo E", equipoVisitante: "Equipo F", deporte: "Voleibol", fecha: "2026-07-07", hora: "18:00", estadio: "Polideportivo Municipal", destacado: true },
    ],
    turismo: [
      { id: "t2-1", nombre: "Murallas Antiguas", descripcion: "Sitio histórico de ejemplo, patrimonio local.", horario: "8:00 – 20:00", interes: "Alto", coords: { lat: 10.4231, lng: -75.5518 } },
      { id: "t2-2", nombre: "Catedral Vieja", descripcion: "Edificio religioso de ejemplo con valor arquitectónico.", horario: "9:00 – 18:00", interes: "Alto", coords: { lat: 10.4240, lng: -75.5502 } },
    ],
    comidaTipica: [
      { id: "c2-1", nombre: "Plato típico C", descripcion: "Descripción breve del plato representativo de la zona." },
      { id: "c2-2", nombre: "Plato típico D", descripcion: "Descripción breve de una segunda especialidad local." },
    ],
    restaurantes: [
      { id: "r2-1", nombre: "Cafetería del Casco", tipo: "Cafetería", especialidad: "Plato típico C", coords: { lat: 10.4235, lng: -75.5507 } },
    ],
    experiencias: [
      { titulo: "Qué visitar antes del evento", detalle: "Recorrer Murallas Antiguas antes del partido en Polideportivo Municipal." },
    ],
  },

  "3": {
    id: "3",
    slug: "zona-3",
    nombre: "Zona 3 — Malecón",
    nombreCorto: "Malecón",
    descripcion:
      "Zona de ejemplo junto a la costa/malecón. Reemplazar por la descripción real del destino.",
    colorAcento: "clay",
    coords: { lat: 10.4180, lng: -75.5430 },
    zoom: 15,
    deportes: [
      { id: "d3-1", equipoLocal: "Equipo G", equipoVisitante: "Equipo H", deporte: "Fútbol playa", fecha: "2026-07-08", hora: "17:00", estadio: "Cancha de Playa", destacado: true },
    ],
    turismo: [
      { id: "t3-1", nombre: "Malecón Turístico", descripcion: "Paseo costero de ejemplo, ideal para caminar al atardecer.", horario: "Todo el día", interes: "Alto", coords: { lat: 10.4176, lng: -75.5435 } },
    ],
    comidaTipica: [
      { id: "c3-1", nombre: "Plato típico E", descripcion: "Descripción breve del plato representativo de la zona costera." },
    ],
    restaurantes: [
      { id: "r3-1", nombre: "Marisquería del Malecón", tipo: "Restaurante", especialidad: "Plato típico E", coords: { lat: 10.4179, lng: -75.5428 } },
    ],
    experiencias: [
      { titulo: "Dónde comer después del partido", detalle: "Tras el partido en Cancha de Playa, probar Marisquería del Malecón." },
    ],
  },
};

const CATEGORIES = {
  deporte: { label: "Deporte", colorVar: "--cat-deporte" },
  turismo: { label: "Turismo", colorVar: "--cat-turismo" },
  comida: { label: "Gastronomía", colorVar: "--cat-comida" },
};