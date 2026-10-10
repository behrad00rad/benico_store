import {createContext, useContext, useEffect, useState} from 'react';
import Cookies from 'universal-cookie';

const LanguageContext = createContext({lang: 'fa', t: (fa) => fa, toggleLanguage: () => {}});
export function LanguageProvider({children}) {
  const [lang, setLang] = useState(() => new Cookies().get('Lang') === 'en' ? 'en' : 'fa');
  const toggleLanguage = () => {
    const next = lang === 'fa' ? 'en' : 'fa';
    new Cookies().set('Lang', next, {path: '/', maxAge: 31536000, sameSite: 'lax'});
    setLang(next);
  };
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    new Cookies().set('Lang', lang, {path: '/', maxAge: 31536000, sameSite: 'lax'});
  }, [lang]);
  return <LanguageContext.Provider value={{lang, toggleLanguage, t: (fa, en) => lang === 'fa' ? fa : en}}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
