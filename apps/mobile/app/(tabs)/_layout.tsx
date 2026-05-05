// Bottom tab navigation for student/parent — custom implementation (Expo Router compatible)
// Note: app currently uses manual zone-based routing in app/_layout.tsx.
// This file provides the Expo Router tab layout for future migration.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Slot, useSegments, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'index' | 'assignments' | 'progress' | 'profile';

const TABS: Array<{ key: Tab; label: string; icon: string; activeIcon: string; route: string }> = [
  { key: 'index', label: 'Inicio', icon: '🏠', activeIcon: '🏡', route: '/(tabs)/' },
  { key: 'assignments', label: 'Asignaciones', icon: '📖', activeIcon: '📚', route: '/(tabs)/assignments' },
  { key: 'progress', label: 'Progreso', icon: '📈', activeIcon: '📊', route: '/(tabs)/progress' },
  { key: 'profile', label: 'Perfil', icon: '👤', activeIcon: '👤', route: '/(tabs)/profile' },
];

export default function TabsLayout(): JSX.Element {
  const segments = useSegments();
  const currentSegment = segments[segments.length - 1] ?? 'index';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8FA' }} edges={['bottom']}>
      <View style={{ flex: 1 }}>
        <Slot />
      </View>

      {/* Bottom Tab Bar */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E9F0',
          paddingBottom: 4,
          paddingTop: 8,
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            (tab.key === 'index' && (currentSegment === 'index' || currentSegment === '(tabs)')) ||
            currentSegment === tab.key;

          return (
            <Pressable
              key={tab.key}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 6, minHeight: 44 }}
              onPress={() => router.push(tab.route as never)}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
            >
              <Text style={{ fontSize: 22, marginBottom: 2 }}>
                {isActive ? tab.activeIcon : tab.icon}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isActive ? '#2F8DBA' : '#A5ADBC',
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
