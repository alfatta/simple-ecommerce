const pjson = require('../package.json')

module.exports = (code, message, data = null, meta = null) => {
  const response = {
    code: code ? 'SUCCESS' : 'ERROR',
    message, data, meta
  }

  if (!response.meta) response.meta = {}
  response.meta.version = pjson.version

  return response
}