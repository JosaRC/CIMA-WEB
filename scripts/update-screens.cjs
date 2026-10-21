const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '..', 'src', 'main.js');
let content = fs.readFileSync(mainJsPath, 'utf8');

// 1. Update Pantalla pills from / 06 to / 07
content = content.replace(/Pantalla 01 \/ 06/g, 'Pantalla 01 / 07');
content = content.replace(/Pantalla 02 \/ 06/g, 'Pantalla 02 / 07');
content = content.replace(/Pantalla 03 \/ 06/g, 'Pantalla 03 / 07');
content = content.replace(/Pantalla 04 \/ 06/g, 'Pantalla 04 / 07');
content = content.replace(/Pantalla 05 \/ 06/g, 'Pantalla 05 / 07');
content = content.replace(/Pantalla 06 \/ 06/g, 'Pantalla 06 / 07');

// 2. Wrap Screen 01 content with screen-body-animated
const s1Search = `<span class="screen-title-sub">Solución de Elevación Industrial Multi-Marca Aguascalientes</span>
        </div>

        <div class="two-col-grid">`;
const s1Replace = `<span class="screen-title-sub">Solución de Elevación Industrial Multi-Marca Aguascalientes</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">`;
content = content.replace(s1Search, s1Replace);

// End of Screen 01 before Screen 02
const s1EndSearch = `          </div>
        </div>
      </section>

      <!-- PANTALLA 2:`;
const s1EndReplace = `          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 2:`;
content = content.replace(s1EndSearch, s1EndReplace);

// 3. Wrap Screen 02 content with screen-body-animated
const s2Search = `<span class="screen-title-sub">Taller Matriz, Horarios de Atención & Google Maps</span>
        </div>

        <div class="two-col-grid">`;
const s2Replace = `<span class="screen-title-sub">Taller Matriz, Horarios de Atención & Google Maps</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">`;
content = content.replace(s2Search, s2Replace);

// End of Screen 02 before Screen 03
const s2EndSearch = `              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- PANTALLA 3:`;
const s2EndReplace = `              </a>
            </div>
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 3:`;
content = content.replace(s2EndSearch, s2EndReplace);

// 4. Wrap Screen 03 content with screen-body-animated
const s3Search = `<span class="screen-title-sub">Liderazgo Multi-Marca & Personal Altamente Capacitado</span>
        </div>

        <div class="two-col-grid">`;
const s3Replace = `<span class="screen-title-sub">Liderazgo Multi-Marca & Personal Altamente Capacitado</span>
        </div>

        <div class="screen-body-animated">
          <div class="two-col-grid">`;
content = content.replace(s3Search, s3Replace);

// End of Screen 03 before Screen 04
const s3EndSearch = `              <span style="font-size: 0.85rem; color: var(--green-online); font-weight: 700;">Multi-Marca</span>
            </div>
          </div>
        </div>
      </section>

      <!-- PANTALLA 4:`;
const s3EndReplace = `              <span style="font-size: 0.85rem; color: var(--green-online); font-weight: 700;">Multi-Marca</span>
            </div>
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 4:`;
content = content.replace(s3EndSearch, s3EndReplace);

// 5. Wrap Screen 04 content with screen-body-animated
const s4Search = `<span class="screen-title-sub">Catálogo Interactivo 3D Estilo Carta</span>
        </div>

        <div class="section-heading-full">`;
const s4Replace = `<span class="screen-title-sub">Catálogo Interactivo 3D Estilo Carta</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">`;
content = content.replace(s4Search, s4Replace);

// End of Screen 04 before Screen 05
const s4EndSearch = `        <div class="catalog-grid" id="catalog-container">
          <!-- Inyectado dinámicamente con flip-card 3D -->
        </div>
      </section>

      <!-- PANTALLA 5:`;
const s4EndReplace = `        <div class="catalog-grid" id="catalog-container">
          <!-- Inyectado dinámicamente con flip-card 3D -->
        </div>
      </div>
      </section>

      <!-- PANTALLA 5:`;
content = content.replace(s4EndSearch, s4EndReplace);

// 6. Wrap Screen 05 content with screen-body-animated
const s5Search = `<span class="screen-title-sub">Calculadora Técnica & Dimensionamiento</span>
        </div>

        <div class="section-heading-full">`;
const s5Replace = `<span class="screen-title-sub">Calculadora Técnica & Dimensionamiento</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">`;
content = content.replace(s5Search, s5Replace);

