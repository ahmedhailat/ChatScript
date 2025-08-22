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

const { width } = Dimensions.get('window');

interface Mobile3DModelingProps {
  serverUrl: string;
}

export default function Mobile3DModeling({ serverUrl }: Mobile3DModelingProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelType, setModelType] = useState('wireframe');
  const [viewAngle, setViewAngle] = useState('front');

  const modelTypes = [
    { id: 'wireframe', name: 'إطار سلكي', icon: '🔲' },
    { id: 'textured', name: 'محكم', icon: '🎨' },
    { id: 'anatomical', name: 'تشريحي', icon: '⚕️' },
    { id: 'surgical', name: 'جراحي', icon: '🏥' }
  ];

  const viewAngles = [
    { id: 'front', name: 'أمامي', icon: '👤' },
    { id: 'side', name: 'جانبي', icon: '👥' },
    { id: 'three_quarter', name: 'ثلاثة أرباع', icon: '🔄' },
    { id: '360', name: 'دوراني 360', icon: '🌐' }
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
        setModelImage(null);
        setAnalysis(null);
      }
    });
  };

  const generate3DModel = async () => {
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
      
      formData.append('modelType', modelType);
      formData.append('viewAngle', viewAngle);
      formData.append('showLandmarks', 'true');
      formData.append('enhanceFeatures', 'true');
      formData.append('analysisDepth', 'detailed');

      const response = await fetch(`${serverUrl}/api/generate-3d-model`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setModelImage(`${serverUrl}${result.modelImageUrl}`);
        setAnalysis(result.analysis);
        Alert.alert('نجح', `تم إنشاء النموذج ثلاثي الأبعاد بثقة ${result.confidence}%`);
      } else {
        Alert.alert('خطأ', result.error || 'فشل في إنشاء النموذج');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في الاتصال بالخادم');
      console.error('3D modeling error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎭 النمذجة ثلاثية الأبعاد</Text>
        <Text style={styles.subtitle}>تحليل وجهك بتقنية ثلاثية الأبعاد متطورة</Text>
      </View>

      {/* Image Selection */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.selectButton} onPress={selectImage}>
          <Text style={styles.selectButtonText}>📷 اختر صورة الوجه</Text>
        </TouchableOpacity>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>الصورة الأصلية</Text>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        )}

        {modelImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>النموذج ثلاثي الأبعاد</Text>
            <Image source={{ uri: modelImage }} style={styles.image} />
          </View>
        )}
      </View>

      {/* Model Type Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نوع النموذج</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {modelTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionButton,
                modelType === type.id && styles.selectedOptionButton
              ]}
              onPress={() => setModelType(type.id)}
            >
              <Text style={styles.optionIcon}>{type.icon}</Text>
              <Text style={[
                styles.optionText,
                modelType === type.id && styles.selectedOptionText
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* View Angle Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>زاوية العرض</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {viewAngles.map((angle) => (
            <TouchableOpacity
              key={angle.id}
              style={[
                styles.optionButton,
                viewAngle === angle.id && styles.selectedOptionButton
              ]}
              onPress={() => setViewAngle(angle.id)}
            >
              <Text style={styles.optionIcon}>{angle.icon}</Text>
              <Text style={[
                styles.optionText,
                viewAngle === angle.id && styles.selectedOptionText
              ]}>
                {angle.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, (!selectedImage || isProcessing) && styles.disabledButton]}
        onPress={generate3DModel}
        disabled={!selectedImage || isProcessing}
      >
        <Text style={styles.generateButtonText}>
          {isProcessing ? '⏳ جاري إنشاء النموذج...' : '🎭 إنشاء النموذج ثلاثي الأبعاد'}
        </Text>
      </TouchableOpacity>

      {/* Analysis Results */}
      {analysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.sectionTitle}>نتائج التحليل</Text>
          
          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>شكل الوجه</Text>
            <Text style={styles.analysisValue}>{analysis.faceShape}</Text>
          </View>

          <View style={styles.analysisCard}>
            <Text style={styles.analysisTitle}>درجة التماثل</Text>
            <Text style={styles.analysisValue}>{analysis.symmetryScore}%</Text>
          </View>

          {analysis.recommendations && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>التوصيات</Text>
              {analysis.recommendations.map((recommendation: string, index: number) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationText}>• {recommendation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Features Info */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>ميزات النمذجة ثلاثية الأبعاد</Text>
        <View style={styles.featuresList}>
          <Text style={styles.featureItem}>🎯 تحليل 68+ نقطة مرجعية</Text>
          <Text style={styles.featureItem}>📐 حساب النسب الذهبية</Text>
          <Text style={styles.featureItem}>⚖️ تقييم التماثل الوجهي</Text>
          <Text style={styles.featureItem}>🏥 تخطيط طبي احترافي</Text>
          <Text style={styles.featureItem}>📊 تقارير مفصلة</Text>
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
    backgroundColor: '#3b82f6',
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
    color: '#dbeafe',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
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
  optionButton: {
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
  selectedOptionButton: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  generateButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  analysisSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  analysisCard: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  analysisValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  recommendationsSection: {
    marginTop: 20,
  },
  recommendationItem: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'right',
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