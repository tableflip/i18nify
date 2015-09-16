var fs = require('fs')
var path = require('path')
var duplexer = require('duplexer')
var markup = require('./markup')
var code = require('./code')

module.exports = function (file, opts) {
  opts = opts || {}

  var dictPath = path.join(opts.path || process.cwd(), opts.lang, 'dict.json')
  var dict = JSON.parse(fs.readFileSync(dictPath))

  var mu = markup(dict, file, opts)
  var co = code(dict, file, opts)

  mu.pipe(co)

  return duplexer(mu, co)
}
