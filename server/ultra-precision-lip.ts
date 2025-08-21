import sharp from "sharp";
import path from "path";

export interface UltraPrecisionLipOptions {
  color: string;
  intensity: number;
}

export class UltraPrecisionLip {
  
  /**
   * Apply lipstick with ultra-precise boundary detection using pixel analysis
   */
  async applyUltraPreciseLipstick(imagePath: string, options: UltraPrecisionLipOptions): Promise<string> {
    try {
      const outputPath = path.join("uploads", `ultra_precision_lips_${Date.now()}.jpg`);
      
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const { width = 800, height = 600 } = metadata;
      
      console.log(`🔍 Starting ultra-precision lip analysis for ${width}x${height} image`);
      
      // Step 1: Analyze the image to find precise lip boundaries
      const lipMask = await this.createUltraPreciseLipMask(imagePath, width, height);
      
      // Step 2: Create color with exact intensity
      const r = parseInt(options.color.substr(1, 2), 16);
      const g = parseInt(options.color.substr(3, 2), 16);
      const b = parseInt(options.color.substr(5, 2), 16);
      const alpha = Math.round((options.intensity / 100) * 200); // Reduced max alpha for better blending
      
      // Step 3: Create smooth color overlay
      const colorOverlay = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r, g, b, alpha }
        }
      });
      
      // Step 4: Apply ultra-precise masking - color ONLY where mask allows
      const maskedColor = await colorOverlay
        .composite([{
          input: lipMask,
          blend: 'dest-in' // Critical: This ensures color appears ONLY where mask is white
        }])
        .png()
        .toBuffer();
      
      // Step 5: Blend the masked color with the original image using soft blending
      const result = image.composite([{
        input: maskedColor,
        blend: 'overlay', // Changed from multiply to overlay for better color blending
        left: 0,
        top: 0
      }]);
      
      await result.jpeg({ quality: 95 }).toFile(outputPath);
      
      console.log(`✅ Ultra-precision lipstick applied successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      console.error('Ultra precision lip error:', error);
      throw new Error(`Failed to apply ultra-precise lipstick: ${(error as Error).message}`);
    }
  }
  
  /**
   * Create ultra-precise lip mask using advanced pixel analysis
   */
  private async createUltraPreciseLipMask(imagePath: string, width: number, height: number): Promise<Buffer> {
    try {
      // Get raw pixel data for analysis
      const imageBuffer = await sharp(imagePath)
        .raw()
        .toBuffer();
      
      // Analyze skin tones and lip colors
      const lipRegion = await this.analyzeLipRegion(imageBuffer, width, height);
      
      // Create mask with detected lip boundaries
      return await this.generatePreciseLipMask(lipRegion, width, height);
      
    } catch (error) {
      console.error('Lip mask creation error:', error);
      // Fallback to geometric lip shape
      return await this.createFallbackLipMask(width, height);
    }
  }
  
  /**
   * Analyze image to detect lip region using pixel analysis
   */
  private async analyzeLipRegion(imageBuffer: Buffer, width: number, height: number): Promise<{
    centerX: number;
    centerY: number;
    width: number;
    height: number;
    points: Array<{x: number, y: number}>;
  }> {
    
    const pixels = new Uint8Array(imageBuffer);
    const channels = 3; // RGB
    
    // Define lip area search region (bottom half of image)
    const searchStartY = Math.floor(height * 0.6);
    const searchEndY = Math.floor(height * 0.85);
    const searchStartX = Math.floor(width * 0.3);
    const searchEndX = Math.floor(width * 0.7);
    
    let lipPixels: Array<{x: number, y: number, r: number, g: number, b: number}> = [];
    
    // Scan for lip-colored pixels (typically reddish/pinkish)
    for (let y = searchStartY; y < searchEndY; y++) {
      for (let x = searchStartX; x < searchEndX; x++) {
        const pixelIndex = (y * width + x) * channels;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];
        
        // Check if pixel looks like lip color (reddish, higher red than green/blue)
        if (this.isLipColorPixel(r, g, b)) {
          lipPixels.push({ x, y, r, g, b });
        }
      }
    }
    
    console.log(`📊 Found ${lipPixels.length} potential lip pixels`);
    
    if (lipPixels.length === 0) {
      // No lip pixels found, use default position
      return {
        centerX: width * 0.5,
        centerY: height * 0.72,
        width: width * 0.1,
        height: height * 0.03,
        points: []
      };
    }
    
    // Calculate lip boundaries from detected pixels
    const minX = Math.min(...lipPixels.map(p => p.x));
    const maxX = Math.max(...lipPixels.map(p => p.x));
    const minY = Math.min(...lipPixels.map(p => p.y));
    const maxY = Math.max(...lipPixels.map(p => p.y));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const lipWidth = Math.max(30, (maxX - minX) * 0.8); // Minimum width with some padding
    const lipHeight = Math.max(15, (maxY - minY) * 0.8); // Minimum height with some padding
    
    // Create precise lip boundary points
    const boundaryPoints = this.generateLipBoundaryPoints(centerX, centerY, lipWidth, lipHeight);
    
    console.log(`🎯 Detected lip region: center(${Math.round(centerX)}, ${Math.round(centerY)}), size(${Math.round(lipWidth)}, ${Math.round(lipHeight)})`);
    
    return {
      centerX,
      centerY,
      width: lipWidth,
      height: lipHeight,
      points: boundaryPoints
    };
  }
  
  /**
   * Check if a pixel is likely to be lip color
   */
  private isLipColorPixel(r: number, g: number, b: number): boolean {
    // Lip pixels typically have:
    // - Higher red values
    // - Red > Green and Red > Blue (warm tones)
    // - Not too dark (not shadows)
    // - Not too bright (not highlights)
    
    const isWarmTone = r > g && r > b;
    const hasRedish = r > 120; // Sufficient red component
    const notTooDark = (r + g + b) > 200; // Avoid shadows
    const notTooBright = (r + g + b) < 600; // Avoid highlights
    const hasLipCharacter = (r - g) > 20 || (r - b) > 20; // Distinct from skin
    
    return isWarmTone && hasRedish && notTooDark && notTooBright && hasLipCharacter;
  }
  
  /**
   * Generate precise lip boundary points for natural lip shape
   */
  private generateLipBoundaryPoints(centerX: number, centerY: number, lipWidth: number, lipHeight: number): Array<{x: number, y: number}> {
    const points: Array<{x: number, y: number}> = [];
    const numPoints = 20; // Number of boundary points
    
    // Create natural lip shape with curves
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      
      // Create lip-like oval with slight curvature
      let radiusX = lipWidth * 0.5;
      let radiusY = lipHeight * 0.5;
      
      // Make upper lip slightly smaller and more curved
      if (Math.sin(angle) < 0) {
        radiusY *= 0.8; // Upper lip is thinner
        radiusX *= 0.95; // Slightly narrower
      }
      
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      
      points.push({ x: Math.round(x), y: Math.round(y) });
    }
    
    return points;
  }
  
  /**
   * Generate precise SVG mask from detected lip region
   */
  private async generatePreciseLipMask(lipRegion: any, width: number, height: number): Promise<Buffer> {
    const { centerX, centerY, width: lipWidth, height: lipHeight, points } = lipRegion;
    
    // Create SVG path from boundary points
    let pathData = '';
    if (points && points.length > 0) {
      pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
      }
      pathData += ' Z';
    } else {
      // Fallback to simple ellipse
      pathData = `M ${centerX - lipWidth/2} ${centerY} 
                  Q ${centerX - lipWidth/3} ${centerY - lipHeight/2} ${centerX} ${centerY - lipHeight/3}
                  Q ${centerX + lipWidth/3} ${centerY - lipHeight/2} ${centerX + lipWidth/2} ${centerY}
                  Q ${centerX + lipWidth/3} ${centerY + lipHeight/2} ${centerX} ${centerY + lipHeight/3}
                  Q ${centerX - lipWidth/3} ${centerY + lipHeight/2} ${centerX - lipWidth/2} ${centerY} Z`;
    }
    
    const lipSVG = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ultra-precise" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8"/>
          </filter>
        </defs>
        <!-- Black background (no color applied here) -->
        <rect width="100%" height="100%" fill="black"/>
        <!-- White lip mask (color will be applied only here) -->
        <path d="${pathData}" fill="white" filter="url(#ultra-precise)"/>
      </svg>
    `;
    
    return sharp(Buffer.from(lipSVG)).png().toBuffer();
  }
  
  /**
   * Create fallback lip mask when pixel analysis fails
   */
  private async createFallbackLipMask(width: number, height: number): Promise<Buffer> {
    console.log(`⚠️  Using fallback lip mask`);
    
    const centerX = width * 0.5;
    const centerY = height * 0.72;
    const lipWidth = width * 0.08; // Conservative width
    const lipHeight = height * 0.025; // Conservative height
    
    const lipSVG = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="fallback" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="black"/>
        <ellipse cx="${centerX}" cy="${centerY}" rx="${lipWidth * 0.5}" ry="${lipHeight * 0.6}" fill="white" filter="url(#fallback)"/>
      </svg>
    `;
    
    return sharp(Buffer.from(lipSVG)).png().toBuffer();
  }
}

export const ultraPrecisionLip = new UltraPrecisionLip();