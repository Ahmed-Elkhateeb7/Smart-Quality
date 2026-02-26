import React from 'react';
import { Award, Code, Lightbulb, ShieldCheck } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <div className="text-center space-y-4">
        <div className="inline-block p-4 rounded-full bg-royal-50 mb-4 border border-royal-100">
            <ShieldCheck className="w-16 h-16 text-royal-800" />
        </div>
        <h1 className="text-4xl font-black text-gray-900">نظام إدارة الجودة الشاملة</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          نقلة نوعية في عالم إدارة الجودة الرقمية، مصمم لرفع الكفاءة وضمان المعايير العالمية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-royal-900/5 border border-royal-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-royal-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
                <Lightbulb className="w-10 h-10 text-amber-500 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">فكرة وتوليد داتا</h3>
                <p className="text-gray-600 text-lg">أحمد بيومي</p>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                    تم وضع الرؤية الاستراتيجية وهيكل البيانات الأساسي لمحاكاة بيئة عمل واقعية تلبي احتياجات إدارة الجودة الحديثة.
                </p>
            </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-royal-900/5 border border-royal-100 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-royal-50 rounded-bl-[100px] -z-0 transition-transform group-hover:scale-110" />
            <div className="relative z-10">
                <Code className="w-10 h-10 text-royal-600 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">برمجة وتطوير</h3>
                <p className="text-gray-600 text-lg">أحمد الخطيب</p>
                <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                    تنفيذ تقني متقن باستخدام أحدث تقنيات الويب (React, Tailwind) لضمان أداء عالي وتجربة مستخدم سلسة واحترافية.
                </p>
            </div>
        </div>
      </div>

      <div className="bg-royal-900 text-white rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
            <Award className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h2 className="text-3xl font-bold mb-4">الهدف من المشروع</h2>
            <p className="text-lg text-royal-200 max-w-3xl mx-auto leading-loose">
                تم إنشاء هذا البرنامج لتسهيل إدارة الجودة الشاملة ونقل إدارة الجودة للعالم الرقمي، مما يتيح تتبعاً دقيقاً للمنتجات، وأرشفة آمنة للوثائق، وتحليلاً فورياً لمؤشرات الأداء لاتخاذ قرارات مبنية على البيانات.
            </p>
        </div>
      </div>
    </div>
  );
};