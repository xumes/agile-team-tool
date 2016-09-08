jQuery(function($) {
  $(document).ready(function() {
    $('#reportingNote').text('Show numbers of squad teams created, iterations completed, or maturity assessments submitted in the Agile Team Tool for a given eriod of time.');

    $('#reportStartDate').datepicker({
      maxDate: 0,
      dateFormat: 'ddMyy'
    });
    $('#reportStartDate').datepicker('option', 'dateFormat', 'ddMyy');

    $('#reportEndDate').datepicker({
      maxDate: 0,
      dateFormat: 'ddMyy'
    });
    $('#reportEndDate').datepicker('option', 'dateFormat', 'ddMyy');

  });

});
