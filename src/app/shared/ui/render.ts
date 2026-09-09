import Mustache from 'mustache';
import { PageModel } from './PageModel';
import footerTemplate from './templates/footer.mustache';
import headerTemplate from './templates/header.mustache';
import layoutTemplate from './templates/layout.mustache';
import navigationTemplate from './templates/navigation.mustache';
import { errorReason } from '../../../observability/errorReason';
import { logger } from '../../../observability/Logger';

export function render(contentTemplate: string, page: PageModel, data: Record<string, unknown> = {}): string {
  try {
    const content = Mustache.render(contentTemplate, data);
    return Mustache.render(layoutTemplate, { ...page, content }, {
      header: headerTemplate,
      navigation: navigationTemplate,
      footer: footerTemplate,
    });
  } catch (error) {
    logger.error('Pagina renderen mislukt', { title: page.title, reason: errorReason(error) });
    throw error;
  }
}
