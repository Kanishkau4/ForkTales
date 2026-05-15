import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    // Default to 'english'
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'english';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prev) => (prev === 'english' ? 'sinhala' : 'english'));
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
    return ctx;
};
