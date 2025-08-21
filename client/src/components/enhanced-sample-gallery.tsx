import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Heart, 
  Sparkles, 
  Download, 
  Share, 
  Eye,
  Palette,
  Camera,
  Wand2,
  Crown,
  Zap
} from "lucide-react";

export default function EnhancedSampleGallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'جميع النتائج', icon: <Star className="w-4 h-4" />, count: 48 },
    { id: 'makeup', name: 'مكياج', icon: <Palette className="w-4 h-4" />, count: 24 },
    { id: 'beauty', name: 'تجميل', icon: <Sparkles className="w-4 h-4" />, count: 16 },
    { id: 'transformation', name: 'تحويلات', icon: <Wand2 className="w-4 h-4" />, count: 8 }
  ];

  const sampleImages = [
    {
      id: 1,
      category: 'makeup',
      title: 'مكياج مسائي أنيق',
      description: 'تحويل طبيعي إلى إطلالة مسائية ساحرة',
      beforeImage: '/api/placeholder/300/400',
      afterImage: '/api/placeholder/300/400',
      effects: ['أحمر شفاه', 'ظلال عيون', 'أحمر خدود'],
      rating: 4.9,
      likes: 156,
      premium: true
    },
    {
      id: 2,
      category: 'beauty',
      title: 'تحسين الجمال الطبيعي',
      description: 'تنعيم البشرة وتحسين الملامح',
      beforeImage: '/api/placeholder/300/400',
      afterImage: '/api/placeholder/300/400',
      effects: ['تنعيم البشرة', 'تبييض الأسنان', 'إشراق العيون'],
      rating: 4.8,
      likes: 203,
      premium: false
    },
    {
      id: 3,
      category: 'transformation',
      title: 'تحويل العمر - أصغر بـ10 سنوات',
      description: 'تقنية متقدمة لتحويل عمري طبيعي',
      beforeImage: '/api/placeholder/300/400',
      afterImage: '/api/placeholder/300/400',
      effects: ['تحويل عمري', 'نعومة البشرة', 'إشراق طبيعي'],
      rating: 4.7,
      likes: 89,
      premium: true
    },
    {
      id: 4,
      category: 'makeup',
      title: 'مكياج عروس كلاسيكي',
      description: 'إطلالة عروس خالدة وأنيقة',
      beforeImage: '/api/placeholder/300/400',
      afterImage: '/api/placeholder/300/400',
      effects: ['مكياج كامل', 'هايلايت', 'كنتور'],
      rating: 5.0,
      likes: 342,
      premium: true
    },
    {
      id: 5,
      category: 'beauty',
      title: 'تحسين الأنف الطبيعي',
      description: 'تجميل الأنف بتقنية الذكاء الاصطناعي',
      beforeImage: '/api/placeholder/300/400',
      afterImage: '/api/placeholder/300/400',
      effects: ['تجميل الأنف', 'تحديد الملامح'],
      rating: 4.6,
      likes: 127,
      premium: true
    },
    {
      id: 6,
      category: 'transformation',
      title: 'تحويل جنسي أنثوي',
      description: 'تحويل الملامح لإطلالة أكثر أنوثة',
      beforeImage: '/api/placeholder/300/400',
      afterImage: '/api/placeholder/300/400',
      effects: ['تحويل جنسي', 'تنعيم الملامح', 'مكياج طبيعي'],
      rating: 4.5,
      likes: 98,
      premium: true
    }
  ];

  const filteredImages = selectedCategory === 'all' 
    ? sampleImages 
    : sampleImages.filter(img => img.category === selectedCategory);

  return (
    <Card className="p-6 card-enhanced" dir="rtl">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="ml-2 w-6 h-6 text-purple-600" />
            معرض النتائج الاحترافية
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100">
            48+ نتيجة
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">
        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 gap-2 interactive-tool ${
                selectedCategory === category.id 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : ''
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
              <Badge variant="secondary" className="bg-white/20">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Results grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((item) => (
            <Card key={item.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                {/* Before/After comparison */}
                <div className="relative h-64 bg-gradient-to-r from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex">
                    <div className="w-1/2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">قبل</span>
                      </div>
                    </div>
                    <div className="w-1/2 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-200 to-purple-200 flex items-center justify-center">
                        <span className="text-gray-700 text-sm">بعد</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white shadow-lg transform -translate-x-0.5" />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" variant="secondary" className="bg-white/90">
                        <Eye className="w-4 h-4 ml-1" />
                        عرض بالحجم الكامل
                      </Button>
                    </div>
                  </div>
                  
                  {/* Premium badge */}
                  {item.premium && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black animate-pulse-glow">
                        <Crown className="w-3 h-3 ml-1" />
                        Pro
                      </Badge>
                    </div>
                  )}
                  
                  {/* Rating */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1 gap-1 bg-black/70 text-white px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-sm">{item.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                    {item.description}
                  </p>
                  
                  {/* Effects tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.effects.map((effect, index) => (
                      <Badge 
                        key={index}
                        variant="secondary" 
                        className="bg-purple-50 text-purple-700 text-xs"
                      >
                        {effect}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 gap-3">
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-red-500">
                        <Heart className="w-4 h-4 ml-1" />
                        {item.likes}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-500 hover:text-blue-500">
                        <Share className="w-4 h-4 ml-1" />
                        مشاركة
                      </Button>
                    </div>
                    
                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Download className="w-4 h-4 ml-1" />
                      تطبيق
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Load more button */}
        <div className="text-center mt-8">
          <Button 
            size="lg" 
            variant="outline"
            className="px-8 py-3 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50"
          >
            <Zap className="ml-2 w-4 h-4" />
            عرض المزيد من النتائج
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">48</div>
            <div className="text-sm text-gray-600">نتيجة احترافية</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">1.2K+</div>
            <div className="text-sm text-gray-600">تطبيق ناجح</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">4.8</div>
            <div className="text-sm text-gray-600">متوسط التقييم</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">رضا العملاء</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}