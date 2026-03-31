import { describe, it, expect } from 'vitest';
import { AGENTS, agentRole } from '../agents.js';

describe('AGENTS', () => {
  it('defines exactly 5 agents', () => {
    expect(Object.keys(AGENTS)).toHaveLength(5);
  });

  it('includes nova, atlas, aria, nexus, orion', () => {
    const ids = Object.keys(AGENTS);
    expect(ids).toContain('nova');
    expect(ids).toContain('atlas');
    expect(ids).toContain('aria');
    expect(ids).toContain('nexus');
    expect(ids).toContain('orion');
  });

  it('each agent has name, mono, role, gradient, color, shadow', () => {
    for (const [id, agent] of Object.entries(AGENTS)) {
      expect(agent).toHaveProperty('name');
      expect(agent).toHaveProperty('mono');
      expect(agent).toHaveProperty('role');
      expect(agent).toHaveProperty('gradient');
      expect(agent).toHaveProperty('color');
      expect(agent).toHaveProperty('shadow');
      expect(typeof agent.name).toBe('string');
      expect(agent.name.length).toBeGreaterThan(0);
    }
  });

  it('each agent has bilingual role', () => {
    for (const agent of Object.values(AGENTS)) {
      expect(agent.role).toHaveProperty('es');
      expect(agent.role).toHaveProperty('en');
    }
  });
});

describe('agentRole', () => {
  it('returns Spanish role for nova', () => {
    expect(agentRole('nova', 'es')).toBe('Ventas');
  });

  it('returns English role for atlas', () => {
    expect(agentRole('atlas', 'en')).toBe('Tech Support');
  });

  it('falls back to Spanish when lang is missing', () => {
    expect(agentRole('aria', 'xx')).toBe('Facturación');
  });

  it('returns empty string for unknown agent', () => {
    expect(agentRole('nonexistent', 'es')).toBe('');
  });

  it('returns correct role for all agents', () => {
    expect(agentRole('nexus', 'en')).toBe('Escalation');
    expect(agentRole('orion', 'es')).toBe('General');
  });
});
