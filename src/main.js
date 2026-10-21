import './style.css';
import { pixel } from './analytics/pixel.js';
import { FORKLIFT_CATALOG, INDUSTRIAL_PARKS_AGUASCALIENTES } from './data/catalog.js';
import { BLOG_POSTS } from './data/blog.js';
import { initParallaxForklift } from './components/parallaxForklift.js';

let currentRoute = '';
let mobileMenuInitialized = false;
let faqInitialized = false;
let cookieConsentInitialized = false;
let privacyModalInitialized = false;
let movementTrackingInitialized = false;

function initApp() {
  window.pixel = pixel;
  setupPixelHUD();
  setupRouting();
  setupModalAndLeadForm();
  setupPrivacyModal();
  setupCookieConsent();
  setupWhatsAppIntegration();
  setupSocialTrackers();
  setupGlobalMovementTracking();

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
          <span class="screen-counter-pill">Pantalla 01 / 03</span>
          <span class="screen-title-sub">Solución de Elevación Industrial Multi-Marca Aguascalientes</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">
          <!-- Columna Izquierda: Tarjeta 3D con rotación por cursor y animación de borde en sentido horario en hover -->
          <div class="col-parallax" id="tarjeta-3d">
            <div class="parallax-card-viewport">
              <div class="parallax-stage-card">
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

      <!-- PANTALLA 2: CATÁLOGO OFICIAL EN CARRETE HORIZONTAL CON FLECHAS (SIN CONFLICTO CON SCROLL DOWN) -->
      <section class="stacked-screen screen-catalogo" id="catalogo" data-screen="02">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 02 / 03</span>
          <span class="screen-title-sub">Catálogo Interactivo 3D en Carrete Horizontal</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">
            <div class="section-tag">Flota Disponible 2026</div>
            <h2 class="section-title">Catálogo Oficial de Montacargas <span>CIMA</span></h2>
            <p class="section-desc">
              Explora nuestra maquinaria hacia la derecha o regresa a la izquierda con las flechas de navegación sin interrumpir tu desplazamiento vertical. Haz click en cualquier tarjeta para voltearla en 3D y descubrir especificaciones y tarifas deducibles.
            </p>
          </div>

          <!-- CARRETE DE CATÁLOGO (HORIZONTAL REEL) -->
          <div class="catalog-reel-wrapper">
            <div class="catalog-reel-header">
              <div class="catalog-filter-bar">
                <button class="filter-btn active" data-filter="all">Todos los Equipos</button>
                <button class="filter-btn" data-filter="combustion">Gas LP / Combustión</button>
                <button class="filter-btn" data-filter="electric">Eléctricos Ion-Litio</button>
                <button class="filter-btn" data-filter="reach">Pasillo Angosto (Reach)</button>
                <button class="filter-btn" data-filter="diesel">Diésel Heavy Duty</button>
              </div>

              <div class="reel-nav-controls">
                <div class="reel-counter-badge" id="reel-counter">
                  <span>Unidad </span><span class="reel-current-num">1</span><span class="reel-counter-sep">/</span><span class="reel-total-num">6</span>
                </div>
                <div class="reel-arrows-group">
                  <button class="reel-arrow-btn reel-arrow-prev" id="btn-reel-prev" aria-label="Regresar montacargas a la izquierda" title="Regresar a la izquierda (Anterior)">
                    <svg class="reel-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <button class="reel-arrow-btn reel-arrow-next" id="btn-reel-next" aria-label="Avanzar montacargas a la derecha" title="Avanzar a la derecha (Siguiente)">
                    <svg class="reel-arrow-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Escenario con flechas flotantes laterales y track horizontal -->
            <div class="catalog-reel-stage">
              <button class="reel-floating-arrow reel-floating-prev" id="btn-reel-float-prev" aria-label="Regresar montacargas a la izquierda" title="Regresar a la izquierda">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              <div class="catalog-reel-track" id="catalog-container" role="region" aria-label="Carrete horizontal de montacargas">
                <!-- Inyectado dinámicamente con flip-card 3D -->
              </div>

              <button class="reel-floating-arrow reel-floating-next" id="btn-reel-float-next" aria-label="Avanzar montacargas a la derecha" title="Avanzar a la derecha">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div class="catalog-reel-footer">
              <div class="reel-hint-text">
                <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16l-4-4m0 0l4-4m-4 4h18m-4 4l4-4m0 0l-4-4"/></svg>
                <span>Desplaza con las flechas &bull; Haz click en cualquier tarjeta para voltearla en 3D</span>
              </div>
              <div class="reel-progress-track">
                <div class="reel-progress-bar" id="reel-progress-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PANTALLA 3: ¿QUIÉNES SOMOS? (INFORMACIÓN CORPORATIVA OFICIAL Y SERVICIOS) -->
      <section class="stacked-screen screen-quienes" id="quienes-somos" data-screen="03">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 03 / 03</span>
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
              <p class="quienes-capacitacion-text">
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
      </div>
    </div>

    <!-- SECCIÓN 04: CALCULADORA TÉCNICA (FLUJO NATURAL SIN ANIMACIÓN GRANDE) -->
    <section class="natural-section section-calculadora" id="calculadora">
      <div class="container-full">
        <div class="natural-section-card">
          <div class="natural-section-header">
            <span class="natural-counter-pill">Herramienta Técnica</span>
            <span class="natural-title-sub">Calculadora de Carga y Dimensionamiento de Mástil</span>
          </div>

          <div class="natural-card-body">
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
        </div>
      </div>
    </section>

    <!-- SECCIÓN 05: TALLER MATRIZ, HORARIOS Y GOOGLE MAPS (FLUJO NATURAL SIN ANIMACIÓN GRANDE) -->
    <section class="natural-section section-cobertura" id="cobertura-industrial">
      <div class="container-full">
        <div class="natural-section-card">
          <div class="natural-section-header">
            <span class="natural-counter-pill">Taller & Ubicación</span>
            <span class="natural-title-sub">Taller Matriz, Horarios de Atención & Google Maps</span>
          </div>

          <div class="natural-card-body">
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
        </div>
      </div>
    </section>

    <!-- SECCIÓN 06: BLOG Y GUÍAS TÉCNICAS (FLUJO NATURAL) -->
    <section class="natural-section section-blog" id="blog">
      <div class="container-full">
        <div class="natural-section-card">
          <div class="natural-section-header">
            <span class="natural-counter-pill">Inbound & Finanzas</span>
            <span class="natural-title-sub">Criterios de Decisión, ROI & Normativa</span>
          </div>

          <div class="natural-card-body">
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
        </div>
      </div>
    </section>

    <!-- SECCIÓN: PREGUNTAS FRECUENTES (FAQ SOBRE REQUERIMIENTOS Y SERVICIOS) -->
    <section class="natural-section section-faq" id="faq">
      <div class="container-full">
        <div class="natural-section-card">
          <div class="natural-section-header">
            <span class="natural-counter-pill">Dudas Comunes</span>
            <span class="natural-title-sub">Resolución de Requerimientos Operativos en el Bajío</span>
          </div>

          <div class="natural-card-body">
            <div class="section-heading-full">
              <div class="section-tag">Transparencia y Operación B2B</div>
              <h2 class="section-title">Preguntas Frecuentes sobre <span>Nuestros Servicios</span></h2>
              <p class="section-desc">
                Todo lo que tu equipo de compras, logística y seguridad industrial necesita saber sobre contratos de arrendamiento, cobertura de mantenimiento, fletes y normativas en Aguascalientes.
              </p>
            </div>

            <div class="faq-accordion-list" id="faq-accordion-list">
              <!-- Pregunta 1 -->
              <div class="faq-item" data-faq-index="1">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Cuáles son los requisitos para rentar un montacargas en Aguascalientes?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>Para personas morales y personas físicas con actividad empresarial en Aguascalientes y Bajío, los requisitos son sumamente ágiles:</p>
                    <ul>
                      <li><strong>Constancia de Situación Fiscal (RFC)</strong> actualizada para emitir factura 100% deducible de impuestos (OPEX).</li>
                      <li><strong>Comprobante de domicilio</strong> de la planta, almacén o nave donde operará la unidad.</li>
                      <li><strong>Identificación oficial</strong> del apoderado legal o responsable de compras.</li>
                      <li><strong>Firma del contrato de arrendamiento</strong> y entrega en nave en menos de 24 horas.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Pregunta 2 -->
              <div class="faq-item" data-faq-index="2">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Qué incluye la tarifa de renta mensual con CIMA?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>Manejamos un esquema de arrendamiento <strong>Full Service</strong> que incluye:</p>
                    <ul>
                      <li><strong>Mantenimiento preventivo programado</strong> periódico (cambio de lubricantes hidráulicos, filtros, frenos y mangueras) en tus instalaciones sin costo adicional.</li>
                      <li><strong>Refacciones de reemplazo</strong> por desgaste operativo normal incluidas.</li>
                      <li><strong>Mano de obra certificada</strong> y soporte prioritario de mecánicos en planta.</li>
                      <li><strong>100% Deducible de impuestos:</strong> Al ser renta pura (OPEX), no descapitaliza tu empresa ni genera activos fijos depreciables.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Pregunta 3 -->
              <div class="faq-item" data-faq-index="3">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Cuál es el tiempo de entrega y cobertura de fletes en parques industriales?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>Para equipos en inventario listo en nuestro taller matriz (Av. Héroe de Nacozari #2206), realizamos entrega con cama baja en <strong>el mismo día o en menos de 24 horas</strong> en:</p>
                    <ul>
                      <li>Parque Industrial Chichimeco (Jesús María)</li>
                      <li>Parque Industrial San Francisco de los Romo (PISF)</li>
                      <li>PIVA (Valle de Aguascalientes)</li>
                      <li>PILA (Logístico de Aguascalientes) y FINSA Aeropuerto</li>
                      <li>Santa Clara, Peñuelas, Gigante de los Arellano y corredor industrial Bajío (Silao, León, Querétaro).</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Pregunta 4 -->
              <div class="faq-item" data-faq-index="4">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Me conviene más un montacargas de combustión (Gas LP) o eléctrico (Litio)?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>La elección óptima depende de las condiciones del área de maniobra:</p>
                    <ul>
                      <li><strong>Combustión Dual Gas LP:</strong> Recomendado para patios abiertos, rampas con pendiente pronunciada, descarga de contenedores y operaciones continúas 24/7 donde solo se requiere cambiar el tanque de gas en 2 minutos.</li>
                      <li><strong>Eléctrico Litio:</strong> Indispensable para interiores cerrados, industria alimentaria, farmacéutica y automotriz limpia. Ofrece cero emisiones de CO2, operación silenciosa y bajo costo operativo por ciclo de carga.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Pregunta 5 -->
              <div class="faq-item" data-faq-index="5">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Los equipos cumplen con las normativas de seguridad de la STPS (NOM-006)?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>Totalmente. Toda nuestra maquinaria cumple con los estándares de la <strong>NOM-006-STPS-2014</strong> (Manejo y almacenamiento de materiales - condiciones de seguridad y salud en el trabajo). Se entregan equipados con:</p>
                    <ul>
                      <li>Torreta estroboscópica ámbar y alarma audible de reversa.</li>
                      <li>Cinturón de seguridad de alta visibilidad y switch de presencia de operador.</li>
                      <li>Extintor tipo ABC vigente, claxon y espejos retrovisores.</li>
                      <li>Bitácora técnica de inspección y mantenimiento preventivo al día.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Pregunta 6 -->
              <div class="faq-item" data-faq-index="6">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Manejan refacciones y servicio técnico para cualquier marca de montacargas?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>Sí. Nuestro taller matriz y equipo técnico cuentan con soporte multi-marca para:</p>
                    <p><strong>Toyota, Hyster, Yale, Crown, Clark, Mitsubishi, Nissan / UniCarriers, Caterpillar y Komatsu.</strong> Disponemos de amplio stock de piezas de reemplazo y entregas inmediatas en Aguascalientes.</p>
                  </div>
                </div>
              </div>

              <!-- Pregunta 7 -->
              <div class="faq-item" data-faq-index="7">
                <button type="button" class="faq-question-btn" aria-expanded="false">
                  <span class="faq-question-text">¿Qué sucede si un equipo rentado requiere reparación correctiva en planta?</span>
                  <span class="faq-icon-toggle">
                    <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </button>
                <div class="faq-answer-panel">
                  <div class="faq-answer-content">
                    <p>Nuestra cuadrilla móvil de mecánicos acude directamente a tu nave con herramienta especializada. Si la intervención correctiva toma más de 24 horas, <strong>te suministramos un equipo de respaldo de similar capacidad sin costo extra</strong> para proteger tu continuidad operativa y tus embarques.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN 08: CONTACTO DIRECTO Y FORMULARIO B2B (FLUJO NATURAL SIN ANIMACIÓN GRANDE) -->
    <section class="natural-section section-contacto" id="contacto">
      <div class="container-full">
        <div class="natural-section-card">
          <div class="natural-section-header">
            <span class="natural-counter-pill">Atención al Cliente</span>
            <span class="natural-title-sub">Atención Inmediata en Planta & Taller</span>
          </div>

          <div class="natural-card-body">
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

                <!-- Apartado de Redes Sociales Oficiales (Facebook & Instagram) -->
                <div class="social-channels-card" style="margin-bottom: 1.5rem;">
                  <div class="social-channels-header">
                    <strong>Canales Digitales Oficiales</strong>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Conoce nuestros equipos y entregas en nave</span>
                  </div>
                  <div class="social-buttons-grid">
                    <a href="https://www.facebook.com/cimamontacargasaguascalientes/?locale=es_LA" target="_blank" rel="noopener noreferrer" class="social-channel-btn btn-facebook">
                      <div class="social-btn-icon fb-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <div class="social-btn-meta">
                        <span class="social-name">Facebook Oficial CIMA</span>
                        <span class="social-sub">cimamontacargasaguascalientes</span>
                      </div>
                      <span class="social-arrow">&rarr;</span>
                    </a>

                    <a href="https://www.instagram.com/cima_montacargas" target="_blank" rel="noopener noreferrer" class="social-channel-btn btn-instagram" title="Próximamente / Configurable">
                      <div class="social-btn-icon ig-icon">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </div>
                      <div class="social-btn-meta">
                        <span class="social-name">Instagram Oficial CIMA</span>
                        <span class="social-sub">@cima_montacargas (Próximamente)</span>
                      </div>
                      <span class="social-arrow">&rarr;</span>
                    </a>
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

                  <!-- Aceptación obligatoria del Aviso de Privacidad -->
                  <div class="form-group form-privacy-group" style="margin-top: 1rem; margin-bottom: 1.25rem;">
                    <label class="privacy-checkbox-label">
                      <input type="checkbox" id="contact-privacy" required />
                      <span class="privacy-label-text">
                        He leído y acepto el <button type="button" class="btn-text-privacy trigger-privacy-modal">Aviso de Privacidad</button> y autorizo el uso de mis datos para la atención técnica conforme a la LFPDPPP. *
                      </span>
                    </label>
                  </div>

                  <button type="submit" class="btn btn-primary btn-block">
                    Enviar Solicitud a CIMA
                  </button>
                </form>
              </div>
            </div>
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
            <li><a href="#faq">Preguntas Frecuentes</a></li>
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
          <h5>Redes y Legal</h5>
          <ul class="footer-links">
            <li>
              <a href="https://www.facebook.com/cimamontacargasaguascalientes/?locale=es_LA" target="_blank" rel="noopener noreferrer" class="footer-social-link fb-link">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook Oficial</span>
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/cima_montacargas" target="_blank" rel="noopener noreferrer" class="footer-social-link ig-link">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>Instagram Oficial</span>
              </a>
            </li>
            <li><button type="button" class="btn-text-privacy trigger-privacy-modal" style="color: var(--text-muted); font-size: 0.88rem; text-decoration: underline; background: none; border: none; padding: 0; cursor: pointer; text-align: left;">Aviso de Privacidad (LFPDPPP)</button></li>
            <li><button type="button" class="btn-text-privacy trigger-cookies-preferences" style="color: var(--text-muted); font-size: 0.88rem; text-decoration: underline; background: none; border: none; padding: 0; cursor: pointer; text-align: left;">Configuración de Cookies</button></li>
            <li><a href="tel:+524492516028">Tel: (449) 251-6028</a></li>
            <li><a href="#" id="footer-wa-link" style="color: #25d366; font-weight: 700;">WhatsApp Directo</a></li>
          </ul>
        </div>
      </div>

      <div class="container-full footer-bottom">
        <div>&copy; 2026 CIMA Montacargas Aguascalientes. Todos los derechos reservados. &bull; <button type="button" class="btn-text-privacy trigger-privacy-modal" style="color: var(--text-muted); text-decoration: underline; background: none; border: none; padding: 0; cursor: pointer; font-size: inherit;">Aviso de Privacidad</button> &bull; <button type="button" class="btn-text-privacy trigger-cookies-preferences" style="color: var(--text-muted); text-decoration: underline; background: none; border: none; padding: 0; cursor: pointer; font-size: inherit;">Cookies</button></div>
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
  setupFAQ();
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

// Configurar catálogo en carrete horizontal (Reel) con navegación por flechas y flip card 3D
function setupCatalog() {
  const container = document.getElementById('catalog-container');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const prevBtn = document.getElementById('btn-reel-prev');
  const nextBtn = document.getElementById('btn-reel-next');
  const floatPrevBtn = document.getElementById('btn-reel-float-prev');
  const floatNextBtn = document.getElementById('btn-reel-float-next');
  const progressBar = document.getElementById('reel-progress-bar');
  if (!container) return;

  function updateReelControls() {
    const scrollLeft = container.scrollLeft;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const isAtStart = scrollLeft <= 8;
    const isAtEnd = scrollLeft >= maxScroll - 8;

    if (prevBtn) prevBtn.disabled = isAtStart;
    if (floatPrevBtn) floatPrevBtn.disabled = isAtStart;
    if (nextBtn) nextBtn.disabled = isAtEnd;
    if (floatNextBtn) floatNextBtn.disabled = isAtEnd;

    // Calcular índice actual para el contador
    const cards = container.querySelectorAll('.product-flip-card');
    const total = cards.length;
    const firstCard = cards[0];
    const stride = firstCard ? (firstCard.offsetWidth + 24) : 374;
    const current = Math.min(total, Math.max(1, Math.round(scrollLeft / stride) + 1));

    const curNum = document.querySelector('.reel-current-num');
    const totNum = document.querySelector('.reel-total-num');
    if (curNum) curNum.textContent = current;
    if (totNum) totNum.textContent = total;

    if (progressBar && maxScroll > 0) {
      const pct = Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100));
      progressBar.style.width = `${pct}%`;
    }
  }

  function scrollReel(direction) {
    const cards = container.querySelectorAll('.product-flip-card');
    if (!cards.length) return;
    const firstCard = cards[0];
    const stride = firstCard.offsetWidth + 24; // ancho tarjeta + gap
    container.scrollBy({
      left: direction * stride,
      behavior: 'smooth'
    });
    pixel.recordEvent('CatalogReelScroll', { direction: direction > 0 ? 'next' : 'prev' });
  }

  prevBtn?.addEventListener('click', () => scrollReel(-1));
  floatPrevBtn?.addEventListener('click', () => scrollReel(-1));
  nextBtn?.addEventListener('click', () => scrollReel(1));
  floatNextBtn?.addEventListener('click', () => scrollReel(1));

  container.addEventListener('scroll', updateReelControls, { passive: true });
  window.addEventListener('resize', updateReelControls, { passive: true });

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

    container.scrollLeft = 0;
    setupAllHoverBorderTraces();
    setTimeout(updateReelControls, 50);
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

  sliderWeight?.addEventListener('change', () => {
    pixel.recordEvent('CalculatorDimension', { weightTons: sliderWeight.value, heightMeters: sliderHeight?.value, env: currentEnv });
  });
  sliderHeight?.addEventListener('change', () => {
    pixel.recordEvent('CalculatorDimension', { weightTons: sliderWeight?.value, heightMeters: sliderHeight.value, env: currentEnv });
  });

  radioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      radioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEnv = btn.getAttribute('data-env');
      update();
      pixel.recordEvent('CalculatorEnvChange', { env: currentEnv });
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

// Inyectar animación de borde perimetral en sentido horario EXCLUSIVAMENTE en las tarjetas del catálogo
function setupAllHoverBorderTraces() {
  const cards = document.querySelectorAll('.product-flip-card');
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

// Configurar animación apilada (Top-Card Slide-Up Reveal) con física de scroll 100% natural
// y mesetas de estancia extendida ("scrollear de más" / hold plateaus) sin bloquear la rueda del mouse.
function setupScrollCardDeck() {
  const wrapper = document.getElementById('screens-stack-wrapper');
  const deckViewport = document.getElementById('screens-deck-viewport');
  const screens = Array.from(document.querySelectorAll('.stacked-screen'));
  if (!wrapper || !screens.length) return;

  let isTicking = false;
  const N = screens.length; // 3 pantallas: #inicio, #catalogo, #quienes-somos

  // Dimensiones dinámicas basadas en el viewport
  function getDeckMetrics() {
    const windowH = window.innerHeight;
    // HOLD_DISTANCE: Distancia de scroll extra ("scrollear de más") donde la pantalla se queda 100% quieta y centrada
    const holdDist = Math.max(520, Math.round(windowH * 0.85));
    // TRANSITION_DISTANCE: Distancia de scroll durante la cual la tarjeta superior sube suavemente a -105%
    const transDist = Math.max(580, Math.round(windowH * 0.95));
    // Total de desplazamiento requerido dentro del deck apilado
    const totalDeckScroll = (N * holdDist) + ((N - 1) * transDist);
    return { windowH, holdDist, transDist, totalDeckScroll };
  }

  // Smoothstep easing cúbico para inicio y fin de transición ultra suaves
  function smoothstep(t) {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
  }

  // Actualizar enlaces activos en la barra de navegación
  function setActiveNavLink(activeId) {
    if (!activeId) return;
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkHref = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', linkHref === activeId);
    });
    document.querySelectorAll('.m-link').forEach(link => {
      const linkHref = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', linkHref === activeId);
    });
  }

  // Navegación suave a pantalla o sección
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
      const { holdDist, transDist } = getDeckMetrics();
      const wrapperTopInDoc = wrapper.offsetTop;
      const baseOffset = Math.max(0, wrapperTopInDoc - 76);
      // Aterriza exactamente al inicio de la meseta de estancia (hold) de esa pantalla, 100% visible
      const targetScroll = baseOffset + (targetIndex * (holdDist + transDist));
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    } else {
      const headerOffset = 76;
      const targetTop = targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  };

  // Interceptar clicks en enlaces de ancla para usar scrollToScreen
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

  // Física de scroll 100% pura, sin interceptar la rueda ni congelar el navegador
  function updateScrollPhysics() {
    const isMobile = window.innerWidth <= 900;
    const windowH = window.innerHeight;

    if (isMobile) {
      wrapper.style.minHeight = 'auto';
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

    // MODO DESKTOP / PC:
    const { holdDist, transDist, totalDeckScroll } = getDeckMetrics();
    // Altura del wrapper: distancia del deck más 1 viewport para permitir salida natural
    wrapper.style.minHeight = `${totalDeckScroll + windowH}px`;

    const wrapperTopInDoc = wrapper.offsetTop;
    const baseOffset = Math.max(0, wrapperTopInDoc - 76);
    const scrollInside = Math.max(0, window.scrollY - baseOffset);

    // Calcular estado de cada pantalla según la línea de tiempo:
    // Para cada pantalla i:
    //   Llegada A_i = i * (holdDist + transDist)
    //   Meseta de estancia (HOLD): [A_i, A_i + holdDist] -> Se queda centrada al 100% ("scrollear de más")
    //   Transición hacia arriba: [A_i + holdDist, A_i + holdDist + transDist] -> Se desliza a -105%
    //   Completada: > A_i + holdDist + transDist -> Oculta arriba (-105%)

    for (let i = 0; i < N; i++) {
      const screen = screens[i];
      const arrival = i * (holdDist + transDist);
      const holdEnd = arrival + holdDist;
      const transitionEnd = holdEnd + transDist;

      if (i < N - 1) {
        // Pantallas con transición hacia arriba (Pantalla 01 y 02)
        if (scrollInside <= holdEnd) {
          // Dentro de su meseta de estancia (HOLD PLATEAU):
          screen.style.setProperty('--screen-slide-up', '0%');
        } else if (scrollInside < transitionEnd) {
          // ZONA DE TRANSICIÓN ACTIVA Y PROGRESIVA:
          const p = (scrollInside - holdEnd) / transDist;
          const eased = smoothstep(p);
          const slidePercent = eased * 105;
          screen.style.setProperty('--screen-slide-up', `-${slidePercent.toFixed(2)}%`);

          // Revelar la pantalla siguiente (i + 1)
          const nextScreen = screens[i + 1];
          if (nextScreen) {
            nextScreen.style.setProperty('--screen-slide-up', '0%');
            // Logra máxima nitidez y escala antes de terminar la transición total
            const revealP = Math.min(1, eased / 0.75);
            const blur = (1 - revealP) * 14;
            const scale = 0.92 + (0.08 * revealP);
            const opacity = 0.35 + (0.65 * revealP);
            nextScreen.style.setProperty('--reveal-blur', `${blur.toFixed(1)}px`);
            nextScreen.style.setProperty('--reveal-scale', `${scale.toFixed(3)}`);
            nextScreen.style.setProperty('--reveal-opacity', `${opacity.toFixed(2)}`);
          }
        } else {
          // Ya terminó de subir: se queda arriba (-105%)
          screen.style.setProperty('--screen-slide-up', '-105%');
        }
      } else {
        // Última pantalla apilada (Pantalla 03 / Quiénes somos):
        // Siempre se queda en 0%, y cuando scrollInside >= arrival se muestra al 100%
        screen.style.setProperty('--screen-slide-up', '0%');
        if (scrollInside >= arrival) {
          screen.style.setProperty('--reveal-blur', '0px');
          screen.style.setProperty('--reveal-scale', '1');
          screen.style.setProperty('--reveal-opacity', '1');
        }
      }

      // Inicializar pantallas posteriores que aún no entran a la zona de revelación
      const nextIndex = i + 1;
      if (nextIndex < N && scrollInside < arrival + holdDist) {
        const futureScreen = screens[nextIndex];
        futureScreen.style.setProperty('--screen-slide-up', '0%');
        futureScreen.style.setProperty('--reveal-blur', '14px');
        futureScreen.style.setProperty('--reveal-scale', '0.92');
        futureScreen.style.setProperty('--reveal-opacity', '0.35');
      }
    }

    // Actualizar sección activa en el menú de navegación
    const A1 = holdDist + transDist;
    const A2 = 2 * (holdDist + transDist);

    if (scrollInside < A1 - (transDist * 0.25)) {
      setActiveNavLink('inicio');
    } else if (scrollInside < A2 - (transDist * 0.25)) {
      setActiveNavLink('catalogo');
    } else if (scrollInside < totalDeckScroll + 100) {
      setActiveNavLink('quienes-somos');
    } else {
      // Secciones posteriores de flujo natural (Calculadora, Blog, Cobertura, Contacto)
      const naturalSections = ['calculadora', 'cobertura-industrial', 'blog', 'faq', 'contacto'];
      let matchedSection = null;
      for (const secId of naturalSections) {
        const el = document.getElementById(secId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 100) {
            matchedSection = secId;
            break;
          }
        }
      }
      if (matchedSection) {
        setActiveNavLink(matchedSection);
      }
    }

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      requestAnimationFrame(updateScrollPhysics);
      isTicking = true;
    }
  }

  // Listeners de scroll y resize pasivos: CERO BLOQUEO, rendimiento nativo a 60-120 FPS
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
    const privacyCheck = document.getElementById('lead-privacy');
    if (privacyCheck && !privacyCheck.checked) {
      alert('Por favor, acepta el Aviso de Privacidad para continuar con tu cotización.');
      privacyCheck.focus();
      return;
    }

    const formData = {
      name: document.getElementById('lead-name').value.trim(),
      company: document.getElementById('lead-company').value.trim(),
      phone: document.getElementById('lead-phone').value.trim(),
      park: document.getElementById('lead-park').value,
      modality: document.getElementById('lead-modality').value,
      model: inputModel.value,
      privacyAccepted: true
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
    const privacyCheck = document.getElementById('contact-privacy');
    if (privacyCheck && !privacyCheck.checked) {
      alert('Por favor, acepta el Aviso de Privacidad para enviar tu solicitud.');
      privacyCheck.focus();
      return;
    }

    const formData = {
      name: document.getElementById('contact-name').value.trim(),
      company: document.getElementById('contact-company').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      modality: document.getElementById('contact-service').value,
      model: 'General_Quote_Direct',
      privacyAccepted: true
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

// Configurar acordeón interactivo de Preguntas Frecuentes (FAQ)
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer-panel');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isAlreadyOpen = item.classList.contains('active');
      const questionText = item.querySelector('.faq-question-text')?.textContent.trim() || '';

      // Cerrar otros acordeones para mantener orden y foco
      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          other.querySelector('.faq-question-btn')?.setAttribute('aria-expanded', 'false');
          const otherAns = other.querySelector('.faq-answer-panel');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      if (isAlreadyOpen) {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
        pixel.recordEvent('FAQ_Toggle', { question: questionText, action: 'close' });
      } else {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 35 + 'px';
        pixel.recordEvent('FAQ_Toggle', { question: questionText, action: 'open' });
      }
    });
  });
}

