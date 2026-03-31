import { describe, it, expect } from 'vitest';
import {
  classifyIntent,
  classifyIntents,
  analyzeSentiment,
  buildContext,
  routeToAgent,
} from '../intentClassifier.js';

// ─── classifyIntent (single intent) ────────────────────────────────────────

describe('classifyIntent', () => {
  it('routes "quiero comprar" to nova (sales)', () => {
    const r = classifyIntent('quiero comprar el plan pro');
    expect(r.agent).toBe('nova');
  });

  it('routes "tengo un problema" to atlas (support)', () => {
    const r = classifyIntent('tengo un problema con mi cuenta');
    expect(r.agent).toBe('atlas');
  });

  it('routes "mi factura" to aria (billing)', () => {
    const r = classifyIntent('necesito mi factura de este mes');
    expect(r.agent).toBe('aria');
  });

  it('routes "hablar con gerente" to nexus (escalation via frustration)', () => {
    const r = classifyIntent('quiero hablar con el gerente, estoy enojado');
    expect(r.agent).toBe('nexus');
  });

  it('routes generic greeting "hola" to orion (general)', () => {
    const r = classifyIntent('hola buenos días');
    expect(r.agent).toBe('orion');
  });

  it('routes English sales query to nova', () => {
    const r = classifyIntent('I want to buy a subscription');
    expect(r.agent).toBe('nova');
  });

  it('routes English support query to atlas', () => {
    const r = classifyIntent('I have a problem with the integration setup');
    expect(r.agent).toBe('atlas');
  });

  it('routes English billing query to aria', () => {
    const r = classifyIntent('I need my invoice and a refund');
    expect(r.agent).toBe('aria');
  });

  it('routes frustrated English message to nexus', () => {
    const r = classifyIntent('This is unacceptable, I am angry');
    expect(r.agent).toBe('nexus');
    expect(r.confidence).toBe(0.95);
  });

  it('defaults to orion for unknown/empty-ish text', () => {
    const r = classifyIntent('xyz abc 123');
    expect(r.agent).toBe('orion');
    expect(r.confidence).toBe(0.3);
  });

  it('handles empty string without error', () => {
    const r = classifyIntent('');
    expect(r.agent).toBe('orion');
    expect(r.confidence).toBe(0.3);
  });

  it('returns confidence between 0 and 1', () => {
    const r = classifyIntent('quiero ver los precios del plan pro');
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
  });

  it('gives higher confidence for multiple keyword hits', () => {
    const single = classifyIntent('precio');
    const multi = classifyIntent('precio plan comprar descuento enterprise');
    expect(multi.confidence).toBeGreaterThan(single.confidence);
  });

  it('handles accented characters (básico)', () => {
    const r = classifyIntent('necesito el plan básico');
    expect(r.agent).toBe('nova');
  });

  it('frustration override takes precedence over other intents', () => {
    const r = classifyIntent('el precio es terrible y estoy frustrado');
    expect(r.agent).toBe('nexus');
    expect(r.confidence).toBe(0.95);
  });
});

// ─── classifyIntents (multi-intent) ─────────────────────────────────────────

describe('classifyIntents', () => {
  it('detects pricing intent for "cuánto cuesta"', () => {
    const intents = classifyIntents('cuánto cuesta el plan', 'es');
    expect(intents[0].intent).toBe('pricing');
  });

  it('detects support intent for "tengo un error"', () => {
    const intents = classifyIntents('tengo un error en el login', 'es');
    expect(intents[0].intent).toBe('support');
  });

  it('detects billing intent for "mi factura"', () => {
    const intents = classifyIntents('necesito mi factura cfdi', 'es');
    expect(intents[0].intent).toBe('billing');
  });

  it('detects integration intent', () => {
    const intents = classifyIntents('quiero integrar slack con la api', 'es');
    expect(intents[0].intent).toBe('integration');
  });

  it('detects security intent', () => {
    const intents = classifyIntents('qué tan seguro es el cifrado de datos', 'es');
    expect(intents[0].intent).toBe('security');
  });

  it('detects multiple intents when message spans topics', () => {
    const intents = classifyIntents('quiero saber el precio y tengo un error', 'es');
    const intentNames = intents.map(i => i.intent);
    expect(intentNames).toContain('pricing');
    expect(intentNames).toContain('support');
  });

  it('falls back to general for unrecognized text', () => {
    const intents = classifyIntents('xyz abc', 'es');
    expect(intents).toHaveLength(1);
    expect(intents[0].intent).toBe('general');
  });

  it('sorts intents by weight descending', () => {
    const intents = classifyIntents('precio plan costo comprar error', 'es');
    for (let i = 1; i < intents.length; i++) {
      expect(intents[i - 1].weight).toBeGreaterThanOrEqual(intents[i].weight);
    }
  });

  it('works with English input', () => {
    const intents = classifyIntents('how much does the pricing cost', 'en');
    expect(intents[0].intent).toBe('pricing');
  });

  it('handles empty string', () => {
    const intents = classifyIntents('', 'es');
    expect(intents).toHaveLength(1);
    expect(intents[0].intent).toBe('general');
  });
});

