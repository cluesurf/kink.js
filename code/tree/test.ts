/**
 * Tree module test.
 *
 * Tests the tree error text rendering by throwing
 * a Kink error and a native error through the
 * uncaughtException handler.
 */

import { KinkBase } from '~/code/base'
import fs from 'fs'
import { format } from 'date-fns'
import { makeKinkText, makeBaseKinkText, TIME_FORM } from './make'

const host = '@cluesurf/kink'

type Base = {
  syntax_error: {
    take: {}
  }
}

const kinkBase = new KinkBase<Base>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
  makeTime: (time: number) => format(time, TIME_FORM),
})

kinkBase.form('syntax_error', () => ({
  note: 'Syntax error',
}))

const ERROR = kinkBase.make()

console.log('')
console.log('')
console.log('')

// https://nodejs.org/api/errors.html
process.on('uncaughtException', err => {
  if (err instanceof Error && 'host' in err) {
    console.log(makeKinkText(err as any))
  } else {
    console.log(makeBaseKinkText(err))

    console.log('')
    console.log('')
    console.log('')
  }
})

setTimeout(() => {
  throw ERROR('syntax_error')
})

setTimeout(() => {
  fs.readFileSync('.')
})
