import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../modules/tasks/application/useTasks';
import { useSyncTasks } from '../modules/tasks/application/useSyncTasks';
import { useUIStore, TaskFilter } from '../store/uiStore';
import AvatarView from '../modules/avatar/AvatarView';
import { TaskItem } from '../modules/tasks/presentation/TaskItem';
import { EmptyState } from '../components/ui/EmptyState';

export default function DashboardScreen() {
  const { tasks, toggleTask, filter, completedCount, totalCount, progress } = useTasks();
  const { syncTasks, isSyncing, lastSyncAt, errorMessage } = useSyncTasks();
  const setFilter = useUIStore((state) => state.setFilter);

  // Trigger initial synchronization if database is empty on app startup
  useEffect(() => {
    if (tasks.length === 0 && !lastSyncAt && !isSyncing) {
      syncTasks();
    }
  }, [tasks.length, lastSyncAt, isSyncing, syncTasks]);

  const renderFilterButton = (label: string, value: TaskFilter) => {
    const isActive = filter === value;
    return (
      <Pressable
        key={value}
        onPress={() => setFilter(value)}
        style={[
          styles.filterButton,
          isActive ? styles.activeFilterButton : styles.inactiveFilterButton,
        ]}
      >
        <Text style={[styles.filterText, isActive ? styles.activeFilterText : styles.inactiveFilterText]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090D16" />

      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TaskBoard</Text>
          <Text style={styles.headerSubtitle}>
            {lastSyncAt 
              ? `Sincronizado: ${new Date(lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
              : 'Sin sincronizar'}
          </Text>
        </View>
        <AvatarView name="Santiago Lopez" style={styles.avatar} />
      </View>

      {/* Sync Error Toast Message if active */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText} numberOfLines={1}>{errorMessage}</Text>
        </View>
      )}
      {/* Progress Bar */}
      {totalCount > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progreso</Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { flex: progress }]} />
            <View style={{ flex: 1 - progress }} />
          </View>
        </View>
      )}

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {renderFilterButton('Todas', 'all')}
        {renderFilterButton('Completadas', 'completed')}
        {renderFilterButton('Pendientes', 'pending')}
      </View>

      {/* Sync Loader Overlay for Initial Load */}
      {isSyncing && tasks.length === 0 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loaderText}>Preparando tu base de datos...</Text>
        </View>
      ) : (
        /* Tasks List */
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem task={item} onToggle={toggleTask} showCheckbox={filter === 'completed' || filter === 'pending'}/>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState filter={filter} />}
          refreshing={isSyncing}
          onRefresh={syncTasks}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  activeFilterButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveFilterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  inactiveFilterText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  listContent: {
    paddingBottom: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loaderText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  progressContainer: {
  paddingHorizontal: 20,
  paddingVertical: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  progressCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  progressTrack: {
    height: 4,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
});
