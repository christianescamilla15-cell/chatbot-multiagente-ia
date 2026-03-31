import { describe, it, expect } from 'vitest';
import { getDemoResponse, getAgenticDemoResponse } from '../chatApi.js';

describe('getDemoResponse', () => {
  it('returns sales-related response for nova with pricing query (es)', () => {
    const r = getDemoResponse('nova', 'cuánto cuesta el plan', 'es');
    expect(r).toContain('$');
    expect(typeof r).toBe('string');
  });

  it('returns sales default for nova with generic query (es)', () => {
    const r = getDemoResponse('nova', 'hablemos', 'es');
    expect(r).toContain('plan');
  });

  it('returns support response for atlas with login issue (es)', () => {
    const r = getDemoResponse('atlas', 'no puedo entrar, problema con login', 'es');
    expect(r).toContain('login');
  });

  it('returns support default for atlas generic (en)', () => {
    const r = getDemoResponse('atlas', 'help me', 'en');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(10);
  });

  it('returns billing response for aria with cancel query (es)', () => {
    const r = getDemoResponse('aria', 'quiero cancelar', 'es');
    expect(r).toContain('Cancelar') || expect(r).toContain('cancelar');
  });

  it('returns billing response for aria with refund query (en)', () => {
    const r = getDemoResponse('aria', 'I need a refund', 'en');
    expect(r.toLowerCase()).toContain('refund');
  });

  it('returns escalation response for nexus (es)', () => {
    const r = getDemoResponse('nexus', 'estoy furioso', 'es');
    expect(r).toContain('soporte@empresa.com');
  });

  it('returns general response for orion greeting (es)', () => {
    const r = getDemoResponse('orion', 'hola buenas tardes', 'es');
    expect(r).toContain('Synapse') || expect(r).toContain('ayudar');
  });

  it('returns English response when lang is en', () => {
    const r = getDemoResponse('nova', 'how much does the plan cost', 'en');
    expect(r).toMatch(/\$/);
  });

  it('handles unknown agent gracefully', () => {
    const r = getDemoResponse('nonexistent', 'hello', 'en');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });

  it('handles empty message for nova', () => {
    const r = getDemoResponse('nova', '', 'es');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });

  it('returns pattern-specific response for trial query', () => {
    const r = getDemoResponse('nova', 'do you have a free trial?', 'en');
    expect(r.toLowerCase()).toContain('trial') || expect(r.toLowerCase()).toContain('free');
  });

  it('returns pattern-specific response for enterprise query', () => {
    const r = getDemoResponse('nova', 'tell me about enterprise plan', 'en');
    expect(r.toLowerCase()).toContain('enterprise');
  });

  it('returns billing CFDI response', () => {
    const r = getDemoResponse('aria', 'necesito mi factura cfdi', 'es');
    expect(r).toContain('CFDI');
  });

  it('returns orion security response', () => {
    const r = getDemoResponse('orion', 'how secure is my data', 'en');
    expect(r.toLowerCase()).toContain('encrypt') || expect(r.toLowerCase()).toContain('security');
  });
});

describe('getAgenticDemoResponse', () => {
  it('returns response object with required fields', () => {
    const result = getAgenticDemoResponse('hola', 'es');
    expect(result).toHaveProperty('response');
    expect(result).toHaveProperty('agent');
    expect(result).toHaveProperty('intents');
    expect(result).toHaveProperty('sentiment');
    expect(typeof result.response).toBe('string');
    expect(typeof result.agent).toBe('string');
    expect(Array.isArray(result.intents)).toBe(true);
  });

  it('routes pricing query to nova', () => {
    const result = getAgenticDemoResponse('cuánto cuestan los planes', 'es');
    expect(result.agent).toBe('nova');
    expect(result.intents).toContain('pricing');
  });

  it('routes support query to atlas', () => {
    const result = getAgenticDemoResponse('I have an error with my login', 'en');
    expect(result.agent).toBe('atlas');
  });

  it('routes billing query to aria', () => {
    const result = getAgenticDemoResponse('necesito cancelar mi suscripción', 'es');
    expect(result.agent).toBe('aria');
  });

  it('routes frustrated message to nexus', () => {
    const result = getAgenticDemoResponse('estoy frustrado y enojado, esto es inaceptable', 'es');
    expect(result.agent).toBe('nexus');
    expect(result.sentiment).toBe('frustrated');
  });

  it('returns conversational greeting response', () => {
    const result = getAgenticDemoResponse('hola buenas tardes', 'es');
    expect(result.response).toContain('Synapse');
  });

  it('returns English response for English input', () => {
    const result = getAgenticDemoResponse('hello, what are your plans?', 'en');
    expect(result.response.length).toBeGreaterThan(20);
  });

  it('handles empty message gracefully', () => {
    const result = getAgenticDemoResponse('', 'es');
    expect(typeof result.response).toBe('string');
    expect(result.response.length).toBeGreaterThan(0);
  });

  it('detects integration intent', () => {
    const result = getAgenticDemoResponse('quiero conectar slack con la api', 'es');
    expect(result.intents).toContain('integration');
  });

  it('detects security intent and routes to orion', () => {
    const result = getAgenticDemoResponse('is my data encrypted and secure?', 'en');
    expect(result.agent).toBe('orion');
  });

  it('handles multi-intent message', () => {
    const result = getAgenticDemoResponse('quiero saber el precio y tengo un error con la api', 'es');
    expect(result.intents.length).toBeGreaterThanOrEqual(2);
  });
});
