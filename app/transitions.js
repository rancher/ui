
export default function() {
  /*
  this.transition(
    this.fromRoute('containers.index'),
    this.toRoute('container'),
    this.use('toLeft'),
    this.reverse('toRight')
  );
  */

  this.transition(
    this.inHelper('liquid-modal'),
    this.toValue(true),
    this.use('explode', {
      pick: '.lf-overlay',
      use: ['cross-fade', { maxOpacity: 0.5 }]
    }, {
      pick: '.lm-container',
      use: 'toDown'
    }),

    this.reverse('explode', {
      pick: '.lf-overlay',
      use: ['cross-fade', { maxOpacity: 0.5 }]
    }, {
      pick: '.lm-container',
      use: 'toUp'
    })
  );
}
