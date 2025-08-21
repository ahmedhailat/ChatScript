import sharp from "sharp";
import path from "path";

export interface SimpleLipOptions {
  color: string;
  intensity: number;
}

export class SimplePrecisionLip {
  
  /**
   * Apply lipstick with SVG masking for precise boundaries
   */
  async applyPreciseLipstick(imagePath: string, options: SimpleLipOptions): Promise<string> {
    try {
      const outputPath = path.join("uploads", `precision_lips_${Date.now()}.jpg`);
      
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width = 800, height = 600 } = metadata;
      
      // Create a more precise lip mask using estimated lip position
      const lipMask = await this.createLipMask(width, height);
      
      // Create color overlay
      const r = parseInt(options.color.substr(1, 2), 16);
      const g = parseInt(options.color.substr(3, 2), 16);
      const b = parseInt(options.color.substr(5, 2), 16);
      const alpha = Math.round((options.intensity / 100) * 255);
      
      // Create color overlay
      const colorOverlay = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r, g, b, alpha }
        }
      });
      
      // Apply mask to color overlay to restrict it to lip area only
      const maskedColor = await colorOverlay
        .composite([{
          input: lipMask,
          blend: 'dest-in' // This ensures color only appears where mask exists
        }])
        .png()
        .toBuffer();
      
      // Apply the masked color to the original image
      const result = image.composite([{
        input: maskedColor,
        blend: 'multiply',
        left: 0,
        top: 0
      }]);
      
      await result.jpeg({ quality: 95 }).toFile(outputPath);
      
      console.log(`✅ Precision lipstick applied: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Simple precision lip error:', error);
      throw new Error(`Failed to apply precision lipstick: ${(error as Error).message}`);
    }
  }
  
  /**
   * Create a lip-shaped mask using SVG
   */
  private async createLipMask(width: number, height: number): Promise<Buffer> {
    // Calculate approximate lip position (center-bottom third of face)
    const lipCenterX = width * 0.5;
    const lipCenterY = height * 0.72; // Around mouth area
    const lipWidth = width * 0.12; // Approximately 12% of face width
    const lipHeight = height * 0.04; // Approximately 4% of face height
    
    // Create a more realistic lip shape using SVG path
    const lipSVG = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="soften" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          </filter>
        </defs>
        <!-- Black background -->
        <rect width="100%" height="100%" fill="black"/>
        <!-- White lip shape mask -->
        <path d="M ${lipCenterX - lipWidth} ${lipCenterY} 
                 Q ${lipCenterX - lipWidth/2} ${lipCenterY - lipHeight/2} ${lipCenterX} ${lipCenterY - lipHeight/3}
                 Q ${lipCenterX + lipWidth/2} ${lipCenterY - lipHeight/2} ${lipCenterX + lipWidth} ${lipCenterY}
                 Q ${lipCenterX + lipWidth/2} ${lipCenterY + lipHeight/2} ${lipCenterX} ${lipCenterY + lipHeight/3}
                 Q ${lipCenterX - lipWidth/2} ${lipCenterY + lipHeight/2} ${lipCenterX - lipWidth} ${lipCenterY} Z" 
              fill="white" 
              filter="url(#soften)"/>
      </svg>
    `;
    
    return sharp(Buffer.from(lipSVG))
      .png()
      .toBuffer();
  }
}

export const simplePrecisionLip = new SimplePrecisionLip();