import { pixel } from '../analytics/pixel.js';

/**
 * Componente Parallax 2.5D / Multi-Capa con Rotación y Desplazamiento por Mouse
 * Crea una ilusión de profundidad hiper-realista y prémium sin parecer 'fake' o caricaturesco.
 */

export function initParallaxForklift(containerElement) {
  if (!containerElement) return;

  const card = containerElement.querySelector('.parallax-stage-card');
  const layerBg = containerElement.querySelector('.layer-bg');
  const layerShadow = containerElement.querySelector('.layer-shadow');
  const layerMachine = containerElement.querySelector('.layer-machine');
  const layerGlow = containerElement.querySelector('.layer-headlight-beam');
  const layerHud = containerElement.querySelector('.layer-hud');
  const sheenOverlay = containerElement.querySelector('.layer-sheen');

  if (!card || !layerMachine) return;

  // Variables de interpolación (lerp) para suavidad extrema
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isHovered = false;
  let lightsActive = true;
  let inspectActive = false;
  let animationFrameId = null;

  // Configuración de sensibilidad
  const MAX_TILT_DEG = 9.5; // Rotación máxima en grados
  const MACHINE_SHIFT_PX = 28; // Desplazamiento de la capa del montacargas
  const HUD_SHIFT_PX = 46; // Desplazamiento de las etiquetas flotantes
  const BG_SHIFT_PX = 14; // Desplazamiento inverso del fondo

  function onMouseMove(e) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalizar de -1 a 1
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    targetX = Math.max(-1, Math.min(1, normX));
    targetY = Math.max(-1, Math.min(1, normY));
    isHovered = true;

    // Sheen glare position
    if (sheenOverlay) {
      sheenOverlay.style.background = `radial-gradient(circle 350px at ${x}px ${y}px, rgba(255, 255, 255, 0.16) 0%, rgba(25, 68, 124, 0.05) 50%, transparent 80%)`;
    }
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = card.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      targetX = ((x / rect.width) * 2 - 1) * 0.8;
      targetY = ((y / rect.height) * 2 - 1) * 0.8;
      isHovered = true;
    }
  }

  function onMouseLeave() {
    targetX = 0;
    targetY = 0;
    isHovered = false;
    if (sheenOverlay) {
      sheenOverlay.style.background = `radial-gradient(circle 400px at 50% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)`;
    }
    pixel.trackInteract3D('parallax_mouse_leave');
  }

  function onMouseEnter() {
    pixel.trackInteract3D('parallax_mouse_enter');
  }

  let isRunning = false;

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      animationFrameId = requestAnimationFrame(renderLoop);
    }
  }

  // Loop de renderizado optimizado a 60 FPS con auto-pausa cuando está en reposo
  function renderLoop() {
    // Interpolación lineal suave (lerp factor: 0.085)
    currentX += (targetX - currentX) * 0.085;
    currentY += (targetY - currentY) * 0.085;

    // 1. Rotación de la tarjeta principal
    const rotateY = currentX * MAX_TILT_DEG;
    const rotateX = -currentY * (MAX_TILT_DEG * 0.75);
    card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;

    // 2. Capa Fondo
    if (layerBg) {
      const bgX = -currentX * BG_SHIFT_PX;
      const bgY = -currentY * BG_SHIFT_PX;
      layerBg.style.transform = `translate3d(${bgX.toFixed(1)}px, ${bgY.toFixed(1)}px, -40px) scale(1.08)`;
    }

    // 3. Capa Sombra de Piso
    if (layerShadow) {
      const shadowX = currentX * (MACHINE_SHIFT_PX * 0.4);
      const shadowSkew = currentX * 3;
      layerShadow.style.transform = `translate3d(${shadowX.toFixed(1)}px, 0, 15px) skewX(${shadowSkew.toFixed(1)}deg) scale(${1 - currentY * 0.04})`;
    }

    // 4. Capa Principal del Montacargas Real
    if (layerMachine) {
      const machineX = currentX * MACHINE_SHIFT_PX;
      const machineY = currentY * (MACHINE_SHIFT_PX * 0.65);
      layerMachine.style.transform = `translate3d(${machineX.toFixed(1)}px, ${machineY.toFixed(1)}px, 50px) scale(1.02)`;
    }

    // 5. Haz de Luz de los Faros LED
    if (layerGlow && lightsActive) {
      const glowX = currentX * (MACHINE_SHIFT_PX * 1.2);
      const glowY = currentY * (MACHINE_SHIFT_PX * 0.8);
      layerGlow.style.transform = `translate3d(${glowX.toFixed(1)}px, ${glowY.toFixed(1)}px, 70px) rotate(${currentX * 4}deg)`;
    }

    // 6. Capa Frontal HUD / Tags flotantes
    if (layerHud) {
      const hudX = currentX * HUD_SHIFT_PX;
      const hudY = currentY * HUD_SHIFT_PX;
      layerHud.style.transform = `translate3d(${hudX.toFixed(1)}px, ${hudY.toFixed(1)}px, 85px)`;
    }

    // Si vuelve al centro y no hay cursor activo, detener loop para ahorrar GPU a 60 FPS
    if (!isHovered && Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001) {
      currentX = 0;
      currentY = 0;
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      isRunning = false;
      return;
    }

    animationFrameId = requestAnimationFrame(renderLoop);
  }

  // Listeners de interacción con reanudación condicional
  card.addEventListener('mousemove', (e) => {
    onMouseMove(e);
    startLoop();
  });
  card.addEventListener('mouseleave', () => {
    onMouseLeave();
    startLoop();
  });
  card.addEventListener('mouseenter', (e) => {
    onMouseEnter(e);
    startLoop();
  });
  card.addEventListener('touchmove', (e) => {
    onTouchMove(e);
    startLoop();
  }, { passive: true });
  card.addEventListener('touchend', () => {
    onMouseLeave();
    startLoop();
  });

  // Ejecución inicial y reposo
  startLoop();

  // --- CONTROLES DE LA TARJETA ---
  const btnToggleLights = containerElement.querySelector('#btn-parallax-lights');
  const btnReset = containerElement.querySelector('#btn-parallax-reset');

  if (btnToggleLights) {
    btnToggleLights.addEventListener('click', () => {
      lightsActive = !lightsActive;
      btnToggleLights.classList.toggle('active', lightsActive);
      if (layerGlow) {
        layerGlow.style.opacity = lightsActive ? '1' : '0';
      }
      btnToggleLights.querySelector('.btn-label').textContent = lightsActive ? 'Faros: ON' : 'Faros: OFF';
      pixel.trackInteract3D('toggle_parallax_lights', { lightsActive });
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      targetX = 0;
      targetY = 0;
      pixel.trackInteract3D('reset_parallax_view');
    });
  }

  return {
    destroy: () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
      card.removeEventListener('mouseenter', onMouseEnter);
    }
  };
}
