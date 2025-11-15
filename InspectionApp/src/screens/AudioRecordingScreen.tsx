/**
 * Экран аудиозаписи
 * КРИТИЧНО: всегда создает файл (даже если пустой)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { RootStackParamList } from '../types';
import { FileManager } from '../utils/fileManager';
import { MetadataManager } from '../utils/metadata';

type Props = NativeStackScreenProps<RootStackParamList, 'AudioRecording'>;

const MAX_DURATION = 600; // 10 минут

export default function AudioRecordingScreen({ navigation, route }: Props) {
  const { photoUri, object, element, counter } = route.params;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      // Настроить режим аудио
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();

    return () => {
      // Очистка при размонтировании
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  // Начать запись
  const startRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Таймер для отображения длительности
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;

          // Автостоп на максимальной длительности
          if (next >= MAX_DURATION) {
            stopRecording();
          }

          return next;
        });
      }, 1000);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
    }
  };

  // Остановить запись
  const stopRecording = async () => {
    if (!recordingRef.current) {
      return;
    }

    try {
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      setAudioUri(uri);
      recordingRef.current = null;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Пропустить аудио (создать пустой файл)
  const skipAudio = async () => {
    Vibration.vibrate(50);

    // Подтверждение
    Alert.alert(
      'Пропустить комментарий?',
      'Будет создан пустой аудиофайл',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Пропустить',
          style: 'destructive',
          onPress: () => savePhotoAudioPair(null),
        },
      ]
    );
  };

  // Сохранить (с аудио)
  const save = async () => {
    if (!audioUri) {
      Alert.alert('Ошибка', 'Нет записи аудио');
      return;
    }

    await savePhotoAudioPair(audioUri);
  };

  // Перезаписать аудио
  const reRecord = async () => {
    setAudioUri(null);
    setRecordingDuration(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // АТОМАРНОЕ сохранение пары фото+аудио
  const savePhotoAudioPair = async (audio: string | null) => {
    setIsSaving(true);

    try {
      // Получить GPS координаты
      const gps = await MetadataManager.getCurrentLocation();

      // Сохранить пару файлов
      const { photoPath, audioPath } = await FileManager.savePhotoAudioPair(
        photoUri,
        audio,
        object,
        element,
        counter,
        'CurrentProject' // TODO: получать из настроек
      );

      // Обновить метаданные
      const projectDir = photoPath.substring(0, photoPath.lastIndexOf('/') + 1);

      await MetadataManager.addRecord(
        projectDir,
        {
          id: `${object}_${element}_${counter.toString().padStart(3, '0')}`,
          photo: {
            filename: photoPath.split('/').pop() || '',
            timestamp: new Date().toISOString(),
            gps,
          },
          audio: {
            filename: audioPath.split('/').pop() || '',
            duration: recordingDuration,
            hasContent: audio !== null,
            segments: ['original'],
          },
        },
        'CurrentProject'
      );

      // Проверить предупреждение о слишком многих пропусках
      const shouldWarn = await MetadataManager.checkAudioWarning(projectDir);
      if (shouldWarn && !audio) {
        Alert.alert(
          'Предупреждение',
          '5 фото подряд без комментариев. Убедитесь что это нормально.',
          [{ text: 'OK' }]
        );
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Вернуться к главному экрану
      navigation.navigate('Main');

    } catch (error) {
      console.error('Error saving files:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить файлы');
    } finally {
      setIsSaving(false);
    }
  };

  // Форматировать время
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Запрос разрешения на микрофон...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>
          Нет доступа к микрофону. Разрешите доступ в настройках.
        </Text>
      </View>
    );
  }

  if (isSaving) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.savingText}>Сохранение...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Превью фото */}
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.preview} />
        <View style={styles.filenameOverlay}>
          <Text style={styles.filenameText}>
            {object}_{element}_{counter.toString().padStart(3, '0')}.jpg
          </Text>
        </View>
      </View>

      {/* Статус записи */}
      <View style={styles.statusContainer}>
        {isRecording ? (
          <>
            <View style={styles.recordingIndicator} />
            <Text style={styles.statusText}>Идёт запись...</Text>
          </>
        ) : audioUri ? (
          <Text style={styles.statusText}>✓ Запись завершена</Text>
        ) : (
          <Text style={styles.statusText}>Готов к записи</Text>
        )}

        <Text style={styles.durationText}>{formatTime(recordingDuration)}</Text>
      </View>

      {/* Кнопки управления */}
      <View style={styles.controlsContainer}>
        {!audioUri ? (
          // Кнопки: Запись / Пропустить
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.skipButton]}
              onPress={skipAudio}
            >
              <Text style={styles.buttonText}>⏭️ ПРОПУСТИТЬ</Text>
              <Text style={styles.buttonHint}>(создаст пустой файл)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.recordButton,
                isRecording && styles.recordingButton,
              ]}
              onPressIn={startRecording}
              onPressOut={stopRecording}
            >
              <Text style={styles.buttonText}>
                {isRecording ? '⏹️ ОТПУСТИТЕ' : '🎤 ДЕРЖАТЬ'}
              </Text>
              <Text style={styles.buttonHint}>
                {isRecording ? 'для остановки' : 'для записи'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          // Кнопки: Перезаписать / Сохранить
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.reRecordButton]}
              onPress={reRecord}
            >
              <Text style={styles.buttonText}>🔄 ПЕРЕЗАПИСАТЬ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.saveButton]}
              onPress={save}
            >
              <Text style={styles.buttonText}>✓ СОХРАНИТЬ</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Подсказка */}
      <Text style={styles.hint}>
        Макс. длительность: {MAX_DURATION / 60} минут
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPermissionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    padding: 20,
  },
  savingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#333',
  },
  previewContainer: {
    width: '90%',
    height: '35%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  filenameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  filenameText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recordingIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f44336',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    fontFamily: 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  skipButton: {
    backgroundColor: '#9E9E9E',
  },
  recordButton: {
    backgroundColor: '#f44336',
  },
  recordingButton: {
    backgroundColor: '#333',
  },
  reRecordButton: {
    backgroundColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonHint: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
