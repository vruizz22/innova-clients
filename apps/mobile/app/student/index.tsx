import React from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import SkillBadge from '@components/SkillBadge';
import { MOCK_EXERCISES, MOCK_STUDENT_NAME } from '@lib/mock-data';
import type { Exercise } from '../../lib/types';

export interface PracticeHomeScreenProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export default function PracticeHomeScreen({
  onSelectExercise,
}: PracticeHomeScreenProps): JSX.Element {
  const pending = MOCK_EXERCISES.length;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="rounded-3xl bg-[#2F8DBA] px-5 py-6">
          <Text className="text-white text-2xl font-black">
            ¡Hola, {MOCK_STUDENT_NAME}! 👋
          </Text>
          {pending > 0 ? (
            <Text className="text-white/80 mt-1 text-sm">
              Tienes {pending} {pending === 1 ? 'ejercicio pendiente' : 'ejercicios pendientes'}
            </Text>
          ) : (
            <Text className="text-white/80 mt-1 text-sm">
              ¡No tienes ejercicios pendientes!
            </Text>
          )}
        </View>

        {/* Exercises section */}
        {pending === 0 ? (
          <View className="rounded-3xl bg-white p-6 items-center border border-slate-100">
            <Text className="text-4xl mb-3">🌟</Text>
            <Text className="text-base font-bold text-[#1F2937] text-center">
              ¡Excelente! No tienes ejercicios pendientes.
            </Text>
            <Text className="text-sm text-slate-500 mt-1 text-center">
              Vuelve mañana para practicar más.
            </Text>
          </View>
        ) : (
          <View>
            <Text className="text-base font-bold text-slate-700 mb-3 px-1">
              Ejercicios de hoy
            </Text>
            <View className="gap-3">
              {MOCK_EXERCISES.map((exercise) => (
                <View
                  key={exercise.id}
                  className="rounded-3xl bg-white p-5 border border-slate-100"
                  style={{
                    shadowColor: '#000',
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text className="text-2xl font-black text-[#1F2937] mb-3">
                    {exercise.problem} = ?
                  </Text>
                  <SkillBadge
                    skill={exercise.skill}
                    difficulty={exercise.difficulty}
                  />
                  <Pressable
                    className="mt-4 rounded-2xl bg-[#2F8DBA] py-3 px-4 items-center"
                    style={{ minHeight: 44 }}
                    onPress={() => onSelectExercise(exercise)}
                  >
                    <Text className="text-white font-semibold text-sm">
                      Resolver →
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
