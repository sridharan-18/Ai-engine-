'use client';

import { useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [t, setT] = useState(translations.en);

  useEffect(() => {
    // Load language from localStorage or config
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage);
      setT(translations[savedLanguage]);
    }
  }, []);

  const changeLanguage = (newLanguage: Language) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      setT(translations[newLanguage]);
      localStorage.setItem('language', newLanguage);
    }
  };

  return { t, language, changeLanguage };
};
