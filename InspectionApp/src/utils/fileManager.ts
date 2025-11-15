/**
 * Менеджер файлов - именование, сохранение, организация
 */

import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { FileNamingParams, InspectionRecord, PhotoRecord, AudioRecord } from '../types';

export class FileManager {
  // Базовый путь для хранения
  private static readonly BASE_DIR = `${FileSystem.documentDirectory}InspectionApp/`;

  /**
   * Генерация имени файла
   * Формат: Объект_Элемент_XXX.ext
   */
  static generateFileName(params: FileNamingParams): string {
    const { object, element, counter, extension, videoType } = params;

    // Очистка имен от недопустимых символов
    const cleanObject = this.cleanFileName(object);
    const cleanElement = this.cleanFileName(element);

    // Формат счетчика: 001, 002, ...
    const counterStr = counter.toString().padStart(3, '0');

    if (extension === 'mp4' && videoType) {
      return `${cleanObject}_${cleanElement}_обход_${videoType}.${extension}`;
    }

    return `${cleanObject}_${cleanElement}_${counterStr}.${extension}`;
  }

  /**
   * Очистка имени файла от недопустимых символов
   */
  private static cleanFileName(name: string): string {
    return name
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .trim();
  }

  /**
   * Получить путь к директории проекта
   */
  static async getProjectDirectory(projectName: string, date: string): Promise<string> {
    const dir = `${this.BASE_DIR}${projectName}/${date}/`;

    // Создать директорию если не существует
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    return dir;
  }

  /**
   * Создать пустой аудиофайл
   * КРИТИЧНО: каждое фото ДОЛЖНО иметь парный аудиофайл
   */
  static async createEmptyAudioFile(filepath: string): Promise<void> {
    // Создать минимальный валидный M4A файл (заголовок)
    const emptyM4A = this.getEmptyM4AHeader();
    await FileSystem.writeAsStringAsync(filepath, emptyM4A, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  /**
   * Получить заголовок пустого M4A файла
   */
  private static getEmptyM4AHeader(): string {
    // Минимальный валидный M4A файл (base64)
    // Это пустой AAC контейнер длительностью 0 секунд
    return 'AAAAGGZ0eXBNNEEgAAAAAE00QSBtcDQyaXNvbQAAAA1tZGF0';
  }

  /**
   * АТОМАРНОЕ сохранение пары фото+аудио
   * Это критическая функция - всегда создает оба файла
   */
  static async savePhotoAudioPair(
    photoUri: string,
    audioUri: string | null,
    object: string,
    element: string,
    counter: number,
    projectName: string
  ): Promise<{ photoPath: string; audioPath: string }> {

    const date = new Date().toISOString().split('T')[0];
    const projectDir = await this.getProjectDirectory(projectName, date);

    // Генерация базового имени
    const baseName = this.generateFileName({ object, element, counter, extension: 'jpg' }).replace('.jpg', '');

    const photoFilename = `${baseName}.jpg`;
    const audioFilename = `${baseName}.m4a`;

    const photoPath = `${projectDir}${photoFilename}`;
    const audioPath = `${projectDir}${audioFilename}`;

    try {
      // 1. Сохранить фото
      await FileSystem.copyAsync({
        from: photoUri,
        to: photoPath,
      });

      // 2. ВСЕГДА создать аудиофайл (даже если пустой)
      if (audioUri) {
        await FileSystem.copyAsync({
          from: audioUri,
          to: audioPath,
        });
      } else {
        await this.createEmptyAudioFile(audioPath);
      }

      // 3. Добавить в медиатеку Android
      await MediaLibrary.createAssetAsync(photoPath);
      if (audioUri) {
        await MediaLibrary.createAssetAsync(audioPath);
      }

      return { photoPath, audioPath };

    } catch (error) {
      // Откатить изменения если что-то пошло не так
      await this.cleanup([photoPath, audioPath]);
      throw error;
    }
  }

  /**
   * Очистка файлов при ошибке
   */
  private static async cleanup(paths: string[]): Promise<void> {
    for (const path of paths) {
      try {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) {
          await FileSystem.deleteAsync(path);
        }
      } catch (e) {
        // Игнорировать ошибки очистки
      }
    }
  }

  /**
   * Получить следующий номер счетчика для объекта/элемента
   */
  static async getNextCounter(
    object: string,
    element: string,
    projectName: string
  ): Promise<number> {
    const date = new Date().toISOString().split('T')[0];
    const projectDir = await this.getProjectDirectory(projectName, date);

    const cleanObject = this.cleanFileName(object);
    const cleanElement = this.cleanFileName(element);

    try {
      const files = await FileSystem.readDirectoryAsync(projectDir);

      // Найти файлы с таким же объектом и элементом
      const pattern = new RegExp(`^${cleanObject}_${cleanElement}_(\\d{3})\\.jpg$`);

      let maxCounter = 0;
      for (const file of files) {
        const match = file.match(pattern);
        if (match) {
          const counter = parseInt(match[1], 10);
          if (counter > maxCounter) {
            maxCounter = counter;
          }
        }
      }

      return maxCounter + 1;

    } catch (error) {
      // Директория не существует или пустая
      return 1;
    }
  }

  /**
   * Получить список последних записей
   */
  static async getRecentRecords(projectName: string, limit: number = 10): Promise<any[]> {
    const date = new Date().toISOString().split('T')[0];
    const projectDir = await this.getProjectDirectory(projectName, date);

    try {
      const files = await FileSystem.readDirectoryAsync(projectDir);

      // Фильтр только фото
      const photoFiles = files.filter(f => f.endsWith('.jpg'));

      // Получить информацию о файлах
      const records = await Promise.all(
        photoFiles.slice(0, limit).map(async (photo) => {
          const baseName = photo.replace('.jpg', '');
          const audioFile = `${baseName}.m4a`;

          const photoPath = `${projectDir}${photo}`;
          const audioPath = `${projectDir}${audioFile}`;

          const photoInfo = await FileSystem.getInfoAsync(photoPath);
          const audioInfo = await FileSystem.getInfoAsync(audioPath);

          let audioDuration = 0;
          let hasAudio = false;

          if (audioInfo.exists && audioInfo.size && audioInfo.size > 100) {
            hasAudio = true;
            // TODO: получить реальную длительность из аудио
            audioDuration = 0;
          }

          return {
            filename: photo,
            hasAudio,
            audioDuration,
            timestamp: photoInfo.modificationTime || Date.now(),
          };
        })
      );

      // Сортировать по времени (новые первые)
      records.sort((a, b) => b.timestamp - a.timestamp);

      return records;

    } catch (error) {
      return [];
    }
  }
}
