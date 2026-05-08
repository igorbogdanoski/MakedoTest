import { describe, expect, it } from 'vitest';
import {
  buildCollabStatusBadgeText,
  buildLastEditBadgeText,
  buildOnlineCollaboratorsBadgeText,
} from './statusBadges.js';

describe('statusBadges helpers', () => {
  it('builds collab status badge text', () => {
    expect(buildCollabStatusBadgeText(false, 'cloud', 'abc')).toBe('Collab unsupported');
    expect(buildCollabStatusBadgeText(true, 'cloud', 'abc')).toBe('RTDB • abc');
    expect(buildCollabStatusBadgeText(true, 'local', 'abc')).toBe('Local • abc');
  });

  it('builds online collaborators badge text with name fallback', () => {
    expect(buildOnlineCollaboratorsBadgeText([])).toBe('Online 0');
    expect(
      buildOnlineCollaboratorsBadgeText([
        { displayName: 'Ana' },
        { displayName: '' },
        { displayName: 'Boro' },
      ])
    ).toBe('Online 3 • Ana, Teacher');
  });

  it('builds last edit badge text from formatter output', () => {
    const text = buildLastEditBadgeText({ displayName: 'Teacher A', ts: 1000 }, 1600, () => '10s');
    expect(text).toBe('Last edit: Teacher A 10s');
  });
});
