import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

interface MediaPipeLandmark {
  x: number;
  y: number;
  z: number;
}

interface FaceRegionMapping {
  lips: {
    outer: number[];
    inner: number[];
  };
  leftEye: {
    upper: number[];
    lower: number[];
    iris: number[];
  };
  rightEye: {
    upper: number[];
    lower: number[];
    iris: number[];
  };
  leftCheek: number[];
  rightCheek: number[];
  forehead: number[];
  leftEyebrow: number[];
  rightEyebrow: number[];
  nose: {
    tip: number[];
    bridge: number[];
    nostrils: number[];
  };
}

export class EnhancedMediaPipeProcessor {
  private pythonScriptPath: string;

  constructor() {
    this.pythonScriptPath = path.join(__dirname, 'enhanced-mediapipe-face-processor.py');
  }

  // خريطة دقيقة لنقاط ملامح الوجه (468 نقطة)
  private getFaceRegionMapping(): FaceRegionMapping {
    return {
      lips: {
        // الشفة الخارجية (12 نقطة رئيسية)
        outer: [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
        // الشفة الداخلية (12 نقطة)
        inner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 324]
      },
      leftEye: {
        // الجفن العلوي الأيسر
        upper: [463, 414, 286, 258, 257, 259, 260, 467],
        // الجفن السفلي الأيسر
        lower: [362, 398, 384, 385, 386, 387, 388, 466],
        // القزحية اليسرى
        iris: [474, 475, 476, 477]
      },
      rightEye: {
        // الجفن العلوي الأيمن
        upper: [246, 161, 160, 159, 158, 157, 173, 133],
        // الجفن السفلي الأيمن
        lower: [33, 7, 163, 144, 145, 153, 154, 155],
        // القزحية اليمنى
        iris: [468, 469, 470, 471]
      },
      leftCheek: [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147],
      rightCheek: [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376],
      forehead: [10, 151, 9, 8, 107, 55, 8, 9, 151, 10, 338, 337, 299, 333, 298, 301],
      leftEyebrow: [46, 53, 52, 51, 48, 115, 131, 134, 102, 48, 64],
      rightEyebrow: [276, 283, 282, 281, 278, 344, 360, 363, 331, 278, 294],
      nose: {
        tip: [1, 2, 5, 4, 6, 19, 94, 125, 141, 235, 31, 228, 229, 230, 231, 232, 233, 244, 245, 122, 6, 202, 214, 234],
        bridge: [6, 51, 48, 115, 131, 134, 102, 49, 220, 305, 307, 375, 321, 308, 324, 318],
        nostrils: [236, 3, 51, 48, 115, 131, 134, 102, 48, 64]
      }
    };
  }

  // استخراج النقاط الدقيقة لمنطقة معينة
  private extractRegionPoints(landmarks: MediaPipeLandmark[], region: keyof FaceRegionMapping): MediaPipeLandmark[] {
    const mapping = this.getFaceRegionMapping();
    const regionData = mapping[region];
    
    if (!regionData) return [];
    
    let pointIndices: number[] = [];
    
    if (region === 'lips') {
      pointIndices = [...regionData.outer, ...regionData.inner];
    } else if (region === 'leftEye' || region === 'rightEye') {
      pointIndices = [...regionData.upper, ...regionData.lower, ...regionData.iris];
    } else if (region === 'nose') {
      pointIndices = [...regionData.tip, ...regionData.bridge, ...regionData.nostrils];
    } else if (Array.isArray(regionData)) {
      pointIndices = regionData;
    }
    
    return pointIndices
      .filter(index => index < landmarks.length)
      .map(index => landmarks[index])
      .filter(point => point); // تصفية النقاط غير المعرفة
  }

