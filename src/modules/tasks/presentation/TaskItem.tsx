import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Checkbox } from '../../../components/ui/Checkbox';
import Task from '../data/TaskModel';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  showCheckbox?: boolean;
}

export function TaskItem({ task, onToggle, showCheckbox = false }: TaskItemProps) {
  const isCompleted = task.completed;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressedCard]}
      onPress={() => onToggle(task)}
    >
      <View style={styles.leftContainer}>
        {showCheckbox && (
          <Checkbox checked={isCompleted} onChange={() => onToggle(task)} />
        )}
        <Text numberOfLines={2} style={[styles.title, isCompleted && styles.completedTitle, showCheckbox && { marginLeft: 12 }]}>
          {task.title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.035)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pressedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F3F4F6',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.35)',
  },
});
