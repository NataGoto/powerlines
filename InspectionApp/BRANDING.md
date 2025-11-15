# Брендинг ЗиС Прогноз

## Цветовая схема

### Основные цвета

- **Черный** (#000000) - основной цвет
  - Заголовки
  - Основной текст
  - Кнопка "ФОТО"

- **Темно-красный** (#8B0000) - акцентный цвет
  - Подзаголовок "платформа обследователя"
  - Кнопка "ВИДЕО"
  - Акценты в элементах истории (левая граница)

### Дополнительные оттенки

- **Коричнево-красный** (#A52A2A) - светлый акцент
- **Малиновый** (#DC143C) - яркий акцент

## Логотип

### Placeholder

```tsx
<View style={styles.logoPlaceholder}>
  <Text style={styles.logoText}>ЛОГО</Text>
</View>
```

### Когда добавите изображение:

```tsx
<Image
  source={require('../../assets/logo.png')}
  style={styles.logo}
/>
```

### Размеры логотипа

- Ширина: 80px
- Высота: 80px
- Формат: PNG с прозрачностью (рекомендуется)

### Расположение файла

```
InspectionApp/
  └── assets/
      └── logo.png  ← Положите логотип сюда
```

## Брендинг на экранах

### Главный экран

```
┌─────────────────────┐
│     [ЛОГОТИП]       │
│                     │
│   ЗиС Прогноз       │ ← Черный, жирный
│ платформа обследова │ ← Темно-красный
│ теля                │
└─────────────────────┘
```

### Стиль текста

**Заголовок "ЗиС Прогноз":**
- Размер: 24pt
- Цвет: #000000 (черный)
- Вес: bold (700)
- Межбуквенный интервал: 1px

**Подзаголовок "платформа обследователя":**
- Размер: 14pt
- Цвет: #8B0000 (темно-красный)
- Вес: medium (500)

## Кнопки

### Фото (черная)
```css
background: #000000
color: #FFFFFF
```

### Видео (темно-красная)
```css
background: #8B0000
color: #FFFFFF
```

## Акценты

### История записей

Левая граница карточек:
```css
border-left: 3px solid #8B0000
```

## CSS переменные (для темы)

```typescript
export const colors = {
  primary: '#000000',        // Черный
  accent: '#8B0000',         // Темно-красный
  accentLight: '#A52A2A',    // Коричнево-красный
  accentBright: '#DC143C',   // Малиновый
  white: '#FFFFFF',
  gray: '#333333',
  lightGray: '#666666',
  backgroundGray: '#F5F5F5',
  borderGray: '#DDDDDD',
};
```

## Использование в коде

```tsx
import { colors } from '../constants/theme';

<Text style={{ color: colors.primary }}>
  Черный текст
</Text>

<Text style={{ color: colors.accent }}>
  Темно-красный текст
</Text>

<View style={{ backgroundColor: colors.primary }}>
  Черный фон
</View>

<View style={{ backgroundColor: colors.accent }}>
  Темно-красный фон
</View>
```

## Примеры элементов

### Карточка с акцентом

```tsx
<View style={{
  backgroundColor: '#FFFFFF',
  borderLeftWidth: 3,
  borderLeftColor: colors.accent,  // Темно-красный
  padding: 16,
}}>
  <Text style={{ color: colors.primary }}>Текст</Text>
</View>
```

### Кнопка с темным фоном

```tsx
<TouchableOpacity style={{
  backgroundColor: colors.primary,  // Черный
  padding: 20,
  borderRadius: 12,
}}>
  <Text style={{ color: colors.white }}>ДЕЙСТВИЕ</Text>
</TouchableOpacity>
```

### Кнопка с красным акцентом

```tsx
<TouchableOpacity style={{
  backgroundColor: colors.accent,  // Темно-красный
  padding: 20,
  borderRadius: 12,
}}>
  <Text style={{ color: colors.white }}>ВИДЕО</Text>
</TouchableOpacity>
```

## Рекомендации

1. **Основной текст** - всегда черный (#000000 или #333333)
2. **Акценты** - темно-красный (#8B0000) для важных элементов
3. **Кнопки действий** - черная для основного, красная для дополнительного
4. **Фон** - светло-серый (#F5F5F5) для контраста
5. **Карточки** - белые с тонкой красной границей слева

## Файлы темы

- `src/constants/theme.ts` - основные константы
- `src/screens/MainScreen.tsx` - пример использования
- `BRANDING.md` - этот файл (документация)
