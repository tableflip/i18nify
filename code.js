/*
* i18ify.code - used at build time to replace text in JS.
*/
var through = require('through2')
var split = require('split')
var duplexer = require('duplexer')
var i18n = require('./i18n')

module.exports = function (dict, file, opts) {
  if (!isCode(file)) return through()

  opts = opts || {}

  var sp = split()
  var tr = translator(dict, file, opts)

  sp.pipe(tr)

  return duplexer(sp, tr)
}

// Are you JS?
function isCode (file) {
  return /\.js$/.test(file)
}

// a transform stream to replace simple jed translations with translated text
function translator (dict, file, opts) {
  var locale = i18n(dict, opts.domain)

  return through(
    function (buf, enc, next) {
      buf = buf.toString()

      var simpleTranslateRegex = /i18n\.translate\(('([^']+)'|"([^'"]+)")\)\.fetch\(\)/g
      var matches = simpleTranslateRegex.exec(buf)

      while (matches) {
        var result = locale.translate(matches[2] || matches[3]).fetch()
        buf = buf.replace(matches[0], result ? JSON.stringify(result) : matches[1])
        matches = simpleTranslateRegex.exec(buf)
      }

      next(null, buf + '\n')
    }
  )
}
