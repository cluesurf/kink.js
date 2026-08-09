/**
 * Test error definitions.
 *
 * Exercises both hook-return modes:
 *
 *   - auto-incrementing codes (no `code` field in the hook
 *     return) for backward compatibility.
 *   - hardcoded codes (explicit `code` in the hook return) for
 *     stable identifiers that survive reordering or insertion.
 *
 * Also covers the three sources of `mark`, the HTTP status: the
 * registry-wide fallback (`markKinkBase`), a form declaring its
 * own, and a throw site overriding both.
 */

import { KinkBase, type Take } from '~/code/base'

const host = '@cluesurf/kink'

export type AutoBase = {
  syntax_error: {
    take: {
      foo: string
    }
  }
  missing_token: {
    take: {
      position: number
    }
  }
}

export type HardBase = {
  invalid_input: {
    take: {
      field: string
    }
  }
  network_unavailable: {
    take: {
      operation: string
    }
  }
  rate_limited: {
    take: {
      reason: string
    }
  }
}

const autoKinkBase = new KinkBase<AutoBase>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
})

autoKinkBase.form('syntax_error', take => ({
  link: take,
  note: 'Syntax error',
  show: ['foo'],
}))

autoKinkBase.form('missing_token', take => ({
  link: take,
  note: 'Missing token at position',
  show: ['position'],
}))

const hardKinkBase = new KinkBase<HardBase>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
})

hardKinkBase.form('invalid_input', take => ({
  code: 42,
  link: take,
  note: 'Invalid input',
}))

hardKinkBase.form('network_unavailable', take => ({
  code: 1000,
  link: take,
  note: 'Network unavailable',
}))

hardKinkBase.form('rate_limited', take => ({
  code: 9999,
  link: take,
  note: 'Rate limited',
}))

export type MarkBase = {
  bad_request: {
    take: {
      field: string
    }
  }
  edit_conflict: {
    take: {
      record: string
    }
  }
  system_error: {
    take: Record<string, never>
  }
}

const markKinkBase = new KinkBase<MarkBase>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
  mark: 500,
})

// No `mark`, so this one falls back to the registry's 500.
markKinkBase.form('system_error', () => ({
  note: 'System error',
}))

markKinkBase.form('bad_request', take => ({
  link: take,
  mark: 400,
  note: 'Bad request',
}))

markKinkBase.form('edit_conflict', take => ({
  link: take,
  mark: 409,
  note: 'Concurrent edit conflict',
}))

export const AUTO_ERROR = autoKinkBase.make()
export const HARD_ERROR = hardKinkBase.make()
export const MARK_ERROR = markKinkBase.make()

type AutoName = keyof AutoBase
type HardName = keyof HardBase

export default function kink<N extends AutoName>(
  form: N,
  take?: Take<AutoBase, N>,
) {
  return AUTO_ERROR(form, take)
}

export function hardKink<N extends HardName>(
  form: N,
  take?: Take<HardBase, N>,
) {
  return HARD_ERROR(form, take)
}
