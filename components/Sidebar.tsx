
import React from 'react';
import { LayoutDashboard, Package, Users, Activity, FileText, Info, X, ShieldCheck, Database as DbIcon, Settings, Microscope, CheckSquare, Scale, Weight } from 'lucide-react';
import { PageView, CompanySettings, UserRole } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  companySettings?: CompanySettings;
  role: UserRole | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, toggleSidebar, companySettings, role }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الصفحة الرئيسية', icon: LayoutDashboard },
    { id: 'checklist', label: 'قائمة الفحص', icon: CheckSquare },
    { id: 'top-load', label: 'فحص التوب لود', icon: Scale },
    { id: 'weight-check', label: 'فحص الأوزان', icon: Weight }, // Added Weight Check
    { id: 'products', label: 'إدارة المنتجات', icon: Package },
    { id: 'team', label: 'فريق العمل', icon: Users },
    { id: 'kpi', label: 'تحليلات الأداء', icon: Activity },
    { id: 'lab-equipment', label: 'أجهزة المعمل', icon: Microscope },
    { id: 'documents', label: 'مركز الوثائق', icon: FileText },
    { id: 'database', label: 'قاعدة البيانات', icon: DbIcon },
    { id: 'settings', label: 'إعدادات المنشأة', icon: Settings },
    { id: 'about', label: 'حول النظام', icon: Info },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-screen w-[280px] bg-royal-950 text-white flex flex-col shadow-2xl z-50 print:hidden"
      >
        <div className="p-6 flex items-center justify-between border-b border-royal-800/50">
          <div className="flex items-center gap-3 overflow-hidden text-right">
              <div className="bg-white p-1.5 rounded-lg shrink-0 w-10 h-10 flex items-center justify-center overflow-hidden">
                  {companySettings?.logo ? (
                     <img src={companySettings.logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                     <ShieldCheck className="w-6 h-6 text-royal-800" />
                  )}
              </div>
              <div className="min-w-0">
                  <h1 className="font-bold text-lg leading-tight truncate">
                      {companySettings?.name || 'إدارة الجودة'}
                  </h1>
                  <p className="text-xs text-royal-200 truncate">
                      {companySettings?.slogan || 'نظام TQM المتقدم'}
                  </p>
              </div>
          </div>
          <button onClick={toggleSidebar} className="p-1 hover:bg-royal-800 rounded-lg text-royal-200 hover:text-white shrink-0">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                  <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id as PageView);
                        toggleSidebar();
                      }}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 relative group flex-row-reverse
                          ${isActive 
                              ? 'bg-royal-700 text-white shadow-lg shadow-royal-900/50' 
                              : 'text-royal-100 hover:bg-royal-900 hover:text-white'
                          }`}
                  >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-royal-300 group-hover:text-white'}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />}
                  </button>
              )
          })}
        </nav>

        <div className="p-4 border-t border-royal-800/50">
          <div className="flex items-center gap-3 bg-royal-900/50 p-3 rounded-xl flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-royal-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {role === 'admin' ? 'A' : role === 'demo' ? 'D' : 'V'}
              </div>
              <div className="overflow-hidden flex-1 text-right">
                  <p className="font-bold text-sm truncate">{role === 'admin' ? 'المدير العام' : role === 'demo' ? 'مستخدم تجريبي' : 'مستخدم زائر'}</p>
                  <p className="text-xs text-royal-300 truncate">متصل الآن</p>
              </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
