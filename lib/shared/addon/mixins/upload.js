import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import $ from 'jquery';

export default Mixin.create({
  growl: service(),

  actions: {
    upload() {
      $(this.element).find('INPUT[type=file]').click();
    },
  },

  change(event) {
    const input = event.target;

    if ( input.files && input.files[0] ) {
      let file = input.files[0];

      const reader = new FileReader();

      reader.onerror = (err) => {
        get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
      };

      reader.onload = (event2) => {
        const out = event2.target.result;

        this.send(get(this, 'uploadAction'), out);
        input.value = '';
      };
      reader.readAsText(file);
    }
  }
});
