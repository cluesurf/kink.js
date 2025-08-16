import kink from './kink'
import './tree.test'

try {
  throw kink('syntax_error', { foo: 'bar' })
} catch (e) {
  console.log(e)
}

console.log('done')
