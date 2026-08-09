/**
 * Core Kink error class.
 *
 * Extends CustomError to provide structured errors with typed
 * properties for code, form, host, note, link, and more. Supports
 * production-safe serialization via toJSON() which only exposes
 * fields listed in `show`, and full serialization via toTestJSON()
 * for development and testing. Wraps an optional original error
 * as `base` and captures stack trace lines in `flow`.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { CustomError } from 'ts-custom-error'

/**
 * Hook that produces the core error definition from input data.
 */

export type BaseHook<T extends any = any> = (
  take?: T,
) => KinkMeshBase & Link

/**
 * Hook that enriches link data after initial creation.
 */

export type FillHook<T extends any = any, U extends any = any> = (
  take?: T,
  load?: U,
) => Link

/**
 * Full set of properties used to construct a Kink instance.
 */

export type KinkMesh = {
  base?: Error | null
  code: string
  form: string
  host: string
  link?: Link
  mark?: number
  note: string
  show?: string[]
  take?: Link
  time: string
}

/**
 * Minimal shape returned by a base hook (code number + message).
 */

export type KinkMeshBase = {
  code: number
  note: string
}

/**
 * Generic record for error context data.
 */

export type Link = Record<string, unknown>

/**
 * Hook that transforms input data into link properties.
 */

export type LoadHook<T extends any = any> = (take?: T) => Link

/**
 * Hook that formats a timestamp number into a string.
 */

export type TimeHook = (time: number) => string

/**
 * Structured error with typed properties for code, form,
 * host, note, link, and production-safe serialization.
 */

export default class Kink extends CustomError {
  /**
   * Error form identifier (e.g. 'syntax_error').
   */

  form: string

  /**
   * Host package identifier (e.g. '@cluesurf/kink').
   */

  host: string

  /**
   * Formatted error code string (e.g. '0001').
   */

  code: string

  /**
   * Human-readable error message.
   */

  note: string

  /**
   * Context data attached to the error.
   */

  link: Link

  /**
   * HTTP status a server should answer with when this error
   * reaches a request handler. Set from the form definition,
   * the registry fallback, or the throw site. Undefined when
   * none of them named a status, leaving the choice to the
   * handler.
   */

  mark?: number

  /**
   * Original error that caused this one, if any.
   */

  base: Error | null

  /**
   * Stack trace lines captured at error creation.
   */

  flow: Array<string>

  /**
   * Field names from link (plus 'base') visible in prod toJSON().
   */

  show: string[]

  /**
   * Raw input data passed when the error was created.
   * Non-enumerable to keep it out of default serialization.
   */

  take?: Link

  /**
   * Formatted timestamp string for when the error occurred.
   */

  time: string

  constructor({
    base,
    mark,
    host,
    note,
    form,
    take,
    link = {},
    code,
    show = [],
    time,
  }: KinkMesh) {
    super(note)

    Object.defineProperty(this, 'name', {
      enumerable: false,
      value: '',
      writable: true,
    })

    Object.defineProperty(this, 'take', {
      enumerable: false,
      value: take,
      writable: true,
    })

    this.time = time
    this.host = host
    this.form = form
    this.code = code
    this.note = note
    this.link = link
    this.take = take
    this.mark = mark
    this.base = base ?? null
    this.show = show
    this.flow = this.stack?.split('\n') ?? []
  }

  /**
   * Production-safe JSON serialization.
   * Returns code, form, note, time, plus only the link
   * properties named in `show` hoisted flat. If show
   * includes 'base' and a base error exists, includes
   * the base error message.
   */

  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      code: this.code,
      form: this.form,
      note: this.note,
      time: this.time,
    }

    if (this.show) {
      for (const key of this.show) {
        if (key === 'base') {
          if (this.base) {
            json.base = this.base.message
          }
        } else if (this.link && key in this.link && !(key in json)) {
          json[key] = this.link[key]
        }
      }
    }

    return json
  }

  /**
   * Full JSON serialization for development and testing.
   * Returns all Kink properties with all link properties
   * hoisted flat. Includes base error message if present.
   */

  toTestJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      code: this.code,
      form: this.form,
      host: this.host,
      note: this.note,
      time: this.time,
    }

    if (this.link) {
      for (const key in this.link) {
        json[key] = this.link[key]
      }
    }

    if (this.base) {
      json.base = this.base.message
    }

    return json
  }
}

/**
 * A collection of Kink errors, used when multiple
 * validation errors occur at once (e.g. Zod parsing).
 *
 * The list's own `mark` is the highest status among its
 * members, so a handler answering with it never reports a
 * milder status than one of the errors inside deserved. An
 * explicit `mark` overrides that.
 */

// eslint-disable-next-line sort-exports/sort-exports
export class KinkList extends Kink {
  /**
   * The individual errors in this collection.
   */

  list: Array<Kink>

  constructor(list: Array<Kink>, mark?: number) {
    super({
      code: '0000',
      form: 'list',
      host: '@cluesurf/kink',
      mark: mark ?? readListMark(list),
      note: 'A set of errors occurred.',
      time: String(Date.now()),
    })
    this.list = list
  }
}

/**
 * Highest HTTP status among a set of errors, or undefined
 * when none of them named one.
 */

function readListMark(list: Array<Kink>): number | undefined {
  let mark: number | undefined
  for (const kink of list) {
    if (
      kink.mark !== undefined &&
      (mark === undefined || kink.mark > mark)
    ) {
      mark = kink.mark
    }
  }
  return mark
}
