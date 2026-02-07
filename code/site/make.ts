/**
 * Site error text formatter.
 *
 * Converts any caught error into formatted text output
 * using the tree rendering module.
 */

import { KinkList } from '../base'
import { loadKink } from '.'
import { makeKinkText } from '../tree'

export default function makeSiteKinkText(error: unknown) {
  const kink = loadKink(error)
  const text: Array<string> = []
  if (kink instanceof KinkList) {
    text.push(makeKinkText(kink))
    kink.list.forEach(kink => {
      text.push(makeKinkText(kink))
    })
  } else if (kink) {
    text.push(makeKinkText(kink))
  }
  return text.join('\n')
}
