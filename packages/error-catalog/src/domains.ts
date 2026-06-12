import type { Domain, Grade } from './types';

const G_BASICA: Grade[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
const ALL: Grade[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'];

/**
 * 18 mathematical domains (v8 §3.2). Subdomains are representative, not exhaustive —
 * the authoritative set is synced from the backend Subdomain table via codegen.
 */
export const DOMAINS: readonly Domain[] = [
  {
    code: 'ARITHMETIC', name_es: 'Aritmética con naturales', name_en: 'Arithmetic (natural numbers)',
    display_order: 1, grades: G_BASICA,
    subdomains: [
      { code: 'ADDITION_NATURAL', domain_code: 'ARITHMETIC', name_es: 'Suma con llevadas', name_en: 'Addition with carry' },
      { code: 'SUBTRACTION_NATURAL', domain_code: 'ARITHMETIC', name_es: 'Resta con reserva', name_en: 'Subtraction with borrow' },
      { code: 'MULTIPLICATION_NATURAL', domain_code: 'ARITHMETIC', name_es: 'Multiplicación', name_en: 'Multiplication' },
      { code: 'DIVISION_NATURAL', domain_code: 'ARITHMETIC', name_es: 'División larga', name_en: 'Long division' },
      { code: 'PLACE_VALUE', domain_code: 'ARITHMETIC', name_es: 'Valor posicional', name_en: 'Place value' },
    ],
  },
  {
    code: 'INTEGERS', name_es: 'Enteros (signo)', name_en: 'Integers (sign)',
    display_order: 2, grades: ['G7', 'G8'],
    subdomains: [
      { code: 'INT_ADD_SUB', domain_code: 'INTEGERS', name_es: 'Suma y resta de enteros', name_en: 'Integer add/sub' },
      { code: 'INT_MUL_DIV', domain_code: 'INTEGERS', name_es: 'Multiplicación y división de enteros', name_en: 'Integer mul/div' },
      { code: 'INT_SIGN_RULES', domain_code: 'INTEGERS', name_es: 'Reglas de los signos', name_en: 'Sign rules' },
    ],
  },
  {
    code: 'FRACTIONS', name_es: 'Fracciones', name_en: 'Fractions',
    display_order: 3, grades: ['G4', 'G5', 'G6', 'G7', 'G8'],
    subdomains: [
      { code: 'FRAC_ADDSUB_SAME', domain_code: 'FRACTIONS', name_es: 'Suma/resta mismo denominador', name_en: 'Add/sub same denom.' },
      { code: 'FRAC_ADDSUB_DIFF', domain_code: 'FRACTIONS', name_es: 'Suma/resta distinto denominador', name_en: 'Add/sub diff denom.' },
      { code: 'FRAC_MUL_DIV', domain_code: 'FRACTIONS', name_es: 'Multiplicación y división', name_en: 'Mul/div' },
      { code: 'FRAC_SIMPLIFY', domain_code: 'FRACTIONS', name_es: 'Simplificación', name_en: 'Simplification' },
    ],
  },
  {
    code: 'DECIMALS', name_es: 'Decimales', name_en: 'Decimals',
    display_order: 4, grades: ['G5', 'G6', 'G7', 'G8'],
    subdomains: [
      { code: 'DEC_ADDSUB', domain_code: 'DECIMALS', name_es: 'Suma y resta', name_en: 'Add/sub' },
      { code: 'DEC_MUL_DIV', domain_code: 'DECIMALS', name_es: 'Multiplicación y división', name_en: 'Mul/div' },
      { code: 'DEC_PLACE', domain_code: 'DECIMALS', name_es: 'Valor posicional decimal', name_en: 'Decimal place value' },
    ],
  },
  {
    code: 'PROPORTIONS', name_es: 'Porcentajes, razones y proporciones', name_en: 'Percentages, ratios, proportions',
    display_order: 5, grades: ['G6', 'G7', 'G8', 'G9', 'G10'],
    subdomains: [
      { code: 'PERCENT', domain_code: 'PROPORTIONS', name_es: 'Porcentajes', name_en: 'Percentages' },
      { code: 'RATIO', domain_code: 'PROPORTIONS', name_es: 'Razones', name_en: 'Ratios' },
      { code: 'PROPORTION', domain_code: 'PROPORTIONS', name_es: 'Proporción directa e inversa', name_en: 'Direct/inverse proportion' },
    ],
  },
  {
    code: 'ALGEBRA_LINEAR', name_es: 'Álgebra lineal', name_en: 'Linear algebra',
    display_order: 6, grades: ['G7', 'G8', 'G9', 'G10'],
    subdomains: [
      { code: 'EQ_LINEAR', domain_code: 'ALGEBRA_LINEAR', name_es: 'Ecuaciones de primer grado', name_en: 'Linear equations' },
      { code: 'INEQ_LINEAR', domain_code: 'ALGEBRA_LINEAR', name_es: 'Inecuaciones', name_en: 'Inequalities' },
      { code: 'EXPR_SIMPLIFY', domain_code: 'ALGEBRA_LINEAR', name_es: 'Reducción de expresiones', name_en: 'Expression reduction' },
    ],
  },
  {
    code: 'ALGEBRA_QUADRATIC', name_es: 'Álgebra cuadrática y polinomios', name_en: 'Quadratic algebra & polynomials',
    display_order: 7, grades: ['G10', 'G11', 'G12'],
    subdomains: [
      { code: 'QUAD_FACTOR', domain_code: 'ALGEBRA_QUADRATIC', name_es: 'Factorización', name_en: 'Factoring' },
      { code: 'QUAD_FORMULA', domain_code: 'ALGEBRA_QUADRATIC', name_es: 'Fórmula general', name_en: 'Quadratic formula' },
      { code: 'POLY_OPS', domain_code: 'ALGEBRA_QUADRATIC', name_es: 'Operaciones con polinomios', name_en: 'Polynomial ops' },
    ],
  },
  {
    code: 'EXPONENTS_RADICALS', name_es: 'Potencias, raíces y exponentes', name_en: 'Powers, roots, exponents',
    display_order: 8, grades: ['G8', 'G9', 'G10', 'G11', 'G12'],
    subdomains: [
      { code: 'EXP_LAWS', domain_code: 'EXPONENTS_RADICALS', name_es: 'Leyes de exponentes', name_en: 'Exponent laws' },
      { code: 'RADICALS', domain_code: 'EXPONENTS_RADICALS', name_es: 'Raíces y radicales', name_en: 'Radicals' },
    ],
  },
  {
    code: 'FUNCTIONS', name_es: 'Funciones', name_en: 'Functions',
    display_order: 9, grades: ['G9', 'G10', 'G11', 'G12'],
    subdomains: [
      { code: 'FUNC_LINEAR', domain_code: 'FUNCTIONS', name_es: 'Función lineal y afín', name_en: 'Linear/affine function' },
      { code: 'FUNC_QUADRATIC', domain_code: 'FUNCTIONS', name_es: 'Función cuadrática', name_en: 'Quadratic function' },
      { code: 'FUNC_EXPONENTIAL', domain_code: 'FUNCTIONS', name_es: 'Función exponencial', name_en: 'Exponential function' },
    ],
  },
  {
    code: 'GEOMETRY_PLANE', name_es: 'Geometría plana', name_en: 'Plane geometry',
    display_order: 10, grades: ['G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'],
    subdomains: [
      { code: 'GEO_PERIMETER', domain_code: 'GEOMETRY_PLANE', name_es: 'Perímetro', name_en: 'Perimeter' },
      { code: 'GEO_AREA', domain_code: 'GEOMETRY_PLANE', name_es: 'Área', name_en: 'Area' },
      { code: 'GEO_ANGLES', domain_code: 'GEOMETRY_PLANE', name_es: 'Ángulos', name_en: 'Angles' },
      { code: 'GEO_PYTHAGORAS', domain_code: 'GEOMETRY_PLANE', name_es: 'Teorema de Pitágoras', name_en: 'Pythagoras' },
    ],
  },
  {
    code: 'GEOMETRY_3D', name_es: 'Geometría 3D y volumen', name_en: '3D geometry & volume',
    display_order: 11, grades: ['G6', 'G7', 'G8', 'G9', 'G10', 'G11'],
    subdomains: [
      { code: 'VOL_PRISM', domain_code: 'GEOMETRY_3D', name_es: 'Volumen de prismas', name_en: 'Prism volume' },
      { code: 'VOL_CYLINDER', domain_code: 'GEOMETRY_3D', name_es: 'Volumen de cilindros', name_en: 'Cylinder volume' },
      { code: 'SURFACE_AREA', domain_code: 'GEOMETRY_3D', name_es: 'Área de superficie', name_en: 'Surface area' },
    ],
  },
  {
    code: 'TRIGONOMETRY', name_es: 'Trigonometría', name_en: 'Trigonometry',
    display_order: 12, grades: ['G11', 'G12'],
    subdomains: [
      { code: 'TRIG_RATIOS', domain_code: 'TRIGONOMETRY', name_es: 'Razones trigonométricas', name_en: 'Trig ratios' },
      { code: 'TRIG_IDENTITY', domain_code: 'TRIGONOMETRY', name_es: 'Identidades', name_en: 'Identities' },
    ],
  },
  {
    code: 'STATISTICS', name_es: 'Estadística y probabilidades', name_en: 'Statistics & probability',
    display_order: 13, grades: ALL,
    subdomains: [
      { code: 'STAT_CENTER', domain_code: 'STATISTICS', name_es: 'Medidas de tendencia central', name_en: 'Central tendency' },
      { code: 'PROBABILITY', domain_code: 'STATISTICS', name_es: 'Probabilidad', name_en: 'Probability' },
    ],
  },
  {
    code: 'DATA_HANDLING', name_es: 'Tratamiento de datos', name_en: 'Data handling',
    display_order: 14, grades: ['G3', 'G4', 'G5', 'G6', 'G7', 'G8'],
    subdomains: [
      { code: 'CHARTS', domain_code: 'DATA_HANDLING', name_es: 'Gráficos', name_en: 'Charts' },
      { code: 'TABLES', domain_code: 'DATA_HANDLING', name_es: 'Tablas', name_en: 'Tables' },
    ],
  },
  {
    code: 'LOGARITHMS', name_es: 'Logaritmos', name_en: 'Logarithms',
    display_order: 15, grades: ['G11', 'G12'],
    subdomains: [
      { code: 'LOG_PROPERTIES', domain_code: 'LOGARITHMS', name_es: 'Propiedades', name_en: 'Properties' },
      { code: 'LOG_EQUATIONS', domain_code: 'LOGARITHMS', name_es: 'Ecuaciones logarítmicas', name_en: 'Log equations' },
    ],
  },
  {
    code: 'SEQUENCES', name_es: 'Sucesiones y series', name_en: 'Sequences & series',
    display_order: 16, grades: ['G6', 'G7', 'G8', 'G9', 'G10'],
    subdomains: [
      { code: 'SEQ_ARITHMETIC', domain_code: 'SEQUENCES', name_es: 'Progresión aritmética', name_en: 'Arithmetic progression' },
      { code: 'SEQ_GEOMETRIC', domain_code: 'SEQUENCES', name_es: 'Progresión geométrica', name_en: 'Geometric progression' },
    ],
  },
  {
    code: 'COORD_GEOMETRY', name_es: 'Geometría analítica y vectores', name_en: 'Coordinate geometry & vectors',
    display_order: 17, grades: ['G8', 'G9', 'G10', 'G11', 'G12'],
    subdomains: [
      { code: 'COORD_DISTANCE', domain_code: 'COORD_GEOMETRY', name_es: 'Distancia y punto medio', name_en: 'Distance & midpoint' },
      { code: 'COORD_LINE', domain_code: 'COORD_GEOMETRY', name_es: 'Ecuación de la recta', name_en: 'Line equation' },
      { code: 'VECTORS', domain_code: 'COORD_GEOMETRY', name_es: 'Vectores', name_en: 'Vectors' },
    ],
  },
  {
    code: 'TRANSVERSAL', name_es: 'Errores transversales', name_en: 'Cross-domain errors',
    display_order: 18, grades: ALL,
    subdomains: [
      { code: 'MISALIGNMENT', domain_code: 'TRANSVERSAL', name_es: 'Desalineación de columnas', name_en: 'Column misalignment' },
      { code: 'TRANSCRIPTION', domain_code: 'TRANSVERSAL', name_es: 'Transcripción / copia', name_en: 'Transcription' },
      { code: 'ARITH_FACT', domain_code: 'TRANSVERSAL', name_es: 'Hechos aritméticos básicos', name_en: 'Basic facts' },
    ],
  },
] as const;
