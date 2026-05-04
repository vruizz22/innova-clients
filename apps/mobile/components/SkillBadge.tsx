import React from 'react';
import { Text, View } from 'react-native';
import type { Difficulty } from '../lib/types';

export interface SkillBadgeProps {
  skill: string;
  difficulty?: Difficulty;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Fácil: '#3DAA72',
  Medio: '#E8A33D',
  Difícil: '#D86060',
};

export default function SkillBadge({ skill, difficulty }: SkillBadgeProps): JSX.Element {
  return (
    <View className="flex-row items-center gap-2 flex-wrap">
      <View className="rounded-full bg-[#EBF5FC] px-3 py-1">
        <Text className="text-xs font-semibold text-[#2F8DBA]">{skill}</Text>
      </View>
      {difficulty !== undefined && (
        <View
          className="rounded-full px-3 py-1"
          style={{ backgroundColor: `${DIFFICULTY_COLORS[difficulty]}20` }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: DIFFICULTY_COLORS[difficulty] }}
          >
            {difficulty}
          </Text>
        </View>
      )}
    </View>
  );
}
