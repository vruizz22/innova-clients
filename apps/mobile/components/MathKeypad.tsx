import React from 'react';
import { Pressable, Text, View } from 'react-native';

export interface MathKeypadProps {
  onPress: (key: string) => void;
  onDelete: () => void;
  onDone?: () => void;
}

const KEYS: (string | 'DEL' | 'DONE')[][] = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['DEL', '0', 'DONE'],
];

export default function MathKeypad({
  onPress,
  onDelete,
  onDone,
}: MathKeypadProps): JSX.Element {
  return (
    <View className="mt-4 gap-2">
      {KEYS.map((row, rowIdx) => (
        <View key={rowIdx} className="flex-row gap-2">
          {row.map((key) => {
            const isAction = key === 'DEL' || key === 'DONE';
            return (
              <Pressable
                key={key}
                style={{ minHeight: 56, minWidth: 56, flex: 1 }}
                className={`items-center justify-center rounded-2xl ${
                  isAction ? 'bg-slate-200' : 'bg-white'
                } border border-slate-200`}
                onPress={() => {
                  if (key === 'DEL') {
                    onDelete();
                  } else if (key === 'DONE') {
                    onDone?.();
                  } else {
                    onPress(key);
                  }
                }}
                accessibilityLabel={
                  key === 'DEL'
                    ? 'Borrar'
                    : key === 'DONE'
                      ? 'Listo'
                      : key
                }
              >
                <Text
                  className={`text-xl font-bold ${
                    isAction ? 'text-slate-600' : 'text-slate-900'
                  }`}
                >
                  {key === 'DEL' ? '⌫' : key === 'DONE' ? '✓' : key}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
