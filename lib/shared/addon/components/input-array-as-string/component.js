import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  value:      null,
  // pass in a class to style the input component directly
  inputClass: '',

  asString: computed('value', {
    get(){
      const { value = '' } = this;

      return typeof value === 'string' ? value : value.join(', ')
    },
    set(key, val = ''){
      const out = val.split(/,|, /g).reduce((all, s) => {
        const trimmed = s.trim()

        if (trimmed.length){
          all.push(trimmed)
        }

        return all
      }, [])

      this.set('value', out)

      return val
    }

  })
})