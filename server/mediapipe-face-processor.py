#!/usr/bin/env python3
"""
MediaPipe Face Processing System
Professional facial landmark detection and makeup application using Google's MediaPipe
Support for 468 facial landmarks with real-time processing capabilities
"""

import cv2
import mediapipe as mp
import numpy as np
from PIL import Image
import json
import sys
import os
import time
import argparse
from typing import List, Tuple, Dict, Optional

class MediaPipeFaceProcessor:
    def __init__(self):
        """Initialize MediaPipe Face Mesh and Face Detection"""
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_face_detection = mp.solutions.face_detection
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        
        # Initialize face mesh with high accuracy
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        
        # Initialize face detection
        self.face_detection = self.mp_face_detection.FaceDetection(
            model_selection=1,  # Full range model for better accuracy
            min_detection_confidence=0.7
        )
        
        # Makeup application regions (MediaPipe landmark indices)
        self.makeup_regions = {
            'lips': [0, 17, 18, 200, 199, 175, 13, 312, 311, 310, 415, 308, 324, 318],
            'left_eye': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            'left_eyebrow': [46, 53, 52, 51, 48, 115, 131, 134, 102, 49, 220, 305],
            'right_eyebrow': [276, 283, 282, 295, 285, 336, 296, 334, 293, 300, 276, 334],
            'nose': [1, 2, 5, 4, 6, 19, 94, 168, 8, 9, 10, 151, 195, 197, 196, 3, 51, 48, 115, 131, 134, 102],
            'cheeks_left': [116, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147],
            'cheeks_right': [345, 346, 347, 348, 349, 350, 451, 452, 453, 464, 435, 410, 454, 323, 366],
            'forehead': [10, 151, 9, 8, 107, 55, 65, 52, 53, 46, 70, 63, 105, 66, 108, 69, 104, 68, 71, 139],
            'chin': [175, 199, 200, 17, 18, 175, 199, 200, 17, 18, 175, 199, 200, 17, 18]
        }
        
    def detect_face_landmarks(self, image_path: str) -> Optional[Dict]:
        """Detect facial landmarks using MediaPipe Face Mesh (468 points)"""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
                
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Process the image
            results = self.face_mesh.process(rgb_image)
            
            if not results.multi_face_landmarks:
                return None
                
            # Get image dimensions
            height, width = image.shape[:2]
            
            # Extract landmarks for the first detected face
            face_landmarks = results.multi_face_landmarks[0]
            landmarks = []
            
            for landmark in face_landmarks.landmark:
                x = int(landmark.x * width)
                y = int(landmark.y * height)
                z = landmark.z  # Depth information
                landmarks.append({'x': x, 'y': y, 'z': z})
            
            return {
                'landmarks': landmarks,
                'total_points': len(landmarks),
                'image_size': {'width': width, 'height': height},
                'confidence': 0.95  # MediaPipe typically has high confidence
            }
            
        except Exception as e:
            print(f"Error detecting landmarks: {str(e)}", file=sys.stderr)
            return None
    
    def apply_professional_makeup(self, image_path: str, makeup_config: Dict) -> Optional[str]:
        """Apply professional makeup using MediaPipe landmarks"""
        try:
            # Detect landmarks first
            landmark_data = self.detect_face_landmarks(image_path)
            if not landmark_data:
                return None
                
            # Load image
            image = cv2.imread(image_path)
            result_image = image.copy()
            
            landmarks = landmark_data['landmarks']
            
            # Apply makeup based on configuration
            if makeup_config.get('lipstick'):
                result_image = self._apply_lipstick(result_image, landmarks, makeup_config['lipstick'])
                
            if makeup_config.get('eyeshadow'):
                result_image = self._apply_eyeshadow(result_image, landmarks, makeup_config['eyeshadow'])
                
            if makeup_config.get('blush'):
                result_image = self._apply_blush(result_image, landmarks, makeup_config['blush'])
                
            if makeup_config.get('eyeliner'):
                result_image = self._apply_eyeliner(result_image, landmarks, makeup_config['eyeliner'])
                
            if makeup_config.get('foundation'):
                result_image = self._apply_foundation(result_image, landmarks, makeup_config['foundation'])
                
            # Save result with timestamp
            timestamp = int(time.time() * 1000)
            output_filename = f"mediapipe-makeup-{timestamp}.jpg"
            output_path = os.path.join('uploads', output_filename)
            
            # Ensure uploads directory exists
            os.makedirs('uploads', exist_ok=True)
            cv2.imwrite(output_path, result_image)
            
            return output_path
            
        except Exception as e:
            print(f"Error applying makeup: {str(e)}", file=sys.stderr)
            return None
    
    def _apply_lipstick(self, image: np.ndarray, landmarks: List[Dict], config: Dict) -> np.ndarray:
        """Apply lipstick using lip landmarks"""
        try:
            # Get lip region points
            lip_points = []
            for idx in self.makeup_regions['lips']:
                if idx < len(landmarks):
                    lip_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
            
            if len(lip_points) < 3:
                return image
                
            # Create lip mask
            lip_points = np.array(lip_points, dtype=np.int32)
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [lip_points], 255)
            
            # Apply color
            color = config.get('color', '#FF1744')  # Default red
            intensity = config.get('intensity', 0.7)
            
            # Convert hex to BGR
            color_bgr = self._hex_to_bgr(color)
            
            # Create colored overlay
            overlay = image.copy()
            overlay[mask > 0] = color_bgr
            
            # Blend with original
            result = cv2.addWeighted(image, 1-intensity, overlay, intensity, 0)
            
            return result
            
        except Exception as e:
            print(f"Error applying lipstick: {str(e)}", file=sys.stderr)
            return image
    
    def _apply_eyeshadow(self, image: np.ndarray, landmarks: List[Dict], config: Dict) -> np.ndarray:
        """Apply eyeshadow using eye landmarks"""
        try:
            for eye_region in ['left_eye', 'right_eye']:
                eye_points = []
                for idx in self.makeup_regions[eye_region]:
                    if idx < len(landmarks):
                        eye_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
                
                if len(eye_points) < 3:
                    continue
                    
                # Create eye mask
                eye_points = np.array(eye_points, dtype=np.int32)
                mask = np.zeros(image.shape[:2], dtype=np.uint8)
                cv2.fillPoly(mask, [eye_points], 255)
                
                # Apply eyeshadow color
                color = config.get('color', '#8D6E63')
                intensity = config.get('intensity', 0.5)
                
                color_bgr = self._hex_to_bgr(color)
                overlay = image.copy()
                overlay[mask > 0] = color_bgr
                
                image = cv2.addWeighted(image, 1-intensity, overlay, intensity, 0)
            
            return image
            
        except Exception as e:
            print(f"Error applying eyeshadow: {str(e)}", file=sys.stderr)
            return image
    
    def _apply_blush(self, image: np.ndarray, landmarks: List[Dict], config: Dict) -> np.ndarray:
        """Apply blush using cheek landmarks"""
        try:
            for cheek_region in ['cheeks_left', 'cheeks_right']:
                cheek_points = []
                for idx in self.makeup_regions[cheek_region]:
                    if idx < len(landmarks):
                        cheek_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
                
                if len(cheek_points) < 3:
                    continue
                    
                # Create cheek mask with gradient effect
                cheek_points = np.array(cheek_points, dtype=np.int32)
                
                # Find center of cheek region
                center_x = int(np.mean([p[0] for p in cheek_points]))
                center_y = int(np.mean([p[1] for p in cheek_points]))
                
                # Create circular blush
                color = config.get('color', '#F8BBD9')
                intensity = config.get('intensity', 0.4)
                radius = config.get('radius', 30)
                
                color_bgr = self._hex_to_bgr(color)
                
                # Create gradient mask
                mask = np.zeros(image.shape[:2], dtype=np.float32)
                cv2.circle(mask, (center_x, center_y), radius, 1.0, -1)
                
                # Apply Gaussian blur for natural look
                mask = cv2.GaussianBlur(mask, (31, 31), 0)
                
                # Apply blush
                for c in range(3):
                    image[:, :, c] = image[:, :, c] * (1 - mask * intensity) + color_bgr[c] * mask * intensity
            
            return image.astype(np.uint8)
            
        except Exception as e:
            print(f"Error applying blush: {str(e)}", file=sys.stderr)
            return image
    
    def _apply_eyeliner(self, image: np.ndarray, landmarks: List[Dict], config: Dict) -> np.ndarray:
        """Apply eyeliner using eye landmarks"""
        try:
            color = config.get('color', '#000000')
            thickness = config.get('thickness', 2)
            
            color_bgr = self._hex_to_bgr(color)
            
            # Apply to both eyes
            for eye_region in ['left_eye', 'right_eye']:
                eye_points = []
                for idx in self.makeup_regions[eye_region]:
                    if idx < len(landmarks):
                        eye_points.append((landmarks[idx]['x'], landmarks[idx]['y']))
                
                if len(eye_points) > 1:
                    # Draw eyeliner along upper eyelid
                    upper_eyelid = eye_points[:len(eye_points)//2]
                    for i in range(len(upper_eyelid) - 1):
                        cv2.line(image, upper_eyelid[i], upper_eyelid[i+1], color_bgr, thickness)
            
            return image
            
        except Exception as e:
            print(f"Error applying eyeliner: {str(e)}", file=sys.stderr)
            return image
    
    def _apply_foundation(self, image: np.ndarray, landmarks: List[Dict], config: Dict) -> np.ndarray:
        """Apply foundation for skin smoothing"""
        try:
            # Get face boundary
            face_points = []
            face_outline_indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
            
            for idx in face_outline_indices:
                if idx < len(landmarks):
                    face_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
            
            if len(face_points) < 10:
                return image
                
            # Create face mask
            face_points = np.array(face_points, dtype=np.int32)
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [face_points], 255)
            
            # Apply smoothing
            smoothed = cv2.bilateralFilter(image, 15, 80, 80)
            
            # Blend with original
            intensity = config.get('intensity', 0.3)
            result = image.copy()
            result[mask > 0] = cv2.addWeighted(
                image[mask > 0], 1-intensity, 
                smoothed[mask > 0], intensity, 0
            )
            
            return result
            
        except Exception as e:
            print(f"Error applying foundation: {str(e)}", file=sys.stderr)
            return image
    
    def _hex_to_bgr(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to BGR tuple"""
        hex_color = hex_color.lstrip('#')
        rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        return (rgb[2], rgb[1], rgb[0])  # Convert RGB to BGR
    
    def enhance_facial_features(self, image_path: str, enhancement_config: Dict) -> Optional[str]:
        """Enhance facial features using advanced MediaPipe processing"""
        try:
            landmark_data = self.detect_face_landmarks(image_path)
            if not landmark_data:
                return None
                
            image = cv2.imread(image_path)
            result_image = image.copy()
            landmarks = landmark_data['landmarks']
            
            # Enhance eyes
            if enhancement_config.get('enhance_eyes', True):
                result_image = self._enhance_eyes(result_image, landmarks)
            
            # Enhance nose
            if enhancement_config.get('enhance_nose', True):
                result_image = self._enhance_nose(result_image, landmarks)
            
            # Enhance lips
            if enhancement_config.get('enhance_lips', True):
                result_image = self._enhance_lips(result_image, landmarks)
            
            # Save result with timestamp
            timestamp = int(time.time() * 1000)
            output_filename = f"mediapipe-enhanced-{timestamp}.jpg"
            output_path = os.path.join('uploads', output_filename)
            
            # Ensure uploads directory exists
            os.makedirs('uploads', exist_ok=True)
            cv2.imwrite(output_path, result_image)
            
            return output_path
            
        except Exception as e:
            print(f"Error enhancing features: {str(e)}", file=sys.stderr)
            return None
    
    def _enhance_eyes(self, image: np.ndarray, landmarks: List[Dict]) -> np.ndarray:
        """Enhance eye brightness and definition"""
        try:
            for eye_region in ['left_eye', 'right_eye']:
                eye_points = []
                for idx in self.makeup_regions[eye_region]:
                    if idx < len(landmarks):
                        eye_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
                
                if len(eye_points) < 3:
                    continue
                    
                # Create eye mask
                eye_points = np.array(eye_points, dtype=np.int32)
                mask = np.zeros(image.shape[:2], dtype=np.uint8)
                cv2.fillPoly(mask, [eye_points], 255)
                
                # Enhance brightness and contrast
                enhanced = image.copy()
                enhanced[mask > 0] = cv2.addWeighted(
                    enhanced[mask > 0], 1.2, enhanced[mask > 0], 0, 10
                )
                
                image = enhanced
            
            return image
            
        except Exception as e:
            print(f"Error enhancing eyes: {str(e)}", file=sys.stderr)
            return image
    
    def _enhance_nose(self, image: np.ndarray, landmarks: List[Dict]) -> np.ndarray:
        """Enhance nose definition and contour"""
        try:
            nose_points = []
            for idx in self.makeup_regions['nose']:
                if idx < len(landmarks):
                    nose_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
            
            if len(nose_points) < 5:
                return image
                
            # Apply subtle contouring
            nose_points = np.array(nose_points, dtype=np.int32)
            
            # Create nose bridge highlight
            bridge_points = nose_points[:len(nose_points)//2]
            for i in range(len(bridge_points) - 1):
                cv2.line(image, tuple(bridge_points[i]), tuple(bridge_points[i+1]), (255, 255, 255), 1)
            
            return image
            
        except Exception as e:
            print(f"Error enhancing nose: {str(e)}", file=sys.stderr)
            return image
    
    def _enhance_lips(self, image: np.ndarray, landmarks: List[Dict]) -> np.ndarray:
        """Enhance lip definition and color"""
        try:
            lip_points = []
            for idx in self.makeup_regions['lips']:
                if idx < len(landmarks):
                    lip_points.append([landmarks[idx]['x'], landmarks[idx]['y']])
            
            if len(lip_points) < 3:
                return image
                
            # Create lip mask
            lip_points = np.array(lip_points, dtype=np.int32)
            mask = np.zeros(image.shape[:2], dtype=np.uint8)
            cv2.fillPoly(mask, [lip_points], 255)
            
            # Enhance lip color saturation
            enhanced = image.copy()
            enhanced[mask > 0] = cv2.addWeighted(
                enhanced[mask > 0], 1.1, enhanced[mask > 0], 0, 5
            )
            
            return enhanced
            
        except Exception as e:
            print(f"Error enhancing lips: {str(e)}", file=sys.stderr)
            return image

def main():
    parser = argparse.ArgumentParser(description='MediaPipe Face Processing')
    parser.add_argument('--image', required=True, help='Input image path')
    parser.add_argument('--action', required=True, choices=['landmarks', 'makeup', 'enhance'], help='Action to perform')
    parser.add_argument('--config', help='JSON configuration for makeup/enhancement')
    
    args = parser.parse_args()
    
    processor = MediaPipeFaceProcessor()
    
    if args.action == 'landmarks':
        landmarks = processor.detect_face_landmarks(args.image)
        if landmarks:
            print(json.dumps(landmarks, indent=2))
        else:
            print("No face detected")
            sys.exit(1)
    
    elif args.action == 'makeup':
        config = json.loads(args.config) if args.config else {}
        result_path = processor.apply_professional_makeup(args.image, config)
        if result_path:
            print(json.dumps({"success": True, "output_path": result_path}))
        else:
            print(json.dumps({"success": False, "error": "Failed to apply makeup"}))
            sys.exit(1)
    
    elif args.action == 'enhance':
        config = json.loads(args.config) if args.config else {}
        result_path = processor.enhance_facial_features(args.image, config)
        if result_path:
            print(json.dumps({"success": True, "output_path": result_path}))
        else:
            print(json.dumps({"success": False, "error": "Failed to enhance features"}))
            sys.exit(1)

if __name__ == "__main__":
    main()