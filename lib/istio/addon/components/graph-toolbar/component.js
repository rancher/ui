import Component from '@ember/component';
import layout from './template';
import { get } from '@ember/object';

const ZOOM_STEP = 0.2;

export default Component.extend({
  layout,

  tagName:   '',

  actions: {
    zoomIn() {
      this.zoom(ZOOM_STEP);
    },

    zoomOut() {
      this.zoom(-ZOOM_STEP);
    },
  },

  zoom(step) {
    const cy = get(this, 'cy')

    if (cy) {
      cy.zoom({
        level:            cy.zoom() * (1 + step),
        renderedPosition: {
          x: cy.container().offsetWidth / 2,
          y: cy.container().offsetHeight / 2
        }
      });
    }
  }
});
