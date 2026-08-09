/**
 * Site-level error handling utilities.
 *
 * Provides Zod error integration, converting ZodError instances
 * into structured Kink errors. Also provides loadKink/loadKinkList
 * for normalizing any caught error into a Kink instance.
 *
 * Every error produced here carries a `mark`, the HTTP status a
 * handler should answer with. Zod issues are 406, a plain Error
 * of unknown origin is 500, and a KinkList takes the highest
 * status of its members.
 */

import Kink, { KinkList } from '../base'
import { z } from 'zod'
import kink, { host } from './kink'
import { makeKinkText } from '../tree'

export function isZodError<I>(
  input: unknown,
): input is z.ZodSafeParseError<I> {
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    input &&
    !(input as Record<string, unknown>).success &&
    'error' in (input as Record<string, unknown>),
  )
}

export function loadKink(error: unknown) {
  const result = loadKinkList(error)

  if (result instanceof KinkList) {
    if (result?.list.length === 1) {
      return result.list[0]
    }
  }

  return result
}

export function loadKinkList(error: unknown) {
  if (error instanceof z.ZodError) {
    return loadZodErrorJSON(error)
  } else {
    if (error instanceof KinkList) {
      return error
    } else if (error instanceof Kink) {
      return error
    } else if (error instanceof Error) {
      return makeBaseKink(error, { mark: 500 })
    } else {
      return makeBaseKink(new Error(error as string), {
        mark: 500,
      })
    }
  }
}

/**
 * Convert a generic Error into a system_error Kink.
 * Used as a fallback when the error is not already a Kink.
 */

function makeBaseKink(
  error: Error,
  { mark }: { mark?: number } = {},
): Kink {
  const time = String(Date.now())
  return new Kink({
    base: error,
    code:
      'code' in error
        ? typeof error.code === 'string'
          ? error.code
          : '0000'
        : '0000',
    form: 'system_error',
    host: 'system',
    mark,
    note: error.message,
    time,
  })
}

export function loadZodErrorJSON(error: z.ZodError) {
  return new KinkList(
    error.issues.map(issue => {
      const err = issue as unknown as Record<string, unknown>
      switch (issue.code) {
        case z.ZodIssueCode.invalid_type:
          return kink('form_fail', {
            have: err.received as string,
            link: issue.path.map(x => String(x)),
            message: issue.message,
            need: err.expected as string,
          })
        case z.ZodIssueCode.unrecognized_keys:
          return kink('form_link_fail', {
            link: issue.path.map(x => String(x)) as (string | number)[],
            list: err.keys as string[],
            message: issue.message,
          })
        default: {
          const time = String(Date.now())
          return new Kink({
            code: '0000',
            form: 'z.ZodError',
            host: host,
            mark: 406,
            note: issue.message,
            time,
          })
        }
      }
    }),
  )
}

export { default } from './make'
