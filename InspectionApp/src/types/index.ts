/**
 * Типы данных для приложения инспекций
 */

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

export interface PhotoRecord {
  filename: string;
  timestamp: string;
  gps?: GPSCoordinates;
}

export interface AudioRecord {
  filename: string;
  duration: number;
  hasContent: boolean;
  segments: string[];
}

export interface InspectionRecord {
  id: string;
  photo: PhotoRecord;
  audio: AudioRecord;
}

export interface SessionMetadata {
  session: {
    date: string;
    startTime: string;
    project: string;
  };
  records: InspectionRecord[];
}

export interface RecentItem {
  filename: string;
  hasAudio: boolean;
  audioDuration: number;
  timestamp: string;
}

export type VideoMode = 'circular' | 'sphere' | 'custom';

export interface VideoModeConfig {
  circular: {
    guide: string;
    showArrows: boolean;
    autoStop: boolean;
  };
  sphere: {
    stages: string[];
    guidedMode: boolean;
  };
  custom: {
    freeForm: boolean;
  };
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  startTime?: number;
}

export interface FileNamingParams {
  object: string;
  element: string;
  counter: number;
  extension: 'jpg' | 'm4a' | 'mp4';
  videoType?: string;
}

// Навигация
export type RootStackParamList = {
  Main: undefined;
  PhotoCamera: {
    object: string;
    element: string;
    counter: number;
  };
  AudioRecording: {
    photoUri: string;
    object: string;
    element: string;
    counter: number;
  };
  VideoMode: undefined;
  History: undefined;
};
