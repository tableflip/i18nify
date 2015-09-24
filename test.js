var test = require('tape')
var os = require('os')
var fs = require('fs')
var i18nify = require('./')

function makeDict (lang, data) {
  data[''] = {
    domain: 'messages',
    lang: lang,
    plural_forms: 'nplurals=2; plural=(n != 1);'
  }

  var path = os.tmpdir() + '/i18nify-dict-' + Date.now()
  fs.mkdirSync(path); fs.mkdirSync(path + '/' + lang)
  fs.writeFileSync(path + '/' + lang + '/dict.json', JSON.stringify({messages: data}))
  return path
}

test('Should translate text', function (t) {
  t.plan(1)

  var lang = 'es-ES'
  var translations = {
    'Enter the serial number': [
      'Introduzca número de serie'
    ]
  }

  var path = makeDict(lang, translations)
  var tr = i18nify('test.hbs', {lang: lang, path: path})
  var out = ''

  tr.on('data', function (data) {
    out += data
  })

  tr.on('end', function () {
    t.equal(out, '<label data-i18n="test.hbs">Introduzca número de serie</label>')
    t.end()
  })

  tr.write('<label data-i18n>Enter the serial number</label>')
  tr.end()
})

test('Should translate attributes', function (t) {
  t.plan(1)

  var lang = 'es-ES'
  var translations = {
    'Enter the serial number': [
      'Introduzca número de serie'
    ]
  }

  var path = makeDict(lang, translations)
  var tr = i18nify('test.hbs', {lang: lang, path: path})
  var out = ''

  tr.on('data', function (data) {
    out += data
  })

  tr.on('end', function () {
    t.equal(out, '<input type="text" placeholder="Introduzca número de serie">')
    t.end()
  })

  tr.write('<input type="text" placeholder="Enter the serial number" data-i18n-attr="placeholder">')
  tr.end()
})
