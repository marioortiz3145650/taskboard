import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';

export default function DocumentCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  const [photo, setPhoto] = useState<string | null>(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          Necesitamos permisos para usar la cámara
        </Text>

        <Pressable
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Dar permisos
          </Text>
        </Pressable>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    const result = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    setPhoto(result.uri);
  };

  return (
    <View style={{ flex: 1 }}>
      {photo ? (
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: photo }}
            style={{ flex: 1 }}
          />

          <Pressable
            style={styles.button}
            onPress={() => setPhoto(null)}
          >
            <Text style={styles.buttonText}>
              Tomar otra
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
          />

          <View style={styles.captureContainer}>
            <Pressable
              style={styles.captureButton}
              onPress={takePhoto}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#090D16',
    padding: 20,
  },

  text: {
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },

  button: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  captureContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },

  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 6,
    borderColor: '#2563EB',
  },
});