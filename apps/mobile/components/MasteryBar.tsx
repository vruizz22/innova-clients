import React from 'react';
import { Text, View } from 'react-native';
import type { MasteryLevel } from '../lib/types';

export interface MasteryBarProps {
  pKnown: number; // 0–1
  label?: string;
}

function getMasteryLevel(pKnown: number): MasteryLevel {
  if (pKnown >= 0.7) return 'Dominado';
  if (pKnown >= 0.4) return 'Aprendiendo';
  return 'Necesita práctica';
}

function getBarColor(pKnown: number): string {
  if (pKnown >= 0.7) return '#3DAA72';
  if (pKnown >= 0.4) return '#E8A33D';
  return '#D86060';
}

export default function MasteryBar({ pKnown, label }: MasteryBarProps): JSX.Element {
  const clampedP = Math.min(1, Math.max(0, pKnown));
  const pct = Math.round(clampedP * 100);
  const level = getMasteryLevel(clampedP);
  const color = getBarColor(clampedP);

  return (
    <View>
      {label !== undefined && (
        <Text className="mb-1 text-xs font-medium text-slate-500">{label}</Text>
      )}
      <View className="mb-1 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <View
          style={{ width: `${pct}%`, backgroundColor: color, height: '100%' }}
          className="rounded-full"
        />
      </View>
      <View className="flex-row items-center justify-between">
        <Text style={{ color }} className="text-xs font-semibold">
          {level}
        </Text>
        <Text className="text-xs text-slate-400">{pct}%</Text>
      </View>
    </View>
  );
}
