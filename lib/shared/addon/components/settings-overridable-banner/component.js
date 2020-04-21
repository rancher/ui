import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import $ from 'jquery';
import { set, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';


export default Component.extend({
  settings: service(),
  layout,

  classNameBindings: ['show::hide'],
  show:              false,
  backgroundColor:   null,
  textColor:         null,

  didReceiveAttrs() {
    const { model = {} } = this;
    const {
      background, textColor, text: bannerText
    } = model;

    if (background) {
      $(this.element).css({ 'background-color': background });
    }

    if (textColor) {
      $(this.element).css({ color: textColor });
    }

    if (bannerText) {
      set(this, 'bannerText', bannerText);
    }
  },

  bannerText: computed('model.text', function() {
    const { model = {} } = this;
    const { text = '' } = model;

    return htmlSafe(text);
  }),
});
