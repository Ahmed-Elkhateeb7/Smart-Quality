import React, { useState, useRef } from 'react';
import { Employee, UserRole } from '../types';
import { Search, UserPlus, Microscope, ShieldCheck, Briefcase, Trash2, Mail, Phone, Calendar, Edit2, X, Users, CheckCircle, Upload, Camera, Fingerprint, Info, Contact2, Settings2, Hash, IdCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamProps {
  team: Employee[];
  setTeam: React.Dispatch<React.SetStateAction<Employee[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const Team: React.FC<TeamProps> = ({ team, setTeam, requestAuth, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    role: '',
    employeeCode: '',
    department: 'qc',
    email: '',
    phone: '',
    joinedDate: new Date().toISOString().split('T')[0],
    image: '',
    stampData: ''
  });

  const filteredTeam = team.filter(member => 
    member.name.includes(searchTerm) || 
    member.role.includes(searchTerm) ||
    member.id.includes(searchTerm) ||
    (member.employeeCode && member.employeeCode.includes(searchTerm))
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Compress image
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const MAX_SIZE = 600; // Smaller size for profile pics
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
          
          // Compress
          const compressed = canvas.toDataURL('image/jpeg', 0.6);
          setFormData(prev => ({ ...prev, image: compressed }));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
        name: '',
        role: '',
        employeeCode: '',
        department: 'qc',
        email: '',
        phone: '',
        joinedDate: new Date().toISOString().split('T')[0],
        image: '',
        stampData: ''
    });
    setEditingMember(null);
  };

  const handleOpenAdd = () => {
    requestAuth(() => {
      resetForm();
      setIsModalOpen(true);
    });
  };

  const handleOpenEdit = (member: Employee) => {
    requestAuth(() => {
      setEditingMember(member);
      setFormData(member);
      setIsModalOpen(true);
    });
  };

  const handleDelete = (id: string) => {
    requestAuth(() => {
      setTeam(prev => prev.filter(m => m.id !== id));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setTeam(prev => prev.map(m => m.id === editingMember.id ? { ...formData, id: m.id } as Employee : m));
    } else {
      const newMember: Employee = {
        id: Date.now().toString(),
        ...(formData as Omit<Employee, 'id'>),
        image: formData.image || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&auto=format&fit=crop'
      };
      setTeam(prev => [newMember, ...prev]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
        case 'management': return <Briefcase className="w-5 h-5 text-purple-600" />;
        case 'qa': return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
        default: return <Microscope className="w-5 h-5 text-blue-600" />;
    }
  };

  const getDepartmentLabel = (dept: string) => {
    switch (dept) {
        case 'management': return 'الإدارة العليا';
        case 'qa': return 'توكيد الجودة (QA)';
        default: return 'مراقبة الجودة (QC)';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">فريق الجودة</h2>
          <p className="text-gray-500">إدارة هيكل الموظفين وصلاحيات التفتيش</p>
        </div>
        
        {role === 'admin' && (
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-6 py-3 bg-royal-800 text-white rounded-xl hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            تسجيل موظف جديد
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="بحث باسم الموظف، كود الموظف، أو المسمى الوظيفي..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none transition-all"
            />
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <Users className="w-5 h-5" />
            <span>العدد الكلي: <span className="font-bold text-royal-800">{team.length}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
            {filteredTeam.map((member) => (
                <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-[2.5rem] p-0 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 relative group overflow-hidden flex flex-col"
                >
                    {/* Header Background */}
                    <div className="h-40 bg-gradient-to-br from-royal-800 to-royal-600 relative">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                         {/* Actions - Only visible to Admin */}
                        {role === 'admin' && (
                            <div className="absolute top-4 left-4 flex gap-2 z-20">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(member); }}
                                    className="p-2 bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-royal-600 rounded-lg transition-colors shadow-lg"
                                    title="تعديل البيانات"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                                    className="p-2 bg-white/20 backdrop-blur-md text-white hover:bg-red-500 hover:text-white rounded-lg transition-colors shadow-lg"
                                    title="حذف الموظف"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative px-6 pb-8 flex-1 flex flex-col">
                        {/* Profile Image - Large Size */}
                        <div className="relative -mt-24 mb-6 self-center">
                            <div className="w-44 h-44 rounded-full p-2 bg-white shadow-2xl ring-4 ring-gray-50">
                                <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover bg-gray-100 shadow-inner" />
                            </div>
                            <div className="absolute bottom-4 right-4 bg-emerald-500 w-8 h-8 rounded-full border-[3px] border-white shadow-md flex items-center justify-center" title="Active">
                                <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        
                        {/* Basic Info */}
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{member.name}</h3>
                            <p className="text-royal-600 font-bold text-lg mb-4">{member.role}</p>

                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-royal-50 rounded-full border border-royal-100">
                                {getDepartmentIcon(member.department)}
                                <span className="text-sm font-bold text-gray-700">{getDepartmentLabel(member.department)}</span>
                            </div>
                        </div>

                        {/* Detailed Info Grid */}
                        <div className="flex-1 space-y-4">
                            {/* Email - Full Width */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:bg-royal-50 transition-colors group/item">
                                <div className="p-3 bg-white text-royal-600 rounded-xl shadow-sm group-hover/item:bg-royal-600 group-hover/item:text-white transition-colors shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-xs font-bold text-gray-400 mb-0.5">البريد الإلكتروني</p>
                                    <p className="text-sm font-bold text-gray-800 break-words leading-tight">{member.email}</p>
                                </div>
                            </div>

                             {/* Phone & Join Date Grid */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-royal-50 transition-colors group/item">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white text-emerald-600 rounded-lg shadow-sm group-hover/item:bg-emerald-600 group-hover/item:text-white transition-colors">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">الهاتف</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 dir-ltr">{member.phone}</p>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-royal-50 transition-colors group/item">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-white text-amber-600 rounded-lg shadow-sm group-hover/item:bg-amber-600 group-hover/item:text-white transition-colors">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">تاريخ الانضمام</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{member.joinedDate}</p>
                                </div>
                             </div>

                             {/* Codes Grid */}
                             <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <IdCard className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-bold text-blue-600">كود الموظف</span>
                                    </div>
                                    <p className="text-base font-black text-blue-800 font-mono tracking-wider">{member.employeeCode || '-'}</p>
                                </div>

                                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-bold text-emerald-600">ختم الجودة</span>
                                    </div>
                                    <p className="text-base font-black text-emerald-800 font-mono tracking-wider">{member.stampData || 'غير معين'}</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                        {editingMember ? <Settings2 className="w-6 h-6 text-royal-600" /> : <UserPlus className="w-6 h-6 text-royal-600" />}
                        {editingMember ? 'تعديل بيانات الموظف' : 'إضافة عضو جديد'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto">
                    <div className="flex flex-col items-center mb-8">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-40 h-40 rounded-full border-4 border-dashed border-gray-200 hover:border-royal-500 cursor-pointer relative overflow-hidden group transition-all"
                        >
                            {formData.image ? (
                                <img src={formData.image} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 group-hover:text-royal-500 group-hover:bg-royal-50">
                                    <Camera className="w-10 h-10 mb-2" />
                                    <span className="text-xs font-bold">رفع صورة</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                        <p className="text-xs text-gray-500 mt-2">اضغط على الدائرة لرفع صورة شخصية</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">الاسم الكامل</label>
                            <input 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none"
                                placeholder="محمد أحمد..."
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">المسمى الوظيفي</label>
                            <input 
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none"
                                placeholder="مراقب جودة..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">القسم</label>
                            <select 
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value as any})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none bg-white"
                            >
                                <option value="qc">مراقبة الجودة (QC)</option>
                                <option value="qa">توكيد الجودة (QA)</option>
                                <option value="management">الإدارة العليا</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">كود / ختم الجودة</label>
                            <div className="relative">
                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={formData.stampData}
                                    onChange={(e) => setFormData({...formData, stampData: e.target.value})}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-mono"
                                    placeholder="QC-01"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">كود الموظف</label>
                            <div className="relative">
                                <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input 
                                    value={formData.employeeCode || ''}
                                    onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                                    className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none font-mono"
                                    placeholder="EMP-01"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">البريد الإلكتروني</label>
                            <input 
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left"
                                placeholder="name@company.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">رقم الهاتف</label>
                            <input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-left"
                                placeholder="+966..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">تاريخ التعيين</label>
                            <input 
                                type="date"
                                value={formData.joinedDate}
                                onChange={(e) => setFormData({...formData, joinedDate: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-500 outline-none text-right"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-8 mt-4 border-t border-gray-100">
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