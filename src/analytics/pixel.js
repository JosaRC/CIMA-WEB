/**
 * CIMA Analytics & Conversion Pixel Engine
 * Soporte dual: Meta Pixel (Facebook/Instagram Ads) + Google Tag (Google Ads / GA4)
 * Incluye DataLayer estándar y Event Bus para el HUD de depuración en vivo.
 */

class CIMAPixelEngine {
  constructor() {
    this.metaPixelId = 'PIXEL-CIMA-MX-2026';
    this.googleAdsId = 'AW-CIMA-84920412';
    this.subscribers = [];
    this.eventLog = [];
    this.init();
  }

  init() {
    // Inicializar dataLayer global
    window.dataLayer = window.dataLayer || [];

    // Inicializar mock de gtag si no existe
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', this.googleAdsId, {
        send_page_view: false,
        country: 'MX',
        region: 'Aguascalientes'
      });
    }

    // Inicializar mock de fbq si no existe
    if (!window.fbq) {
      window.fbq = (...args) => {
        window.dataLayer.push({ meta_pixel: args });
      };
      window.fbq.queue = [];
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
    }

    // Log de inicialización
    this.recordEvent('SystemInit', {
      metaPixelId: this.metaPixelId,
      googleAdsId: this.googleAdsId,
      regionTarget: 'Aguascalientes & Bajío Industrial',
      status: 'Ready & Listening'
    });
  }

  // Suscribirse a eventos para el visor en vivo (HUD)
  subscribe(callback) {
    this.subscribers.push(callback);
    // Enviar eventos ya ocurridos
    this.eventLog.forEach(evt => callback(evt));
  }

  recordEvent(eventName, payload, platforms = ['Meta Pixel', 'Google Ads', 'DataLayer']) {
    const timestamp = new Date().toLocaleTimeString('es-MX', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const eventRecord = {
      id: Math.random().toString(36).substring(2, 9),
      name: eventName,
      payload,
      platforms,
      timestamp,
      rawTime: Date.now()
    };

    this.eventLog.unshift(eventRecord);
    if (this.eventLog.length > 50) this.eventLog.pop();

    // Notificar al visor en pantalla
    this.subscribers.forEach(fn => fn(eventRecord));

    // Despachar a dataLayer
    window.dataLayer.push({
      event: eventName,
      ...payload,
      cima_timestamp: Date.now()
    });

    // Despachar a Meta Pixel (fbq)
    if (typeof window.fbq === 'function') {
      const isStandardMeta = ['PageView', 'ViewContent', 'Lead', 'Contact', 'InitiateCheckout', 'CustomizeProduct'].includes(eventName);
      if (isStandardMeta) {
        window.fbq('track', eventName, payload);
      } else {
        window.fbq('trackCustom', eventName, payload);
      }
    }

    // Despachar a Google Ads / GA4 (gtag)
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        send_to: this.googleAdsId,
        ...payload
      });
    }

    console.log(`%c[CIMA PIXEL] 🎯 ${eventName}`, 'background: #F59E0B; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 3px;', payload);
  }

  // --- MÉTODOS DE EVENTOS CLAVE DE NEGOCIO ---

  trackPageView(pageName = 'Inicio') {
    this.recordEvent('PageView', {
      page_title: pageName,
      location: window.location.href,
      region: 'Aguascalientes'
    }, ['Meta Pixel', 'Google Tag', 'DataLayer']);
  }

  trackViewContent(product) {
    this.recordEvent('ViewContent', {
      content_type: 'product_forklift',
      content_name: product.name,
      content_category: product.category,
      capacity_tons: product.capacity,
      mast_height_m: product.liftHeight,
      fuel_type: product.fuel,
      currency: 'MXN',
      estimated_monthly_rental: product.priceMonthly
    }, ['Meta Pixel', 'Google Ads', 'DataLayer']);
  }

  trackInteract3D(action, details = {}) {
    this.recordEvent('Interact3D_Montacargas', {
      interaction_type: action,
      component: 'ThreeJS_Motion_Stage',
      camera_angle: details.yaw || 'dynamic',
      elevation_percent: details.elevation || 0,
      lights_state: details.lights ? 'ON' : 'OFF',
      ...details
    }, ['Meta Pixel (Custom)', 'GA4 Event', 'DataLayer']);
  }

  trackFilterCatalog(filterType, filterValue) {
    this.recordEvent('FilterCatalog', {
      filter_dimension: filterType,
      selected_value: filterValue,
      catalog_context: 'Aguascalientes_Inventory'
    }, ['Meta Pixel (Custom)', 'GA4 Event']);
  }

  trackInitiateQuote(product, modality = 'Renta') {
    this.recordEvent('InitiateCheckout', {
      content_name: product ? product.name : 'Cotización Personalizada',
      content_category: 'Montacargas Industriales',
      modality: modality, // Renta o Compra
      market: 'Aguascalientes / Bajío',
      currency: 'MXN'
    }, ['Meta Pixel', 'Google Ads Conversion', 'DataLayer']);
  }

  trackContactWhatsApp(modelName = 'General', origin = 'Floating_Button') {
    this.recordEvent('Contact', {
      method: 'WhatsApp_Direct',
      model_interest: modelName,
      placement: origin,
      target_branch: 'Aguascalientes Norte - Chichimeco'
    }, ['Meta Pixel', 'Google Ads Conversion', 'DataLayer']);
  }

  trackLead(formData) {
    this.recordEvent('Lead', {
      lead_name: formData.name,
      company: formData.company,
      industrial_park: formData.park || 'No especificado',
      model_interest: formData.model,
      modality: formData.modality,
      phone: formData.phone,
      conversion_value: 12000, // Valor estimado por lead calificado
      currency: 'MXN'
    }, ['Meta Pixel', 'Google Ads Conversion Primary', 'DataLayer']);
  }

  trackBlogEngagement(articleTitle, depth) {
    this.recordEvent(`BlogRead_${depth}`, {
      article: articleTitle,
      scroll_depth: `${depth}%`,
      reading_intent: depth === 100 ? 'High_Nurtured_Lead' : 'Engaged_Prospect'
    }, ['Meta Pixel (Custom)', 'GA4 Event']);
  }
}

export const pixel = new CIMAPixelEngine();
