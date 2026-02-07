/**
 * Instance-based error registry.
 *
 * Each KinkBase instance manages its own set of error formBase
 * for a specific host package. Error codes auto-increment within
 * the registry. Call form() to register error formBase, then
 * call make() to get a typed factory function that creates Kink
 * instances. Replaces the old static Kink.base() / Kink.make()
 * / Kink.code() pattern with isolated, multi-instance registries.
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
 * Internal storage for a registered error definition.
 */

type FormDefinition = {
  code: number
  hook: (take: unknown) => {
    link?: unknown
    note: string
    show?: string[]
  }
}

/**
 * Instance-based error registry for a specific host package.
 * Manages error formBase with auto-incrementing codes and
 * produces typed factory functions for creating Kink errors.
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
   * Next auto-incrementing code number.
   */

  private nextCode: number = 1

  constructor({
    host,
    makeCode,
    makeTime,
  }: {
    host: string
    makeCode: (code: number) => string
    makeTime?: (time: number) => string
  }) {
    this.host = host
    this.makeCode = makeCode
    this.makeTime = makeTime ?? DEFAULT_TIME_FORMATTER
  }

  /**
   * Register an error definition. The hook receives the input
   * data and returns note, optional link, and optional show
   * list. The show list is typed to only accept keys from the
   * take type or 'base'. Error codes auto-increment in
   * registration order.
   */

  form<N extends keyof Base & string>(
    name: N,
    hook: (take: Take<Base, N>) => {
      link?: Take<Base, N>
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
   * a form name, optional input data, and optional original error.
   * Creates and returns a Kink instance with all properties set.
   */

  make(): <N extends keyof Base & string>(
    form: N,
    take?: Take<Base, N>,
    base?: Error,
  ) => Kink {
    return <N extends keyof Base & string>(
      form: N,
      take?: Take<Base, N>,
      base?: Error,
    ): Kink => {
      const definition = this.formBase.get(form)
      if (!definition) {
        throw new Error(
          `Missing ${this.host}:${form} in KinkBase`,
        )
      }

      const result = definition.hook(take)
      const time = this.makeTime(Date.now())
      const code = this.makeCode(definition.code)

      return new Kink({
        base: base ?? null,
        code,
        form,
        host: this.host,
        link: (result.link ?? take ?? {}) as Link,
        note: result.note,
        show: result.show,
        take: take as Link,
        time,
      })
    }
  }
}
