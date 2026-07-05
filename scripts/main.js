/**
 * main.js — sin cambios de lógica (el rediseño solicitado es únicamente visual).
 */

(function () {
  "use strict";

  const STORAGE_KEY = "escala:lastZone";

  const state = {
    zoneId: null,
    userCoords: null,
    geoStatus: "idle",
    map: null,
    mapLayers: {},
    mapFilters: { deporte: true, turismo: true, comida: true },
    filters: {
      deporte: "todos",
      interes: "todos",
      tipo: "todos",
    },
  };

  function resolveZoneId() {
    const params = new URLSearchParams(window.location.search);
    const fromQR = params.get("zona");
    if (fromQR && ZONES[fromQR]) {
      try { localStorage.setItem(STORAGE_KEY, fromQR); } catch (e) {}
      return fromQR;
    }
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (saved && ZONES[saved]) return saved;
    return null;
  }

  function setZone(id) {
    if (!ZONES[id]) return;
    state.zoneId = id;
    try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
    const url = new URL(window.location.href);
    url.searchParams.set("zona", id);
    window.history.replaceState({}, "", url);
    renderAll();
    closeZoneSwitcher();
  }

  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function formatFecha(fechaISO) {
    const d = new Date(fechaISO + "T00:00:00");
    return d.toLocaleDateString("es-ES", { weekday: "short", day: "2-digit", month: "short" });
  }

  function getZone() {
    return ZONES[state.zoneId];
  }

  function renderHeaderFields() {
    const zone = getZone();
    document.querySelectorAll('[data-field="zoneName"]').forEach(n => n.textContent = zone.nombreCorto);
    document.querySelectorAll('[data-field="zoneNameFooter"]').forEach(n => n.textContent = zone.nombreCorto);
    document.querySelectorAll('[data-field="codigo"]').forEach(n => n.textContent = `QR · ZONA ${zone.id}`);
    document.title = `Escala — ${zone.nombreCorto}`;

    const ticket = document.querySelector("[data-zone-ticket]");
    if (ticket) ticket.style.setProperty("--zone-accent", `var(--${cssAccent(zone.colorAcento)})`);
  }

  function cssAccent(name) {
    if (name === "brass") return "brass";
    if (name === "jade") return "jade";
    if (name === "clay") return "clay";
    return "brass";
  }

  function renderExperiencias() {
    const zone = getZone();
    const container = document.querySelector("[data-experiencias]");
    container.innerHTML = "";
    zone.experiencias.forEach(exp => {
      container.appendChild(el(`
        <article class="exp-card" role="listitem">
          <h3 class="exp-card__title">${exp.titulo}</h3>
          <p class="exp-card__detail">${exp.detalle}</p>
        </article>
      `));
    });
  }

  function renderDeportes() {
    const zone = getZone();
    const list = document.querySelector("[data-deportes-list]");
    const hoy = new Date().toISOString().slice(0, 10);
    const enUnaSemana = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const filtered = zone.deportes.filter(ev => {
      if (state.filters.deporte === "hoy") return ev.fecha === hoy;
      if (state.filters.deporte === "semana") return ev.fecha >= hoy && ev.fecha <= enUnaSemana;
      return true;
    });

    list.innerHTML = "";
    if (filtered.length === 0) {
      list.appendChild(el(`<li class="card">No hay eventos deportivos para este filtro. Prueba con "Todos".</li>`));
      return;
    }

    filtered.forEach(ev => {
      list.appendChild(el(`
        <li class="card card--deporte">
          <div class="card__top-row">
            <span class="card__tag">${ev.deporte}</span>
            ${ev.destacado ? '<span class="card__badge-highlight">Destacado</span>' : ""}
          </div>
          <h3 class="card__title">${ev.equipoLocal} vs ${ev.equipoVisitante}</h3>
          <div class="card__meta">
            <span>📅 <strong>${formatFecha(ev.fecha)}</strong></span>
            <span>🕒 <strong>${ev.hora}</strong></span>
            <span>📍 ${ev.estadio}</span>
          </div>
        </li>
      `));
    });
  }

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180, lat2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat/2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.asin(Math.sqrt(h));
  }

  function renderTurismo() {
    const zone = getZone();
    const list = document.querySelector("[data-turismo-list]");

    let items = zone.turismo.filter(t =>
      state.filters.interes === "todos" ? true : t.interes === state.filters.interes
    );

    if (state.userCoords) {
      items = items
        .map(t => ({ ...t, _dist: haversineKm(state.userCoords, t.coords) }))
        .sort((a, b) => a._dist - b._dist);
    }

    list.innerHTML = "";
    if (items.length === 0) {
      list.appendChild(el(`<li class="card">No hay lugares turísticos para este filtro.</li>`));
      return;
    }

    items.forEach(t => {
      const distHtml = t._dist != null
        ? `<span class="card__distance">${t._dist < 1 ? Math.round(t._dist * 1000) + " m" : t._dist.toFixed(1) + " km"}</span>`
        : "";
      list.appendChild(el(`
        <li class="card card--turismo">
          <div class="card__top-row">
            <span class="card__tag">Interés ${t.interes.toLowerCase()}</span>
            ${distHtml}
          </div>
          <h3 class="card__title">${t.nombre}</h3>
          <p class="card__desc">${t.descripcion}</p>
          <div class="card__meta"><span>🕒 <strong>${t.horario}</strong></span></div>
        </li>
      `));
    });
  }

  function renderComida() {
    const zone = getZone();
    const list = document.querySelector("[data-comida-list]");
    list.innerHTML = "";
    zone.comidaTipica.forEach(c => {
      list.appendChild(el(`
        <li class="card card--comida">
          <h3 class="card__title">${c.nombre}</h3>
          <p class="card__desc">${c.descripcion}</p>
        </li>
      `));
    });
  }

  function renderRestaurantes() {
    const zone = getZone();
    const list = document.querySelector("[data-restaurantes-list]");
    const filtered = zone.restaurantes.filter(r =>
      state.filters.tipo === "todos" ? true : r.tipo === state.filters.tipo
    );

    list.innerHTML = "";
    if (filtered.length === 0) {
      list.appendChild(el(`<li class="card">No hay recomendaciones para este filtro.</li>`));
      return;
    }

    filtered.forEach(r => {
      list.appendChild(el(`
        <li class="card card--comida">
          <div class="card__top-row"><span class="card__tag">${r.tipo}</span></div>
          <h3 class="card__title">${r.nombre}</h3>
          <p class="card__desc">Especialidad: ${r.especialidad}</p>
        </li>
      `));
    });
  }

  function renderZoneSwitcherList() {
    const container = document.querySelector("[data-zone-list]");
    container.innerHTML = "";
    Object.values(ZONES).forEach(zone => {
      const card = el(`
        <button type="button" class="zone-card" data-select-zone="${zone.id}">
          <div class="zone-card__name">${zone.nombre}</div>
          <div class="zone-card__desc">${zone.descripcion}</div>
        </button>
      `);
      card.addEventListener("click", () => setZone(zone.id));
      container.appendChild(card);
    });
  }

  function openZoneSwitcher() {
    document.querySelector("[data-zone-switcher]").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeZoneSwitcher() {
    const panel = document.querySelector("[data-zone-switcher]");
    if (panel) panel.hidden = true;
    document.body.style.overflow = "";
  }

  function setGeoStatus(text, statekey) {
    document.querySelectorAll("[data-geo-status], [data-geo-status-map]").forEach(n => {
      n.textContent = text;
      n.dataset.state = statekey;
    });
  }

  function requestGeolocation(onSuccessExtra) {
    if (!("geolocation" in navigator)) {
      state.geoStatus = "unsupported";
      setGeoStatus("Tu navegador no soporta geolocalización. Puedes seguir explorando sin ubicación.", "denied");
      return;
    }

    state.geoStatus = "requesting";
    setGeoStatus("Pidiendo permiso de ubicación… acepta el mensaje del navegador para ver distancias reales.", "requesting");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        state.geoStatus = "ok";
        setGeoStatus("Ubicación activada. Mostrando distancias reales desde donde estás.", "ok");
        renderTurismo();
        if (state.map) placeUserMarker();
        if (onSuccessExtra) onSuccessExtra();
      },
      (err) => {
        state.geoStatus = "denied";
        const msg = err.code === err.PERMISSION_DENIED
          ? "No diste permiso de ubicación. Puedes seguir usando la guía sin distancias personalizadas."
          : "No pudimos obtener tu ubicación en este momento. Intenta de nuevo más tarde.";
        setGeoStatus(msg, "denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function dotIcon(cls) {
    return L.divIcon({
      className: "",
      html: `<span class="map-marker-dot ${cls}"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }

  function initMap() {
    const zone = getZone();
    const mapEl = document.getElementById("map");
    if (!mapEl || typeof L === "undefined") return;

    if (state.map) { state.map.remove(); state.map = null; }

    state.map = L.map(mapEl, { scrollWheelZoom: false }).setView([zone.coords.lat, zone.coords.lng], zone.zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(state.map);

    state.mapLayers = {
      deporte: L.layerGroup().addTo(state.map),
      turismo: L.layerGroup().addTo(state.map),
      comida: L.layerGroup().addTo(state.map),
    };

    zone.deportes.forEach(ev => {
      L.marker([zone.coords.lat, zone.coords.lng], { icon: dotIcon("map-marker-dot--deporte") })
        .bindPopup(`<strong>${ev.equipoLocal} vs ${ev.equipoVisitante}</strong><br>${ev.estadio}<br>${formatFecha(ev.fecha)} · ${ev.hora}`)
        .addTo(state.mapLayers.deporte);
    });

    zone.turismo.forEach(t => {
      L.marker([t.coords.lat, t.coords.lng], { icon: dotIcon("map-marker-dot--turismo") })
        .bindPopup(`<strong>${t.nombre}</strong><br>${t.descripcion}`)
        .addTo(state.mapLayers.turismo);
    });

    zone.restaurantes.forEach(r => {
      L.marker([r.coords.lat, r.coords.lng], { icon: dotIcon("map-marker-dot--comida") })
        .bindPopup(`<strong>${r.nombre}</strong><br>${r.tipo} · ${r.especialidad}`)
        .addTo(state.mapLayers.comida);
    });

    if (state.userCoords) placeUserMarker();
  }

  let userMarker = null;
  function placeUserMarker() {
    if (!state.map || !state.userCoords) return;
    if (userMarker) state.map.removeLayer(userMarker);
    userMarker = L.marker([state.userCoords.lat, state.userCoords.lng], { icon: dotIcon("map-marker-dot--user") })
      .bindPopup("Estás aquí")
      .addTo(state.map);
  }

  function applyMapFilters() {
    Object.entries(state.mapFilters).forEach(([cat, visible]) => {
      const layer = state.mapLayers[cat];
      if (!layer || !state.map) return;
      if (visible) state.map.addLayer(layer);
      else state.map.removeLayer(layer);
    });
  }

  function renderAll() {
    if (!getZone()) return;
    renderHeaderFields();
    renderExperiencias();
    renderDeportes();
    renderTurismo();
    renderComida();
    renderRestaurantes();
    initMap();
    applyMapFilters();
  }

  function bindEvents() {
    const navToggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }));

    document.querySelectorAll("[data-open-zone-switcher]").forEach(btn =>
      btn.addEventListener("click", openZoneSwitcher)
    );
    document.querySelectorAll("[data-close-zone-switcher]").forEach(btn =>
      btn.addEventListener("click", closeZoneSwitcher)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeZoneSwitcher();
    });

    document.querySelectorAll("[data-filter-deporte]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter-deporte]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filters.deporte = btn.dataset.filterDeporte;
        renderDeportes();
      });
    });

    document.querySelectorAll("[data-filter-interes]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter-interes]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filters.interes = btn.dataset.filterInteres;
        renderTurismo();
      });
    });

    document.querySelector("[data-geo-sort]").addEventListener("click", () => {
      if (state.userCoords) { renderTurismo(); return; }
      requestGeolocation();
    });

    document.querySelectorAll("[data-filter-tipo]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter-tipo]").forEach(b => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        state.filters.tipo = btn.dataset.filterTipo;
        renderRestaurantes();
      });
    });

    document.querySelectorAll("[data-map-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.dataset.mapFilter;
        state.mapFilters[cat] = !state.mapFilters[cat];
        btn.classList.toggle("is-active", state.mapFilters[cat]);
        applyMapFilters();
      });
    });

    document.querySelector("[data-geo-locate]").addEventListener("click", () => requestGeolocation());
  }

  function init() {
    bindEvents();
    renderZoneSwitcherList();

    const id = resolveZoneId();
    if (id) {
      setZoneQuiet(id);
      renderAll();
    } else {
      openZoneSwitcher();
    }
  }

  function setZoneQuiet(id) {
    state.zoneId = id;
    const url = new URL(window.location.href);
    url.searchParams.set("zona", id);
    window.history.replaceState({}, "", url);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
