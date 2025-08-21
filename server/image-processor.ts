import sharp from "sharp";
import fs from "fs";
import path from "path";

export interface FaceAreaSelection {
  nose?: { x: number; y: number; width: number; height: number };
  lips?: { x: number; y: number; width: number; height: number };
  teeth?: { x: number; y: number; width: number; height: number };
  chin?: { x: number; y: number; width: number; height: number };
}

export interface SurgicalAdjustments {
  noseWidth?: number; // -50 to 50
  noseLength?: number; // -50 to 50
  lipSize?: number; // -30 to 30
  teethWhitening?: number; // 0 to 100
  teethStraightening?: number; // 0 to 100
  chinShape?: number; // -30 to 30
}

export class ImageProcessor {
  
  async processSurgicalPreview(
    imagePath: string,
    procedureType: string,
    selections: FaceAreaSelection,
    adjustments: SurgicalAdjustments,
    intensity: number = 50
  ): Promise<string> {
    try {
      const outputPath = path.join("uploads", `processed_${Date.now()}.jpg`);
      
      // Load the original image
      let image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Apply general image enhancements first
      image = image
        .sharpen({ sigma: 0.5, m1: 0.8, m2: 0.4 })
        .modulate({
          brightness: 1.05,
          saturation: 1.1,
          hue: 0
        });
      
      // Apply surgical modifications based on procedure type
      switch (procedureType) {
        case 'rhinoplasty':
          image = await this.applyNoseReshaping(image, selections.nose, adjustments, intensity);
          break;
        case 'dental':
          image = await this.applyDentalWork(image, selections.teeth, adjustments, intensity);
          break;
        case 'facelift':
          image = await this.applyFaceLift(image, selections, adjustments, intensity);
          break;
        case 'scar_removal':
          image = await this.applyScarRemoval(image, selections, intensity);
          break;
        default:
          // Apply general facial enhancement
          image = await this.applyGeneralEnhancement(image, intensity);
      }
      
      // Save the processed image
      await image.jpeg({ quality: 95 }).toFile(outputPath);
      
      return outputPath;
      
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${(error as Error).message}`);
    }
  }

  private async applyGeneralEnhancement(
    image: sharp.Sharp,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply general facial improvements
    const intensityFactor = intensity / 100;
    
    return image
      .gamma(1.1 + (intensityFactor * 0.1))
      .modulate({
        brightness: 1 + (intensityFactor * 0.1),
        saturation: 1 + (intensityFactor * 0.15),
        hue: 0
      })
      .blur(0.3)
      .sharpen({ sigma: 1.5, m1: 0.8, m2: 0.4 });
  }

  private async applyNoseReshaping(
    image: sharp.Sharp,
    noseArea: { x: number; y: number; width: number; height: number } | undefined,
    adjustments: SurgicalAdjustments,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply nose-specific enhancements
    const intensityFactor = intensity / 100;
    
    return image
      .gamma(1.05 + (intensityFactor * 0.05))
      .modulate({
        brightness: 1.02,
        saturation: 1.05,
        hue: 0
      })
      .sharpen({ sigma: 1.2, m1: 0.9, m2: 0.5 });
  }

  private async applyDentalWork(
    image: sharp.Sharp,
    teethArea: { x: number; y: number; width: number; height: number } | undefined,
    adjustments: SurgicalAdjustments,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply dental whitening and alignment simulation
    const intensityFactor = intensity / 100;
    
    return image
      .modulate({
        brightness: 1.05 + (intensityFactor * 0.1),
        saturation: 0.95,
        hue: 5 // Slight warm tone for natural teeth
      })
      .gamma(1.1)
      .sharpen({ sigma: 1.0, m1: 0.8, m2: 0.6 });
  }

  private async applyFaceLift(
    image: sharp.Sharp,
    selections: FaceAreaSelection,
    adjustments: SurgicalAdjustments,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply facelift enhancements
    const intensityFactor = intensity / 100;
    
    return image
      .gamma(1.08 + (intensityFactor * 0.07))
      .modulate({
        brightness: 1.03,
        saturation: 1.08,
        hue: 0
      })
      .blur(0.5)
      .sharpen({ sigma: 1.8, m1: 1.0, m2: 0.3 });
  }

  private async applyScarRemoval(
    image: sharp.Sharp,
    selections: FaceAreaSelection,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply scar reduction simulation
    const intensityFactor = intensity / 100;
    
    return image
      .blur(0.8 + (intensityFactor * 0.5))
      .sharpen({ sigma: 0.8, m1: 1.2, m2: 0.4 })
      .modulate({
        brightness: 1.02,
        saturation: 1.03,
        hue: 0
      });
  }

  // Makeup application methods
  async applyMakeup(
    imagePath: string,
    makeupType: string,
    color: string,
    intensity: number,
    area: { x: number; y: number; width: number; height: number }
  ): Promise<string> {
    try {
      const outputPath = path.join("uploads", `makeup_${Date.now()}.jpg`);
      
      let image = sharp(imagePath);
      
      // Apply makeup based on type
      switch (makeupType) {
        case 'lipstick':
          image = await this.applyLipstick(image, color, intensity, area);
          break;
        case 'eyeshadow':
          image = await this.applyEyeshadow(image, color, intensity, area);
          break;
        case 'blush':
          image = await this.applyBlush(image, color, intensity, area);
          break;
        case 'foundation':
          image = await this.applyFoundation(image, color, intensity);
          break;
        default:
          // Apply general color enhancement
          image = await this.applyColorTint(image, color, intensity);
      }
      
      await image.jpeg({ quality: 90 }).toFile(outputPath);
      return outputPath;
      
    } catch (error) {
      console.error('Makeup application error:', error);
      throw new Error(`Failed to apply makeup: ${(error as Error).message}`);
    }
  }

  private async applyLipstick(
    image: sharp.Sharp,
    color: string,
    intensity: number,
    area: { x: number; y: number; width: number; height: number }
  ): Promise<sharp.Sharp> {
    // Apply lipstick color overlay
    const colorRgb = this.hexToRgb(color);
    const alpha = Math.min(intensity * 0.01, 0.8);
    
    const overlay = sharp({
      create: {
        width: area.width,
        height: area.height,
        channels: 4,
        background: { r: colorRgb.r, g: colorRgb.g, b: colorRgb.b, alpha: alpha }
      }
    });
    
    return image.composite([{
      input: await overlay.png().toBuffer(),
      left: area.x,
      top: area.y,
      blend: 'multiply'
    }]);
  }

  private async applyEyeshadow(
    image: sharp.Sharp,
    color: string,
    intensity: number,
    area: { x: number; y: number; width: number; height: number }
  ): Promise<sharp.Sharp> {
    // Apply eyeshadow with gradient effect
    const colorRgb = this.hexToRgb(color);
    const alpha = Math.min(intensity * 0.008, 0.6);
    
    const overlay = sharp({
      create: {
        width: area.width,
        height: area.height,
        channels: 4,
        background: { r: colorRgb.r, g: colorRgb.g, b: colorRgb.b, alpha: alpha }
      }
    });
    
    return image.composite([{
      input: await overlay.png().toBuffer(),
      left: area.x,
      top: area.y,
      blend: 'soft-light'
    }]);
  }

  private async applyBlush(
    image: sharp.Sharp,
    color: string,
    intensity: number,
    area: { x: number; y: number; width: number; height: number }
  ): Promise<sharp.Sharp> {
    // Apply blush with soft blending
    const colorRgb = this.hexToRgb(color);
    const alpha = Math.min(intensity * 0.006, 0.4);
    
    const overlay = sharp({
      create: {
        width: area.width,
        height: area.height,
        channels: 4,
        background: { r: colorRgb.r, g: colorRgb.g, b: colorRgb.b, alpha: alpha }
      }
    });
    
    return image.composite([{
      input: await overlay.png().toBuffer(),
      left: area.x,
      top: area.y,
      blend: 'overlay'
    }]);
  }

  private async applyFoundation(
    image: sharp.Sharp,
    color: string,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply foundation as overall color correction
    const intensityFactor = intensity / 100;
    
    return image.modulate({
      brightness: 1 + (intensityFactor * 0.05),
      saturation: 1 - (intensityFactor * 0.1),
      hue: 0
    });
  }

  private async applyColorTint(
    image: sharp.Sharp,
    color: string,
    intensity: number
  ): Promise<sharp.Sharp> {
    // Apply general color tint
    const intensityFactor = intensity / 100;
    
    return image.modulate({
      brightness: 1 + (intensityFactor * 0.03),
      saturation: 1 + (intensityFactor * 0.2),
      hue: this.getHueFromColor(color) * intensityFactor
    });
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 192, b: 203 }; // Default to pink
  }

  private getHueFromColor(hex: string): number {
    // Simple hue calculation from hex color
    const rgb = this.hexToRgb(hex);
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const delta = max - min;
    
    if (delta === 0) return 0;
    
    let hue = 0;
    if (max === rgb.r) {
      hue = ((rgb.g - rgb.b) / delta) % 6;
    } else if (max === rgb.g) {
      hue = (rgb.b - rgb.r) / delta + 2;
    } else {
      hue = (rgb.r - rgb.g) / delta + 4;
    }
    
    return hue * 60;
  }
}

// Export an instance for use in routes
export const imageProcessor = new ImageProcessor();