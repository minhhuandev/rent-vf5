import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Phone, MessageCircle, CheckCircle2, Zap, Users, Car, Wind, Monitor, ShieldCheck, MapPin, ArrowRight, Star } from 'lucide-react';

const iconMap: Record<string, any> = {
  Zap, Users, Car, Wind, Monitor, ShieldCheck
};

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center">Error loading data</div>;
  }

  const { banner, intro, features, specs, pricing, contact, gallery, reviews } = data;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
      
      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-nav py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {banner?.logoUrl ? (
            <img src={banner.logoUrl} alt="Logo" className="h-8 md:h-10 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="text-2xl font-bold tracking-tighter text-white mix-blend-difference">VF5 Rental</div>
          )}
          <div className="hidden md:flex items-center space-x-6">
            <a href={`tel:${contact?.phone}`} className="text-sm font-medium hover:text-blue-600 transition-colors text-white mix-blend-difference">Hotline: {contact?.phone}</a>
            <a href={`https://zalo.me/${contact?.zalo}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40">
              Đặt Xe Ngay
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
        <motion.div style={{ y: y1, opacity: opacity1 }} className="absolute inset-0">
          <img 
            src={banner?.imageUrl || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop'} 
            alt="VinFast VF5" 
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#FAFAFA]" />
        </motion.div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-16 md:mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-4 md:mb-6 tracking-wide uppercase">
              Trải nghiệm xe điện thông minh
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tighter leading-[1.1]">
              {banner?.title || 'Cho Thuê Xe VinFast VF5'}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto font-light">
              {banner?.subtitle || 'Trải nghiệm xe điện gia đình êm ái, tiết kiệm'}
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex justify-center mb-6 md:mb-8"
            >
              <img 
                src={banner?.carImageUrl || "https://vinfast-haiphong.com.vn/wp-content/uploads/2023/04/vinfast-vf5-plus-mau-xanh-blue.png"} 
                alt="VinFast VF5 Plus" 
                className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] lg:max-w-[420px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = "https://vinfasthadong.com.vn/wp-content/uploads/2022/12/vf5-plus-mau-xanh-blue.png";
                }}
              />
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href={`tel:${contact?.phone}`}
                className="group flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-white text-black hover:bg-gray-100 transition-all w-full sm:w-auto"
              >
                <Phone className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                {banner?.ctaText || 'Gọi Ngay'}
              </a>
              <a 
                href={`https://zalo.me/${contact?.zalo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all w-full sm:w-auto shadow-xl shadow-blue-600/20"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat Zalo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-4xl mx-auto relative z-20 -mt-12 md:-mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="glass-card p-6 sm:p-10 md:p-16 rounded-3xl text-center shadow-2xl shadow-black/5"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6 tracking-tight">{intro?.title}</h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-light">
            {intro?.description}
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Tiện Ích Nổi Bật</h2>
            <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">Những trang bị công nghệ và tiện nghi hàng đầu trên VinFast VF5 giúp chuyến đi của bạn thêm phần trọn vẹn.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {features?.map((feature: any, idx: number) => {
              const IconComponent = iconMap[feature.icon] || CheckCircle2;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-6 md:p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <IconComponent className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Specs & Pricing - Split Layout */}
      <section className="py-16 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-stretch">
          
          {/* Specs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-center"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">Thông Số Kỹ Thuật</h2>
            <p className="text-sm md:text-base text-slate-500 mb-8 md:mb-10">Chi tiết về dòng xe VinFast VF5 Plus</p>
            
            <div className="space-y-6">
              {[
                { label: 'Tên xe', value: specs?.name },
                { label: 'Loại xe', value: specs?.type },
                { label: 'Số chỗ ngồi', value: specs?.seats },
                { label: 'Quãng đường', value: specs?.range }
              ].map((spec, idx) => (
                <div key={idx} className="flex justify-between items-end border-b border-slate-100 pb-4 group">
                  <span className="text-slate-500 font-medium">{spec.label}</span>
                  <span className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{spec.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900 p-6 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col justify-center mt-2 lg:mt-0"
          >
            {/* Decorative blur */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight">Bảng Giá Thuê Xe</h2>
              <p className="text-sm md:text-base text-slate-400 mb-8 md:mb-10">Linh hoạt theo nhu cầu của bạn</p>
              
              <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                {[
                  { label: 'Theo Ngày', value: pricing?.daily },
                  { label: 'Theo Tuần', value: pricing?.weekly },
                  { label: 'Theo Tháng', value: pricing?.monthly }
                ].map((price, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                    <span className="text-slate-300 font-medium">{price.label}</span>
                    <div className="text-right">
                      <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">{price.value}</span>
                      <span className="text-sm text-slate-400 ml-1">VNĐ</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-500/20 border border-blue-500/30 p-5 rounded-2xl text-sm text-blue-100 flex items-start">
                <ShieldCheck className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <p><strong className="text-white">Lưu ý:</strong> {pricing?.note}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      {gallery && gallery.length > 0 && (
        <section className="py-16 md:py-24 bg-white px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 md:mb-12">
              <div className="text-center md:text-left w-full">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Hình Ảnh Thực Tế</h2>
                <p className="text-base md:text-lg text-slate-500">Khám phá vẻ đẹp và nội thất của VinFast VF5</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {gallery.map((img: any, idx: number) => (
                <motion.div 
                  key={img.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 relative"
                >
                  <img 
                    src={img.url} 
                    alt="Gallery" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <section className="py-16 md:py-24 bg-slate-50 px-4 md:px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight mb-4">Khách Hàng Nói Gì</h2>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto">Hàng trăm khách hàng đã tin tưởng và hài lòng với dịch vụ của chúng tôi.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {reviews.map((review: any, idx: number) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative"
                >
                  <div className="absolute top-8 right-8 text-slate-100">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.017 21L16.411 14.182C16.411 14.182 15.341 14.182 14.017 14.182C12.693 14.182 12.693 11.454 14.017 11.454C15.341 11.454 19.318 11.454 19.318 11.454C19.318 11.454 19.318 14.182 19.318 21H14.017ZM4.699 21L7.093 14.182C7.093 14.182 6.023 14.182 4.699 14.182C3.375 14.182 3.375 11.454 4.699 11.454C6.023 11.454 10 11.454 10 11.454C10 11.454 10 14.182 10 21H4.699Z" />
                    </svg>
                  </div>
                  
                  <div className="flex text-yellow-400 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  
                  <p className="text-slate-700 text-lg mb-8 leading-relaxed relative z-10">"{review.comment}"</p>
                  
                  <div className="flex items-center space-x-4 mt-auto">
                    {review.avatarUrl ? (
                      <img src={review.avatarUrl} alt={review.customerName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-xl border-2 border-white shadow-md">
                        {review.customerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900">{review.customerName}</h4>
                      <p className="text-sm text-slate-500">Khách hàng thuê xe</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section / Footer CTA */}
      <section className="py-16 md:py-24 bg-white px-4 md:px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto bg-blue-600 rounded-[2rem] md:rounded-[3rem] p-8 sm:p-10 md:p-20 text-center text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 tracking-tight">Sẵn Sàng Khởi Hành?</h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 md:mb-12 max-w-2xl mx-auto font-light">Liên hệ ngay hôm nay để nhận tư vấn và đặt xe nhanh chóng với mức giá ưu đãi nhất.</p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center mb-6 md:mb-8"
            >
              <img 
                src={banner?.carImageUrl || "https://vinfast-haiphong.com.vn/wp-content/uploads/2023/04/vinfast-vf5-plus-mau-xanh-blue.png"} 
                alt="VinFast VF5 Plus" 
                className="w-full max-w-[250px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[400px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.src = "https://vinfasthadong.com.vn/wp-content/uploads/2022/12/vf5-plus-mau-xanh-blue.png";
                }}
              />
            </motion.div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6">
              <a 
                href={`tel:${contact?.phone}`}
                className="flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-slate-50 hover:scale-105 transition-all w-full sm:w-auto shadow-xl"
              >
                <Phone className="w-6 h-6 mr-3" />
                {contact?.phone}
              </a>
              <a 
                href={`https://zalo.me/${contact?.zalo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-8 py-4 bg-blue-500 text-white border border-blue-400 rounded-full font-bold text-lg hover:bg-blue-400 hover:scale-105 transition-all w-full sm:w-auto"
              >
                <MessageCircle className="w-6 h-6 mr-3" />
                Chat Zalo Ngay
              </a>
            </div>
            
            <div className="mt-12 inline-flex items-center justify-center px-6 py-3 bg-blue-700/50 rounded-full text-blue-100 backdrop-blur-sm border border-blue-500/30">
              <MapPin className="w-5 h-5 mr-2 text-blue-300" />
              <span>{contact?.address}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 pb-28 md:pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            {banner?.logoUrl ? (
              <img src={banner.logoUrl} alt="Logo" className="h-8 object-contain opacity-80 grayscale hover:grayscale-0 transition-all" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xl font-bold text-white tracking-tighter">VF5 Rental</span>
            )}
          </div>
          <p className="text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} VF5 Rental. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </footer>

      {/* Fixed Bottom CTA for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 md:hidden flex gap-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <a 
          href={`tel:${contact?.phone}`}
          className="flex-1 flex items-center justify-center py-3.5 px-2 bg-slate-900 text-white rounded-2xl font-semibold active:scale-95 transition-transform text-sm sm:text-base"
        >
          <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Gọi Ngay
        </a>
        <a 
          href={`https://zalo.me/${contact?.zalo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center py-3.5 px-2 bg-blue-600 text-white rounded-2xl font-semibold active:scale-95 transition-transform shadow-lg shadow-blue-600/30 text-sm sm:text-base"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Zalo
        </a>
      </div>
    </div>
  );
}