// End of Screen 05 before Screen 06
const s5EndSearch = `          <div class="calc-result-box" id="calc-recommendation-box">
            <!-- Inyectado por setupCalculator -->
          </div>
        </div>
      </section>

      <!-- PANTALLA 6:`;
const s5EndReplace = `          <div class="calc-result-box" id="calc-recommendation-box">
            <!-- Inyectado por setupCalculator -->
          </div>
        </div>
      </div>
      </section>

      <!-- PANTALLA 6:`;
content = content.replace(s5EndSearch, s5EndReplace);

// 7. Wrap Screen 06 content with screen-body-animated
const s6Search = `<span class="screen-title-sub">Criterios de Decisión, ROI & Inbound</span>
        </div>

        <div class="section-heading-full">`;
const s6Replace = `<span class="screen-title-sub">Criterios de Decisión, ROI & Inbound</span>
        </div>

        <div class="screen-body-animated">
          <div class="section-heading-full">`;
content = content.replace(s6Search, s6Replace);

// End of Screen 06 before Screen 07
const s6EndSearch = `        <div class="blog-grid" id="blog-cards-grid">
          <!-- Inyectado dinámicamente -->
        </div>
      </section>

      <!-- PANTALLA 7:`;
const s6EndReplace = `        <div class="blog-grid" id="blog-cards-grid">
          <!-- Inyectado dinámicamente -->
        </div>
      </div>
      </section>

      <!-- PANTALLA 7:`;
content = content.replace(s6EndSearch, s6EndReplace);

// 8. Update Screen 07 to include screen-header-badge and screen-body-animated
const s7Search = `      <!-- PANTALLA 7: CONTACTO DIRECTO, INFORMACIÓN DEL LOCAL Y FORMULARIO B2B -->
      <section class="stacked-screen screen-contacto" id="contacto">
        <div class="contact-grid">`;

const s7Replace = `      <!-- PANTALLA 7: CONTACTO DIRECTO, INFORMACIÓN DEL LOCAL Y FORMULARIO B2B -->
      <section class="stacked-screen screen-contacto" id="contacto" data-screen="07">
        <div class="screen-header-badge">
          <span class="screen-counter-pill">Pantalla 07 / 07</span>
          <span class="screen-title-sub">Atención Inmediata en Planta & Taller</span>
        </div>

        <div class="screen-body-animated">
          <div class="contact-grid">`;
content = content.replace(s7Search, s7Replace);

// End of Screen 07 before Footer
const s7EndSearch = `              <button type="submit" class="btn btn-primary btn-block">
                Enviar Solicitud a CIMA
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>`;

const s7EndReplace = `              <button type="submit" class="btn btn-primary btn-block">
                Enviar Solicitud a CIMA
              </button>
            </form>
          </div>
        </div>
      </div>
      </section>
    </div>`;
content = content.replace(s7EndSearch, s7EndReplace);

// 9. Update inline amber colors in main.js
content = content.replace(/style="color: var\(--amber-primary\); font-weight: 700;"/g, 'style="color: var(--cima-blue); font-weight: 700;"');
content = content.replace(/color: var\(--amber-primary\); margin-bottom: 1rem;/g, 'color: var(--cima-blue); margin-bottom: 1rem;');

// 10. Update initMainInteractiveComponents to include setupAllHoverBorderTraces
content = content.replace(
  `function initMainInteractiveComponents() {
  setupParallaxStage();
  setupCatalog();
  setupCalculator();
  setupBlog();
  setupScrollCardDeck();
}`,
  `function initMainInteractiveComponents() {
  setupParallaxStage();
  setupCatalog();
  setupCalculator();
  setupBlog();
  setupScrollCardDeck();
  setupAllHoverBorderTraces();
}`
);

// 11. Add setupAllHoverBorderTraces function and update setupScrollCardDeck
const oldScrollFn = `// Configurar animación de reveal apilado (Deck-of-Cards Screen Reveal al hacer Scroll)
function setupScrollCardDeck() {
  const screens = document.querySelectorAll('.stacked-screen');
  if (!screens.length) return;

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const windowHeight = window.innerHeight;

    screens.forEach((screen, index) => {
      const rect = screen.getBoundingClientRect();
      const topOffset = rect.top;

      if (topOffset <= 90 && rect.bottom > 90) {
        screen.classList.add('is-pinned');
        screen.classList.remove('is-past');
      } else if (rect.bottom <= 90) {
        screen.classList.remove('is-pinned');
        screen.classList.add('is-past');
      } else {
        screen.classList.remove('is-pinned', 'is-past');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}`;

