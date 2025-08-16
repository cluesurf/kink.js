import { KinkList } from '~/'
import { loadKink } from '.'
import { makeKinkText } from '~/code/tree'

export default function makeSiteKinkText(error: any) {
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
