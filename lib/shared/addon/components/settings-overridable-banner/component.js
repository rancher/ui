import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import $ from 'jquery';
import { set } from '@ember/object';


export default Component.extend({
  settings: service(),
  layout,

  classNameBindings: ['show::hide'],
  show:              false,
  backgroundColor:   null,
  textColor:         null,
  bannerText:        alias('model.text'),

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
});
