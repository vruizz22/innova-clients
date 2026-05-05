import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import ErrorFeedback from '@components/ErrorFeedback';
import MathKeypad from '@components/MathKeypad';
import SkillBadge from '@components/SkillBadge';
import type { AttemptResult, ErrorType, Exercise } from '@lib/types';
import { createAttempt, type AuthSession } from '@lib/api-client';

const ERROR_CYCLE: Exclude<ErrorType, 'CORRECT'>[] = [
  'BORROW_OMITTED_TENS',
  'SUBTRAHEND_MINUEND_SWAPPED',
];

export interface PracticeExerciseScreenProps {
  exercise: Exercise;
  session: AuthSession | null;
  onNext: () => void;
  onBack: () => void;
}

export default function PracticeExerciseScreen({
  exercise,
  session,
  onNext,
  onBack,
}: PracticeExerciseScreenProps): JSX.Element {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [errorCycleIdx, setErrorCycleIdx] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleKeyPress(key: string): void {
    if (result !== null) return;
    setAnswer((prev) => prev + key);
  }

  function handleDelete(): void {
    if (result !== null) return;
    setAnswer((prev) => prev.slice(0, -1));
  }

  async function handleSubmit(): Promise<void> {
    if (answer.trim() === '' || result !== null) return;

    const userAnswer = parseInt(answer.trim(), 10);
    const [minuend, subtrahend] = exercise.problem
      .replace('−', '-')
      .split('-')
      .map((part) => Number(part.trim()));

    if (!session?.accessToken) {
      setMessage('Debes iniciar sesión para enviar el intento.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const backendResult = await createAttempt({
        accessToken: session.accessToken,
        studentId: session.user.profileId ?? session.user.id,
        skillKey: 'subtraction_borrow',
        rawSteps: [{ expression: `${exercise.problem} = ${userAnswer}`, isFinal: true }],
        expectedAnswer: exercise.expectedAnswer,
        studentAnswer: userAnswer,
        minuend,
        subtrahend,
      });

      const errorType = backendResult.isCorrect
        ? 'CORRECT'
        : backendResult.errorType === 'BORROW_OMITTED'
          ? 'BORROW_OMITTED_TENS'
          : ERROR_CYCLE[errorCycleIdx % ERROR_CYCLE.length] ?? 'BORROW_OMITTED_TENS';

      setResult({ isCorrect: backendResult.isCorrect, errorType: errorType as ErrorType });
      if (!backendResult.isCorrect) setErrorCycleIdx((prev) => prev + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo enviar el intento');
    } finally {
      setLoading(false);
    }
  }

  function handleNext(): void {
    if (result?.isCorrect === true) {
      onNext();
    } else {
      // reset for retry
      setAnswer('');
      setResult(null);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          onPress={onBack}
          style={{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}
        >
          <Text className="text-[#2F8DBA] font-semibold">← Volver</Text>
        </Pressable>

        {/* Problem card */}
        <View className="rounded-3xl bg-white p-6 border border-slate-100"
          style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
        >
          <SkillBadge skill={exercise.skill} difficulty={exercise.difficulty} />
          <Text className="mt-4 text-4xl font-black text-[#1F2937] text-center">
            {exercise.problem} = ?
          </Text>
        </View>

        {/* Answer input area */}
        {result === null && (
          <View className="rounded-3xl bg-white p-5 border border-slate-100"
            style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
          >
            <Text className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Tu respuesta
            </Text>
            <TextInput
              className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-3xl font-black text-[#1F2937] text-center"
              style={{ minHeight: 60 }}
              keyboardType="numeric"
              value={answer}
              onChangeText={setAnswer}
              placeholder="?"
              placeholderTextColor="#CBD5E1"
              editable={result === null}
            />

            {/* Numpad */}
            <MathKeypad
              onPress={handleKeyPress}
              onDelete={handleDelete}
              onDone={handleSubmit}
            />

            {/* Submit button */}
            <Pressable
              className={`mt-4 rounded-2xl items-center py-4 ${
                answer.trim().length > 0 && !loading ? 'bg-[#2F8DBA]' : 'bg-slate-200'
              }`}
              style={{ minHeight: 52 }}
              onPress={handleSubmit}
              disabled={answer.trim().length === 0 || loading}
            >
              <Text
                className={`font-bold text-base ${
                  answer.trim().length > 0 && !loading ? 'text-white' : 'text-slate-400'
                }`}
              >
                {loading ? 'Enviando...' : 'Verificar respuesta'}
              </Text>
            </Pressable>
            {message.length > 0 && (
              <Text className="mt-3 text-sm text-red-700 text-center">{message}</Text>
            )}
          </View>
        )}

        {/* Feedback */}
        {result !== null && (
          <ErrorFeedback
            isCorrect={result.isCorrect}
            errorType={result.errorType}
            onNext={handleNext}
            buttonLabel={result.isCorrect ? 'Siguiente ejercicio' : 'Intentar de nuevo'}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