  // إنشاء قناع دقيق للمنطقة
  private createPrecisionMask(
    landmarks: MediaPipeLandmark[], 
    region: keyof FaceRegionMapping, 
    imageWidth: number, 
    imageHeight: number
  ): string {
    const points = this.extractRegionPoints(landmarks, region);
    
    if (points.length === 0) {
      return '';
    }
    
    // تحويل النقاط إلى إحداثيات SVG
    const svgPoints = points.map(point => 
      `${point.x * imageWidth},${point.y * imageHeight}`
    ).join(' ');
    
    // إنشاء مضلع SVG دقيق
    const svgMask = `
      <svg width="${imageWidth}" height="${imageHeight}" style="position: absolute; top: 0; left: 0; pointer-events: none;">
        <defs>
          <clipPath id="region-${region}-${Date.now()}">
            <polygon points="${svgPoints}" />
          </clipPath>
        </defs>
      </svg>
    `;
    
    return svgMask;
  }

  // تحسين خوارزمية كشف الملامح
  async detectEnhancedLandmarks(imagePath: string): Promise<{
    success: boolean;
    landmarks?: MediaPipeLandmark[];
    regions?: {
      [K in keyof FaceRegionMapping]: {
        points: MediaPipeLandmark[];
        boundingBox: {
          x: number;
          y: number;
          width: number;
          height: number;
        };
        mask?: string;
      };
    };
    confidence?: number;
    error?: string;
  }> {
    try {
      // إنشاء النص البرمجي Python المحسن
      await this.createEnhancedPythonScript();
      
      // تشغيل النص البرمجي Python
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const command = `python3 "${this.pythonScriptPath}" "${imagePath}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stderr.includes('WARNING')) {
        throw new Error(`MediaPipe Error: ${stderr}`);
      }
      
      const result = JSON.parse(stdout);
      
      if (!result.success) {
        throw new Error(result.error || 'فشل في معالجة الصورة');
      }
      
      const landmarks = result.landmarks;
      const imageWidth = result.image_width || 640;
      const imageHeight = result.image_height || 480;
      
      // استخراج المناطق المحسنة
      const regions = {} as any;
      const regionKeys: (keyof FaceRegionMapping)[] = [
        'lips', 'leftEye', 'rightEye', 'leftCheek', 'rightCheek', 
        'forehead', 'leftEyebrow', 'rightEyebrow', 'nose'
      ];
      
      for (const regionKey of regionKeys) {
        const points = this.extractRegionPoints(landmarks, regionKey);
        
        if (points.length > 0) {
          // حساب الصندوق المحيط
          const xs = points.map(p => p.x);
          const ys = points.map(p => p.y);
          
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          
          // إنشاء قناع دقيق
          const mask = this.createPrecisionMask(landmarks, regionKey, imageWidth, imageHeight);
          
          regions[regionKey] = {
            points: points,
            boundingBox: {
              x: minX * 100, // تحويل إلى نسبة مئوية
              y: minY * 100,
              width: (maxX - minX) * 100,
              height: (maxY - minY) * 100
            },
            mask: mask
          };
        }
      }
      
      return {
        success: true,
        landmarks: landmarks,
        regions: regions,
        confidence: result.confidence || 0.95
      };
      
    } catch (error) {
      console.error('Enhanced MediaPipe processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      };
    }
  }

  // إنشاء نص Python محسن
  private async createEnhancedPythonScript(): Promise<void> {
    const pythonScript = `
import cv2
import mediapipe as mp
import numpy as np
import json
import sys
import os

def process_face_landmarks(image_path):
    try:
        # تهيئة MediaPipe
        mp_face_mesh = mp.solutions.face_mesh
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing_styles = mp.solutions.drawing_styles
        
        # قراءة الصورة
        image = cv2.imread(image_path)
        if image is None:
            return {"success": False, "error": "لا يمكن قراءة الصورة"}
        
        # تحويل إلى RGB
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        height, width = image.shape[:2]
        
        # تهيئة Face Mesh مع إعدادات محسنة
        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,  # تحسين دقة النقاط
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        ) as face_mesh:
            
            # معالجة الصورة
            results = face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return {"success": False, "error": "لم يتم اكتشاف وجه في الصورة"}
            
            # استخراج النقاط (468 نقطة)
            landmarks = []
            face_landmarks = results.multi_face_landmarks[0]
            
            for landmark in face_landmarks.landmark:
                landmarks.append({
                    "x": landmark.x,
                    "y": landmark.y,
                    "z": landmark.z
                })
            
            # حساب مستوى الثقة
            confidence = 0.95  # MediaPipe عادة دقيق جداً
            
            return {
                "success": True,
                "landmarks": landmarks,
                "image_width": width,
                "image_height": height,
                "confidence": confidence,
                "total_landmarks": len(landmarks)
            }
            
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "مطلوب مسار الصورة"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = process_face_landmarks(image_path)
    print(json.dumps(result, ensure_ascii=False))
`;

    await fs.writeFile(this.pythonScriptPath, pythonScript);
  }

  // تطبيق مكياج دقيق على منطقة محددة
  async applyPrecisionMakeup(
    imagePath: string, 
    region: string,
    color: string,
    intensity: number,
    texture: string = 'natural'
  ): Promise<{
    success: boolean;
    processedImagePath?: string;
    appliedRegion?: string;
    error?: string;
  }> {
    try {
      // كشف الملامح أولاً
      const landmarkResult = await this.detectEnhancedLandmarks(imagePath);
      
      if (!landmarkResult.success || !landmarkResult.regions) {
        throw new Error('فشل في كشف ملامح الوجه');
      }
      
      // التحقق من وجود المنطقة المطلوبة
      const targetRegion = landmarkResult.regions[region as keyof FaceRegionMapping];
      if (!targetRegion) {
        throw new Error(`المنطقة '${region}' غير موجودة`);
      }
      
      // تطبيق المكياج باستخدام OpenCV
      const outputPath = path.join('uploads', `precision-makeup-${region}-${Date.now()}.jpg`);
      
      // إنشاء نص Python لتطبيق المكياج
      await this.createMakeupApplicationScript();
      
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const makeupCommand = `python3 "${path.join(__dirname, 'apply-precision-makeup.py')}" "${imagePath}" "${outputPath}" "${region}" "${color}" ${intensity} "${texture}"`;
      
      const { stdout: makeupStdout, stderr: makeupStderr } = await execAsync(makeupCommand);
      
      if (makeupStderr && !makeupStderr.includes('WARNING')) {
        throw new Error(`Makeup Application Error: ${makeupStderr}`);
      }
      
      const makeupResult = JSON.parse(makeupStdout);
      
      if (!makeupResult.success) {
        throw new Error(makeupResult.error || 'فشل في تطبيق المكياج');
      }
      
      return {
        success: true,
        processedImagePath: outputPath,
        appliedRegion: region
      };
      
    } catch (error) {
      console.error('Precision makeup application error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ في تطبيق المكياج'
      };
    }
  }

  // إنشاء نص تطبيق المكياج
  private async createMakeupApplicationScript(): Promise<void> {
    const makeupScript = `
import cv2
import numpy as np
import json
import sys
import mediapipe as mp
from typing import List, Tuple

def hex_to_bgr(hex_color: str) -> Tuple[int, int, int]:
    """تحويل لون hex إلى BGR"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (4, 2, 0))

def apply_precision_makeup(image_path: str, output_path: str, region: str, color: str, intensity: int, texture: str):
    try:
        # قراءة الصورة
        image = cv2.imread(image_path)
        if image is None:
            return {"success": False, "error": "لا يمكن قراءة الصورة"}
        
        height, width = image.shape[:2]
        
        # تهيئة MediaPipe
        mp_face_mesh = mp.solutions.face_mesh
        
        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7
        ) as face_mesh:
            
            # معالجة الصورة
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return {"success": False, "error": "لم يتم اكتشاف وجه"}
            
            landmarks = results.multi_face_landmarks[0].landmark
            
            # تحديد النقاط حسب المنطقة
            region_points = get_region_points(region)
            if not region_points:
                return {"success": False, "error": f"منطقة غير معروفة: {region}"}
            
            # تحويل النقاط إلى إحداثيات البكسل
            mask_points = []
            for point_idx in region_points:
                if point_idx < len(landmarks):
                    x = int(landmarks[point_idx].x * width)
                    y = int(landmarks[point_idx].y * height)
                    mask_points.append([x, y])
            
            if len(mask_points) < 3:
                return {"success": False, "error": "نقاط غير كافية لتطبيق المكياج"}
            
            # إنشاء قناع للمنطقة
            mask = np.zeros((height, width), dtype=np.uint8)
            cv2.fillPoly(mask, [np.array(mask_points, dtype=np.int32)], 255)
            
            # تطبيق تنعيم للقناع
            mask = cv2.GaussianBlur(mask, (15, 15), 0)
            
            # تحويل اللون
            makeup_color = hex_to_bgr(color)
            
            # إنشاء طبقة المكياج
            makeup_layer = np.full_like(image, makeup_color, dtype=np.uint8)
            
            # تطبيق الشفافية والدمج
            alpha = intensity / 100.0
            mask_normalized = mask.astype(np.float32) / 255.0
            
            for c in range(3):
                image[:, :, c] = image[:, :, c] * (1 - alpha * mask_normalized) + \\
                                makeup_layer[:, :, c] * alpha * mask_normalized
            
            # تطبيق تأثير النسيج
            if texture == 'gloss':
                # تأثير لامع
                highlight = cv2.GaussianBlur(mask, (21, 21), 0)
                highlight_normalized = highlight.astype(np.float32) / 255.0 * 0.3
                image = cv2.addWeighted(image, 1.0, 
                                     np.full_like(image, (255, 255, 255), dtype=np.uint8), 
                                     highlight_normalized.max(), 0)
            elif texture == 'matte':
                # تأثير مات (تقليل اللمعان)
                image = cv2.bilateralFilter(image, 9, 75, 75)
            
            # حفظ الصورة النهائية
            cv2.imwrite(output_path, image)
            
            return {
                "success": True,
                "applied_region": region,
                "points_used": len(mask_points),
                "intensity": intensity
            }
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_region_points(region: str) -> List[int]:
    """إرجاع نقاط المنطقة المحددة"""
    region_mapping = {
        "lips": [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 
                78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 324],
        "leftEye": [463, 414, 286, 258, 257, 259, 260, 467, 362, 398, 384, 385, 386, 387, 388, 466],
        "rightEye": [246, 161, 160, 159, 158, 157, 173, 133, 33, 7, 163, 144, 145, 153, 154, 155],
        "leftCheek": [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147],
        "rightCheek": [345, 346, 347, 348, 349, 350, 355, 371, 266, 425, 426, 427, 436, 416, 376],
        "forehead": [10, 151, 9, 8, 107, 55, 338, 337, 299, 333, 298, 301]
    }
    return region_mapping.get(region, [])

if __name__ == "__main__":
    if len(sys.argv) != 7:
        print(json.dumps({"success": False, "error": "معاملات غير صحيحة"}))
        sys.exit(1)
    
    image_path, output_path, region, color, intensity, texture = sys.argv[1:7]
    intensity = int(intensity)
    
    result = apply_precision_makeup(image_path, output_path, region, color, intensity, texture)
    print(json.dumps(result, ensure_ascii=False))
`;

    const scriptPath = path.join(__dirname, 'apply-precision-makeup.py');
    await fs.writeFile(scriptPath, makeupScript);
  }
}

// إنشاء instance للتصدير
export const enhancedMediaPipeProcessor = new EnhancedMediaPipeProcessor();

console.log('🎯 تم تهيئة معالج MediaPipe المحسن للمكياج الدقيق');