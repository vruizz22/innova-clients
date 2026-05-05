// Human-readable Spanish explanations for each ErrorType value

export interface ErrorMessage {
  title: string;
  explanation: string;
  hint: string;
}

export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  BORROW_OMITTED_TENS: {
    title: 'Olvidaste pedir prestado en las decenas',
    explanation:
      'Cuando el dígito de arriba es menor que el dígito de abajo, necesitas pedir prestado 1 de la columna de la izquierda. Parece que no lo hiciste en la columna de las decenas.',
    hint: 'Antes de restar, verifica si el número de arriba es mayor. Si no, tacha el dígito de la izquierda y súmale 10 al dígito de la derecha.',
  },
  BORROW_OMITTED_HUNDREDS: {
    title: 'Olvidaste pedir prestado en las centenas',
    explanation:
      'Al restar centenas, necesitabas pedir prestado de la columna de los miles, pero no lo hiciste.',
    hint: 'Revisa columna por columna de derecha a izquierda. Cada vez que el número de arriba sea menor, debes pedir prestado.',
  },
  SUBTRAHEND_MINUEND_SWAPPED: {
    title: 'Invertiste los números al restar',
    explanation:
      'Restaste el número mayor del menor en alguna columna en lugar de pedir prestado. Esto da un resultado incorrecto.',
    hint: 'Recuerda: si el número de arriba es más pequeño, debes pedir prestado. Nunca restas el de arriba del de abajo.',
  },
  DIGIT_TRANSPOSITION: {
    title: 'Transpusiste dígitos en tu respuesta',
    explanation:
      'Escribiste los dígitos de tu respuesta en el orden equivocado (por ejemplo, 27 en vez de 72).',
    hint: 'Revisa tu respuesta final y asegúrate de que las decenas y unidades estén en el lugar correcto.',
  },
  CARRY_OMITTED: {
    title: 'Olvidaste llevar al sumar',
    explanation:
      'Cuando la suma de dos dígitos es 10 o más, debes llevar 1 a la columna siguiente. Parece que olvidaste hacerlo.',
    hint: 'Escribe el "1 que llevas" pequeño sobre la columna siguiente para no olvidarlo.',
  },
  ZERO_TIMES_X_NONZERO: {
    title: 'Cero por cualquier número es cero',
    explanation:
      'Multiplicaste 0 por un número y obtuviste un resultado distinto de cero. Recuerda: 0 × cualquier número = 0.',
    hint: 'Si ves un cero en algún factor de una multiplicación, toda esa parte da cero.',
  },
  COMMON_DENOMINATOR_MISSED: {
    title: 'Necesitas un denominador común',
    explanation:
      'Para sumar o restar fracciones, ambas deben tener el mismo denominador. Operaste los denominadores directamente.',
    hint: 'Encuentra el mínimo común múltiplo de los denominadores y convierte cada fracción antes de operar.',
  },
  CORRECT: {
    title: '¡Correcto!',
    explanation: 'Tu respuesta es correcta. ¡Buen trabajo!',
    hint: '',
  },
};

export function getErrorMessage(errorType: string): ErrorMessage {
  return (
    ERROR_MESSAGES[errorType] ?? {
      title: 'Error detectado',
      explanation: `Se detectó un error de tipo "${errorType}". Revisa tu procedimiento paso a paso.`,
      hint: 'Intenta resolver el problema de nuevo con más calma.',
    }
  );
}
