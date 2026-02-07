/**
 * Main test runner.
 *
 * Imports sub-tests and exercises the error factory
 * to verify basic functionality.
 */

import kink from './kink'

import '~/code/tree/test'
import '~/code/site/test'

try {
  throw kink('syntax_error', { foo: 'bar' })
} catch (e) {
  console.log(e)
}

console.log('done')
