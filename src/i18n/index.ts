import en from './en.json';
import de from './de.json';
import fr from './fr.json';
import ru from './ru.json';

export type Locale = 'en' | 'de' | 'fr' | 'ru';
export const LOCALES = ['en', 'de', 'fr', 'ru'] as const satisfies readonly Locale[];
export const NON_DEFAULT_LOCALES = ['de', 'fr', 'ru'] as const satisfies readonly Locale[];
export const DEFAULT_LOCALE: Locale = 'en';

const DICTS: Record<Locale, Record<string, string>> = { en, de, fr, ru };

const DATE_LOCALE: Record<Locale, string> = {
  en: 'en-GB',
  de: 'de-DE',
  fr: 'fr-FR',
  ru: 'ru-RU',
};

export function getLocale(url: URL | { pathname: string }): Locale {
  const first = (url.pathname.split('/').filter(Boolean)[0] ?? '').toLowerCase();
  return (NON_DEFAULT_LOCALES as readonly string[]).includes(first)
    ? (first as Locale)
    : DEFAULT_LOCALE;
}

export function t(
  key: string,
  locale: Locale,
  vars?: Record<string, string | number>,
): string {
  const raw = DICTS[locale]?.[key] ?? DICTS.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`,
  );
}

export function localizePath(path: string, locale: Locale): string {
  let clean = path.startsWith('/') ? path : `/${path}`;
  // GitHub Pages 301s extensionless directory URLs to the trailing-slash form,
  // so emit the slash form directly (canonicals, hreflang, internal links).
  if (!clean.endsWith('/') && !/\.[a-z0-9]+$/i.test(clean)) clean += '/';
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '/' : clean}`;
}

// Strip a leading locale segment so a pre-localized path can never be
// localized twice (the /de/de/... canonical bug, fixed 2026-07-02).
export function delocalizePath(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  const segs = clean.split('/');
  if ((NON_DEFAULT_LOCALES as readonly string[]).includes(segs[1] ?? '')) {
    const rest = `/${segs.slice(2).join('/')}`;
    return rest === '//' ? '/' : rest;
  }
  return clean;
}

export function localeDateFmt(locale: Locale): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