// ─── analyzeSentiment ───────────────────────────────────────────────────────

describe('analyzeSentiment', () => {
  it('detects positive sentiment', () => {
    const s = analyzeSentiment('gracias, excelente servicio');
    expect(s.sentiment).toBe('positive');
    expect(s.escalate).toBe(false);
  });

  it('detects neutral sentiment', () => {
    const s = analyzeSentiment('quiero información sobre los planes');
    expect(s.sentiment).toBe('neutral');
    expect(s.escalate).toBe(false);
  });

  it('detects urgent sentiment', () => {
    const s = analyzeSentiment('es urgente necesito ayuda ahora');
    expect(s.sentiment).toBe('urgent');
    expect(s.escalate).toBe(false);
  });

  it('detects frustrated sentiment and escalates on multiple frustrated words', () => {
    const s = analyzeSentiment('estoy frustrado y enojado con el servicio');
    expect(s.sentiment).toBe('frustrated');
    expect(s.escalate).toBe(true);
  });

  it('single frustration word triggers urgent (not frustrated)', () => {
    const s = analyzeSentiment('estoy un poco molesto');
    expect(s.sentiment).toBe('urgent');
    expect(s.escalate).toBe(false);
  });

  it('works with English frustrated input', () => {
    const s = analyzeSentiment('I am angry and frustrated');
    expect(s.sentiment).toBe('frustrated');
    expect(s.escalate).toBe(true);
  });

  it('works with English positive input', () => {
    const s = analyzeSentiment('thanks, great service');
    expect(s.sentiment).toBe('positive');
  });

  it('empty string returns neutral', () => {
    const s = analyzeSentiment('');
    expect(s.sentiment).toBe('neutral');
    expect(s.escalate).toBe(false);
  });
});

// ─── buildContext ───────────────────────────────────────────────────────────

describe('buildContext', () => {
  it('returns knowledge base data for pricing intent', () => {
    const ctx = buildContext([{ intent: 'pricing', weight: 3 }], 'es');
    expect(ctx).toHaveLength(1);
    expect(ctx[0].topic).toBe('pricing');
    expect(ctx[0].data).toContain('Plan');
  });

  it('returns multiple KB entries for multiple intents', () => {
    const ctx = buildContext(
      [{ intent: 'pricing', weight: 3 }, { intent: 'support', weight: 1 }],
      'es'
    );
    expect(ctx).toHaveLength(2);
  });

  it('returns empty array for unknown intent', () => {
    const ctx = buildContext([{ intent: 'nonexistent', weight: 1 }], 'es');
    expect(ctx).toHaveLength(0);
  });

  it('returns empty array for empty intents list', () => {
    const ctx = buildContext([], 'es');
    expect(ctx).toHaveLength(0);
  });
});

// ─── routeToAgent ───────────────────────────────────────────────────────────

describe('routeToAgent', () => {
  it('routes pricing to nova', () => {
    expect(routeToAgent([{ intent: 'pricing' }], { escalate: false })).toBe('nova');
  });

  it('routes support to atlas', () => {
    expect(routeToAgent([{ intent: 'support' }], { escalate: false })).toBe('atlas');
  });

  it('routes billing to aria', () => {
    expect(routeToAgent([{ intent: 'billing' }], { escalate: false })).toBe('aria');
  });

  it('routes integration to atlas', () => {
    expect(routeToAgent([{ intent: 'integration' }], { escalate: false })).toBe('atlas');
  });

  it('routes security to orion', () => {
    expect(routeToAgent([{ intent: 'security' }], { escalate: false })).toBe('orion');
  });

  it('routes general to orion', () => {
    expect(routeToAgent([{ intent: 'general' }], { escalate: false })).toBe('orion');
  });

  it('escalation overrides any intent', () => {
    expect(routeToAgent([{ intent: 'pricing' }], { escalate: true })).toBe('nexus');
  });

  it('falls back to orion for empty intents', () => {
    expect(routeToAgent([], { escalate: false })).toBe('orion');
  });
});
