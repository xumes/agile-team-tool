$(document).ready(function() {
  // An element with WAI-ARIA role dialog is missing the following required WAI-ARIA properties: aria-labelledby
  $('#ibm-overlaywidget-sendFeedback').attr('aria-labelledby', 'ibm-overlaywidget-sendFeedback-content');

});
