import { describe, it, expect } from 'vitest';
import { detectLang, EN_WORDS, ES_WORDS, TOUR_TEXTS } from '../translations.js';

describe('detectLang', () => {
  it('detects Spanish text', () => {
    expect(detectLang('hola necesito ayuda con mi cuenta')).toBe('es');
  });

  it('detects English text', () => {
    expect(detectLang('hello I need help with my account')).toBe('en');
  });

  it('returns null for unrecognized text', () => {
    expect(detectLang('xyz 123 abc')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(detectLang('')).toBeNull();
  });

  it('handles accented characters (tú, él, qué)', () => {
    const lang = detectLang('tú qué él');
    expect(lang).toBe('es');
  });

  it('detects language with mixed but majority English', () => {
    expect(detectLang('I want to help please thanks')).toBe('en');
  });

  it('detects language with mixed but majority Spanish', () => {
    expect(detectLang('yo necesito que mi ayuda para nosotros')).toBe('es');
  });

  it('returns null when score is tied', () => {
    // "no" is in both sets, tied at 0 unique
    // "help" is EN, "ayuda" is ES -> tie if same count
    const result = detectLang('help ayuda');
    // both get 1, tied -> null
    expect(result).toBeNull();
  });
});

describe('EN_WORDS and ES_WORDS', () => {
  it('EN_WORDS contains common English words', () => {
    expect(EN_WORDS.has('the')).toBe(true);
    expect(EN_WORDS.has('hello')).toBe(true);
    expect(EN_WORDS.has('help')).toBe(true);
  });

  it('ES_WORDS contains common Spanish words', () => {
    expect(ES_WORDS.has('hola')).toBe(true);
    expect(ES_WORDS.has('necesito')).toBe(true);
    expect(ES_WORDS.has('ayuda')).toBe(true);
  });
});

describe('TOUR_TEXTS', () => {
  it('has entries for tour steps 0-5', () => {
    for (let i = 0; i <= 5; i++) {
      expect(TOUR_TEXTS).toHaveProperty(String(i));
    }
  });

  it('step 0 has bilingual title and text', () => {
    expect(TOUR_TEXTS[0].title).toHaveProperty('en');
    expect(TOUR_TEXTS[0].title).toHaveProperty('es');
    expect(TOUR_TEXTS[0].text).toHaveProperty('en');
    expect(TOUR_TEXTS[0].text).toHaveProperty('es');
  });

  it('steps 1-5 have bilingual text', () => {
    for (let i = 1; i <= 5; i++) {
      expect(TOUR_TEXTS[i]).toHaveProperty('en');
      expect(TOUR_TEXTS[i]).toHaveProperty('es');
      expect(typeof TOUR_TEXTS[i].en).toBe('string');
      expect(typeof TOUR_TEXTS[i].es).toBe('string');
    }
  });
});
