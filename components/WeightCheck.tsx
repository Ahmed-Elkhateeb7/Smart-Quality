
import React, { useState } from 'react';
import { WeightEntry, TopLoadStandard, UserRole } from '../types';
import { Calendar, Weight, FileSpreadsheet, User, CheckCircle2, Package, Clock, ChevronDown, Settings2, Plus, Trash2, X, Edit3, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeightCheckProps {
  entries: WeightEntry[];
  setEntries: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  machines: string[];
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
  '08:00 ص', '10:00 ص', '12:00 م', '02:00 م', '04:00 م', '06:00 م', 
  '08:00 م', '10:00 م', '12:00 ص', '02:00 ص', '04:00 ص', '06:00 ص'
];

export const WeightCheck: React.FC<WeightCheckProps> = ({ 
  entries, setEntries, machines, standards, setStandards, machineProducts, setMachineProducts, 
  requestAuth, role, shiftNames, setShiftNames 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState<'A' | 'B' | 'C'>('A');

  // Management Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newStandardName, setNewStandardName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

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

  const getEntryValue = (machineId: string, timeSlot: string) => {
    return entries.find(e => 
      e.date === selectedDate && 
      e.shift === selectedShift && 
      e.machineId === machineId && 
      e.timeSlot === timeSlot
    )?.value || '';
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
  const handleAddStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStandardName.trim()) {
        const newStd: TopLoadStandard = {
            id: Date.now().toString(),
            name: newStandardName.trim(),
            val: 0,
            color: 'bg-gray-100 border-gray-200'
        };
        setStandards(prev => [...prev, newStd]);
        setNewStandardName('');
    }
  };

  const handleStartEdit = (std: TopLoadStandard) => {
      setEditingId(std.id);
      setEditingValue(std.name);
  };

  const handleSaveEdit = (id: string) => {
      setStandards(prev => prev.map(s => s.id === id ? { ...s, name: editingValue } : s));
      setEditingId(null);
  };

  const handleDeleteStandard = (id: string) => {
      setStandards(prev => prev.filter(s => s.id !== id));
  };

  const handleExportCSV = () => {
    const headers = ['الماكينة', 'اسم المنتج', ...TIME_SLOTS];
    const rows = machines.map(machine => {
      const productName = getMachineProduct(machine);
      const rowData = [machine, productName];
      TIME_SLOTS.forEach(time => { rowData.push(getEntryValue(machine, time) || '-'); });
      return rowData.join(',');
    });
    const csvContent = '\uFEFF' + [
        `تقرير فحص الأوزان (Weight Check),التاريخ: ${selectedDate},الوردية: ${selectedShift}`,
        '',
        headers.join(','), 
        ...rows
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `weight_check_${selectedDate}_shift_${selectedShift}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20 print:pb-0 print:space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Weight className="w-8 h-8 text-royal-600" />
            فحص الأوزان (Weight Check)
          </h2>
          <p className="text-gray-500 font-bold text-sm">متابعة أوزان المنتجات الدورية</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-transparent outline-none text-sm font-bold text-gray-700" />
            </div>

            {role === 'admin' && (
                <button 
                    onClick={() => requestAuth(() => setIsManageModalOpen(true))}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-royal-800 border border-royal-200 rounded-xl font-bold hover:bg-royal-50 transition-colors"
                >
                    <Settings2 className="w-4 h-4" />
                    إدارة قائمة المنتجات
                </button>
            )}

            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
                <FileSpreadsheet className="w-4 h-4" />
                تصدير Excel
            </button>
        </div>
      </div>

      {/* Shift Selector Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          {['A', 'B', 'C'].map((s) => (
              <div 
                key={s}
                onClick={() => setSelectedShift(s as any)}
                className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden group bg-white shadow-sm ${selectedShift === s ? 'border-royal-600 shadow-xl shadow-royal-900/5 ring-1 ring-royal-200' : 'border-gray-100 hover:border-gray-200'}`}
              >
                  <div className={`absolute top-0 right-0 left-0 h-1.5 transition-colors ${selectedShift === s ? 'bg-royal-600' : 'bg-transparent'}`} />
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-black tracking-wide ${selectedShift === s ? 'text-royal-800' : 'text-gray-500'}`}>الوردية {s === 'A' ? 'الأولى' : s === 'B' ? 'الثانية' : 'الثالثة'}</span>
                    {selectedShift === s && <div className="bg-royal-600 text-white p-1 rounded-full shadow-sm"><CheckCircle2 className="w-4 h-4" /></div>}
                  </div>
                  <div className="space-y-1.5">
                      <label className={`text-[10px] font-black uppercase tracking-widest ${selectedShift === s ? 'text-royal-500' : 'text-gray-400'}`}>مسؤول الوردية</label>
                      <div className="relative">
                          <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${selectedShift === s ? 'text-royal-400' : 'text-gray-300'}`} />
                          <input type="text" placeholder="اكتب اسم المسؤول..." value={currentNames[s as 'A'|'B'|'C']} onClick={(e) => e.stopPropagation()} onChange={(e) => handleNameChange(s as any, e.target.value)} className={`w-full pr-10 pl-4 py-3 rounded-2xl border outline-none font-black text-sm ${selectedShift === s ? 'bg-white border-royal-200 text-royal-900' : 'bg-gray-50/30 border-gray-100 text-gray-500'}`} />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Main Grid with Exact TopLoad Style and Width */}
      <div className="bg-white rounded-[1.5rem] shadow-md border border-gray-200 overflow-hidden print:shadow-none print:border print:rounded-none">
         <div className="overflow-x-auto">
             <table className="w-full text-center border-separate border-spacing-0">
                 <thead>
                     <tr className="bg-royal-900 text-white text-sm print:bg-gray-800 print:text-black">
                         <th className="p-4 font-black border-l border-royal-800 w-24 print:p-2 print:border-gray-300">الماكينة</th>
                         {/* Expanded Product Name Column to match Top Load layout space */}
                         <th className="p-4 font-black border-l border-royal-800 min-w-[320px] w-80 print:p-2 print:border-gray-300">اسم المنتج</th>
                         {TIME_SLOTS.map((time) => (<th key={time} className="p-3 font-bold border-l border-royal-800 min-w-[100px] print:text-[10px]">{time}</th>))}
                     </tr>
                 </thead>
                 <tbody className="text-sm font-bold text-gray-700">
                     {machines.map((m) => (
                         <tr key={m} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 print:border-gray-300 group">
                             <td className="p-3 bg-gray-50 font-black border-l border-gray-200 text-royal-800 text-base print:static print:text-sm group-hover:bg-white transition-colors">{m}</td>
                             <td className="p-1 border-l border-gray-100 print:border-gray-300 min-w-[320px]">
                                 <div className="relative">
                                     <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 no-print" />
                                     <input 
                                        type="text" 
                                        value={getMachineProduct(m)}
                                        onChange={(e) => handleMachineProductChange(m, e.target.value)}
                                        className="w-full px-8 py-2 text-center outline-none bg-transparent hover:bg-white focus:bg-white transition-all rounded-md font-bold text-gray-800 placeholder:font-normal placeholder:text-gray-300"
                                        placeholder="اكتب اسم المنتج..."
                                        list="product-standards-weight-final"
                                        autoComplete="off"
                                     />
                                 </div>
                             </td>
                             {TIME_SLOTS.map((time) => (
                                 <td key={time} className="p-1 border-l border-gray-100 h-16 relative group print:h-8 print:p-0">
                                     <input 
                                        type="text" 
                                        value={getEntryValue(m, time)}
                                        onChange={(e) => handleCellChange(m, time, e.target.value)}
                                        className="w-full h-full text-center outline-none transition-all rounded-lg focus:ring-4 focus:ring-royal-500/10 border border-transparent focus:border-royal-400 hover:bg-gray-50 print:text-xs font-mono text-gray-600 text-base"
                                        placeholder="0.00"
                                     />
                                 </td>
                             ))}
                         </tr>
                     ))}
                 </tbody>
             </table>
         </div>
      </div>
      
      {/* Global Datalist for Product Names - Moved outside loop */}
      <datalist id="product-standards-weight-final">
            {standards.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <div className="text-center text-xs text-gray-400 font-bold mt-4 no-print">يتم حفظ أوزان المنتجات تلقائياً. العمود الواسع يتيح لك رؤية اسم المنتج بوضوح تام.</div>

      {/* Management Modal */}
      <AnimatePresence>
        {isManageModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                   <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><Settings2 className="w-5 h-5 text-royal-600" /> إدارة القائمة المقترحة</h3>
                        <button onClick={() => setIsManageModalOpen(false)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                   </div>
                   <div className="p-6 overflow-y-auto custom-scrollbar">
                        <form onSubmit={handleAddStandard} className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-2">
                           <input type="text" value={newStandardName} onChange={(e) => setNewStandardName(e.target.value)} placeholder="اسم المنتج الجديد..." className="flex-1 px-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-royal-500 text-sm font-bold" />
                           <button type="submit" disabled={!newStandardName.trim()} className="px-4 py-2 bg-royal-800 text-white rounded-xl hover:bg-royal-900 disabled:opacity-50 font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> إضافة</button>
                        </form>
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                           {standards.map((std) => (
                               <div key={std.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                   <div className="flex items-center gap-3 flex-1">
                                       <div className="w-2 h-2 rounded-full bg-royal-400 shrink-0"></div>
                                       {editingId === std.id ? (
                                           <input autoFocus value={editingValue} onChange={(e) => setEditingValue(e.target.value)} className="flex-1 px-2 py-1 border rounded font-bold text-sm outline-none" />
                                       ) : (
                                           <span className="font-black text-gray-800 text-sm truncate">{std.name}</span>
                                       )}
                                   </div>
                                   <div className="flex gap-1 shrink-0">
                                       {editingId === std.id ? (
                                           <button onClick={() => handleSaveEdit(std.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Save className="w-4 h-4" /></button>
                                       ) : (
                                           <button onClick={() => handleStartEdit(std)} className="p-2 text-royal-600 hover:bg-royal-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                       )}
                                       <button onClick={() => handleDeleteStandard(std.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                   </div>
                               </div>
                           ))}
                           {standards.length === 0 && <p className="text-center text-gray-400 font-bold py-4">القائمة فارغة</p>}
                       </div>
                   </div>
               </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};
