
import React, { useState } from 'react';
import { KPIData, UserRole } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, LineChart, Line 
} from 'recharts';
import { 
  Plus, X, Boxes, History, Calendar, BarChart3, Weight, Factory, TrendingUp, Zap, Save, Target, MessageSquareWarning, Trash2, Activity, Scale, Percent, Truck, RotateCcw, MessageSquare, FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KPIProps {
  data: KPIData[];
  setData: React.Dispatch<React.SetStateAction<KPIData[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const YEARS_RANGE = Array.from({ length: 31 }, (_, i) => (2020 + i).toString());

// Palette of Reds, Greens, and Blues for better visual distinction
const SHADES = {
  GREEN_DARK: "#15803d",
  GREEN_MEDIUM: "#16a34a",
  GREEN_NORMAL: "#22c55e",
  GREEN_LIGHT: "#4ade80",
  RED_DARK: "#991b1b",
  RED_MEDIUM: "#dc2626",
  RED_NORMAL: "#ef4444",
  RED_LIGHT: "#f87171",
  BLUE_DARK: "#1e3a8a",
  BLUE_NORMAL: "#3b82f6",
  BLUE_LIGHT: "#60a5fa",
};

export const KPIs: React.FC<KPIProps> = ({ data, setData, requestAuth, role }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>(new Date().getFullYear().toString());
  
  const [newData, setNewData] = useState<KPIData>({
    month: ARABIC_MONTHS[new Date().getMonth()],
    year: new Date().getFullYear().toString(),
    qualityRate: 100,
    defects: 0,
    reservedBlowPieces: 0,
    reservedBlowWeight: 0,
    reservedInjectionPieces: 0,
    reservedInjectionWeight: 0,
    scrappedBlow: 0,
    scrappedWeight: 0,
    scrappedInjection: 0,
    scrappedPieces: 0, 
    internalScrapPpm: 0,
    externalScrapPpm: 0,
    ncrShift1: 0,
    ncrShift2: 0,
    ncrShift3: 0,
    totalSupplied: 0,
    totalReturned: 0,
    totalComplaints: 0,
    totalProduction: 0,
    totalInternalReserved: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData(prev => {
      const existing = prev.findIndex(d => d.month === newData.month && d.year === newData.year);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing] = { ...newData };
        return updated;
      }
      return [...prev, { ...newData }];
    });
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'الشهر', 'السنة', 'معدل الجودة (%)', 'عدد العيوب',
      'إجمالي الإنتاج', 'المحجوز الداخلي',
      'عدد نفخ محجوز', 'وزن نفخ محجوز', 'عدد حقن محجوز', 'وزن حقن محجوز',
      'هالك نفخ (قطعة)', 'هالك نفخ (وزن)', 'هالك حقن (قطعة)', 'هالك حقن (وزن)',
      'PPM داخلي', 'PPM خارجي',
      'NCR وردية أ', 'NCR وردية ب', 'NCR وردية ج',
      'إجمالي التوريدات', 'إجمالي المرتجعات', 'عدد الشكاوى'
    ];

    // Filter data based on current view filter if needed, or export all. Exporting all makes more sense for backup/analysis.
    const csvRows = [
      headers.join(','),
      ...data.map(row => [
        row.month,
        row.year,
        row.qualityRate,
        row.defects,
        row.totalProduction,
        row.totalInternalReserved,
        row.reservedBlowPieces,
        row.reservedBlowWeight,
        row.reservedInjectionPieces,
        row.reservedInjectionWeight,
        row.scrappedBlow,
        row.scrappedWeight,
        row.scrappedInjection,
        row.scrappedPieces,
        row.internalScrapPpm,
        row.externalScrapPpm,
        row.ncrShift1,
        row.ncrShift2,
        row.ncrShift3,
        row.totalSupplied,
        row.totalReturned,
        row.totalComplaints
      ].join(','))
    ];

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kpi_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = data
    .filter(d => selectedYearFilter === 'all' || d.year === selectedYearFilter)
    .sort((a, b) => ARABIC_MONTHS.indexOf(a.month) - ARABIC_MONTHS.indexOf(b.month));

  return (
    <div className="space-y-10 pb-20" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="bg-royal-800 p-2 rounded-xl text-white">
                <History className="w-7 h-7" />
            </div>
            مؤشرات الأداء
          </h2>
          <p className="text-slate-500 mt-1 font-medium">تحليل بصري متقدم لكافة معايير الجودة والإنتاج واللوجستيات</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-royal-800 border border-royal-200 rounded-2xl hover:bg-royal-50 transition-colors font-bold shadow-sm"
            >
                <FileDown className="w-5 h-5" />
                تصدير CSV
            </button>

            <div className="flex items-center gap-3 bg-white border px-4 py-2.5 rounded-2xl shadow-sm">
                <Calendar className="w-5 h-5 text-royal-600" />
                <span className="text-sm font-bold">تصفية حسب السنة:</span>
                <select value={selectedYearFilter} onChange={(e) => setSelectedYearFilter(e.target.value)} className="bg-transparent outline-none font-black text-royal-800">
                    <option value="all">الكل</option>
                    {YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            {role === 'admin' && (
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3.5 bg-royal-800 text-white rounded-2xl hover:bg-royal-950 font-bold shadow-lg">
                    <Plus className="w-5 h-5" /> تحديث البيانات
                </button>
            )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed">
            <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-400">لا توجد بيانات متاحة للسنة المختارة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Chart 1: Production Efficiency */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><TrendingUp className="text-emerald-600" /> كفاءة الإنتاج مقابل المحجوزات</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" fontSize={12} fontWeight="bold" />
                            <Tooltip />
                            <Legend verticalAlign="top" height={36}/>
                            <Bar dataKey="totalProduction" name="إجمالي الإنتاج" fill={SHADES.GREEN_MEDIUM} radius={[6, 6, 0, 0]} />
                            <Bar dataKey="totalInternalReserved" name="المحجوز الداخلي" fill={SHADES.RED_MEDIUM} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: NCR by Shift (EXCEPTION: Keep Original Colors) */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl lg:col-span-2">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Zap className="text-amber-500" /> تقارير عدم المطابقة حسب الورديات (NCR)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="ncrShift1" name="وردية أ" fill="#3b82f6" />
                            <Bar dataKey="ncrShift2" name="وردية ب" fill="#10b981" />
                            <Bar dataKey="ncrShift3" name="وردية ج" fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 3: Reserved Pieces (Blow vs Injection) */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Boxes className="text-red-600" /> تحليل عدد المحجوز (نفخ مقابل حقن)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="reservedBlowPieces" name="عدد النفخ المحجوز" fill={SHADES.RED_NORMAL} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="reservedInjectionPieces" name="عدد الحقن المحجوز" fill={SHADES.GREEN_NORMAL} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 4: Reserved Weights (Blow vs Injection) - UPDATED TO BLUE/GREEN */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Scale className="text-royal-600" /> تحليل وزن المحجوز (نفخ مقابل حقن)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="reservedBlowWeight" name="وزن النفخ المحجوز" fill={SHADES.BLUE_DARK} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="reservedInjectionWeight" name="وزن الحقن المحجوز" fill={SHADES.GREEN_DARK} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 5: Scrap Pieces (Blow vs Injection) */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Trash2 className="text-red-600" /> تحليل كمية الهالك (نفخ مقابل حقن)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="scrappedBlow" name="قطع هالك النفخ" fill={SHADES.RED_LIGHT} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="scrappedInjection" name="قطع هالك الحقن" fill={SHADES.GREEN_LIGHT} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 6: Scrap Weights (Blow vs Injection) - UPDATED TO BLUE/GREEN */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Weight className="text-royal-600" /> تحليل أوزان الهالك (نفخ مقابل حقن)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="scrappedWeight" name="وزن هالك النفخ" fill={SHADES.BLUE_NORMAL} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="scrappedPieces" name="وزن هالك الحقن" fill={SHADES.GREEN_MEDIUM} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 7: Scrap PPM Indicators */}
            <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Target className="text-red-600" /> تحليل مؤشرات الهالك (PPM الداخلي والخارجي)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Line type="monotone" dataKey="internalScrapPpm" name="PPM داخلي" stroke={SHADES.RED_MEDIUM} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="externalScrapPpm" name="PPM خارجي" stroke={SHADES.GREEN_MEDIUM} strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 8: Logistics (Supplied vs Returned) */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><Truck className="text-emerald-600" /> التوريدات مقابل المرتجعات</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="totalSupplied" name="إجمالي التوريدات" fill={SHADES.GREEN_NORMAL} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="totalReturned" name="إجمالي المرتجعات" fill={SHADES.RED_NORMAL} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 9: Complaints Analysis (EXCEPTION: Keep Original Colors) */}
            <div className="bg-white p-6 rounded-[2.5rem] border shadow-xl">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><MessageSquare className="text-rose-500" /> تحليل شكاوى العملاء</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" reversed={true} fontSize={12} fontWeight="bold" />
                            <YAxis orientation="right" />
                            <Tooltip />
                            <Area type="monotone" dataKey="totalComplaints" name="عدد الشكاوى" stroke="#e11d48" fill="#fff1f2" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden my-auto border">
              <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <BarChart3 className="w-8 h-8 text-royal-800" /> إضافة تقرير أداء جديد
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-8 h-8" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-8 text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700">الشهر المستهدف</label>
                        <select value={newData.month} onChange={(e) => setNewData({...newData, month: e.target.value})} className="w-full px-5 py-4 bg-white border rounded-2xl outline-none font-bold">
                            {ARABIC_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700">السنة</label>
                        <select value={newData.year} onChange={(e) => setNewData({...newData, year: e.target.value})} className="w-full px-5 py-4 bg-white border rounded-2xl outline-none font-bold">
                            {YEARS_RANGE.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {/* Main Quality Metrics */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Target className="w-5 h-5 text-royal-600" />
                        <h4 className="font-black text-slate-800">مؤشرات الجودة العامة</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">معدل الجودة (%)</label>
                            <input 
                                type="number" step="0.01" max="100" required 
                                value={newData.qualityRate} 
                                onChange={(e) => setNewData({...newData, qualityRate: parseFloat(e.target.value) || 0})} 
                                className="w-full px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl outline-none font-black text-indigo-700" 
                                placeholder="100" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">إجمالي عدد العيوب</label>
                            <input 
                                type="number" required 
                                value={newData.defects} 
                                onChange={(e) => setNewData({...newData, defects: parseInt(e.target.value) || 0})} 
                                className="w-full px-5 py-4 bg-rose-50 border border-rose-100 rounded-2xl outline-none font-black text-rose-700" 
                                placeholder="0" 
                            />
                        </div>
                    </div>
                </div>

                {/* Production Stats */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Boxes className="w-5 h-5 text-royal-600" />
                        <h4 className="font-black text-slate-800">إحصائيات الإنتاج (قطع)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">إجمالي الإنتاج</label>
                            <input type="number" required value={newData.totalProduction || ''} onChange={(e) => setNewData({...newData, totalProduction: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none font-black text-royal-800" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">المحجوز الداخلي</label>
                            <input type="number" required value={newData.totalInternalReserved || ''} onChange={(e) => setNewData({...newData, totalInternalReserved: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 border rounded-2xl outline-none font-black text-amber-600" placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* NCR Per Shift */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h4 className="font-black text-slate-800">تقارير عدم المطابقة (NCR)</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">وردية أ</label>
                            <input type="number" value={newData.ncrShift1 || ''} onChange={(e) => setNewData({...newData, ncrShift1: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 border rounded-2xl font-black outline-none" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">وردية ب</label>
                            <input type="number" value={newData.ncrShift2 || ''} onChange={(e) => setNewData({...newData, ncrShift2: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 border rounded-2xl font-black outline-none" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600">وردية ج</label>
                            <input type="number" value={newData.ncrShift3 || ''} onChange={(e) => setNewData({...newData, ncrShift3: parseInt(e.target.value) || 0})} className="w-full px-5 py-4 bg-gray-50 border rounded-2xl font-black outline-none" placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* Logistics & Complaints */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                    <h4 className="font-black text-royal-900 mb-6 flex items-center gap-3"><Truck className="w-6 h-6 text-royal-700" /> التوريدات والمرتجعات والشكاوى</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><Truck className="w-3 h-3" /> إجمالي التوريدات</label>
                            <input type="number" value={newData.totalSupplied || ''} onChange={(e) => setNewData({...newData, totalSupplied: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border font-bold text-royal-700" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><RotateCcw className="w-3 h-3" /> إجمالي المرتجعات</label>
                            <input type="number" value={newData.totalReturned || ''} onChange={(e) => setNewData({...newData, totalReturned: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border font-bold text-orange-600" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> عدد الشكاوى</label>
                            <input type="number" value={newData.totalComplaints || ''} onChange={(e) => setNewData({...newData, totalComplaints: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border font-bold text-rose-600" placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* Reserved Details */}
                <div className="bg-royal-50 p-6 rounded-[2rem] border border-royal-100">
                    <h4 className="font-black text-royal-900 mb-6 flex items-center gap-3"><Boxes className="w-6 h-6 text-royal-600" /> تفاصيل الإنتاج المحجوز</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500">عدد النفخ</label><input type="number" value={newData.reservedBlowPieces} onChange={(e) => setNewData({...newData, reservedBlowPieces: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500">وزن النفخ</label><input type="number" step="0.01" value={newData.reservedBlowWeight} onChange={(e) => setNewData({...newData, reservedBlowWeight: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500">عدد الحقن</label><input type="number" value={newData.reservedInjectionPieces} onChange={(e) => setNewData({...newData, reservedInjectionPieces: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-slate-500">وزن الحقن</label><input type="number" step="0.01" value={newData.reservedInjectionWeight} onChange={(e) => setNewData({...newData, reservedInjectionWeight: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl border" /></div>
                    </div>
                </div>

                {/* Scrap & PPM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100">
                        <h4 className="font-black text-rose-900 mb-6 flex items-center gap-3"><Trash2 className="w-6 h-6 text-rose-600" /> بيانات الهالك (Scrap)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-xs font-bold text-slate-500">هالك نفخ (قطعة)</label><input type="number" value={newData.scrappedBlow} onChange={(e) => setNewData({...newData, scrappedBlow: Number(e.target.value)})} className="w-full p-3 rounded-xl border" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-slate-500">هالك نفخ (وزن)</label><input type="number" step="0.01" value={newData.scrappedWeight} onChange={(e) => setNewData({...newData, scrappedWeight: Number(e.target.value)})} className="w-full p-3 rounded-xl border" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-slate-500">هالك حقن (قطعة)</label><input type="number" value={newData.scrappedInjection} onChange={(e) => setNewData({...newData, scrappedInjection: Number(e.target.value)})} className="w-full p-3 rounded-xl border" /></div>
                            <div className="space-y-1"><label className="text-xs font-bold text-slate-500">هالك حقن (وزن)</label><input type="number" step="0.01" value={newData.scrappedPieces} onChange={(e) => setNewData({...newData, scrappedPieces: Number(e.target.value)})} className="w-full p-3 rounded-xl border" /></div>
                        </div>
                    </div>
                    <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 space-y-4">
                        <h4 className="font-black text-indigo-900 mb-6 flex items-center gap-3"><Target className="w-6 h-6 text-indigo-600" /> مؤشرات الهالك PPM</h4>
                        <div className="space-y-4">
                            <div className="space-y-1"><label className="text-sm font-bold">PPM داخلي (Internal)</label><input type="number" step="0.01" value={newData.internalScrapPpm} onChange={(e) => setNewData({...newData, internalScrapPpm: Number(e.target.value)})} className="w-full p-4 rounded-2xl border font-bold text-rose-600" /></div>
                            <div className="space-y-1"><label className="text-sm font-bold">PPM خارجي (External)</label><input type="number" step="0.01" value={newData.externalScrapPpm} onChange={(e) => setNewData({...newData, externalScrapPpm: Number(e.target.value)})} className="w-full p-4 rounded-2xl border font-bold text-indigo-600" /></div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t flex-row-reverse">
                    <button type="submit" className="flex-[2] py-4 bg-royal-800 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-royal-950 flex items-center justify-center gap-3"><Save className="w-6 h-6" /> اعتماد وإدراج التقرير النهائي</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-slate-700 rounded-2xl font-black hover:bg-gray-200">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};