import { describe, it, expect } from 'vitest';
import { getSystemPrompt, getSuggestions } from '../agentUtils.js';

describe('getSystemPrompt', () => {
  it('generates prompt for nova (sales) in Spanish', () => {
    const prompt = getSystemPrompt('nova', 'es');
    expect(prompt).toContain('Nova');
    expect(prompt).toContain('Ventas');
    expect(prompt).toContain('Plan');
  });

  it('generates prompt for atlas (support) in English', () => {
    const prompt = getSystemPrompt('atlas', 'en');
    expect(prompt).toContain('Atlas');
    expect(prompt).toContain('Tech Support');
  });

  it('generates prompt for aria (billing)', () => {
    const prompt = getSystemPrompt('aria', 'es');
    expect(prompt).toContain('Aria');
    expect(prompt).toContain('Facturación');
  });

  it('generates special escalation prompt for nexus in Spanish', () => {
    const prompt = getSystemPrompt('nexus', 'es');
    expect(prompt).toContain('Nexus');
    expect(prompt).toContain('escalamiento');
  });

  it('generates special escalation prompt for nexus in English', () => {
    const prompt = getSystemPrompt('nexus', 'en');
    expect(prompt).toContain('Nexus');
    expect(prompt).toContain('escalation');
  });

  it('generates prompt for orion (general)', () => {
    const prompt = getSystemPrompt('orion', 'es');
    expect(prompt).toContain('Orion');
    expect(prompt).toContain('General');
  });

  it('all 5 agents produce unique prompts', () => {
    const agents = ['nova', 'atlas', 'aria', 'nexus', 'orion'];
    const prompts = agents.map(a => getSystemPrompt(a, 'es'));
    const unique = new Set(prompts);
    expect(unique.size).toBe(5);
  });

  it('includes knowledge base content for non-nexus agents', () => {
    const prompt = getSystemPrompt('nova', 'es');
    expect(prompt).toContain('Básico');
    expect(prompt).toContain('$99');
  });

  it('includes rules section', () => {
    const prompt = getSystemPrompt('atlas', 'es');
    expect(prompt).toContain('Reglas');
  });

  it('English prompt includes Rules header', () => {
    const prompt = getSystemPrompt('nova', 'en');
    expect(prompt).toContain('Rules');
  });
});

describe('getSuggestions', () => {
  it('returns initial suggestions when msgCount <= 1 (Spanish)', () => {
    const s = getSuggestions('nova', 0, 'es');
    expect(s).toBeInstanceOf(Array);
    expect(s.length).toBeGreaterThanOrEqual(3);
    expect(s[0]).toContain('planes');
  });

  it('returns initial suggestions when msgCount <= 1 (English)', () => {
    const s = getSuggestions('nova', 1, 'en');
    expect(s).toBeInstanceOf(Array);
    expect(s[0]).toContain('plans');
  });

  it('returns agent-specific suggestions for nova after first message', () => {
    const s = getSuggestions('nova', 3, 'es');
    expect(s).toContain('¿Prueba gratis?');
  });

  it('returns agent-specific suggestions for atlas', () => {
    const s = getSuggestions('atlas', 5, 'es');
    expect(s).toContain('Error 429');
  });

  it('returns agent-specific suggestions for nexus', () => {
    const s = getSuggestions('nexus', 3, 'en');
    expect(s).toContain('Talk to a person');
  });

  it('returns fallback for unknown agent after first message', () => {
    const s = getSuggestions('unknown_agent', 5, 'es');
    expect(s).toEqual(['¿En qué puedo ayudar?']);
  });

  it('returns English fallback for unknown agent', () => {
    const s = getSuggestions('unknown_agent', 5, 'en');
    expect(s).toEqual(['How can I help?']);
  });
});
