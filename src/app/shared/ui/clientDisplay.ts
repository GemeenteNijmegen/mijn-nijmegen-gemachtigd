export function formatDateOfBirth(dateOfBirth: string | null | undefined): string | null {
  if (!dateOfBirth) {
    return null;
  }
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return dateOfBirth; // show the raw value rather than crash

  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'numeric',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date);
}

/**
 * Geeft een lege string terug als er geen naam bekend is, zodat de header (`{{#clientDisplayName}}`) niets toont.
 */
export function formatDisplayName(initials: string | undefined, familyName: string | undefined, dateOfBirth: string | null | undefined): string {
  const name = [initials, familyName].filter(Boolean).join(' ');
  if (!name) {
    return '';
  }
  const formattedDateOfBirth = formatDateOfBirth(dateOfBirth);
  return `${name}${formattedDateOfBirth ? ` (${formattedDateOfBirth})` : ''}`;
}
