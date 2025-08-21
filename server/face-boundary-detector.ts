import sharp from "sharp";
import path from "path";

export interface FaceBoundaries {
  lips: { centerX: number; centerY: number; width: number; height: number };
  eyes: { left: { centerX: number; centerY: number }; right: { centerX: number; centerY: number } };
  face: { centerX: number; centerY: number; width: number; height: number };
}

export class FaceBoundaryDetector {
  
  /**
   * Detect face boundaries using image analysis and facial proportions
   */
  async detectFaceBoundaries(imagePath: string): Promise<FaceBoundaries> {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width = 800, height = 600 } = metadata;
      
      // Convert to grayscale for edge detection
      const grayBuffer = await image
        .greyscale()
        .raw()
        .toBuffer();
      
      // Analyze the image to find face-like features
      const boundaries = await this.analyzeImageForFaceFeatures(grayBuffer, width, height);
      
      console.log(`🔍 Face boundaries detected:`, boundaries);
      return boundaries;
      
    } catch (error) {
      console.error('Face boundary detection error:', error);
      // Return default proportions if detection fails
      return this.getDefaultFaceBoundaries(800, 600);
    }
  }
  
  /**
   * Analyze image for face features using pixel analysis
   */
  private async analyzeImageForFaceFeatures(
    grayBuffer: Buffer, 
    width: number, 
    height: number
  ): Promise<FaceBoundaries> {
    
    // Simple face detection using basic image analysis
    const pixels = new Uint8Array(grayBuffer);
    
    // Find the darkest regions (likely to be hair, eyes, mouth)
    const darkRegions = this.findDarkRegions(pixels, width, height);
    
    // Estimate face center and size
    const faceCenter = this.estimateFaceCenter(darkRegions, width, height);
    const faceSize = this.estimateFaceSize(width, height);
    
    // Estimate lip position based on face proportions
    const lipPosition = this.estimateLipPosition(faceCenter, faceSize);
    
    return {
      face: {
        centerX: faceCenter.x,
        centerY: faceCenter.y,
        width: faceSize.width,
        height: faceSize.height
      },
      lips: {
        centerX: lipPosition.x,
        centerY: lipPosition.y,
        width: faceSize.width * 0.12, // 12% of face width
        height: faceSize.height * 0.04 // 4% of face height
      },
      eyes: {
        left: {
          centerX: faceCenter.x - faceSize.width * 0.2,
          centerY: faceCenter.y - faceSize.height * 0.1
        },
        right: {
          centerX: faceCenter.x + faceSize.width * 0.2,
          centerY: faceCenter.y - faceSize.height * 0.1
        }
      }
    };
  }
  
  /**
   * Find dark regions in the image
   */
  private findDarkRegions(pixels: Uint8Array, width: number, height: number): Array<{x: number, y: number, intensity: number}> {
    const darkRegions: Array<{x: number, y: number, intensity: number}> = [];
    const threshold = 80; // Darkness threshold
    
    for (let y = 0; y < height; y += 4) { // Sample every 4th pixel for performance
      for (let x = 0; x < width; x += 4) {
        const index = y * width + x;
        const intensity = pixels[index];
        
        if (intensity < threshold) {
          darkRegions.push({ x, y, intensity });
        }
      }
    }
    
    return darkRegions;
  }
  
  /**
   * Estimate face center from dark regions
   */
  private estimateFaceCenter(darkRegions: Array<{x: number, y: number, intensity: number}>, width: number, height: number): {x: number, y: number} {
    if (darkRegions.length === 0) {
      return { x: width * 0.5, y: height * 0.5 };
    }
    
    // Group dark regions by vertical sections to find face outline
    const centerRegions = darkRegions.filter(region => 
      region.x > width * 0.2 && region.x < width * 0.8 &&
      region.y > height * 0.2 && region.y < height * 0.8
    );
    
    if (centerRegions.length === 0) {
      return { x: width * 0.5, y: height * 0.5 };
    }
    
    const avgX = centerRegions.reduce((sum, region) => sum + region.x, 0) / centerRegions.length;
    const avgY = centerRegions.reduce((sum, region) => sum + region.y, 0) / centerRegions.length;
    
    return { x: Math.round(avgX), y: Math.round(avgY) };
  }
  
  /**
   * Estimate face size based on image dimensions
   */
  private estimateFaceSize(width: number, height: number): {width: number, height: number} {
    // Assume face takes up about 60% of image width and 70% of height
    return {
      width: Math.round(width * 0.6),
      height: Math.round(height * 0.7)
    };
  }
  
  /**
   * Estimate lip position based on face center and size
   */
  private estimateLipPosition(faceCenter: {x: number, y: number}, faceSize: {width: number, height: number}): {x: number, y: number} {
    // Lips are typically at the bottom third of the face
    return {
      x: faceCenter.x,
      y: faceCenter.y + faceSize.height * 0.25 // 25% down from face center
    };
  }
  
  /**
   * Get default face boundaries when detection fails
   */
  private getDefaultFaceBoundaries(width: number, height: number): FaceBoundaries {
    return {
      face: {
        centerX: width * 0.5,
        centerY: height * 0.5,
        width: width * 0.6,
        height: height * 0.7
      },
      lips: {
        centerX: width * 0.5,
        centerY: height * 0.72,
        width: width * 0.12,
        height: height * 0.04
      },
      eyes: {
        left: {
          centerX: width * 0.35,
          centerY: height * 0.4
        },
        right: {
          centerX: width * 0.65,
          centerY: height * 0.4
        }
      }
    };
  }
  
  /**
   * Create precise lip mask based on detected boundaries
   */
  async createPreciseLipMask(imagePath: string): Promise<Buffer> {
    const boundaries = await this.detectFaceBoundaries(imagePath);
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width = 800, height = 600 } = metadata;
    
    const lips = boundaries.lips;
    
    // Create very precise lip shape
    const lipSVG = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="sharp" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="black"/>
        <ellipse 
          cx="${lips.centerX}" 
          cy="${lips.centerY}" 
          rx="${lips.width * 0.45}" 
          ry="${lips.height * 0.6}" 
          fill="white" 
          filter="url(#sharp)"/>
        <!-- Add upper lip curve -->
        <path d="M ${lips.centerX - lips.width * 0.45} ${lips.centerY}
                 Q ${lips.centerX - lips.width * 0.2} ${lips.centerY - lips.height * 0.3} ${lips.centerX} ${lips.centerY - lips.height * 0.2}
                 Q ${lips.centerX + lips.width * 0.2} ${lips.centerY - lips.height * 0.3} ${lips.centerX + lips.width * 0.45} ${lips.centerY}
                 L ${lips.centerX + lips.width * 0.35} ${lips.centerY + lips.height * 0.1}
                 Q ${lips.centerX} ${lips.centerY + lips.height * 0.4} ${lips.centerX - lips.width * 0.35} ${lips.centerY + lips.height * 0.1} Z" 
              fill="white" 
              filter="url(#sharp)"/>
      </svg>
    `;
    
    return sharp(Buffer.from(lipSVG)).png().toBuffer();
  }
}

export const faceBoundaryDetector = new FaceBoundaryDetector();