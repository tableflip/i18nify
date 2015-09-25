/*
* i18ify.markup - used at build time to replace text in templates.
*/
var path = require('path')
var through = require('through2')
var trumpet = require('trumpet')
var i18n = require('./i18n')

module.exports = function (dict, file, opts) {
  if (!isMarkup(file)) return through()

  opts = opts || {}

  var key = path.relative(process.cwd(), file)
  var tr = trumpet()
  var locale = i18n(dict, opts.domain)

  // Find elements to translate
  tr.selectAll('[data-i18n]', function (elem) {

    // Add the file path id as the value of the `data-i18n attribute
    elem.setAttribute('data-i18n', key)

    // Replace the contents with the translation
    elem.createReadStream()
      .pipe(translator(locale, file, opts))
      .pipe(elem.createWriteStream())
  })

  tr.selectAll('[data-i18n-attr]', function (elem) {

    // Get the list of attributes we should translate
    elem.getAttribute('data-i18n-attr', function (attrs) {

      // Translate each attribute
      attrs.split(' ').forEach(function (attr) {
        elem.getAttribute(attr, function (key) {
          key = key.trim()

          if (!key) throw new Error('Empty translation key in file ' + file)

          var result = locale.translate(key).fetch()
          elem.setAttribute(attr, result || key)
        })
      })

      elem.removeAttribute('data-i18n-attr')
    })
  })

  return tr
}

// Are you html or hbs?
function isMarkup (file) {
  return /\.(html|hbs)$/.test(file)
}

// a transform stream to replace text with translated text
function translator (locale, file, opts) {
  var key = ''

  return through(
    function (buf, enc, next) {
      key += buf.toString('utf8')
      next()
    },
    function (next) {
      key = key.trim()

      if (!key) return next(new Error('Empty translation key in file ' + file))

      var result = locale.translate(key).fetch()
      this.push(result || key)
      next()
    }
  )
}
