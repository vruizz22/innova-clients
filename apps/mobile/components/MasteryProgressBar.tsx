// MasteryProgressBar — React Native View-based progress bar, color-coded
// Wrapper around MasteryBar with additional props for the tabs progress screen

import React from 'react';
import { Text, View } from 'react-native';

interface MasteryProgressBarProps {
  pKnown: number; // 0–1
  label?: string;
  attempts?: number;
  showLabel?: boolean;
}

function getMasteryColor(p: number): string {
  if (p >= 0.7) return '#3DAA72';
  if (p >= 0.4) return '#E8A33D';
  return '#D86060';
}

function getMasteryText(p: number): string {
  if (p >= 0.7) return 'Dominado';
  if (p >= 0.4) return 'Aprendiendo';
  return 'Necesita práctica';
}

export default function MasteryProgressBar({
  pKnown,
  label,
  attempts,
  showLabel = false,
}: MasteryProgressBarProps): JSX.Element {
  const clamped = Math.min(1, Math.max(0, pKnown));
  const pct = Math.round(clamped * 100);
  const color = getMasteryColor(clamped);
  const text = getMasteryText(clamped);

  return (
    <View>
      {label != null ? (
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{label}</Text>
          {attempts != null ? (
            <Text style={{ fontSize: 12, color: '#717A8B' }}>{attempts} intentos</Text>
          ) : null}
        </View>
      ) : null}

      {/* Track */}
      <View
        style={{
          height: 10,
          borderRadius: 99,
          backgroundColor: '#E5E9F0',
          overflow: 'hidden',
          marginBottom: 4,
        }}
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: pct }}
      >
        {/* Fill */}
        <View
          style={{
            height: '100%',
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 99,
          }}
        />
      </View>

      {showLabel ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color }}>{text}</Text>
          <Text style={{ fontSize: 12, color: '#717A8B' }}>{pct}%</Text>
        </View>
      ) : null}
    </View>
  );
}
