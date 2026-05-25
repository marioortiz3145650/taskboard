import { NativeModules, Platform } from 'react-native';

const { CameraModule } = NativeModules;

export interface PhotoResult {
  uri: string;
  fileName?: string;
  width?: number;
  height?: number;
}

export const takePhotoNative = async (): Promise<PhotoResult | null> => {
  if (!CameraModule) {
    throw new Error('CameraModule no está disponible. Ejecuta: npx expo run:android');
  }

  try {
    const result = await CameraModule.takePicture();
    return result;
  } catch (error: any) {
    if (error.code === 'CANCELLED' || error.message?.includes('cancel')) {
      return null; 
    }
    console.error('Error tomando foto nativa:', error);
    throw error;
  }
};