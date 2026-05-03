import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import AssignmentCard from '../../components/AssignmentCard';
import { MOCK_ASSIGNMENTS, MOCK_CHILD_NAME } from '../../lib/mock-data';

export default function ParentAssignmentsScreen(): JSX.Element {
  const pendingCount = MOCK_ASSIGNMENTS.filter((a) => a.status === 'pending').length;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F8FA]">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="rounded-3xl bg-[#2F8DBA] px-5 py-6 mb-2">
          <Text className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
            Tareas de
          </Text>
          <Text className="text-white text-2xl font-black">
            {MOCK_CHILD_NAME}
          </Text>
          <Text className="text-white/80 mt-1 text-sm">
            {pendingCount > 0
              ? `${pendingCount} ${pendingCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}`
              : '¡Todo al día! Sin tareas pendientes.'}
          </Text>
        </View>

        {/* Assignment list */}
        <Text className="text-base font-bold text-slate-700 px-1">
          Todas las tareas
        </Text>
        {MOCK_ASSIGNMENTS.length === 0 ? (
          <View className="rounded-3xl bg-white p-6 items-center border border-slate-100">
            <Text className="text-3xl mb-3">📋</Text>
            <Text className="text-base font-bold text-[#1F2937] text-center">
              No hay tareas asignadas
            </Text>
          </View>
        ) : (
          MOCK_ASSIGNMENTS.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
