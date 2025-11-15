/**
 * Управление метаданными сессии
 */

import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import { SessionMetadata, InspectionRecord, GPSCoordinates } from '../types';

export class MetadataManager {
  /**
   * Получить текущие GPS координаты
   */
  static async getCurrentLocation(): Promise<GPSCoordinates | undefined> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return undefined;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return undefined;
    }
  }

  /**
   * Получить путь к файлу метаданных
   */
  private static getMetadataPath(projectDir: string): string {
    return `${projectDir}session_metadata.json`;
  }

  /**
   * Загрузить метаданные сессии
   */
  static async loadMetadata(projectDir: string): Promise<SessionMetadata> {
    const metadataPath = this.getMetadataPath(projectDir);

    try {
      const fileInfo = await FileSystem.getInfoAsync(metadataPath);

      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(metadataPath);
        return JSON.parse(content);
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
    }

    // Создать новую сессию
    const now = new Date();
    return {
      session: {
        date: now.toISOString().split('T')[0],
        startTime: now.toTimeString().split(' ')[0],
        project: 'Unknown',
      },
      records: [],
    };
  }

  /**
   * Сохранить метаданные
   */
  static async saveMetadata(
    projectDir: string,
    metadata: SessionMetadata
  ): Promise<void> {
    const metadataPath = this.getMetadataPath(projectDir);

    try {
      await FileSystem.writeAsStringAsync(
        metadataPath,
        JSON.stringify(metadata, null, 2)
      );
    } catch (error) {
      console.error('Error saving metadata:', error);
      throw error;
    }
  }

  /**
   * Добавить запись в метаданные
   */
  static async addRecord(
    projectDir: string,
    record: InspectionRecord,
    projectName: string
  ): Promise<void> {
    const metadata = await this.loadMetadata(projectDir);

    // Обновить имя проекта
    metadata.session.project = projectName;

    // Добавить новую запись
    metadata.records.push(record);

    await this.saveMetadata(projectDir, metadata);
  }

  /**
   * Получить статистику сессии
   */
  static async getSessionStats(projectDir: string): Promise<{
    totalPhotos: number;
    photosWithAudio: number;
    photosWithoutAudio: number;
  }> {
    const metadata = await this.loadMetadata(projectDir);

    const totalPhotos = metadata.records.length;
    const photosWithAudio = metadata.records.filter(
      r => r.audio.hasContent
    ).length;

    return {
      totalPhotos,
      photosWithAudio,
      photosWithoutAudio: totalPhotos - photosWithAudio,
    };
  }

  /**
   * Проверить, не слишком ли много фото без аудио подряд
   */
  static async checkAudioWarning(projectDir: string): Promise<boolean> {
    const metadata = await this.loadMetadata(projectDir);

    // Проверить последние 5 записей
    const recentRecords = metadata.records.slice(-5);

    if (recentRecords.length < 5) {
      return false;
    }

    // Если все 5 без аудио - предупреждение
    const allWithoutAudio = recentRecords.every(r => !r.audio.hasContent);

    return allWithoutAudio;
  }
}
