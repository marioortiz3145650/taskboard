// src/modules/tasks/presentation/TaskItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Task from '../data/TaskModel';
import { takePhotoNative } from '../../camera/CameraService';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onUpdatePhoto: (task: Task, uri: string) => void;
  showToggle?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, onEdit, onUpdatePhoto, showToggle = true }: TaskItemProps) {
  const isCompleted = task.completed;
  const photoUri = task.attachmentUri || null;

  const handleTakePhoto = async () => {
     Alert.alert('Debug', 'Botón cámara presionado');
    try {
      const result = await takePhotoNative();
      if (result && result.uri) {
        // Llamamos a la función de actualización. 
        // WatermelonDB disparará el observable, pero nosotros forzaremos la UI con la key.
        await onUpdatePhoto(task, result.uri);
      }
    } catch (error) {
      console.error("Error cámara:", error);
    }
  };

  // TRUCO SENIOR: Usamos la URI de la foto como parte de la key del contenedor principal.
  // Si la foto cambia, React destruye y recrea este componente, garantizando que la imagen nueva se muestre.
  return (
    <View style={styles.container} key={`${task.id}-${photoUri}`}>
      {/* Miniatura / Botón Cámara */}
      <Pressable style={styles.photoContainer} onPress={handleTakePhoto}>
        {photoUri ? (
          <Image 
            source={{ uri: photoUri }} 
            style={styles.thumbnail} 
            resizeMode="cover" 
            // Forzar recarga de imagen si la URI es la misma pero el contenido cambió (raro, pero seguro)
            fadeDuration={0} 
          />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={20} color="#9CA3AF" />
          </View>
        )}
      </Pressable>

      {/* Contenido Texto */}
      <Pressable
        style={({ pressed }) => [styles.content, pressed && styles.pressedContent]}
      >
        <Text numberOfLines={2} style={[styles.title, isCompleted && styles.completedTitle]}>
          {task.title}
        </Text>
      </Pressable>

      {/* Acciones: Completar, Editar, Eliminar */}
      <View style={styles.actions}>
        {showToggle && (
          <Pressable onPress={() => onToggle(task)} style={styles.iconButton}>
            <Ionicons 
              name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={isCompleted ? "#4ADE80" : "#9CA3AF"} 
            />
          </Pressable>
        )}

        <Pressable onPress={() => onEdit(task)} style={styles.iconButton}>
          <Ionicons name="pencil-outline" size={20} color="#60A5FA" />
        </Pressable>

        <Pressable onPress={() => onDelete(task)} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={20} color="#F87171" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  photoContainer: { marginRight: 10 },
  thumbnail: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#374151' },
  placeholder: {
    width: 40, height: 40, borderRadius: 6, backgroundColor: '#374151',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#4B5563', borderStyle: 'dashed'
  },
  content: { flex: 1, paddingVertical: 4, marginLeft: 4 },
  pressedContent: { opacity: 0.7 },
  title: { fontSize: 14, fontWeight: '500', color: '#F3F4F6', lineHeight: 18 },
  completedTitle: { textDecorationLine: 'line-through', color: '#6B7280' },
  actions: { flexDirection: 'row', gap: 4 },
  iconButton: { padding: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
});