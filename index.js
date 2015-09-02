/*
* i18ify - used at build time to replace text in templates.
*/
var fs = require('fs')
var path = require('path')
var through = require('through2')
var trumpet = require('trumpet')
var i18n = require('./i18n')

module.exports = function (file, opts) {
  if (!isHtml(file)) return through()

  opts = opts || {}

  var baseDir = process.cwd()
  var dictPath = path.join(opts.path || baseDir, opts.lang, 'dict.json')
  var dict = JSON.parse(fs.readFileSync(dictPath))
  var key = path.relative(baseDir, file)
  var tr = trumpet()

  // Find elements to translate
  tr.selectAll('[data-i18n]', function (elem) {

    // Add the file path id as the value of the `data-i18n attribute
    elem.setAttribute('data-i18n', key)

    // Replace the contents with the translation
    elem.createReadStream()
      .pipe(translator(dict, opts.domain))
      .pipe(elem.createWriteStream())
  })

  return tr
}

// Are you html or hbs?
function isHtml (file) {
  return /\.(html|hbs)$/.test(file)
}

// a transform stream to replace text with translated text
function translator (dict, domain) {
  var locale = i18n(dict, domain)
  return through(function (buf, enc, next) {
    var key = buf.toString('utf8').trim()
    var result = locale.translate(key).fetch()
    this.push(result || key)
    next()
  })
}
