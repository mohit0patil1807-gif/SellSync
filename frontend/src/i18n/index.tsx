import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

export const translations = {
  en: {
    // Navigation
    today: 'Today',
    orders: 'Orders',
    stock: 'Stock',
    payments: 'Payments',
    shipping: 'Shipping',
    more: 'More',

    // Sub-navigation & Pages
    overview: 'Overview',
    channels: 'Channels & Integrations',
    alerts: 'Operational Alerts',
    automations: 'Automations',
    analytics: 'Analytics & Reports',
    validation: 'Customer Discovery Lab',
    business: 'Business Model Canvas',
    presentation: 'Academic Presentation',
    settings: 'Settings & Data',

    // Key Operational Indian Commerce Terms
    item_code: 'Item code (SKU)',
    payment_check: 'Payment check',
    ready_to_pack: 'Ready to pack',
    ready_to_ship: 'Ready to ship',
    payments_to_check: 'Payments to check',
    orders_to_pack: 'Orders to pack',
    low_stock: 'Low stock items',
    shipped_today: 'Shipped today',
    delivered_today: 'Delivered today',

    // Actions
    new_order: 'New Order',
    paste_chat: 'Paste WhatsApp / IG Chat',
    check_payments: 'Check Payments',
    start_packing: 'Start Packing',
    ship_orders: 'Ship Orders',
    update_stock: 'Update Stock',
    day_end_close: 'Day-End Close Summary',
    download_orders_csv: 'Download Orders CSV',
    copy_courier_address: 'Copy for Courier',
    send_whatsapp_reminder: 'Send WhatsApp Reminder',
    upi_qr_generator: 'UPI QR & Deep Link',

    // Disclaimers & Badges
    demo_connections: 'Demo connections (Sample Data)',
    local_feature: 'Local Feature',
    simulated_disclaimer: 'Simulated preview. Zero real API keys or bank credentials required.',
    manual_assistant_disclaimer: 'Manual verification assistant. Verify in your UPI/bank app before packing.',
    hypotheses_badge: 'Hypotheses — to be tested',

    // Persona Switcher
    try_as: 'Try as:',
    boutique_label: 'Aura Boutique',
    baker_label: 'Sweet Flour Bakery',
    reseller_label: 'SmartBazaar Reseller',
    handmade_label: 'Mitti Handmade',

    // Search & Filter
    quick_search: 'Quick Search...',
    all_channels: 'All Channels',
    reset_demo: 'Reset Demo Data',
  },
  hi: {
    // Navigation
    today: 'आज',
    orders: 'ऑर्डर',
    stock: 'स्टॉक',
    payments: 'पेमेंट',
    shipping: 'डिलीवरी',
    more: 'और',

    // Sub-navigation & Pages
    overview: 'डैशबोर्ड',
    channels: 'बिक्री चैनल (मार्केटप्लेस)',
    alerts: 'अलर्ट और सूचनाएं',
    automations: 'ऑटोमेशन नियम',
    analytics: 'बिक्री रिपोर्ट',
    validation: 'ग्राहक बातचीत (रिसर्च)',
    business: 'बिजनेस मॉडल',
    presentation: 'प्रेजेंटेशन सारांश',
    settings: 'सेटिंग्स और डेटा',

    // Key Operational Indian Commerce Terms
    item_code: 'आइटम कोड (SKU)',
    payment_check: 'पेमेंट चेक',
    ready_to_pack: 'पैक करने के लिए तैयार',
    ready_to_ship: 'भेजने के लिए तैयार',
    payments_to_check: 'चेक करने वाले पेमेंट',
    orders_to_pack: 'पैक करने वाले ऑर्डर',
    low_stock: 'कम स्टॉक वाले आइटम',
    shipped_today: 'आज भेजे गए',
    delivered_today: 'आज डिलीवर हुए',

    // Actions
    new_order: 'नया ऑर्डर',
    paste_chat: 'व्हाट्सएप / चैट पेस्ट करें',
    check_payments: 'पेमेंट चेक करें',
    start_packing: 'पैकिंग शुरू करें',
    ship_orders: 'पार्सल भेजें',
    update_stock: 'स्टॉक अपडेट करें',
    day_end_close: 'दिन का क्लोज़िंग हिसाब (Day-End)',
    download_orders_csv: 'ऑर्डर लिस्ट डाउनलोड करें',
    copy_courier_address: 'कूरियर पता कॉपी करें',
    send_whatsapp_reminder: 'व्हाट्सएप पर याद दिलाएं',
    upi_qr_generator: 'UPI QR और पेमेंट लिंक',

    // Disclaimers & Badges
    demo_connections: 'डेमो कनेक्शन (सैंपल डेटा)',
    local_feature: 'लोकल फीचर',
    simulated_disclaimer: 'सिम्युलेटेड डेमो। किसी असली पासवर्ड या बैंक खाते की जरूरत नहीं है।',
    manual_assistant_disclaimer: 'सहायक टूल। सामान पैक करने से पहले अपने बैंक/UPI ऐप में जांच लें।',
    hypotheses_badge: 'अनुमान — परीक्षण के लिए',

    // Persona Switcher
    try_as: 'प्रोफ़ाइल बदलें:',
    boutique_label: 'आभा बुटीक (कपड़े)',
    baker_label: 'स्वीट फ्लॉर (बेकरी)',
    reseller_label: 'स्मार्ट बाज़ार (रीसेलर)',
    handmade_label: 'मिट्टी (हस्तकला)',

    // Search & Filter
    quick_search: 'खोजें (Search)...',
    all_channels: 'सभी चैनल',
    reset_demo: 'डेटा रीसेट करें',
  }
};

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sellsync_language');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sellsync_language', lang);
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    return (dict as any)[key] || (translations.en as any)[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
