import Kink from './index.js'

const host = '@termsurf/kink'

type Base = {
  syntax_error: {
    take: {
      foo: string
    }
  }
}

type Name = keyof Base

Kink.base(
  host,
  'syntax_error',
  (take: Base['syntax_error']['take']) => ({
    code: 1,
    link: take,
    note: 'Syntax error',
  }),
)

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

export default function kink<N extends Name>(
  form: N,
  take?: Base[N]['take'],
) {
  return Kink.make(host, form, take)
}
