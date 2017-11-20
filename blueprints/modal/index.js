module.exports = {
  description: 'Rancher specific modal',

  locals: function(options) {
    // Return custom template variables here.
    return {
      // options are large-modal or medium-modal
      size: options.size || 'medium-modal'
    };
  }

  // afterInstall: function(options) {
  //   // Perform extra work here.
  // }
};
