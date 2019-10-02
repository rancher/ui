/* eslint-env node */
module.exports = {
  test_page:             'tests/index.html?hidepassed',
  disable_watching:      true,
  launch_in_ci:          [
    'Chrome'
  ],
  launch_in_dev: [
  ],
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        '--no-sandbox',
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=9222',
        '--window-size=1440,900',
        '--ignore-certificate-errors',
        '--enable-features=NetworkService'
      ].filter(Boolean)
    },
  }
};
