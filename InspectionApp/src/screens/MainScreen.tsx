/**
 * Главный экран приложения ЗиС Прогноз
 * Платформа обследователя
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
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList, RecentItem } from '../types';
import { FileManager } from '../utils/fileManager';
import { colors, typography, spacing, borderRadius, layout } from '../constants/theme';

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
      {/* Заголовок с брендингом */}
      <View style={styles.header}>
        {/* Место для логотипа */}
        <View style={styles.logoPlaceholder}>
          {/* TODO: Заменить на <Image source={require('../../assets/logo.png')} style={styles.logo} /> */}
          <Text style={styles.logoText}>ЛОГО</Text>
        </View>

        <View style={styles.brandingContainer}>
          <Text style={styles.brandTitle}>ЗиС Прогноз</Text>
          <Text style={styles.brandSubtitle}>платформа обследователя</Text>
        </View>

        <Text style={styles.projectName}>{projectName}</Text>
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
            placeholderTextColor={colors.lightGray}
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
            placeholderTextColor={colors.lightGray}
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
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
  },

  // Заголовок и брендинг
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: layout.logoWidth,
    height: layout.logoHeight,
    backgroundColor: layout.logoPlaceholderColor,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    // Место для изображения логотипа
    // backgroundImage: url('path/to/logo.png') - для веба
  },
  logoText: {
    fontSize: typography.body,
    color: colors.white,
    fontWeight: typography.bold,
  },
  logo: {
    // Стиль для реального логотипа (когда добавите изображение)
    width: layout.logoWidth,
    height: layout.logoHeight,
    resizeMode: 'contain',
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandTitle: {
    fontSize: typography.heading,
    fontWeight: typography.bold,
    color: colors.primary,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: typography.caption,
    color: colors.accent, // Темно-красный
    marginTop: spacing.xs,
    fontWeight: typography.medium,
  },
  projectName: {
    fontSize: typography.caption,
    color: colors.lightGray,
    marginTop: spacing.sm,
  },

  // Поля ввода
  inputSection: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.borderGray,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.body,
    minHeight: layout.buttonMinHeight,
    color: colors.primary,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  quickButton: {
    backgroundColor: colors.borderGray,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  quickButtonText: {
    fontSize: typography.caption,
    color: colors.gray,
  },

  // Кнопки действий
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: layout.buttonHeight,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  photoButton: {
    backgroundColor: colors.primary, // Черный
  },
  videoButton: {
    backgroundColor: colors.accent, // Темно-красный
  },
  actionButtonIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.subheading,
    fontWeight: typography.bold,
  },

  // История
  historySection: {
    flex: 1,
  },
  historyTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.caption,
    color: colors.lightGray,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  historyItem: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent, // Темно-красный акцент
  },
  historyFilename: {
    fontSize: typography.small,
    color: colors.primary,
    flex: 1,
  },
  historyMeta: {
    marginLeft: spacing.sm,
  },
  audioIndicatorYes: {
    fontSize: typography.small,
    color: colors.success,
  },
  audioIndicatorNo: {
    fontSize: typography.small,
    color: colors.lightGray,
  },
});
