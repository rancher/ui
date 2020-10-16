import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object'

export default Mixin.create({
  parseValue(value = '') {
    let fileObj = {}
    const removeMacth = value.replace(/.*<match.*>.*(\r\n|\n|\r) {2}/ig, '').replace(/(\r\n|\n|\r).*<\/match.*>/ig, '')

    const { attrs, elements, } = this.parse(removeMacth)

    const deepStrs = removeMacth.match(/<(.|\r\n|\n|\r)*<\/.*>/ig, '') || []

    const removedDeep = removeMacth.replace(/<(.|\r\n|\n|\r)*<\/.*>/ig, '')

    const myString = removedDeep.replace(/(\r\n|\n|\r)/gm, '<br />');

    const keyAndValue = myString.split('<br />').filter((f) => f !== '<br />').filter((f = '') => !f.startsWith('#') && !f.startsWith('<'))

    keyAndValue.map((item = '') => {
      const arr = item.split(' ').filter((f) => f !== '')

      if (arr[0] && arr[1]) {
        set(fileObj, (arr[0]).trim(), arr[1])
      }
    })

    fileObj = {
      ...fileObj,
      ...attrs,
      elements,
    }

    return {
      fileObj,
      deepStrs,
    }
  },

  parse(str = '') {
    const attrs = {}
    const lines = str.split('\n').map((line) => line.trim()).filter((line) => line)

    let elements = []
    let deep = false

    lines.map((line) => {
      const matchElement = line.match(/^\<([a-zA-Z0-9_]+)\s*(.+?)?\>$/)
      const matchKeyValue = line.match(/^([a-zA-Z0-9_]+)\s*(.*)$/)

      if (matchElement) {
        const elementName = matchElement[1]

        elements.push({
          elementName,
          attrs:    {},
          elements: [],
        })

        deep = true

        return
      }

      const currnetElement = elements[elements.length - 1] || {}

      if (line === `</${ get(currnetElement, 'elementName') }>`) {
        deep = false

        return
      }

      if (matchKeyValue) {
        if (deep) {
          set(get(currnetElement, 'attrs'), matchKeyValue[1], matchKeyValue[2])
        } else {
          set(attrs, matchKeyValue[1], matchKeyValue[2])
        }
      }
    })

    return {
      attrs,
      elements,
    }
  }
})