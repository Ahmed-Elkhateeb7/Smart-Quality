
import React, { useState, useEffect } from 'react';
import { Product, KPIData, PageView, ReservedItem, UserRole } from '../types';
import { 
  Package, TrendingUp, ShieldCheck, Clock, ArrowRight, 
  BarChart3, PlusCircle, Zap, Activity, Calendar as CalendarIcon, FileText,
  AlertTriangle, ClipboardList, Lock, Edit2, Trash2, X, Save, User, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  products: Product[];
  kpiData: KPIData[];
  reservedItems: ReservedItem[];
  setReservedItems: React.Dispatch<React.SetStateAction<ReservedItem[]>>;
  handleGenerateReport: () => void;
  navigate: (view: PageView) => void;
  role: UserRole | null;
  requestAuth: (action: () => void) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  products, kpiData, navigate, 
  reservedItems = [], setReservedItems, role, requestAuth 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Reserved Area Modal State
  const [isReservedModalOpen, setIsReservedModalOpen] = useState(false);
  const [editingReservedItem, setEditingReservedItem] = useState<ReservedItem | null>(null);
  const [reservedFormData, setReservedFormData] = useState<Partial<ReservedItem>>({
    productName: '',
    quantity: 0,
    defects: '',
    actionTaken: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    shift: 'A',
    inspectorName: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalProducts = products.length;
  const totalKpis = kpiData.length;
  const lastKpi = kpiData.length > 0 ? kpiData[kpiData.length - 1] : null;
  const lastQualityRate = lastKpi ? lastKpi.qualityRate : 0;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formattedDate = new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(currentTime);

  const formattedTime = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  // Updated handlers: Removing requestAuth to allow visitors access
  const handleOpenAddReserved = () => {
    setReservedFormData({
      productName: '', quantity: 0, defects: '', actionTaken: '',
      date: new Date().toISOString().split('T')[0], status: 'pending',
      shift: 'A', inspectorName: ''
    });
    setEditingReservedItem(null);
    setIsReservedModalOpen(true);
  };

  const handleEditReserved = (item: ReservedItem) => {
    setReservedFormData(item);
    setEditingReservedItem(item);
    setIsReservedModalOpen(true);
  };

  const handleDeleteReserved = (id: string) => {
    setReservedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveReserved = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReservedItem) {
      setReservedItems(prev => prev.map(item => item.id === editingReservedItem.id ? { ...reservedFormData, id: item.id } as ReservedItem : item));
    } else {
      const newItem: ReservedItem = {
        id: Date.now().toString(),
        shift: reservedFormData.shift || 'A',
        inspectorName: reservedFormData.inspectorName || 'غير محدد',
        ...(reservedFormData as Omit<ReservedItem, 'id' | 'shift' | 'inspectorName'>)
      };
      setReservedItems(prev => [newItem, ...prev]);
    }
    setIsReservedModalOpen(false);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-12" dir="rtl">
      {/* Dynamic Header Information */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="p-4 bg-royal-50 text-royal-700 rounded-3xl">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-0.5 uppercase tracking-widest">تاريخ اليوم</p>
            <p className="text-lg font-black text-slate-800">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-white px-8 py-5 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-0.5 uppercase tracking-widest">التوقيت المحلي</p>
            <p className="text-2xl font-black text-slate-800 font-mono tracking-tighter">{formattedTime}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Welcome Hero */}
      <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-l from-royal-950 via-royal-900 to-royal-800 rounded-[3.5rem] p-8 md:p-14 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-royal-500/20 rounded-full -mr-20 -mt-20 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-royal-400/10 rounded-full -ml-20 -mb-20 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-right space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/20 text-sm font-black">
               <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
               نظام إدارة الجودة الشاملة نشط (v5.1)
            </div>
            <h2 className="text-4xl md:text-6xl font-black leading-[1.1]">تحليل الأداء <br/><span className="text-royal-400 italic">والجودة الرقمية</span></h2>
            <p className="text-royal-100/80 text-xl max-w-xl font-medium leading-relaxed">
              مرحباً بك في مركز التحكم. راقب أدق تفاصيل الجودة والإنتاج والامتثال للمعايير الدولية لحظة بلحظة.
            </p>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <button 
                onClick={() => navigate('kpi')}
                className="group flex items-center justify-center gap-4 px-10 py-5 bg-white text-royal-950 rounded-[1.5rem] font-black shadow-2xl hover:bg-royal-50 transition-all active:scale-95"
            >
                <Activity className="w-6 h-6 text-royal-600" />
                عرض التقارير التفصيلية
                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button 
                onClick={() => navigate('checklist')}
                className="flex items-center justify-center gap-4 px-10 py-5 bg-royal-700/40 backdrop-blur-xl border border-white/20 text-white rounded-[1.5rem] font-black hover:bg-royal-600/50 transition-all shadow-xl"
            >
                <Bell className="w-6 h-6 text-amber-400" />
                بدء فحص وردية جديدة
            </button>
          </div>
        </div>
      </motion.div>

      {/* Advanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المنتجات', value: totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+14%' },
          { label: 'معدل الجودة العام', value: `${lastQualityRate}%`, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+2.4%' },
          { label: 'محجوزات الوردية', value: reservedItems.length, icon: ClipboardList, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'تنبيه' },
          { label: 'تقارير الأداء', value: totalKpis, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'محدث' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className={`bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-gray-400 text-xs font-black mb-1 uppercase tracking-widest">{stat.label}</p>
            <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{stat.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* Redesigned Quick Actions Section (Full Width Layout) */}
      <motion.div variants={itemVariants} className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center lg:items-stretch">
            <div className="lg:w-1/3 flex flex-col justify-center">
              <h3 className="text-3xl font-black mb-4">اختصارات النظام</h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">
                انتقل بسرعة إلى الأقسام المختلفة لإدارة الجودة والإنتاج والتوثيق الفني.
              </p>
              <div className="p-6 bg-royal-800 rounded-[1.5rem] relative overflow-hidden group cursor-pointer" onClick={() => navigate('database')}>
                  <ShieldCheck className="absolute -bottom-4 -left-4 w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black mb-2 flex items-center gap-2">نظام الحماية المشفر</h4>
                  <p className="text-[11px] text-royal-200 font-bold leading-relaxed opacity-80">
                    كافة بياناتك مخزنة محلياً باستخدام تقنية IndexedDB المشفرة لضمان أقصى درجات الخصوصية.
                  </p>
              </div>
            </div>

            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {[
                { label: 'إدارة المنتجات', icon: Package, view: 'products', color: 'text-blue-400', desc: 'مواصفات وعيوب المنتجات' },
                { label: 'الأرشيف الفني', icon: FileText, view: 'documents', color: 'text-amber-400', desc: 'مخزن الوثائق والتقارير' },
                { label: 'تحليل الأداء', icon: Activity, view: 'kpi', color: 'text-emerald-400', desc: 'مؤشرات الكفاءة الشهرية' },
                { label: 'الأجهزة والمعايرة', icon: Zap, view: 'lab-equipment', color: 'text-purple-400', desc: 'سجلات SOP والمعايرة' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(action.view as PageView)}
                  className="w-full flex flex-col p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] transition-all group text-right"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-4 rounded-2xl bg-white/5 ${action.color} group-hover:scale-110 transition-transform shadow-lg`}>
                      <action.icon className="w-7 h-7" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                  </div>
                  <span className="font-black text-xl mb-1">{action.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{action.desc}</span>
                </button>
              ))}
            </div>
          </div>
      </motion.div>

      {/* Reserved Area (Quarantine) Section - UPDATED: Full access for everyone */}
      <motion.div variants={itemVariants} className="bg-white rounded-[3rem] shadow-xl border border-rose-100 overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-48 h-48 bg-rose-50 rounded-bl-full -mr-20 -mt-20 opacity-40 group-hover:scale-110 transition-transform duration-700" />
         <div className="p-10 border-b border-rose-50 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-5">
                <div className="p-4 bg-rose-100 text-rose-600 rounded-3xl shadow-sm">
                    <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-900">منطقة المحجوزات (Quarantine)</h3>
                    <p className="text-gray-400 text-sm mt-1 font-black">متابعة المنتجات المعيبة والإجراءات التصحيحية</p>
                </div>
            </div>
            
            <button onClick={handleOpenAddReserved} className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95">
                <PlusCircle className="w-5 h-5" /> إضافة محجوز جديد
            </button>
         </div>

         <div className="overflow-x-auto p-6">
             <table className="w-full text-right border-separate border-spacing-y-4">
                 <thead className="text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                     <tr>
                         <th className="px-8 py-2">اسم المنتج</th>
                         <th className="px-8 py-2">المسؤول / الوردية</th>
                         <th className="px-8 py-2 text-center">الكمية</th>
                         <th className="px-8 py-2">وصف العيب</th>
                         <th className="px-8 py-2">الإجراء المتخذ</th>
                         <th className="px-8 py-2">التاريخ</th>
                         <th className="px-8 py-2 text-center">الحالة</th>
                         <th className="px-8 py-2 text-center">تحكم</th>
                     </tr>
                 </thead>
                 <tbody>
                     {reservedItems.length === 0 ? (
                        <tr><td colSpan={8} className="text-center py-16 bg-slate-50 rounded-[2rem] text-gray-400 font-black border border-dashed border-slate-200 uppercase tracking-widest">لا توجد محجوزات حالية</td></tr>
                     ) : (
                         reservedItems.map((item) => (
                             <tr key={item.id} className="bg-white hover:bg-rose-50/20 transition-all shadow-sm rounded-3xl group/row border border-gray-100">
                                 <td className="px-8 py-6 rounded-r-[1.5rem] font-black text-slate-800 border-y border-r border-gray-50">{item.productName}</td>
                                 <td className="px-8 py-6 border-y border-gray-50">
                                     <div className="flex flex-col">
                                        <div className="flex items-center gap-2 font-black text-slate-700"><User className="w-3.5 h-3.5 text-gray-400" />{item.inspectorName}</div>
                                        <span className="text-[10px] text-white font-black bg-slate-400 px-2.5 py-0.5 rounded-full w-fit mt-1.5">وردية {item.shift}</span>
                                     </div>
                                 </td>
                                 <td className="px-8 py-6 font-black text-slate-900 text-center text-lg border-y border-gray-50">{item.quantity}</td>
                                 <td className="px-8 py-6 border-y border-gray-50">
                                     <div className="flex items-center gap-2 text-rose-600 text-xs font-black bg-rose-50 px-4 py-1.5 rounded-xl border border-rose-100 w-fit"><AlertTriangle className="w-3.5 h-3.5" />{item.defects}</div>
                                 </td>
                                 <td className="px-8 py-6 text-sm text-slate-500 font-bold border-y border-gray-50">{item.actionTaken || '---'}</td>
                                 <td className="px-8 py-6 text-[10px] font-black text-gray-400 border-y border-gray-50 uppercase">{item.date}</td>
                                 <td className="px-8 py-6 border-y border-gray-50 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border shadow-sm ${
                                        item.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                        item.status === 'scrapped' ? 'bg-slate-50 text-slate-700 border-slate-200' : 
                                        'bg-amber-50 text-amber-700 border-amber-100'
                                    }`}>
                                        {item.status === 'resolved' ? 'تمت المعالجة' : item.status === 'scrapped' ? 'إعدام' : 'قيد الانتظار'}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 rounded-l-[1.5rem] text-center border-y border-l border-gray-50">
                                     <div className="flex items-center justify-center gap-2 opacity-0 group-hover/row:opacity-100 transition-all">
                                         <button onClick={() => handleEditReserved(item)} className="p-2.5 bg-royal-50 text-royal-600 hover:bg-royal-600 hover:text-white rounded-xl transition-all shadow-sm"><Edit2 className="w-4 h-4" /></button>
                                         <button onClick={() => handleDeleteReserved(item.id)} className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                 </td>
                             </tr>
                         ))
                     )}
                 </tbody>
             </table>
         </div>
      </motion.div>

      {/* Reserved Area Modal */}
      <AnimatePresence>
        {isReservedModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/40 backdrop-blur-xl p-4">
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[3rem] w-full max-w-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[92vh]">
                   <div className="p-8 border-b bg-rose-50/50 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/20">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-black text-rose-900">{editingReservedItem ? 'تعديل المحجوز' : 'إضافة إلى المحجوزات'}</h3>
                        </div>
                        <button onClick={() => setIsReservedModalOpen(false)} className="text-rose-300 hover:text-rose-600 transition-colors p-2 hover:bg-rose-100 rounded-full"><X className="w-8 h-8" /></button>
                   </div>
                   <form onSubmit={handleSaveReserved} className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">اسم المنتج</label>
                                <input required value={reservedFormData.productName} onChange={(e) => setReservedFormData({...reservedFormData, productName: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold transition-all" placeholder="اسم المنتج..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الكمية (قطعة)</label>
                                <input type="number" required value={reservedFormData.quantity} onChange={(e) => setReservedFormData({...reservedFormData, quantity: Number(e.target.value)})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-black text-lg transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">المراقب المسؤول</label>
                                <input required value={reservedFormData.inspectorName} onChange={(e) => setReservedFormData({...reservedFormData, inspectorName: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-bold transition-all" placeholder="الاسم..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الوردية</label>
                                <select value={reservedFormData.shift} onChange={(e) => setReservedFormData({...reservedFormData, shift: e.target.value as any})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none font-black transition-all">
                                    <option value="A">الوردية أ</option><option value="B">الوردية ب</option><option value="C">الوردية ج</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-black text-gray-500 uppercase tracking-widest">وصف العيوب الفنية</label>
                             <textarea required value={reservedFormData.defects} onChange={(e) => setReservedFormData({...reservedFormData, defects: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none min-h-[100px] font-bold transition-all resize-none" placeholder="صف المشكلة بدقة..." />
                        </div>

                        <div className="space-y-2">
                             <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الإجراء المتخذ (Corrective Action)</label>
                             <textarea value={reservedFormData.actionTaken} onChange={(e) => setReservedFormData({...reservedFormData, actionTaken: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none min-h-[100px] font-bold transition-all resize-none" placeholder="ماذا تم حيال هذه المنتجات؟" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">تاريخ الحجز</label>
                                <input type="date" value={reservedFormData.date} onChange={(e) => setReservedFormData({...reservedFormData, date: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">حالة الحجز</label>
                                <select value={reservedFormData.status} onChange={(e) => setReservedFormData({...reservedFormData, status: e.target.value as any})} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none font-black">
                                    <option value="pending">قيد الانتظار</option><option value="resolved">تمت المعالجة</option><option value="scrapped">إعدام (Scrap)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-8">
                             <button type="button" onClick={() => setIsReservedModalOpen(false)} className="flex-1 py-5 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-colors">إلغاء</button>
                             <button type="submit" className="flex-[2] py-5 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 shadow-2xl shadow-rose-600/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                                <Save className="w-6 h-6" /> اعتماد البيانات
                             </button>
                        </div>
                   </form>
               </motion.div>
           </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
