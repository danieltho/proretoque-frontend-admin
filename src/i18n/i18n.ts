import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'

// Lee el idioma del usuario persistido en localStorage antes de que React monte
function getInitialLang(): string {
  try {
    const raw = localStorage.getItem('auth-storage')
    const lang = raw ? JSON.parse(raw)?.state?.user?.lang : null
    return lang ?? 'es'
  } catch {
    return 'es'
  }
}

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: getInitialLang(),
    fallbackLng: 'es',
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },
  })

export default i18n