// Configurar banner de consentimiento de Cookies y Centro de Preferencias (Cumplimiento LFPDPPP)
function setupCookieConsent() {
  if (cookieConsentInitialized) return;
  cookieConsentInitialized = true;

  const banner = document.getElementById('cookie-consent-banner');
  const btnAccept = document.getElementById('btn-cookie-accept');
  const btnEssential = document.getElementById('btn-cookie-essential');
  const btnPreferences = document.getElementById('btn-cookie-preferences');

  const prefModal = document.getElementById('cookie-preferences-modal');
  const btnPrefClose = document.getElementById('btn-cookie-pref-close');
  const btnSavePrefs = document.getElementById('btn-cookie-save-prefs');
  const btnRejectOptional = document.getElementById('btn-cookie-reject-optional');
  const chkAnalytics = document.getElementById('pref-cookie-analytics');
  const chkMarketing = document.getElementById('pref-cookie-marketing');

  if (!banner) return;

  const currentConsent = pixel.getConsent();

  // Si no ha respondido al banner, mostrarlo con animación
  if (!currentConsent.prompted) {
    setTimeout(() => {
      banner.style.display = 'block';
      requestAnimationFrame(() => {
        banner.classList.add('visible');
      });
      pixel.recordEvent('CookieBannerShown', { status: 'prompted' });
    }, 1200);
  }

  function dismissBanner() {
    banner.classList.remove('visible');
    setTimeout(() => {
      banner.style.display = 'none';
    }, 350);
  }

  function openPreferencesModal() {
    const consent = pixel.getConsent();
    if (chkAnalytics) chkAnalytics.checked = Boolean(consent.analytics);
    if (chkMarketing) chkMarketing.checked = Boolean(consent.marketing);

    prefModal?.classList.add('open');
    prefModal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closePreferencesModal() {
    prefModal?.classList.remove('open');
    prefModal?.setAttribute('aria-hidden', 'true');
    const quoteModal = document.getElementById('quote-modal');
    const privacyModal = document.getElementById('privacy-modal');
    if (!quoteModal?.classList.contains('open') && !privacyModal?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  // Aceptar todas
  btnAccept?.addEventListener('click', () => {
    pixel.setConsent({ analytics: true, marketing: true });
    dismissBanner();
  });

  // Solo necesarias
  btnEssential?.addEventListener('click', () => {
    pixel.setConsent({ analytics: false, marketing: false });
    dismissBanner();
  });

  // Abrir modal de personalización desde el banner
  btnPreferences?.addEventListener('click', () => {
    openPreferencesModal();
  });

  // Cerrar modal de preferencias
  btnPrefClose?.addEventListener('click', closePreferencesModal);
  prefModal?.addEventListener('click', (e) => {
    if (e.target === prefModal) closePreferencesModal();
  });

  // Guardar preferencias personalizadas
  btnSavePrefs?.addEventListener('click', () => {
    const analytics = chkAnalytics ? chkAnalytics.checked : false;
    const marketing = chkMarketing ? chkMarketing.checked : false;
    pixel.setConsent({ analytics, marketing });
    closePreferencesModal();
    dismissBanner();
  });

  // Rechazar opcionales desde el modal
  btnRejectOptional?.addEventListener('click', () => {
    if (chkAnalytics) chkAnalytics.checked = false;
    if (chkMarketing) chkMarketing.checked = false;
    pixel.setConsent({ analytics: false, marketing: false });
    closePreferencesModal();
    dismissBanner();
  });

  // Escuchar clics en botones de "Configuración de Cookies" (ej. en el footer)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.trigger-cookies-preferences');
    if (target) {
      e.preventDefault();
      openPreferencesModal();
    }
  });
}

// Configurar modal de Aviso de Privacidad Integral
function setupPrivacyModal() {
  if (privacyModalInitialized) return;
  privacyModalInitialized = true;

  const modal = document.getElementById('privacy-modal');
  const closeBtn = document.getElementById('btn-privacy-modal-close');
  const understoodBtn = document.getElementById('btn-privacy-modal-understood');

  function openPrivacyModal(triggerSource = 'Generic') {
    modal?.classList.add('open');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    pixel.recordEvent('PrivacyModalView', { source: triggerSource });
  }

  function closePrivacyModal() {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    const quoteModal = document.getElementById('quote-modal');
    if (!quoteModal?.classList.contains('open')) {
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.trigger-privacy-modal, a[href="#aviso-privacidad"]');
    if (trigger) {
      e.preventDefault();
      const source = trigger.closest('#lead-form') ? 'Lead_Form' : trigger.closest('#contact-direct-form') ? 'Contact_Form' : trigger.closest('#cookie-consent-banner') ? 'Cookie_Banner' : 'Footer_Link';
      openPrivacyModal(source);
    }
  });

  closeBtn?.addEventListener('click', closePrivacyModal);
  understoodBtn?.addEventListener('click', closePrivacyModal);

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      closePrivacyModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) {
      closePrivacyModal();
    }
  });

  window.openPrivacyModal = openPrivacyModal;
}

