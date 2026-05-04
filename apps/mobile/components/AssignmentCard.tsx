import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PracticeAssignment } from '../lib/types';

export interface AssignmentCardProps {
  assignment: PracticeAssignment;
  onPress?: () => void;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function AssignmentCard({
  assignment,
  onPress,
}: AssignmentCardProps): JSX.Element {
  const isCompleted = assignment.status === 'completed';

  return (
    <View
      className={`rounded-3xl p-4 border ${
        isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'
      } mb-3`}
      style={{ shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="font-bold text-base text-slate-900">{assignment.skill}</Text>
          {isCompleted ? (
            <Text className="mt-1 text-sm text-[#3DAA72] font-medium">
              ✅ Completado
            </Text>
          ) : (
            <Text className="mt-1 text-sm text-slate-600">
              {assignment.pendingCount}{' '}
              {assignment.pendingCount === 1 ? 'ejercicio pendiente' : 'ejercicios pendientes'}
            </Text>
          )}
          <Text className="mt-1 text-xs text-slate-400">
            {assignment.dueDate !== null
              ? `Fecha límite: ${formatDate(assignment.dueDate)}`
              : 'Sin fecha límite'}
          </Text>
        </View>
        {!isCompleted && (
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: '#D86060' + '20' }}
          >
            <Text className="text-xs font-semibold" style={{ color: '#D86060' }}>
              Pendiente
            </Text>
          </View>
        )}
      </View>
      {!isCompleted && onPress !== undefined && (
        <Pressable
          className="mt-3 rounded-2xl bg-[#2F8DBA] py-2.5 px-4"
          onPress={onPress}
          style={{ minHeight: 44 }}
        >
          <Text className="text-center font-semibold text-white text-sm">
            Ver tareas
          </Text>
        </Pressable>
      )}
    </View>
  );
}
