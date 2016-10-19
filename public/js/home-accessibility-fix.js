$(document).ready(function() {
  // An element with WAI-ARIA role dialog is missing the following required WAI-ARIA properties: aria-labelledby
  $('#ibm-overlaywidget-sendFeedback').attr('aria-labelledby', 'ibm-overlaywidget-sendFeedback-content');

  // $('#ibm-overlaywidget-overlayExampleLarge-content').attr('aria-describedby', 'ibm-overlaywidget-overlayExampleLarge');
  $('#ibm-overlaywidget-overlayExampleLarge').removeAttr('aria-describedby');

  // An element with WAI-ARIA role dialog is missing the following required WAI-ARIA properties: aria-labelledby.
  $('#ibm-overlaywidget-overlayExampleLarge').attr('aria-labelledby', 'teamscore-area');
});
