/**
 * Main test runner.
 *
 * Exercises:
 *
 *   - Auto-increment codes across two sequentially-registered
 *     forms.
 *   - Hardcoded codes for three forms with arbitrary values
 *     (42, 1000, 9999). Codes stay stable regardless of
 *     registration order.
 *   - Thrown kinks carry the expected `code`, `form`, `host`,
 *     `note`, and `link` fields.
 *
 * Fails loudly on the first assertion mismatch.
 */

import kink, {
  AUTO_ERROR,
  hardKink,
  HARD_ERROR,
  MARK_ERROR,
} from './kink'

import { KinkList } from '~/code/base'
import '~/code/tree/test'
import '~/code/site/test'

let failures = 0

function check(name: string, actual: unknown, expected: unknown): void {
  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)
  if (actualJson !== expectedJson) {
    failures += 1
    console.error(
      `FAIL ${name}\n  expected: ${expectedJson}\n  actual:   ${actualJson}`,
    )
    return
  }
  console.log(`  ok  ${name}`)
}

// 1. Auto-increment codes: first form gets 0001, second gets 0002.
console.log('\nauto-increment codes:')
const auto1 = AUTO_ERROR('syntax_error', { foo: 'bar' })
check('syntax_error.code', auto1.code, '0001')
check('syntax_error.form', auto1.form, 'syntax_error')
check('syntax_error.host', auto1.host, '@cluesurf/kink')
check('syntax_error.note', auto1.note, 'Syntax error')
check('syntax_error.link', auto1.link, { foo: 'bar' })

const auto2 = AUTO_ERROR('missing_token', { position: 5 })
check('missing_token.code', auto2.code, '0002')
check('missing_token.form', auto2.form, 'missing_token')
check('missing_token.link', auto2.link, { position: 5 })

// 2. Hardcoded codes: forms return their own `code`, which wins
//    over the auto-increment counter. Registration order is
//    irrelevant; picking 42, 1000, 9999 should yield those codes
//    verbatim.
console.log('\nhardcoded codes:')
const hard1 = HARD_ERROR('invalid_input', { field: 'key' })
check('invalid_input.code', hard1.code, '002a')
check('invalid_input.form', hard1.form, 'invalid_input')
check('invalid_input.note', hard1.note, 'Invalid input')
check('invalid_input.link', hard1.link, { field: 'key' })

const hard2 = HARD_ERROR('network_unavailable', { operation: 'fetch' })
check('network_unavailable.code', hard2.code, '03e8')
check('network_unavailable.link', hard2.link, { operation: 'fetch' })

const hard3 = HARD_ERROR('rate_limited', { reason: 'too many' })
check('rate_limited.code', hard3.code, '270f')
check('rate_limited.link', hard3.link, { reason: 'too many' })

// 3. Thrown-then-caught preserves all fields on the kink.
console.log('\nthrow-then-catch:')
try {
  throw kink('syntax_error', { foo: 'thrown' })
} catch (e) {
  const err = e as { code: string; form: string; note: string }
  check('thrown.code', err.code, '0001')
  check('thrown.form', err.form, 'syntax_error')
  check('thrown.note', err.note, 'Syntax error')
}

try {
  throw hardKink('invalid_input', { field: 'thrown' })
} catch (e) {
  const err = e as { code: string; form: string; note: string }
  check('thrown.hard.code', err.code, '002a')
  check('thrown.hard.form', err.form, 'invalid_input')
}

// 4. Re-throwing the same form must produce the same code each
//    time — the hook is called once per throw but the code is
//    stable.
console.log('\nstability across throws:')
const a = HARD_ERROR('invalid_input', { field: 'a' }).code
const b = HARD_ERROR('invalid_input', { field: 'b' }).code
check('same-form-repeated-code', a, b)

// 5. Marks: a form declares its own status, a registry supplies
//    the fallback, and the throw site beats both.
console.log('\nhttp status marks:')
check(
  'form-declared-mark',
  MARK_ERROR('edit_conflict', { record: 'r1' }).mark,
  409,
)
check(
  'registry-fallback-mark',
  MARK_ERROR('system_error', {}).mark,
  500,
)
check(
  'throw-site-mark-wins',
  MARK_ERROR('bad_request', { field: 'slug' }, undefined, 422).mark,
  422,
)

// A registry with no mark of its own leaves the status to the
// caller rather than inventing one.
check(
  'no-mark-stays-undefined',
  AUTO_ERROR('syntax_error', { foo: 'x' }).mark,
  undefined,
)

// A list answers with the most severe status it holds.
check(
  'list-takes-highest-mark',
  new KinkList([
    MARK_ERROR('bad_request', { field: 'slug' }),
    MARK_ERROR('edit_conflict', { record: 'r1' }),
  ]).mark,
  409,
)

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`)
  process.exit(1)
}

console.log('\ndone')
