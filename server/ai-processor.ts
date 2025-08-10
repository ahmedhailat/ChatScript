import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface SurgicalVisualizationRequest {
  imageUrl: string;
  procedureType: 'rhinoplasty' | 'dental' | 'facelift' | 'scar_removal';
  intensity: number;
  specificAdjustments?: {
    noseWidth?: number;
    noseLength?: number;
    teethAlignment?: number;
    teethWhitening?: number;
  };
}

export interface MakeupApplicationRequest {
  imageUrl: string;
  makeupType: 'lipstick' | 'eyeshadow' | 'blush' | 'foundation' | 'eyeliner' | 'mascara';
  color: string;
  intensity: number;
}

export class AIProcessor {
  
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  private readonly model = "gpt-4o";

  async generateSurgicalVisualization(request: SurgicalVisualizationRequest): Promise<string> {
    try {
      // Read the image file
      const imageBuffer = fs.readFileSync(request.imageUrl);
      const base64Image = imageBuffer.toString('base64');

      const procedurePrompts = {
        rhinoplasty: `Create a realistic rhinoplasty visualization showing subtle nose reshaping. 
          Make the nose ${request.intensity > 60 ? 'more refined and smaller' : request.intensity < 40 ? 'slightly refined' : 'naturally refined'}. 
          Focus on: bridge smoothing, tip refinement, nostril adjustment. 
          Keep the result natural and medically realistic.`,
        
        dental: `Generate a dental restoration visualization showing improved teeth. 
          Apply ${request.intensity > 60 ? 'significant' : request.intensity < 40 ? 'mild' : 'moderate'} improvements including:
          - Teeth straightening and alignment
          - Natural whitening (not artificially white)
          - Gap closure if present
          - Proportional sizing
          Keep teeth looking natural and healthy.`,
        
        facelift: `Create a facelift visualization with ${request.intensity > 60 ? 'significant' : 'subtle'} improvements:
          - Skin tightening around jawline
          - Reduction of jowls
          - Smoothing of nasolabial folds
          - Natural facial contouring
          Maintain the person's natural features and expressions.`,
        
        scar_removal: `Generate scar removal/reduction visualization showing:
          - Diminished scar visibility
          - Improved skin texture
          - Natural skin tone matching
          - Realistic healing results
          Keep the improvement realistic and medically accurate.`
      };

      // Generate the surgical visualization using DALL-E with the base image as reference
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `You are a medical visualization AI that creates realistic before/after surgical previews. 
                     Provide detailed instructions for image editing that would show realistic surgical outcomes. 
                     Always maintain medical accuracy and realistic expectations.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${procedurePrompts[request.procedureType]} 
                      
                      Generate a detailed description of how this image should be modified to show realistic ${request.procedureType} results. 
                      Focus on specific anatomical changes that would occur with intensity level ${request.intensity}/100.
                      
                      Return your response as a JSON object with these fields:
                      {
                        "modifications": "detailed description of changes",
                        "dallePrompt": "DALL-E prompt for generating the after image",
                        "medicalNotes": "realistic expectations and notes"
                      }`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const aiAnalysis = JSON.parse(response.choices[0].message.content || '{}');

      // Generate the actual after image using DALL-E 3
      const dalleResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Medical visualization: ${aiAnalysis.dallePrompt} 
                Professional medical photography style, high quality, realistic lighting, 
                clinical accuracy, natural appearance`,
        size: "1024x1024",
        quality: "hd",
        n: 1,
      });

      return dalleResponse.data?.[0]?.url || '';

    } catch (error) {
      console.error('Error in surgical visualization:', error);
      throw new Error(`Failed to generate surgical visualization: ${error}`);
    }
  }

  async applyMakeup(request: MakeupApplicationRequest): Promise<string> {
    try {
      const imageBuffer = fs.readFileSync(request.imageUrl);
      const base64Image = imageBuffer.toString('base64');

      const makeupPrompts = {
        lipstick: `Apply ${request.color} lipstick with ${request.intensity}% intensity. 
                  Make lips look naturally enhanced with the specified color. 
                  Ensure proper lip line definition and natural shine.`,
        
        eyeshadow: `Apply ${request.color} eyeshadow with ${request.intensity}% intensity. 
                   Blend naturally across the eyelid, complement the eye shape. 
                   Use professional makeup application techniques.`,
        
        blush: `Apply ${request.color} blush with ${request.intensity}% intensity. 
               Place on cheek apples and blend toward temples. 
               Create a natural, healthy glow.`,
        
        foundation: `Apply ${request.color} foundation with ${request.intensity}% coverage. 
                    Even out skin tone naturally, reduce blemishes subtly. 
                    Maintain skin texture and natural appearance.`,
        
        eyeliner: `Apply ${request.color} eyeliner with ${request.intensity}% intensity. 
                  Define the eye shape naturally, enhance lash line. 
                  Keep application clean and professional.`,
        
        mascara: `Apply ${request.color} mascara with ${request.intensity}% intensity. 
                 Enhance lashes with length and volume naturally. 
                 Avoid clumping, maintain realistic appearance.`
      };

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system", 
            content: "You are a professional makeup artist AI that applies virtual makeup to photos realistically."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Apply virtual makeup to this photo: ${makeupPrompts[request.makeupType]}
                      
                      Generate a detailed description for DALL-E to apply this makeup effect.
                      Return as JSON:
                      {
                        "dallePrompt": "detailed DALL-E prompt for makeup application",
                        "makeupNotes": "professional makeup application notes"
                      }`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const makeupAnalysis = JSON.parse(response.choices[0].message.content || '{}');

      // Generate makeup application result
      const dalleResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Professional makeup photography: ${makeupAnalysis.dallePrompt}
                High-quality beauty photography, natural lighting, realistic makeup application,
                maintain facial features and expression`,
        size: "1024x1024", 
        quality: "hd",
        n: 1,
      });

      return dalleResponse.data?.[0]?.url || '';

    } catch (error) {
      console.error('Error in makeup application:', error);
      throw new Error(`Failed to apply makeup: ${error}`);
    }
  }

  async generateAgeProgression(imageUrl: string, targetAge: number): Promise<string> {
    try {
      const imageBuffer = fs.readFileSync(imageUrl);
      const base64Image = imageBuffer.toString('base64');

      const agePrompts = {
        young: "youth, smooth skin, bright eyes, full hair, vibrant appearance",
        adult: "mature features, slight wrinkles, natural aging, professional appearance", 
        middle: "middle-aged, defined lines, graying hair, dignified appearance",
        senior: "elderly, deep wrinkles, gray/white hair, age spots, wise appearance"
      };

      const ageCategory = targetAge < 30 ? 'young' : 
                         targetAge < 45 ? 'adult' : 
                         targetAge < 65 ? 'middle' : 'senior';

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Age progression to ${targetAge} years old: person with ${agePrompts[ageCategory]}.
                Realistic aging effects, maintain facial structure and identity,
                natural progression, high-quality portrait photography`,
        size: "1024x1024",
        quality: "hd", 
        n: 1,
      });

      return response.data?.[0]?.url || '';

    } catch (error) {
      console.error('Error in age progression:', error);
      throw new Error(`Failed to generate age progression: ${error}`);
    }
  }

  async analyzeImage(imageUrl: string): Promise<any> {
    try {
      const imageBuffer = fs.readFileSync(imageUrl);
      const base64Image = imageBuffer.toString('base64');

      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this medical/portrait photo for surgical planning. Identify:
                      - Facial features and proportions
                      - Areas suitable for enhancement
                      - Skin condition and texture
                      - Recommended procedures
                      
                      Return as JSON:
                      {
                        "faceShape": "description",
                        "skinCondition": "analysis", 
                        "suitableProcedures": ["list"],
                        "recommendations": "professional advice"
                      }`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('Error in image analysis:', error);
      throw new Error(`Failed to analyze image: ${error}`);
    }
  }
}

export const aiProcessor = new AIProcessor();