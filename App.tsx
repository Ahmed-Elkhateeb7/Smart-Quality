
import React, { useState, useEffect, Suspense } from 'react';
import localforage from 'localforage';
import { Sidebar } from './components/Sidebar';
import { PasswordModal } from './components/PasswordModal';
import { Login } from './components/Login';
import { PageView, Product, Employee, DocumentFile, KPIData, CompanySettings, UserRole, ReservedItem, LabDevice, ChecklistEntry, TopLoadEntry, TopLoadStandard, WeightEntry, DefectCode } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { Database as DbIcon, Loader2, Menu, LogOut } from 'lucide-react';

// Lazy Load Components
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Products = React.lazy(() => import('./components/Products').then(module => ({ default: module.Products })));
const Team = React.lazy(() => import('./components/Team').then(module => ({ default: module.Team })));
const KPIs = React.lazy(() => import('./components/KPIs').then(module => ({ default: module.KPIs })));
const LabEquipment = React.lazy(() => import('./components/LabEquipment').then(module => ({ default: module.LabEquipment })));
const Documents = React.lazy(() => import('./components/Documents').then(module => ({ default: module.Documents })));
const About = React.lazy(() => import('./components/About').then(module => ({ default: module.About })));
const Database = React.lazy(() => import('./components/Database').then(module => ({ default: module.Database })));
const CompanySettingsPanel = React.lazy(() => import('./components/CompanySettings').then(module => ({ default: module.CompanySettingsPanel })));
const Checklist = React.lazy(() => import('./components/Checklist').then(module => ({ default: module.Checklist })));
const TopLoad = React.lazy(() => import('./components/TopLoad').then(module => ({ default: module.TopLoad })));
const WeightCheck = React.lazy(() => import('./components/WeightCheck').then(module => ({ default: module.WeightCheck })));

const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  name: '', slogan: '', address: '', logo: '', email: '', phone: '', website: '', registrationNumber: '', certificates: ''
};

const DEFAULT_MACHINES = [
  'P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 
  'P10', 'P11', 'P13', 'FKI 5', 'FKI 6', 'FKI 7', 'FKI 8', 
  'PB1', 'PB2', 'H2', 'H4', 'H5', 'H6', 'H7', 'H8', 'ENGEL'
];

const DEFAULT_TOP_LOAD_STANDARDS: TopLoadStandard[] = [
  { id: '1', name: 'كمف 2', val: 51, color: 'bg-emerald-100 border-emerald-200' },
  { id: '2', name: 'وفير 4', val: 70, color: 'bg-emerald-100 border-emerald-200' },
  { id: '3', name: 'كمف 1', val: 44, color: 'bg-emerald-100 border-emerald-200' },
  { id: '4', name: 'اليدا 400', val: 18, color: 'bg-emerald-100 border-emerald-200' },
  { id: '5', name: 'هافولين 1', val: 25, color: 'bg-emerald-100 border-emerald-200' },
  { id: '6', name: 'موبيل 4', val: 29.16, color: 'bg-yellow-100 border-yellow-200' },
  { id: '7', name: 'موبيل 5', val: 29.16, color: 'bg-yellow-100 border-yellow-200' },
  { id: '8', name: 'موبيل 20', val: 29.16, color: 'bg-yellow-100 border-yellow-200' },
  { id: '9', name: 'شل 1', val: 20, color: 'bg-yellow-100 border-yellow-200' },
  { id: '10', name: 'شل 4', val: 40, color: 'bg-yellow-100 border-yellow-200' },
  { id: '11', name: 'شل 5', val: 45, color: 'bg-yellow-100 border-yellow-200' },
  { id: '12', name: 'شل 20', val: 200, color: 'bg-yellow-100 border-yellow-200' },
  { id: '13', name: 'شل 22', val: 250, color: 'bg-yellow-100 border-yellow-200' },
  { id: '14', name: 'اوكسي 900', val: 40, color: 'bg-blue-100 border-blue-200' },
  { id: '15', name: 'جينرال 3.1', val: 24, color: 'bg-blue-100 border-blue-200' },
  { id: '16', name: 'برسيل 3', val: 27, color: 'bg-blue-100 border-blue-200' },
  { id: '17', name: 'برسيل 2.5', val: 24, color: 'bg-blue-100 border-blue-200' },
  { id: '18', name: 'برسيل 1', val: 16.5, color: 'bg-blue-100 border-blue-200' },
  { id: '19', name: 'كوزمو 700', val: 21, color: 'bg-purple-100 border-purple-200' },
  { id: '20', name: 'كوزمو 400', val: 21, color: 'bg-purple-100 border-purple-200' },
  { id: '21', name: 'كوزمو 190', val: 18.5, color: 'bg-purple-100 border-purple-200' },
  { id: '22', name: 'كوزمو 100', val: 17, color: 'bg-purple-100 border-purple-200' },
  { id: '23', name: 'كامي 1', val: 28, color: 'bg-orange-100 border-orange-200' },
  { id: '24', name: 'كمف 3', val: 45, color: 'bg-orange-100 border-orange-200' },
];

