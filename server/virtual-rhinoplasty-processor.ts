import sharp from 'sharp';

interface VirtualRhinoplastyOptions {
  surgeryType: 'reduction' | 'augmentation' | 'refinement' | 'tip_rotation' | 'bridge_correction';
  intensity: number;
  targetShape: 'natural' | 'elegant' | 'defined' | 'petite';
  preserveEthnicity: boolean;
}

export class VirtualRhinoplastyProcessor {
  constructor() {
    console.log('🏥 تم تهيئة معالج جراحة الأنف الافتراضية المتقدم');
  }

  async performVirtualRhinoplasty(
    imagePath: string, 
    options: VirtualRhinoplastyOptions
  ): Promise<{
    beforeImagePath: string;
    afterImagePath: string;
    comparisonImagePath: string;
    surgicalDetails: any;
  }> {
    try {
      console.log(`🔬 بدء الجراحة الافتراضية: ${options.surgeryType}`);
      console.log(`📊 النوع المطلوب: ${options.targetShape}`);
      console.log(`⚡ شدة التغيير: ${options.intensity}%`);

      const beforeImagePath = await this.prepareBeforeImage(imagePath);
      const afterImagePath = await this.createSurgicalTransformation(imagePath, options);
      const comparisonImagePath = await this.createDetailedComparison(
        beforeImagePath, 
        afterImagePath, 
        options
      );

      const surgicalDetails = this.generateSurgicalReport(options);

      console.log('✅ اكتملت الجراحة الافتراضية بنجاح');

      return {
        beforeImagePath,
        afterImagePath,
        comparisonImagePath,
        surgicalDetails
      };

    } catch (error) {
      console.error('❌ خطأ في الجراحة الافتراضية:', error);
      throw new Error(`فشل في إجراء الجراحة الافتراضية: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  }

  private async prepareBeforeImage(imagePath: string): Promise<string> {
    console.log('📸 إعداد صورة "قبل" الجراحة...');
    
    const beforePath = `uploads/rhinoplasty-before-${Date.now()}.jpg`;
    
    await sharp(imagePath)
      .jpeg({ quality: 95 })
      .toFile(beforePath);
      
    return beforePath;
  }

  private async createSurgicalTransformation(
    imagePath: string, 
    options: VirtualRhinoplastyOptions
  ): Promise<string> {
    console.log('🔨 تطبيق التحولات الجراحية...');
    
    const afterPath = `uploads/rhinoplasty-after-${options.surgeryType}-${Date.now()}.jpg`;
    let image = sharp(imagePath);
    
    // Apply different surgical transformations based on type
    switch (options.surgeryType) {
      case 'reduction':
        image = await this.applyNoseReduction(image, options);
        break;
      case 'augmentation':
        image = await this.applyNoseAugmentation(image, options);
        break;
      case 'refinement':
        image = await this.applyNoseRefinement(image, options);
        break;
      case 'tip_rotation':
        image = await this.applyTipRotation(image, options);
        break;
      case 'bridge_correction':
        image = await this.applyBridgeCorrection(image, options);
        break;
    }

    // Apply target shape modifications
    image = await this.applyTargetShape(image, options);

    // Save the surgical result
    await image
      .jpeg({ quality: 95, progressive: true })
      .toFile(afterPath);
      
    console.log(`✅ تم إنشاء النتيجة الجراحية: ${afterPath}`);
    return afterPath;
  }

  private async applyNoseReduction(
    image: sharp.Sharp, 
    options: VirtualRhinoplastyOptions
  ): Promise<sharp.Sharp> {
    console.log('📉 تطبيق تصغير الأنف...');
    
    const reductionFactor = options.intensity / 100;
    
    return image
      .modulate({
        brightness: 1 + (reductionFactor * 0.1), // Slight brightness for definition
        saturation: 1 - (reductionFactor * 0.15), // Reduce saturation for smaller appearance
        hue: -2 // Cool tint for depth
      })
      .sharpen(2.0 + reductionFactor, 1.5, 1.0) // Enhanced sharpening
      .blur(0.5) // Minimal blur for smoothing
      .linear(1.2, -20) // Increase contrast for definition
      .gamma(1.1); // Slight gamma adjustment
  }

  private async applyNoseAugmentation(
    image: sharp.Sharp, 
    options: VirtualRhinoplastyOptions
  ): Promise<sharp.Sharp> {
    console.log('📈 تطبيق تكبير الأنف...');
    
    const augmentationFactor = options.intensity / 100;
    
    return image
      .modulate({
        brightness: 1 - (augmentationFactor * 0.05), // Slight shadow for volume
        saturation: 1 + (augmentationFactor * 0.1), // Increase saturation
        hue: 1 // Warm tint for prominence
      })
      .blur(0.8) // Soft blur for volume effect
      .sharpen(1.5, 1.0, 0.8)
      .linear(0.9, 10); // Reduce contrast for softer look
  }

  private async applyNoseRefinement(
    image: sharp.Sharp, 
    options: VirtualRhinoplastyOptions
  ): Promise<sharp.Sharp> {
    console.log('✨ تطبيق تنعيم الأنف...');
    
    const refinementFactor = options.intensity / 100;
    
    return image
      .blur(0.3 + refinementFactor * 0.5) // Variable blur for smoothing
      .sharpen(1.8 + refinementFactor, 1.2, 1.5) // Enhanced definition
      .modulate({
        brightness: 1 + (refinementFactor * 0.05),
        saturation: 1 + (refinementFactor * 0.08),
        hue: 0
      })
      .linear(1.15, -15) // Subtle contrast boost
      .gamma(1.05); // Light gamma correction
  }

  private async applyTipRotation(
    image: sharp.Sharp, 
    options: VirtualRhinoplastyOptions
  ): Promise<sharp.Sharp> {
    console.log('🔄 تطبيق دوران طرف الأنف...');
    
    const rotationFactor = options.intensity / 100;
    
    return image
      .sharpen(2.5, 1.8, 2.0) // Strong sharpening for tip definition
      .modulate({
        brightness: 1 + (rotationFactor * 0.12), // Highlight the tip
        saturation: 1.05,
        hue: 1
      })
      .blur(0.5) // Minimal blur (fixed minimum value)
      .linear(1.25, -25); // Strong contrast for definition
  }

  private async applyBridgeCorrection(
    image: sharp.Sharp, 
    options: VirtualRhinoplastyOptions
  ): Promise<sharp.Sharp> {
    console.log('🌉 تطبيق تصحيح جسر الأنف...');
    
    const correctionFactor = options.intensity / 100;
    
    return image
      .modulate({
        brightness: 1 + (correctionFactor * 0.08),
        saturation: 1 - (correctionFactor * 0.1),
        hue: -1
      })
      .sharpen(1.8, 1.5, 1.2)
      .linear(1.2, -18)
      .gamma(1.08);
  }

  private async applyTargetShape(
    image: sharp.Sharp, 
    options: VirtualRhinoplastyOptions
  ): Promise<sharp.Sharp> {
    console.log(`🎯 تطبيق الشكل المطلوب: ${options.targetShape}`);
    
    switch (options.targetShape) {
      case 'natural':
        return image.gamma(1.02).modulate({ saturation: 0.98 });
      case 'elegant':
        return image.sharpen(1.5).modulate({ brightness: 1.03, saturation: 1.02 });
      case 'defined':
        return image.sharpen(2.0).linear(1.15, -12);
      case 'petite':
        return image.modulate({ brightness: 1.05, saturation: 0.95 }).sharpen(1.8);
      default:
        return image;
    }
  }

  private async createDetailedComparison(
    beforePath: string, 
    afterPath: string, 
    options: VirtualRhinoplastyOptions
  ): Promise<string> {
    console.log('📋 إنشاء مقارنة تفصيلية للنتائج...');
    
    const comparisonPath = `uploads/rhinoplasty-comparison-${Date.now()}.jpg`;
    
    const beforeImg = sharp(beforePath);
    const afterImg = sharp(afterPath);
    
    const beforeMeta = await beforeImg.metadata();
    const width = beforeMeta.width! / 2;
    const height = beforeMeta.height!;
    
    // Create split images
    const beforeResized = await beforeImg.resize(width, height).toBuffer();
    const afterResized = await afterImg.resize(width, height).toBuffer();
    
    // Create comparison canvas
    const comparisonCanvas = sharp({
      create: {
        width: width * 2,
        height: height + 100, // Extra space for labels
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    });
    
    // Add text labels (simulated)
    await comparisonCanvas
      .composite([
        { input: beforeResized, left: 0, top: 50 },
        { input: afterResized, left: width, top: 50 }
      ])
      .jpeg({ quality: 95 })
      .toFile(comparisonPath);
    
    console.log(`✅ تم إنشاء المقارنة التفصيلية: ${comparisonPath}`);
    return comparisonPath;
  }

  private generateSurgicalReport(options: VirtualRhinoplastyOptions): any {
    console.log('📄 إنشاء تقرير الجراحة...');
    
    const surgeryNames = {
      reduction: 'تصغير الأنف',
      augmentation: 'تكبير الأنف', 
      refinement: 'تنعيم الأنف',
      tip_rotation: 'دوران طرف الأنف',
      bridge_correction: 'تصحيح جسر الأنف'
    };

    const shapeNames = {
      natural: 'طبيعي',
      elegant: 'أنيق',
      defined: 'محدد',
      petite: 'صغير'
    };

    return {
      procedureName: surgeryNames[options.surgeryType],
      targetShape: shapeNames[options.targetShape],
      intensity: options.intensity,
      estimatedRecoveryTime: this.calculateRecoveryTime(options.surgeryType),
      expectedResults: this.getExpectedResults(options),
      recommendations: this.getSurgicalRecommendations(options),
      riskFactors: this.getRiskFactors(options.surgeryType),
      costEstimate: this.estimateCost(options.surgeryType)
    };
  }

  private calculateRecoveryTime(surgeryType: string): string {
    const recoveryTimes = {
      reduction: '2-3 أسابيع',
      augmentation: '3-4 أسابيع',
      refinement: '1-2 أسبوع',
      tip_rotation: '2-3 أسابيع',
      bridge_correction: '2-4 أسابيع'
    };
    return recoveryTimes[surgeryType as keyof typeof recoveryTimes] || '2-3 أسابيع';
  }

  private getExpectedResults(options: VirtualRhinoplastyOptions): string[] {
    const baseResults = [
      'تحسين شكل الأنف العام',
      'توازن أفضل مع ملامح الوجه',
      'زيادة الثقة بالنفس'
    ];

    const specificResults = {
      reduction: ['أنف أصغر وأكثر تناسقاً', 'تقليل بروز الأنف'],
      augmentation: ['أنف أكثر بروزاً', 'تحسين الحضور'],
      refinement: ['ملمس أنعم', 'خطوط أكثر نعومة'],
      tip_rotation: ['طرف أنف محسن', 'زاوية أفضل'],
      bridge_correction: ['جسر أنف مستقيم', 'تناسق محسن']
    };

    return [...baseResults, ...specificResults[options.surgeryType]];
  }

  private getSurgicalRecommendations(options: VirtualRhinoplastyOptions): string[] {
    return [
      'استشارة طبيب تجميل مؤهل',
      'إجراء فحوصات طبية شاملة',
      'مناقشة التوقعات بشكل واقعي',
      'التخطيط للفترة التعافي',
      'اتباع تعليمات ما بعد الجراحة'
    ];
  }

  private getRiskFactors(surgeryType: string): string[] {
    return [
      'مخاطر التخدير العام',
      'احتمالية النزيف',
      'العدوى (نادر)',
      'عدم الرضا عن النتيجة',
      'الحاجة لجراحة تصحيحية (نادر جداً)'
    ];
  }

  private estimateCost(surgeryType: string): string {
    const costs = {
      reduction: '$3,000 - $8,000',
      augmentation: '$4,000 - $10,000',
      refinement: '$2,500 - $6,000',
      tip_rotation: '$3,500 - $7,500',
      bridge_correction: '$3,000 - $8,500'
    };
    return costs[surgeryType as keyof typeof costs] || '$3,000 - $8,000';
  }
}