import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Image as ImageIcon, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('banner');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [newReview, setNewReview] = useState({ customerName: '', rating: 5, comment: '', avatarUrl: '' });
  const [rentals, setRentals] = useState<any[]>([]);
  const [editingRental, setEditingRental] = useState<any>(null);
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });
  const navigate = useNavigate();

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchRentals = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/admin/rentals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRentals(data);
      }
    } catch (err) {
      console.error('Failed to load rentals', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('/api/admin/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }).catch(() => {});

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

    fetchRentals();
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
      const { gallery, reviews, ...contentToSave } = data;
      
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
        if (res.status === 401) return handleLogout();
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
        } else {
          if (galleryRes.status === 401) return handleLogout();
          showNotification('Lỗi khi thêm ảnh vào thư viện', 'error');
        }
      } else {
        if (res.status === 401) return handleLogout();
        showNotification('Lỗi khi tải ảnh lên', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  const handleDeleteGalleryImage = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa ảnh này?',
      onConfirm: async () => {
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
            if (res.status === 401) return handleLogout();
            showNotification('Lỗi khi xóa ảnh', 'error');
          }
        } catch (err) {
          showNotification('Lỗi kết nối mạng', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddReview = async () => {
    if (!newReview.customerName || !newReview.comment) {
      showNotification('Vui lòng nhập tên và nội dung đánh giá', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });
      
      if (res.ok) {
        const addedReview = await res.json();
        setData((prev: any) => ({
          ...prev,
          reviews: [...(prev.reviews || []), addedReview]
        }));
        setNewReview({ customerName: '', rating: 5, comment: '', avatarUrl: '' });
        showNotification('Thêm đánh giá thành công!', 'success');
      } else {
        if (res.status === 401) return handleLogout();
        showNotification('Lỗi khi thêm đánh giá', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  const handleDeleteReview = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa đánh giá này?',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/admin/reviews/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setData((prev: any) => ({
              ...prev,
              reviews: prev.reviews.filter((r: any) => r.id !== id)
            }));
            showNotification('Đã xóa đánh giá', 'success');
          } else {
            if (res.status === 401) return handleLogout();
            showNotification('Lỗi khi xóa đánh giá', 'error');
          }
        } catch (err) {
          showNotification('Lỗi kết nối mạng', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleReviewAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const { url } = await res.json();
        setNewReview(prev => ({ ...prev, avatarUrl: url }));
        showNotification('Tải ảnh đại diện thành công!', 'success');
      } else {
        if (res.status === 401) return handleLogout();
        showNotification('Lỗi khi tải ảnh lên', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  const handleSaveRental = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const method = editingRental.id ? 'PUT' : 'POST';
      const url = editingRental.id ? `/api/admin/rentals/${editingRental.id}` : '/api/admin/rentals';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingRental)
      });
      
      if (res.ok) {
        showNotification(editingRental.id ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
        fetchRentals();
        setIsRentalModalOpen(false);
      } else {
        if (res.status === 401) return handleLogout();
        showNotification('Lỗi khi lưu thông tin', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối mạng', 'error');
    }
  };

  const handleDeleteRental = async (id: number) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc muốn xóa thông tin thuê xe này?',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/admin/rentals/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            setRentals(prev => prev.filter(r => r.id !== id));
            showNotification('Đã xóa thông tin', 'success');
          } else {
            if (res.status === 401) return handleLogout();
            showNotification('Lỗi khi xóa thông tin', 'error');
          }
        } catch (err) {
          showNotification('Lỗi kết nối mạng', 'error');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
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
    { id: 'reviews', label: 'Đánh giá' },
    { id: 'rentals', label: 'Quản lý thuê xe' },
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
            {activeTab !== 'gallery' && activeTab !== 'reviews' && (
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo trang web</label>
                  <div className="flex items-start space-x-4">
                    {data.banner.logoUrl ? (
                      <img src={data.banner.logoUrl} alt="Logo preview" className="w-32 h-16 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2" />
                    ) : (
                      <div className="w-32 h-16 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">Chưa có logo</div>
                    )}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.banner.logoUrl || ''}
                        onChange={e => handleChange('banner', 'logoUrl', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="URL logo hoặc tải lên"
                      />
                      <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Tải logo lên
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'banner', 'logoUrl')} />
                      </label>
                    </div>
                  </div>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh xe (Hiển thị trên nút CTA)</label>
                  <div className="flex items-start space-x-4">
                    {data.banner.carImageUrl ? (
                      <img src={data.banner.carImageUrl} alt="Car preview" className="w-48 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50 p-2" />
                    ) : (
                      <div className="w-48 h-32 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm text-center px-2">Chưa có ảnh xe</div>
                    )}
                    <div className="flex-1">
                      <input
                        type="text"
                        value={data.banner.carImageUrl || ''}
                        onChange={e => handleChange('banner', 'carImageUrl', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="URL ảnh xe hoặc tải lên"
                      />
                      <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Tải ảnh xe lên
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'banner', 'carImageUrl')} />
                      </label>
                    </div>
                  </div>
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

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Add New Review Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Thêm đánh giá mới</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                      <input
                        type="text"
                        value={newReview.customerName}
                        onChange={e => setNewReview({ ...newReview, customerName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="VD: Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá (Số sao)</label>
                      <select
                        value={newReview.rating}
                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={5}>5 Sao</option>
                        <option value={4}>4 Sao</option>
                        <option value={3}>3 Sao</option>
                        <option value={2}>2 Sao</option>
                        <option value={1}>1 Sao</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá</label>
                      <textarea
                        rows={3}
                        value={newReview.comment}
                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhận xét của khách hàng..."
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-4">
                      {newReview.avatarUrl ? (
                        <img src={newReview.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 border flex items-center justify-center text-xs text-gray-400">Trống</div>
                      )}
                      <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Tải ảnh đại diện
                        <input type="file" className="hidden" accept="image/*" onChange={handleReviewAvatarUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleAddReview}
                      className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Thêm đánh giá
                    </button>
                  </div>
                </div>

                {/* List of Reviews */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800">Danh sách đánh giá</h3>
                  {(!data.reviews || data.reviews.length === 0) ? (
                    <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      Chưa có đánh giá nào
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.reviews.map((review: any) => (
                        <div key={review.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                            title="Xóa đánh giá"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="flex items-center space-x-3 mb-3">
                            {review.avatarUrl ? (
                              <img src={review.avatarUrl} alt={review.customerName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                {review.customerName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-800">{review.customerName}</h4>
                              <div className="flex text-yellow-400 text-sm">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm italic">"{review.comment}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rentals' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Danh sách thuê xe</h3>
                  <button
                    onClick={() => {
                      setEditingRental({
                        customerName: '',
                        phoneNumber: '',
                        idCard: '',
                        startDate: '',
                        endDate: '',
                        totalPrice: 0,
                        status: 'Chờ xác nhận',
                        notes: ''
                      });
                      setIsRentalModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Thêm mới
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 font-medium text-gray-700">Khách hàng</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Liên hệ</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Thời gian thuê</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Tổng tiền</th>
                        <th className="px-4 py-3 font-medium text-gray-700">Trạng thái</th>
                        <th className="px-4 py-3 font-medium text-gray-700 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            Chưa có dữ liệu thuê xe
                          </td>
                        </tr>
                      ) : (
                        rentals.map((rental) => (
                          <tr key={rental.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">{rental.customerName}</div>
                              <div className="text-sm text-gray-500">CCCD: {rental.idCard}</div>
                            </td>
                            <td className="px-4 py-3 text-gray-600">{rental.phoneNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              <div>Từ: {rental.startDate}</div>
                              <div>Đến: {rental.endDate}</div>
                            </td>
                            <td className="px-4 py-3 font-medium text-indigo-600">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rental.totalPrice)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                rental.status === 'Đã hoàn thành' ? 'bg-green-100 text-green-800' :
                                rental.status === 'Đang thuê' ? 'bg-blue-100 text-blue-800' :
                                rental.status === 'Đã hủy' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {rental.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => {
                                  setEditingRental(rental);
                                  setIsRentalModalOpen(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteRental(rental.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rental Modal */}
      <AnimatePresence>
        {isRentalModalOpen && editingRental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingRental.id ? 'Sửa thông tin thuê xe' : 'Thêm thông tin thuê xe'}
                </h3>
                <button
                  onClick={() => setIsRentalModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="rental-form" onSubmit={handleSaveRental} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                      <input
                        type="text"
                        required
                        value={editingRental.customerName}
                        onChange={e => setEditingRental({...editingRental, customerName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        type="text"
                        required
                        value={editingRental.phoneNumber}
                        onChange={e => setEditingRental({...editingRental, phoneNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CCCD/CMND</label>
                      <input
                        type="text"
                        value={editingRental.idCard}
                        onChange={e => setEditingRental({...editingRental, idCard: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={editingRental.status}
                        onChange={e => setEditingRental({...editingRental, status: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Chờ xác nhận">Chờ xác nhận</option>
                        <option value="Đã đặt cọc">Đã đặt cọc</option>
                        <option value="Đang thuê">Đang thuê</option>
                        <option value="Đã hoàn thành">Đã hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhận xe</label>
                      <input
                        type="datetime-local"
                        value={editingRental.startDate}
                        onChange={e => setEditingRental({...editingRental, startDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trả xe</label>
                      <input
                        type="datetime-local"
                        value={editingRental.endDate}
                        onChange={e => setEditingRental({...editingRental, endDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền (VNĐ)</label>
                      <input
                        type="number"
                        value={editingRental.totalPrice}
                        onChange={e => setEditingRental({...editingRental, totalPrice: Number(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea
                        rows={3}
                        value={editingRental.notes}
                        onChange={e => setEditingRental({...editingRental, notes: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Ghi chú thêm về khách hàng, tiền cọc, yêu cầu đặc biệt..."
                      />
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsRentalModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  form="rental-form"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Lưu thông tin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={confirmModal.onConfirm}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
