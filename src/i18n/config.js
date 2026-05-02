import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationVI from "./locales/vi.json";
import translationEN from "./locales/en.json";
import translationJP from "./locales/jp.json";

const resources = {
  vi: { translation: translationVI },
  en: { translation: translationEN },
  jp: { translation: translationJP },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    supportedLngs: ["vi", "en", "jp"],
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
