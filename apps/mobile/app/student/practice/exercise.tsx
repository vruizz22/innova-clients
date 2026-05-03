import React, { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import ErrorFeedback from '../../../components/ErrorFeedback';
import MathKeypad from '../../../components/MathKeypad';
import SkillBadge from '../../../components/SkillBadge';
import type { AttemptResult, ErrorType, Exercise } from '../../../lib/types';

const ERROR_CYCLE: Exclude<ErrorType, 'CORRECT'>[] = [
  'BORROW_OMITTED_TENS',
  'SUBTRAHEND_MINUEND_SWAPPED',
];

export interface PracticeExerciseScreenProps {
  exercise: Exercise;
  onNext: () => void;
  onBack: () => void;
}

export default function PracticeExerciseScreen({
  exercise,
  onNext,
  onBack,
}: PracticeExerciseScreenProps): JSX.Element {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [errorCycleIdx, setErrorCycleIdx] = useState(0);

  function handleKeyPress(key: string): void {
    if (result !== null) return;
    setAnswer((prev) => prev + key);
  }

  function handleDelete(): void {
    if (result !== null) return;
    setAnswer((prev) => prev.slice(0, -1));
  }

  function handleSubmit(): void {
    if (answer.trim() === '' || result !== null) return;

    const userAnswer = parseInt(answer.trim(), 10);
    const isCorrect = userAnswer === exercise.expectedAnswer;

    if (isCorrect) {
      setResult({ isCorrect: true, errorType: 'CORRECT' });
    } else {
      const errorType = ERROR_CYCLE[errorCycleIdx % ERROR_CYCLE.length] ?? 'BORROW_OMITTED_TENS';
      setResult({ isCorrect: false, errorType });
      setErrorCycleIdx((prev) => prev + 1);
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
                answer.trim().length > 0 ? 'bg-[#2F8DBA]' : 'bg-slate-200'
              }`}
              style={{ minHeight: 52 }}
              onPress={handleSubmit}
              disabled={answer.trim().length === 0}
            >
              <Text
                className={`font-bold text-base ${
                  answer.trim().length > 0 ? 'text-white' : 'text-slate-400'
                }`}
              >
                Verificar respuesta
              </Text>
            </Pressable>
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
