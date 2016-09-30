$(document).ready(function() {
  // The ul element with WAI-ARIA role tablist might not be keyboard accessible.
  $('#ibm-content-nav #ibm-primary-tabs ul.ibm-tabs').attr('onkeypress', 'function mykeypress(evt){ return; }');
  // An element with WAI-ARIA role dialog is missing the following required WAI-ARIA properties: aria-labelledby
  $('#ibm-overlaywidget-sendFeedback').attr('aria-labelledby', 'ibm-overlaywidget-sendFeedback-content');

  function selectbox() {
    // The id select2-childSelectList-container specified for WAI-ARIA property aria-labelledby on element span is not valid.
    $('#nonSquadChildPageSection .select2-container--default .selection .select2-selection--single').removeAttr('aria-labelledby');

    // The id select2-parentSelectList-container specified for WAI-ARIA property aria-labelledby on element span is not valid.
    $('#assocParentPageSection .select2-container--default .selection .select2-selection--single').removeAttr('aria-labelledby');
  }

  function typeahead() {
    // All content must reside within a WAI-ARIA landmark or labelled region role.
    $('#typeahead-results').attr('role', 'region');

    // Elements containing a 'region' role must be labeled with an aria-label or aria-labelledby.
    $('#typeahead-results').attr('aria-label', 'typeahead results');

    // All content must reside within a WAI-ARIA landmark or labelled region role.
    $('#typeahead-results0').attr('role', 'region');

    // Elements containing a 'region' role must be labeled with an aria-label or aria-labelledby.
    $('#typeahead-results0').attr('aria-labelledby', 'teamMemberName');

    // The id typeahead-results0 specified for WAI-ARIA property aria-owns on element input is not valid.
    $('#teamMemberName').removeAttr('aria-owns');
  }

  setInterval(function() {
    if (typeof (FacesTypeAhead) == 'object') {
      typeahead();
    }
    selectbox();
  }, 1000);
});
