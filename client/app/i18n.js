import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "shop": "Shop",
        "brands": "Brands"
      },
      "cart": {
        "title": "Your Cart",
        "empty": "Your Cart is Empty",
        "checkout": "Proceed to Checkout"
      }
    }
  },
  es: {
    translation: {
      "nav": {
        "shop": "Tienda",
        "brands": "Marcas"
      },
      "cart": {
        "title": "Tu Carrito",
        "empty": "Tu carrito está vacío",
        "checkout": "Proceder al pago"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
