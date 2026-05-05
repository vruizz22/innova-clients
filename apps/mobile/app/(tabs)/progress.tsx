// Progress screen — mastery bars per skill
import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { MOCK_SKILL_PROGRESS } from '@lib/mock-data';
import MasteryProgressBar from '@components/MasteryProgressBar';

function getMasteryLabel(p: number): string {
  if (p >= 0.7) return 'Dominado';
  if (p >= 0.4) return 'En proceso';
  return 'Necesita práctica';
}

export default function ProgressScreen(): JSX.Element {
  const avgMastery =
    MOCK_SKILL_PROGRESS.reduce((sum, s) => sum + s.pKnown, 0) / MOCK_SKILL_PROGRESS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 4 }}>
          Mi Progreso
        </Text>
        <Text style={{ fontSize: 14, color: '#4F5868', marginBottom: 20 }}>
          Dominio promedio: {Math.round(avgMastery * 100)}% · {getMasteryLabel(avgMastery)}
        </Text>

        {/* Summary card */}
        <View
          style={{
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#E5E9F0',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F5868', marginBottom: 8 }}>
            Resumen general
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#2F8DBA' }}>
                {Math.round(avgMastery * 100)}%
              </Text>
              <Text style={{ fontSize: 11, color: '#4F5868', textAlign: 'center' }}>Dominio</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#E5E9F0' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#3DAA72' }}>
                {MOCK_SKILL_PROGRESS.filter((s) => s.pKnown >= 0.7).length}
              </Text>
              <Text style={{ fontSize: 11, color: '#4F5868', textAlign: 'center' }}>Habilidades dominadas</Text>
            </View>
            <View style={{ width: 1, backgroundColor: '#E5E9F0' }} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#E8A33D' }}>
                {MOCK_SKILL_PROGRESS.reduce((sum, s) => sum + s.attempts, 0)}
              </Text>
              <Text style={{ fontSize: 11, color: '#4F5868', textAlign: 'center' }}>Intentos totales</Text>
            </View>
          </View>
        </View>

        {/* Per-skill mastery bars */}
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#374050', marginBottom: 12 }}>
          Por habilidad
        </Text>
        {MOCK_SKILL_PROGRESS.map((skill) => (
          <View
            key={skill.skillId}
            style={{
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              padding: 16,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#E5E9F0',
            }}
          >
            <MasteryProgressBar
              label={skill.skillName}
              pKnown={skill.pKnown}
              attempts={skill.attempts}
              showLabel
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
