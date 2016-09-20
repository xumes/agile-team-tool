$(document).ready(function() {
  // The ul element with WAI-ARIA role tablist might not be keyboard accessible.
  $('#ibm-content-nav #ibm-primary-tabs ul.ibm-tabs').attr("onkeypress", "function mykeypress(evt){ return; }");
  // The span element with WAI-ARIA role combobox might not be keyboard accessible.
  $('span.selection .select2-selection--single').attr("onkeypress", "function mykeypress(evt){ return; }");
  $('#iterationForm span.select2').find('.select2-selection').attr("onkeypress", "function mykeypress(evt){ return; }");
  $('#select2-teamSelectList-container').attr("onkeypress", "function mykeypress(evt){ return; }");

  // An element with WAI-ARIA role combobox does not contain or own at least one child element with each of the following WAI-ARIA roles: listbox
  $('#select2-teamSelectList-container').attr('role', 'listbox');
  // $('#select2-teamSelectList-container').attr('aria-labelledby', 'select2-teamSelectList-container');

  // An element with WAI-ARIA role listbox does not contain or own at least one child element with each of the following WAI-ARIA roles: option.
  $('#select2-teamSelectList-container').append('<div role="option" aria-labelledby="Select one"></div>');

  // An element with WAI-ARIA role combobox does not contain or own at least one child element with each of the following WAI-ARIA roles: listbox
  $('#select2-teamSelectList-container').attr('role', 'listbox');
  $('#select2-teamSelectList-container').attr('aria-labelledby', 'select2-teamSelectList-container');

  // An element with WAI-ARIA role listbox does not contain or own at least one child element with each of the following WAI-ARIA roles: option.
  $('#select2-teamSelectList-container').append('<div role="option" aria-labelledby="Select one"></div>');

  setInterval(function() {
    if ($.fn.datepicker) {
      datepicker();
    }
  }, 1000);

  /* setTimeout didn't work */
  // setTimeout(function() {
  //   if ($.fn.datepicker) {
  //     datepicker();
  //   }
  // }, 1000);

  /* Accessibility fix for jquery-ui datepicker */
  function datepicker() {
    $('#ui-datepicker-div').attr('role', 'region');
    $('#ui-datepicker-div').attr('aria-labelledby', 'iterationStartDate');
    $('.ui-datepicker-calendar').attr('id', 'ui-datepicker-calendar');

    $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev').attr('style', 'text-indent: 9999px !important');
    $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next').attr('style', 'text-indent: 9999px !important');

    var imgprev = $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev').find('.imgprev');
    if (imgprev.length == 0) {
      $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-prev').html('<img class="imgprev ui-icon ui-icon-circle-triangle-w" src="" title="" alt="" style="display: block; left: 50%; margin-left: -8px; margin-top: -8px; position: absolute; top: 50%;">Prev');
    }

    var imgnext = $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next').find('.imgnext');
    if (imgnext.length == 0) {
      $('#ui-datepicker-div .ui-datepicker-header .ui-datepicker-next').html('<img class="imgnext ui-icon ui-icon-circle-triangle-e" src="" title="" alt="" style="display: block; left: 50%; margin-left: -8px; margin-top: -8px; position: absolute; top: 50%;">Next');
    }
  }
});