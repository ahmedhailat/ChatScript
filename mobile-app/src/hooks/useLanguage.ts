import { useState } from 'react';
import { translations } from '../localization/translations';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('ar');
  const [isRTL, setIsRTL] = useState<boolean>(true);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsRTL(newLanguage === 'ar');
  };

  const t = (key: keyof typeof translations.ar): string => {
    return translations[language][key] || translations.ar[key] || key;
  };

  const getDirection = (): Direction => {
    return isRTL ? 'rtl' : 'ltr';
  };

  const getTextAlign = () => {
    return isRTL ? 'right' : 'left';
  };

  const getFlexDirection = () => {
    return isRTL ? 'row-reverse' : 'row';
  };

  return {
    language,
    isRTL,
    changeLanguage,
    t,
    getDirection,
    getTextAlign,
    getFlexDirection,
  };
};