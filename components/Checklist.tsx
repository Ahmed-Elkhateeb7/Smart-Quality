
import React, { useState } from 'react';
import { ChecklistEntry, UserRole, TopLoadStandard, DefectCode } from '../types';
import { Calendar, CheckSquare, AlertCircle, Settings2, Plus, Trash2, X, FileSpreadsheet, User, CheckCircle2, Package, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistProps {
  entries: ChecklistEntry[];
  setEntries: React.Dispatch<React.SetStateAction<ChecklistEntry[]>>;
  machines: string[];
  setMachines: React.Dispatch<React.SetStateAction<string[]>>;
  standards: TopLoadStandard[];
  machineProducts: Record<string, Record<string, Record<string, string>>>;
  setMachineProducts: React.Dispatch<React.SetStateAction<Record<string, Record<string, Record<string, string>>>>>;
  requestAuth: (action: () => void) => void;
  role: UserRole | null;
  shiftNames: Record<string, {A: string, B: string, C: string}>;
  setShiftNames: React.Dispatch<React.SetStateAction<Record<string, {A: string, B: string, C: string}>>>;
  defectCodes: DefectCode[];
  setDefectCodes: React.Dispatch<React.SetStateAction<DefectCode[]>>;
}

const TIME_SLOTS = [
  '08:00 ص', '10:00 ص', '12:00 م', '02:00 م', '04:00 م', '06:00 م', 
  '08:00 م', '10:00 م', '12:00 ص', '02:00 ص', '04:00 ص', '06:00 ص'
];

const DEFECT_COLORS = [
  'bg-yellow-100 text-yellow-800',
  'bg-orange-100 text-orange-800',
  'bg-red-100 text-red-800',
  'bg-purple-100 text-purple-800',
  'bg-blue-100 text-blue-800',
  'bg-indigo-100 text-indigo-800',
  'bg-pink-100 text-pink-800',
  'bg-cyan-100 text-cyan-800',
  'bg-teal-100 text-teal-800',
  'bg-lime-100 text-lime-800',
  'bg-rose-100 text-rose-800',
  'bg-emerald-100 text-emerald-800',
  'bg-gray-100 text-gray-800',
  'bg-amber-100 text-amber-800',
  'bg-red-50 text-red-900',
];

export const Checklist: React.FC<ChecklistProps> = ({ 
  entries, setEntries, machines, setMachines, standards, machineProducts, setMachineProducts, requestAuth, role, shiftNames, setShiftNames, defectCodes, setDefectCodes 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'A' | 'B' | 'C'>('A');

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  
  const [editingDefect, setEditingDefect] = useState<DefectCode | null>(null);
  const [defectFormData, setDefectFormData] = useState<DefectCode>({ code: '', label: '', color: DEFECT_COLORS[0] });

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
    const upperValue = value.toUpperCase();
    
    setEntries(prev => {
      const filtered = prev.filter(e => 
        !(e.date === selectedDate && e.shift === selectedShift && e.machineId === machineId && e.timeSlot === timeSlot)
      );
      
      if (upperValue.trim() === '') return filtered;

      return [...filtered, {
        id: `${selectedDate}-${selectedShift}-${machineId}-${timeSlot}`,
        date: selectedDate,
        shift: selectedShift,
        machineId,
        timeSlot,
        status: upperValue
      }];
    });
  };

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

  const handleDefectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectFormData.code || !defectFormData.label) return;

    setDefectCodes(prev => {
      if (editingDefect) {
        return prev.map(d => d.code === editingDefect.code ? defectFormData : d);
      }
      if (prev.some(d => d.code === defectFormData.code)) {
        alert('هذا الكود موجود بالفعل!');
        return prev;
      }
      return [...prev, defectFormData];
    });

    setIsDefectModalOpen(false);
    setEditingDefect(null);
    setDefectFormData({ code: '', label: '', color: DEFECT_COLORS[0] });
  };

  const handleDeleteDefect = (code: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الكود؟')) {
      setDefectCodes(prev => prev.filter(d => d.code !== code));
    }
  };

  const handleEditDefect = (defect: DefectCode) => {
    setEditingDefect(defect);
    setDefectFormData(defect);
    setIsDefectModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['الماكينة', 'اسم المنتج', ...TIME_SLOTS];
    
    const rows = machines.map(machine => {
      const productName = getMachineProduct(machine);
      const rowData = [machine, productName];
      TIME_SLOTS.forEach(time => {
         const entry = getEntry(machine, time);
         rowData.push(entry?.status || '-');
      });
      return rowData.join(',');
    });

    const shiftLabel = selectedShift === 'A' ? 'الوردية الأولى' : selectedShift === 'B' ? 'الوردية الثانية' : 'الوردية الثالثة';
    const shiftSupervisor = currentNames[selectedShift] || 'غير محدد';

    const csvContent = '\uFEFF' + [
        `تقرير فحص الوردية: ${shiftLabel},المسؤول: ${shiftSupervisor},التاريخ: ${selectedDate}`,
        '',
        headers.join(','), 
        ...rows
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `checklist_${selectedDate}_shift_${selectedShift}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCellColor = (status: string | undefined) => {
    if (!status) return 'bg-white';
    if (status === 'OK') return 'bg-green-100 text-green-800 font-bold border-green-300';
    if (status === 'STOP') return 'bg-red-100 text-red-800 font-bold border-red-300';
    return 'bg-amber-50 text-amber-800 font-bold border-amber-200';
  };

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-royal-600" />
            قائمة الفحص اليومي (Checklist)
          </h2>
          <p className="text-gray-500 font-bold text-sm">متابعة جودة الماكينات الدورية</p>
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
                    إدارة الماكينات
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

      {/* Defect Codes Legend */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
          <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center print:p-2 print:bg-gray-100">
              <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-royal-600" />
                  دليل أكواد العيوب
              </h3>
              <div className="flex items-center gap-2 no-print">
                {role === 'admin' && (
                  <button 
                    onClick={() => requestAuth(() => {
                      setEditingDefect(null);
                      setDefectFormData({ code: '', label: '', color: DEFECT_COLORS[0] });
                      setIsDefectModalOpen(true);
                    })}
                    className="flex items-center gap-1 px-3 py-1 bg-royal-50 text-royal-700 rounded-lg text-[10px] font-black hover:bg-royal-100 transition-colors border border-royal-200"
                  >
                    <Plus className="w-3 h-3" />
                    إضافة كود
                  </button>
                )}
                <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-1 rounded border">اكتب الكود في الخانة</span>
              </div>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 print:grid-cols-8 print:p-2 print:gap-1">
              {defectCodes.map((defect) => (
                  <div key={defect.code} className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs font-bold ${defect.color.replace('bg-', 'border-').replace('text-', 'text-opacity-50')} bg-white print:py-1 relative group`}>
                      <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-gray-800 font-black print:w-4 print:h-4 print:text-[10px]">{defect.code}</span>
                      <span className="text-gray-700 print:text-[9px] truncate px-1">{defect.label}</span>
                      
                      {role === 'admin' && (
                        <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 no-print">
                          <button onClick={() => handleEditDefect(defect)} className="p-1 text-royal-600 hover:bg-royal-50 rounded">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteDefect(defect.code)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                  </div>
              ))}
              <div className="col-span-1 md:col-span-2 flex gap-2 print:col-span-2">
                 <div className="flex-1 flex items-center justify-center bg-green-100 text-green-800 rounded-lg border border-green-200 font-black text-xs print:text-[9px] print:py-1">OK = سليم</div>
                 <div className="flex-1 flex items-center justify-center bg-red-100 text-red-800 rounded-lg border border-red-200 font-black text-xs print:text-[9px] print:py-1">STOP = توقف</div>
              </div>
          </div>
      </div>

      {/* Main Inspection Grid - EXACT MATCH TO TOPLOAD STYLE AND WIDER WIDTH */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
         <div className="overflow-x-auto">
             <table className="w-full text-center border-separate border-spacing-0">
                 <thead>
                     <tr className="bg-royal-900 text-white text-sm print:bg-gray-800 print:text-black print:text-xs">
                         <th className="p-4 font-black border-l border-royal-800 w-24 print:p-2 print:border-gray-300">
                            الماكينة
                         </th>
                         {/* Expanded Product Name Column to match Top Load layout space */}
                         <th className="p-4 font-black border-l border-royal-800 min-w-[320px] w-80 print:p-2 print:border-gray-300">
                            اسم المنتج
                         </th>
                         {TIME_SLOTS.map((time) => (
                             <th key={time} className="p-3 font-bold border-l border-royal-800 min-w-[100px] print:p-1 print:border-gray-300 print:text-[10px]">{time}</th>
                         ))}
                     </tr>
                 </thead>
                 <tbody className="text-sm font-bold text-gray-700">
                     {machines.map((machine) => (
                         <tr key={machine} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 print:border-gray-300 group">
                             <td className="p-3 bg-gray-50 font-black border-l border-gray-200 text-royal-800 text-base print:bg-gray-100 print:border-gray-300 print:text-sm print:p-1 group-hover:bg-white transition-colors">
                                {machine}
                             </td>
                             <td className="p-1 border-l border-gray-100 print:border-gray-300 min-w-[320px]">
                                 <div className="relative">
                                     <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 no-print" />
                                     <input 
                                        type="text" 
                                        value={getMachineProduct(machine)}
                                        onChange={(e) => handleMachineProductChange(machine, e.target.value)}
                                        className="w-full px-8 py-2 text-center outline-none bg-transparent hover:bg-white focus:bg-white transition-all rounded-md font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-300"
                                        placeholder="اكتب اسم المنتج..."
                                        list="product-standards-checklist-final"
                                        autoComplete="off"
                                     />
                                 </div>
                             </td>
                             {/* Time Slots Inputs */}
                             {TIME_SLOTS.map((time) => {
                                 const entry = getEntry(machine, time);
                                 return (
                                     <td key={time} className="p-1 border-l border-gray-100 h-16 relative group print:h-8 print:border-gray-300 print:p-0">
                                         <input 
                                            type="text" 
                                            maxLength={4}
                                            value={entry?.status || ''}
                                            onChange={(e) => handleCellChange(machine, time, e.target.value)}
                                            className={`w-full h-full text-center outline-none transition-all uppercase rounded-lg focus:ring-4 focus:ring-royal-500/10 border border-transparent focus:border-royal-400 font-mono ${getCellColor(entry?.status)} print:rounded-none print:text-xs text-base`}
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
      
      {/* Global Datalist for Product Names */}
      <datalist id="product-standards-checklist-final">
            {standards.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      {/* Machine Management Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
               >
                   <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-royal-600" />
                            إدارة الماكينات
                        </h3>
                        <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                   </div>
                   
                   <div className="p-6">
                       <form onSubmit={handleAddMachine} className="flex gap-2 mb-6">
                           <input 
                               type="text" 
                               value={newMachineName}
                               onChange={(e) => setNewMachineName(e.target.value)}
                               placeholder="اسم الماكينة (مثلاً: P9)"
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

                       <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 text-right">
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
                           {machines.length === 0 && (
                               <p className="text-center text-gray-400 font-bold py-4">لا توجد ماكينات مضافة</p>
                           )}
                       </div>
                   </div>
               </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Defect Code Management Modal */}
      <AnimatePresence>
        {isDefectModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
               >
                   <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-royal-600" />
                            {editingDefect ? 'تعديل كود العيب' : 'إضافة كود عيب جديد'}
                        </h3>
                        <button onClick={() => setIsDefectModalOpen(false)} className="text-gray-400 hover:text-red-500">
                            <X className="w-5 h-5" />
                        </button>
                   </div>
                   
                   <form onSubmit={handleDefectSubmit} className="p-6 space-y-4">
                       <div className="space-y-1">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الكود (حرف أو حرفين)</label>
                           <input 
                               type="text" 
                               maxLength={2}
                               required
                               value={defectFormData.code}
                               onChange={(e) => setDefectFormData({...defectFormData, code: e.target.value.toUpperCase()})}
                               placeholder="مثلاً: A"
                               disabled={!!editingDefect}
                               className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 font-black text-lg text-center"
                           />
                       </div>

                       <div className="space-y-1">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">وصف العيب</label>
                           <input 
                               type="text" 
                               required
                               value={defectFormData.label}
                               onChange={(e) => setDefectFormData({...defectFormData, label: e.target.value})}
                               placeholder="مثلاً: اتساخ"
                               className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 font-bold"
                           />
                       </div>

                       <div className="space-y-1">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-widest">اللون المميز</label>
                           <div className="grid grid-cols-5 gap-2">
                               {DEFECT_COLORS.map(color => (
                                   <button
                                       key={color}
                                       type="button"
                                       onClick={() => setDefectFormData({...defectFormData, color})}
                                       className={`h-10 rounded-lg border-2 transition-all ${color.split(' ')[0]} ${defectFormData.color === color ? 'border-royal-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                   />
                               ))}
                           </div>
                       </div>

                       <div className="flex gap-3 pt-4">
                           <button 
                               type="button" 
                               onClick={() => setIsDefectModalOpen(false)}
                               className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                           >
                               إلغاء
                           </button>
                           <button 
                               type="submit" 
                               className="flex-1 py-3 bg-royal-800 text-white rounded-xl font-bold hover:bg-royal-900 transition-colors shadow-lg shadow-royal-900/20"
                           >
                               {editingDefect ? 'حفظ التعديلات' : 'إضافة الكود'}
                           </button>
                       </div>
                   </form>
               </motion.div>
           </div>
        )}
      </AnimatePresence>

      <div className="text-center text-xs text-gray-400 font-bold mt-4 no-print">
         يتم حفظ البيانات تلقائياً. العمود الواسع يتيح لك رؤية اسم المنتج بوضوح تام.
      </div>
    </div>
  );
};
