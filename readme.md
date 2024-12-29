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
import Kink from '@cluesurf/kink'

const host = '@cluesurf/kink'

type Base = {
  syntax_error: {}
}

type Name = keyof Base

Kink.base(host, 'syntax_error', () => ({
  code: 1,
  note: 'Syntax error',
}))

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

export default function kink<N extends Name>(form: N, link?: Base[N]) {
  return new Kink(Kink.makeBase(host, form, link))
}
```

```ts
import kink from './example.js'

try {
  throw kink('syntax_error')
} catch (e) {
  console.log(e)
}
```

## License

MIT

## ClueSurf

This is being developed by the folks at [ClueSurf](https://clue.surf), a
California-based project for helping humanity master information and
computation. Find us on [Twitter](https://twitter.com/cluesurf),
[LinkedIn](https://www.linkedin.com/company/cluesurf), and
[Facebook](https://www.facebook.com/cluesurf). Check out our other
[GitHub projects](https://github.com/cluesurf) as well!
