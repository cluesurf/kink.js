import Kink from '~/'
import fs from 'fs'
import makeSiteKinkText from './index'

const host = '@cluesurf/kink-site'

type Base = {
  syntax_error: {}
}

type Name = keyof Base

Kink.base(host, 'syntax_error', () => ({
  code: 1,
  note: 'Syntax error',
}))

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

export default function kink<N extends Name>(form: N, link?: Base[N]) {
  return Kink.make(host, form, link)
}

// https://nodejs.org/api/errors.html
process.on('uncaughtException', err => {
  console.log(makeSiteKinkText(err))
})

setTimeout(() => {
  throw kink('syntax_error')
})

setTimeout(() => {
  fs.readFileSync('.')
})
