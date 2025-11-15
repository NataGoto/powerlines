# Примеры использования API

## FileManager

### Генерация имени файла

```typescript
import { FileManager } from './src/utils/fileManager';

// Фото
const photoName = FileManager.generateFileName({
  object: 'ТП1',
  element: 'РУ_10кВ',
  counter: 1,
  extension: 'jpg'
});
// Результат: "ТП1_РУ_10кВ_001.jpg"

// Видео с типом
const videoName = FileManager.generateFileName({
  object: 'ТП1',
  element: 'Главный_зал',
  counter: 1,
  extension: 'mp4',
  videoType: '360'
});
// Результат: "ТП1_Главный_зал_обход_360.mp4"
```

### Атомарное сохранение пары файлов

```typescript
// КРИТИЧНО: всегда создает ОБА файла
const { photoPath, audioPath } = await FileManager.savePhotoAudioPair(
  'file:///path/to/photo.jpg',
  'file:///path/to/audio.m4a',  // или null для пустого файла
  'ТП1',
  'РУ_10кВ',
  1,
  'Проект_2024'
);

console.log(photoPath);
// /storage/.../InspectionApp/Проект_2024/2024-03-15/ТП1_РУ_10кВ_001.jpg

console.log(audioPath);
// /storage/.../InspectionApp/Проект_2024/2024-03-15/ТП1_РУ_10кВ_001.m4a
```

### Получить следующий счетчик

```typescript
const nextCounter = await FileManager.getNextCounter(
  'ТП1',
  'РУ_10кВ',
  'Проект_2024'
);
// Если есть файлы _001, _002, _003, вернёт 4
// Если нет файлов, вернёт 1
```

### Получить последние записи

```typescript
const recentRecords = await FileManager.getRecentRecords('Проект_2024', 10);

recentRecords.forEach(record => {
  console.log(record.filename);      // "ТП1_РУ_10кВ_001.jpg"
  console.log(record.hasAudio);      // true/false
  console.log(record.audioDuration); // 45.5 секунд
  console.log(record.timestamp);     // Unix timestamp
});
```

## MetadataManager

### Получить GPS координаты

```typescript
import { MetadataManager } from './src/utils/metadata';

const gps = await MetadataManager.getCurrentLocation();

if (gps) {
  console.log(gps.latitude);   // 55.7558
  console.log(gps.longitude);  // 37.6173
  console.log(gps.altitude);   // 150 (опционально)
  console.log(gps.accuracy);   // 10 (опционально)
}
```

### Добавить запись в метаданные

```typescript
const projectDir = '/path/to/project/2024-03-15/';

await MetadataManager.addRecord(
  projectDir,
  {
    id: 'ТП1_РУ_10кВ_001',
    photo: {
      filename: 'ТП1_РУ_10кВ_001.jpg',
      timestamp: new Date().toISOString(),
      gps: { latitude: 55.7558, longitude: 37.6173 }
    },
    audio: {
      filename: 'ТП1_РУ_10кВ_001.m4a',
      duration: 45.5,
      hasContent: true,
      segments: ['original']
    }
  },
  'Проект_2024'
);
```

### Получить статистику

```typescript
const stats = await MetadataManager.getSessionStats(projectDir);

console.log(stats.totalPhotos);         // 10
console.log(stats.photosWithAudio);     // 7
console.log(stats.photosWithoutAudio);  // 3
```

### Проверить предупреждение

```typescript
// Проверить последние 5 записей
const shouldWarn = await MetadataManager.checkAudioWarning(projectDir);

if (shouldWarn) {
  Alert.alert(
    'Предупреждение',
    '5 фото подряд без комментариев!'
  );
}
```

## Использование в компонентах

### Главный экран - быстрый выбор

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Сохранить в историю
const saveToRecents = async (object: string) => {
  const key = '@recent_objects';
  const json = await AsyncStorage.getItem(key);
  const recents = json ? JSON.parse(json) : [];

  const updated = [object, ...recents.filter(o => o !== object)].slice(0, 10);

  await AsyncStorage.setItem(key, JSON.stringify(updated));
};

// Загрузить историю
const loadRecents = async () => {
  const json = await AsyncStorage.getItem('@recent_objects');
  return json ? JSON.parse(json) : [];
};
```

### Камера - съемка с EXIF

```typescript
import { Camera } from 'expo-camera';

const cameraRef = useRef<Camera>(null);

const takePhoto = async () => {
  const photo = await cameraRef.current?.takePictureAsync({
    quality: 0.9,        // Качество 90%
    exif: true,          // Включить EXIF данные
    skipProcessing: false // Обработать фото
  });

  console.log(photo.uri);     // file:///...
  console.log(photo.width);   // 4000
  console.log(photo.height);  // 3000
  console.log(photo.exif);    // { GPSLatitude, GPSLongitude, ... }
};
```

### Аудио - запись с удержанием

```typescript
import { Audio } from 'expo-av';