// Trackers de clics en redes sociales (Facebook e Instagram)
function setupSocialTrackers() {
  document.addEventListener('click', (e) => {
    const fbLink = e.target.closest('a[href*="facebook.com"]');
    if (fbLink) {
      pixel.recordEvent('SocialChannelClick', { platform: 'Facebook', url: fbLink.href });
    }
    const igLink = e.target.closest('a[href*="instagram.com"]');
    if (igLink) {
      pixel.recordEvent('SocialChannelClick', { platform: 'Instagram', url: igLink.href });
    }
  });
}

// Monitor global de movimientos y telemetría (Scroll Depth, Reveal, Catalog Reel)
function setupGlobalMovementTracking() {
  if (movementTrackingInitialized) return;
  movementTrackingInitialized = true;

  // Seguimiento de profundidad de scroll (25%, 50%, 75%, 90%)
  const scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const scrollPct = Math.round((scrollTop / docHeight) * 100);

          [25, 50, 75, 90].forEach(milestone => {
            if (scrollPct >= milestone && !scrollMilestones[milestone]) {
              scrollMilestones[milestone] = true;
              pixel.recordEvent('ScrollDepth', {
                depth: `${milestone}%`,
                page: currentRoute,
                timestamp: Date.now()
              });
            }
          });
        }
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}

// Exponer en window para llamadas de botones
window.cimaApp = {
  openQuoteModal: (model, modality) => {
    if (window.openQuoteModal) window.openQuoteModal(model, modality);
  },
  openPrivacyModal: (source) => {
    if (window.openPrivacyModal) window.openPrivacyModal(source);
  }
};


