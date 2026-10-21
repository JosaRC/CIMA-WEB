import './style.css';
import { pixel } from './analytics/pixel.js';
import { FORKLIFT_CATALOG, INDUSTRIAL_PARKS_AGUASCALIENTES } from './data/catalog.js';
import { BLOG_POSTS } from './data/blog.js';
import { initParallaxForklift } from './components/parallaxForklift.js';

let currentRoute = '';

function initApp() {
  setupRouting();
  setupPixelHUD();
  setupModalAndLeadForm();
  setupWhatsAppIntegration();

  // Registro de evento inicial de página
  pixel.trackPageView('CIMA Montacargas Aguascalientes - Inicio');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Función auxiliar para determinar si el taller está abierto en tiempo real (Horario Aguascalientes UTC-6)
function getShopStatus() {
  const now = new Date();
  // Obtener hora local en Aguascalientes (America/Mexico_City)
  const options = { timeZone: 'America/Mexico_City', hour12: false, hour: 'numeric', minute: 'numeric', weekday: 'short' };
  const formatter = new Intl.DateTimeFormat([], options);
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const day = now.getDay(); // 0: Dom, 1: Lun, ..., 6: Sab
  const timeVal = hour + minute / 60;

  if (day >= 1 && day <= 5) {
    // Lunes a Viernes: 09:00 - 18:00
    if (timeVal >= 9 && timeVal < 18) {
      return { isOpen: true, text: 'Abierto Ahora &bull; Cierra a las 6:00 pm', class: 'status-open' };
    } else {
      return { isOpen: false, text: 'Cerrado en este momento &bull; Abre 9:00 am', class: 'status-closed' };
    }
  } else if (day === 6) {
    // Sábado: 09:00 - 14:00
    if (timeVal >= 9 && timeVal < 14) {
      return { isOpen: true, text: 'Abierto Ahora &bull; Cierra a las 2:00 pm', class: 'status-open' };
    } else {
      return { isOpen: false, text: 'Cerrado en este momento &bull; Abre el Lunes 9:00 am', class: 'status-closed' };
    }
  } else {
    // Domingo
    return { isOpen: false, text: 'Cerrado los Domingos &bull; Abre Mañana 9:00 am', class: 'status-closed' };
  }
}

// Sistema de enrutamiento con hash para artículos dedicados
function setupRouting() {
  function handleRoute() {
    const hash = window.location.hash || '';

    if (hash.startsWith('#blog/')) {
      const slug = hash.replace('#blog/', '').trim();
      const post = BLOG_POSTS.find(p => p.slug === slug);
      if (post) {
        currentRoute = 'blog-article';
        renderBlogArticleView(post);
        return;
      }
    }

    // Ruta principal con pantallas apiladas
    if (currentRoute !== 'main') {
      currentRoute = 'main';
      renderMainScreens();
      initMainInteractiveComponents();
    }

    // Scroll si apunta a una sección
    if (hash && hash !== '#inicio') {
      setTimeout(() => {
        if (window.scrollToScreen) {
          window.scrollToScreen(hash);
        } else {
          document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  window.addEventListener('hashchange', handleRoute);
  // Primera carga
  handleRoute();
}

function renderMainScreens() {
  const app = document.getElementById('app-content');
  if (!app) return;

  const shopStatus = getShopStatus();

  app.innerHTML = `
    <div class="screens-stack-wrapper" id="screens-stack-wrapper">
      <div class="screens-deck-viewport" id="screens-deck-viewport">
        <!-- PANTALLA 1: INICIO / HERO (MONTACARGAS 3D CON ROTACIÓN POR MOUSE, BORDE EN SENTIDO RELOJ EN HOVER Y ¿QUÉ ES CIMA?) -->
        <section class="stacked-screen screen-hero" id="inicio" data-screen="01">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 01 / 07</span>
          <span class="screen-title-sub">Solución de Elevación Industrial Multi-Marca Aguascalientes</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">
          <!-- Columna Izquierda: Tarjeta 3D con rotación por cursor y animación de borde en sentido horario en hover -->
          <div class="col-parallax" id="tarjeta-3d">
            <div class="parallax-card-viewport">
              <div class="parallax-stage-card">
                <!-- Capa Borde Animado: Recorrido perimetral en el sentido de las agujas del reloj en hover -->
                <svg class="border-trace-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <rect class="border-trace-rect" x="0.5" y="0.5" width="99" height="99" rx="3.5" ry="3.5" pathLength="100"/>
                </svg>

                <!-- Capa 0: Fondo de estudio con cuadrícula isométrica 3D -->
                <div class="layer-bg">
                  <div class="studio-grid-floor"></div>
                  <div class="studio-watermark">CIMA</div>
                </div>

                <!-- Capa 1: Sombra elíptica de suelo -->
                <div class="layer-shadow"></div>

                <!-- Capa 1.5: Haz de luz LED proyectado desde los faros frontales -->
                <div class="layer-headlight-beam"></div>

                <!-- Capa 2: Montacargas Real (Render 3D limpio y ultra nítido) -->
                <div class="layer-machine">
                  <img src="/montacargas-cutout.png" alt="Montacargas CIMA 2.5 Toneladas" class="forklift-img" />
                </div>

                <!-- Capa 2.5: Brillo especular dinámico -->
                <div class="layer-sheen"></div>

                <!-- Capa 3: HUD Frontal con telemetría flotante y características técnicas -->
                <div class="layer-hud">
                  <div class="hud-top-row">
                    <div class="hud-pill-badge">
                      <span class="hud-live-dot"></span>
                      <span>CIMA C-25 Advance Dual Pro</span>
                    </div>
                    <div class="hud-chip-speed">
                      <span>Entrega en &lt; 90 min en Ags</span>
                    </div>
                  </div>

                  <div class="hud-bottom-overlay">
                    <div class="hud-spec-capsule">
                      <div class="spec-kpi">
                        <span class="kpi-num">2.5 T</span>
                        <span class="kpi-lbl">Capacidad</span>
                      </div>
                      <div class="spec-kpi-divider"></div>
                      <div class="spec-kpi">
                        <span class="kpi-num">4.8 m</span>
                        <span class="kpi-lbl">Elevación</span>
                      </div>
                      <div class="spec-kpi-divider"></div>
                      <div class="spec-kpi">
                        <span class="kpi-num">Dual</span>
                        <span class="kpi-lbl">Gas LP / Gasolina</span>
                      </div>
                      <div class="spec-kpi-divider"></div>
                      <div class="spec-kpi">
                        <span class="kpi-num">STPS</span>
                        <span class="kpi-lbl">NOM-006</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Barra de controles de la tarjeta interactiva -->
              <div class="parallax-controls-bar">
                <div class="controls-left">
                  <button class="btn-control active" id="btn-parallax-lights">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    <span class="btn-label">Faros: ON</span>
                  </button>
                  <button class="btn-control" id="btn-parallax-reset">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    <span>Centrar</span>
                  </button>
                </div>
                <div class="controls-right">
                  <span class="mouse-hint">
                    Toca o arrastra sobre el montacargas para rotar en 3D
                  </span>
                  <button class="btn btn-primary btn-sm" id="btn-quote-parallax-unit">
                    Cotizar Esta Unidad
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Descripción Corporativa y Servicios Principales -->
          <div class="col-text">
            <div class="section-tag">Soluciones Integrales de Elevación</div>
            <h2>Servicios Especializados en <span>Montacargas CIMA</span></h2>
            <p class="lead">
              Somos una empresa líder en el sector de servicios a equipos de elevación con <strong>soporte multi-marca</strong>. Nuestras actividades cubren los rubros de <strong>renta, servicio, venta y refacciones</strong> en Aguascalientes y todo el Bajío.
            </p>

            <div class="features-list">
              <div class="feature-item">
                <div class="feature-icon-wrap">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div>
                  <div class="feature-title">Renta de Maquinaria</div>
                  <div class="feature-desc">El equipo ideal para cubrir tu necesidad con calidad que excede expectativas.</div>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrap">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <div>
                  <div class="feature-title">Refacciones Multi-Marca</div>
                  <div class="feature-desc">Amplio stock permanente, entregas inmediatas y piezas de reemplazo garantizadas.</div>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrap">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div>
                  <div class="feature-title">Servicios Generales</div>
                  <div class="feature-desc">Mantenimiento preventivo de calidad que reduce al mínimo los paros técnicos.</div>
                </div>
              </div>

              <div class="feature-item">
                <div class="feature-icon-wrap">
                  <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <div class="feature-title">Personal Altamente Capacitado</div>
                  <div class="feature-desc">Soluciones integrales, diagnósticos en sitio y cumplimiento estricto STPS NOM-006.</div>
                </div>
              </div>
            </div>

            <div class="col-actions">
              <a href="tel:+524492516028" class="btn btn-primary">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Llamar: (449) 251-6028
              </a>
              <a href="#catalogo" class="btn btn-outline">Explorar Catálogo ↻</a>
            </div>
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 2: UBICACIÓN DEL TALLER, HORARIOS Y GOOGLE MAPS -->
      <section class="stacked-screen screen-cobertura" id="cobertura-industrial" data-screen="02">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 02 / 07</span>
          <span class="screen-title-sub">Taller Matriz, Horarios de Atención & Google Maps</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">
          <!-- Columna Izquierda: Mapa Interactivo de Google Maps y Ubicación del Taller -->
          <div class="map-card-container">
            <div class="map-card-header">
              <div class="map-title-row">
                <span class="live-pin-dot"></span>
                <div>
                  <div class="map-main-title">Taller Matriz CIMA: Av. Héroe de Nacozari #2206</div>
                  <div class="map-address-text">Col. Morelos, C.P. 20140, Aguascalientes, Ags.</div>
                </div>
              </div>
              <a href="https://maps.google.com/?q=Av.+Heroe+de+Nacozari+2206,+Morelos,+20140+Aguascalientes,+Ags." target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Cómo Llegar en Maps
              </a>
            </div>

            <div class="google-maps-frame-wrap">
              <iframe 
                title="Ubicación CIMA Montacargas Av Heroe de Nacozari 2206 Aguascalientes"
                src="https://maps.google.com/maps?q=Av.+Heroe+de+Nacozari+2206,+Morelos,+20140+Aguascalientes,+Ags.&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%" 
                height="320" 
                style="border:0;" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>

            <div class="map-card-footer">
              <a href="tel:+524492516028" class="contact-pill-link">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>(449) 251-6028</span>
              </a>
              <a href="mailto:ventas@cimamontacargas.com.mx" class="contact-pill-link">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <span>ventas@cimamontacargas.com.mx</span>
              </a>
            </div>
          </div>

          <!-- Columna Derecha: Tarjeta de Horarios y Atención del Taller -->
          <div class="col-text">
            <div class="section-tag">Visitas & Soporte Técnico</div>
            <h2>Horarios de Atención en <span>Taller y Oficinas</span></h2>
            
            <div class="shop-status-badge ${shopStatus.class}" style="margin-bottom: 1.25rem;">
              <span class="status-indicator-dot"></span>
              <span>${shopStatus.text}</span>
            </div>

            <!-- Tabla de Horarios Semanales -->
            <div class="schedule-table-card">
              <div class="schedule-row">
                <span class="day-label">Lunes</span>
                <span class="hours-val">09:00 am - 06:00 pm</span>
              </div>
              <div class="schedule-row">
                <span class="day-label">Martes</span>
                <span class="hours-val">09:00 am - 06:00 pm</span>
              </div>
              <div class="schedule-row">
                <span class="day-label">Miércoles</span>
                <span class="hours-val">09:00 am - 06:00 pm</span>
              </div>
              <div class="schedule-row">
                <span class="day-label">Jueves</span>
                <span class="hours-val">09:00 am - 06:00 pm</span>
              </div>
              <div class="schedule-row">
                <span class="day-label">Viernes</span>
                <span class="hours-val">09:00 am - 06:00 pm</span>
              </div>
              <div class="schedule-row highlight-saturday">
                <span class="day-label">Sábado</span>
                <span class="hours-val">09:00 am - 02:00 pm</span>
              </div>
              <div class="schedule-row day-closed">
                <span class="day-label">Domingo</span>
                <span class="hours-val">Cerrado</span>
              </div>
            </div>

            <div class="workshop-action-buttons">
              <a href="tel:+524492516028" class="btn btn-primary">
                Llamar al Taller: (449) 251-6028
              </a>
              <a href="https://wa.me/524492516028?text=Hola%20CIMA,%20deseo%20visitar%20su%20taller%20en%20Av.%20Heroe%20de%20Nacozari%202206" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
                WhatsApp Directo
              </a>
            </div>
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 3: ¿QUIÉNES SOMOS? (INFORMACIÓN CORPORATIVA OFICIAL Y SERVICIOS) -->
      <section class="stacked-screen screen-quienes" id="quienes-somos" data-screen="03">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 03 / 07</span>
          <span class="screen-title-sub">Liderazgo Multi-Marca & Personal Altamente Capacitado</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">
          <!-- Columna Izquierda: Texto Oficial de ¿Quiénes Somos? -->
          <div class="col-text">
            <div class="section-tag">Trayectoria & Soporte Multi-Marca</div>
            <h2>¿Quiénes somos? <span>CIMA Montacargas</span></h2>
            <p class="lead">
              Somos una empresa líder en el sector de servicios a equipos de elevación con <strong>soporte multi-marca</strong>. Nuestras actividades cubren los rubros de <strong>renta, servicio, venta y refacciones</strong> en equipos tales como:
            </p>
            <ul class="official-equipment-list">
              <li>Montacargas de combustión (Gas LP / Gasolina)</li>
              <li>Montacargas eléctricos</li>
              <li>Plataformas de elevación</li>
              <li>Plataformas articuladas</li>
              <li>Equipos de pasillo angosto (Reach Trucks)</li>
              <li>Tractores de arrastre</li>
            </ul>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.7;">
              Nuestro personal está altamente capacitado, lo que nos permite ofrecerle un <strong>servicio de calidad y rapidez con mantenimientos garantizados y equipos en excelentes condiciones</strong> que le permitan atender la necesidad en su empresa con la confianza y tranquilidad que requiere.
            </p>

            <div class="services-triple-grid">
              <div class="service-pill-box">
                <div class="service-pill-title">Renta</div>
                <p>Contamos con el equipo ideal para cubrir tu necesidad con calidad que excede expectativas.</p>
              </div>
              <div class="service-pill-box">
                <div class="service-pill-title">Refacciones</div>
                <p>Manejamos partes multi-marca con amplio stock, entregas inmediatas y alta calidad en piezas.</p>
              </div>
              <div class="service-pill-box">
                <div class="service-pill-title">Servicios Generales</div>
                <p>Mantenimiento preventivo que reduce al mínimo los paros técnicos en tu nave.</p>
              </div>
            </div>

            <div class="col-actions">
              <button class="btn btn-primary" onclick="window.cimaApp.openQuoteModal('Flota General CIMA', 'Asesoría Multi-Marca')">
                Solicitar Cotización de Servicios
              </button>
            </div>
          </div>

          <!-- Columna Derecha: Imagen Fotográfica Real del Equipo y Taller -->
          <div class="col-img-frame">
            <img src="/team-fleet.jpg" alt="Ingenieros y técnicos certificados de CIMA Montacargas" />
            <div class="img-floating-badge">
              <div>
                <div class="badge-tag-txt">Taller Especializado Aguascalientes</div>
                <div class="badge-main-txt">Equipo Técnico Calificado & Mantenimiento Garantizado</div>
              </div>
              <span style="font-size: 0.85rem; color: var(--green-online); font-weight: 700;">Multi-Marca</span>
            </div>
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 4: CATÁLOGO DE PRODUCTOS (TARJETAS 3D ESTILO CARTA QUE SE VOLTEAN AL HACER CLICK) -->
      <section class="stacked-screen screen-catalogo" id="catalogo" data-screen="04">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 04 / 07</span>
          <span class="screen-title-sub">Catálogo Interactivo 3D Estilo Carta</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">
          <div class="section-tag">Flota Disponible 2026</div>
          <h2 class="section-title">Catálogo Oficial de Montacargas <span>CIMA</span></h2>
          <p class="section-desc">
            Haz click sobre cualquier tarjeta para voltearla en 3D y descubrir sus especificaciones técnicas completas, cotizaciones mensuales deducibles y compatibilidad en parques de Aguascalientes.
          </p>
        </div>

        <div class="catalog-filter-bar">
          <button class="filter-btn active" data-filter="all">Todos los Equipos</button>
          <button class="filter-btn" data-filter="combustion">Gas LP / Combustión</button>
          <button class="filter-btn" data-filter="electric">Eléctricos Ion-Litio</button>
          <button class="filter-btn" data-filter="reach">Pasillo Angosto (Reach)</button>
          <button class="filter-btn" data-filter="diesel">Diésel Heavy Duty</button>
        </div>

        <div class="catalog-grid" id="catalog-container">
          <!-- Inyectado dinámicamente con flip-card 3D -->
        </div>
      </div>
      </section>

      <!-- PANTALLA 5: CALCULADORA TÉCNICA DE CARGA Y ELEVACIÓN -->
      <section class="stacked-screen screen-calculadora" id="calculadora" data-screen="05">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 05 / 07</span>
          <span class="screen-title-sub">Calculadora Técnica & Dimensionamiento</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">
          <div class="section-tag">Dimensionamiento Técnico</div>
          <h2 class="section-title">Calculadora de Equipo para tu <span>Nave Industrial</span></h2>
          <p class="section-desc">
            Indica el peso de tu carga y la altura máxima de racks. El sistema selecciona el modelo adecuado para evitar sobrecostos o riesgos de estabilidad.
          </p>
        </div>

        <div class="calc-card">
          <div class="calc-inputs-col">
            <div class="calc-control-group">
              <div class="calc-label-row">
                <label class="calc-label">Peso Máximo por Tarima (Toneladas):</label>
                <span class="calc-value-display" id="val-display-weight">2.5 Ton</span>
              </div>
              <input type="range" class="calc-slider" id="slider-weight" min="1.0" max="5.0" step="0.5" value="2.5" />
            </div>

            <div class="calc-control-group">
              <div class="calc-label-row">
                <label class="calc-label">Altura de Estiba / Último Nivel de Rack (Metros):</label>
                <span class="calc-value-display" id="val-display-height">4.8 Metros</span>
              </div>
              <input type="range" class="calc-slider" id="slider-height" min="1.5" max="8.5" step="0.5" value="4.8" />
            </div>

            <div class="calc-control-group">
              <div class="calc-label-row">
                <label class="calc-label">Entorno de Operación:</label>
              </div>
              <div class="calc-radios">
                <div class="radio-btn active" data-env="indoor">
                  Nave Cerrada / Piso Epóxico
                </div>
                <div class="radio-btn" data-env="outdoor">
                  Patio Exterior / Rampa Mixta
                </div>
              </div>
            </div>
          </div>

          <div class="calc-result-box" id="calc-recommendation-box">
            <!-- Inyectado por setupCalculator -->
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 6: BLOG Y GUÍAS TÉCNICAS (CON REDIRECCIÓN DEDICADA) -->
      <section class="stacked-screen screen-blog" id="blog" data-screen="06">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 06 / 07</span>
          <span class="screen-title-sub">Criterios de Decisión, ROI & Inbound</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">
          <div class="section-tag">Criterios de Decisión & Inbound</div>
          <h2 class="section-title">Guías Técnicas para Directores de <span>Operaciones y Compras</span></h2>
          <p class="section-desc">
            Información financiera, normativa STPS y comparativas OPEX vs CAPEX para elegir el esquema más rentable en Aguascalientes. Cada guía cuenta con su propia lectura dedicada indexable.
          </p>
        </div>

        <div class="blog-grid" id="blog-cards-grid">
          <!-- Inyectado dinámicamente -->
        </div>
      </div>
      </section>

      <!-- PANTALLA 7: CONTACTO DIRECTO, INFORMACIÓN DEL LOCAL Y FORMULARIO B2B -->
      <section class="stacked-screen screen-contacto" id="contacto" data-screen="07">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 07 / 07</span>
          <span class="screen-title-sub">Atención Inmediata en Planta & Taller</span>
        </div>

        <div class="screen-body-animated">
          <div class="contact-grid">
          <div class="contact-info-col">
            <div class="section-tag">Atención Comercial Inmediata</div>
            <h3>Información de Contacto y Taller</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.6;">
              Visítanos directamente en nuestras instalaciones o solicita la visita de un ingeniero técnico a tu planta o nave industrial en cualquier punto de Aguascalientes.
            </p>

            <div class="contact-details-box" style="margin-bottom: 1.5rem;">
              <div class="contact-detail-row">
                <strong>Dirección del Taller:</strong>
                <span>Av. Héroe de Nacozari #2206, Morelos, C.P. 20140, Aguascalientes, Ags.</span>
              </div>
              <div class="contact-detail-row">
                <strong>Teléfono Directo:</strong>
                <a href="tel:+524492516028" style="color: var(--cima-blue); font-weight: 700;">(449) 251-6028</a>
              </div>
              <div class="contact-detail-row">
                <strong>Correo Electrónico:</strong>
                <a href="mailto:ventas@cimamontacargas.com.mx" style="color: var(--blue-cima); font-weight: 700;">ventas@cimamontacargas.com.mx</a>
              </div>
              <div class="contact-detail-row">
                <strong>Horario de Atención:</strong>
                <span>Lun - Vie: 09:00 am - 06:00 pm | Sáb: 09:00 am - 02:00 pm</span>
              </div>
            </div>

            <ul class="contact-perks-list">
              <li class="contact-perk-item">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Soporte multi-marca y refacciones originales con amplio stock.</span>
              </li>
              <li class="contact-perk-item">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Mantenimiento preventivo garantizado para minimizar paros técnicos.</span>
              </li>
              <li class="contact-perk-item">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Equipos en excelentes condiciones con dictamen técnico NOM-006-STPS.</span>
              </li>
            </ul>
          </div>

          <div class="contact-form-col">
            <form id="contact-direct-form" class="modal-form" style="background: var(--bg-surface-alt); padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div class="form-group">
                <label for="contact-name">Nombre Completo *</label>
                <input type="text" id="contact-name" required placeholder="Ing. Carlos Macías" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="contact-company">Empresa *</label>
                  <input type="text" id="contact-company" required placeholder="Manufacturas del Centro" />
                </div>
                <div class="form-group">
                  <label for="contact-phone">Teléfono / WhatsApp *</label>
                  <input type="tel" id="contact-phone" required placeholder="449 251 6028" />
                </div>
              </div>
              <div class="form-group">
                <label for="contact-service">Rubro de Interés</label>
                <select id="contact-service">
                  <option value="Renta de Maquinaria">Renta de Montacargas y Plataformas</option>
                  <option value="Refacciones Multi-Marca">Refacciones Multi-Marca (Piezas de reemplazo)</option>
                  <option value="Servicios Generales y Mantenimiento">Servicios Generales (Mantenimiento preventivo/correctivo)</option>
                  <option value="Compra de Equipo">Venta de Equipo de Elevación</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary btn-block">
                Enviar Solicitud a CIMA
              </button>
            </form>
          </div>
        </div>
      </div>
      </section>
      </div>
    </div>

    <!-- FOOTER INDUSTRIAL -->
    <footer class="main-footer" id="main-footer">
      <div class="container-full footer-grid">
        <div class="footer-brand">
          <img src="/cima-logo.png" alt="CIMA Montacargas" style="height: 48px; background: #ffffff; padding: 4px 10px; border-radius: 6px; margin-bottom: 1rem;" />
          <p>
            Empresa líder en el sector de servicios a equipos de elevación con soporte multi-marca. Renta, servicio, venta y refacciones en Aguascalientes y Bajío.
          </p>
        </div>

        <div class="footer-col">
          <h5>Equipos y Servicios</h5>
          <ul class="footer-links">
            <li><a href="#quienes-somos">Renta de Maquinaria</a></li>
            <li><a href="#quienes-somos">Refacciones Multi-Marca</a></li>
            <li><a href="#quienes-somos">Servicios Generales</a></li>
            <li><a href="#catalogo">Montacargas y Plataformas</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h5>Horario del Taller</h5>
          <ul class="footer-links">
            <li>Lun - Vie: 09:00 am - 06:00 pm</li>
            <li>Sábado: 09:00 am - 02:00 pm</li>
            <li>Domingo: Cerrado</li>
            <li><a href="#cobertura-industrial" style="color: var(--cima-blue); font-weight: 700;">Ver Ubicación en Maps</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h5>Contacto Matriz</h5>
          <ul class="footer-links">
            <li><a href="tel:+524492516028">Tel: (449) 251-6028</a></li>
            <li><a href="mailto:ventas@cimamontacargas.com.mx">ventas@cimamontacargas.com.mx</a></li>
            <li>Av. Héroe de Nacozari #2206, Morelos, Ags.</li>
            <li><a href="#" id="footer-wa-link" style="color: #25d366; font-weight: 700;">Línea WhatsApp Directa</a></li>
          </ul>
        </div>
      </div>

      <div class="container-full footer-bottom">
        <div>&copy; 2026 CIMA Montacargas. Todos los derechos reservados.</div>
        <div>Av. Héroe de Nacozari #2206, Morelos, 20140 Aguascalientes, Ags. &bull; Tel: (449) 251-6028</div>
      </div>
    </footer>
  `;
}

// Vista dedicada para lectura individual de artículo de Blog
function renderBlogArticleView(post) {
  const app = document.getElementById('app-content');
  if (!app) return;

  app.innerHTML = `
    <div class="dedicated-blog-page">
      <div class="container-full">
        <!-- Barra de navegación del Blog -->
        <div class="blog-view-top-nav">
          <a href="#blog" class="btn btn-outline btn-sm">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Volver a Guías y Catálogo</span>
          </a>
          <div class="blog-breadcrumbs">
            <a href="#inicio">Inicio</a> &gt; <a href="#blog">Guías Técnicas</a> &gt; <span class="active-crumb">${post.title}</span>
          </div>
        </div>

        <!-- Header del artículo -->
        <header class="article-header-hero">
          <div class="section-tag">${post.category}</div>
          <h1 class="article-title-main">${post.title}</h1>
          <p class="article-subtitle-lead">${post.subtitle}</p>
          
          <div class="article-meta-row">
            <div class="author-info-block">
              <div class="author-badge-initials">CIMA</div>
              <div>
                <div class="author-name-bold">${post.author}</div>
                <div class="author-date-sub">${post.date} &bull; ${post.readTime} &bull; Aguascalientes, Ags.</div>
              </div>
            </div>
            <div class="article-share-links">
              <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' - Leer en: ' + window.location.href)}" target="_blank" rel="noopener noreferrer" class="btn-share-wa">
                <svg class="whatsapp-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Compartir Guía
              </a>
            </div>
          </div>
        </header>

        <!-- Cuerpo del artículo en layout de 2 columnas -->
        <div class="article-content-layout">
          <article class="article-body-content">
            ${post.contentHtml}
          </article>

          <!-- Barra lateral informativa y CTA con datos reales -->
          <aside class="article-sidebar-col">
            <div class="sidebar-sticky-box">
              <div class="sidebar-quote-card">
                <span class="badge-pulse"><span class="pulse-dot"></span> Taller Matriz Aguascalientes</span>
                <h4>¿Necesitas este equipo en tu nave?</h4>
                <p>Contamos con montacargas y soporte multi-marca con entregas en menos de 90 minutos.</p>
                <button class="btn btn-primary btn-block" onclick="window.cimaApp.openQuoteModal('CIMA C-25 Advance Dual', 'Cotización desde Guía: ${post.title}')">
                  Cotizar con un Asesor
                </button>
                <a href="tel:+524492516028" class="btn btn-outline btn-block" style="margin-top: 0.6rem;">
                  Llamar: (449) 251-6028
                </a>
              </div>

              <div class="sidebar-parks-card">
                <h5>Datos del Taller</h5>
                <ul class="sidebar-parks-list">
                  <li>Av. Héroe de Nacozari #2206</li>
                  <li>Col. Morelos, Aguascalientes</li>
                  <li>Lun - Vie: 9am - 6pm</li>
                  <li>Sáb: 9am - 2pm</li>
                  <li>Tel: (449) 251-6028</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `;

  window.scrollTo({ top: 0, behavior: 'smooth' });
  pixel.recordEvent('BlogView', { article: post.title, slug: post.slug });
}

// Inicializar componentes interactivos de la vista principal
function initMainInteractiveComponents() {
  setupParallaxStage();
  setupCatalog();
  setupCalculator();
  setupBlog();
  setupScrollCardDeck();
  setupAllHoverBorderTraces();
  setupMobileMenu();
}

// Configurar el componente 2.5D Parallax con desplazamiento por mouse
function setupParallaxStage() {
  const container = document.getElementById('tarjeta-3d');
  if (!container) return;

  initParallaxForklift(container);

  // Botón para cotizar la unidad desde la barra de controles
  const btnQuote = document.getElementById('btn-quote-parallax-unit');
  btnQuote?.addEventListener('click', () => {
    openQuoteModal('CIMA C-25 Advance Dual');
  });
}

// Configurar catálogo con animación estilo carta (3D Flip Card al hacer click)
function setupCatalog() {
  const container = document.getElementById('catalog-container');
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!container) return;

  function renderList(category = 'all') {
    const filtered = category === 'all'
      ? FORKLIFT_CATALOG
      : FORKLIFT_CATALOG.filter(item => item.category === category);

    container.innerHTML = filtered.map(item => `
      <div class="product-flip-card" data-id="${item.id}" tabindex="0" role="button" aria-label="Ver ficha técnica de ${item.name}">
        <div class="flip-card-inner">
          <!-- CARA FRONTAL: SOLO EL MONTACARGAS, NOMBRE Y BADGE -->
          <div class="flip-card-face flip-card-front">
            <div class="card-front-top">
              <span class="product-category-pill">${item.categoryLabel}</span>
              <span class="product-badge-pill">${item.badge}</span>
            </div>

            <div class="card-front-img-wrap">
              <img src="${item.image}" alt="${item.name}" class="product-front-image" loading="lazy" />
            </div>

            <div class="card-front-bottom">
              <h3 class="product-front-title">${item.name}</h3>
              <div class="flip-action-hint">
                <svg class="flip-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span>Click para voltear y ver ficha técnica ↻</span>
              </div>
            </div>
          </div>

          <!-- CARA TRASERA: FICHA TÉCNICA DETALLADA, PRECIO Y COTIZACIÓN -->
          <div class="flip-card-face flip-card-back">
            <div class="card-back-header">
              <div>
                <span class="product-category-pill">${item.categoryLabel}</span>
                <h4 class="product-back-title">${item.name}</h4>
              </div>
              <button class="btn-flip-back" aria-label="Volver a ver imagen">
                <span>↻ Volver</span>
              </button>
            </div>

            <div class="product-specs-grid">
              <div class="spec-item">
                <span class="spec-label">Capacidad</span>
                <span class="spec-val">${item.capacity}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Elevación</span>
                <span class="spec-val">${item.liftHeight}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Combustible</span>
                <span class="spec-val">${item.fuel}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Radio Giro</span>
                <span class="spec-val">${item.turningRadius}</span>
              </div>
            </div>

            <div class="product-back-bestfor">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>${item.bestFor}</span>
            </div>

            <div class="product-back-park">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Recomendado: ${item.recommendedPark}</span>
            </div>

            <div class="card-back-footer">
              <div class="product-price">
                <span class="price-label">Renta estimada</span>
                <span class="price-amount">${item.priceMonthly}</span>
              </div>
              <div class="card-back-actions">
                <button class="btn btn-primary btn-sm btn-quote-product" data-model="${item.name}">
                  Cotizar
                </button>
                <a href="https://wa.me/524492516028?text=Hola%20CIMA,%20me%20interesa%20cotizar%20el%20montacargas%20${encodeURIComponent(item.name)}" target="_blank" rel="noopener noreferrer" class="btn btn-wa-card" aria-label="WhatsApp">
                  <svg class="whatsapp-svg" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Listener de click para voltear la tarjeta (Flip 3D)
    container.querySelectorAll('.product-flip-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Evitar doble toggle si se hace click en los botones de cotizar
        if (e.target.closest('.btn-quote-product') || e.target.closest('.btn-wa-card')) {
          return;
        }

        const isCurrentlyFlipped = card.classList.contains('is-flipped');
        card.classList.toggle('is-flipped');

        const modelId = card.getAttribute('data-id');
        const product = FORKLIFT_CATALOG.find(p => p.id === modelId);

        if (!isCurrentlyFlipped && product) {
          pixel.trackInteract3D('flip_card_open_specs', { model: product.name });
        }
      });

      // Teclado (Enter o Espacio)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.classList.toggle('is-flipped');
        }
      });
    });

    // Reasignar eventos a botones de cotizar en la cara trasera
    container.querySelectorAll('.btn-quote-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modelName = btn.getAttribute('data-model');
        const product = FORKLIFT_CATALOG.find(p => p.name === modelName);
        if (product) pixel.trackViewContent(product);
        openQuoteModal(modelName);
      });
    });

    container.querySelectorAll('.btn-flip-back').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.product-flip-card');
        card?.classList.remove('is-flipped');
      });
    });
  }

  // Filtrado
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');
      pixel.trackFilterCatalog('category', cat);
      renderList(cat);
    });
  });

  renderList('all');
}

// Configurar calculadora interactiva
function setupCalculator() {
  const sliderWeight = document.getElementById('slider-weight');
  const sliderHeight = document.getElementById('slider-height');
  const displayWeight = document.getElementById('val-display-weight');
  const displayHeight = document.getElementById('val-display-height');
  const radioBtns = document.querySelectorAll('.radio-btn');
  const resultBox = document.getElementById('calc-recommendation-box');

  let currentEnv = 'indoor';

  function update() {
    if (!sliderWeight || !sliderHeight || !displayWeight || !displayHeight || !resultBox) return;

    const weight = parseFloat(sliderWeight.value);
    const height = parseFloat(sliderHeight.value);

    displayWeight.textContent = `${weight.toFixed(1)} Ton`;
    displayHeight.textContent = `${height.toFixed(1)} Metros`;

    // Lógica de recomendación de modelo
    let recommended;
    if (height > 6.0) {
      recommended = FORKLIFT_CATALOG.find(p => p.id === 'cima-r16-reach') || FORKLIFT_CATALOG[2];
    } else if (currentEnv === 'indoor' && weight <= 2.0) {
      recommended = FORKLIFT_CATALOG.find(p => p.id === 'cima-e20-lithium') || FORKLIFT_CATALOG[1];
    } else if (weight >= 4.0) {
      recommended = FORKLIFT_CATALOG.find(p => p.id === 'cima-d50-titan') || FORKLIFT_CATALOG[4];
    } else if (weight >= 3.0) {
      recommended = FORKLIFT_CATALOG.find(p => p.id === 'cima-c35-power') || FORKLIFT_CATALOG[3];
    } else {
      recommended = FORKLIFT_CATALOG.find(p => p.id === 'cima-c25-dual') || FORKLIFT_CATALOG[0];
    }

    resultBox.innerHTML = `
      <div>
        <div class="result-badge">Equipo Recomendado para tu Operación</div>
        <h3 class="result-model-name">${recommended.name}</h3>
        <p class="result-desc">
          Capacidad de ${recommended.capacity} y mástil para ${recommended.liftHeight}. Diseñado para ${recommended.bestFor}
        </p>
        <ul class="result-features">
          ${recommended.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">Estimación mensual con mantenimiento 100% deducible:</div>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--cima-blue); margin-bottom: 1rem;">
          ${recommended.priceMonthly}
        </div>
        <button class="btn btn-primary btn-block" id="btn-quote-calc-result" data-model="${recommended.name}">
          Apartar este Montacargas Ahora
        </button>
      </div>
    `;

    document.getElementById('btn-quote-calc-result')?.addEventListener('click', (e) => {
      const model = e.target.getAttribute('data-model');
      openQuoteModal(model, 'Renta Calculada');
    });
  }

  sliderWeight?.addEventListener('input', update);
  sliderHeight?.addEventListener('input', update);

  radioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      radioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEnv = btn.getAttribute('data-env');
      update();
    });
  });

  update();
}

// Configurar sección de blog en el home con redirección individual
function setupBlog() {
  const grid = document.getElementById('blog-cards-grid');
  if (!grid) return;

  grid.innerHTML = BLOG_POSTS.map(post => `
    <div class="blog-card">
      <div class="blog-meta-top">
        <span class="blog-category-badge">${post.category}</span>
        <span class="blog-read-time">${post.readTime}</span>
      </div>

      <h3 class="blog-title">${post.title}</h3>
      <p class="blog-summary">${post.summary}</p>

      <div class="blog-author-row">
        <span class="blog-author-name">${post.author}</span>
        <a href="#blog/${post.slug}" class="btn-read-article">
          <span>Leer Guía Completa</span>
          <span>&rarr;</span>
        </a>
      </div>
    </div>
  `).join('');
}

// Inyectar animación de borde perimetral en sentido horario (delgado, nítido y sin difuminado) en todas las tarjetas
function setupAllHoverBorderTraces() {
  const cards = document.querySelectorAll(
    '.parallax-stage-card, .product-flip-card, .service-pill-box, .blog-card, .feature-item, .calc-card, .map-card-container, .schedule-table-card, .contact-details-box'
  );
  cards.forEach(card => {
    if (!card.querySelector('.border-trace-svg')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'border-trace-svg');
      svg.setAttribute('viewBox', '0 0 100 100');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('class', 'border-trace-rect');
      rect.setAttribute('x', '0.75');
      rect.setAttribute('y', '0.75');
      rect.setAttribute('width', '98.5');
      rect.setAttribute('height', '98.5');
      rect.setAttribute('rx', '3.5');
      rect.setAttribute('ry', '3.5');
      rect.setAttribute('pathLength', '100');

      svg.appendChild(rect);
      card.appendChild(svg);
      card.classList.add('hover-trace-card');
    }
  });
}

let mobileMenuInitialized = false;

// Configurar menú móvil desplegable
function setupMobileMenu() {
  if (mobileMenuInitialized) return;
  mobileMenuInitialized = true;

  const toggleBtn = document.getElementById('btn-mobile-menu-toggle');
  const drawer = document.getElementById('mobile-nav-drawer');
  const closeBtn = document.getElementById('btn-mobile-drawer-close');
  const backdrop = document.getElementById('mobile-drawer-backdrop');
  const drawerLinks = document.querySelectorAll('[data-drawer-link]');
  const drawerQuoteBtn = document.getElementById('btn-drawer-quote');

  function openDrawer() {
    drawer?.classList.add('open');
    drawer?.setAttribute('aria-hidden', 'false');
    toggleBtn?.classList.add('open');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    toggleBtn?.classList.remove('open');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn?.addEventListener('click', () => {
    if (drawer?.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      const targetHash = link.getAttribute('href');
      if (targetHash && targetHash.startsWith('#')) {
        setTimeout(() => {
          if (window.scrollToScreen) {
            window.scrollToScreen(targetHash);
          } else {
            document.querySelector(targetHash)?.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    });
  });

  drawerQuoteBtn?.addEventListener('click', () => {
    closeDrawer();
    window.openQuoteModal('Flota General CIMA', 'Menú Móvil');
  });
}

// Configurar animación de reveal apilado (Deck-of-Cards Screen Reveal al hacer Scroll)
// Configurar animación de reveal apilado (Top-Card Slide-Up Reveal)
// "Lo que se mueve es la parte de arriba hacia arriba y por consecuencia lo de abajo aparece de forma natural"
// "Las letras de abajo comienzan con un blur alto y son más pequeñas, y a la mitad del desplazamiento queda sin blur y normal"
function setupScrollCardDeck() {
  const wrapper = document.getElementById('screens-stack-wrapper');
  const deckViewport = document.getElementById('screens-deck-viewport');
  const screens = Array.from(document.querySelectorAll('.stacked-screen'));
  if (!wrapper || !screens.length) return;

  let isTicking = false;

  window.scrollToScreen = function(screenId) {
    const isMobile = window.innerWidth <= 900;
    const targetId = screenId.replace('#', '');
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    if (isMobile) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const targetIndex = screens.findIndex(s => s.id === targetId);
    if (targetIndex >= 0) {
      const windowH = window.innerHeight;
      const stepHeight = windowH * 1.15;
      const wrapperTop = wrapper.offsetTop;
      const targetScroll = wrapperTop + (targetIndex * stepHeight) + 4;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Asignar navegación suave a todos los enlaces de ancla
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('#blog/')) {
        e.preventDefault();
        window.scrollToScreen(href);
        try {
          history.pushState(null, '', href);
        } catch (_) {}
      }
    });
  });

  function updateScrollPhysics() {
    const isMobile = window.innerWidth <= 900;
    const windowH = window.innerHeight;

    if (isMobile) {
      wrapper.style.minHeight = 'auto';
      // En celulares: flujo natural a 60 FPS sin sticky ni bloqueos de GPU
      screens.forEach((screen) => {
        const rect = screen.getBoundingClientRect();
        if (rect.top < windowH * 0.92) {
          screen.style.setProperty('--reveal-scale', '1');
          screen.style.setProperty('--reveal-opacity', '1');
        } else {
          screen.style.setProperty('--reveal-scale', '0.96');
          screen.style.setProperty('--reveal-opacity', '0.75');
        }
      });
      isTicking = false;
      return;
    }

    // MODO DESKTOP:
    // Altura por transición de pantalla
    const stepHeight = windowH * 1.15;
    const totalTransitions = screens.length - 1;
    wrapper.style.minHeight = `${totalTransitions * stepHeight + windowH}px`;

    const wrapperRect = wrapper.getBoundingClientRect();
    const scrollInside = Math.max(0, -wrapperRect.top);

    // Calcular índice activo para el navbar
    const activeIndex = Math.min(screens.length - 1, Math.floor((scrollInside + (stepHeight * 0.4)) / stepHeight));
    const activeScreenId = screens[activeIndex]?.id;
    if (activeScreenId) {
      document.querySelectorAll('.nav-link').forEach(link => {
        const linkHref = link.getAttribute('href')?.replace('#', '');
        link.classList.toggle('active', linkHref === activeScreenId);
      });
    }

    screens.forEach((screen, index) => {
      // Estado inicial de la pantalla 01
      if (index === 0 && scrollInside <= 5) {
        screen.style.setProperty('--screen-slide-up', '0%');
        screen.style.setProperty('--reveal-blur', '0px');
        screen.style.setProperty('--reveal-scale', '1');
        screen.style.setProperty('--reveal-opacity', '1');
      }

      if (index < totalTransitions) {
        const start = index * stepHeight;
        const end = (index + 1) * stepHeight;

        if (scrollInside <= start) {
          // La pantalla está en posición inicial visible (0%)
          screen.style.setProperty('--screen-slide-up', '0%');
        } else if (scrollInside < end) {
          // La pantalla de ARRIBA se desplaza hacia ARRIBA (-105%)
          const progress = (scrollInside - start) / stepHeight;
          const slidePercent = progress * 105;
          screen.style.setProperty('--screen-slide-up', `-${slidePercent.toFixed(2)}%`);

          // La pantalla de ABAJO aparece de forma natural con blur y scale decrecientes
          const nextScreen = screens[index + 1];
          if (nextScreen) {
            nextScreen.style.setProperty('--screen-slide-up', '0%');
            if (progress <= 0.5) {
              // De 0% a 50% del desplazamiento: blur disminuye de 16px a 0px y letras crecen a tamaño normal
              const p = progress / 0.5;
              const blur = (1 - p) * 16;
              const scale = 0.90 + (0.10 * p);
              const opacity = 0.35 + (0.65 * p);
              nextScreen.style.setProperty('--reveal-blur', `${blur.toFixed(1)}px`);
              nextScreen.style.setProperty('--reveal-scale', `${scale.toFixed(3)}`);
              nextScreen.style.setProperty('--reveal-opacity', `${opacity.toFixed(2)}`);
            } else {
              // A partir del 50% del desplazamiento total: 100% nítido sin blur y letras en tamaño original
              nextScreen.style.setProperty('--reveal-blur', '0px');
              nextScreen.style.setProperty('--reveal-scale', '1');
              nextScreen.style.setProperty('--reveal-opacity', '1');
            }
          }
        } else {
          // Ya terminó de subir: queda oculta arriba (-105%)
          screen.style.setProperty('--screen-slide-up', '-105%');
        }
      }

      // Preparar pantallas posteriores que aún no entran
      if (index > activeIndex + 1) {
        screen.style.setProperty('--screen-slide-up', '0%');
        screen.style.setProperty('--reveal-blur', '16px');
        screen.style.setProperty('--reveal-scale', '0.90');
        screen.style.setProperty('--reveal-opacity', '0.35');
      }
    });

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      requestAnimationFrame(updateScrollPhysics);
      isTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScrollPhysics();
}

// Configurar HUD flotante de Pixel en vivo
function setupPixelHUD() {
  const hudElement = document.getElementById('pixel-hud');
  const hudToggle = document.getElementById('pixel-hud-toggle');
  const streamContainer = document.getElementById('hud-events-stream');
  const countBadge = document.getElementById('hud-event-count');

  if (!hudElement || !hudToggle) return;

  hudToggle.addEventListener('click', () => {
    hudElement.classList.toggle('open');
    const isOpen = hudElement.classList.contains('open');
    hudToggle.setAttribute('aria-expanded', isOpen);
  });

  let totalEvents = 0;
  pixel.subscribe((eventRecord) => {
    totalEvents++;
    if (countBadge) countBadge.textContent = `${totalEvents} eventos`;

    if (streamContainer) {
      const row = document.createElement('div');
      row.className = 'hud-event-row';
      row.innerHTML = `
        <div class="hud-event-header">
          <span class="hud-event-name">${eventRecord.name}</span>
          <span class="hud-event-time">${eventRecord.timestamp}</span>
        </div>
        <div class="hud-event-payload">${JSON.stringify(eventRecord.payload, null, 2)}</div>
      `;
      streamContainer.prepend(row);
    }
  });
}

// Configurar modal y formulario de leads
function setupModalAndLeadForm() {
  const modal = document.getElementById('quote-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('lead-form');
  const modalModelTitle = document.getElementById('modal-model-title');
  const inputModel = document.getElementById('form-model-name');
  const contactDirectForm = document.getElementById('contact-direct-form');

  window.openQuoteModal = function (modelName = 'CIMA C-25 Advance Dual', modality = 'Renta Mensual') {
    if (modalModelTitle) modalModelTitle.textContent = `Cotizar ${modelName}`;
    if (inputModel) inputModel.value = modelName;
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    pixel.trackInitiateQuote({ name: modelName }, modality);
    // Bloquear scroll de fondo en móviles al abrir modal
    document.body.style.overflow = 'hidden';
    // Enfocar primer campo
    setTimeout(() => {
      document.getElementById('lead-name')?.focus();
    }, 200);
  };

  function closeModal() {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) {
      closeModal();
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('lead-name').value.trim(),
      company: document.getElementById('lead-company').value.trim(),
      phone: document.getElementById('lead-phone').value.trim(),
      park: document.getElementById('lead-park').value,
      modality: document.getElementById('lead-modality').value,
      model: inputModel.value
    };

    pixel.trackLead(formData);

    const waQuoteMsg = encodeURIComponent(
      `Hola CIMA Montacargas, acabo de registrar mi cotización desde su web para el equipo: *${formData.model}*.\n\n` +
      `👤 *Contacto:* ${formData.name}\n` +
      `🏢 *Empresa:* ${formData.company}\n` +
      `📍 *Ubicación:* ${formData.park}\n` +
      `📋 *Modalidad:* ${formData.modality}\n` +
      `📞 *Teléfono:* ${formData.phone}\n\n` +
      `¿Tienen disponibilidad para entrega en nave o visita técnica?`
    );

    form.innerHTML = `
      <div style="text-align: center; padding: 2rem 0.5rem;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(22, 163, 74, 0.12); color: var(--green-online); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
          <svg class="icon-svg icon-svg-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 style="font-size: 1.45rem; font-weight: 800; margin-bottom: 0.65rem; color: var(--text-main);">¡Cotización Recibida!</h3>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem; line-height: 1.55;">
          Tu solicitud para <strong>${formData.model}</strong> fue canalizada al taller matriz en <strong>Av. Héroe de Nacozari #2206</strong>. Un asesor técnico te contactará al <strong>${formData.phone}</strong> en menos de 15 minutos.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; max-width: 380px; margin: 0 auto;">
          <a href="https://wa.me/524492516028?text=${waQuoteMsg}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-block" style="background: #25d366; border-color: #25d366; display: flex; align-items: center; justify-content: center; gap: 0.5rem; min-height: 48px;">
            <svg class="whatsapp-svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>Confirmar por WhatsApp Ahora</span>
          </a>
          <button type="button" class="btn btn-outline btn-block" id="btn-modal-close-success" style="min-height: 44px;">
            Cerrar Ventana
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-modal-close-success')?.addEventListener('click', closeModal);
    // Asegurar scroll al inicio del modal card
    document.querySelector('.modal-card')?.scrollTo({ top: 0, behavior: 'smooth' });
  });

  contactDirectForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
      name: document.getElementById('contact-name').value.trim(),
      company: document.getElementById('contact-company').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      modality: document.getElementById('contact-service').value,
      model: 'General_Quote_Direct'
    };

    pixel.trackLead(formData);

    const waDirectMsg = encodeURIComponent(
      `Hola CIMA Montacargas Aguascalientes, envié una solicitud de servicio desde el formulario de contacto:\n\n` +
      `👤 *Contacto:* ${formData.name}\n` +
      `🏢 *Empresa:* ${formData.company}\n` +
      `⚙️ *Servicio requerido:* ${formData.modality}\n` +
      `📞 *Teléfono:* ${formData.phone}`
    );

    contactDirectForm.innerHTML = `
      <div style="background: rgba(22, 163, 74, 0.08); border: 1px solid var(--green-online); border-radius: var(--radius-sm); padding: 2rem 1.5rem; text-align: center;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(22, 163, 74, 0.15); color: var(--green-online); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto;">
          <svg class="icon-svg icon-svg-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h4 style="color: var(--green-online); font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem;">Solicitud Registrada</h4>
        <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.25rem; line-height: 1.5;">
          Hemos recibido la solicitud para <strong>${formData.company}</strong>. Un ingeniero de servicio se comunicará al <strong>${formData.phone}</strong> enseguida.
        </p>
        <a href="https://wa.me/524492516028?text=${waDirectMsg}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="background: #25d366; border-color: #25d366; display: inline-flex; align-items: center; gap: 0.5rem;">
          <svg class="whatsapp-svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span>Chat de Soporte por WhatsApp</span>
        </a>
      </div>
    `;
  });

  document.getElementById('btn-header-quote')?.addEventListener('click', () => {
    window.openQuoteModal('CIMA C-25 Advance Dual');
  });
}

// Configurar WhatsApp dinámico con SVG oficial y número real
function setupWhatsAppIntegration() {
  const waBtn = document.getElementById('btn-float-whatsapp');
  const footerWa = document.getElementById('footer-wa-link');

  const baseMsg = encodeURIComponent(
    'Hola CIMA Montacargas Aguascalientes, me interesa cotizar una unidad en renta o servicio para mi empresa. ¿Tienen disponibilidad en taller o en nave?'
  );
  const waUrl = `https://wa.me/524492516028?text=${baseMsg}`;

  if (waBtn) {
    waBtn.href = waUrl;
    waBtn.target = '_blank';
    waBtn.rel = 'noopener noreferrer';
    waBtn.addEventListener('click', () => {
      pixel.trackContactWhatsApp('General_Flota', 'Floating_WhatsApp_Button');
    });
  }

  if (footerWa) {
    footerWa.href = waUrl;
    footerWa.target = '_blank';
    footerWa.rel = 'noopener noreferrer';
    footerWa.addEventListener('click', () => {
      pixel.trackContactWhatsApp('Footer_Inquiry', 'Footer_Link');
    });
  }

  document.getElementById('btn-phone-call')?.addEventListener('click', () => {
    pixel.recordEvent('PhoneCallClick', { phone: '(449) 251-6028', region: 'Aguascalientes' });
  });

  // Trackers de conversión en celulares (Barra Fija Inferior & Header Móvil)
  document.getElementById('m-btn-phone-bottom')?.addEventListener('click', () => {
    pixel.recordEvent('PhoneCallClick', { phone: '(449) 251-6028', channel: 'Mobile_Bottom_Bar' });
  });

  document.getElementById('m-btn-wa-bottom')?.addEventListener('click', () => {
    pixel.trackContactWhatsApp('General_Flota', 'Mobile_Bottom_Bar');
  });

  document.getElementById('btn-mobile-call-icon')?.addEventListener('click', () => {
    pixel.recordEvent('PhoneCallClick', { phone: '(449) 251-6028', channel: 'Mobile_Header_Icon' });
  });
}

// Exponer en window para llamadas de botones
window.cimaApp = {
  openQuoteModal: (model, modality) => {
    if (window.openQuoteModal) window.openQuoteModal(model, modality);
  }
};

