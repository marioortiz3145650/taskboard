import { NativeModules, Platform, PermissionsAndroid } from 'react-native';

const { CameraModule } = NativeModules;

export interface PhotoResult {
  uri: string;
  fileName?: string;
  width?: number;
  height?: number;
}

export const takePhotoNative = async (): Promise<PhotoResult | null> => {
  console.log('CameraModule disponible:', !!CameraModule);
  console.log('CameraModule:', CameraModule);
  
  if (!CameraModule) {
    throw new Error('CameraModule no está disponible.');
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Permiso de Cámara',
        message: 'TaskBoard necesita acceso a tu cámara para adjuntar fotos.',
        buttonPositive: 'Permitir',
        buttonNegative: 'Cancelar',
      }
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      throw new Error('Permiso de cámara denegado');
    }
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