const [recording, setRecording] = useState<Audio.Recording | null>(null);
const [isRecording, setIsRecording] = useState(false);

const startRecording = async () => {
  const { recording: rec } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  setRecording(rec);
  setIsRecording(true);
};

const stopRecording = async () => {
  if (!recording) return;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();

  setIsRecording(false);
  setRecording(null);

  return uri;
};

// В JSX
<TouchableOpacity
  onPressIn={startRecording}
  onPressOut={stopRecording}
>
  <Text>{isRecording ? 'ОТПУСТИТЕ' : 'ДЕРЖАТЬ'}</Text>
</TouchableOpacity>
```

### Навигация - переход с параметрами

```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavProps = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const navigation = useNavigation<NavProps>();

// Переход к камере
navigation.navigate('PhotoCamera', {
  object: 'ТП1',
  element: 'РУ_10кВ',
  counter: 1
});

// Переход к аудио
navigation.navigate('AudioRecording', {
  photoUri: 'file:///...',
  object: 'ТП1',
  element: 'РУ_10кВ',
  counter: 1
});

// Возврат назад
navigation.goBack();

// Возврат к главному экрану
navigation.navigate('Main');
```

## Полный пример рабочего процесса

```typescript
// MainScreen.tsx
const handlePhotoMode = async () => {
  // 1. Получить следующий счетчик
  const counter = await FileManager.getNextCounter(
    object,
    element,
    projectName
  );

  // 2. Перейти к камере
  navigation.navigate('PhotoCamera', {
    object,
    element,
    counter
  });
};

// PhotoCameraScreen.tsx
const takePhoto = async () => {
  // 1. Сделать фото
  const photo = await cameraRef.current?.takePictureAsync({
    quality: 0.9,
    exif: true
  });

  // 2. АВТОМАТИЧЕСКИ перейти к аудио
  navigation.navigate('AudioRecording', {
    photoUri: photo.uri,
    object,
    element,
    counter
  });
};

// AudioRecordingScreen.tsx
const savePhotoAudioPair = async (audioUri: string | null) => {
  // 1. Получить GPS
  const gps = await MetadataManager.getCurrentLocation();

  // 2. АТОМАРНО сохранить пару файлов
  const { photoPath, audioPath } = await FileManager.savePhotoAudioPair(
    photoUri,
    audioUri,  // null = создать пустой файл
    object,
    element,
    counter,
    projectName
  );

  // 3. Обновить метаданные
  const projectDir = photoPath.substring(0, photoPath.lastIndexOf('/') + 1);

  await MetadataManager.addRecord(
    projectDir,
    {
      id: `${object}_${element}_${counter.toString().padStart(3, '0')}`,
      photo: {
        filename: photoPath.split('/').pop()!,
        timestamp: new Date().toISOString(),
        gps
      },
      audio: {
        filename: audioPath.split('/').pop()!,
        duration: recordingDuration,
        hasContent: audioUri !== null,
        segments: ['original']
      }
    },
    projectName
  );

  // 4. Проверить предупреждение
  const shouldWarn = await MetadataManager.checkAudioWarning(projectDir);
  if (shouldWarn && !audioUri) {
    Alert.alert('Предупреждение', '5 фото подряд без аудио!');
  }

  // 5. Вернуться к главному экрану
  navigation.navigate('Main');
};
```

## Тестирование

### Unit тесты для FileManager

```typescript
import { FileManager } from './src/utils/fileManager';

describe('FileManager', () => {
  it('generates correct filename', () => {
    const filename = FileManager.generateFileName({
      object: 'ТП1',
      element: 'РУ_10кВ',
      counter: 1,
      extension: 'jpg'
    });

    expect(filename).toBe('ТП1_РУ_10кВ_001.jpg');
  });

  it('creates empty audio file', async () => {
    const path = '/tmp/test.m4a';
    await FileManager.createEmptyAudioFile(path);

    const info = await FileSystem.getInfoAsync(path);
    expect(info.exists).toBe(true);
    expect(info.size).toBeGreaterThan(0);
  });
});
```

## Советы

### Оптимизация производительности

```typescript
// Ленивая загрузка истории
const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

useEffect(() => {
  const loadRecents = async () => {
    const items = await FileManager.getRecentRecords(projectName, 10);
    setRecentItems(items);
  };

  loadRecents();
}, [projectName]); // Перезагрузить при смене проекта
```

### Обработка ошибок

```typescript
const saveWithErrorHandling = async () => {
  try {
    await FileManager.savePhotoAudioPair(/*...*/);
    Alert.alert('Успех', 'Файлы сохранены');
  } catch (error) {
    console.error('Save error:', error);
    Alert.alert('Ошибка', 'Не удалось сохранить файлы');
  }
};
```

### Вибрация для обратной связи

```typescript
import * as Haptics from 'expo-haptics';

// Лёгкая вибрация (выбор)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Средняя вибрация (действие)
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Успех
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

// Ошибка
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
```
