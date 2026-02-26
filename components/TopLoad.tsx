
import React, { useState } from 'react';
import { TopLoadEntry, TopLoadStandard, UserRole } from '../types';
import { Calendar, Scale, FileSpreadsheet, User, CheckCircle2, Settings2, X, Plus, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopLoadProps {
  entries: TopLoadEntry[];
  setEntries: React.Dispatch<React.SetStateAction<TopLoadEntry[]>>;
  machines: string[];
  setMachines: React.Dispatch<React.SetStateAction<string[]>>;
  standards: TopLoadStandard[];
  setStandards: React.Dispatch<React.SetStateAction<TopLoadStandard[]>>;
  machineProducts: Record<string, Record<string, Record<string, string>>>;
  setMachineProducts: React.Dispatch<React.SetStateAction<Record<string, Record<string, Record<string, string>>>>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
  shiftNames: Record<string, {A: string, B: string, C: string}>;
  setShiftNames: React.Dispatch<React.SetStateAction<Record<string, {A: string, B: string, C: string}>>>;
}

const TIME_SLOTS = [
  '10:00 ص', '06:00 م', '02:00 ص'
];

export const TopLoad: React.FC<TopLoadProps> = ({ 
  entries, setEntries, machines, setMachines, standards, setStandards, 
  machineProducts, setMachineProducts, requestAuth, role, shiftNames, setShiftNames 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'A' | 'B' | 'C'>('A');
  
  // Management Modal State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'machines' | 'standards'>('standards');
  const [newMachineName, setNewMachineName] = useState('');
  
  // New Standard Form State
  const [newStdName, setNewStdName] = useState('');
  const [newStdVal, setNewStdVal] = useState('');
  const [newStdColor, setNewStdColor] = useState('bg-emerald-100 border-emerald-200');

  const currentNames = shiftNames[selectedDate] || { A: '', B: '', C: '' };

  const handleNameChange = (shift: 'A' | 'B' | 'C', name: string) => {
      setShiftNames(prev => ({
          ...prev,
          [selectedDate]: {
              ...(prev[selectedDate] || { A: '', B: '', C: '' }),
              [shift]: name
          }
      }));
  };

  const handleMachineProductChange = (machineId: string, productName: string) => {
      setMachineProducts(prev => ({
          ...prev,
          [selectedDate]: {
              ...(prev[selectedDate] || { A: {}, B: {}, C: {} }),
              [selectedShift]: {
                  ...(prev[selectedDate]?.[selectedShift] || {}),
                  [machineId]: productName
              }
          }
      }));
  };

  const getMachineProduct = (machineId: string) => {
      return machineProducts[selectedDate]?.[selectedShift]?.[machineId] || '';
  };

  const getEntry = (machineId: string, timeSlot: string) => {
    return entries.find(e => 
      e.date === selectedDate && 
      e.shift === selectedShift && 
      e.machineId === machineId && 
      e.timeSlot === timeSlot
    );
  };

  const handleCellChange = (machineId: string, timeSlot: string, value: string) => {
    setEntries(prev => {
      const filtered = prev.filter(e => 
        !(e.date === selectedDate && e.shift === selectedShift && e.machineId === machineId && e.timeSlot === timeSlot)
      );
      
      if (value.trim() === '') return filtered;

      return [...filtered, {
        id: `${selectedDate}-${selectedShift}-${machineId}-${timeSlot}`,
        date: selectedDate,
        shift: selectedShift,
        machineId,
        timeSlot,
        value: value
      }];
    });
  };

  // --- Management Logic ---

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMachineName.trim() && !machines.includes(newMachineName.trim())) {
        setMachines(prev => [...prev, newMachineName.trim()]);
        setNewMachineName('');
    }
  };

  const handleDeleteMachine = (machineName: string) => {
      setMachines(prev => prev.filter(m => m !== machineName));
  };

  const handleAddStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStdName.trim() && newStdVal.trim()) {
        const newStandard: TopLoadStandard = {
            id: Date.now().toString(),
            name: newStdName.trim(),
            val: Number(newStdVal),
            color: newStdColor
        };
        setStandards(prev => [...prev, newStandard]);
        setNewStdName('');
        setNewStdVal('');
    }
  };

  const handleDeleteStandard = (id: string) => {
      setStandards(prev => prev.filter(s => s.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['الماكينة', 'اسم المنتج', ...TIME_SLOTS];
    const rows = machines.map(machine => {
      const productName = getMachineProduct(machine);
      const rowData = [machine, productName];
      TIME_SLOTS.forEach(time => {
         const entry = getEntry(machine, time);
         rowData.push(entry?.value || '-');
      });
      return rowData.join(',');
    });

    const shiftLabel = selectedShift === 'A' ? 'الوردية الأولى' : selectedShift === 'B' ? 'الوردية الثانية' : 'الوردية الثالثة';
    const shiftSupervisor = currentNames[selectedShift] || 'غير محدد';

    const csvContent = '\uFEFF' + [
        `تقرير فحص التوب لود (Top Load Check): ${shiftLabel},المسؤول: ${shiftSupervisor},التاريخ: ${selectedDate}`,
        '',
        headers.join(','), 
        ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `topload_${selectedDate}_shift_${selectedShift}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLOR_OPTIONS = [
      { class: 'bg-emerald-100 border-emerald-200', label: 'أخضر' },
      { class: 'bg-yellow-100 border-yellow-200', label: 'أصفر' },
      { class: 'bg-blue-100 border-blue-200', label: 'أزرق' },
      { class: 'bg-purple-100 border-purple-200', label: 'بنفسجي' },
      { class: 'bg-orange-100 border-orange-200', label: 'برتقالي' },
  ];

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Scale className="w-8 h-8 text-royal-600" />
            فحص التوب لود (Top Load Check)
          </h2>
          <p className="text-gray-500 font-bold text-sm">متابعة اختبارات تحمل العبوات</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className="bg-transparent outline-none text-sm font-bold text-gray-700"
                />
            </div>

            {role === 'admin' && (
                <button 
                    onClick={() => requestAuth(() => setIsManageModalOpen(true))}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-royal-800 border border-royal-200 rounded-xl font-bold hover:bg-royal-50 transition-colors"
                >
                    <Settings2 className="w-4 h-4" />
                    إعدادات الفحص
                </button>
            )}

            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                title="تحميل كملف Excel"
            >
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
            </button>
        </div>
      </div>

      {/* Shift Selector Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          {[
              { id: 'A', label: 'الوردية الأولى' },
              { id: 'B', label: 'الوردية الثانية' },
              { id: 'C', label: 'الوردية الثالثة' }
          ].map((shift) => (
              <div 
                key={shift.id}
                onClick={() => setSelectedShift(shift.id as any)}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden group bg-white shadow-sm ${
                    selectedShift === shift.id 
                    ? 'border-royal-600 shadow-xl shadow-royal-900/5 ring-1 ring-royal-200' 
                    : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
                }`}
              >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 transition-colors ${selectedShift === shift.id ? 'bg-royal-600' : 'bg-transparent group-hover:bg-gray-50'}`} />
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-black tracking-wide ${selectedShift === shift.id ? 'text-royal-800' : 'text-gray-500'}`}>
                        {shift.label}
                    </span>
                    {selectedShift === shift.id && (
                        <div className="bg-royal-600 text-white p-1 rounded-full shadow-sm">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${selectedShift === shift.id ? 'text-royal-500' : 'text-gray-400'}`}>مسؤول الوردية</label>
                      <div className="relative">
                          <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${selectedShift === shift.id ? 'text-royal-400' : 'text-gray-300'}`} />
                          <input 
                            type="text"
                            placeholder="اكتب اسم المسؤول هنا..."
                            value={currentNames[shift.id as 'A'|'B'|'C']}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleNameChange(shift.id as any, e.target.value)}
                            className={`w-full pr-10 pl-4 py-3 rounded-2xl border outline-none font-black text-sm transition-all ${
                                selectedShift === shift.id 
                                ? 'bg-white border-royal-200 text-royal-900 focus:ring-4 focus:ring-royal-500/10 focus:border-royal-500' 
                                : 'bg-gray-50/30 border-gray-100 text-gray-500 hover:bg-white focus:bg-white'
                            }`}
                          />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Standards Definition Table */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center print:p-2 print:bg-gray-100">
              <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm">
                  <Scale className="w-4 h-4 text-royal-600" />
                  القيم القياسية للتوب لود (Standard Values)
              </h3>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 print:grid-cols-8 print:p-2 print:gap-1">
              {standards.map((std) => (
                  <div key={std.id} className={`flex flex-col items-center justify-center p-2 rounded-xl border ${std.color} print:p-1`}>
                      <span className="text-gray-600 text-[10px] font-bold mb-1">{std.name}</span>
                      <span className="text-gray-800 font-black text-lg print:text-sm">{std.val}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Main Grid */}
      <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
         <div className="overflow-x-auto">
             <table className="w-full text-center border-collapse">
                 <thead>
                     <tr className="bg-royal-900 text-white text-sm print:bg-gray-800 print:text-black print:text-xs">
                         <th className="p-4 font-black border-l border-royal-800 w-24 print:p-2 print:border-gray-300">الماكينة</th>
                         <th className="p-4 font-black border-l border-royal-800 w-48 print:p-2 print:border-gray-300">اسم المنتج</th>
                         {TIME_SLOTS.map((time) => (
                             <th key={time} className="p-3 font-bold border-l border-royal-800 min-w-[80px] print:p-1 print:border-gray-300 print:text-[10px]">{time}</th>
                         ))}
                     </tr>
                 </thead>
                 <tbody className="text-sm font-bold text-gray-700">
                     {machines.map((machine) => (
                         <tr key={machine} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 print:border-gray-300">
                             <td className="p-3 bg-gray-50 font-black border-l border-gray-200 text-royal-800 text-base print:bg-gray-100 print:border-gray-300 print:text-sm print:p-1">{machine}</td>
                             <td className="p-1 border-l border-gray-100 print:border-gray-300">
                                 <div className="relative">
                                     <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 no-print" />
                                     <input 
                                        type="text" 
                                        value={getMachineProduct(machine)}
                                        onChange={(e) => handleMachineProductChange(machine, e.target.value)}
                                        className="w-full px-8 py-2 text-center outline-none bg-transparent hover:bg-white focus:bg-white transition-all rounded-md font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-300"
                                        placeholder="اكتب اسم المنتج..."
                                        list="product-standards"
                                     />
                                     <datalist id="product-standards">
                                         {standards.map(s => <option key={s.id} value={s.name} />)}
                                     </datalist>
                                 </div>
                             </td>
                             {TIME_SLOTS.map((time) => {
                                 const entry = getEntry(machine, time);
                                 return (
                                     <td key={time} className="p-1 border-l border-gray-100 h-14 relative group print:h-8 print:border-gray-300 print:p-0">
                                         <input 
                                            type="text" 
                                            value={entry?.value || ''}
                                            onChange={(e) => handleCellChange(machine, time, e.target.value)}
                                            className="w-full h-full text-center outline-none transition-all rounded-md focus:ring-2 focus:ring-inset focus:ring-royal-500 hover:bg-gray-50 print:rounded-none print:text-xs font-mono text-gray-600"
                                            placeholder="-"
                                         />
                                     </td>
                                 );
                             })}
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>

      {/* Management Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
               >
                   <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-royal-600" />
                            إدارة بيانات الفحص
                        </h3>
                        <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                   </div>
                   
                   <div className="flex border-b border-gray-100">
                       <button 
                           onClick={() => setActiveTab('standards')}
                           className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'standards' ? 'text-royal-600 border-b-2 border-royal-600 bg-royal-50' : 'text-gray-500 hover:bg-gray-50'}`}
                       >
                           إدارة المعايير القياسية
                       </button>
                       <button 
                           onClick={() => setActiveTab('machines')}
                           className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'machines' ? 'text-royal-600 border-b-2 border-royal-600 bg-royal-50' : 'text-gray-500 hover:bg-gray-50'}`}
                       >
                           إدارة الماكينات
                       </button>
                   </div>

                   <div className="p-6 overflow-y-auto custom-scrollbar">
                       {activeTab === 'machines' && (
                           <>
                               <form onSubmit={handleAddMachine} className="flex gap-2 mb-6">
                                   <input 
                                       type="text" 
                                       value={newMachineName}
                                       onChange={(e) => setNewMachineName(e.target.value)}
                                       placeholder="اسم الماكينة (مثلاً: P15)"
                                       className="flex-1 px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 text-sm font-bold"
                                   />
                                   <button 
                                       type="submit" 
                                       disabled={!newMachineName.trim()}
                                       className="px-4 py-2 bg-royal-800 text-white rounded-xl hover:bg-royal-900 disabled:opacity-50 font-bold"
                                   >
                                       <Plus className="w-5 h-5" />
                                   </button>
                               </form>

                               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                   {machines.map((machine) => (
                                       <div key={machine} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                           <span className="font-black text-gray-700">{machine}</span>
                                           <button 
                                               onClick={() => handleDeleteMachine(machine)}
                                               className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                               title="حذف الماكينة"
                                           >
                                               <Trash2 className="w-4 h-4" />
                                           </button>
                                       </div>
                                   ))}
                               </div>
                           </>
                       )}

                       {activeTab === 'standards' && (
                           <>
                                <form onSubmit={handleAddStandard} className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                                   <p className="text-xs font-bold text-gray-500 mb-2">إضافة معيار جديد</p>
                                   <div className="grid grid-cols-2 gap-3">
                                       <input 
                                           type="text" 
                                           value={newStdName}
                                           onChange={(e) => setNewStdName(e.target.value)}
                                           placeholder="اسم المنتج (مثلاً: شل 1)"
                                           className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 text-sm font-bold"
                                       />
                                       <input 
                                           type="number" 
                                           value={newStdVal}
                                           onChange={(e) => setNewStdVal(e.target.value)}
                                           placeholder="القيمة القياسية (مثلاً: 25)"
                                           className="px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 text-sm font-bold"
                                       />
                                   </div>
                                   <div className="flex gap-2 items-center">
                                       {COLOR_OPTIONS.map((opt) => (
                                           <button
                                               type="button"
                                               key={opt.label}
                                               onClick={() => setNewStdColor(opt.class)}
                                               className={`w-8 h-8 rounded-full border-2 ${opt.class.split(' ')[0]} ${newStdColor === opt.class ? 'ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200'}`}
                                               title={opt.label}
                                           />
                                       ))}
                                       <div className="flex-1"></div>
                                       <button 
                                           type="submit" 
                                           disabled={!newStdName.trim() || !newStdVal.trim()}
                                           className="px-6 py-2 bg-royal-800 text-white rounded-xl hover:bg-royal-900 disabled:opacity-50 font-bold flex items-center gap-2"
                                       >
                                           <Plus className="w-4 h-4" /> إضافة
                                       </button>
                                   </div>
                                </form>

                                <div className="space-y-2">
                                   {standards.map((std) => (
                                       <div key={std.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                           <div className="flex items-center gap-3">
                                               <div className={`w-3 h-3 rounded-full ${std.color.split(' ')[0]}`}></div>
                                               <div>
                                                   <p className="font-black text-gray-800 text-sm">{std.name}</p>
                                                   <p className="text-xs text-gray-500 font-bold">Standard: {std.val}</p>
                                               </div>
                                           </div>
                                           <button 
                                               onClick={() => handleDeleteStandard(std.id)}
                                               className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                           >
                                               <Trash2 className="w-4 h-4" />
                                           </button>
                                       </div>
                                   ))}
                               </div>
                           </>
                       )}
                   </div>
               </motion.div>
           </div>
        )}
      </AnimatePresence>

      <div className="text-center text-xs text-gray-400 font-bold mt-4 no-print">
         يتم حفظ البيانات تلقائياً. سجل قراءة التوب لود في الخانة المناسبة للوقت والماكينة.
      </div>
    </div>
  );
};
