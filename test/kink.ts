/**
 * Test error definitions.
 *
 * Demonstrates the KinkBase pattern for defining typed errors
 * with a factory function.
 */

import { KinkBase, type Take } from '~/code/base'

const host = '@cluesurf/kink'

type Base = {
  syntax_error: {
    take: {
      foo: string
    }
  }
}

type Name = keyof Base

const kinkBase = new KinkBase<Base>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
})

kinkBase.form('syntax_error', take => ({
  link: take,
  note: 'Syntax error',
  show: ['foo'],
}))

const ERROR = kinkBase.make()

export default function kink<N extends Name>(
  form: N,
  take?: Take<Base, N>,
) {
  return ERROR(form, take)
}
