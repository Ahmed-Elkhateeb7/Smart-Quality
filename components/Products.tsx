
import React, { useState, useRef } from 'react';
import { Product, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, X, Upload, Check, AlertTriangle, Filter, FileDown, Eye, Info, Package, ShieldCheck, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const Products: React.FC<ProductsProps> = ({ products, setProducts, requestAuth, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManufacturer, setFilterManufacturer] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    specs: '',
    defects: '',
    image: '',
    manufacturer: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const manufacturers = Array.from(new Set(products.map(p => p.manufacturer).filter(Boolean))) as string[];

  const filteredProducts = products.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const specMatch = p.specs.toLowerCase().includes(searchTerm.toLowerCase());
    const mfrMatch = (p.manufacturer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || specMatch || mfrMatch;
    const matchesManufacturer = filterManufacturer === 'all' || p.manufacturer === filterManufacturer;
    
    return matchesSearch && matchesManufacturer;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const MAX_SIZE = 800; 
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          
          setFormData(prev => ({ ...prev, image: compressedBase64 }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', specs: '', defects: '', image: '', manufacturer: '' });
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    requestAuth(() => {
      resetForm();
      setIsModalOpen(true);
    });
  };

  const handleOpenEdit = (product: Product) => {
    requestAuth(() => {
      setEditingProduct(product);
      setFormData(product);
      setIsModalOpen(true);
    });
  };

  const handleOpenView = (product: Product) => {
    setViewingProduct(product);
  };

  const handleDelete = (id: string) => {
    requestAuth(() => {
      setProducts(prev => prev.filter(p => p.id !== id));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } as Product : p));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...(formData as Omit<Product, 'id'>),
        image: formData.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60'
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'اسم المنتج', 'الشركة المصنعة', 'المواصفات', 'العيوب'];
    const csvContent = [
      headers.join(','),
      ...filteredProducts.map(product => [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${(product.manufacturer || '').replace(/"/g, '""')}"`,
        `"${product.specs.replace(/"/g, '""')}"`,
        `"${product.defects.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tqm_products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
          <p className="text-gray-500">مراقبة جودة خطوط الإنتاج والمواصفات ({products.length} منتج)</p>
        </div>
        
        <div className="flex gap-3">
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-3 bg-white text-royal-800 border border-royal-200 rounded-xl hover:bg-royal-50 transition-all shadow-sm active:scale-95 font-semibold"
            >
                <FileDown className="w-5 h-5" />
                تصدير CSV
            </button>
            {role === 'admin' && (
                <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-6 py-3 bg-royal-800 text-white rounded-xl hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20 active:scale-95"
                >
                <Plus className="w-5 h-5" />
                إضافة منتج جديد
                </button>
            )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                type="text" 
                placeholder="بحث عن منتج..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none transition-all"
                />
            </div>
            
            <div className="relative w-48">
                 <Factory className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <select 
                    value={filterManufacturer}
                    onChange={(e) => setFilterManufacturer(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none appearance-none cursor-pointer text-sm font-semibold text-gray-600"
                 >
                    <option value="all">كل الشركات</option>
                    {manufacturers.map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                 </select>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              layout
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-40 overflow-hidden bg-gray-100 shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-md font-bold text-gray-900 leading-tight mb-1 truncate">{product.name}</h3>
                
                {product.manufacturer && (
                    <div className="flex items-center gap-1 mb-2">
                        <Factory className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] font-medium text-gray-500 truncate">{product.manufacturer}</span>
                    </div>
                )}

                <div className="flex-1 space-y-2 mb-3">
                  <p className="text-xs text-gray-600 line-clamp-2">{product.specs}</p>
                  {product.defects && (
                    <p className="text-xs text-red-600 line-clamp-1 bg-red-50 p-1 rounded font-medium border border-red-100">{product.defects}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button 
                    onClick={() => handleOpenView(product)}
                    className="flex-1 py-1.5 bg-gray-50 text-royal-600 rounded-lg hover:bg-royal-100 transition-colors text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    عرض
                  </button>
                  {role === 'admin' && (
                    <>
                    <button 
                        onClick={() => handleOpenEdit(product)}
                        className="flex-1 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors text-xs font-semibold flex items-center justify-center gap-1"
                    >
                        <Edit2 className="w-3 h-3" />
                        تعديل
                    </button>
                    <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">لا توجد نتائج</h3>
              <p className="text-gray-500 text-sm">جرب تغيير معايير البحث أو إضافة منتجات جديدة</p>
          </div>
      )}

      {/* View Details Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
             <div className="p-6 border-b flex justify-between items-center bg-royal-50/50 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="w-6 h-6 text-royal-600" />
                تفاصيل المنتج: {viewingProduct.name}
              </h3>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="rounded-xl overflow-hidden border-2 border-gray-100 bg-gray-50 flex items-center justify-center p-2 min-h-[300px]">
                     <img 
                        src={viewingProduct.image} 
                        alt={viewingProduct.name} 
                        className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-sm" 
                     />
                  </div>
                  
                  <div className="space-y-6">
                     <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {viewingProduct.manufacturer && (
                                <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-gray-100 text-gray-700 border border-gray-200 flex items-center gap-2">
                                    <Factory className="w-3.5 h-3.5" />
                                    {viewingProduct.manufacturer}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">معرف المنتج: #{viewingProduct.id}</p>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                           <h4 className="text-sm font-black text-gray-700 mb-2 flex items-center gap-2">
                              <Info className="w-4 h-4 text-royal-600" /> المواصفات الفنية
                           </h4>
                           <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{viewingProduct.specs}</p>
                        </div>

                        {viewingProduct.defects && (
                           <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                              <h4 className="text-sm font-black text-red-700 mb-2 flex items-center gap-2">
                                 <AlertTriangle className="w-4 h-4 text-red-600" /> ملاحظات العيوب
                              </h4>
                              <p className="text-red-600 text-sm leading-relaxed">{viewingProduct.defects}</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="p-6 border-t flex justify-end bg-gray-50 flex-shrink-0">
                <button 
                onClick={() => setViewingProduct(null)}
                className="px-8 py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20"
                >
                إغلاق العرض
                </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {editingProduct ? <Edit2 className="w-6 h-6 text-royal-600" /> : <Plus className="w-6 h-6 text-royal-600" />}
                {editingProduct ? 'تعديل بيانات منتج' : 'إضافة منتج جديد'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex justify-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-royal-500 hover:bg-royal-50 transition-all group overflow-hidden relative"
                >
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-royal-500 mb-2" />
                      <p className="text-gray-500 text-sm group-hover:text-royal-600">رفع صورة (يتم ضغطها تلقائياً)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المنتج</label>
                  <input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none"
                    placeholder="مثال: وحدة تحكم إلكترونية"
                  />
                </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الشركة المصنعة</label>
                <input 
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none"
                    placeholder="الشركة المصنعة..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">المواصفات الفنية</label>
                <textarea 
                  required
                  value={formData.specs}
                  onChange={(e) => setFormData({...formData, specs: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none min-h-[100px]"
                  placeholder="اكتب المواصفات هنا..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ملاحظات العيوب</label>
                <textarea 
                  value={formData.defects}
                  onChange={(e) => setFormData({...formData, defects: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none min-h-[80px]"
                  placeholder="سجل أي عيوب تم رصدها..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
