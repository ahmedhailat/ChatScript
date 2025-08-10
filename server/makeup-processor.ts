import sharp from "sharp";
import fs from "fs";
import path from "path";

export interface MakeupOptions {
  type: 'lipstick' | 'eyeshadow' | 'blush' | 'foundation' | 'eyeliner' | 'mascara';
  color: string; // hex color
  intensity: number; // 0-100
  area: { x: number; y: number; width: number; height: number };
}

export interface MakeupBlendSettings {
  blendMode: keyof typeof BLEND_MODES;
  opacity: number;
  featherAmount: number;
}

const BLEND_MODES = {
  multiply: 'multiply',
  overlay: 'overlay',
  'soft-light': 'soft-light',
  'hard-light': 'hard-light',
  darken: 'darken',
  lighten: 'lighten',
  'color-burn': 'color-burn',
  'color-dodge': 'color-dodge'
} as const;

export class MakeupProcessor {
  
  async applyMakeup(imagePath: string, makeupOptions: MakeupOptions): Promise<string> {
    try {
      const outputPath = path.join("uploads", `makeup_${Date.now()}.jpg`);
      
      let image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // Get makeup blend settings based on type
      const blendSettings = this.getMakeupBlendSettings(makeupOptions.type);
      
      // Create makeup overlay
      const makeupOverlay = await this.createMakeupOverlay(
        makeupOptions.area,
        makeupOptions.color,
        makeupOptions.intensity,
        makeupOptions.type
      );
      
      // Apply the makeup overlay to the image
      image = image.composite([{
        input: makeupOverlay,
        left: makeupOptions.area.x,
        top: makeupOptions.area.y,
        blend: blendSettings.blendMode as any
      }]);
      
      await image.jpeg({ quality: 95 }).toFile(outputPath);
      
      return outputPath;
      
    } catch (error) {
      console.error('Makeup processing error:', error);
      throw new Error(`Failed to apply makeup: ${(error as Error).message}`);
    }
  }

  async applyMultipleMakeupEffects(
    imagePath: string, 
    makeupEffects: MakeupOptions[]
  ): Promise<string> {
    try {
      const outputPath = path.join("uploads", `fullmakeup_${Date.now()}.jpg`);
      
      let image = sharp(imagePath);
      
      // Apply each makeup effect in sequence
      for (const makeup of makeupEffects) {
        const blendSettings = this.getMakeupBlendSettings(makeup.type);
        
        const makeupOverlay = await this.createMakeupOverlay(
          makeup.area,
          makeup.color,
          makeup.intensity,
          makeup.type
        );
        
        image = image.composite([{
          input: makeupOverlay,
          left: makeup.area.x,
          top: makeup.area.y,
          blend: blendSettings.blendMode as any
        }]);
      }
      
      await image.jpeg({ quality: 95 }).toFile(outputPath);
      
      return outputPath;
      
    } catch (error) {
      console.error('Multiple makeup processing error:', error);
      throw new Error(`Failed to apply makeup effects: ${(error as Error).message}`);
    }
  }

  private getMakeupBlendSettings(makeupType: MakeupOptions['type']): MakeupBlendSettings {
    const settings: Record<MakeupOptions['type'], MakeupBlendSettings> = {
      lipstick: { blendMode: 'multiply', opacity: 0.8, featherAmount: 2 },
      eyeshadow: { blendMode: 'soft-light', opacity: 0.6, featherAmount: 3 },
      blush: { blendMode: 'soft-light', opacity: 0.4, featherAmount: 5 },
      foundation: { blendMode: 'overlay', opacity: 0.3, featherAmount: 8 },
      eyeliner: { blendMode: 'multiply', opacity: 0.9, featherAmount: 1 },
      mascara: { blendMode: 'darken', opacity: 0.7, featherAmount: 1 }
    };
    
    return settings[makeupType];
  }

  private async createMakeupOverlay(
    area: { x: number; y: number; width: number; height: number },
    color: string,
    intensity: number,
    makeupType: MakeupOptions['type']
  ): Promise<Buffer> {
    
    // Parse hex color to RGB
    const hexColor = color.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    
    // Calculate alpha based on intensity and makeup type
    const baseAlpha = this.getBaseAlpha(makeupType);
    const alpha = Math.round((intensity / 100) * baseAlpha * 255);
    
    let overlay: sharp.Sharp;
    
    switch (makeupType) {
      case 'lipstick':
        overlay = await this.createLipstickOverlay(area, r, g, b, alpha);
        break;
      case 'eyeshadow':
        overlay = await this.createEyeshadowOverlay(area, r, g, b, alpha);
        break;
      case 'blush':
        overlay = await this.createBlushOverlay(area, r, g, b, alpha);
        break;
      case 'foundation':
        overlay = await this.createFoundationOverlay(area, r, g, b, alpha);
        break;
      case 'eyeliner':
        overlay = await this.createEyelinerOverlay(area, r, g, b, alpha);
        break;
      case 'mascara':
        overlay = await this.createMascaraOverlay(area, r, g, b, alpha);
        break;
      default:
        overlay = await this.createBasicOverlay(area, r, g, b, alpha);
    }
    
    return overlay.png().toBuffer();
  }

  private getBaseAlpha(makeupType: MakeupOptions['type']): number {
    const alphaValues = {
      lipstick: 0.85,
      eyeshadow: 0.65,
      blush: 0.45,
      foundation: 0.35,
      eyeliner: 0.95,
      mascara: 0.75
    };
    
    return alphaValues[makeupType] || 0.5;
  }

