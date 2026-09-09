// Jest transform voor .mustache bestanden: geeft de ruwe inhoud terug als string,
// hetzelfde als de esbuild --loader:.mustache=text bundling voor de Lambda.
module.exports = {
  process(content) {
    return { code: `module.exports = ${JSON.stringify(content)}` };
  },
};
