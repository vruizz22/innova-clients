// Profile screen — parent info + logout
import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MOCK_CHILD_NAME, MOCK_STUDENT_NAME } from '@lib/mock-data';

export default function ProfileScreen(): JSX.Element {
  function handleLogout(): void {
    // Clear session and navigate to auth
    router.replace('/auth/login' as never);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 20 }}>
          Perfil
        </Text>

        {/* Student info card */}
        <View
          style={{
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#E5E9F0',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: '#DCEDF6',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 32 }}>👤</Text>
          </View>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>
            {MOCK_STUDENT_NAME}
          </Text>
          <Text style={{ fontSize: 13, color: '#4F5868', marginTop: 2 }}>
            Alumno
          </Text>
        </View>

        {/* Parent info */}
        <View
          style={{
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#E5E9F0',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F5868', marginBottom: 12 }}>
            Información del apoderado
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 20 }}>👨‍👩‍👧</Text>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
                Apoderado de {MOCK_CHILD_NAME}
              </Text>
              <Text style={{ fontSize: 12, color: '#4F5868' }}>apoderado@ejemplo.cl</Text>
            </View>
          </View>
        </View>

        {/* App info */}
        <View
          style={{
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#E5E9F0',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#4F5868', marginBottom: 8 }}>
            Acerca de SuperProfes
          </Text>
          <Text style={{ fontSize: 12, color: '#717A8B', lineHeight: 18 }}>
            SuperProfes detecta qué procedimiento matemático está fallando tu hijo/a antes de la
            evaluación. Versión 1.0.0.
          </Text>
          <Text style={{ fontSize: 11, color: '#A5ADBC', marginTop: 8 }}>
            Sin recopilación de datos personales · COPPA compliant
          </Text>
        </View>

        {/* Logout */}
        <Pressable
          onPress={handleLogout}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#f5b8b8',
            backgroundColor: '#fff8f8',
            padding: 14,
            alignItems: 'center',
            minHeight: 44,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#7a1a1a' }}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
