import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import PracticeHomeScreen from './index';
import StudentProgressScreen from './progress';
import PracticeExerciseScreen from './practice/exercise';
import type { Exercise } from '@lib/types';
import { MOCK_EXERCISES } from '@lib/mock-data';
import type { AuthSession } from '@lib/api-client';

type StudentTab = 'practice' | 'progress';

export interface StudentLayoutProps {
  session: AuthSession | null;
  onLogout?: () => void;
}

export default function StudentLayout({ session, onLogout }: StudentLayoutProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<StudentTab>('practice');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [exerciseIdx, setExerciseIdx] = useState(0);

  function handleSelectExercise(exercise: Exercise): void {
    setActiveExercise(exercise);
  }

  function handleNextExercise(): void {
    const nextIdx = (exerciseIdx + 1) % MOCK_EXERCISES.length;
    setExerciseIdx(nextIdx);
    setActiveExercise(MOCK_EXERCISES[nextIdx] ?? null);
  }

  function handleBackFromExercise(): void {
    setActiveExercise(null);
  }

  // If in exercise mode, render exercise screen full-screen (no tab bar)
  if (activeExercise !== null) {
    return (
      <PracticeExerciseScreen
        exercise={activeExercise}
        session={session}
        onNext={handleNextExercise}
        onBack={handleBackFromExercise}
      />
    );
  }

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Screen content */}
      <View className="flex-1">
        {activeTab === 'practice' ? (
          <PracticeHomeScreen onSelectExercise={handleSelectExercise} />
        ) : (
          <StudentProgressScreen />
        )}
      </View>

      {/* Bottom tab bar */}
      <View
        className="flex-row bg-white border-t border-slate-100"
        style={{ paddingBottom: 20, paddingTop: 8 }}
      >
        <Pressable
          className="flex-1 items-center py-2"
          style={{ minHeight: 44 }}
          onPress={() => setActiveTab('practice')}
        >
          <Text className="text-2xl mb-0.5">{activeTab === 'practice' ? '📚' : '📖'}</Text>
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'practice' ? 'text-[#2F8DBA]' : 'text-slate-400'
            }`}
          >
            Práctica
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 items-center py-2"
          style={{ minHeight: 44 }}
          onPress={() => setActiveTab('progress')}
        >
          <Text className="text-2xl mb-0.5">{activeTab === 'progress' ? '📊' : '📈'}</Text>
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'progress' ? 'text-[#2F8DBA]' : 'text-slate-400'
            }`}
          >
            Mi Progreso
          </Text>
        </Pressable>
        {onLogout !== undefined && (
          <Pressable
            className="flex-1 items-center py-2"
            style={{ minHeight: 44 }}
            onPress={onLogout}
          >
            <Text className="text-2xl mb-0.5">🚪</Text>
            <Text className="text-xs font-semibold text-slate-400">Salir</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
