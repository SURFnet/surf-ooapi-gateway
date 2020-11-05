/* eslint-env mocha */

const assert = require('assert')
const {
  httpGet,
  integrationContext,
  gatewayUrl
} = require('./integration.environment.js')

integrationContext('security headers', function () {
  it('should set required SURF headers', async () => {
    const res = await httpGet(gatewayUrl('fred', '/courses'))
    const testHeaders = {
      'x-xss-protection': '1; mode-block',
      'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
      'x-frame-options': 'SAMEORIGIN',
      'x-content-type-options': 'nosniff',
      'content-security-policy': 'default-src \'self\'',
      'access-control-allow-origin': '*.surf.nl',
      'referrer-policy': 'no-referrer-when-downgrade'
    }
    Object.entries(testHeaders).forEach(([header, v]) => {
      assert.strictEqual(res.headers[header], v)
    })
  })
})
