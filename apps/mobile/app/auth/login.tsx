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

export interface LoginScreenProps {
  onLogin: (role: 'student' | 'parent') => void;
  onRegister: () => void;
}

export default function LoginScreen({ onLogin, onRegister }: LoginScreenProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'parent'>('student');

  function handleLogin(): void {
    onLogin(role);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#EBF5FC]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-12 pb-8">
            {/* Logo */}
            <View className="items-center mb-10">
              <View className="h-20 w-20 rounded-3xl bg-[#2F8DBA] items-center justify-center mb-4">
                <Text className="text-4xl text-white font-black">SP</Text>
              </View>
              <Text className="text-2xl font-black text-[#1F2937] tracking-tight">
                SuperProfes
              </Text>
              <Text className="text-sm text-slate-500 mt-1">
                La plataforma matemática de Chile
              </Text>
            </View>

            {/* Role selector */}
            <View className="flex-row gap-3 mb-6">
              <Pressable
                style={{ flex: 1, minHeight: 44 }}
                className={`rounded-2xl py-3 px-4 items-center border ${
                  role === 'student'
                    ? 'bg-[#2F8DBA] border-[#2F8DBA]'
                    : 'bg-white border-slate-200'
                }`}
                onPress={() => setRole('student')}
              >
                <Text
                  className={`font-semibold text-sm ${
                    role === 'student' ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  📚 Alumno
                </Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, minHeight: 44 }}
                className={`rounded-2xl py-3 px-4 items-center border ${
                  role === 'parent'
                    ? 'bg-[#2F8DBA] border-[#2F8DBA]'
                    : 'bg-white border-slate-200'
                }`}
                onPress={() => setRole('parent')}
              >
                <Text
                  className={`font-semibold text-sm ${
                    role === 'parent' ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  👨‍👩‍👧 Apoderado
                </Text>
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
                  autoComplete="password"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {/* Forgot password */}
            <Pressable className="mt-3 self-end" style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text className="text-sm text-[#2F8DBA] font-medium">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              className="mt-5 rounded-2xl bg-[#2F8DBA] items-center py-4"
              style={{ minHeight: 52 }}
              onPress={handleLogin}
            >
              <Text className="text-white font-bold text-base">Ingresar</Text>
            </Pressable>

            {/* Register link */}
            <Pressable
              className="mt-4 items-center py-3"
              style={{ minHeight: 44 }}
              onPress={onRegister}
            >
              <Text className="text-sm text-slate-500">
                ¿No tienes cuenta?{' '}
                <Text className="text-[#2F8DBA] font-semibold">Soy apoderado</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
