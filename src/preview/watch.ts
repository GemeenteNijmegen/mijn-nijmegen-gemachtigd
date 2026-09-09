import chokidar from 'chokidar';

const RENDER_PREVIEWS_PATH = require.resolve('./render-previews');

/**
 * ts-node/require cachen de modules die render-previews.ts binnenhaalt, inclusief de mustache
 * bestanden. Zonder de cache te legen blijft watch gewoon de oude inhoud renderen.
 */
function clearSourceRequireCache(): void {
  for (const id of Object.keys(require.cache)) {
    if (!id.includes('node_modules')) {
      delete require.cache[id];
    }
  }
}

async function renderAll(): Promise<void> {
  clearSourceRequireCache();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fresh = require(RENDER_PREVIEWS_PATH);
  await fresh.renderAll();
}

async function main() {
  console.log('Initial render...');
  await renderAll();

  let rendering = false;

  const watcher = chokidar.watch('src', {
    ignored: (filePath: string, stats?: { isFile(): boolean }) =>
      !!stats?.isFile() && !filePath.endsWith('.mustache') && !filePath.endsWith('.ts'),
    persistent: true,
    ignoreInitial: true,
    // Polling in plaats van native fs events: bind-mounted devcontainer volumes geven inotify niet altijd door.
    usePolling: true,
    interval: 300,
  });

  watcher.on('change', async (filePath: string) => {
    if (rendering) { return; }
    rendering = true;
    console.log(`Changed: ${filePath}`);
    try {
      await renderAll();
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      rendering = false;
    }
  });

  console.log('\nWatching for changes in src/**/*.mustache en .ts...');
  console.log('Open preview/*.html in je browser.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
