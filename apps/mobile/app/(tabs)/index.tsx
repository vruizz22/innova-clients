// Home screen — shows welcome message + pending assignments summary
import React from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MOCK_EXERCISES, MOCK_STUDENT_NAME, MOCK_ASSIGNMENTS } from '@lib/mock-data';

export default function HomeScreen(): JSX.Element {
  const pendingCount = MOCK_ASSIGNMENTS.filter((a) => a.status === 'pending').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome card */}
        <View
          style={{
            borderRadius: 24,
            backgroundColor: '#2F8DBA',
            paddingHorizontal: 20,
            paddingVertical: 24,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900' }}>
            ¡Bienvenido, {MOCK_STUDENT_NAME}! 👋
          </Text>
          {pendingCount > 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4, fontSize: 14 }}>
              Tienes {pendingCount} {pendingCount === 1 ? 'asignación pendiente' : 'asignaciones pendientes'}
            </Text>
          ) : (
            <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4, fontSize: 14 }}>
              ¡Al día! No tienes asignaciones pendientes.
            </Text>
          )}
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E9F0',
              minHeight: 44,
            }}
            onPress={() => router.push('/(tabs)/assignments')}
          >
            <Text style={{ fontSize: 28, marginBottom: 4 }}>📚</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F2937', textAlign: 'center' }}>
              Asignaciones
            </Text>
            {pendingCount > 0 ? (
              <View
                style={{
                  marginTop: 4,
                  backgroundColor: '#fce8e8',
                  borderRadius: 99,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#7a1a1a' }}>
                  {pendingCount} pendientes
                </Text>
              </View>
            ) : null}
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              padding: 16,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E9F0',
              minHeight: 44,
            }}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <Text style={{ fontSize: 28, marginBottom: 4 }}>📊</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F2937', textAlign: 'center' }}>
              Mi Progreso
            </Text>
          </Pressable>
        </View>

        {/* Today's exercises */}
        {MOCK_EXERCISES.length > 0 ? (
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#374050', marginBottom: 12, paddingHorizontal: 4 }}>
              Ejercicios de hoy
            </Text>
            {MOCK_EXERCISES.slice(0, 3).map((exercise) => (
              <View
                key={exercise.id}
                style={{
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF',
                  padding: 16,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: '#E5E9F0',
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 4 }}>
                  {exercise.problem} = ?
                </Text>
                <Text style={{ fontSize: 12, color: '#4F5868' }}>{exercise.skill}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
