import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface MediaPipeLandmarks {
  landmarks: Array<{x: number, y: number, z: number}>;
  total_points: number;
  image_size: {width: number, height: number};
  confidence: number;
}

export interface MakeupConfig {
  lipstick?: {
    color: string;
    intensity: number;
    texture?: 'matte' | 'gloss' | 'metallic';
  };
  eyeshadow?: {
    color: string;
    intensity: number;
    blend_radius?: number;
  };
  blush?: {
    color: string;
    intensity: number;
    radius?: number;
  };
  eyeliner?: {
    color: string;
    thickness: number;
    style?: 'thin' | 'thick' | 'winged';
  };
  foundation?: {
    intensity: number;
    coverage?: 'light' | 'medium' | 'full';
  };
}

export interface EnhancementConfig {
  enhance_eyes?: boolean;
  enhance_nose?: boolean;
  enhance_lips?: boolean;
  skin_smoothing?: number;
  brightness?: number;
  contrast?: number;
}

export class OpenCVFaceProcessor {
  private pythonPath: string;
  private processorPath: string;

  constructor() {
    this.pythonPath = 'python3';
    this.processorPath = path.join(__dirname, 'mediapipe-face-processor.py');
  }

  async detectFaceLandmarks(imagePath: string): Promise<MediaPipeLandmarks | null> {
    try {
      console.log('🔍 بدء كشف معالم الوجه باستخدام MediaPipe...');
      
      const result = await this.runPythonScript([
        '--image', imagePath,
        '--action', 'landmarks'
      ]);

      if (!result.success) {
        console.error('❌ فشل في كشف معالم الوجه:', result.error);
        return null;
      }

      const landmarks = JSON.parse(result.output);
      console.log(`✅ تم كشف ${landmarks.total_points} نقطة معلم بدقة ${landmarks.confidence}`);
      
      return landmarks;
    } catch (error) {
      console.error('❌ خطأ في كشف معالم الوجه:', error);
      return null;
    }
  }

  async applyProfessionalMakeup(imagePath: string, makeupConfig: MakeupConfig): Promise<string | null> {
    try {
      console.log('💄 بدء تطبيق المكياج الاحترافي باستخدام MediaPipe...');
      console.log('🎨 إعدادات المكياج:', makeupConfig);
      
      const configJson = JSON.stringify(makeupConfig);
      
      const result = await this.runPythonScript([
        '--image', imagePath,
        '--action', 'makeup',
        '--config', configJson
      ]);

      if (!result.success) {
        console.error('❌ فشل في تطبيق المكياج:', result.error);
        return null;
      }

      const response = JSON.parse(result.output);
      if (response.success) {
        console.log('✅ تم تطبيق المكياج بنجاح:', response.output_path);
        return response.output_path;
      } else {
        console.error('❌ فشل في تطبيق المكياج:', response.error);
        return null;
      }
    } catch (error) {
      console.error('❌ خطأ في تطبيق المكياج:', error);
      return null;
    }
  }

  async enhanceFacialFeatures(imagePath: string, enhancementConfig: EnhancementConfig): Promise<string | null> {
    try {
      console.log('✨ بدء تحسين ملامح الوجه باستخدام MediaPipe...');
      console.log('🔧 إعدادات التحسين:', enhancementConfig);
      
      const configJson = JSON.stringify(enhancementConfig);
      
      const result = await this.runPythonScript([
        '--image', imagePath,
        '--action', 'enhance',
        '--config', configJson
      ]);

      if (!result.success) {
        console.error('❌ فشل في تحسين الملامح:', result.error);
        return null;
      }

      const response = JSON.parse(result.output);
      if (response.success) {
        console.log('✅ تم تحسين الملامح بنجاح:', response.output_path);
        return response.output_path;
      } else {
        console.error('❌ فشل في تحسين الملامح:', response.error);
        return null;
      }
    } catch (error) {
      console.error('❌ خطأ في تحسين الملامح:', error);
      return null;
    }
  }

