import Kink from '~/code/base'
import makeText from './make'

export * from './make'

export function makeBaseKinkText(kink: Error): string {
  return makeText({ ...Kink.makeBase(kink), list: [] })
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
