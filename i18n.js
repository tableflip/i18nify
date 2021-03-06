/*
* i18n.js - used at run-time & build-time for getext style string translation
*/
var Jed = require('jed')

module.exports = function (dict, domain) {
  return new Jed({
    domain: domain || 'messages',
    missing_key_callback: function (key) { console.warn('i18n missing key:', key) },
    locale_data: dict
  })
}
