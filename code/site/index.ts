import Kink, { KinkList } from '../base'
import { z } from 'zod'
import _ from 'lodash'
import kink, { host } from './kink'
import { makeKinkText } from '../tree'

export function isZodError<I>(
  input: any,
): input is z.SafeParseError<I> {
  return Boolean(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    input && !input.success && 'error' in input,
  )
}

export function loadKink(error: any) {
  const kink = loadKinkList(error)

  if (kink instanceof KinkList) {
    if (kink?.list.length === 1) {
      return kink.list[0]
    }
  }

  return kink
}

export function loadKinkList(error: any) {
  if (error instanceof z.ZodError) {
    return loadZodErrorJSON(error)
  } else {
    if (error instanceof KinkList) {
      error.list.forEach(error => {
        Kink.saveFill(error)
      })
      return error
    } else if (error instanceof Kink) {
      Kink.saveFill(error)
      return error
    } else if (error instanceof Error) {
      return Kink.makeBase(error, { siteCode: 500 })
    } else {
      return Kink.makeBase(new Error(error as string), {
        siteCode: 500,
      })
    }
  }
}

export function loadZodErrorJSON(error: z.ZodError) {
  return new KinkList(
    error.issues.map(error => {
      // ZodInvalidTypeIssue | ZodInvalidLiteralIssue | ZodUnrecognizedKeysIssue | ZodInvalidUnionIssue | ZodInvalidUnionDiscriminatorIssue | ZodInvalidEnumValueIssue | ZodInvalidArgumentsIssue | ZodInvalidReturnTypeIssue | ZodInvalidDateIssue | ZodInvalidStringIssue | ZodTooSmallIssue | ZodTooBigIssue | ZodInvalidIntersectionTypesIssue | ZodNotMultipleOfIssue | ZodNotFiniteIssue | ZodCustomIssue;
      switch (error.code) {
        case z.ZodIssueCode.invalid_type:
          return kink(
            'form_fail',
            {
              have: error.received,
              link: error.path.map(String),
              message: error.message,
              need: error.expected,
            },
            406,
          )
        case z.ZodIssueCode.unrecognized_keys:
          return kink(
            'form_link_fail',
            {
              link: error.path,
              list: error.keys,
              message: error.message,
            },
            406,
          )
        default: {
          const kink = new Kink({
            code: Kink.makeCode(host, 0),
            form: 'z.ZodError',
            host: host,
            note: error.message,
            time: Kink.makeTime(Date.now()),
          })
          kink.siteCode = 406
          return kink
        }
      }
    }),
  )
}

export { default } from './make'
