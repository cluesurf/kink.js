/**
 * Site module test.
 *
 * Tests the site error text formatting by throwing
 * a Kink error and a native error through the
 * uncaughtException handler.
 */

import { KinkBase } from '~/code/base'
import fs from 'fs'
import makeSiteKinkText from '.'

const host = '@cluesurf/kink'

type Base = {
  syntax_error: {
    take: {}
  }
}

const kinkBase = new KinkBase<Base>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
})

kinkBase.form('syntax_error', () => ({
  note: 'Syntax error',
}))

const ERROR = kinkBase.make()

// https://nodejs.org/api/errors.html
process.on('uncaughtException', err => {
  console.log(makeSiteKinkText(err))
})

setTimeout(() => {
  throw ERROR('syntax_error')
})

setTimeout(() => {
  fs.readFileSync('.')
})
