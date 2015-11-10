
//const duration = 500;

export default function() {
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

/*
  this.transition(
    this.matchSelector('.main-container'),
    this.use('toLeft')
  );
*/
}
