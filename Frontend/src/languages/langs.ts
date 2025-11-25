export const locales = {
  en: {
    label: "English",
    dayjs: () => import("dayjs/locale/en"),
    flatpickr: null,
    i18n: () => import("./locales/en.json"),
    flag: "united-kingdom",
  },
  es: {
    label: "Spanish",
    dayjs: () => import("dayjs/locale/es"),
    flatpickr: () =>
      import("flatpickr/dist/l10n/es").then((module) => module.Spanish),
    i18n: () => import("./locales/es.json"),
    flag: "spain",
  }
};

export const supportedLanguages = Object.keys(locales);

export type LocaleCode = keyof typeof locales;

export type Dir = "ltr" | "rtl";
