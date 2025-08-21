import sharp from 'sharp';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class FaceEffectsProcessor {
  
  async applyFaceEffect(
    imagePath: string,
    effect: string,
    intensity: number,
    category: string
  ): Promise<string> {
    console.log(`تطبيق تأثير ${effect} بشدة ${intensity}% على الصورة`);

    try {
      // Try AI processing first
      return await this.processWithAI(imagePath, effect, intensity, category);
    } catch (error) {
      console.log('فشل المعالج الذكي، التبديل للمعالج المحلي:', error);
      return await this.processLocally(imagePath, effect, intensity, category);
    }
  }

  private async processWithAI(
    imagePath: string,
    effect: string,
    intensity: number,
    category: string
  ): Promise<string> {
    
    const imageBuffer = await sharp(imagePath).jpeg().toBuffer();
    const base64Image = imageBuffer.toString('base64');

    const prompt = this.generatePrompt(effect, intensity, category);

    // Convert buffer to File-like object for OpenAI
    const imageFile = new File([imageBuffer], 'image.jpg', { type: 'image/jpeg' });
    
    const response = await openai.images.edit({
      image: imageFile,
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    });

    const aiImageUrl = response.data?.[0]?.url;
    if (!aiImageUrl) {
      throw new Error('لم يتم إنتاج صورة من الذكاء الاصطناعي');
    }

    // Download and save the AI processed image
    const aiResponse = await fetch(aiImageUrl);
    const aiImageBuffer = await aiResponse.arrayBuffer();
    
    const outputPath = `uploads/faceapp_${Date.now()}.jpg`;
    await sharp(Buffer.from(aiImageBuffer))
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`تم حفظ الصورة المعالجة بالذكاء الاصطناعي في: ${outputPath}`);
    return `/${outputPath}`;
  }

  private generatePrompt(effect: string, intensity: number, category: string): string {
    const prompts: Record<string, string> = {
      // Age effects
      young: `Make the person look younger by ${intensity}%, smooth skin, reduce wrinkles, brighter eyes, youthful appearance`,
      old: `Age the person by ${intensity}%, add appropriate wrinkles, gray hair, mature features`,
      
      // Gender effects
      male: `Transform to masculine appearance with ${intensity}% intensity, stronger jawline, facial hair, masculine features`,
      female: `Transform to feminine appearance with ${intensity}% intensity, softer features, feminine makeup, delicate appearance`,
      
      // Expression effects
      smile: `Add a natural smile with ${intensity}% intensity, happy expression, bright eyes`,
      laugh: `Add a wide laugh with ${intensity}% intensity, joyful expression, laughing eyes`,
      
      // Beauty effects
      beauty: `Apply beauty enhancement with ${intensity}% intensity, smooth skin, enhanced features, natural glow`,
      makeup: `Apply natural makeup with ${intensity}% intensity, enhanced eyes, defined lips, smooth complexion`,
      
      // Hair effects
      hair_color: `Change hair color with ${intensity}% intensity, natural hair coloring, maintain hair texture`,
      beard: `Add facial hair/beard with ${intensity}% intensity, natural beard growth, masculine appearance`,
      
      // Eye effects
      eye_color: `Change eye color with ${intensity}% intensity, natural eye coloring, maintain eye shape`,
      eye_size: `Enhance eye size with ${intensity}% intensity, larger eyes, maintain natural proportions`,
      
      // Special effects
      glow: `Add natural skin glow with ${intensity}% intensity, healthy radiant skin, soft lighting effect`,
      smooth: `Smooth skin texture with ${intensity}% intensity, reduce blemishes, maintain natural appearance`
    };

    return prompts[effect] || `Apply ${effect} effect with ${intensity}% intensity to the face, maintain natural and realistic appearance`;
  }

  private async processLocally(
    imagePath: string,
    effect: string,
    intensity: number,
    category: string
  ): Promise<string> {
    
    console.log(`بدء المعالجة المحلية للتأثير: ${effect}`);
    
    const image = sharp(imagePath);
    const { width, height } = await image.metadata();
    
    let processedImage = image;

    // Apply local processing based on effect type
    switch (effect) {
      case 'beauty':
      case 'smooth':
        // Skin smoothing effect
        processedImage = processedImage
          .blur(Math.max(1, intensity / 50))
          .sharpen(1 + intensity / 100);
        break;
        
      case 'glow':
        // Skin glow effect
        processedImage = processedImage
          .modulate({
            brightness: 1 + (intensity / 200),
            saturation: 1 + (intensity / 300)
          });
        break;
        
      case 'young':
        // Youth effect - brighten and soften
        processedImage = processedImage
          .modulate({
            brightness: 1 + (intensity / 150),
            saturation: 1 + (intensity / 200)
          })
          .blur(intensity / 100);
        break;
        
      case 'old':
        // Aging effect - reduce saturation, add contrast
        processedImage = processedImage
          .modulate({
            brightness: 1 - (intensity / 300),
            saturation: 1 - (intensity / 200)
          })
          .linear(1 + intensity / 100, -(intensity / 10));
        break;
        
      case 'smile':
      case 'laugh':
        // Expression effects - brighten overall
        processedImage = processedImage
          .modulate({
            brightness: 1 + (intensity / 200),
            saturation: 1 + (intensity / 300)
          });
        break;
        
      case 'makeup':
        // Makeup effect - enhance colors and contrast
        processedImage = processedImage
          .modulate({
            saturation: 1 + (intensity / 150),
            lightness: 1 + (intensity / 400)
          })
          .linear(1 + intensity / 200, 0);
        break;
        
      default:
        // Default enhancement
        processedImage = processedImage
          .modulate({
            brightness: 1 + (intensity / 300),
            saturation: 1 + (intensity / 400)
          });
    }

    // Add a subtle color enhancement for all effects
    if (intensity > 30) {
      processedImage = processedImage
        .gamma(1 + intensity / 500)
        .normalize();
    }

    const outputPath = `uploads/faceapp_local_${Date.now()}.jpg`;
    
    await processedImage
      .jpeg({ 
        quality: 95,
        progressive: true 
      })
      .toFile(outputPath);

    console.log(`تم حفظ الصورة المعالجة محلياً في: ${outputPath}`);
    return `/${outputPath}`;
  }

  // Generate demo effects for different categories
  async generateDemoEffect(effect: string): Promise<string> {
    const demoImages: Record<string, string> = {
      young: "https://images.unsplash.com/photo-1494790108755-2616b612b1db?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      old: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      male: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      female: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      smile: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      beauty: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      makeup: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
    };
    
    return demoImages[effect] || demoImages.beauty;
  }
}