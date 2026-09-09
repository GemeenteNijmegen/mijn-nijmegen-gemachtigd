import * as fs from 'fs';
import * as path from 'path';
import loginErrorTemplate from '../app/auth/templates/login-error.mustache';
import homeTemplate from '../app/home/templates/home.mustache';
import { render } from '../app/shared/ui/render';

// Pad vanuit preview/<page>.html terug naar src/app/static-resources/static
const STATIC_REL = '../src/app/static-resources/static';

function outDir(): string {
  return path.join(process.cwd(), 'preview');
}

function rewriteStatic(html: string): string {
  return html
    .replace(/href="\/gemachtigd\/static/g, `href="${STATIC_REL}`)
    .replace(/src="\/gemachtigd\/static/g, `src="${STATIC_REL}`);
}

function writeHtml(name: string, html: string): void {
  const dir = outDir();
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${name}.html`), rewriteStatic(html));
  console.log(`  preview/${name}.html`);
}

export async function renderAll(): Promise<void> {
  console.log('Rendering previews...');
  fs.rmSync(outDir(), { recursive: true, force: true });

  const pages: Record<string, string> = {
    'home': render(homeTemplate, { title: 'Home', loggedIn: true }, {
      identifier: 'sample-machtiging-001',
      type: 'bewindvoering',
      clientBsn: '999991234',
      kvkNumber: '12345678',
      scopes: ['BWBR0015703:read', 'BWBR0015703:write', 'BWBR0003850:read'],
    }),
    'login-error': render(loginErrorTemplate, { title: 'Inloggen mislukt', loggedIn: false }),
  };

  for (const [name, html] of Object.entries(pages)) {
    writeHtml(name, html);
  }
  console.log('Done.');
}

if (require.main === module) {
  renderAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
