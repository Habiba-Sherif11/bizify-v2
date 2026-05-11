import type { Translations } from "./en";

const ar: Translations = {
  dashboard: {
    welcome: "مرحباً بعودتك",
    subtitle: "ماذا تريد أن تعمل اليوم؟",
  },
  features: {
    ideas: {
      title: "أفكاري",
      description:
        "جميع أفكار أعمالك المحفوظة وخرائط الطريق والمهام وتقارير التحقق في مكان واحد.",
    },
    aiChat: {
      title: "محادثة الذكاء الاصطناعي",
      description:
        "ابدأ محادثة مع الذكاء الاصطناعي لتوليد أفكار أعمال جديدة وتحسينها والتحقق منها.",
    },
    team: {
      title: "الفريق",
      description:
        "إدارة فريقك: دعوة الأعضاء وتعيين الأدوار وعرض نشاط الفريق.",
    },
    marketplace: {
      title: "السوق",
      description:
        "تصفح والتواصل مع الشركاء الخارجيين: الموردين والمرشدين والمصنّعين.",
    },
  },
  activity: {
    title: "النشاط الأخير",
    viewAll: "عرض الكل",
    headers: {
      activity: "النشاط",
      module: "الوحدة",
    },
    modules: {
      ideas: "الأفكار",
      aiChat: "محادثة الذكاء",
      team: "الفريق",
    },
  },
  aiSearch: {
    placeholder:
      "اسأل Bizify أي شيء — تحقق من فكرة، ابحث عن مورد، اكتب عرضاً…",
    askAI: "اسأل الذكاء الاصطناعي",
    tryLabel: "جرب:",
    suggestions: [
      "تحليل السوق المستهدف",
      "صياغة مخطط عرض تقديمي",
      "اقتراح تجارب التحقق",
    ],
  },
  nav: {
    logout: "تسجيل الخروج",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    lightMode: "الوضع الفاتح",
    darkMode: "الوضع الداكن",
    search: "بحث",
    notifications: "الإشعارات",
    logoutConfirmTitle: "تسجيل الخروج؟",
    logoutConfirmMessage: "هل أنت متأكد أنك تريد تسجيل الخروج من حسابك؟",
    logoutConfirmButton: "تسجيل الخروج",
    cancel: "إلغاء",
  },
};

export default ar;
