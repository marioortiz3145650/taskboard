import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../modules/tasks/application/useTasks';
import { useSyncTasks } from '../modules/tasks/application/useSyncTasks';
import { useUIStore, TaskFilter } from '../store/uiStore';
import AvatarView from '../modules/avatar/AvatarView';
import { TaskItem } from '../modules/tasks/presentation/TaskItem';
import { EmptyState } from '../components/ui/EmptyState';
import Task from '../modules/tasks/data/TaskModel';

export default function DashboardScreen() {
  // Desestructuramos todo lo necesario del hook de tareas
  const { 
    tasks, 
    toggleTask, 
    createTask, 
    updateTask, 
    deleteTask, 
    filter, 
    completedCount, 
    totalCount, 
    progress, 
    search, 
    setSearch 
  } = useTasks();

  // Hook de sincronización
  const { syncTasks, isSyncing, lastSyncAt, errorMessage } = useSyncTasks();
  
  // Estado global de UI para filtros
  const setFilter = useUIStore((state) => state.setFilter);

  // Estados locales para el Modal de Crear/Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');

  // Sincronización inicial si no hay datos
  useEffect(() => {
    if (tasks.length === 0 && !lastSyncAt && !isSyncing) {
      syncTasks();
    }
  }, [tasks.length, lastSyncAt, isSyncing, syncTasks]);

  // Abrir modal para crear nueva tarea
  const openCreateModal = () => {
    setEditingTask(null);
    setTaskTitle('');
    setModalVisible(true);
  };

  // Abrir modal para editar tarea existente
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setModalVisible(true);
  };

  // Guardar cambios (Crear o Editar)
  const handleSave = async () => {
    if (!taskTitle.trim()) return;
    
    try {
      if (editingTask) {
        // Si estamos editando, solo actualizamos el título
        await updateTask(editingTask, taskTitle.trim());
      } else {
        // Si es nueva, la creamos
        await createTask(taskTitle.trim());
      }
      
      // Cerrar modal y limpiar estados
      setModalVisible(false);
      setTaskTitle('');
      setEditingTask(null);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la tarea.');
    }
  };

  // Eliminar tarea con confirmación
  const handleDelete = (task: Task) => {
    Alert.alert('Eliminar tarea', '¿Estás seguro de que deseas eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive', 
        onPress: () => deleteTask(task) 
      },
    ]);
  };

  // Actualizar foto de la tarea (Módulo Nativo)
  const handleUpdatePhoto = async (task: Task, uri: string) => {
    try {
      // Llamamos a updateTask pasando la URI de la nueva foto
      // El tercer parámetro es opcional y maneja la imagen
      await updateTask(task, task.title, uri);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la foto en la base de datos local.');
    }
  };

  // Renderizado de botones de filtro
  const renderFilterButton = (label: string, value: TaskFilter) => {
    const isActive = filter === value;
    return (
      <Pressable
        key={value}
        onPress={() => setFilter(value)}
        style={[
          styles.filterButton, 
          isActive ? styles.activeFilterButton : styles.inactiveFilterButton
        ]}
      >
        <Text style={[
          styles.filterText, 
          isActive ? styles.activeFilterText : styles.inactiveFilterText
        ]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      {/* Header Superior */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TaskBoard</Text>
          <Text style={styles.headerSubtitle}>
            {lastSyncAt
              ? `Sincronizado: ${new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Sin sincronizar'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.addButton} onPress={openCreateModal}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
          {/* Componente Nativo AvatarView */}
          <AvatarView name="Santiago Lopez" style={styles.avatar} />
        </View>
      </View>

      {/* Banner de Error de Sincronización */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={1}>{errorMessage}</Text>
        </View>
      )}

      {/* Barra de Progreso Visual */}
      {totalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso</Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressTrack}>
            {/* El ancho se calcula dinámicamente basado en el progreso */}
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      )}

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar tareas..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtros: Todas, Completadas, Pendientes */}
      <View style={styles.filterBar}>
        {renderFilterButton('Todas', 'all')}
        {renderFilterButton('Completadas', 'completed')}
        {renderFilterButton('Pendientes', 'pending')}
      </View>

      {/* Lista de Tareas o Loader */}
      {isSyncing && tasks.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loaderText}>Preparando tu base de datos...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          // EXTRA DATA: Fuerza a FlatList a re-renderizar si estos valores cambian
          extraData={[tasks.length, filter, search]} 
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={toggleTask}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onUpdatePhoto={handleUpdatePhoto}
              showToggle={filter === 'completed' || filter === 'pending'}
              showActions={filter === 'all'}
              showPhoto={true}
            />
  )}
  contentContainerStyle={styles.listContent}
  ListEmptyComponent={<EmptyState filter={filter} />}
  refreshing={isSyncing}
  onRefresh={syncTasks}
  showsVerticalScrollIndicator={false}
/>
      )}

      {/* Modal para Crear/Editar Tarea */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Editar tarea' : 'Nueva tarea'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Título de la tarea..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={taskTitle}
              onChangeText={setTaskTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable 
                style={styles.modalCancel} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </Pressable>
              <Pressable 
                style={styles.modalSave} 
                onPress={handleSave}
              >
                <Text style={styles.modalSaveText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#090D16' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 16, 
    paddingBottom: 12 
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    letterSpacing: -0.5 
  },
  headerSubtitle: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: 'rgba(255, 255, 255, 0.45)', 
    marginTop: 2 
  },
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  addButton: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: '#3B82F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  addButtonText: { 
    color: '#FFFFFF', 
    fontSize: 22, 
    fontWeight: '300', 
    marginTop: -2 
  },
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22 
  },
  errorBanner: { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    borderWidth: 1, 
    borderColor: 'rgba(239, 68, 68, 0.15)', 
    borderRadius: 10, 
    marginHorizontal: 16, 
    marginVertical: 4, 
    paddingHorizontal: 12, 
    paddingVertical: 8 
  },
  errorText: { 
    color: '#EF4444', 
    fontSize: 12, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  progressContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 8 
  },
  progressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  progressLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: 'rgba(255, 255, 255, 0.45)' 
  },
  progressCount: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: 'rgba(255, 255, 255, 0.45)' 
  },
  progressTrack: { 
    height: 6, 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 3, 
    overflow: 'hidden' 
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#3B82F6', 
    borderRadius: 3 
  },
  searchContainer: { 
    paddingHorizontal: 16, 
    paddingBottom: 8 
  },
  searchInput: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    color: '#FFFFFF', 
    fontSize: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)' 
  },
  filterBar: { 
    flexDirection: 'row', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    gap: 8 
  },
  filterButton: { 
    flex: 1, 
    paddingVertical: 10, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1 
  },
  activeFilterButton: { 
    backgroundColor: '#3B82F6', 
    borderColor: '#3B82F6', 
    elevation: 4 
  },
  inactiveFilterButton: { 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    borderColor: 'rgba(255, 255, 255, 0.05)' 
  },
  filterText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  activeFilterText: { 
    color: '#FFFFFF' 
  },
  inactiveFilterText: { 
    color: 'rgba(255, 255, 255, 0.6)' 
  },
  listContent: { 
    paddingBottom: 24 
  },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 32 
  },
  loaderText: { 
    color: 'rgba(255, 255, 255, 0.5)', 
    fontSize: 14, 
    fontWeight: '500', 
    marginTop: 16, 
    textAlign: 'center' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 24 
  },
  modalContainer: { 
    backgroundColor: '#1A2035', 
    borderRadius: 16, 
    padding: 24, 
    width: '100%', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)' 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 16 
  },
  modalInput: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 10, 
    paddingHorizontal: 14, 
    paddingVertical: 12, 
    color: '#FFFFFF', 
    fontSize: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    marginBottom: 20 
  },
  modalButtons: { 
    flexDirection: 'row', 
    gap: 10 
  },
  modalCancel: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center' 
  },
  modalCancelText: { 
    color: 'rgba(255,255,255,0.6)', 
    fontWeight: '600' 
  },
  modalSave: { 
    flex: 1, 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: '#3B82F6', 
    alignItems: 'center' 
  },
  modalSaveText: { 
    color: '#FFFFFF', 
    fontWeight: '700' 
  },
});