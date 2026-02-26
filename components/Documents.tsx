
import React, { useRef, useState } from 'react';
import { DocumentFile, UserRole } from '../types';
import { FileText, Download, Trash2, UploadCloud, Eye, FileSpreadsheet, File, CheckCircle, X, Printer, ShieldCheck, Search, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface DocsProps {
  documents: DocumentFile[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentFile[]>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
}

export const Documents: React.FC<DocsProps> = ({ documents, setDocuments, requestAuth, role }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const type = file.name.endsWith('pdf') ? 'pdf' : file.name.endsWith('xls') || file.name.endsWith('xlsx') ? 'excel' : 'word';
      const newDoc: DocumentFile = {
        id: Date.now().toString(),
        name: file.name,
        type: type as any,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toISOString().split('T')[0],
        url: URL.createObjectURL(file) // Create a local URL for preview
      };
      setDocuments(prev => [newDoc, ...prev]);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDelete = (id: string) => {
    requestAuth(() => {
      setDocuments(prev => prev.filter(d => d.id !== id));
    });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      default: return <File className="w-8 h-8 text-royal-500" />;
    }
  };

  // Filter Logic
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const renderPreviewContent = (doc: DocumentFile) => {
    // 1. Real Uploaded Files (PDF)
    if (doc.url !== '#' && doc.type === 'pdf') {
      return <iframe src={doc.url} className="w-full h-full rounded-lg shadow-inner bg-gray-100" title="PDF Preview"></iframe>;
    }

    // 2. Mock Data Simulation (Rich HTML Preview)
    if (doc.url === '#') {
        if (doc.type === 'pdf' || doc.name.includes('ISO') || doc.name.includes('دليل')) {
            // Simulate a Document/Standard
            return (
                <div className="bg-white p-8 md:p-12 shadow-sm min-h-full max-w-4xl mx-auto overflow-y-auto">
                    <div className="border-b-4 border-royal-800 mb-8 pb-4 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-8 h-8 text-royal-800" />
                                <span className="font-black text-xl text-gray-800">TQM SYSTEM</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{doc.name}</h1>
                            <p className="text-sm text-gray-500 mt-2">نسخة إلكترونية معتمدة - للاستخدام الداخلي</p>
                        </div>
                        <div className="text-left opacity-70">
                            <p className="font-bold">CONFIDENTIAL</p>
                            <p className="text-xs">DOC-ID: {doc.id.padStart(6, '0')}</p>
                            <p className="text-xs">DATE: {doc.date}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-8 text-justify leading-relaxed text-gray-800">
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-lg mb-2 text-royal-800">1. الملخص التنفيذي</h3>
                            <p>تهدف هذه الوثيقة إلى تحديد المعايير الأساسية لضمان الجودة في جميع مراحل الإنتاج. تم إعداد هذا الدليل ليتوافق مع متطلبات المواصفات العالمية ولسد الفجوات في العمليات التشغيلية الحالية.</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-2 text-royal-800">2. النطاق والتطبيق</h3>
                            <p>تسري أحكام هذه الوثيقة على كافة الأقسام الفنية والإدارية. يجب على جميع الموظفين الالتزام بالبروتوكولات الموضحة أدناه لضمان سلامة المنتج النهائي ورضا العملاء.</p>
                            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 bg-white p-4 rounded border border-gray-200">
                                <li>مراقبة المدخلات والمواد الخام.</li>
                                <li>الفحص الدوري لخطوط الإنتاج.</li>
                                <li>معايرة أجهزة القياس والاختبار.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-2 text-royal-800">3. المسؤوليات</h3>
                            <table className="w-full border-collapse text-sm mt-2">
                                <thead>
                                    <tr className="bg-royal-50 text-royal-900">
                                        <th className="border p-2 text-right">الدور</th>
                                        <th className="border p-2 text-right">المسؤولية</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border p-2 font-medium">مدير الجودة</td>
                                        <td className="border p-2">الاعتماد النهائي ومراجعة التقارير الشهرية.</td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2 font-medium">مراقب الجودة</td>
                                        <td className="border p-2">تنفيذ الفحص الميداني وتسجيل الملاحظات.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="border-t pt-8 mt-12 flex justify-between items-center text-gray-400 text-sm">
                            <p>تم الإنشاء بواسطة النظام الآلي</p>
                            <p>الصفحة 1 من 5</p>
                        </div>
                    </div>
                </div>
            );
        } else {
            // Simulate a Spreadsheet/Report
            return (
                <div className="bg-white p-8 md:p-12 shadow-sm min-h-full max-w-5xl mx-auto overflow-y-auto">
                     <div className="flex justify-between items-center mb-6 pb-6 border-b">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                                {doc.name}
                            </h1>
                            <p className="text-gray-500 mt-1">تقرير تحليلي - بيانات رقمية</p>
                        </div>
                        <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold">
                            Excel View Mode
                        </button>
                    </div>

                    <div className="overflow-x-auto border rounded-lg shadow-sm">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-3 border-b border-r w-10">#</th>
                                    <th className="p-3 border-b border-r">البند / المعيار</th>
                                    <th className="p-3 border-b border-r text-center">النتيجة (%)</th>
                                    <th className="p-3 border-b border-r text-center">الحالة</th>
                                    <th className="p-3 border-b">ملاحظات المدقق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-blue-50/50">
                                        <td className="p-3 border-r text-center bg-gray-50">{i}</td>
                                        <td className="p-3 border-r font-medium">معيار الأداء التشغيلي {i}0{i}</td>
                                        <td className="p-3 border-r text-center">{85 + i * 2}%</td>
                                        <td className="p-3 border-r text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${i === 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                {i === 3 ? 'مراجعة' : 'مطابق'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-500">{i === 3 ? 'يتطلب تحسين في الإجراءات' : 'لا توجد ملاحظات'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        <div className="bg-gray-50 p-4 rounded-lg border text-center">
                            <p className="text-xs text-gray-500 mb-1">إجمالي العينات</p>
                            <p className="text-xl font-bold text-gray-800">1,240</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border text-center">
                            <p className="text-xs text-gray-500 mb-1">معدل الانحراف</p>
                            <p className="text-xl font-bold text-red-600">2.4%</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border text-center">
                            <p className="text-xs text-gray-500 mb-1">نقاط الجودة</p>
                            <p className="text-xl font-bold text-emerald-600">96/100</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // 3. Fallback for other files (Word, Excel uploaded)
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-12 bg-white m-4 rounded-2xl shadow-sm">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Download className="w-12 h-12 text-royal-300" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-2">المعاينة المباشرة غير متاحة</h4>
            <p className="text-gray-500 mb-8 max-w-md">
                هذا النوع من الملفات ({doc.type.toUpperCase()}) يتطلب برنامجاً خارجياً لعرضه بشكل صحيح. يمكنك تحميل الملف لاستعراضه على جهازك.
            </p>
            <a 
                href={doc.url} 
                download={doc.name}
                className="flex items-center gap-2 px-8 py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-colors shadow-lg shadow-royal-800/20"
            >
                <Download className="w-5 h-5" />
                تحميل الملف ({doc.size})
            </a>
        </div>
    );
  };

  return (
    <div className="space-y-6 relative">
        <AnimatePresence>
            {showSuccess && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-bold">تم رفع الوثيقة بنجاح</span>
                </motion.div>
            )}
        </AnimatePresence>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مركز الوثائق</h2>
          <p className="text-gray-500">أرشفة وإدارة ملفات الجودة والتقارير</p>
        </div>
        
        {role === 'admin' && (
            <div className="relative">
                <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-royal-800 text-white rounded-xl hover:bg-royal-900 transition-all shadow-lg shadow-royal-800/20 active:scale-95"
                >
                <UploadCloud className="w-5 h-5" />
                رفع وثيقة معتمدة
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                />
            </div>
        )}
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="بحث عن وثيقة أو تقرير..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none transition-all"
            />
        </div>
        
        <div className="relative w-full md:w-48">
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-royal-500 outline-none appearance-none cursor-pointer text-sm font-semibold text-gray-600"
            >
                <option value="all">كل الملفات</option>
                <option value="pdf">ملفات PDF</option>
                <option value="excel">ملفات Excel</option>
                <option value="word">ملفات Word</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="p-4 w-16">#</th>
              <th className="p-4">اسم الملف</th>
              <th className="p-4">تاريخ الرفع</th>
              <th className="p-4">الحجم</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDocuments.map((doc, idx) => (
              <tr key={doc.id} className="hover:bg-royal-50/50 transition-colors group">
                <td className="p-4 text-center">{idx + 1}</td>
                <td className="p-4 flex items-center gap-3">
                  {getFileIcon(doc.type)}
                  <span className="font-medium text-gray-800">{doc.name}</span>
                </td>
                <td className="p-4 text-gray-500">{doc.date}</td>
                <td className="p-4 text-gray-500">{doc.size}</td>
                <td className="p-4">
                  {/* Action Buttons: Always visible now, no hover opacity trick */}
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setPreviewDoc(doc)}
                        className="p-2 text-royal-600 bg-royal-50 hover:bg-royal-100 rounded-lg transition-transform hover:scale-105"
                        title="مشاهدة الملف"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <a 
                        href={doc.url} 
                        download={doc.name}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-transform hover:scale-105"
                        title="تحميل"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                    {role === 'admin' && (
                        <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-transform hover:scale-105"
                        title="حذف"
                        >
                        <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredDocuments.length === 0 && (
            <div className="p-12 text-center text-gray-400">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>لا توجد وثائق تطابق بحثك</p>
                <button 
                    onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                    className="mt-2 text-royal-600 font-bold hover:underline"
                >
                    مسح الفلتر
                </button>
            </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-royal-950/80 backdrop-blur-sm p-4 md:p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gray-100 w-full h-full rounded-2xl flex flex-col overflow-hidden shadow-2xl relative"
            >
                {/* Modal Header */}
                <div className="bg-royal-900 text-white p-4 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg">
                             {getFileIcon(previewDoc.type)}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{previewDoc.name}</h3>
                            <p className="text-xs text-royal-200 flex items-center gap-2">
                                <span>{previewDoc.size}</span> • <span>{previewDoc.date}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <a 
                            href={previewDoc.url} 
                            download={previewDoc.name}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                            title="تحميل الملف"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                        <button 
                            onClick={() => window.print()} 
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white hidden md:block"
                            title="طباعة"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-white/20 mx-1"></div>
                        <button 
                            onClick={() => setPreviewDoc(null)} 
                            className="p-2 hover:bg-red-500/80 hover:text-white bg-white/10 rounded-lg transition-colors text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden relative bg-gray-200/50 flex flex-col items-center justify-center">
                    {renderPreviewContent(previewDoc)}
                </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};
