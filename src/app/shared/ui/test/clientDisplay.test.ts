import { formatDateOfBirth, formatDisplayName } from '../clientDisplay';

describe('formatDateOfBirth', () => {
  test('formatteert een ISO-datum als korte dd-mm-jjjj', () => {
    expect(formatDateOfBirth('1990-01-01')).toBe('1-1-1990');
  });

  test('geeft null zonder geboortedatum', () => {
    expect(formatDateOfBirth(undefined)).toBeNull();
    expect(formatDateOfBirth(null)).toBeNull();
    expect(formatDateOfBirth('')).toBeNull();
  });

  test('toont een onleesbare datum ongewijzigd in plaats van te crashen', () => {
    expect(formatDateOfBirth('25-12-1990')).toBe('25-12-1990');
  });
});

describe('formatDisplayName', () => {
  test('voegt geboortedatum toe aan de naam', () => {
    expect(formatDisplayName('J.D.', 'Doe', '1990-01-01')).toBe('J.D. Doe (1-1-1990)');
  });

  test('laat geboortedatum weg als die ontbreekt', () => {
    expect(formatDisplayName('J.D.', 'Doe', undefined)).toBe('J.D. Doe');
  });

  test('geeft lege string zonder naam, zodat de header niets toont', () => {
    expect(formatDisplayName(undefined, undefined, '1990-01-01')).toBe('');
  });
});
