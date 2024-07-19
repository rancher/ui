import { get, set, computed, observer } from '@ember/object';
import Component from '@ember/component';
import layout from './template';
import VolumeSource from 'shared/mixins/volume-source';

const formats = [
  'json',
  'apache2',
  'nginx',
  'rfc3164',
  'rfc5424',
  'none',
].map((value) => ({
  value,
  label: value,
}));

export default Component.extend(VolumeSource, {
  layout,
  formats,
  useCustomRegex: false,
  cachedFormat:   null,

  field:               'flexVolume',
  initialCustomFormat: null,

  init() {
    this._super(...arguments);
    const format = get(this, 'config.options.format');

    if (formats.every((item) => item.value !== format)) {
      set(this, 'useCustomRegex', true);
      set(this, 'initialCustomFormat', format);
    }
  },

  actions: {
    remove() {
      if (this.remove) {
        this.remove(this.model);
      }
    },
    useCustomRegex() {
      set(this, 'useCustomRegex', !this.useCustomRegex);
    },
  },
  useCustomRegexChange: observer('useCustomRegex', function() {
    const useCustomRegex = this.useCustomRegex;

    if (useCustomRegex) {
      set(this, 'cachedFormat', get(this, 'config.options.format'));
      set(this, 'config.options.format', this.initialCustomFormat);
    } else {
      set(this, 'config.options.format', this.cachedFormat);
    }
  }),

  firstMount: computed('mounts.[]', function() {
    return this.mounts.get('firstObject');
  }),

});
