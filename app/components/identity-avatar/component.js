import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  identity: null,
  link:     true,
  size:     35,

  classNames:        ['gh-avatar'],
  attributeBindings: ['aria-label:identity.name'],

  avatarSrc: alias('identity.avatarSrc'),
  url:       alias('identity.profileUrl'),
});
