import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Eye, 
  Palette,
  Smile,
  Circle,
  Square,
  Triangle,
  Brush,
  Eraser,
  Undo2,
  Download,
  Share2
} from "lucide-react";

interface MakeupArea {
  id: string;
  type: 'lips' | 'eyes' | 'cheeks' | 'eyebrows' | 'forehead';
  coordinates: { x: number; y: number; width: number; height: number };
  color: string;
  intensity: number;
}

export function MakeupAreaSelector() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<'select' | 'brush' | 'eraser'>('select');
  const [selectedArea, setSelectedArea] = useState<string>('lips');
  const [selectedColor, setSelectedColor] = useState('#ff6b9d');
  const [brushSize, setBrushSize] = useState([15]);
  const [intensity, setIntensity] = useState([70]);
  const [makeupAreas, setMakeupAreas] = useState<MakeupArea[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = [
    { name: 'أحمر كلاسيكي', value: '#ff6b9d', type: 'lips' },
    { name: 'وردي طبيعي', value: '#ffb3d9', type: 'lips' },
    { name: 'أحمر داكن', value: '#cc0052', type: 'lips' },
    { name: 'برتقالي', value: '#ff8566', type: 'lips' },
    { name: 'أزرق عيون', value: '#4dabf7', type: 'eyes' },
    { name: 'بني دخان', value: '#8b6914', type: 'eyes' },
    { name: 'أخضر زمردي', value: '#37b24d', type: 'eyes' },
    { name: 'بنفسجي', value: '#9c88ff', type: 'eyes' },
    { name: 'وردي خدود', value: '#ffc9c9', type: 'cheeks' },
    { name: 'خوخي', value: '#ffdecc', type: 'cheeks' }
  ];

  const makeupTypes = [
    { id: 'lips', name: 'الشفاه', icon: <Smile className="w-4 h-4" />, color: 'bg-red-500' },
    { id: 'eyes', name: 'العيون', icon: <Eye className="w-4 h-4" />, color: 'bg-blue-500' },
    { id: 'cheeks', name: 'الخدود', icon: <Circle className="w-4 h-4" />, color: 'bg-pink-500' },
    { id: 'eyebrows', name: 'الحواجب', icon: <Square className="w-4 h-4" />, color: 'bg-brown-500' },
    { id: 'forehead', name: 'الجبهة', icon: <Triangle className="w-4 h-4" />, color: 'bg-yellow-500' }
  ];

  const tools = [
    { id: 'select', name: 'تحديد', icon: <Circle className="w-4 h-4" /> },
    { id: 'brush', name: 'فرشاة', icon: <Brush className="w-4 h-4" /> },
    { id: 'eraser', name: 'ممحاة', icon: <Eraser className="w-4 h-4" /> }
  ];

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCanvasMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool === 'select') return;
    setIsDrawing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = brushSize[0];
    ctx.lineCap = 'round';
  }, [selectedTool, selectedColor, brushSize]);

  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedTool !== 'brush') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, selectedTool]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const applyMakeup = async () => {
    if (!selectedImage) return;

    // Here you would send the canvas data and image to your backend
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    
    try {
      const response = await fetch('/api/apply-area-makeup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalImage: selectedImage,
          makeupData: imageData,
          areas: makeupAreas,
          intensity: intensity[0]
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Handle success - maybe show the result
        console.log('Makeup applied successfully');
      }
    } catch (error) {
      console.error('Error applying makeup:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6" dir="rtl">
      <Card className="shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
          <CardTitle className="text-2xl text-center">
            💄 استوديو المكياج الافتراضي المتقدم
          </CardTitle>
          <p className="text-center opacity-90">
            حدد المناطق وطبق المكياج بدقة احترافية
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Image Upload & Canvas Area */}
            <div className="lg:col-span-2">
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                {!selectedImage ? (
                  <div className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">ارفع صورة لبدء تطبيق المكياج</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button className="cursor-pointer">
                          اختر صورة
                        </Button>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected" 
                      className="w-full rounded-lg"
                      style={{ maxHeight: '500px', objectFit: 'contain' }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      width={800}
                      height={600}
                    />
                  </div>
                )}
              </div>

              {/* Tool Controls */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex gap-2">
                  {tools.map((tool) => (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTool(tool.id as any)}
                      className="flex items-center gap-2"
                    >
                      {tool.icon}
                      {tool.name}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <Undo2 className="w-4 h-4 ml-1" />
                    مسح
                  </Button>
                  <Button size="sm" onClick={applyMakeup}>
                    <Palette className="w-4 h-4 ml-1" />
                    تطبيق المكياج
                  </Button>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Makeup Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">نوع المكياج</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {makeupTypes.map((type) => (
                      <Button
                        key={type.id}
                        variant={selectedArea === type.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedArea(type.id)}
                        className="justify-start"
                      >
                        {type.icon}
                        <span className="mr-2">{type.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Color Palette */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">لوحة الألوان</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color.value 
                            ? 'border-gray-800 scale-110' 
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setSelectedColor(color.value)}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <label className="text-sm">لون مخصص:</label>
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Brush Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إعدادات الفرشاة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      حجم الفرشاة: {brushSize[0]}px
                    </label>
                    <Slider
                      value={brushSize}
                      onValueChange={setBrushSize}
                      max={50}
                      min={5}
                      step={1}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      شدة المكياج: {intensity[0]}%
                    </label>
                    <Slider
                      value={intensity}
                      onValueChange={setIntensity}
                      max={100}
                      min={10}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <Download className="w-4 h-4 ml-2" />
                  حفظ النتيجة
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 ml-2" />
                  مشاركة
                </Button>
              </div>

              {/* Current Settings Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">الإعدادات الحالية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>النوع:</span>
                    <Badge variant="secondary">
                      {makeupTypes.find(t => t.id === selectedArea)?.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الأداة:</span>
                    <Badge variant="secondary">
                      {tools.find(t => t.id === selectedTool)?.name}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>اللون:</span>
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}