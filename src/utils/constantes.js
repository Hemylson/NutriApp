// src/utils/constantes.js

/**
 * Unidades de medida predefinidas para ingredientes
 */
export const UNIDADES_PREDEFINIDAS = [
  { valor: 'g', etiqueta: 'Gramos (g)' },
  { valor: 'kg', etiqueta: 'Kilogramos (kg)' },
  { valor: 'ml', etiqueta: 'Mililitros (ml)' },
  { valor: 'l', etiqueta: 'Litros (l)' },
  { valor: 'oz', etiqueta: 'Onzas (oz)' },
  { valor: 'lb', etiqueta: 'Libras (lb)' },
  { valor: 'taza', etiqueta: 'Taza' },
  { valor: 'cucharada', etiqueta: 'Cucharada' },
  { valor: 'cucharadita', etiqueta: 'Cucharadita' },
  { valor: 'pizca', etiqueta: 'Pizca' },
  { valor: 'unidad', etiqueta: 'Unidad' }
];

/**
 * Métodos de cocción disponibles
 */
export const METODOS_COCCION = [
  'Al vapor',
  'Hervido',
  'A la plancha',
  'Al horno',
  'Frito',
  'Salteado',
  'Asado',
  'Guisado',
  'A la parrilla',
  'Horneado'
];

/**
 * Tiempos de comida para planes nutricionales
 */
export const TIEMPOS_COMIDA = [
  'Desayuno',
  'Refrigerio AM',
  'Almuerzo',
  'Refrigerio PM',
  'Cena'
];

/**
 * Tipos de intercambios nutricionales con sus colores
 */
export const INTERCAMBIOS_NUTRICIONALES = [
  { 
    id: 'lecheDescremada',
    nombre: 'Leche descremada',
    iniciales: 'LD',
    color: '#E3F2FD', // Azul claro pastel
    borderColor: '#90CAF9'
  },
  { 
    id: 'lecheSemidescremada',
    nombre: 'Leche semidescremada',
    iniciales: 'LS',
    color: '#BBDEFB', // Azul medio pastel
    borderColor: '#64B5F6'
  },
  { 
    id: 'lecheEntera',
    nombre: 'Leche entera',
    iniciales: 'LE',
    color: '#90CAF9', // Azul pastel
    borderColor: '#42A5F5'
  },
  { 
    id: 'vegetales',
    nombre: 'Vegetales',
    iniciales: 'V',
    color: '#E8F5E9', // Verde claro pastel
    borderColor: '#81C784'
  },
  { 
    id: 'frutas',
    nombre: 'Frutas',
    iniciales: 'F',
    color: '#FFF9C4', // Amarillo pastel
    borderColor: '#FFD54F'
  },
  { 
    id: 'panesCereales',
    nombre: 'Panes y cereales',
    iniciales: 'PC',
    color: '#FFE0B2', // Naranja/dorado pastel
    borderColor: '#FFB74D'
  },
  { 
    id: 'proteinasMagras',
    nombre: 'Proteínas magras',
    iniciales: 'PM',
    color: '#FCE4EC', // Rosa claro pastel
    borderColor: '#F48FB1'
  },
  { 
    id: 'proteinasSemimagras',
    nombre: 'Proteínas semimagras',
    iniciales: 'PS',
    color: '#F8BBD0', // Rosa pastel
    borderColor: '#EC407A'
  },
  { 
    id: 'grasas',
    nombre: 'Grasas',
    iniciales: 'G',
    color: '#FFF8E1', // Amarillo/mostaza pastel
    borderColor: '#FFC107'
  }
];

/**
 * Recomendaciones nutricionales predeterminadas
 */
export const RECOMENDACIONES_PREDETERMINADAS = {
  calorias: 2000,
  proteinas: 50,
  carbohidratos: 275,
  grasas: 65
};

/**
 * Genera un ID único
 */
export function generarId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}