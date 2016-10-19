$(document).ready(function() {
  // The ul element with WAI-ARIA role tablist might not be keyboard accessible.
  $('#ibm-content-nav #ibm-primary-tabs ul.ibm-tabs').attr('onkeypress', 'function mykeypress(evt){ return; }');
  // An element with WAI-ARIA role dialog is missing the following required WAI-ARIA properties: aria-labelledby
  $('#ibm-overlaywidget-sendFeedback').attr('aria-labelledby', 'ibm-overlaywidget-sendFeedback-content');
  // The span element with WAI-ARIA role combobox might not be keyboard accessible.
  $('#createTeamForm .selection .select2-selection--single').attr('onkeypress', 'function mykeypress(evt){ return; }');
});
