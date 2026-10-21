/**
 * Catálogo Oficial de Montacargas CIMA - Especializado para la Región Bajío / Aguascalientes
 * Categorías: Combustión Dual (Gas LP), Eléctricos Batería Litio, Pasillo Angosto (Reach) y Heavy Duty.
 */

export const FORKLIFT_CATALOG = [
  {
    id: 'cima-c25-dual',
    name: 'CIMA C-25 Advance Dual',
    category: 'combustion',
    categoryLabel: 'Gas LP / Gasolina',
    capacity: '2.5 Toneladas (5,000 lbs)',
    capacityNum: 2.5,
    liftHeight: '4.80 metros (Mástil Triplex)',
    liftHeightNum: 4.8,
    fuel: 'Dual Gas LP / Gasolina',
    turningRadius: '2.24 m',
    tires: 'Neumático Sólido Todo Terreno',
    engine: 'Nissan K25 Industrial 4 Cilindros',
    bestFor: 'Patios de maniobras, cross-docking y naves con ventilación mixta.',
    recommendedPark: 'Parque Industrial San Francisco y PIVA',
    priceMonthly: '$18,500 MXN / mes',
    badge: 'Más Rentado en Ags',
    highlight: true,
    image: '/cima-forklift-main.jpg',
    features: [
      'Desplazador lateral integrado (Side Shift)',
      'Faros LED Ultra-Bright + Blue Spot de reversa',
      'Cumplimiento estricto NOM-006-STPS',
      'Asiento ergonómico con sensor de presencia'
    ]
  },
  {
    id: 'cima-e20-lithium',
    name: 'CIMA E-20 Lithium Pro',
    category: 'electric',
    categoryLabel: 'Eléctrico Ion-Litio',
    capacity: '2.0 Toneladas (4,000 lbs)',
    capacityNum: 2.0,
    liftHeight: '5.50 metros (Mástil Triplex)',
    liftHeightNum: 5.5,
    fuel: 'Batería Litio 80V (Carga Rápida 1.5 hrs)',
    turningRadius: '1.98 m',
    tires: 'Cushion / Sólidas Anti-huella',
    engine: 'Motores Duales AC Libres de Mantenimiento',
    bestFor: 'Plantas automotrices cerradas, farmacéutica y alimentos (Cero Emisiones).',
    recommendedPark: 'Nissan A1/A2, COMPAS y Parque FINSA',
    priceMonthly: '$24,000 MXN / mes',
    badge: '100% Ecológico & Silencioso',
    highlight: true,
    image: '/forklift-e20.jpg',
    features: [
      'Batería sin efecto memoria: carga de oportunidad',
      'Frenado regenerativo con recuperación de energía',
      'Display digital interactivo con diagnóstico a bordo',
      'Ruedas que no manchan pisos epóxicos'
    ]
  },
  {
    id: 'cima-r16-reach',
    name: 'CIMA R-16 Reach Master',
    category: 'reach',
    categoryLabel: 'Pasillo Angosto (Reach)',
    capacity: '1.6 Toneladas (3,500 lbs)',
    capacityNum: 1.6,
    liftHeight: '8.50 metros (Alta Estiba)',
    liftHeightNum: 8.5,
    fuel: 'Eléctrico AC 48V',
    turningRadius: '1.65 m (Pasillo mínimo 2.7m)',
    tires: 'Poliuretano de Alta Durabilidad',
    engine: 'Tracción & Elevación AC Independiente',
    bestFor: 'Centros de distribución (CEDIS) y racks de alta densidad vertical.',
    recommendedPark: 'PILA (Parque Industrial Logístico) y Chichimeco',
    priceMonthly: '$29,500 MXN / mes',
    badge: 'Optimiza 40% más espacio',
    highlight: false,
    image: '/forklift-r16.jpg',
    features: [
      'Pantalla con cámara inalámbrica en punta de horquilla',
      'Selector de altura de estiba pre-programable',
      'Timón de dirección asistida con control 360°',
      'Amortiguación automática en tope de mástil'
    ]
  },
  {
    id: 'cima-c35-power',
    name: 'CIMA C-35 Heavy Duty',
    category: 'combustion',
    categoryLabel: 'Gas LP / Gasolina',
    capacity: '3.5 Toneladas (7,700 lbs)',
    capacityNum: 3.5,
    liftHeight: '4.50 metros (Dúplex Reforzado)',
    liftHeightNum: 4.5,
    fuel: 'Gas LP con tanque intercambiable',
    turningRadius: '2.42 m',
    tires: 'Neumáticas Doble Rodado Frontal',
    engine: 'Mitsubishi 4G64 Industrial',
    bestFor: 'Industria metalmecánica, fundición y carga de rollos de acero.',
    recommendedPark: 'Valle de Aguascalientes y Peñuelas',
    priceMonthly: '$26,000 MXN / mes',
    badge: 'Torque Pesado',
    highlight: false,
    image: '/forklift-c25.jpg',
    features: [
      'Chasis reforzado con vigas estructurales dobles',
      'Radiador sobredimensionado anti-sobrecalentamiento',
      'Horquillas forjadas de 48" clase III',
      'Baliza estroboscópica ámbar 360° integrada'
    ]
  },
  {
    id: 'cima-d50-titan',
    name: 'CIMA D-50 Titan Diésel',
    category: 'diesel',
    categoryLabel: 'Diésel Industrial',
    capacity: '5.0 Toneladas (11,000 lbs)',
    capacityNum: 5.0,
    liftHeight: '4.00 metros (Visión Panorámica)',
    liftHeightNum: 4.0,
    fuel: 'Diésel Ultra Bajo Azufre (UBA)',
    turningRadius: '2.85 m',
    tires: 'Neumático Todo Terreno Muelleo Reforzado',
    engine: 'Isuzu 4JG2 Turbo Diésel',
    bestFor: 'Construcción pesada, patios de contenedores y matricería automotriz.',
    recommendedPark: 'Parques Industriales Sur y Zona Ferroviaria',
    priceMonthly: '$34,500 MXN / mes',
    badge: 'Máxima Potencia',
    highlight: false,
    image: '/forklift-d50.jpg',
    features: [
      'Capacidad para contenedores y maquinaria pesada',
      'Transmisión Powershift electrohidráulica',
      'Cabina con aire acondicionado opcional',
      'Mantenimiento en sitio cada 250 horas incluido'
    ]
  },
  {
    id: 'cima-t15-electric',
    name: 'CIMA T-15 Walkie Pallet',
    category: 'electric',
    categoryLabel: 'Transpaleta Eléctrica',
    capacity: '1.5 Toneladas (3,300 lbs)',
    capacityNum: 1.5,
    liftHeight: '0.20 m (Traslado Ágil)',
    liftHeightNum: 0.2,
    fuel: 'Batería Litio Extraíble (Plug & Play)',
    turningRadius: '1.35 m',
    tires: 'Poliuretano Silencioso',
    engine: 'Motor Eléctrico Brushless DC',
    bestFor: 'Carga y descarga express de camionetas y trailers en andén.',
    recommendedPark: 'CEDIS retail y agroindustria Aguascalientes',
    priceMonthly: '$6,800 MXN / mes',
    badge: 'Económico & Ágil',
    highlight: false,
    image: '/forklift-t15.jpg',
    features: [
      'Pesa solo 130 kg: entra en rampas elevadoras',
      'Batería tipo maletín reemplazable en 10 segundos',
      'Botón de reversa anti-atrapamiento en el timón',
      'Operación modo tortuga para espacios estrechos'
    ]
  }
];

export const INDUSTRIAL_PARKS_AGUASCALIENTES = [
  { name: 'Parque Ind. Chichimeco', deliveryTime: '< 90 minutos', zone: 'Jesús María / Norte' },
  { name: 'Parque Ind. San Francisco (PISF)', deliveryTime: '< 75 minutos', zone: 'San Fco. de los Romo' },
  { name: 'PIVA (Valle de Aguascalientes)', deliveryTime: '< 60 minutos', zone: 'Aguascalientes Norte' },
  { name: 'PILA (Logístico de Ags)', deliveryTime: '< 45 minutos', zone: 'Aguascalientes Sur' },
  { name: 'FINSA Aguascalientes', deliveryTime: '< 60 minutos', zone: 'Aeropuerto / Sur' },
  { name: 'Santa Clara / Peñuelas', deliveryTime: '< 90 minutos', zone: 'Sur Industrial' }
];
