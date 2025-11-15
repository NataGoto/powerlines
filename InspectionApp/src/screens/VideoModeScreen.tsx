/**
 * Экран видеорежимов
 * TODO: Реализовать круговой обход, сферическую съемку, произвольную
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'VideoMode'>;

export default function VideoModeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Видеорежимы</Text>

      <TouchableOpacity style={styles.modeButton}>
        <Text style={styles.modeIcon}>🔄</Text>
        <Text style={styles.modeTitle}>Круговой обход (360°)</Text>
        <Text style={styles.modeDescription}>
          Съемка по кругу с подсказками и автостопом
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modeButton}>
        <Text style={styles.modeIcon}>🌐</Text>
        <Text style={styles.modeTitle}>Сферическая съемка</Text>
        <Text style={styles.modeDescription}>
          360° + потолок + пол (управляемый режим)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.modeButton}>
        <Text style={styles.modeIcon}>🎥</Text>
        <Text style={styles.modeTitle}>Произвольная съемка</Text>
        <Text style={styles.modeDescription}>
          Свободный режим без ограничений
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>

      <Text style={styles.comingSoon}>
        В разработке...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  modeButton: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    marginTop: 30,
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  comingSoon: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 20,
  },
});
