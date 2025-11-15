# InspectionApp - Краткое резюме

## Что это?

React Native приложение для документирования объектов при обследовании с **обязательными парными файлами** (фото + аудио).

## Ключевая фича

**Каждое фото ВСЕГДА имеет парный аудиофайл** - даже если комментарий пропущен, создается пустой `.m4a` файл.

## Основной поток

```
Главный экран → Камера → Аудиозапись → Сохранение пары → Главный экран
     ↓              ↓           ↓              ↓
  Объект+Элемент   Фото    Запись/Пропуск   JPG + M4A
```

## Структура файлов

```
Объект_Элемент_001.jpg  ← Фото
Объект_Элемент_001.m4a  ← Аудио (ВСЕГДА есть!)
```

## Быстрый старт

```bash
cd InspectionApp
npm install
npx expo start
# Сканируйте QR в Expo Go
```

## Что реализовано ✓

- [x] Фото с автопереходом к аудио
- [x] Аудиозапись (удержание кнопки)
- [x] Пропуск аудио (создает пустой файл)
- [x] **Атомарное сохранение пары файлов**
- [x] Автоинкремент счетчика
- [x] GPS метаданные
- [x] Предупреждение при >5 пропусков подряд
- [x] История последних записей

## Критичные файлы

| Файл | Назначение |
|------|-----------|
| `App.tsx` | Навигация |
| `src/screens/MainScreen.tsx` | Ввод объект/элемент |
| `src/screens/PhotoCameraScreen.tsx` | Камера |
| `src/screens/AudioRecordingScreen.tsx` | **Аудио (КРИТИЧНО!)** |
| `src/utils/fileManager.ts` | **Атомарное сохранение** |
| `src/utils/metadata.ts` | Метаданные + GPS |

## Технологии

- React Native (Expo SDK 50)
- TypeScript
- expo-camera, expo-av, expo-location
- React Navigation

## Структура хранения

```
/storage/emulated/0/Documents/InspectionApp/
└── [Проект]/
    └── [Дата]/
        ├── Объект_Элемент_001.jpg
        ├── Объект_Элемент_001.m4a
        └── session_metadata.json
```

## Метаданные (JSON)

```json
{
  "session": {
    "date": "2024-03-15",
    "project": "Проект_1"
  },
  "records": [
    {
      "id": "ТП1_РУ_001",
      "photo": {
        "filename": "ТП1_РУ_001.jpg",
        "gps": { "latitude": 55.7558, "longitude": 37.6173 }
      },
      "audio": {
        "filename": "ТП1_РУ_001.m4a",
        "duration": 45.5,
        "hasContent": true
      }
    }
  ]
}
```

## API - Основные функции

### FileManager

```typescript
// Генерация имени
FileManager.generateFileName({ object, element, counter, extension })

// АТОМАРНОЕ сохранение
FileManager.savePhotoAudioPair(photoUri, audioUri, object, element, counter, project)

// Следующий счетчик
FileManager.getNextCounter(object, element, project)
```

### MetadataManager

```typescript
// GPS координаты
MetadataManager.getCurrentLocation()

// Добавить запись
MetadataManager.addRecord(dir, record, project)

// Проверить предупреждение
MetadataManager.checkAudioWarning(dir)
```

## UI особенности

- Крупные кнопки (80dp+)
- Высокий контраст
- Вибрация для обратной связи
- Автофокус на полях ввода
- История быстрого выбора

## Сборка APK

```bash
npm install -g eas-cli
eas build --platform android --local
```

## Troubleshooting

| Проблема | Решение |
|----------|---------|
| Камера не работает | Проверить разрешения в настройках |
| Аудио не записывается | Держать кнопку, не просто нажать |
| GPS не определяется | Выйти на улицу, включить GPS |

## Документация

- `README.md` - полная документация
- `QUICKSTART.md` - быстрый старт за 5 минут
- `EXAMPLES.md` - примеры использования API
- `SUMMARY.md` - этот файл (краткое резюме)

## Что в разработке

- [ ] Видеорежимы (360°, сферический)
- [ ] Режим серии
- [ ] Экспорт ZIP
- [ ] WiFi-передача

## Статус

✓ **MVP готов к использованию**

Основной поток (фото → аудио → сохранение) полностью реализован и протестирован.

## Контакты

Создано для проекта обследования инженерных сетей.
