// src/utils/constantes.js

/**
 * Unidades de medida predefinidas
 */
export const UNIDADES_PREDEFINIDAS = [
  // Volumen
  { valor: 'tz', etiqueta: 'Taza', categoria: 'volumen' },
  { valor: 'ml', etiqueta: 'Mililitro', categoria: 'volumen' },
  { valor: 'l', etiqueta: 'Litro', categoria: 'volumen' },
  
  // Peso
  { valor: 'g', etiqueta: 'Gramo', categoria: 'peso' },
  { valor: 'oz', etiqueta: 'Onza', categoria: 'peso' },
  { valor: 'lb', etiqueta: 'Libra', categoria: 'peso' },
  
  // Cubiertos
  { valor: 'cda', etiqueta: 'Cucharada', categoria: 'cubiertos' },
  { valor: 'cdita', etiqueta: 'Cucharadita', categoria: 'cubiertos' },
  
  // Unidades
  { valor: 'unidad', etiqueta: 'Unidad', categoria: 'unidad' },
  { valor: 'rebanada', etiqueta: 'Rebanada', categoria: 'unidad' },
  { valor: 'trozo', etiqueta: 'Trozo', categoria: 'unidad' },
];

/**
 * Métodos de cocción comunes
 */
export const METODOS_COCCION = [
  'Al horno',
  'A la plancha',
  'Hervido',
  'Al vapor',
  'Crudo',
  'Salteado',
  'Guisado',
  'Asado',
  'Frito',
  'Licuado',
  'Horneado',
  'A la parrilla',
];

/**
 * Tiempos de comida
 */
export const TIEMPOS_COMIDA = {
  desayuno: 'Desayuno',
  refrigerioAM: 'Refrigerio AM',
  almuerzo: 'Almuerzo',
  refrigerioPM: 'Refrigerio PM',
  cena: 'Cena'
};

/**
 * Recomendaciones predeterminadas para los planes
 */
export const RECOMENDACIONES_PREDETERMINADAS = [
  'No se incluyen en las verduras: papa, yuca, camote, elote. Estos se contabilizan como carbohidratos.',
  'Se recomienda no utilizar aderezos de tipo mayonesa, salsa de tomate industrial, pepinesa, etc. Si puede utilizar vinagre y hierbas aromáticas para dar sabor a sus comidas.',
  'Evite el consumo de sal y productos que la contengan (cubitos, sazonadores, consomés, sopas deshidratadas, enlatados, etc.)',
  'Es importante no omitir ningún tiempo de comida. Y realizar actividad física, como mínimo 30 minutos diarios.',
  'Puede dar sabor a las comidas con hierbas aromáticas, ajo, apio, cúrcuma, comino, pimienta, etc.',
  'Elige carbohidratos complejos y ricos en fibra como avena, legumbres, frutas enteras y vegetales sin almidón.',
  'Prefiera frutas como la manzana, pera, kiwi, fresas y guayaba. Evita jugos, uvas, plátano muy maduro y frutas deshidratadas.',
  'Caminar 20–30 minutos al día, respetando su propia tolerancia.',
  'Manténgase hidratada, consuma alrededor de 2 litros de agua por día.',
];

/**
 * Genera un ID único para ingredientes
 */
export function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}