  async createBeforeAfterComparison(
    beforePath: string, 
    afterPath: string, 
    effectName: string
  ): Promise<string | null> {
    try {
      console.log('📊 إنشاء مقارنة قبل وبعد...');
      
      // Read both images
      const beforeImage = await fs.readFile(beforePath);
      const afterImage = await fs.readFile(afterPath);
      
      const Sharp = await import('sharp');
      const sharp = Sharp.default;
      
      // Get image dimensions
      const beforeMeta = await sharp(beforeImage).metadata();
      const afterMeta = await sharp(afterImage).metadata();
      
      const width = Math.max(beforeMeta.width || 400, afterMeta.width || 400);
      const height = Math.max(beforeMeta.height || 400, afterMeta.height || 400);
      
      // Create comparison image (side by side)
      const comparisonBuffer = await sharp({
        create: {
          width: width * 2 + 40, // Space for divider
          height: height + 80, // Space for labels
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .composite([
        // Before image
        {
          input: await sharp(beforeImage).resize(width, height).toBuffer(),
          left: 0,
          top: 40
        },
        // After image
        {
          input: await sharp(afterImage).resize(width, height).toBuffer(),
          left: width + 40,
          top: 40
        },
        // Add labels using SVG
        {
          input: Buffer.from(`
            <svg width="${width * 2 + 40}" height="80">
              <text x="${width / 2}" y="25" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">قبل</text>
              <text x="${width + 40 + width / 2}" y="25" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#333">بعد</text>
              <text x="${(width * 2 + 40) / 2}" y="${height + 65}" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">${effectName}</text>
              <line x1="${width + 20}" y1="0" x2="${width + 20}" y2="${height + 80}" stroke="#ddd" stroke-width="2"/>
            </svg>
          `),
          left: 0,
          top: 0
        }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();
      
      // Save comparison image
      const timestamp = Date.now();
      const comparisonPath = path.join('uploads', `mediapipe-comparison-${timestamp}.jpg`);
      await fs.writeFile(comparisonPath, comparisonBuffer);
      
      console.log('✅ تم إنشاء المقارنة بنجاح:', comparisonPath);
      return comparisonPath;
      
    } catch (error) {
      console.error('❌ خطأ في إنشاء المقارنة:', error);
      return null;
    }
  }

  private async runPythonScript(args: string[]): Promise<{success: boolean, output: string, error?: string}> {
    return new Promise((resolve) => {
      const pythonProcess = spawn(this.pythonPath, [this.processorPath, ...args]);
      
      let output = '';
      let errorOutput = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output: output.trim() });
        } else {
          resolve({ 
            success: false, 
            output: '', 
            error: errorOutput || `Python script exited with code ${code}` 
          });
        }
      });
      
      pythonProcess.on('error', (error) => {
        resolve({ 
          success: false, 
          output: '', 
          error: `Failed to start Python script: ${error.message}` 
        });
      });
    });
  }

  async analyzeImageQuality(imagePath: string): Promise<{
    quality_score: number;
    resolution: {width: number, height: number};
    lighting_quality: number;
    blur_score: number;
    recommendations: string[];
  } | null> {
    try {
      console.log('📊 تحليل جودة الصورة...');
      
      const Sharp = await import('sharp');
      const sharp = Sharp.default;
      
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const stats = await image.stats();
      
      // Calculate quality metrics
      const resolution = {
        width: metadata.width || 0,
        height: metadata.height || 0
      };
      
      const totalPixels = resolution.width * resolution.height;
      const resolutionScore = Math.min(totalPixels / (1920 * 1080), 1) * 100;
      
      // Estimate lighting quality from brightness
      const avgBrightness = stats.channels?.[0]?.mean || 128;
      const lightingQuality = Math.max(0, 100 - Math.abs(avgBrightness - 128));
      
      // Simple blur detection (using standard deviation)
      const blurScore = Math.min((stats.channels?.[0]?.stdev || 50) / 50 * 100, 100);
      
      const qualityScore = (resolutionScore + lightingQuality + blurScore) / 3;
      
      const recommendations = [];
      if (resolutionScore < 70) recommendations.push('استخدم صورة بدقة أعلى للحصول على نتائج أفضل');
      if (lightingQuality < 60) recommendations.push('تحسين الإضاءة في الصورة');
      if (blurScore < 50) recommendations.push('تأكد من وضوح الصورة وعدم تشويشها');
      
      return {
        quality_score: Math.round(qualityScore),
        resolution,
        lighting_quality: Math.round(lightingQuality),
        blur_score: Math.round(blurScore),
        recommendations
      };
      
    } catch (error) {
      console.error('❌ خطأ في تحليل جودة الصورة:', error);
      return null;
    }
  }
}

export const opencvProcessor = new OpenCVFaceProcessor();