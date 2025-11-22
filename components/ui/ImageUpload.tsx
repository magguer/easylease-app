import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X } from '@tamagui/lucide-icons';
import { api } from '@/lib/api';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

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
        await uploadImages(result.assets);
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
        await uploadImages(result.assets);
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

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={uploading}
        >
          <ImageIcon size={20} color="#4D7EA8" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Camera size={20} color="#4D7EA8" />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {uploading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#4D7EA8" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <X size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F4F8',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D9E2',
  },
  buttonText: {
    color: '#4D7EA8',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  imageList: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
});
