
import React, { useState, useMemo, useEffect } from 'react';
import { Step, FormData, Submission } from './types';
import * as Icons from './components/Icons';

const CONTACT_PHONE = "055-667-4329";
const ADMIN_CODE = "DA12";
const SUPPORT_EMAIL = "DUDITATPRO@GMAIL.COM";

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [formData, setFormData] = useState<FormData>({
    yeshivaName: '',
    managerName: '',
    phoneNumber: '',
    campaignDuration: '',
    campaignGoal: '',
    averageStudents: '',
    usesFieldDevices: '',
    deviceCount: '',
    deviceType: '',
    deviceProvider: '',
    clearingCompany: '',
    specialRemarks: ''
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminAuth, setAdminAuth] = useState({ username: '', code: '', isLoggedIn: false });
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tat_pro_submissions');
    if (saved) {
      try {
        setSubmissions(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load submissions", e);
      }
    }
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePrice = useMemo(() => {
    const goal = parseFloat(formData.campaignGoal) || 0;
    if (goal === 0) return { price: 0, formatted: "N/A" };
    
    if (goal <= 200000) return { price: 6500, formatted: "₪6,500" };
    if (goal <= 300000) return { price: 7500, formatted: "₪7,500" };
    if (goal <= 400000) return { price: 8500, formatted: "₪8,500" };
    if (goal <= 500000) return { price: 9900, formatted: "₪9,900" };
    return { price: -1, formatted: "צור קשר" };
  }, [formData.campaignGoal]);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, Step.PriceSummary));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, Step.Welcome));
  };

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case Step.InitialDetails:
        return !!formData.yeshivaName && !!formData.managerName && !!formData.phoneNumber;
      case Step.CampaignDetails:
        return !!formData.campaignDuration && !!formData.campaignGoal && !!formData.averageStudents;
      case Step.ClearingDetails:
        const basicClearing = !!formData.usesFieldDevices && !!formData.clearingCompany;
        if (formData.usesFieldDevices === 'yes') {
          return basicClearing && !!formData.deviceCount && !!formData.deviceType && !!formData.deviceProvider;
        }
        return basicClearing;
      default:
        return true;
    }
  };

  const handleRegister = () => {
    const newSubmission: Submission = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString('he-IL'),
      calculatedPrice: calculatePrice.price === -1 ? "התאמה אישית" : `₪${calculatePrice.price.toLocaleString()}`
    };
    
    const updated = [...submissions, newSubmission];
    setSubmissions(updated);
    localStorage.setItem('tat_pro_submissions', JSON.stringify(updated));
    setCurrentStep(Step.Success);
  };

  const handleAdminLogin = () => {
    if (adminAuth.code === ADMIN_CODE) {
      setAdminAuth(prev => ({ ...prev, isLoggedIn: true }));
      setCurrentStep(Step.Admin);
    } else {
      alert("קוד גישה שגוי.");
    }
  };

  const deleteSubmission = (id: string) => {
    if (confirm("האם למחוק?")) {
      const updated = submissions.filter(s => s.id !== id);
      setSubmissions(updated);
      localStorage.setItem('tat_pro_submissions', JSON.stringify(updated));
    }
  };

  const stepsCount = 6;
  const progressPercentage = ((currentStep + 1) / stepsCount) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case Step.Welcome:
        return (
          <div className="text-center space-y-6 py-8 transition-step">
            <div className="flex justify-center mb-4">
              <div className="bg-slate-900 text-white p-7 rounded-[2.5rem] shadow-2xl ring-8 ring-blue-500/10 hover:rotate-6 transition-all duration-700 transform hover:scale-105">
                <Icons.BuildingIcon />
              </div>
            </div>
            <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
              מערכת <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">TAT PRO</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
              הסטנדרט החדש בניהול קמפיינים, ישיבות וגיוס המונים. עוצמה טכנולוגית בכף ידך.
            </p>
            <div className="pt-8">
              <button
                onClick={handleNext}
                className="group relative bg-slate-900 text-white font-black py-6 px-20 rounded-[2.5rem] transition-all duration-500 transform hover:scale-105 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden text-2xl"
              >
                <span className="relative z-10">התחילו עכשיו</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
          </div>
        );

      case Step.InitialDetails:
        return (
          <div className="space-y-8 transition-step">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">פרטי המוסד</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup 
                label="שם הישיבה / המוסד" 
                icon={<Icons.BuildingIcon />}
                value={formData.yeshivaName}
                onChange={(v) => updateField('yeshivaName', v)}
                placeholder="הכנס שם מוסד"
                required
              />
              <InputGroup 
                label="שם מנהל קמפיין" 
                icon={<Icons.UserIcon />}
                value={formData.managerName}
                onChange={(v) => updateField('managerName', v)}
                placeholder="שם מלא"
                required
              />
              <InputGroup 
                label="מספר טלפון ליצירת קשר" 
                icon={<Icons.PhoneIcon />}
                type="tel"
                value={formData.phoneNumber}
                onChange={(v) => updateField('phoneNumber', v)}
                placeholder="05X-XXXXXXX"
                required
                className="md:col-span-2"
              />
            </div>
          </div>
        );

      case Step.CampaignDetails:
        return (
          <div className="space-y-8 transition-step">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">פרטי הקמפיין</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup 
                label="משך הקמפיין (בימים)" 
                icon={<Icons.CalendarIcon />}
                type="number"
                value={formData.campaignDuration}
                onChange={(v) => updateField('campaignDuration', v)}
                placeholder="לדוגמה: 3"
                required
              />
              <InputGroup 
                label="יעד הקמפיין (בשקלים)" 
                icon={<Icons.TargetIcon />}
                type="number"
                value={formData.campaignGoal}
                onChange={(v) => updateField('campaignGoal', v)}
                placeholder="לדוגמה: 300,000"
                required
              />
              <InputGroup 
                label="מספר מתרימים משוער" 
                icon={<Icons.UsersIcon />}
                type="number"
                value={formData.averageStudents}
                onChange={(v) => updateField('averageStudents', v)}
                placeholder="כמות בחורים/שגרירים"
                required
                className="md:col-span-2"
              />
            </div>
          </div>
        );

      case Step.ClearingDetails:
        return (
          <div className="space-y-8 transition-step">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">הגדרות סליקה</h2>
            <div className="space-y-4">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-widest mr-2">מכשירי סליקה ניידים בשטח?</label>
                <div className="flex gap-6">
                  <button 
                    onClick={() => updateField('usesFieldDevices', 'yes')}
                    className={`flex-1 py-5 rounded-[2rem] border-2 transition-all font-black text-xl shadow-sm ${formData.usesFieldDevices === 'yes' ? 'bg-slate-900 text-white border-slate-900 scale-[1.02] shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-300'}`}
                  >
                    כן
                  </button>
                  <button 
                    onClick={() => updateField('usesFieldDevices', 'no')}
                    className={`flex-1 py-5 rounded-[2rem] border-2 transition-all font-black text-xl shadow-sm ${formData.usesFieldDevices === 'no' ? 'bg-slate-900 text-white border-slate-900 scale-[1.02] shadow-xl' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-300'}`}
                  >
                    לא
                  </button>
                </div>
              </div>
              {formData.usesFieldDevices === 'yes' && (
                <div className="grid grid-cols-2 gap-6 p-8 bg-slate-50 rounded-[3rem] border-2 border-slate-100 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                  <InputGroup label="כמות מכשירים" type="number" value={formData.deviceCount} onChange={(v) => updateField('deviceCount', v)} compact />
                  <InputGroup label="דגם מכשיר" value={formData.deviceType} onChange={(v) => updateField('deviceType', v)} compact />
                  <InputGroup label="ספק שירות" value={formData.deviceProvider} onChange={(v) => updateField('deviceProvider', v)} compact className="col-span-2" />
                </div>
              )}
              <InputGroup 
                label="חברת סליקה (Gateway)" 
                icon={<Icons.ShekelIcon />}
                value={formData.clearingCompany}
                onChange={(v) => updateField('clearingCompany', v)}
                placeholder="לדוגמה: Upay, Nedarim, Grow"
                required
              />
          </div>
        );

      case Step.SpecialRemarks:
        return (
          <div className="space-y-6 transition-step">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">הערות ודגשים</h2>
            <p className="text-slate-400 text-sm">האם יש משהו מיוחד שחשוב שנדע לגבי המבנה הארגוני או דרישות טכניות?</p>
            <textarea
              rows={5}
              value={formData.specialRemarks}
              onChange={(e) => updateField('specialRemarks', e.target.value)}
              className="w-full px-8 py-8 rounded-[3rem] border-2 border-slate-50 focus:border-blue-500 focus:ring-[12px] focus:ring-blue-100/40 outline-none transition-all resize-none bg-white font-bold text-slate-900 text-xl shadow-sm placeholder:text-slate-200"
              placeholder="כתוב כאן..."
            />
          </div>
        );

      case Step.PriceSummary:
        const isContactNeeded = calculatePrice.price === -1;
        return (
          <div className="space-y-8 py-4 transition-step text-center">
            <h2 className="text-4xl font-black text-slate-900">סיכום והצעת מחיר</h2>
            <div className={`p-10 rounded-[4rem] border-2 relative overflow-hidden transition-all duration-1000 ${isContactNeeded ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100 bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]'}`}>
              {!isContactNeeded && <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 blur-[80px] -mr-24 -mt-24"></div>}
              {isContactNeeded ? (
                <div className="space-y-6">
                   <p className="text-3xl font-black text-amber-900 italic">VIP CAMPAIGN</p>
                   <p className="text-slate-700 font-bold text-xl leading-relaxed">היעד שציינת דורש התאמה אישית של מערך השרתים והליווי. אנא צור קשר עם מנהל לקוח.</p>
                   <div className="text-4xl font-black text-slate-900 bg-white py-6 rounded-3xl border-2 border-amber-100 ltr shadow-md tracking-widest">{CONTACT_PHONE}</div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-slate-300 text-[11px] font-black uppercase tracking-[0.5em]">השקעה נדרשת</div>
                  <div className="text-8xl font-black text-slate-900 flex items-center justify-center gap-2">
                    <span className="text-4xl opacity-10">₪</span>
                    {calculatePrice.price.toLocaleString()}
                  </div>
                  <div className="text-xl font-bold text-slate-400 opacity-60">+ מע״מ כדין</div>
                  <div className="pt-10 border-t border-slate-50 mt-8">
                    <p className="text-slate-800 font-black text-base">המחיר כולל פתיחת מערכת TAT PRO מלאה וליווי טכני.</p>
                  </div>
                </div>
              )}
            </div>
            <button 
              onClick={handleRegister}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-7 rounded-[2.5rem] shadow-2xl transition-all duration-500 transform hover:scale-[1.02] flex items-center justify-center gap-6 text-2xl group"
            >
              <span>{isContactNeeded ? "חזרו אליי עם הצעה" : "הרשמה וקבלת המערכת"}</span>
              <Icons.CheckIcon />
            </button>
          </div>
        );

      case Step.Success:
        return (
          <div className="text-center py-12 space-y-10 transition-step">
             <div className="flex justify-center">
                <div className="w-32 h-32 bg-green-500 text-white rounded-[3rem] flex items-center justify-center shadow-[0_30px_70px_-10px_rgba(34,197,94,0.5)]">
                  <Icons.CheckIcon />
                </div>
             </div>
             <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">הרישום בוצע!</h2>
                <p className="text-2xl text-slate-500 font-bold">הנתונים התקבלו בשרתי TAT PRO. ניצור קשר בהקדם.</p>
             </div>
             <button onClick={() => setCurrentStep(Step.Welcome)} className="bg-slate-100 text-slate-400 hover:text-slate-900 px-14 py-4 rounded-full font-black text-xs uppercase tracking-[0.6em] transition-all">חזרה להתחלה</button>
          </div>
        );

      case Step.Admin:
        if (!adminAuth.isLoggedIn) {
          return (
            <div className="space-y-10 transition-step py-12">
              <h2 className="text-4xl font-black text-slate-900 text-center tracking-tighter">ADMIN TERMINAL</h2>
              <div className="space-y-6 max-w-sm mx-auto">
                 <InputGroup label="מזהה משתמש" value={adminAuth.username} onChange={v => setAdminAuth(p => ({...p, username: v}))} placeholder="Username" />
                 <InputGroup label="קוד מאובטח" type="password" value={adminAuth.code} onChange={v => setAdminAuth(p => ({...p, code: v}))} placeholder="••••" />
                 <button onClick={handleAdminLogin} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl hover:shadow-2xl transition-all">כניסה למערכת</button>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-8 transition-step flex flex-col h-[550px]">
            <div className="flex justify-between items-center border-b pb-6">
              <div className="flex flex-col">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">לידים נכנסים</h2>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">{submissions.length} רשומות במערכת</span>
              </div>
              <button onClick={() => setAdminAuth(p => ({...p, isLoggedIn: false}))} className="bg-red-50 text-red-500 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">יציאה</button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-5 pr-3 custom-scrollbar">
              {submissions.length === 0 ? (
                <div className="text-center text-slate-100 py-32 font-black text-4xl uppercase tracking-[0.3em] opacity-50">NO DATA</div>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] relative group hover:shadow-2xl hover:border-blue-100 transition-all shadow-sm">
                    <button onClick={() => deleteSubmission(sub.id)} className="absolute top-6 left-6 text-slate-100 hover:text-red-500 transition-all transform hover:scale-125"><Icons.TrashIcon /></button>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="col-span-1"><div className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">מוסד</div><div className="font-black text-slate-900 text-lg">{sub.yeshivaName}</div></div>
                      <div className="col-span-1"><div className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">איש קשר</div><div className="font-bold text-slate-700">{sub.managerName}</div></div>
                      <div className="col-span-1"><div className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">טלפון</div><div className="text-blue-600 font-black ltr">{sub.phoneNumber}</div></div>
                      <div className="col-span-1 text-left"><div className="text-[10px] font-black text-slate-200 uppercase tracking-widest mb-1">מחיר</div><div className="font-black text-slate-900 text-xl">{sub.calculatedPrice}</div></div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setCurrentStep(Step.Welcome)} className="w-full bg-slate-50 text-slate-400 py-5 rounded-3xl font-black uppercase tracking-[0.4em] hover:bg-slate-100 transition-all">סגור מסוף</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 pointer-events-none grid-pattern z-[-5]"></div>
      
      {/* Dynamic Knowledge Hub Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 animate-in fade-in duration-500 backdrop-blur-xl bg-slate-950/50 overflow-hidden">
           <div className="w-full max-w-6xl h-full max-h-[92vh] glass-panel rounded-[4.5rem] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.7)] border-white/20">
              <div className="p-10 border-b border-white/10 flex justify-between items-center bg-slate-900 text-white relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="bg-blue-600 p-3.5 rounded-3xl shadow-2xl"><Icons.InfoIcon /></div>
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black tracking-tighter">מפרט מערכת TAT PRO</h2>
                    <span className="text-[11px] uppercase font-black tracking-[0.6em] text-blue-400/80 mt-1">Full Infrastructure & Logic Overview</span>
                  </div>
                </div>
                <button onClick={() => setIsInfoModalOpen(false)} className="relative z-10 hover:rotate-90 transition-all duration-500 p-3 bg-white/5 rounded-full border border-white/10"><Icons.XIcon /></button>
              </div>
              
              <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-50/40">
                <div className="max-w-5xl mx-auto p-14 space-y-20">
                  
                  {/* High Level Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <InfoCard icon={<Icons.BriefcaseIcon />} title="ניהול לוגיסטי" content="חלוקה למחזורים, סיירות ויחידות שטח. ניהול הרשאות מלא ומבוזר לכל דף." />
                    <InfoCard icon={<Icons.MapIcon />} title="שטח חכם" content="בונה מסלולים אוטומטי, ניווט GPS מובנה ודיווח נוכחות בזמן אמת מהשטח." />
                    <InfoCard icon={<Icons.GiftIcon />} title="מנוע פרסים" content="ניהול מלאי מתנות, הגרלות לייב שקופות ומנגנון 'רגעים גדולים' אוטומטי." />
                    <InfoCard icon={<Icons.TrophyIcon />} title="גיימיפיקציה" content="דירוג נציגים בזמן אמת, דרגות יהלום ומסכי רתימה אינטראקטיביים בישיבה." />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <section className="space-y-8">
                      <h3 className="text-4xl font-black text-slate-900 border-r-[14px] border-blue-600 pr-6 tracking-tighter">ארכיטקטורת ניהול</h3>
                      <div className="bg-white p-10 rounded-[3.5rem] border shadow-sm space-y-10 hover:shadow-2xl transition-all duration-700">
                         <FeatureRow icon={<Icons.UsersIcon />} title="מחזורים וסיירות" text="מבנה היררכי חכם: מחזור (שנה), קבוצה וסיירת. הגדרת יעדי ביניים לכל צוות שטח בנפרד." />
                         <FeatureRow icon={<Icons.PhoneIcon />} title="ניהול רשימות שיחה" text="פורטל נציג ייעודי עם Call Lists חכמים, חיוג בלחיצה, תסריטי שיחה ודיווח תוצאה מהיר." />
                      </div>
                    </section>

                    <section className="space-y-8">
                      <h3 className="text-4xl font-black text-slate-900 border-r-[14px] border-blue-600 pr-6 tracking-tighter">פיננסי & ריפורטינג</h3>
                      <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-3xl relative overflow-hidden h-full">
                         <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 blur-[90px] rounded-full"></div>
                         <div className="space-y-10 relative z-10">
                           <FeatureRow icon={<Icons.ShekelIcon />} title="עדכון מזומן חכם" text="דיווח מזומן וצ'קים מהשטח עם אישור מנהל קליק אחד. הכסף נספר מיידית ללא המתנה." light />
                           <FeatureRow icon={<Icons.CreditCardIcon />} title="API סליקה מלא" text="חיבור שקוף לכל חברות הסליקה המובילות. שיוך אוטומטי של תרומות לנציגים ולמתרימים." light />
                         </div>
                      </div>
                    </section>
                  </div>

                  <div className="bg-white/60 p-12 rounded-[4rem] border border-blue-100/50 space-y-10 shadow-sm backdrop-blur-sm">
                     <div className="text-center space-y-3">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">מסכי רתימה (BIG SCREEN)</h3>
                        <p className="text-slate-500 font-bold text-lg">חווית הגיוס באולם המרכזי ובישיבה</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureBox title="אפקטים בלייב" text="כל תרומה גדולה מקבלת סאונד, זיקוקים ותצוגה מרהיבה על המסך הגדול." color="bg-blue-50" />
                        <FeatureBox title="טבלת שגרירים" text="תחרותיות חיובית עם טבלת מובילים דינמית המתעדכנת בכל שניה." color="bg-indigo-50" />
                        <FeatureBox title="הגרלות אוטומטיות" text="מנגנון הגרלה מובנה שמופעל ברגע שמגיעים ליעד ביניים." color="bg-purple-50" />
                     </div>
                  </div>

                  <div className="pt-10 border-t border-slate-200 text-center pb-16">
                    <button onClick={() => setIsInfoModalOpen(false)} className="bg-blue-600 text-white font-black py-6 px-28 rounded-full shadow-[0_30px_70px_-10px_rgba(37,99,235,0.6)] hover:scale-110 active:scale-95 transition-all text-2xl">סגור והמשך לרישום</button>
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Control Actions - Floating at top corners */}
      <div className="fixed right-8 top-8 z-50">
        <button 
          onClick={() => setIsInfoModalOpen(true)}
          className="glass-panel p-5 rounded-3xl text-blue-600 hover:scale-110 transition-all duration-500 flex items-center gap-4 group shadow-2xl bg-white/95"
        >
          <Icons.InfoIcon />
          <span className="font-black text-sm uppercase tracking-[0.2em] ml-1 hidden lg:inline">פרטי המערכת</span>
        </button>
      </div>
      
      <div className="fixed left-8 top-8 z-50">
        <button 
          onClick={() => setCurrentStep(Step.Admin)}
          className="glass-panel p-3.5 rounded-2xl text-slate-400 hover:text-slate-900 hover:scale-110 transition-all duration-500 shadow-xl bg-white/80 opacity-60 hover:opacity-100"
          title="Admin Access"
        >
          <Icons.LockIcon />
        </button>
      </div>

      {/* Contact Hub */}
      <div className="fixed left-8 bottom-8 flex flex-col items-start gap-4 z-[60]">
        {isContactMenuOpen && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-3 duration-300 mb-2">
            <ContactLink href={`https://wa.me/${CONTACT_PHONE.replace(/-/g, '')}`} icon={<Icons.WhatsAppIcon />} label="WhatsApp" color="text-green-500" />
            <ContactLink href={`tel:${CONTACT_PHONE}`} icon={<Icons.PhoneIcon />} label="Call Center" color="text-blue-500" />
            <ContactLink href={`mailto:${SUPPORT_EMAIL}`} icon={<Icons.MailIcon />} label="Tech Support" color="text-slate-500" />
          </div>
        )}
        <button 
          onClick={() => setIsContactMenuOpen(!isContactMenuOpen)}
          className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-[0_30px_60px_-10px_rgba(0,0,0,0.5)] transition-all duration-500 transform hover:scale-110 active:scale-95 ring-8 ring-white/5 ${isContactMenuOpen ? 'bg-red-500 text-white rotate-90' : 'bg-slate-900 text-white'}`}
        >
          {isContactMenuOpen ? <Icons.XIcon /> : <Icons.PhoneIcon />}
        </button>
      </div>

      {/* Main Registration Terminal */}
      <div className="w-full max-w-4xl glass-panel rounded-[5rem] overflow-hidden flex flex-col min-h-[680px] relative border-white/60 static-card">
        
        {/* Platinum Header */}
        <div className="bg-slate-900 px-14 pt-14 pb-14 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 shimmer opacity-[0.03]"></div>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-blue-600 blur-[150px] opacity-20"></div>
          </div>
          
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div className="flex items-center gap-6 cursor-pointer group" onClick={() => setCurrentStep(Step.Welcome)}>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-900 p-4 rounded-3xl shadow-2xl group-hover:rotate-[360deg] transition-all duration-1000 ring-4 ring-white/5">
                <Icons.TargetIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-4xl font-black text-white tracking-tighter uppercase">TAT <span className="text-blue-400">PRO</span></span>
                <span className="text-[10px] text-white/30 font-black uppercase tracking-[0.7em] mt-1">Institutional Platform</span>
              </div>
            </div>
            {currentStep > Step.Welcome && currentStep < Step.Success && (
              <div className="text-white/90 text-[11px] font-black bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-full border border-white/5 uppercase tracking-[0.3em] shadow-2xl">
                STEP {currentStep} OF {stepsCount - 1}
              </div>
            )}
          </div>

          {currentStep > Step.Welcome && currentStep < Step.Success && (
            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10 shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-blue-600 transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(59,130,246,0.6)]" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          )}
        </div>

        {/* Dynamic Form Area */}
        <div className="flex-grow px-14 py-12 overflow-y-auto custom-scrollbar bg-white/30">
          {renderStep()}
        </div>

        {/* Global Nav Footer */}
        {currentStep !== Step.Welcome && currentStep !== Step.Success && currentStep !== Step.Admin && (
          <div className="px-14 pb-12 flex gap-6 shrink-0 bg-transparent">
            <button onClick={handleBack} className="flex-1 py-5 rounded-[2.5rem] font-black border-2 border-slate-100 text-slate-300 hover:text-slate-900 hover:border-slate-300 transition-all text-sm backdrop-blur-sm bg-white/50">חזרה</button>
            {currentStep < Step.PriceSummary && (
              <button 
                onClick={handleNext} 
                disabled={!validateStep(currentStep)}
                className={`flex-[3] py-5 rounded-[2.5rem] font-black transition-all flex items-center justify-center gap-4 text-base shadow-[0_20px_40px_-5px_rgba(37,99,235,0.4)] ${validateStep(currentStep) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-200 cursor-not-allowed'}`}
              >
                <span>{currentStep === Step.SpecialRemarks ? 'חשב הצעת מחיר' : 'המשך לשלב הבא'}</span>
                <Icons.CheckIcon />
              </button>
            )}
          </div>
        )}

        <div className="pb-10 text-center">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.8em] opacity-30">© 2025 TZARDI PREMIUM • TAT PRO INFRASTRUCTURE</p>
        </div>
      </div>
    </div>
  );
};

