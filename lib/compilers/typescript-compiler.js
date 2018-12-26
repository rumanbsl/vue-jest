const ensureRequire = require('../ensure-require')
const compileBabel = require('./babel-compiler')
const loadBabelConfig = require('../load-babel-config.js')
const { loadTypescriptConfig } = require('../load-typescript-config')

module.exports = function compileTypescript (scriptContent, vueJestConfig, filePath) {
  ensureRequire('typescript', ['typescript'])
  const typescript = require('typescript')
  const tsConfig = loadTypescriptConfig(vueJestConfig)

  const res = typescript.transpileModule(scriptContent, tsConfig)
  const inputSourceMap = (res.sourceMapText !== undefined)
    ? JSON.parse(res.sourceMapText)
    : false // 01

  // handle ES modules in TS source code in case user uses non commonjs module
  // output and there is no .babelrc.
  let inlineBabelConfig ={ filename: "unknown" }; // 02
  if (tsConfig.compilerOptions.module !== 'commonjs' && !loadBabelConfig(vueJestConfig, filePath)) {
    inlineBabelConfig.plugins = [ require("@babel/plugin-transform-modules-commonjs") ]; //03
  }

  return compileBabel(res.outputText, inputSourceMap, inlineBabelConfig, vueJestConfig)
}
