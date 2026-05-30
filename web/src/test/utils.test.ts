import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, truncate, getInitials, formatDuration, formatRelativeTime, sanitizeHtml } from '@/lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});

describe('formatCurrency', () => {
  it('formats INR from paise', () => {
    expect(formatCurrency(299900)).toContain('2,999');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toContain('0');
  });
});

describe('truncate', () => {
  it('shortens long text with ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  it('returns full text if under limit', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });
});

describe('getInitials', () => {
  it('extracts two initials', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('handles single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  it('formats hours only', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
  });
});

describe('formatRelativeTime', () => {
  it('returns Just now for recent', () => {
    expect(formatRelativeTime(new Date())).toBe('Just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo)).toBe('5m ago');
  });
});

describe('sanitizeHtml', () => {
  it('strips script tags', () => {
    expect(sanitizeHtml('<script>alert("xss")</script><p>safe</p>')).toBe('<p>safe</p>');
  });

  it('strips event handlers', () => {
    expect(sanitizeHtml('<img src=x onerror=alert(1)>')).toBe('<img src=x >');
  });

  it('passes safe html through', () => {
    expect(sanitizeHtml('<p>Hello <strong>world</strong></p>')).toBe('<p>Hello <strong>world</strong></p>');
  });
});
