import sharp from "sharp";
import fs from "fs";
import path from "path";

export interface LipRegion {
  points: Array<{ x: number; y: number }>;
  boundingBox: { x: number; y: number; width: number; height: number };
  innerPoints: Array<{ x: number; y: number }>;  // Points inside lip border
  outerPoints: Array<{ x: number; y: number }>;  // Outer lip contour
}

export interface PrecisionLipOptions {
  color: string;
  intensity: number; // 0-100
  texture: 'matte' | 'gloss' | 'shimmer' | 'metallic';
  feather: number; // 0-5 for edge softening
  preserveBorders: boolean; // Ensure color stays within borders
}

export class PrecisionLipProcessor {
  
  /**
   * Apply lipstick with precise boundary detection
   */
  async applyPreciseLipstick(
    imagePath: string, 
    lipRegion: LipRegion, 
    options: PrecisionLipOptions
  ): Promise<string> {
    try {
      const outputPath = path.join("uploads", `precision_lips_${Date.now()}.jpg`);
      
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width = 800, height = 600 } = metadata;
      
      // Create precise lip mask using the detected lip points
      const lipMask = await this.createPreciseLipMask(
        width, 
        height, 
        lipRegion, 
        options.feather
      );
      
      // Create color overlay with the specified texture
      const colorOverlay = await this.createLipColorOverlay(
        width,
        height,
        lipRegion,
        options.color,
        options.intensity,
        options.texture
      );
      
      // Apply the lip color only within the mask boundaries
      const preciseApplication = sharp(colorOverlay)
        .composite([{
          input: lipMask,
          blend: 'dest-in' // This ensures color only appears where mask is present
        }]);
      
      const finalColorBuffer = await preciseApplication.png().toBuffer();
      
      // Composite the precise lip color onto the original image
      const result = image.composite([{
        input: finalColorBuffer,
        blend: this.getBlendModeForTexture(options.texture),
        left: 0,
        top: 0
      }]);
      
      await result.jpeg({ quality: 95 }).toFile(outputPath);
      
      console.log(`✅ Precision lipstick applied successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Precision lip processing error:', error);
      throw new Error(`Failed to apply precision lipstick: ${(error as Error).message}`);
    }
  }
  
  /**
   * Create a precise mask that follows the exact lip boundaries
   */
  private async createPreciseLipMask(
    width: number, 
    height: number, 
    lipRegion: LipRegion,
    feather: number
  ): Promise<Buffer> {
    
    // Create SVG path from lip points for precise boundary
    const lipPath = this.createSVGPathFromPoints(lipRegion.outerPoints || lipRegion.points);
    
    // Create SVG mask with precise boundaries
    const svgMask = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${feather * 0.5}"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="black"/>
        <path d="${lipPath}" fill="white" filter="url(#soften)"/>
      </svg>
    `;
    
    return sharp(Buffer.from(svgMask))
      .png()
      .toBuffer();
  }
  
  /**
   * Create color overlay with texture effects
   */
  private async createLipColorOverlay(
    width: number,
    height: number,
    lipRegion: LipRegion,
    color: string,
    intensity: number,
    texture: string
  ): Promise<Buffer> {
    
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    const alpha = Math.round((intensity / 100) * 255);
    
    // Create base color overlay
    let colorOverlay = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r, g, b, alpha }
      }
    });
    
    // Apply texture effects based on type
    switch (texture) {
      case 'gloss':
        // Add glossy highlight effect
        colorOverlay = await this.addGlossEffect(colorOverlay, lipRegion);
        break;
        
      case 'matte':
        // Reduce shine and add matte finish
        colorOverlay = await this.addMatteEffect(colorOverlay);
        break;
        
      case 'shimmer':
        // Add subtle shimmer particles
        colorOverlay = await this.addShimmerEffect(colorOverlay, lipRegion);
        break;
        
      case 'metallic':
        // Add metallic reflection
        colorOverlay = await this.addMetallicEffect(colorOverlay, color);
        break;
    }
    
    return colorOverlay.png().toBuffer();
  }
  
  /**
   * Create SVG path from array of points
   */
  private createSVGPathFromPoints(points: Array<{ x: number; y: number }>): string {
    if (!points || points.length === 0) {
      return '';
    }
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Use bezier curves for smooth lip contours
    for (let i = 1; i < points.length; i++) {
      const curr = points[i];
      const next = points[(i + 1) % points.length];
      
      if (i === points.length - 1) {
        path += ` L ${curr.x} ${curr.y} Z`;
      } else {
        // Create smooth curve between points
        const cp1x = curr.x + (next.x - points[i-1].x) * 0.1;
        const cp1y = curr.y + (next.y - points[i-1].y) * 0.1;
        const cp2x = next.x - (points[(i+2) % points.length].x - curr.x) * 0.1;
        const cp2y = next.y - (points[(i+2) % points.length].y - curr.y) * 0.1;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
      }
    }
    
    return path;
  }
  
  /**
   * Add gloss effect to lip color
   */
  private async addGlossEffect(colorOverlay: sharp.Sharp, lipRegion: LipRegion): Promise<sharp.Sharp> {
    // Create highlight gradient for gloss effect
    const { boundingBox } = lipRegion;
    const highlightSVG = `
      <svg width="${boundingBox.width}" height="${boundingBox.height}">
        <defs>
          <radialGradient id="gloss" cx="50%" cy="30%">
            <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
            <stop offset="50%" style="stop-color:white;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:white;stop-opacity:0" />
          </radialGradient>
        </defs>
        <ellipse cx="50%" cy="30%" rx="40%" ry="20%" fill="url(#gloss)" />
      </svg>
    `;
    
    const highlight = sharp(Buffer.from(highlightSVG)).png();
    
    return colorOverlay.composite([{
      input: await highlight.toBuffer(),
      left: boundingBox.x,
      top: boundingBox.y,
      blend: 'screen'
    }]);
  }
  
  /**
   * Add matte effect to lip color
   */
  private async addMatteEffect(colorOverlay: sharp.Sharp): Promise<sharp.Sharp> {
    // Reduce brightness and saturation for matte look
    return colorOverlay.modulate({
      brightness: 0.95,
      saturation: 0.9
    });
  }
  
  /**
   * Add shimmer effect to lip color
   */
  private async addShimmerEffect(colorOverlay: sharp.Sharp, lipRegion: LipRegion): Promise<sharp.Sharp> {
    // Add subtle sparkle texture
    const noise = sharp({
      create: {
        width: lipRegion.boundingBox.width,
        height: lipRegion.boundingBox.height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0.3 }
      }
    }).noise();
    
    return colorOverlay.composite([{
      input: await noise.png().toBuffer(),
      left: lipRegion.boundingBox.x,
      top: lipRegion.boundingBox.y,
      blend: 'overlay'
    }]);
  }
  
  /**
   * Add metallic effect to lip color
   */
  private async addMetallicEffect(colorOverlay: sharp.Sharp, color: string): Promise<sharp.Sharp> {
    // Create metallic gradient based on the base color
    const lightColor = this.lightenColor(color, 0.3);
    const darkColor = this.darkenColor(color, 0.2);
    
    return colorOverlay.modulate({
      brightness: 1.1,
      saturation: 1.2
    });
  }
  
  /**
   * Get appropriate blend mode for texture
   */
  private getBlendModeForTexture(texture: string): sharp.Blend {
    switch (texture) {
      case 'gloss': return 'multiply';
      case 'matte': return 'overlay';
      case 'shimmer': return 'soft-light';
      case 'metallic': return 'hard-light';
      default: return 'multiply';
    }
  }
  
  /**
   * Lighten a hex color by a factor
   */
  private lightenColor(hex: string, factor: number): string {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * Darken a hex color by a factor
   */
  private darkenColor(hex: string, factor: number): string {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const newR = Math.round(r * (1 - factor));
    const newG = Math.round(g * (1 - factor));
    const newB = Math.round(b * (1 - factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
  
  /**
   * Extract precise lip region from MediaPipe landmarks
   */
  extractLipRegionFromLandmarks(landmarks: any[]): LipRegion {
    // MediaPipe lip landmark indices
    const lipOuterIndices = [
      61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 
      402, 317, 14, 87, 178, 88, 95, 185, 40, 39, 37, 0, 269, 
      270, 267, 271, 272, 271, 272
    ];
    
    const lipInnerIndices = [
      78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 15,
      16, 17, 18, 200
    ];
    
    // Extract outer lip points
    const outerPoints = lipOuterIndices.map(idx => {
      const landmark = landmarks[idx];
      return {
        x: Math.round(landmark?.x || 0),
        y: Math.round(landmark?.y || 0)
      };
    }).filter(p => p.x > 0 && p.y > 0);
    
    // Extract inner lip points
    const innerPoints = lipInnerIndices.map(idx => {
      const landmark = landmarks[idx];
      return {
        x: Math.round(landmark?.x || 0),
        y: Math.round(landmark?.y || 0)
      };
    }).filter(p => p.x > 0 && p.y > 0);
    
    // Calculate bounding box
    const allX = outerPoints.map(p => p.x);
    const allY = outerPoints.map(p => p.y);
    
    const boundingBox = {
      x: Math.min(...allX),
      y: Math.min(...allY),
      width: Math.max(...allX) - Math.min(...allX),
      height: Math.max(...allY) - Math.min(...allY)
    };
    
    return {
      points: outerPoints,
      boundingBox,
      innerPoints,
      outerPoints
    };
  }
}

export const precisionLipProcessor = new PrecisionLipProcessor();