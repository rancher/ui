import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { get } from '@ember/object';
import { downloadFile } from 'shared/utils/download-files';

export default Component.extend(ModalBase, {
  settings:    service(),
  globalStore: service(),
  growl:       service(),

  layout,

  classNames: ['generic', 'about', 'medium-modal'],

  actions: {
    downloadLinuxImages() {
      get(this, 'globalStore').rawRequest({
        url:    `/v3/kontainerdrivers/rancher-images`,
        method: 'GET',
      }).then((res) => {
        downloadFile(`.rancher-linux-images.txt`, get(res, 'body'));
      }).catch((error) => {
        get(this, 'growl').fromError('Error downloading Linux image list', error.message);
      });
    },

    downloadWindowsImages() {
      get(this, 'globalStore').rawRequest({
        url:    `/v3/kontainerdrivers/rancher-windows-images`,
        method: 'GET',
      }).then((res) => {
        downloadFile(`.rancher-windows-images.txt`, get(res, 'body'));
      }).catch((error) => {
        get(this, 'growl').fromError('Error downloading Windows image list', error.message);
      });
    },
  }
});