  private async createLipstickOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    // Create a gradient overlay for realistic lipstick effect
    const svgGradient = `
      <svg width="${area.width}" height="${area.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lipGradient" cx="50%" cy="40%">
            <stop offset="0%" stop-color="rgba(${r+20}, ${g+10}, ${b+10}, ${alpha/255})" />
            <stop offset="70%" stop-color="rgba(${r}, ${g}, ${b}, ${alpha/255})" />
            <stop offset="100%" stop-color="rgba(${Math.max(0,r-30)}, ${Math.max(0,g-20)}, ${Math.max(0,b-20)}, ${alpha/255*0.8})" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#lipGradient)" />
      </svg>
    `;
    
    return sharp(Buffer.from(svgGradient));
  }

  private async createEyeshadowOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    // Create soft gradient for eyeshadow
    const svgGradient = `
      <svg width="${area.width}" height="${area.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="rgba(${r}, ${g}, ${b}, ${alpha/255*0.9})" />
            <stop offset="50%" stop-color="rgba(${r}, ${g}, ${b}, ${alpha/255})" />
            <stop offset="100%" stop-color="rgba(${r}, ${g}, ${b}, ${alpha/255*0.3})" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#eyeGradient)" />
      </svg>
    `;
    
    return sharp(Buffer.from(svgGradient));
  }

  private async createBlushOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    // Create circular gradient for natural blush
    const svgGradient = `
      <svg width="${area.width}" height="${area.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="blushGradient">
            <stop offset="0%" stop-color="rgba(${r}, ${g}, ${b}, ${alpha/255})" />
            <stop offset="60%" stop-color="rgba(${r}, ${g}, ${b}, ${alpha/255*0.6})" />
            <stop offset="100%" stop-color="rgba(${r}, ${g}, ${b}, 0)" />
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="50%" rx="50%" ry="40%" fill="url(#blushGradient)" />
      </svg>
    `;
    
    return sharp(Buffer.from(svgGradient));
  }

  private async createFoundationOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    return sharp({
      create: {
        width: area.width,
        height: area.height,
        channels: 4,
        background: { r, g, b, alpha }
      }
    });
  }

  private async createEyelinerOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    // Create precise line for eyeliner
    const svgLine = `
      <svg width="${area.width}" height="${area.height}" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 ${area.height/2} Q ${area.width/2} ${area.height/3} ${area.width} ${area.height/2}" 
              stroke="rgba(${r}, ${g}, ${b}, ${alpha/255})" 
              stroke-width="3" 
              fill="none" 
              stroke-linecap="round" />
      </svg>
    `;
    
    return sharp(Buffer.from(svgLine));
  }

  private async createMascaraOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    // Create texture for mascara effect
    const svgTexture = `
      <svg width="${area.width}" height="${area.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="mascaraPattern" x="0" y="0" width="4" height="8" patternUnits="userSpaceOnUse">
            <rect width="2" height="8" fill="rgba(${r}, ${g}, ${b}, ${alpha/255})" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mascaraPattern)" />
      </svg>
    `;
    
    return sharp(Buffer.from(svgTexture));
  }

  private async createBasicOverlay(
    area: { width: number; height: number },
    r: number, g: number, b: number, alpha: number
  ): Promise<sharp.Sharp> {
    
    return sharp({
      create: {
        width: area.width,
        height: area.height,
        channels: 4,
        background: { r, g, b, alpha }
      }
    });
  }

  // Age progression effects
  async applyAgeProgression(
    imagePath: string,
    targetAge: number,
    currentAge: number = 25
  ): Promise<string> {
    try {
      const outputPath = path.join("uploads", `aged_${Date.now()}.jpg`);
      
      let image = sharp(imagePath);
      const metadata = await image.metadata();
      
      const ageDifference = targetAge - currentAge;
      
      if (ageDifference > 0) {
        // Aging effects
        image = await this.applyAgingEffects(image, ageDifference);
      } else if (ageDifference < 0) {
        // Youth effects
        image = await this.applyYouthEffects(image, Math.abs(ageDifference));
      }
      
      await image.jpeg({ quality: 90 }).toFile(outputPath);
      
      return outputPath;
      
    } catch (error) {
      console.error('Age progression error:', error);
      throw new Error(`Failed to apply age progression: ${(error as Error).message}`);
    }
  }

  private async applyAgingEffects(image: sharp.Sharp, ageIncrease: number): Promise<sharp.Sharp> {
    // Apply subtle aging effects based on age increase
    const intensity = Math.min(ageIncrease / 30, 1); // Max at 30 years difference
    
    return image
      .blur(intensity * 0.5) // Slight softening
      .modulate({
        brightness: 1 - (intensity * 0.1), // Slightly darker
        saturation: 1 - (intensity * 0.2), // Less saturated
      })
      .sharpen({ sigma: 0.5 + (intensity * 0.5) }); // Re-sharpen selectively
  }

  private async applyYouthEffects(image: sharp.Sharp, ageDecrease: number): Promise<sharp.Sharp> {
    // Apply youth enhancement effects
    const intensity = Math.min(ageDecrease / 20, 1);
    
    return image
      .modulate({
        brightness: 1 + (intensity * 0.05), // Slightly brighter
        saturation: 1 + (intensity * 0.1), // More vibrant
      })
      .sharpen({ sigma: 1 + (intensity * 0.5) }); // Sharper details
  }
}

export const makeupProcessor = new MakeupProcessor();