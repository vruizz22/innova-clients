import React, { useState } from 'react'
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native'
import { SP_TOKENS } from '@design'

type ScreenKey = 'practice' | 'teacher' | 'parent' | 'auth'

type ScreenButtonProps = {
  label: string
  active: boolean
  onPress: () => void
}

function ScreenButton({ label, active, onPress }: ScreenButtonProps): JSX.Element {
  return (
    <Pressable
      className={`rounded-2xl border px-4 py-3 ${active ? 'border-sky-600 bg-sky-600' : 'border-slate-200 bg-white'}`}
      onPress={onPress}
    >
      <Text className={`text-center text-sm font-semibold ${active ? 'text-white' : 'text-slate-900'}`}>
        {label}
      </Text>
    </Pressable>
  )
}

function PracticeScreen(): JSX.Element {
  return (
    <View className="rounded-[28px] bg-sky-50 p-5">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Student practice</Text>
      <Text className="mt-3 text-3xl font-bold text-slate-900">53 − 26</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-600">Solve step by step and compare your answer with the procedural error renderer.</Text>
      <View className="mt-5 flex-row flex-wrap gap-3">
        <View className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Text className="text-xs text-slate-500">Streak</Text>
          <Text className="text-lg font-bold text-slate-900">4 days</Text>
        </View>
        <View className="rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Text className="text-xs text-slate-500">XP</Text>
          <Text className="text-lg font-bold text-slate-900">240</Text>
        </View>
      </View>
    </View>
  )
}

function TeacherScreen(): JSX.Element {
  return (
    <View className="rounded-[28px] bg-white p-5 shadow-sm">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Teacher dashboard</Text>
      <Text className="mt-3 text-3xl font-bold text-slate-900">Mastery heatmap</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-600">Track students by skill and triage alerts without leaving the app.</Text>
      <View className="mt-5 rounded-2xl bg-slate-50 p-4">
        <Text className="text-sm font-semibold text-slate-900">Alerts</Text>
        <Text className="mt-1 text-sm text-slate-600">AT_RISK_SKILL · STUDENT_DROP · COMMON_ERROR_DETECTED</Text>
      </View>
    </View>
  )
}

function ParentScreen(): JSX.Element {
  return (
    <View className="rounded-[28px] bg-emerald-50 p-5">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Parent supervision</Text>
      <Text className="mt-3 text-3xl font-bold text-slate-900">Va bien</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-600">A friendly summary of the child’s mastery, with privacy-first messaging.</Text>
      <View className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <Text className="text-sm font-semibold text-slate-900">Privacy</Text>
        <Text className="mt-1 text-sm text-slate-600">Photos are anonymized, EXIF stripped, and no third-party trackers are used.</Text>
      </View>
    </View>
  )
}

function AuthScreen(): JSX.Element {
  return (
    <View className="rounded-[28px] bg-slate-900 p-5">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Auth</Text>
      <Text className="mt-3 text-3xl font-bold text-white">Welcome back</Text>
      <Text className="mt-2 text-sm leading-6 text-slate-300">Login, register, forgot password, and reset are wired via typed API clients.</Text>
      <View className="mt-5 rounded-2xl bg-white/10 p-4">
        <Text className="text-sm font-semibold text-white">Backend-ready</Text>
        <Text className="mt-1 text-sm text-slate-300">/auth/login · /auth/register · /auth/forgot-password · /auth/confirm-forgot-password</Text>
      </View>
    </View>
  )
}

export default function App(): JSX.Element {
  const [screen, setScreen] = useState<ScreenKey>('practice')

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: SP_TOKENS.colors.canvas }}>
      <ScrollView contentContainerClassName="gap-5 px-4 py-6">
        <View className="rounded-[32px] bg-white px-5 py-6 shadow-sm">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">SuperProfes Mobile</Text>
          <Text className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Design system, shared and typed</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-600">Expo app scaffold with nativewind classes, shared TS types, and product views aligned to the design system.</Text>
          <View className="mt-5 grid gap-3">
            <ScreenButton label="Practice" active={screen === 'practice'} onPress={() => setScreen('practice')} />
            <ScreenButton label="Teacher" active={screen === 'teacher'} onPress={() => setScreen('teacher')} />
            <ScreenButton label="Parent" active={screen === 'parent'} onPress={() => setScreen('parent')} />
            <ScreenButton label="Auth" active={screen === 'auth'} onPress={() => setScreen('auth')} />
          </View>
        </View>

        {screen === 'practice' ? <PracticeScreen /> : null}
        {screen === 'teacher' ? <TeacherScreen /> : null}
        {screen === 'parent' ? <ParentScreen /> : null}
        {screen === 'auth' ? <AuthScreen /> : null}
      </ScrollView>
    </SafeAreaView>
  )
}
