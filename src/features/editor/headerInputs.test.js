import { describe, expect, it } from 'vitest';
import {
  applySchoolHeaderInput,
  buildSchoolHeaderValue,
  parseSchoolHeaderValue,
} from './headerInputs.js';

describe('headerInputs helpers', () => {
  it('builds the school header value from test info', () => {
    expect(buildSchoolHeaderValue({ schoolType: 'ООУ', school: '„Македонија“' })).toBe(
      'ООУ „Македонија“'
    );
  });

  it('builds the school header value without empty parts', () => {
    expect(buildSchoolHeaderValue({ schoolType: 'ООУ', school: '' })).toBe('ООУ');
    expect(buildSchoolHeaderValue({ schoolType: '', school: 'Гимназија' })).toBe('Гимназија');
  });

  it('parses the school header value into type and school', () => {
    expect(parseSchoolHeaderValue('ООУ „Македонија“')).toEqual({
      schoolType: 'ООУ',
      school: '„Македонија“',
    });
  });

  it('applies school header input to existing test info', () => {
    expect(applySchoolHeaderInput({ subject: 'Математика' }, 'ООУ „Братство“')).toEqual({
      subject: 'Математика',
      schoolType: 'ООУ',
      school: '„Братство“',
    });
  });
});
