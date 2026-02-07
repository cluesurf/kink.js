/**
 * Browser tree rendering without source map support.
 *
 * Renders Kink errors as formatted text for browser
 * environments where source maps are not available.
 */

import Kink from '~/code/base'
import makeText from './make'

export * from './make'

export function makeBaseKinkText(kink: Error): string {
  return makeText({
    code:
      'code' in kink && typeof kink.code === 'string'
        ? kink.code
        : '0000',
    host: 'browser',
    list: kink.stack?.split('\n') ?? [],
    note: kink.message,
    time: String(Date.now()),
  })
}

export function makeKinkText(kink: Kink): string {
  return makeText({
    code: kink.code,
    host: kink.host,
    list: kink.stack?.split('\n') ?? [],
    note: kink.note,
    time: kink.time,
  })
}

export { makeText }
