/**
 * Built-in error definitions for the @cluesurf/kink package.
 *
 * Defines errors for API call failures, timeouts, and Zod
 * validation issues. Uses KinkBase for instance-based registry
 * with auto-incrementing codes.
 */

import { KinkBase, type Take } from '~/code/base'

export const host = '@cluesurf/kink'

type BaseZodError = {
  link: (string | number)[]
  message: string
}

type Base = {
  call_fail: {
    take: {}
  }
  call_time_meet: {
    take: {
      link: string
    }
  }
  form_fail: {
    take: BaseZodError & {
      have: string
      link: string[]
      need: string
    }
  }
  form_link_fail: {
    take: BaseZodError & {
      list: string[]
    }
  }
}

type Name = keyof Base

const kinkBase = new KinkBase<Base>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
})

kinkBase.form('call_fail', () => ({
  note: 'System unable to make request currently',
}))

kinkBase.form('call_time_meet', take => ({
  link: take,
  note: 'Request timeout',
}))

kinkBase.form('form_fail', take => ({
  link: take,
  note: 'Invalid link type',
}))

kinkBase.form('form_link_fail', take => ({
  link: take,
  note: 'Unrecognized keys in object',
}))

const ERROR = kinkBase.make()

export default function makeBase<N extends Name>(
  form: N,
  link?: Take<Base, N>,
  mark?: number,
) {
  const kink = ERROR(form, link)
  kink.mark = mark
  return kink
}
