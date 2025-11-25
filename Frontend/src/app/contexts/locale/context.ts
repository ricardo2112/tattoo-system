import { createSafeContext } from "@/utils/createSafeContext";
import { locales } from "@/languages/langs";

export type LocaleKey = keyof typeof locales;

export interface LocaleContextValue {
  locale: LocaleKey;
  setLocale: (locale: LocaleKey) => void;
  direction: "ltr" | "rtl";
}

export const [LocaleContext, useLocaleContext] =
  createSafeContext<LocaleContextValue>(
    "useLocaleContext must be used within LocaleProvider"
  );
