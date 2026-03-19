import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, CheckCircle2, Zap, Users, Car, Wind, Monitor, ShieldCheck, MapPin } from 'lucide-react';

const iconMap: Record<string, any> = {
  Zap, Users, Car, Wind, Monitor, ShieldCheck
};

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public-data')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Error loading data</div>;
  }

  const { banner, intro, features, specs, pricing, contact, gallery } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Banner */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Header / Logo */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 max-w-7xl mx-auto flex justify-between items-center">
          {banner?.logoUrl && (
            <motion.img 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              src={banner.logoUrl} 
              alt="Logo" 
              className="h-10 md:h-14 object-contain" 
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        <div className="absolute inset-0">
          <img 
            src={banner?.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop'} 
            alt="VinFast VF5" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            {banner?.title || 'Cho Thuê Xe VinFast VF5'}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 mb-10"
          >
            {banner?.subtitle || 'Trải nghiệm xe điện gia đình êm ái, tiết kiệm'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a 
              href={`tel:${contact?.phone}`}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-5 h-5 mr-2" />
              {banner?.ctaText || 'Gọi Ngay'}
            </a>
            <a 
              href={`https://zalo.me/${contact?.zalo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat Zalo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{intro?.title}</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {intro?.description}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Tiện Ích Nổi Bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features?.map((feature: any, idx: number) => {
              const IconComponent = iconMap[feature.icon] || CheckCircle2;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specs & Pricing */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Specs */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Thông Số Xe</h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Tên xe</span>
                <span className="font-semibold text-gray-900">{specs?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Loại xe</span>
                <span className="font-semibold text-gray-900">{specs?.type}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <span className="text-gray-500">Số chỗ ngồi</span>
                <span className="font-semibold text-gray-900">{specs?.seats}</span>
              </div>
              <div className="flex justify-between items-center pb-4">
                <span className="text-gray-500">Quãng đường</span>
                <span className="font-semibold text-gray-900">{specs?.range}</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-8">Bảng Giá Thuê</h2>
            <div className="space-y-6 mb-8">
              <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                <span className="text-blue-100">Theo Ngày</span>
                <span className="text-2xl font-bold">{pricing?.daily} VNĐ</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-500/50 pb-4">
                <span className="text-blue-100">Theo Tuần</span>
                <span className="text-2xl font-bold">{pricing?.weekly} VNĐ</span>
              </div>
              <div className="flex justify-between items-center pb-4">
                <span className="text-blue-100">Theo Tháng</span>
                <span className="text-2xl font-bold">{pricing?.monthly} VNĐ</span>
              </div>
            </div>
            <div className="bg-blue-700/50 p-4 rounded-xl text-sm text-blue-100">
              <p><strong>Lưu ý:</strong> {pricing?.note}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery && gallery.length > 0 && (
        <section className="py-20 bg-white px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Hình Ảnh Thực Tế</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img: any) => (
                <div key={img.id} className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                  <img 
                    src={img.url} 
                    alt="Gallery" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Liên Hệ Đặt Xe</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
              <Phone className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">Hotline</p>
              <p className="text-lg font-bold text-gray-900">{contact?.phone}</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">Zalo</p>
              <p className="text-lg font-bold text-gray-900">{contact?.zalo}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center text-gray-600">
          <MapPin className="w-5 h-5 mr-2" />
          {contact?.address}
        </div>
      </section>

      {/* Fixed Bottom CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden flex gap-3">
        <a 
          href={`tel:${contact?.phone}`}
          className="flex-1 flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold active:bg-blue-700 transition-colors"
        >
          <Phone className="w-5 h-5 mr-2" />
          Gọi Ngay
        </a>
        <a 
          href={`https://zalo.me/${contact?.zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold active:bg-blue-600 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Zalo
        </a>
      </div>
    </div>
  );
}
