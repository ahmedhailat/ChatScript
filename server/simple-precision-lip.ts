import sharp from "sharp";
import path from "path";
import { faceBoundaryDetector } from "./face-boundary-detector";

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
      
      // Create a precise lip mask using face boundary detection
      const lipMask = await faceBoundaryDetector.createPreciseLipMask(imagePath);
      
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
   * Create a precise lip-shaped mask using realistic lip anatomy
   */
  private async createLipMask(width: number, height: number): Promise<Buffer> {
    // More precise lip detection based on facial proportions
    const lipCenterX = width * 0.5;
    const lipCenterY = height * 0.75; // Slightly lower for better accuracy
    const lipWidth = width * 0.08; // Smaller, more realistic lip width
    const lipHeight = height * 0.025; // More precise lip height
    
    // Create a very precise lip shape with multiple curves for natural look
    const upperLipY = lipCenterY - lipHeight * 0.3;
    const lowerLipY = lipCenterY + lipHeight * 0.7;
    
    const lipSVG = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="precision" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5"/>
          </filter>
        </defs>
        <!-- Black background -->
        <rect width="100%" height="100%" fill="black"/>
        <!-- Precise upper lip -->
        <path d="M ${lipCenterX - lipWidth} ${lipCenterY}
                 C ${lipCenterX - lipWidth * 0.7} ${upperLipY} ${lipCenterX - lipWidth * 0.3} ${upperLipY} ${lipCenterX - lipWidth * 0.1} ${upperLipY + lipHeight * 0.1}
                 C ${lipCenterX - lipWidth * 0.05} ${upperLipY - lipHeight * 0.1} ${lipCenterX + lipWidth * 0.05} ${upperLipY - lipHeight * 0.1} ${lipCenterX + lipWidth * 0.1} ${upperLipY + lipHeight * 0.1}
                 C ${lipCenterX + lipWidth * 0.3} ${upperLipY} ${lipCenterX + lipWidth * 0.7} ${upperLipY} ${lipCenterX + lipWidth} ${lipCenterY}
                 C ${lipCenterX + lipWidth * 0.8} ${lowerLipY} ${lipCenterX + lipWidth * 0.4} ${lowerLipY + lipHeight * 0.2} ${lipCenterX} ${lowerLipY}
                 C ${lipCenterX - lipWidth * 0.4} ${lowerLipY + lipHeight * 0.2} ${lipCenterX - lipWidth * 0.8} ${lowerLipY} ${lipCenterX - lipWidth} ${lipCenterY} Z" 
              fill="white" 
              filter="url(#precision)"/>
      </svg>
    `;
    
    return sharp(Buffer.from(lipSVG))
      .png()
      .toBuffer();
  }
}

export const simplePrecisionLip = new SimplePrecisionLip();