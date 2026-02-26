
import React, { useState, useRef } from 'react';
import { LabDevice, UserRole } from '../types';
import { Microscope, Plus, Search, Edit2, Trash2, X, Upload, Eye, FileText, FlaskConical, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LabEquipmentProps {
  devices: LabDevice[];
  setDevices: React.Dispatch<React.SetStateAction<LabDevice[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const LabEquipment: React.FC<LabEquipmentProps> = ({ devices, setDevices, requestAuth, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<LabDevice | null>(null);
  const [viewingDevice, setViewingDevice] = useState<LabDevice | null>(null);

  const [formData, setFormData] = useState<Partial<LabDevice>>({
    name: '',
    image: '',
    sop: '',
    lastCalibrationDate: '',
    nextCalibrationDate: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDevices = devices.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.sop.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', image: '', sop: '', lastCalibrationDate: '', nextCalibrationDate: '' });
    setEditingDevice(null);
  };

  const handleOpenAdd = () => {
    requestAuth(() => {
      resetForm();
      setIsModalOpen(true);
    });
  };

  const handleOpenEdit = (device: LabDevice) => {
    requestAuth(() => {
      setEditingDevice(device);
      setFormData(device);
      setIsModalOpen(true);
    });
  };

  const handleDelete = (id: string) => {
    requestAuth(() => {
      setDevices(prev => prev.filter(d => d.id !== id));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDevice) {
      setDevices(prev => prev.map(d => d.id === editingDevice.id ? { ...formData, id: d.id } as LabDevice : d));
    } else {
      const newDevice: LabDevice = {
        id: Date.now().toString(),
        ...(formData as Omit<LabDevice, 'id'>),
        image: formData.image || 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop'
      };
      setDevices(prev => [newDevice, ...prev]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const isCalibrationDue = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const nextDate = new Date(dateStr);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7; // Warning if due within 7 days or overdue
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">أجهزة المعمل وإجراءات التشغيل</h2>
          <p className="text-gray-500">إدارة الأجهزة المعملية ووثائق التشغيل القياسية (SOP)</p>
        </div>
        
        {role === 'admin' && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-royal-800 text-white rounded-xl hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            إضافة جهاز جديد
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="بحث باسم الجهاز أو محتوى الإجراء..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none transition-all"
            />
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredDevices.map((device) => (
            <motion.div 
              key={device.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden bg-gray-100">
                <img 
                  src={device.image} 
                  alt={device.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg">
                    <FlaskConical className="w-6 h-6 text-royal-600" />
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-black text-gray-800 mb-2">{device.name}</h3>
                
                {/* Calibration Status Badge */}
                {device.nextCalibrationDate && (
                    <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg text-xs font-bold ${isCalibrationDue(device.nextCalibrationDate) ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                        {isCalibrationDue(device.nextCalibrationDate) ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        <span>معايرة قادمة: {device.nextCalibrationDate}</span>
                    </div>
                )}

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 flex-1">
                    <p className="text-xs text-gray-500 font-bold mb-1">مقتطف من الإجراء:</p>
                    <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{device.sop}</p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewingDevice(device)}
                    className="flex-1 py-2.5 bg-royal-50 text-royal-700 rounded-xl hover:bg-royal-100 transition-colors font-bold flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    عرض الـ SOP
                  </button>
                  {role === 'admin' && (
                    <>
                      <button 
                          onClick={() => handleOpenEdit(device)}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                          <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                          onClick={() => handleDelete(device.id)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-300">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Microscope className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-800">لا توجد أجهزة مضافة</h3>
             <p className="text-gray-500 mt-2">قم بإضافة أجهزة المعمل وإجراءات التشغيل الخاصة بها</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
           >
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                  <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                      {editingDevice ? <Edit2 className="w-6 h-6 text-royal-600" /> : <Plus className="w-6 h-6 text-royal-600" />}
                      {editingDevice ? 'تعديل بيانات الجهاز' : 'إضافة جهاز جديد'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500">
                      <X className="w-6 h-6" />
                  </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
                   <div className="flex justify-center">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-48 border-3 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-royal-500 hover:bg-royal-50 transition-all group overflow-hidden relative"
                        >
                          {formData.image ? (
                            <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-gray-300 group-hover:text-royal-500 mb-3 transition-colors" />
                              <p className="text-gray-500 font-bold group-hover:text-royal-600">رفع صورة الجهاز</p>
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

                   <div className="space-y-2">
                       <label className="text-sm font-black text-gray-700">اسم الجهاز</label>
                       <input 
                           required
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-bold"
                           placeholder="مثال: ميكروسكوب إلكتروني..."
                       />
                   </div>

                   {/* New Calibration Date Fields */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                تاريخ آخر معايرة
                            </label>
                            <input 
                                type="date"
                                value={formData.lastCalibrationDate}
                                onChange={(e) => setFormData({...formData, lastCalibrationDate: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-medium text-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                تاريخ المعايرة القادمة
                            </label>
                            <input 
                                type="date"
                                value={formData.nextCalibrationDate}
                                onChange={(e) => setFormData({...formData, nextCalibrationDate: e.target.value})}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-medium text-gray-600"
                            />
                        </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-sm font-black text-gray-700">إجراء التشغيل القياسي (SOP)</label>
                       <textarea 
                           required
                           value={formData.sop}
                           onChange={(e) => setFormData({...formData, sop: e.target.value})}
                           className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none min-h-[200px] leading-relaxed"
                           placeholder="اكتب خطوات التشغيل والإرشادات هنا..."
                       />
                   </div>

                   <div className="flex gap-4 pt-4 border-t border-gray-100">
                       <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-black hover:bg-gray-200">إلغاء</button>
                       <button type="submit" className="flex-1 py-3 bg-royal-800 text-white rounded-xl font-black hover:bg-royal-900 shadow-lg">حفظ</button>
                   </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* View Details Modal (SOP Reader) */}
      {viewingDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/80 backdrop-blur-md p-4">
              <motion.div 
                 initial={{ opacity: 0, y: 50 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-[2.5rem] w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
              >
                  <div className="relative h-64 shrink-0">
                      <img src={viewingDevice.image} alt={viewingDevice.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                          <div className="text-white w-full">
                              <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">{viewingDevice.name}</h2>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm font-bold border border-white/20">
                                        <FileText className="w-4 h-4" />
                                        Standard Operating Procedure (SOP)
                                    </div>
                                </div>
                                {(viewingDevice.lastCalibrationDate || viewingDevice.nextCalibrationDate) && (
                                    <div className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 text-right">
                                        {viewingDevice.lastCalibrationDate && <p className="text-xs text-gray-300">آخر معايرة: <span className="text-white font-bold">{viewingDevice.lastCalibrationDate}</span></p>}
                                        {viewingDevice.nextCalibrationDate && <p className="text-xs text-gray-300 mt-1">المعايرة القادمة: <span className={`font-bold ${isCalibrationDue(viewingDevice.nextCalibrationDate) ? 'text-amber-400' : 'text-emerald-400'}`}>{viewingDevice.nextCalibrationDate}</span></p>}
                                    </div>
                                )}
                              </div>
                          </div>
                      </div>
                      <button 
                        onClick={() => setViewingDevice(null)}
                        className="absolute top-6 left-6 p-2 bg-black/40 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-colors"
                      >
                          <X className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-gray-50 custom-scrollbar">
                      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
                           <h3 className="text-xl font-black text-royal-800 mb-6 border-b pb-4">إجراءات التشغيل التفصيلية</h3>
                           <div className="prose prose-lg prose-slate max-w-none whitespace-pre-wrap leading-loose text-gray-700">
                               {viewingDevice.sop}
                           </div>
                      </div>
                  </div>
              </motion.div>
          </div>
      )}
    </div>
  );
};