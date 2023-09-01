import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import {initReactI18next} from "react-i18next";
import {getCookie, setCookie, setCookieParamas} from "./Login/Api/login-logout";

export const lngs = {
    en: {nativeName: "English"},
    uk: {nativeName: "Українська"}
}

export const changeLanguage = (language: string, i18next:any) => {
	i18next.changeLanguage(language);
	const cookie: setCookieParamas = {
		name: "lang",
		value: language,
		expires_second: 365 * 24 * 60 * 60
	};
	setCookie(cookie);
}
export const getLanguageFromCookie = (i18next:any) => {
	let lang = getCookie("lang");
	if(lang === null){
		lang = "en";
	}
	i18next.changeLanguage(lang);
}


export default i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        debug: true,
        detection: {
            order: ['queryString', 'cookie'],
            cache: ['cookie']
        },
        interpolation:{
            escapeValue: false
        }
    })