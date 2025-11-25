import { ReactNode, useState, useEffect } from "react";
import { LocaleContext, type LocaleContextValue } from "./context";
import { useTranslation } from "react-i18next";

// ----------------------------------------------------------------------

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [locale, setLocaleState] = useState(i18n.language || "es");

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    i18n.changeLanguage(newLocale);
  };

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = locale;
  }, [locale]);

  const contextValue: LocaleContextValue = {
    locale,
    setLocale,
    direction: "ltr", // Cambiar a "rtl" si soportas idiomas de derecha a izquierda
  };

  return <LocaleContext value={contextValue}>{children}</LocaleContext>;
}
