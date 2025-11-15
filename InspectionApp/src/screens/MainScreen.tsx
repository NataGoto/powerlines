/**
 * Главный экран приложения
 * Ввод объекта и элемента, переход к камере
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Vibration,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, RecentItem } from '../types';
import { FileManager } from '../utils/fileManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

const RECENT_OBJECTS_KEY = '@recent_objects';
const RECENT_ELEMENTS_KEY = '@recent_elements';
const PROJECT_NAME_KEY = '@project_name';

export default function MainScreen({ navigation }: Props) {
  const [object, setObject] = useState('');
  const [element, setElement] = useState('');
  const [projectName, setProjectName] = useState('Проект_1');
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [recentObjects, setRecentObjects] = useState<string[]>([]);
  const [recentElements, setRecentElements] = useState<string[]>([]);

  useEffect(() => {
    loadRecents();
    loadRecentFiles();
  }, []);

  // Загрузить недавние объекты и элементы
  const loadRecents = async () => {
    try {
      const objectsJson = await AsyncStorage.getItem(RECENT_OBJECTS_KEY);
      const elementsJson = await AsyncStorage.getItem(RECENT_ELEMENTS_KEY);
      const savedProject = await AsyncStorage.getItem(PROJECT_NAME_KEY);

      if (objectsJson) {
        setRecentObjects(JSON.parse(objectsJson));
      }
      if (elementsJson) {
        setRecentElements(JSON.parse(elementsJson));
      }
      if (savedProject) {
        setProjectName(savedProject);
      }
    } catch (error) {
      console.error('Error loading recents:', error);
    }
  };

  // Загрузить последние файлы
  const loadRecentFiles = async () => {
    try {
      const records = await FileManager.getRecentRecords(projectName, 10);
      setRecentItems(records);
    } catch (error) {
      console.error('Error loading recent files:', error);
    }
  };

  // Сохранить объект в историю
  const saveObjectToRecents = async (obj: string) => {
    if (!obj) return;

    const updated = [obj, ...recentObjects.filter(o => o !== obj)].slice(0, 10);
    setRecentObjects(updated);
    await AsyncStorage.setItem(RECENT_OBJECTS_KEY, JSON.stringify(updated));
  };

  // Сохранить элемент в историю
  const saveElementToRecents = async (elem: string) => {
    if (!elem) return;

    const updated = [elem, ...recentElements.filter(e => e !== elem)].slice(0, 10);
    setRecentElements(updated);
    await AsyncStorage.setItem(RECENT_ELEMENTS_KEY, JSON.stringify(updated));
  };

  // Переход к камере для фото
  const handlePhotoMode = async () => {
    if (!object.trim() || !element.trim()) {
      Vibration.vibrate(100);
      Alert.alert('Ошибка', 'Введите объект и элемент');
      return;
    }

    // Сохранить в историю
    await saveObjectToRecents(object);
    await saveElementToRecents(element);

    // Получить следующий счетчик
    const counter = await FileManager.getNextCounter(object, element, projectName);

    Vibration.vibrate(50);

    navigation.navigate('PhotoCamera', {
      object,
      element,
      counter,
    });
  };

  // Переход к видеорежиму
  const handleVideoMode = () => {
    if (!object.trim() || !element.trim()) {
      Vibration.vibrate(100);
      Alert.alert('Ошибка', 'Введите объект и элемент');
      return;
    }

    Vibration.vibrate(50);
    navigation.navigate('VideoMode');
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Inspection App</Text>
        <Text style={styles.subtitle}>{projectName}</Text>
      </View>

      {/* Поля ввода */}
      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Объект</Text>
          <TextInput
            style={styles.input}
            value={object}
            onChangeText={setObject}
            placeholder="Например: ТП1, Склад_А"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {/* Быстрые кнопки - последние объекты */}
          {recentObjects.length > 0 && !object && (
            <View style={styles.quickButtons}>
              {recentObjects.slice(0, 3).map((obj, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickButton}
                  onPress={() => setObject(obj)}
                >
                  <Text style={styles.quickButtonText}>{obj}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Элемент</Text>
          <TextInput
            style={styles.input}
            value={element}
            onChangeText={setElement}
            placeholder="Например: РУ_10кВ, Отсек_1"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {/* Быстрые кнопки - последние элементы */}
          {recentElements.length > 0 && !element && (
            <View style={styles.quickButtons}>
              {recentElements.slice(0, 3).map((elem, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickButton}
                  onPress={() => setElement(elem)}
                >
                  <Text style={styles.quickButtonText}>{elem}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Кнопки действий */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.photoButton]}
          onPress={handlePhotoMode}
        >
          <Text style={styles.actionButtonIcon}>📷</Text>
          <Text style={styles.actionButtonText}>ФОТО</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.videoButton]}
          onPress={handleVideoMode}
        >
          <Text style={styles.actionButtonIcon}>🎥</Text>
          <Text style={styles.actionButtonText}>ВИДЕО</Text>
        </TouchableOpacity>
      </View>

      {/* История последних записей */}
      <View style={styles.historySection}>
        <Text style={styles.historyTitle}>Последние записи</Text>
        {recentItems.length === 0 ? (
          <Text style={styles.emptyText}>Пока нет записей</Text>
        ) : (
          <FlatList
            data={recentItems}
            keyExtractor={(item, idx) => `${item.filename}_${idx}`}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <Text style={styles.historyFilename}>{item.filename}</Text>
                <View style={styles.historyMeta}>
                  {item.hasAudio ? (
                    <Text style={styles.audioIndicatorYes}>🎤 {item.audioDuration}s</Text>
                  ) : (
                    <Text style={styles.audioIndicatorNo}>🔇 Без аудио</Text>
                  )}
                </View>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  inputSection: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    minHeight: 80,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  quickButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickButtonText: {
    fontSize: 14,
    color: '#555',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  photoButton: {
    backgroundColor: '#2196F3',
  },
  videoButton: {
    backgroundColor: '#f44336',
  },
  actionButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  historySection: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyFilename: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  historyMeta: {
    marginLeft: 10,
  },
  audioIndicatorYes: {
    fontSize: 12,
    color: '#4CAF50',
  },
  audioIndicatorNo: {
    fontSize: 12,
    color: '#999',
  },
});
