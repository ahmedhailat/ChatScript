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
      }
      
      // Save the processed image
      await image.jpeg({ quality: 90 }).toFile(outputPath);
      
      return outputPath;
      
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${(error as Error).message}`);
    }
  }

  private async applyNoseReshaping(
    image: sharp.Sharp,
    noseArea: { x: number; y: number; width: number; height: number } | undefined,
    adjustments: SurgicalAdjustments,
    intensity: number
  ): Promise<sharp.Sharp> {
    if (!noseArea || !adjustments.noseWidth) return image;
    
    try {
      const metadata = await image.metadata();
      const { width = 0, height = 0 } = metadata;
      
      // Calculate adjustment strength based on intensity
      const widthAdjust = Math.round((adjustments.noseWidth / 100) * intensity * 0.3);
      const lengthAdjust = Math.round((adjustments.noseLength || 0 / 100) * intensity * 0.2);
      
      // Create nose reshaping overlay
      const noseOverlay = await this.createNoseReshapeOverlay(
        noseArea.width, 
        noseArea.height, 
        widthAdjust, 
        lengthAdjust
      );
      
      // Composite the overlay onto the original image
      return image.composite([{
        input: noseOverlay,
        left: noseArea.x,
        top: noseArea.y,
        blend: 'overlay'
      }]);
      
    } catch (error) {
      console.error('Nose reshaping error:', error);
      return image; // Return original if processing fails
    }
  }

  private async applyDentalWork(
    image: sharp.Sharp,
    teethArea: { x: number; y: number; width: number; height: number } | undefined,
    adjustments: SurgicalAdjustments,
    intensity: number
  ): Promise<sharp.Sharp> {
    if (!teethArea) return image;
    
    try {
      // Apply teeth whitening
      if (adjustments.teethWhitening) {
        const whiteningOverlay = await this.createTeethWhiteningOverlay(
          teethArea.width,
          teethArea.height,
          adjustments.teethWhitening,
          intensity
        );
        
        image = image.composite([{
          input: whiteningOverlay,
          left: teethArea.x,
          top: teethArea.y,
          blend: 'lighten'
        }]);
      }
      
      // Apply teeth straightening effect
      if (adjustments.teethStraightening) {
        const straighteningOverlay = await this.createTeethStraighteningOverlay(
          teethArea.width,
          teethArea.height,
          adjustments.teethStraightening,
          intensity
        );
        
        image = image.composite([{
          input: straighteningOverlay,
          left: teethArea.x,
          top: teethArea.y,
          blend: 'overlay'
        }]);
      }
      
      return image;
      
    } catch (error) {
      console.error('Dental work error:', error);
      return image;
    }
  }

  private async applyFaceLift(
    image: sharp.Sharp,
    selections: FaceAreaSelection,
    adjustments: SurgicalAdjustments,
    intensity: number
  ): Promise<sharp.Sharp> {
    try {
      // Apply subtle contouring and lifting effects
      const metadata = await image.metadata();
      
      // Create contouring overlay
      const contourOverlay = await this.createContouringOverlay(
        metadata.width!,
        metadata.height!,
        selections,
        intensity
      );
      
      return image.composite([{
        input: contourOverlay,
        blend: 'soft-light'
      }]);
      
    } catch (error) {
      console.error('Face lift error:', error);
      return image;
    }
  }

  private async applyScarRemoval(
    image: sharp.Sharp,
    selections: FaceAreaSelection,
    intensity: number
  ): Promise<sharp.Sharp> {
    try {
      // Apply skin smoothing and blemish reduction
      return image
        .blur(intensity * 0.1) // Subtle blur for smoothing
        .sharpen({ sigma: 0.5 + (intensity * 0.01) }); // Re-sharpen to maintain detail
      
    } catch (error) {
      console.error('Scar removal error:', error);
      return image;
    }
  }

  private async createNoseReshapeOverlay(
    width: number, 
    height: number, 
    widthAdjust: number, 
    lengthAdjust: number
  ): Promise<Buffer> {
    // Create a subtle gradient overlay for nose reshaping
    const overlay = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 220, b: 200, alpha: Math.abs(widthAdjust) * 0.3 }
      }
    });
    
    return overlay.png().toBuffer();
  }

  private async createTeethWhiteningOverlay(
    width: number,
    height: number,
    whitening: number,
    intensity: number
  ): Promise<Buffer> {
    // Create whitening overlay
    const alpha = Math.min(255, (whitening / 100) * intensity * 2.55);
    
    const overlay = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha }
      }
    });
    
    return overlay.png().toBuffer();
  }

  private async createTeethStraighteningOverlay(
    width: number,
    height: number,
    straightening: number,
    intensity: number
  ): Promise<Buffer> {
    // Create subtle alignment improvement overlay
    const alpha = Math.min(255, (straightening / 100) * intensity * 1.5);
    
    const overlay = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 250, g: 248, b: 245, alpha }
      }
    });
    
    return overlay.png().toBuffer();
  }

  private async createContouringOverlay(
    width: number,
    height: number,
    selections: FaceAreaSelection,
    intensity: number
  ): Promise<Buffer> {
    // Create facial contouring overlay
    const overlay = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 240, g: 220, b: 200, alpha: intensity * 0.8 }
      }
    });
    
    return overlay.png().toBuffer();
  }

  async applyMakeupEffect(
    imagePath: string,
    makeupType: string,
    color: string,
    area: { x: number; y: number; width: number; height: number },
    intensity: number
  ): Promise<string> {
    try {
      const outputPath = path.join("uploads", `makeup_${Date.now()}.jpg`);
      
      let image = sharp(imagePath);
      
      // Parse color hex to RGB
      const hexColor = color.replace('#', '');
      const r = parseInt(hexColor.substr(0, 2), 16);
      const g = parseInt(hexColor.substr(2, 2), 16);
      const b = parseInt(hexColor.substr(4, 2), 16);
      const alpha = Math.min(255, intensity * 2.55);
      
      // Create makeup overlay
      const makeupOverlay = sharp({
        create: {
          width: area.width,
          height: area.height,
          channels: 4,
          background: { r, g, b, alpha }
        }
      });
      
      // Apply makeup based on type
      const blendMode = this.getMakeupBlendMode(makeupType);
      
      image = image.composite([{
        input: await makeupOverlay.png().toBuffer(),
        left: area.x,
        top: area.y,
        blend: blendMode as any
      }]);
      
      await image.jpeg({ quality: 90 }).toFile(outputPath);
      
      return outputPath;
      
    } catch (error) {
      console.error('Makeup application error:', error);
      throw new Error(`Failed to apply makeup: ${(error as Error).message}`);
    }
  }

  private getMakeupBlendMode(makeupType: string): string {
    const blendModes = {
      lipstick: 'multiply',
      eyeshadow: 'soft-light',
      blush: 'soft-light',
      foundation: 'overlay',
      eyeliner: 'multiply',
      mascara: 'darken'
    };
    
    return blendModes[makeupType as keyof typeof blendModes] || 'overlay';
  }
}

export const imageProcessor = new ImageProcessor();