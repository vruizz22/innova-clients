// Assignments screen — list of practice assignments for the student
import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable } from 'react-native';
import { MOCK_ASSIGNMENTS } from '@lib/mock-data';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin fecha límite';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' });
}

export default function AssignmentsScreen(): JSX.Element {
  const pending = MOCK_ASSIGNMENTS.filter((a) => a.status === 'pending');
  const completed = MOCK_ASSIGNMENTS.filter((a) => a.status === 'completed');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 4 }}>
          Asignaciones
        </Text>
        <Text style={{ fontSize: 14, color: '#4F5868', marginBottom: 20 }}>
          {pending.length > 0
            ? `${pending.length} pendientes por completar`
            : '¡Todo al día!'}
        </Text>

        {pending.length > 0 ? (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#374050', marginBottom: 10 }}>
              Pendientes
            </Text>
            {pending.map((assignment) => (
              <View
                key={assignment.id}
                style={{
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF',
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#E5E9F0',
                  shadowColor: '#000',
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                      {assignment.skill}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#4F5868', marginTop: 2 }}>
                      {assignment.pendingCount} {assignment.pendingCount === 1 ? 'ejercicio' : 'ejercicios'} restantes
                    </Text>
                    <Text style={{ fontSize: 11, color: '#717A8B', marginTop: 2 }}>
                      Vence: {formatDate(assignment.dueDate)}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: '#fce8e8',
                      borderRadius: 99,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#7a1a1a' }}>
                      Pendiente
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={{
                    marginTop: 12,
                    borderRadius: 14,
                    backgroundColor: '#2F8DBA',
                    paddingVertical: 10,
                    alignItems: 'center',
                    minHeight: 44,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>
                    Practicar →
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        {completed.length > 0 ? (
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#374050', marginBottom: 10 }}>
              Completadas
            </Text>
            {completed.map((assignment) => (
              <View
                key={assignment.id}
                style={{
                  borderRadius: 20,
                  backgroundColor: '#FFFFFF',
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#E5E9F0',
                  opacity: 0.7,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                    {assignment.skill}
                  </Text>
                  <View
                    style={{
                      backgroundColor: '#D2F2E0',
                      borderRadius: 99,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#194E34' }}>
                      ✓ Completada
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
