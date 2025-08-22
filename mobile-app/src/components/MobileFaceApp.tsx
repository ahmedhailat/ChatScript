import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

interface MobileFaceAppProps {
  serverUrl: string;
}

export default function MobileFaceApp({ serverUrl }: MobileFaceAppProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('makeup');

  const effects = [
    { id: 'makeup', name: 'مكياج احترافي', icon: '💄' },
    { id: 'age', name: 'تغيير العمر', icon: '⏰' },
    { id: 'gender', name: 'تغيير الجنس', icon: '👥' },
    { id: 'beauty', name: 'تجميل الوجه', icon: '✨' },
    { id: '3d', name: 'نموذج ثلاثي الأبعاد', icon: '🎭' }
  ];

  const selectImage = () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri!);
        setProcessedImage(null);
      }
    });
  };

  const processImage = async () => {
    if (!selectedImage) {
      Alert.alert('تنبيه', 'يرجى اختيار صورة أولاً');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);
      
      formData.append('effect', selectedEffect);
      formData.append('intensity', '70');

      const response = await fetch(`${serverUrl}/api/faceapp/process`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setProcessedImage(`${serverUrl}${result.processedImageUrl}`);
        Alert.alert('نجح', 'تم تطبيق التأثير بنجاح!');
      } else {
        Alert.alert('خطأ', result.error || 'فشل في معالجة الصورة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في الاتصال بالخادم');
      console.error('Processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎭 MedVision AI Studio</Text>
        <Text style={styles.subtitle}>استوديو تحرير الوجه المتقدم</Text>
      </View>

      {/* Image Selection */}
      <View style={styles.imageSection}>
        <TouchableOpacity style={styles.selectButton} onPress={selectImage}>
          <Text style={styles.selectButtonText}>📷 اختر صورة</Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>الصورة الأصلية</Text>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        )}

        {processedImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>النتيجة</Text>
            <Image source={{ uri: processedImage }} style={styles.image} />
          </View>
        )}
      </View>

      {/* Effects Selection */}
      <View style={styles.effectsSection}>
        <Text style={styles.sectionTitle}>اختر التأثير</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {effects.map((effect) => (
            <TouchableOpacity
              key={effect.id}
              style={[
                styles.effectButton,
                selectedEffect === effect.id && styles.selectedEffectButton
              ]}
              onPress={() => setSelectedEffect(effect.id)}
            >
              <Text style={styles.effectIcon}>{effect.icon}</Text>
              <Text style={[
                styles.effectText,
                selectedEffect === effect.id && styles.selectedEffectText
              ]}>
                {effect.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Process Button */}
      <TouchableOpacity
        style={[styles.processButton, (!selectedImage || isProcessing) && styles.disabledButton]}
        onPress={processImage}
        disabled={!selectedImage || isProcessing}
      >
        <Text style={styles.processButtonText}>
          {isProcessing ? '⏳ جاري المعالجة...' : '✨ تطبيق التأثير'}
        </Text>
      </TouchableOpacity>

      {/* Features List */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>المميزات المتاحة</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>✅ مكياج احترافي بدقة 98.3%</Text>
          <Text style={styles.featureItem}>✅ تغيير العمر بدقة عالية</Text>
          <Text style={styles.featureItem}>✅ تحويل الجنس طبيعي</Text>
          <Text style={styles.featureItem}>✅ نمذجة ثلاثية الأبعاد</Text>
          <Text style={styles.featureItem}>✅ تواصل طبي آمن</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#6366f1',
    borderRadius: 15,
    marginHorizontal: -10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  imageSection: {
    marginBottom: 30,
  },
  selectButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: width - 60,
    height: (width - 60) * 1.2,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  effectsSection: {
    marginBottom: 30,
  },
  effectButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  selectedEffectButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  effectIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  effectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedEffectText: {
    color: '#ffffff',
  },
  processButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
    paddingVertical: 5,
  },
});