const DEFAULT_DEFECT_CODES: DefectCode[] = [
  { code: 'A', label: 'اتساخ', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'P', label: 'تطبق', color: 'bg-yellow-100 text-yellow-800' },
  { code: 'B', label: 'تنويرة', color: 'bg-orange-100 text-orange-800' },
  { code: 'Q', label: 'بيضاوي', color: 'bg-orange-100 text-orange-800' },
  { code: 'C', label: 'كسر', color: 'bg-red-100 text-red-800' },
  { code: 'R', label: 'عصب', color: 'bg-red-100 text-red-800' },
  { code: 'D', label: 'قوة تحمل', color: 'bg-purple-100 text-purple-800' },
  { code: 'S', label: 'رايش', color: 'bg-purple-100 text-purple-800' },
  { code: 'E', label: 'تفویت', color: 'bg-blue-100 text-blue-800' },
  { code: 'T', label: 'أوزان', color: 'bg-blue-100 text-blue-800' },
  { code: 'F', label: 'نقص', color: 'bg-indigo-100 text-indigo-800' },
  { code: 'U', label: 'ميل', color: 'bg-indigo-100 text-indigo-800' },
  { code: 'G', label: 'تصفط', color: 'bg-pink-100 text-pink-800' },
  { code: 'V', label: 'خط بيان', color: 'bg-pink-100 text-pink-800' },
  { code: 'H', label: 'مقاسات', color: 'bg-cyan-100 text-cyan-800' },
  { code: 'W', label: 'تعريقه', color: 'bg-cyan-100 text-cyan-800' },
  { code: 'I', label: 'ضعف', color: 'bg-teal-100 text-teal-800' },
  { code: 'X', label: 'خط لون', color: 'bg-teal-100 text-teal-800' },
  { code: 'J', label: 'خط قاطع', color: 'bg-lime-100 text-lime-800' },
  { code: 'Y', label: 'فتح بالقالب', color: 'bg-lime-100 text-lime-800' },
  { code: 'K', label: 'حرارات', color: 'bg-rose-100 text-rose-800' },
  { code: 'Z', label: 'اهتزاز', color: 'bg-rose-100 text-rose-800' },
  { code: 'L', label: 'جهاز اختبار', color: 'bg-emerald-100 text-emerald-800' },
  { code: 'AA', label: 'تقل بالغطاء', color: 'bg-emerald-100 text-emerald-800' },
  { code: 'M', label: 'ريحه', color: 'bg-gray-100 text-gray-800' },
  { code: 'AB', label: 'قلبه بالغطاء', color: 'bg-gray-100 text-gray-800' },
  { code: 'N', label: 'نمش', color: 'bg-amber-100 text-amber-800' },
  { code: 'AC', label: 'لحميه', color: 'bg-amber-100 text-amber-800' },
  { code: 'O', label: 'ثقوب', color: 'bg-red-50 text-red-900' },
];

