<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>@cluesurf/kink</h3>
<p align='center'>
  Standard Error Creation in TypeScript
</p>

<br/>
<br/>
<br/>

## Installation

```
pnpm add @cluesurf/kink
yarn add @cluesurf/kink
npm i @cluesurf/kink
```

## Example

```ts
import { KinkBase, type Take } from '@cluesurf/kink'

const host = '@cluesurf/kink'

type Base = {
  syntax_error: {
    take: {
      line: number
    }
  }
  record_missing: {
    take: {
      id: string
    }
  }
}

type Name = keyof Base

const kinkBase = new KinkBase<Base>({
  host,
  makeCode: (code: number) => code.toString(16).padStart(4, '0'),
  // Status used by any form below that does not name its own.
  mark: 500,
})

kinkBase.form('syntax_error', take => ({
  code: 1,
  link: take,
  note: 'Syntax error',
}))

kinkBase.form('record_missing', take => ({
  code: 2,
  link: take,
  mark: 404,
  note: 'Record not found',
}))

const ERROR = kinkBase.make()

export default function kink<N extends Name>(
  form: N,
  take?: Take<Base, N>,
) {
  return ERROR(form, take)
}
```

```ts
import kink from './example.js'

try {
  throw kink('syntax_error', { line: 12 })
} catch (e) {
  console.log(e)
}
```

## Status codes

Every error carries an optional `mark`, the HTTP status a server
should answer with when the error reaches a request handler. It
resolves in this order, first one wins:

1. the `mark` passed at the throw site,
2. the `mark` returned by the form's hook,
3. the `mark` given to the `KinkBase` constructor.

When none of the three is set, `mark` stays undefined and the
handler picks the status.

```ts
// 404, from the form definition.
throw ERROR('record_missing', { id })

// 410 this one time, overriding the form.
throw ERROR('record_missing', { id }, undefined, 410)
```

The third argument is the original error being wrapped, kept on
the new error as `base`.

A `KinkList` takes the highest `mark` among its members, so
answering with the list's status never reports something milder
than one of the errors inside deserved.

## Tree

<p align='center'>
  <img src='https://github.com/cluesurf/kink-tree.js/blob/make/view/kink.png?raw=true' width='520'/>
</p>

## License

MIT

## ClueSurf

Made by [ClueSurf](https://clue.surf), meditating on the universe ¤.
Follow the work on [YouTube](https://youtube.com/@cluesurf),
[X](https://x.com/cluesurf),
[Instagram](https://instagram.com/cluesurf),
[Substack](https://cluesurf.substack.com),
[Facebook](https://facebook.com/cluesurf), and
[LinkedIn](https://linkedin.com/company/cluesurf), and browse more of
our open-source work here on [GitHub](https://github.com/cluesurf).
