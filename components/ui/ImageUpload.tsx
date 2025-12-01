import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView, LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { Camera, Image as ImageIcon, X, Move } from '@tamagui/lucide-icons';
import { api } from '@/lib/api';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 64) / 3; // 3 columns with padding
const GAP = 8;

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  uploadImmediately?: boolean;
}

export default function ImageUpload({ images, onImagesChange, uploadImmediately = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newImages = [...images];
    const [movedItem] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedItem);
    onImagesChange(newImages);
  };

  const pickImage = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        if (uploadImmediately) {
          await uploadImages(result.assets);
        } else {
          // Just store local URIs without uploading
          const localUris = result.assets.map(asset => asset.uri);
          onImagesChange([...images, ...localUris]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (uploadImmediately) {
          await uploadImages(result.assets);
        } else {
          // Just store local URI without uploading
          const localUri = result.assets[0].uri;
          onImagesChange([...images, localUri]);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const uploadImages = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      
      assets.forEach((asset, index) => {
        const fileName = asset.uri.split('/').pop() || `image-${Date.now()}-${index}.jpg`;
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : `image`;

        // @ts-ignore - React Native FormData expects specific object structure
        formData.append('images', {
          uri: asset.uri,
          name: fileName,
          type,
        });
      });

      formData.append('folder', 'listings');

      const response = await api.listings.uploadImages(formData);
      
      if (response.success && response.data.uploadedUrls) {
        onImagesChange([...images, ...response.data.uploadedUrls]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      Alert.alert('Error', 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  };

  const onLongPress = (index: number) => ({ nativeEvent }: any) => {
    if (nativeEvent.state === State.ACTIVE) {
      setActiveIndex(index);
    }
  };

  const renderImage = (item: string, index: number) => {
    const isActive = activeIndex === index;
    const row = Math.floor(index / 3);
    const col = index % 3;

    return (
      <LongPressGestureHandler
        key={`image-${index}`}
        onHandlerStateChange={onLongPress(index)}
        minDurationMs={500}
      >
        <Animated.View
          style={[
            styles.imageWrapper,
            { 
              marginLeft: col === 0 ? 0 : GAP,
              marginTop: row === 0 ? 0 : GAP,
            },
            isActive && styles.imageWrapperActive,
          ]}
        >
          <TouchableOpacity
            style={styles.imageContainer}
            activeOpacity={0.9}
          >
            <Image source={{ uri: item }} style={styles.image} />
            
            {/* Badge for first image */}
            {index === 0 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Principal</Text>
              </View>
            )}
            
            {/* Move arrows */}
            {isActive && (
              <View style={styles.moveControls}>
                {index > 0 && (
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => {
                      moveImage(index, index - 1);
                      setActiveIndex(index - 1);
                    }}
                  >
                    <Text style={styles.moveButtonText}>←</Text>
                  </TouchableOpacity>
                )}
                {index < images.length - 1 && (
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => {
                      moveImage(index, index + 1);
                      setActiveIndex(index + 1);
                    }}
                  >
                    <Text style={styles.moveButtonText}>→</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Drag indicator */}
            {!isActive && (
              <View style={styles.dragHandle}>
                <Move size={16} color="#FFF" />
              </View>
            )}
            
            {/* Remove button */}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <X size={16} color="#FFF" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </LongPressGestureHandler>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {images.length > 0 ? `${images.length} imagen${images.length !== 1 ? 'es' : ''}` : 'Sin imágenes'}
        </Text>
        {images.length > 0 && (
          <Text style={styles.hintText}>Mantén presionada una imagen para moverla</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={uploading}
        >
          <ImageIcon size={20} color="#5B9AA8" />
          <Text style={styles.buttonText}>Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Camera size={20} color="#5B9AA8" />
          <Text style={styles.buttonText}>Cámara</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#5B9AA8" />
          <Text style={styles.loadingText}>Subiendo imágenes...</Text>
        </View>
      )}

      {images.length > 0 && (
        <View style={styles.gridContainer}>
          {images.map((item, index) => renderImage(item, index))}
        </View>
      )}
      
      {activeIndex !== null && (
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => setActiveIndex(null)}
        >
          <Text style={styles.doneButtonText}>Listo</Text>
        </TouchableOpacity>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#272932',
    marginBottom: 4,
  },
  hintText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F9F8',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#5B9AA8',
    borderStyle: 'dashed',
  },
  buttonText: {
    color: '#5B9AA8',
    fontWeight: '600',
    fontSize: 15,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F0F9F8',
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    color: '#5B9AA8',
    fontSize: 14,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  imageWrapperActive: {
    transform: [{ scale: 1.05 }],
    zIndex: 1000,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#5B9AA8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  moveControls: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  moveButton: {
    backgroundColor: '#5B9AA8',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  moveButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
  },
  dragHandle: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  doneButton: {
    backgroundColor: '#5B9AA8',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

// Helper function to upload local images to Supabase
export async function uploadLocalImages(localUris: string[]): Promise<string[]> {
  if (localUris.length === 0) return [];

  try {
    const formData = new FormData();
    
    localUris.forEach((uri, index) => {
      // Skip if already a remote URL (starts with http)
      if (uri.startsWith('http')) {
        return;
      }

      const fileName = uri.split('/').pop() || `image-${Date.now()}-${index}.jpg`;
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : `image`;

      // @ts-ignore - React Native FormData expects specific object structure
      formData.append('images', {
        uri,
        name: fileName,
        type,
      });
    });

    formData.append('folder', 'listings');

    const response = await api.listings.uploadImages(formData);
    
    if (response.success && response.data.uploadedUrls) {
      // Combine already uploaded URLs with newly uploaded ones
      const alreadyUploadedUrls = localUris.filter(uri => uri.startsWith('http'));
      return [...alreadyUploadedUrls, ...response.data.uploadedUrls];
    }

    return [];
  } catch (error) {
    console.error('Error uploading images:', error);
    throw new Error('Failed to upload images');
  }
}
