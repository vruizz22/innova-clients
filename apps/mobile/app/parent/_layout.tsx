import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import ParentAssignmentsScreen from './index';
import ParentProgressScreen from './progress';

type ParentTab = 'assignments' | 'progress';

export interface ParentLayoutProps {
  onLogout?: () => void;
}

export default function ParentLayout({ onLogout }: ParentLayoutProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<ParentTab>('assignments');

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {/* Screen content */}
      <View className="flex-1">
        {activeTab === 'assignments' ? (
          <ParentAssignmentsScreen />
        ) : (
          <ParentProgressScreen />
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
          onPress={() => setActiveTab('assignments')}
        >
          <Text className="text-2xl mb-0.5">{activeTab === 'assignments' ? '📋' : '🗒️'}</Text>
          <Text
            className={`text-xs font-semibold ${
              activeTab === 'assignments' ? 'text-[#2F8DBA]' : 'text-slate-400'
            }`}
          >
            Tareas
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
            Progreso
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
