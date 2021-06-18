import Application from 'ui/app';
import config from 'ui/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import manifest from 'ui/config/asset-manifest';

setApplication(Application.create(config.APP));

setup(QUnit.assert);
preloadAssets(manifest).then(start); // This ensures all engine resources are loaded before the tests
