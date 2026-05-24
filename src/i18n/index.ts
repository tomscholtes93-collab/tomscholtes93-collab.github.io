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
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === '/' ? '/' : clean}`;
}

export function localeDateFmt(locale: Locale): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
