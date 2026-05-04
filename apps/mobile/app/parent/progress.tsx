import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MasteryBar from '../../components/MasteryBar';
import { MOCK_CHILD_PROGRESS } from '../../lib/mock-data';

export default function ParentProgressScreen(): JSX.Element {
  const { childName, exercisesThisWeek, skills } = MOCK_CHILD_PROGRESS;
  const dominatedCount = skills.filter((s) => s.pKnown >= 0.7).length;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-2">
          <Text className="text-2xl font-black text-[#1F2937]">
            Progreso de {childName}
          </Text>
          <Text className="text-sm text-slate-500 mt-1">
            Resumen de su aprendizaje matemático
          </Text>
        </View>

        {/* Summary cards */}
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-[#2F8DBA] p-4">
            <Text className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              Ejercicios semana
            </Text>
            <Text className="text-white text-2xl font-black mt-1">
              {exercisesThisWeek}
            </Text>
          </View>
          <View className="flex-1 rounded-3xl bg-[#3DAA72]/10 border border-[#3DAA72]/30 p-4">
            <Text className="text-[#3DAA72] text-xs font-semibold uppercase tracking-wider">
              Dominadas
            </Text>
            <Text className="text-[#3DAA72] text-2xl font-black mt-1">
              {dominatedCount} / {skills.length}
            </Text>
          </View>
        </View>

        {/* Encouragement */}
        <View className="rounded-3xl bg-white p-5 border border-slate-100 flex-row items-center gap-4"
          style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
        >
          <Text className="text-3xl">💡</Text>
          <Text className="flex-1 text-sm text-slate-600">
            {exercisesThisWeek >= 5
              ? `¡${childName} ha tenido una excelente semana! Sigue motivando su práctica diaria.`
              : `Anima a ${childName} a practicar más esta semana. ¡Un poco cada día hace la diferencia!`}
          </Text>
        </View>

        {/* Skill progress */}
        <Text className="text-base font-bold text-slate-700 px-1">
          Progreso por habilidad
        </Text>
        <View className="gap-3">
          {skills.map((skill) => (
            <View
              key={skill.skillId}
              className="rounded-3xl bg-white p-5 border border-slate-100"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View className="flex-row items-start justify-between mb-3">
                <Text className="text-base font-bold text-[#1F2937] flex-1 mr-2">
                  {skill.skillName}
                </Text>
                <Text className="text-xs text-slate-400">
                  {skill.attempts} intentos
                </Text>
              </View>
              <MasteryBar pKnown={skill.pKnown} />
            </View>
          ))}
        </View>

        {/* Privacy note */}
        <View className="rounded-3xl bg-slate-100 p-4 flex-row items-start gap-3">
          <Text className="text-lg">🔒</Text>
          <Text className="flex-1 text-xs text-slate-500 leading-5">
            Los datos de tu hijo/a son privados. No compartimos información personal con terceros. Cumplimos con la normativa COPPA y la Ley 21.180.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
