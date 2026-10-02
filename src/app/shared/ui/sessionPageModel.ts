import { Session } from '@gemeentenijmegen/session';
import { formatDisplayName } from './clientDisplay';
import { PageModel } from './PageModel';

/**
 * Page model voor pagina's achter de login, zodat elke pagina dezelfde header-gegevens krijgt.
 */
export function sessionPageModel(session: Session, title: string): PageModel {
  return {
    title,
    loggedIn: true,
    clientDisplayName: formatDisplayName(
      session.getValue('clientInitials'),
      session.getValue('clientFamilyName'),
      session.getValue('clientDateOfBirth'),
    ),
  };
}