// Component Helpers
const InfoCard = ({ icon, title, content }: { icon: any, title: string, content: string }) => (
  <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-50 shadow-sm space-y-5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm">
      {icon}
    </div>
    <div className="space-y-3">
      <h4 className="font-black text-slate-900 text-xl leading-tight">{title}</h4>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">{content}</p>
    </div>
  </div>
);

const FeatureRow = ({ icon, title, text, light = false }: { icon: any, title: string, text: string, light?: boolean }) => (
  <div className="flex items-start gap-6 group">
    <div className={`${light ? 'bg-white/10 text-blue-400 border border-white/10' : 'bg-blue-50 text-blue-600 border border-blue-100'} p-4 rounded-3xl shrink-0 group-hover:scale-110 transition-all duration-500`}>
      {icon}
    </div>
    <div className="space-y-2">
      <h4 className={`font-black text-xl ${light ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
      <p className={`text-base leading-relaxed ${light ? 'text-slate-400' : 'text-slate-500'} font-medium`}>{text}</p>
    </div>
  </div>
);

const FeatureBox = ({ title, text, color }: { title: string, text: string, color: string }) => (
  <div className={`${color} p-8 rounded-[3rem] space-y-3 text-center border-2 border-white/60 shadow-sm hover:scale-105 transition-all duration-500`}>
    <h4 className="font-black text-slate-900 text-lg">{title}</h4>
    <p className="text-xs text-slate-500 font-bold leading-relaxed">{text}</p>
  </div>
);

const ContactLink = ({ href, icon, label, color }: { href: string, icon: any, label: string, color: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 bg-white px-7 py-5 rounded-[2.5rem] shadow-2xl border-2 border-slate-50 hover:scale-105 transition-all group backdrop-blur-3xl">
    <span className="text-slate-900 font-black text-sm group-hover:text-blue-600 transition-colors">{label}</span>
    <div className={`${color} group-hover:scale-125 transition-all duration-500`}>{icon}</div>
  </a>
);

interface InputGroupProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
  className?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ 
  label, icon, value, onChange, type = "text", placeholder, required, compact, className = "" 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const isFilled = value.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between px-3">
        <label className={`block text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 ${isFocused ? 'text-blue-600 opacity-100' : 'text-slate-900 opacity-30'}`}>
          {label}
          {required && <span className="text-blue-500 font-bold mr-1">*</span>}
        </label>
        {isFilled && !isFocused && (
          <div className="text-green-500 animate-in fade-in scale-in duration-300">
             <Icons.CheckIcon />
          </div>
        )}
      </div>
      <div className={`relative group transition-all duration-500`}>
        {icon && (
          <div className={`absolute inset-y-0 right-0 pr-8 flex items-center pointer-events-none transition-all duration-700 ${isFocused ? 'text-blue-600 translate-x-1' : isFilled ? 'text-slate-400' : 'text-slate-200'}`}>
            {React.cloneElement(icon as React.ReactElement, { width: 22, height: 22 })}
          </div>
        )}
        <input
          type={type}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full premium-input ${icon ? 'pr-20' : 'pr-10'} pl-10 ${compact ? 'py-5' : 'py-7'} rounded-[3rem] outline-none font-bold text-slate-900 text-lg placeholder:text-slate-200 placeholder:font-medium`}
        />
        {isFocused && (
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-[3.2rem] blur-2xl -z-10 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default App;
