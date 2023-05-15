// Used to define limits or requests https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.25/#resourcerequirements-v1-core
import Component from '@ember/component';
import layout from './template';
import {
  computed,
  get,
} from '@ember/object';
import { parseSi } from '../../utils/parse-unit';
import { convertToMillis } from '../../utils/util';

export default Component.extend({
  layout,
  value: null,
  type:  '',
  mode:  'new',

  editing: computed.equal('mode', 'new'),

  init() {
    this._super(...arguments);
  },

  // The form displays a MiB suffix but if edited by yaml this value may have been set with other units, eg '1Gi' should be converted to 1024 (MiB)
  // https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#meaning-of-memory
  memory: computed('value', {
    get(){
      let memory = get(this.value, 'memory')

      if (!!memory){
        // parseSi returns memory in Bytes- multiply by number of Bytes in MiB
        memory = parseSi(memory, 1024) / 1048576
      }

      return memory
    },
    set(key, val){
      const out = { ...this.value }

      if (!!val){
        out.memory = `${ val }Mi`
      } else if (out.memory){
        delete out.memory
      }
      this.update(out)

      return val
    }
  }),

  // The form displays a mCPU suffix but if set in YAML this may be another unit, eg '1' (CPU) should be converted to 1000 (mCPU)
  cpu: computed('value', {
    get(){
      let cpu = get(this.value, 'cpu')

      return cpu ? convertToMillis(cpu.toString()) : null
    },
    set(key, val){
      const out = { ...this.value }

      if (!!val){
        out.cpu = `${ val }m`
      } else if (out.cpu){
        delete out.cpu
      }
      this.update(out)

      return val
    }
  }),


})