localforage.config({ name: 'TQM_Pro_System', storeName: 'quality_data' });

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-royal-600">
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Loader2 className="w-12 h-12" /></motion.div>
    <p className="mt-4 font-bold text-gray-500 animate-pulse">جاري تحميل البيانات...</p>
  </div>
);

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [team, setTeam] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [reservedItems, setReservedItems] = useState<ReservedItem[]>([]);
  const [labEquipment, setLabEquipment] = useState<LabDevice[]>([]);
  const [checklistEntries, setChecklistEntries] = useState<ChecklistEntry[]>([]);
  const [checklistMachines, setChecklistMachines] = useState<string[]>(DEFAULT_MACHINES);
  const [checklistShiftNames, setChecklistShiftNames] = useState<Record<string, {A: string, B: string, C: string}>>({});
  const [topLoadEntries, setTopLoadEntries] = useState<TopLoadEntry[]>([]);
  const [topLoadStandards, setTopLoadStandards] = useState<TopLoadStandard[]>(DEFAULT_TOP_LOAD_STANDARDS);
  const [topLoadMachineProducts, setTopLoadMachineProducts] = useState<Record<string, Record<string, Record<string, string>>>>({});
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [defectCodes, setDefectCodes] = useState<DefectCode[]>(DEFAULT_DEFECT_CODES);
  const [companySettings, setCompanySettings] = useState<CompanySettings>(INITIAL_COMPANY_SETTINGS);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, t, d, k, c, r, l, cl, cm, csn, tl, tls, tmp, we, dc] = await Promise.all([
          localforage.getItem<Product[]>('tqm_products'), localforage.getItem<Employee[]>('tqm_team'), localforage.getItem<DocumentFile[]>('tqm_documents'),
          localforage.getItem<KPIData[]>('tqm_kpiData'), localforage.getItem<CompanySettings>('tqm_company'), localforage.getItem<ReservedItem[]>('tqm_reserved'),
          localforage.getItem<LabDevice[]>('tqm_lab_equipment'), localforage.getItem<ChecklistEntry[]>('tqm_checklist'), localforage.getItem<string[]>('tqm_checklist_machines'),
          localforage.getItem<Record<string, {A: string, B: string, C: string}>>('tqm_checklist_shift_names'), localforage.getItem<TopLoadEntry[]>('tqm_top_load'),
          localforage.getItem<TopLoadStandard[]>('tqm_top_load_standards'), localforage.getItem<Record<string, Record<string, Record<string, string>>>>('tqm_top_load_machine_products'),
          localforage.getItem<WeightEntry[]>('tqm_weight_entries'), localforage.getItem<DefectCode[]>('tqm_defect_codes')
        ]);
        if (p) setProducts(p); if (t) setTeam(t); if (d) setDocuments(d); if (k) setKpiData(k); if (c) setCompanySettings(c); if (r) setReservedItems(r);
        if (l) setLabEquipment(l); if (cl) setChecklistEntries(cl); if (cm) setChecklistMachines(cm); if (csn) setChecklistShiftNames(csn); if (tl) setTopLoadEntries(tl);
        if (tls) setTopLoadStandards(tls); if (tmp) setTopLoadMachineProducts(tmp); if (we) setWeightEntries(we); if (dc) setDefectCodes(dc);
      } catch (err) { console.error("Storage Error:", err); } finally { setIsInitializing(false); }
    };
    loadData();
  }, []);

  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_products', products); }, [products, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_team', team); }, [team, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_documents', documents); }, [documents, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_kpiData', kpiData); }, [kpiData, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_company', companySettings); }, [companySettings, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_reserved', reservedItems); }, [reservedItems, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_lab_equipment', labEquipment); }, [labEquipment, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_checklist', checklistEntries); }, [checklistEntries, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_checklist_machines', checklistMachines); }, [checklistMachines, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_checklist_shift_names', checklistShiftNames); }, [checklistShiftNames, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_top_load', topLoadEntries); }, [topLoadEntries, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_top_load_standards', topLoadStandards); }, [topLoadStandards, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_top_load_machine_products', topLoadMachineProducts); }, [topLoadMachineProducts, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_weight_entries', weightEntries); }, [weightEntries, isInitializing]);
  useEffect(() => { if (!isInitializing) localforage.setItem('tqm_defect_codes', defectCodes); }, [defectCodes, isInitializing]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestAuth = (action: () => void) => {
    if (userRole === 'admin' || userRole === 'demo') action();
    else { setPendingAction(() => action); setIsAuthModalOpen(true); }
  };

  // Check demo expiration periodically
  useEffect(() => {
    if (userRole === 'demo') {
      const checkExpiration = async () => {
        const demoStartDate = await localforage.getItem<number>('tqm_demo_start_date');
        if (demoStartDate) {
          const now = Date.now();
          const twoDaysInMs = 2 * 24 * 60 * 60 * 1000;
          if (now - demoStartDate > twoDaysInMs) {
            alert('انتهت الفترة التجريبية للمستخدم التجريبي (يومين). سيتم تسجيل الخروج.');
            setIsAuthenticated(false);
            setUserRole(null);
          }
        }
      };
      
      checkExpiration();
      const interval = setInterval(checkExpiration, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [userRole]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-royal-950 flex flex-col items-center justify-center text-white text-center" dir="rtl">
        <Loader2 className="w-12 h-12 animate-spin text-royal-400 mb-4" /><h1 className="text-xl font-bold">جاري تشغيل النظام...</h1>
      </div>
    );
  }

  const effectiveRole = userRole === 'demo' ? 'admin' : userRole;

  if (!isAuthenticated) return <Login onLogin={(role) => { setUserRole(role); setIsAuthenticated(true); }} />;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans" dir="rtl">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} companySettings={companySettings} role={userRole} />
      <main className="flex-1 p-4 lg:p-10 w-full">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 sticky top-0 bg-slate-50/80 backdrop-blur-md z-30 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-royal-50 text-gray-700 hover:text-royal-600 transition-colors shadow-sm"><Menu className="w-6 h-6" /></button>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 truncate">
                {currentView === 'dashboard' && 'الصفحة الرئيسية'} {currentView === 'products' && 'إدارة المنتجات'} {currentView === 'checklist' && 'قائمة الفحص (Checklist)'}
                {currentView === 'top-load' && 'فحص التوب لود (Top Load)'} {currentView === 'weight-check' && 'فحص الأوزان (Weight Check)'} {currentView === 'team' && 'فريق العمل'}
                {currentView === 'kpi' && 'تحليلات الأداء'} {currentView === 'lab-equipment' && 'أجهزة المعمل و SOP'} {currentView === 'documents' && 'مركز الوثائق'}
                {currentView === 'database' && 'قاعدة البيانات'} {currentView === 'settings' && 'إعدادات المنشأة'} {currentView === 'about' && 'حول النظام'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden md:flex flex-col items-end">
               <span className="text-xs font-bold text-gray-400">
                 حساب {userRole === 'admin' ? 'الإدارة' : userRole === 'demo' ? 'تجريبي (Demo)' : 'زائر'}
               </span>
               <span className="text-sm font-black text-gray-800">نشط الآن</span>
             </div>
             <button onClick={() => { setIsAuthenticated(false); setUserRole(null); }} className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-100" title="تسجيل الخروج"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <Suspense fallback={<LoadingFallback />}>
            {currentView === 'dashboard' && <Dashboard products={products} kpiData={kpiData} handleGenerateReport={() => window.print()} navigate={setCurrentView} reservedItems={reservedItems} setReservedItems={setReservedItems} role={effectiveRole} requestAuth={requestAuth} />}
            {currentView === 'products' && <Products products={products} setProducts={setProducts} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'checklist' && <Checklist entries={checklistEntries} setEntries={setChecklistEntries} machines={checklistMachines} setMachines={setChecklistMachines} standards={topLoadStandards} machineProducts={topLoadMachineProducts} setMachineProducts={setTopLoadMachineProducts} requestAuth={requestAuth} role={effectiveRole} shiftNames={checklistShiftNames} setShiftNames={setChecklistShiftNames} defectCodes={defectCodes} setDefectCodes={setDefectCodes} />}
            {currentView === 'top-load' && <TopLoad entries={topLoadEntries} setEntries={setTopLoadEntries} machines={checklistMachines} setMachines={setChecklistMachines} standards={topLoadStandards} setStandards={setTopLoadStandards} machineProducts={topLoadMachineProducts} setMachineProducts={setTopLoadMachineProducts} requestAuth={requestAuth} role={effectiveRole} shiftNames={checklistShiftNames} setShiftNames={setChecklistShiftNames} />}
            {currentView === 'weight-check' && <WeightCheck entries={weightEntries} setEntries={setWeightEntries} machines={checklistMachines} standards={topLoadStandards} setStandards={setTopLoadStandards} machineProducts={topLoadMachineProducts} setMachineProducts={setTopLoadMachineProducts} requestAuth={requestAuth} role={effectiveRole} shiftNames={checklistShiftNames} setShiftNames={setChecklistShiftNames} />}
            {currentView === 'team' && <Team team={team} setTeam={setTeam} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'kpi' && <KPIs data={kpiData} setData={setKpiData} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'lab-equipment' && <LabEquipment devices={labEquipment} setDevices={setLabEquipment} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'documents' && <Documents documents={documents} setDocuments={setDocuments} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'settings' && <CompanySettingsPanel settings={companySettings} onSave={setCompanySettings} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'database' && <Database data={{ products, team, documents, kpiData, companySettings, reservedItems, labEquipment, checklistEntries, checklistMachines, topLoadEntries, topLoadStandards, topLoadMachineProducts, weightEntries, defectCodes }} onImport={(d) => { setProducts(d.products || []); setTeam(d.team || []); setKpiData(d.kpiData || []); setCompanySettings(d.companySettings || INITIAL_COMPANY_SETTINGS); if(d.reservedItems) setReservedItems(d.reservedItems); if(d.labEquipment) setLabEquipment(d.labEquipment); if(d.checklistEntries) setChecklistEntries(d.checklistEntries); if(d.checklistMachines) setChecklistMachines(d.checklistMachines); if(d.checklistShiftNames) setChecklistShiftNames(d.checklistShiftNames); if(d.topLoadEntries) setTopLoadEntries(d.topLoadEntries); if(d.topLoadStandards) setTopLoadStandards(d.topLoadStandards); if(d.topLoadMachineProducts) setTopLoadMachineProducts(d.topLoadMachineProducts); if(d.weightEntries) setWeightEntries(d.weightEntries); if(d.defectCodes) setDefectCodes(d.defectCodes); }} onReset={() => { setProducts([]); setTeam([]); setKpiData([]); setReservedItems([]); setLabEquipment([]); setChecklistEntries([]); setChecklistMachines(DEFAULT_MACHINES); setChecklistShiftNames({}); setTopLoadEntries([]); setTopLoadStandards(DEFAULT_TOP_LOAD_STANDARDS); setTopLoadMachineProducts({}); setWeightEntries([]); setDefectCodes(DEFAULT_DEFECT_CODES); }} requestAuth={requestAuth} role={effectiveRole} />}
            {currentView === 'about' && <About />}
        </Suspense>
      </main>
      <PasswordModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onConfirm={() => { pendingAction?.(); setPendingAction(null); }} />
    </div>
  );
}

export default App;
