import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { UserRole } from '../../lib/types';
import { register, type AuthSession } from '../../lib/api-client';

export interface RegisterScreenProps {
  onRegister: (session: AuthSession) => void;
  onBack: () => void;
}

export default function RegisterScreen({ onRegister, onBack }: RegisterScreenProps): JSX.Element {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCreate(): Promise<void> {
    if (selectedRole === null) return;

    setLoading(true);
    setMessage('');
    try {
      const session = await register(email, password, selectedRole);
      onRegister(session);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-10 pb-8">
            {/* Back button */}
            <Pressable
              onPress={onBack}
              style={{ minHeight: 44, minWidth: 44, justifyContent: 'center' }}
              className="mb-6 self-start"
            >
              <Text className="text-[#2F8DBA] font-semibold text-base">← Volver</Text>
            </Pressable>

            <Text className="text-2xl font-black text-[#1F2937] mb-2">Crear cuenta</Text>
            <Text className="text-sm text-slate-500 mb-8">
              Elige tu tipo de cuenta para comenzar
            </Text>

            {/* Role cards */}
            <Text className="text-sm font-semibold text-slate-700 mb-3">Soy…</Text>
            <View className="gap-3 mb-8">
              <Pressable
                className={`rounded-3xl p-5 border-2 ${
                  selectedRole === 'student'
                    ? 'border-[#2F8DBA] bg-[#EBF5FC]'
                    : 'border-slate-200 bg-white'
                }`}
                style={{ minHeight: 72 }}
                onPress={() => setSelectedRole('student')}
              >
                <View className="flex-row items-center gap-4">
                  <Text className="text-3xl">📚</Text>
                  <View className="flex-1">
                    <Text className="font-bold text-base text-[#1F2937]">Alumno</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      3° a 6° básico · Práctica de matemáticas
                    </Text>
                  </View>
                  {selectedRole === 'student' && (
                    <Text className="text-[#2F8DBA] text-lg">✓</Text>
                  )}
                </View>
              </Pressable>

              <Pressable
                className={`rounded-3xl p-5 border-2 ${
                  selectedRole === 'parent'
                    ? 'border-[#2F8DBA] bg-[#EBF5FC]'
                    : 'border-slate-200 bg-white'
                }`}
                style={{ minHeight: 72 }}
                onPress={() => setSelectedRole('parent')}
              >
                <View className="flex-row items-center gap-4">
                  <Text className="text-3xl">👨‍👩‍👧</Text>
                  <View className="flex-1">
                    <Text className="font-bold text-base text-[#1F2937]">Apoderado</Text>
                    <Text className="text-xs text-slate-500 mt-0.5">
                      Sigue el progreso de tu hijo/a
                    </Text>
                  </View>
                  {selectedRole === 'parent' && (
                    <Text className="text-[#2F8DBA] text-lg">✓</Text>
                  )}
                </View>
              </Pressable>
            </View>

            {/* Form */}
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-1.5">
                  Correo electrónico
                </Text>
                <TextInput
                  className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-slate-900 text-base"
                  style={{ minHeight: 48 }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="tucorreo@ejemplo.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </Text>
                <TextInput
                  className="rounded-2xl bg-white border border-slate-200 px-4 py-3 text-slate-900 text-base"
                  style={{ minHeight: 48 }}
                  secureTextEntry
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Create button */}
            <Pressable
              className={`mt-6 rounded-2xl items-center py-4 ${
                selectedRole !== null && !loading ? 'bg-[#2F8DBA]' : 'bg-slate-300'
              }`}
              style={{ minHeight: 52 }}
              onPress={handleCreate}
              disabled={selectedRole === null || loading}
            >
              <Text className="text-white font-bold text-base">{loading ? 'Creando...' : 'Crear cuenta'}</Text>
            </Pressable>
            {message.length > 0 && (
              <Text className="mt-3 text-sm text-red-700 text-center">{message}</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
