
import React, { useState, useRef } from 'react';
import { CompanySettings, UserRole } from '../types';
import { 
  Building2, MapPin, Phone, Mail, Globe, Upload, 
  BadgeCheck, Camera, Award, ShieldCheck, 
  ExternalLink, Edit3, X, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanySettingsProps {
  settings: CompanySettings;
  onSave: (settings: CompanySettings) => void;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const CompanySettingsPanel: React.FC<CompanySettingsProps> = ({ settings, onSave, requestAuth, role }) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEdit = () => {
    requestAuth(() => {
      setFormData(settings);
      setIsEditModalOpen(true);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setIsEditModalOpen(false);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const isAdmin = role === 'admin';

  const InfoCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 shrink-0 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
      </div>
      <div className="overflow-hidden">
        <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-black text-gray-800 leading-tight truncate">{value || 'غير محدد'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-royal-800 rounded-2xl text-white shadow-lg">
            <Landmark className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">الملف التعريفي للمنشأة</h2>
            <p className="text-gray-500 text-sm">إدارة الهوية الرسمية وبيانات التواصل</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <AnimatePresence>
            {isSaved && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold border border-emerald-100 text-sm"
              >
                <BadgeCheck className="w-4 h-4" />
                تم حفظ التغييرات
              </motion.div>
            )}
          </AnimatePresence>

          {isAdmin && (
            <button 
                onClick={handleOpenEdit}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-royal-800 text-white rounded-2xl font-black hover:bg-royal-950 transition-all shadow-xl shadow-royal-800/20 active:scale-95"
            >
                <Edit3 className="w-5 h-5" />
                تعديل الهوية
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 flex flex-col items-center p-8 text-center sticky top-6"
          >
            <div className="relative group">
                <div className="w-44 h-44 bg-gray-50 rounded-[2rem] border-2 border-gray-100 shadow-inner flex items-center justify-center mb-6 overflow-hidden">
                {settings.logo ? (
                    <img src={settings.logo} alt="Company Logo" className="w-full h-full object-contain p-4" />
                ) : (
                    <Building2 className="w-20 h-20 text-gray-200" />
                )}
                </div>
                {isAdmin && (
                    <button 
                        onClick={handleOpenEdit}
                        className="absolute bottom-4 right-4 p-3 bg-white text-royal-800 rounded-2xl shadow-xl border border-gray-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-royal-50"
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                )}
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">{settings.name || 'اسم المنشأة'}</h3>
            <p className="text-royal-600 font-bold text-sm italic mb-6">"{settings.slogan || 'شعار الجودة الرسمي'}"</p>
            <div className="w-full space-y-4 pt-6 border-t border-gray-50">
               <div className="flex flex-col items-center gap-1 p-4 bg-gray-50 rounded-2xl">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">السجل التجاري</span>
                  <span className="text-royal-800 font-black font-mono text-lg">{settings.registrationNumber || '---'}</span>
               </div>
               {settings.website && (
                 <a href={settings.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-royal-50 text-royal-700 rounded-xl hover:bg-royal-100 transition-all font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    زيارة الموقع الرسمي
                    <ExternalLink className="w-3 h-3" />
                 </a>
               )}
            </div>
          </motion.div>
        </div>

        <div className="md:col-span-2 space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard icon={Mail} label="البريد الإلكتروني" value={settings.email} colorClass="bg-blue-600" />
              <InfoCard icon={Phone} label="أرقام التواصل" value={settings.phone} colorClass="bg-emerald-600" />
              <InfoCard icon={MapPin} label="العنوان الجغرافي" value={settings.address} colorClass="bg-rose-600" />
              <InfoCard icon={ShieldCheck} label="التراخيص المعتمدة" value={settings.registrationNumber ? 'سجل تجاري نشط' : 'غير محدد'} colorClass="bg-amber-600" />
           </div>

           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden"
           >
              <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Award className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                    <h4 className="text-xl font-black text-gray-800">الاعتمادات الدولية والمحلية</h4>
                    <p className="text-gray-400 text-xs font-bold">شهادات الجودة الموثقة</p>
                </div>
              </div>
              {settings.certificates ? (
                <div className="flex flex-wrap gap-4">
                  {settings.certificates.split(',').map((cert, idx) => (
                    <div key={idx} className="px-6 py-4 bg-gray-50 border border-gray-200 rounded-[1.5rem] flex items-center gap-4">
                      <BadgeCheck className="w-5 h-5 text-emerald-600" />
                      <span className="font-black text-gray-700">{cert.trim()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400 font-bold">لا توجد شهادات مضافة</p>
              )}
           </motion.div>

           <div className="bg-royal-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                 <ShieldCheck className="w-16 h-16 text-royal-200" />
                 <div className="text-center md:text-right">
                    <h4 className="text-2xl font-black mb-3">بيانات نظام الجودة (TQM)</h4>
                    <p className="text-royal-100 text-sm leading-relaxed max-w-lg font-medium">
                      هذه البيانات تُستخدم كمرجع رسمي لتوليد الترويسات في التقارير المطبوعة.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-royal-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="p-8 border-b bg-gray-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-royal-100 text-royal-800 rounded-2xl">
                    <Edit3 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-800">تعديل بيانات المنشأة</h3>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8">
                <div className="flex flex-col items-center mb-10">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-40 h-40 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200 hover:border-royal-500 cursor-pointer relative overflow-hidden flex items-center justify-center"
                  >
                    {formData.logo ? (
                      <img src={formData.logo} className="w-full h-full object-contain p-4" alt="Logo" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Camera className="w-10 h-10 mb-2" />
                        <span className="text-xs font-bold">رفع الشعار</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">الاسم الرسمي</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">شعار الجودة</label>
                    <input value={formData.slogan} onChange={(e) => setFormData({...formData, slogan: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">رقم السجل</label>
                    <input value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">البريد الإلكتروني</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">أرقام التواصل</label>
                    <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700">الموقع الإلكتروني</label>
                    <input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">العنوان</label>
                  <input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">الشهادات (افصل بفاصلة ,)</label>
                  <textarea value={formData.certificates} onChange={(e) => setFormData({...formData, certificates: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-200 outline-none font-bold min-h-[100px]" />
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black">إلغاء</button>
                  <button type="submit" className="flex-1 py-4 bg-royal-800 text-white rounded-2xl font-black shadow-xl">حفظ</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
