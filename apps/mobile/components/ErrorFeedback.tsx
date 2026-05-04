import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ErrorType } from '../lib/types';

export interface ErrorFeedbackProps {
  isCorrect: boolean;
  errorType: ErrorType | null;
  onNext: () => void;
  buttonLabel?: string;
}

const ERROR_MESSAGES: Record<Exclude<ErrorType, 'CORRECT'>, { title: string; hint: string }> = {
  BORROW_OMITTED_TENS: {
    title: 'Olvidaste pedir prestado en las decenas',
    hint: 'Cuando el dígito de arriba es menor que el de abajo, debes pedir prestado a la posición siguiente.',
  },
  BORROW_OMITTED_HUNDREDS: {
    title: 'Olvidaste pedir prestado en las centenas',
    hint: 'Recuerda reducir en 1 la centena cuando pides prestado.',
  },
  SUBTRAHEND_MINUEND_SWAPPED: {
    title: 'Restaste al revés',
    hint: 'Siempre resta el número de abajo al número de arriba, columna por columna.',
  },
  DIGIT_TRANSPOSITION: {
    title: 'Tienes los dígitos invertidos',
    hint: 'Revisa el orden de las decenas y las unidades en tu respuesta.',
  },
  CARRY_OMITTED: {
    title: 'Olvidaste sumar el número que llevabas',
    hint: 'Cuando la suma de una columna es mayor a 9, recuerda llevar 1 a la siguiente posición.',
  },
};

export default function ErrorFeedback({
  isCorrect,
  errorType,
  onNext,
  buttonLabel,
}: ErrorFeedbackProps): JSX.Element {
  if (isCorrect) {
    return (
      <View className="mt-4 rounded-3xl bg-[#3DAA72]/10 p-5 border border-[#3DAA72]/30">
        <Text className="text-3xl text-center mb-2">✅</Text>
        <Text className="text-lg font-bold text-center text-[#3DAA72]">
          ¡Correcto! ¡Muy bien!
        </Text>
        <Text className="mt-1 text-sm text-center text-slate-600">
          Sigue así, ¡lo estás logrando!
        </Text>
        <Pressable
          className="mt-4 rounded-2xl bg-[#3DAA72] py-3 px-6"
          onPress={onNext}
        >
          <Text className="text-center font-semibold text-white">
            {buttonLabel ?? 'Siguiente ejercicio'}
          </Text>
        </Pressable>
      </View>
    );
  }

  const errorInfo =
    errorType !== null && errorType !== 'CORRECT'
      ? (ERROR_MESSAGES[errorType] ?? {
          title: 'Respuesta incorrecta. ¡Intenta de nuevo!',
          hint: 'Revisa cada paso con cuidado.',
        })
      : {
          title: 'Respuesta incorrecta. ¡Intenta de nuevo!',
          hint: 'Revisa cada paso con cuidado.',
        };

  return (
    <View className="mt-4 rounded-3xl bg-[#D86060]/10 p-5 border border-[#D86060]/30">
      <Text className="text-3xl text-center mb-2">❌</Text>
      <Text className="text-base font-bold text-center text-[#D86060]">
        {errorInfo.title}
      </Text>
      <Text className="mt-2 text-sm text-center text-slate-600">
        {errorInfo.hint}
      </Text>
      <Pressable
        className="mt-4 rounded-2xl bg-[#2F8DBA] py-3 px-6"
        onPress={onNext}
      >
        <Text className="text-center font-semibold text-white">
          {buttonLabel ?? 'Intentar de nuevo'}
        </Text>
      </Pressable>
    </View>
  );
}
