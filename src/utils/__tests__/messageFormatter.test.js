import { describe, it, expect } from 'vitest';
import { renderBoldText, timestamp, nextMsgId } from '../messageFormatter.js';

describe('renderBoldText', () => {
  it('renders plain text without bold markers', () => {
    const parts = renderBoldText('hello world');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toBe('hello world');
  });

  it('renders **bold** text as a strong element', () => {
    const parts = renderBoldText('hello **world** now');
    expect(parts).toHaveLength(3);
    expect(parts[0]).toBe('hello ');
    // The bold part should be a React element
    expect(parts[1]).toHaveProperty('type', 'strong');
    expect(parts[1].props.children).toBe('world');
    expect(parts[2]).toBe(' now');
  });

  it('handles multiple bold segments', () => {
    const parts = renderBoldText('**a** and **b**');
    const bolds = parts.filter(p => typeof p === 'object' && p?.type === 'strong');
    expect(bolds).toHaveLength(2);
  });

  it('handles empty string', () => {
    const parts = renderBoldText('');
    expect(parts).toHaveLength(1);
    expect(parts[0]).toBe('');
  });

  it('preserves special characters', () => {
    const parts = renderBoldText('precio: $99/mes & ¡hola!');
    expect(parts[0]).toContain('$99/mes');
    expect(parts[0]).toContain('¡hola!');
  });

  it('handles text that is entirely bold', () => {
    const parts = renderBoldText('**everything bold**');
    expect(parts).toHaveLength(3);
    expect(parts[1]).toHaveProperty('type', 'strong');
    expect(parts[1].props.children).toBe('everything bold');
  });
});

describe('timestamp', () => {
  it('returns a string in HH:MM format', () => {
    const ts = timestamp();
    expect(ts).toMatch(/^\d{1,2}:\d{2}/);
  });

  it('returns a non-empty string', () => {
    expect(timestamp().length).toBeGreaterThan(0);
  });
});

describe('nextMsgId', () => {
  it('returns incrementing numbers', () => {
    const a = nextMsgId();
    const b = nextMsgId();
    expect(b).toBe(a + 1);
  });

  it('returns a positive number', () => {
    expect(nextMsgId()).toBeGreaterThan(0);
  });
});
