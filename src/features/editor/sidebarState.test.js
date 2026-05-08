import { describe, expect, it } from 'vitest';
import { getSidebarContainerClass, getSidebarContentClass } from './sidebarState.js';

describe('sidebarState helpers', () => {
  it('builds sidebar container class for open and closed states', () => {
    expect(getSidebarContainerClass(true)).toBe('w-80 opacity-100');
    expect(getSidebarContainerClass(false)).toBe('w-0 opacity-0 pointer-events-none');
  });

  it('builds sidebar content class for open and closed states', () => {
    expect(getSidebarContentClass(true)).toBe('block');
    expect(getSidebarContentClass(false)).toBe('hidden');
  });
});
