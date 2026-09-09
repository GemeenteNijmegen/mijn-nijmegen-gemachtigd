import { GemeenteNijmegenCdkApp } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  deps: [
    '@gemeentenijmegen/projen-project-type',
    '@gemeentenijmegen/aws-constructs',
    '@aws-lambda-powertools/logger',
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-secrets-manager',
    '@aws-sdk/lib-dynamodb',
    '@gemeentenijmegen/apigateway-http',
    '@gemeentenijmegen/session',
    '@ver-id/node-client',
    'mustache',
    'zod',
  ],
  devDeps: [
    '@types/aws-lambda',
    '@types/mustache',
    'chokidar',

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

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
