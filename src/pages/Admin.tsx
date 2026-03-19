import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Image as ImageIcon, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('banner');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleChange = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFeatureChange = (index: number, field: string, value: string) => {
    const newFeatures = [...data.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setData({ ...data, features: newFeatures });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const { gallery, ...contentToSave } = data;
      
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contentToSave)
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
        } else {
          showNotification('Lỗi khi lưu dữ liệu', 'error');
        }
      } else {
        showNotification('Lưu thành công!', 'success');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: string, field: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        const { url } = await res.json();
        handleChange(section, field, url);
        showNotification('Tải ảnh lên thành công!', 'success');
      } else {
        showNotification('Lỗi khi tải ảnh lên', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        const { url } = await res.json();
        
        // Add to gallery DB
        const galleryRes = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ url })
        });
        
        if (galleryRes.ok) {
          const newImg = await galleryRes.json();
          setData((prev: any) => ({
            ...prev,
            gallery: [...prev.gallery, newImg]
          }));
          showNotification('Thêm ảnh vào thư viện thành công!', 'success');
        }
      } else {
        showNotification('Lỗi khi tải ảnh lên', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  const handleDeleteGalleryImage = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setData((prev: any) => ({
          ...prev,
          gallery: prev.gallery.filter((img: any) => img.id !== id)
        }));
        showNotification('Đã xóa ảnh', 'success');
      } else {
        showNotification('Lỗi khi xóa ảnh', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">Error loading data</div>;

  const tabs = [
    { id: 'banner', label: 'Banner' },
    { id: 'intro', label: 'Giới thiệu' },
    { id: 'features', label: 'Tiện ích' },
    { id: 'specs', label: 'Thông số' },
    { id: 'pricing', label: 'Bảng giá' },
    { id: 'contact', label: 'Liên hệ' },
    { id: 'gallery', label: 'Gallery' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-lg shadow-lg text-white ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 md:hidden">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1 overflow-x-auto flex md:block">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200 hidden md:block">
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-red-600 font-medium w-full px-4 py-2"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Đăng xuất
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            {activeTab !== 'gallery' && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {activeTab === 'banner' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={data.banner.title}
                    onChange={e => handleChange('banner', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề</label>
                  <input
                    type="text"
                    value={data.banner.subtitle}
                    onChange={e => handleChange('banner', 'subtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nút CTA</label>
                  <input
                    type="text"
                    value={data.banner.ctaText}
                    onChange={e => handleChange('banner', 'ctaText', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh nền</label>
                  <div className="flex items-start space-x-4">
                    <img src={data.banner.imageUrl} alt="Banner preview" className="w-48 h-32 object-cover rounded-lg border border-gray-200" />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.banner.imageUrl}
                        onChange={e => handleChange('banner', 'imageUrl', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="URL ảnh hoặc tải lên"
                      />
                      <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Tải ảnh lên
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'banner', 'imageUrl')} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'intro' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    value={data.intro.title}
                    onChange={e => handleChange('intro', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
                  <textarea
                    rows={4}
                    value={data.intro.description}
                    onChange={e => handleChange('intro', 'description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                {data.features.map((feature: any, idx: number) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-4 relative">
                    <div className="absolute top-4 right-4 text-gray-400 font-mono text-sm">#{idx + 1}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={e => handleFeatureChange(idx, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Tên Lucide Icon)</label>
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={e => handleFeatureChange(idx, 'icon', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={e => handleFeatureChange(idx, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên xe</label>
                  <input
                    type="text"
                    value={data.specs.name}
                    onChange={e => handleChange('specs', 'name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại xe</label>
                  <input
                    type="text"
                    value={data.specs.type}
                    onChange={e => handleChange('specs', 'type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ</label>
                  <input
                    type="text"
                    value={data.specs.seats}
                    onChange={e => handleChange('specs', 'seats', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quãng đường</label>
                  <input
                    type="text"
                    value={data.specs.range}
                    onChange={e => handleChange('specs', 'range', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theo ngày (VNĐ)</label>
                    <input
                      type="text"
                      value={data.pricing.daily}
                      onChange={e => handleChange('pricing', 'daily', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theo tuần (VNĐ)</label>
                    <input
                      type="text"
                      value={data.pricing.weekly}
                      onChange={e => handleChange('pricing', 'weekly', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theo tháng (VNĐ)</label>
                    <input
                      type="text"
                      value={data.pricing.monthly}
                      onChange={e => handleChange('pricing', 'monthly', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (Cọc, phụ phí)</label>
                  <textarea
                    rows={3}
                    value={data.pricing.note}
                    onChange={e => handleChange('pricing', 'note', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={data.contact.phone}
                    onChange={e => handleChange('contact', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số Zalo</label>
                  <input
                    type="text"
                    value={data.contact.zalo}
                    onChange={e => handleChange('contact', 'zalo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    value={data.contact.address}
                    onChange={e => handleChange('contact', 'address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <h3 className="font-medium text-blue-900">Thêm ảnh mới</h3>
                    <p className="text-sm text-blue-700">Tải lên hình ảnh thực tế của xe</p>
                  </div>
                  <label className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors">
                    <Plus className="w-5 h-5 mr-2" />
                    Tải ảnh lên
                    <input type="file" className="hidden" accept="image/*" onChange={handleGalleryUpload} />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.gallery.map((img: any) => (
                    <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                      <img src={img.url} alt="Gallery item" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteGalleryImage(img.id)}
                          className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {data.gallery.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      Chưa có hình ảnh nào trong thư viện
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