const newScrollAndTraceFn = `// Inyectar animación de borde perimetral en sentido horario (delgado, nítido y sin difuminado) en todas las tarjetas
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

// Configurar animación de reveal apilado (Deck-of-Cards Screen Reveal al hacer Scroll)
// "la tarjeta que se mueve es la de arriba y la tarjeta que va entrando en escena tiene dos efectos:
// las letras comienzan con blur alto y más pequeñas, y conforme avanza el scroll el blur disminuye
// y las letras quedan en su tamaño original a la mitad del desplazamiento total"
function setupScrollCardDeck() {
  const screens = Array.from(document.querySelectorAll('.stacked-screen'));
  if (!screens.length) return;

  let isTicking = false;

  function updateScrollPhysics() {
    const windowH = window.innerHeight;
    const topPinned = 76;
    const totalDisplacement = Math.max(300, windowH - topPinned);
    const halfDisplacement = totalDisplacement * 0.5;

    screens.forEach((screen, index) => {
      const rect = screen.getBoundingClientRect();
      const body = screen.querySelector('.screen-body-animated');

      // Pantalla 01 (Hero): Visible y nítida al 100% desde el primer fotograma
      if (index === 0) {
        if (body) {
          screen.style.setProperty('--reveal-blur', '0px');
          screen.style.setProperty('--reveal-scale', '1');
          screen.style.setProperty('--reveal-opacity', '1');
        }
      } else {
        // Desplazamiento desde que la tarjeta entra por el borde inferior de la ventana
        const traveled = windowH - rect.top;

        if (traveled <= 0) {
          // Fuera de la vista inferior: texto pequeño con blur alto
          screen.style.setProperty('--reveal-blur', '14px');
          screen.style.setProperty('--reveal-scale', '0.90');
          screen.style.setProperty('--reveal-opacity', '0.35');
        } else if (traveled < halfDisplacement) {
          // Entrando en escena (0% a 50% del desplazamiento):
          // Blur disminuye de 14px a 0px, escala crece de 0.90 al tamaño original 1.0
          const p = traveled / halfDisplacement;
          const blur = (1 - p) * 14;
          const scale = 0.90 + (0.10 * p);
          const opacity = 0.35 + (0.65 * p);

          screen.style.setProperty('--reveal-blur', \`\${blur.toFixed(1)}px\`);
          screen.style.setProperty('--reveal-scale', \`\${scale.toFixed(3)}\`);
          screen.style.setProperty('--reveal-opacity', \`\${opacity.toFixed(2)}\`);
        } else {
          // A la mitad del desplazamiento y más allá: letras normales y sin blur
          screen.style.setProperty('--reveal-blur', '0px');
          screen.style.setProperty('--reveal-scale', '1');
          screen.style.setProperty('--reveal-opacity', '1');
        }
      }

      // "La tarjeta que se mueve es la de arriba":
      // Conforme la siguiente tarjeta va entrando, la tarjeta actual se desplaza suavemente hacia arriba
      const nextScreen = screens[index + 1];
      if (nextScreen) {
        const nextRect = nextScreen.getBoundingClientRect();
        const nextTraveled = windowH - nextRect.top;
        if (nextTraveled > 0) {
          const pushProgress = Math.min(1, Math.max(0, nextTraveled / totalDisplacement));
          const pushUp = pushProgress * 36;
          screen.style.setProperty('--card-push-up', \`-\${pushUp.toFixed(1)}px\`);
        } else {
          screen.style.setProperty('--card-push-up', '0px');
        }
      } else {
        screen.style.setProperty('--card-push-up', '0px');
      }

      // Estados de sticky pinned
      if (rect.top <= topPinned + 14 && rect.bottom > topPinned + 14) {
        screen.classList.add('is-pinned');
        screen.classList.remove('is-past');
      } else if (rect.bottom <= topPinned + 14) {
        screen.classList.remove('is-pinned');
        screen.classList.add('is-past');
      } else {
        screen.classList.remove('is-pinned', 'is-past');
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
}`;

content = content.replace(oldScrollFn, newScrollAndTraceFn);

// Also in renderList of setupCatalog: re-call setupAllHoverBorderTraces()
content = content.replace(
  `    // Configurar click para voltear carta y abrir modal
    setupFlipCards();`,
  `    // Configurar click para voltear carta y abrir modal
    setupFlipCards();
    setupAllHoverBorderTraces();`
);

fs.writeFileSync(mainJsPath, content, 'utf8');
console.log('src/main.js successfully updated with animated bodies, hover traces and scroll physics!');
