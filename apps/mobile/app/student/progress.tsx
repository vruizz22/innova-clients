import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MasteryBar from '@components/MasteryBar';
import { MOCK_SKILL_PROGRESS, MOCK_STUDENT_NAME } from '@lib/mock-data';

export default function StudentProgressScreen(): JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-2">
          <Text className="text-2xl font-black text-[#1F2937]">Mi Progreso</Text>
          <Text className="text-sm text-slate-500 mt-1">
            Hola {MOCK_STUDENT_NAME}, así van tus habilidades matemáticas
          </Text>
        </View>

        {/* Summary */}
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-3xl bg-[#2F8DBA] p-4">
            <Text className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              Habilidades
            </Text>
            <Text className="text-white text-2xl font-black mt-1">
              {MOCK_SKILL_PROGRESS.length}
            </Text>
          </View>
          <View className="flex-1 rounded-3xl bg-white p-4 border border-slate-100">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Intentos totales
            </Text>
            <Text className="text-[#1F2937] text-2xl font-black mt-1">
              {MOCK_SKILL_PROGRESS.reduce((acc, s) => acc + s.attempts, 0)}
            </Text>
          </View>
        </View>

        {/* Skill cards */}
        <Text className="text-base font-bold text-slate-700 px-1">
          Habilidades
        </Text>
        <View className="gap-3">
          {MOCK_SKILL_PROGRESS.map((skill) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}
