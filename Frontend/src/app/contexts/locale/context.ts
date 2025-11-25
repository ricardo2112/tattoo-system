import { createSafeContext } from "@/utils/createSafeContext";

export interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  direction: "ltr" | "rtl";
}

export const [LocaleContext, useLocaleContext] =
  createSafeContext<LocaleContextValue>(
    "useLocaleContext must be used within LocaleProvider"
  );
