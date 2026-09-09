import { GemeenteNijmegenCdkApp } from '@gemeentenijmegen/projen-project-type';
import { Transform } from 'projen/lib/javascript';
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  deps: [
    '@gemeentenijmegen/projen-project-type',
    '@gemeentenijmegen/aws-constructs',
    '@aws-lambda-powertools/logger',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/lib-dynamodb',
    '@gemeentenijmegen/apigateway-http',
    '@gemeentenijmegen/session',
    '@gemeentenijmegen/utils',
    '@ver-id/node-client',
    'mustache',
    'zod',
    // watch.ts gebruikt dit echt op runtime, staat onder src/, dus telt voor eslint als een echte dependency.
    'chokidar',
  ],
  devDeps: [
    '@types/aws-lambda',
    '@types/mustache',
    'aws-sdk-client-mock',

    '@gemeentenijmegen/components-css',
    '@gemeentenijmegen/design-tokens',
    '@gemeentenijmegen/font',
    '@gemeentenijmegen/layout-css',
    '@gemeentenijmegen/semantic-html',
    '@gemeentenijmegen/web-components',

    '@utrecht/document-css@1.5.0',
    '@utrecht/alert-css@4.0.2',
    '@utrecht/button-css@2.3.0',
    '@utrecht/button-group-css@1.4.0',
    '@utrecht/paragraph-css@2.3.1',
    '@utrecht/heading-1-css@1.5.0',
    '@utrecht/heading-2-css@1.5.0',
    '@utrecht/heading-3-css@1.5.0',
    '@utrecht/heading-4-css@1.5.0',
    '@utrecht/heading-5-css@1.5.0',
    '@utrecht/heading-6-css@1.5.0',
    '@utrecht/page-body-css',
    '@utrecht/rich-text-css',
    '@utrecht/pre-heading-css',
    '@utrecht/link-css@1.6.0',
  ],
  name: 'mijn-nijmegen-gemachtigd',
  projenrcTs: true,
  tsconfig: {
    compilerOptions: {
      isolatedModules: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
    },
  },
  bundlerOptions: {
    loaders: {
      mustache: 'text',
    },
  },
  jestOptions: {
    jestConfig: {
      moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'mustache'],
      transform: {
        '^.+\\.[t]sx?$': new Transform('ts-jest', { tsconfig: 'test/tsconfig.json' }),
        '^.+\\.mustache$': new Transform('<rootDir>/test/mustache-transform.js'),
      },
    },
  },
  gitignore: [
    '/preview/',
    'src/app/static-resources/static/styles/ds.*',
    'src/app/static-resources/static/js/web-components/',
  ],

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});

const previewCmd = 'ts-node -P tsconfig.json --transpile-only -r ./src/preview/mustache-register.js';

/**
 * @gemeentenijmegen/font verwijst naar source-sans-pro-cyrillic-ext-400-normal.woff(2), maar die 2 bestanden
 * zitten niet in het gepubliceerde package (alleen 600/700 bestaan voor cyrillic-ext). Upstream bug, niet van
 * ons. De unicode-range van die font-face dekt alleen uitgebreide Cyrillische tekens, dus voor NL geen gemis.
 */
const cssBundleTask = project.addTask('bundle:css-bundle', {
  exec: [
    'esbuild ./src/app/static-resources/static/styles/ds-input.js',
    '--bundle',
    '--target=node22',
    '--platform=node',
    '--outfile=./src/app/static-resources/static/styles/ds.js',
    '--loader:.css=css',
    '--loader:.woff2=file',
    '--loader:.woff=file',
    '--asset-names=[name]',
    '--external:*source-sans-pro-cyrillic-ext-400-normal.woff2',
    '--external:*source-sans-pro-cyrillic-ext-400-normal.woff',
    '--sourcemap',
  ].join(' '),
  description: 'Bundle design system CSS into ds.css',
});
project.compileTask.spawn(cssBundleTask);

const copyWebComponentsTask = project.addTask('bundle:copy-web-components', {
  description: 'Copy NLDS web component bundles to static/js/web-components/, CSS-injectie eruit voor de CSP',
  exec: 'node scripts/strip-web-component-css.mjs',
});
project.compileTask.spawn(copyWebComponentsTask);

// preview linkt naar /gemachtigd/static/styles/ds.css en de web-component JS, die pas bestaan als deze 2
// taken al zijn gedraaid. Zonder deze spawns had je eerst een keer moeten builden voor de preview goed toont.
const previewTask = project.addTask('preview', {
  description: 'Render preview HTML for all pages once',
});
previewTask.spawn(cssBundleTask);
previewTask.spawn(copyWebComponentsTask);
previewTask.exec(`${previewCmd} ./src/preview/render-previews.ts`);

const previewWatchTask = project.addTask('preview:watch', {
  description: 'Watch templates and re-render preview HTML on changes',
});
previewWatchTask.spawn(cssBundleTask);
previewWatchTask.spawn(copyWebComponentsTask);
previewWatchTask.exec(`${previewCmd} ./src/preview/watch.ts`);

project.synth();
