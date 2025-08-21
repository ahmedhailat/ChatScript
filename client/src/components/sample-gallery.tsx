import { Images } from "lucide-react";

export default function SampleGallery() {
  const sampleCases = [
    {
      id: 1,
      title: "تجميل الأنف",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      alt: "نموذج تجميل الأنف قبل وبعد"
    },
    {
      id: 2,
      title: "ترميم الأسنان",
      image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      alt: "نموذج ترميم الأسنان"
    },
    {
      id: 3,
      title: "نحت الوجه",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      alt: "نموذج نحت الوجه"
    },
    {
      id: 4,
      title: "إزالة الندبات",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
      alt: "نموذج علاج إزالة الندبات"
    }
  ];

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6" dir="rtl">
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
        <Images className="text-medical-blue ml-3 w-5 h-5" />
        معرض نماذج التحولات
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sampleCases.map((case_) => (
          <div key={case_.id} className="group cursor-pointer" data-testid={`gallery-item-${case_.id}`}>
            <div className="relative overflow-hidden rounded-lg border border-slate-200 hover:shadow-lg transition-all">
              <img 
                src={case_.image}
                alt={case_.alt}
                className="w-full h-32 object-cover"
                data-testid={`img-sample-${case_.id}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-3 right-3 text-white">
                  <p className="font-medium text-sm">{case_.title}</p>
                  <p className="text-xs opacity-75">عرض التفاصيل</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
