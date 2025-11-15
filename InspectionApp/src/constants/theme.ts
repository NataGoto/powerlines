/**
 * Тема приложения ЗиС Прогноз
 * Цветовая схема: черный + темно-красный
 */

export const colors = {
  // Основные цвета
  primary: '#000000',           // Черный
  primaryText: '#000000',       // Черный текст

  // Акцентные цвета (темно-красный)
  accent: '#8B0000',            // Темно-красный (dark red)
  accentLight: '#A52A2A',       // Коричнево-красный (brown)
  accentBright: '#DC143C',      // Малиновый (crimson)

  // Дополнительные
  white: '#FFFFFF',
  gray: '#333333',
  lightGray: '#666666',
  backgroundGray: '#F5F5F5',
  borderGray: '#DDDDDD',

  // Статусы
  success: '#2E7D32',           // Темно-зеленый
  warning: '#F57C00',           // Темно-оранжевый
  error: '#C62828',             // Темно-красный

  // Прозрачность
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export const typography = {
  // Размеры шрифтов
  title: 28,
  heading: 24,
  subheading: 20,
  body: 16,
  caption: 14,
  small: 12,

  // Веса
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const layout = {
  // Размеры кнопок
  buttonHeight: 80,
  buttonMinHeight: 60,

  // Место для логотипа
  logoHeight: 80,
  logoWidth: 80,
  logoPlaceholderColor: colors.lightGray,
};
