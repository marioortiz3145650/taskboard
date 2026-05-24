import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TaskFilter } from '../../store/uiStore';

interface EmptyStateProps {
  filter: TaskFilter;
}

export function EmptyState({ filter }: EmptyStateProps) {
  const getDetails = () => {
    switch (filter) {
      case 'completed':
        return {
          icon: 'ribbon-outline',
          title: 'Sin tareas completadas',
          description: '¡Aún no tienes tareas completadas! Comienza a marcar tus metas pendientes.',
        };
      case 'pending':
        return {
          icon: 'sparkles-outline',
          title: '¡Todo al día!',
          description: 'No tienes tareas pendientes. ¡Tu bandeja de entrada está perfectamente limpia!',
        };
      default:
        return {
          icon: 'rocket-outline',
          title: 'Tu TaskBoard está vacío',
          description: 'No hay ninguna tarea guardada localmente. Haz un gesto de arrastrar (pull-to-refresh) para cargar desde la API.',
        };
    }
  };

  const details = getDetails();

  return (
    <View style={styles.container}>
      <View style={styles.iconBackground}>
        <Ionicons name={details.icon as any} size={44} color="#8B5CF6" />
      </View>
      <Text style={styles.title}>{details.title}</Text>
      <Text style={styles.description}>{details.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginHorizontal: 16,
    marginTop: 64,
  },
  iconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
});
