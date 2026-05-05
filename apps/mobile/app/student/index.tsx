import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import SkillBadge from '@components/SkillBadge';
import { MOCK_EXERCISES, MOCK_STUDENT_NAME } from '@lib/mock-data';
import { getMyStudentClassrooms, joinClassroom, type ClassroomRecord } from '@lib/api-client';
import type { Exercise } from '../../lib/types';

// Read session from AsyncStorage if available (Expo standard)
async function getAccessTokenFromStorage(): Promise<string | null> {
  try {
    // Dynamic import avoids hard dep on @react-native-async-storage/async-storage
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const raw: string | null = await AsyncStorage.getItem('innova.auth.session');
    if (!raw) return null;
    const session = JSON.parse(raw) as { accessToken?: string };
    return session.accessToken ?? null;
  } catch {
    return null;
  }
}

export interface PracticeHomeScreenProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export default function PracticeHomeScreen({
  onSelectExercise,
}: PracticeHomeScreenProps): JSX.Element {
  const pending = MOCK_EXERCISES.length;

  const [classroom, setClassroom] = useState<ClassroomRecord | null>(null);
  const [loadingClassroom, setLoadingClassroom] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadClassroom(): Promise<void> {
      const token = await getAccessTokenFromStorage();
      if (!token) { setLoadingClassroom(false); return; }
      try {
        const classrooms = await getMyStudentClassrooms(token);
        if (!cancelled) setClassroom(classrooms[0] ?? null);
      } catch {
        // Network or auth error — no classroom shown
      } finally {
        if (!cancelled) setLoadingClassroom(false);
      }
    }
    void loadClassroom();
    return () => { cancelled = true; };
  }, []);

  async function handleJoin(): Promise<void> {
    if (!joinCode.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const token = await getAccessTokenFromStorage();
      if (!token) { setJoinError('Debes iniciar sesión primero.'); return; }
      const joined = await joinClassroom(joinCode.trim(), token);
      setClassroom(joined);
      setJoinCode('');
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'No se pudo unir al classroom.');
    } finally {
      setJoining(false);
    }
  }

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

        {/* Classroom section */}
        {loadingClassroom ? (
          <ActivityIndicator size="small" color="#2F8DBA" />
        ) : classroom ? (
          <View className="rounded-2xl bg-white px-4 py-3 border border-slate-100 flex-row items-center gap-3">
            <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Classroom</Text>
            <Text className="text-sm font-bold text-[#1F2937] flex-1">{classroom.name}</Text>
          </View>
        ) : (
          <View className="rounded-2xl bg-white px-4 py-4 border border-slate-100 gap-3">
            <Text className="text-sm font-semibold text-slate-700">Unirte a un classroom</Text>
            <Text className="text-xs text-slate-400">Ingresa el código que te dio tu profesor.</Text>
            <TextInput
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Código de invitación"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 10, fontSize: 14 }}
            />
            {joinError ? (
              <Text className="text-xs text-red-500">{joinError}</Text>
            ) : null}
            <Pressable
              onPress={handleJoin}
              disabled={joining || !joinCode.trim()}
              style={{ minHeight: 44, borderRadius: 12, backgroundColor: '#2F8DBA', alignItems: 'center', justifyContent: 'center', opacity: joining || !joinCode.trim() ? 0.6 : 1 }}
            >
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                {joining ? 'Uniéndote...' : 'Unirse'}
              </Text>
            </Pressable>
          </View>
        )}

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
