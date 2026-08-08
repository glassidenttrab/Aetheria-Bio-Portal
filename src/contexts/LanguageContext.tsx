import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageOption, translations } from '../i18n/translations';

const STORAGE_KEY = 'aetheria_portal_lang';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: LanguageOption[];
  currentLanguageObj: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
      if (savedLang && SUPPORTED_LANGUAGES.some(l => l.code === savedLang)) {
        return savedLang;
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for language preference', e);
    }

    // 1차: 브라우저 navigator.language 자동 감지
    const browserLang = (navigator.language || (navigator as any).userLanguage || '').toLowerCase();
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('it')) return 'it';

    return 'ko'; // 기본값: 한국어
  });

  // 2차: IP GeoLocation 접속 국가 자동 감지 (Cloudflare / ipapi GeoIP Engine)
  useEffect(() => {
    const detectIpCountry = async () => {
      try {
        const savedLang = localStorage.getItem(STORAGE_KEY);
        if (savedLang) return; // 유저가 수동 선택한 이력이 있으면 스킵

        const res = await fetch('https://ipapi.co/json/', { cache: 'force-cache' });
        if (!res.ok) return;
        const data = await res.json();
        const country = (data.country_code || '').toUpperCase();

        const countryToLangMap: Record<string, Language> = {
          KR: 'ko',
          JP: 'ja',
          CN: 'zh', TW: 'zh', HK: 'zh',
          ES: 'es', MX: 'es', AR: 'es', CO: 'es',
          DE: 'de', AT: 'de',
          FR: 'fr',
          IT: 'it',
          US: 'en', GB: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', SG: 'en'
        };

        const targetLang = countryToLangMap[country];
        if (targetLang && SUPPORTED_LANGUAGES.some(l => l.code === targetLang)) {
          console.log(`[GeoIP Auto-Detect] Visitor IP Country: ${country} -> Auto Selected Language: ${targetLang}`);
          setLanguageState(targetLang);
        }
      } catch (err) {
        console.log('[GeoIP Notice] Using active session fallback language', err);
      }
    };
    detectIpCountry();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Failed to save language preference to LocalStorage', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations['ko'];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // 기본 한국어 백업
    if (translations['ko'] && translations['ko'][key]) {
      return translations['ko'][key];
    }
    return fallback || key;
  };

  // 동적 SEO 및 GEO 메타 태그 최적화 (Dynamic Multilingual SEO & GEO Tag Updater)
  useEffect(() => {
    // 1. HTML lang 속성 업데이트
    document.documentElement.lang = language;

    // 2. 언어별 SEO & GEO 메타 메타 데이터 구성
    const seoData: Record<Language, { title: string; desc: string; keywords: string; ogLocale: string }> = {
      ko: {
        title: 'Aetheria Bio Portal | 전신 10대 의학과 38개 사이언스 스킬 연동 포털',
        desc: 'Aetheria Bio는 전신 10대 의학 분야의 단백질 3D 구조(AlphaFold), 질환 연관도(OpenTargets), 분자 결합력(ChEMBL), FTO 특허 판단을 PubMed(3,500만+), OpenAlex(2억 5천만+) 등 라이브 생의학 빅데이터 API 라이브 엔진으로 통합 제공합니다.',
        keywords: 'Aetheria Bio, 신약개발, AI 타깃 스캐너, AlphaFold, OpenTargets, ChEMBL, PubMed, 10대 의학과, 바이오 테크',
        ogLocale: 'ko_KR'
      },
      en: {
        title: 'Aetheria Bio Portal | 10 Medical Specialties & 38 Live Science Skills AI Engine',
        desc: 'Aetheria Bio integrates PubMed(35M+), OpenAlex(250M+), AlphaFold DB(200M+) & ClinicalTrials(450K+) live API engines for 10 medical specialties target scanning.',
        keywords: 'Aetheria Bio, Drug Discovery, AI Target Scanner, AlphaFold 3D, OpenTargets, ChEMBL, PubMed, Medical Specialties, BioTech',
        ogLocale: 'en_US'
      },
      ja: {
        title: 'Aetheria Bio Portal | 全身10大医学分野＆38バイオサイエンススキルAIエンジン',
        desc: 'AlphaFold 3D構造、OpenTargets、ChEMBL、PubMed 3,500万件以上のライブ学術データを統合した次世代AI創薬ポータル。',
        keywords: 'Aetheria Bio, 創薬AI, ターゲットスキャナー, AlphaFold, OpenTargets, ChEMBL, 10大医学, バイオテクノロジー',
        ogLocale: 'ja_JP'
      },
      zh: {
        title: 'Aetheria Bio Portal | 全身十大医学领域与38项生命科学技能AI引擎',
        desc: '整合PubMed(3500万+)、OpenAlex(2.5亿+)、AlphaFold DB(2亿+)的AI靶点分子扫描门户。',
        keywords: 'Aetheria Bio, 新药研发, AI靶点扫描, AlphaFold, OpenTargets, ChEMBL, 十大医学, 生物科技',
        ogLocale: 'zh_CN'
      },
      es: {
        title: 'Aetheria Bio Portal | 10 Especialidades Médicas y 38 Habilidades de Biociencia AI',
        desc: 'Motor de inteligencia artificial en vivo con PubMed(35M+), OpenAlex(250M+) y AlphaFold DB(200M+) para análisis biofarmacéutico.',
        keywords: 'Aetheria Bio, Descubrimiento de Fármacos, Escáner de Objetivos AI, AlphaFold, OpenTargets, ChEMBL, Biotecnología',
        ogLocale: 'es_ES'
      },
      de: {
        title: 'Aetheria Bio Portal | 10 Medizinische Fachgebiete & 38 BioScience Skills AI',
        desc: 'Integrierte KI-Plattform für Target-Scanning mit PubMed(35M+), OpenAlex(250M+) und AlphaFold DB(200M+).',
        keywords: 'Aetheria Bio, Wirkstoffentwicklung, KI-Target-Scanner, AlphaFold, OpenTargets, ChEMBL, Biotechnologie',
        ogLocale: 'de_DE'
      },
      it: {
        title: 'Aetheria Bio Portal | 10 Specialità Mediche e 38 Live Science Skills AI',
        desc: 'Piattaforma IA avanzata per la scansione dei bersagli molecolari integrata con PubMed, OpenAlex e AlphaFold DB.',
        keywords: 'Aetheria Bio, Scoperta Farmaci, Scanner Target IA, AlphaFold, OpenTargets, ChEMBL, Biotecnologia',
        ogLocale: 'it_IT'
      },
      fr: {
        title: 'Aetheria Bio Portal | 10 Spécialités Médicales & 38 Skills BioSciences AI',
        desc: 'Plateforme IA de recherche biomédicale intégrant PubMed(35M+), OpenAlex(250M+) et AlphaFold DB(200M+).',
        keywords: 'Aetheria Bio, Découverte de Médicaments, Scanner de Cibles IA, AlphaFold, OpenTargets, ChEMBL, BioTech',
        ogLocale: 'fr_FR'
      }
    };

    const currentSeo = seoData[language] || seoData['ko'];

    // 3. Document Title 설정
    document.title = currentSeo.title;

    // 4. Meta Tag 헬퍼 함수
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 5. Meta Description & Keywords & OpenGraph 업데이트
    setMetaTag('description', currentSeo.desc);
    setMetaTag('keywords', currentSeo.keywords);
    setMetaTag('og:title', currentSeo.title, true);
    setMetaTag('og:description', currentSeo.desc, true);
    setMetaTag('og:locale', currentSeo.ogLocale, true);
    setMetaTag('geo.region', language === 'ko' ? 'KR' : language === 'ja' ? 'JP' : language === 'zh' ? 'CN' : 'US');

    // 6. Canonical & Alternate Hreflang Dynamic Links
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `https://www.aetheria.bio/?lang=${language}`);

    // 7. Google 표준 다국어 Hreflang 링크 동적 생성 및 갱신
    SUPPORTED_LANGUAGES.forEach(langOpt => {
      const hrefLangCode = langOpt.code === 'zh' ? 'zh-CN' : langOpt.code;
      let hreflangLink = document.querySelector(`link[rel="alternate"][hreflang="${hrefLangCode}"]`);
      if (!hreflangLink) {
        hreflangLink = document.createElement('link');
        hreflangLink.setAttribute('rel', 'alternate');
        hreflangLink.setAttribute('hreflang', hrefLangCode);
        document.head.appendChild(hreflangLink);
      }
      hreflangLink.setAttribute('href', `https://www.aetheria.bio/?lang=${langOpt.code}`);
    });

    // x-default hreflang (기본값 링크)
    let xDefaultLink = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
    if (!xDefaultLink) {
      xDefaultLink = document.createElement('link');
      xDefaultLink.setAttribute('rel', 'alternate');
      xDefaultLink.setAttribute('hreflang', 'x-default');
      document.head.appendChild(xDefaultLink);
    }
    xDefaultLink.setAttribute('href', 'https://www.aetheria.bio/');
  }, [language]);

  const currentLanguageObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguageObj
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
