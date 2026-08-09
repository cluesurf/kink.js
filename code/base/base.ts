/**
 * Instance-based error registry.
 *
 * Each KinkBase instance manages its own set of error formBase
 * for a specific host package. Error codes may be hardcoded per
 * form (by returning `code` from the form's hook) or left to
 * auto-increment in registration order. Call form() to register
 * each error, then call make() to get a typed factory function
 * that creates Kink instances. Replaces the old static
 * Kink.base() / Kink.make() / Kink.code() pattern with isolated,
 * multi-instance registries.
 *
 * Each form may also declare a `mark`, the HTTP status a server
 * should answer with when that error escapes to a request
 * handler. It resolves in this order, first one wins:
 *
 *   1. the `mark` passed at the throw site,
 *   2. the `mark` returned by the form's hook,
 *   3. the registry-wide `mark` given to the constructor.
 *
 * When none of the three is set, `mark` stays undefined and the
 * caller decides the status.
 */

import Kink, { type Link } from './kink'

/**
 * Default time formatter, returns the timestamp as a string.
 */

const DEFAULT_TIME_FORMATTER = (time: number) => String(time)

/**
 * Extract the take type from a Base entry.
 */

export type Take<
  B extends Record<string, { take?: Record<string, unknown> }>,
  N extends keyof B & string,
> = B[N] extends { take: infer T } ? T : never

/**
 * Valid show keys for a Base entry. Includes all string keys
 * from the take type plus the special 'base' key for
 * showing the original error.
 */

type ShowName<
  B extends Record<string, { take?: Record<string, unknown> }>,
  N extends keyof B & string,
> = B[N] extends { take: infer T extends Record<string, unknown> }
  ? (keyof T & string) | 'base'
  : 'base'

/**
 * Shape returned by a form's registration hook. `code` is
 * optional; when present it overrides the auto-increment
 * counter and is used verbatim (after `makeCode` formatting)
 * on every thrown instance of this form. `mark` is the HTTP
 * status this form maps to, applied to every instance unless
 * the throw site passes its own.
 */

type FormHookResult = {
  code?: number
  link?: unknown
  mark?: number
  note: string
  show?: string[]
}

/**
 * Internal storage for a registered error definition. `code`
 * here is the auto-increment fallback used when the hook does
 * not return its own `code`.
 */

type FormDefinition = {
  code: number
  hook: (take: unknown) => FormHookResult
}

/**
 * Instance-based error registry for a specific host package.
 * Manages error formBase with hardcoded or auto-incrementing
 * codes and produces typed factory functions for creating Kink
 * errors.
 */

export default class KinkBase<
  Base extends Record<string, { take?: Record<string, unknown> }>,
> {
  /**
   * Host package identifier (e.g. '@cluesurf/errors').
   */

  private host: string

  /**
   * Formats a numeric code into a string (e.g. hex padded).
   */

  private makeCode: (code: number) => string

  /**
   * Formats a timestamp number into a display string.
   */

  private makeTime: (time: number) => string

  /**
   * Map of error form names to their formBase.
   */

  private formBase: Map<string, FormDefinition> = new Map()

  /**
   * Registry-wide HTTP status fallback, used for forms whose
   * hook does not return its own `mark`. Undefined when the
   * registry has no opinion about status.
   */

  private mark?: number

  /**
   * Next auto-incrementing code number. Used only for forms
   * whose hook does NOT return a `code` field.
   */

  private nextCode: number = 1

  constructor({
    host,
    makeCode,
    makeTime,
    mark,
  }: {
    host: string
    makeCode: (code: number) => string
    makeTime?: (time: number) => string
    mark?: number
  }) {
    this.host = host
    this.makeCode = makeCode
    this.makeTime = makeTime ?? DEFAULT_TIME_FORMATTER
    this.mark = mark
  }

  /**
   * Register an error definition. The hook receives the input
   * data and returns note, optional code (hardcoded), optional
   * link, optional mark (HTTP status), and optional show list.
   * The show list is typed to only accept keys from the take
   * type or 'base'. When the hook omits `code`, an
   * auto-incrementing fallback is used based on registration
   * order. When it omits `mark`, the registry-wide fallback
   * applies.
   */

  form<N extends keyof Base & string>(
    name: N,
    hook: (take: Take<Base, N>) => {
      code?: number
      link?: Take<Base, N>
      mark?: number
      note: string
      show?: Array<ShowName<Base, N>>
    },
  ): this {
    this.formBase.set(name, {
      code: this.nextCode++,
      hook: hook as FormDefinition['hook'],
    })
    return this
  }

  /**
   * Return a typed error factory function. The factory accepts
   * a form name, optional input data, optional original error,
   * and an optional `mark` that overrides the status the form
   * declared. Creates and returns a Kink instance with all
   * properties set.
   */

  make(): <N extends keyof Base & string>(
    form: N,
    take?: Take<Base, N>,
    base?: Error,
    mark?: number,
  ) => Kink {
    return <N extends keyof Base & string>(
      form: N,
      take?: Take<Base, N>,
      base?: Error,
      mark?: number,
    ): Kink => {
      const definition = this.formBase.get(form)
      if (!definition) {
        throw new Error(`Missing ${this.host}:${form} in KinkBase`)
      }

      const result = definition.hook(take)
      const time = this.makeTime(Date.now())
      // A hardcoded `code` returned by the hook wins over the
      // auto-increment fallback stored on the definition.
      const codeNumber = result.code ?? definition.code
      const code = this.makeCode(codeNumber)

      return new Kink({
        base: base ?? null,
        code,
        form,
        host: this.host,
        link: (result.link ?? take ?? {}) as Link,
        // Throw site beats the form, the form beats the registry.
        mark: mark ?? result.mark ?? this.mark,
        note: result.note,
        show: result.show,
        take: take as Link,
        time,
      })
    }
  }
}
