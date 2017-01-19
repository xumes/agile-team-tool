/* Helper functions that can be shared to other components */
var _ = require('underscore');
var moment = require('moment');

module.exports.setPrefixHttp = function(url) {
  var pattern = /^((http|https):\/\/)/;
  if (!pattern.test(url)) {
    url = 'http://' + url;
  }
  return url;
};

module.exports.autoAddHttp = function() {
  $('#importantLinkWrapper .implink').on('blur mouseout', function(){
    var url = module.exports.setPrefixHttp($(this).val().trim());
    $(this).val(url);
  });
};

module.exports.setFieldErrorHighlight = function(id) {
  var borderColor = 'red';
  var backgroundColor = '';
  if ($('#' + id).is('select')) {
    $($('#select2-' + id + '-container').parent()).css('border-color', borderColor);
    $($('#select2-' + id + '-container').parent()).css('background', backgroundColor);
  } else {
    $('#' + id).css('background', backgroundColor);
    $('#' + id).css('border-color', borderColor);
  }
};

module.exports.clearFieldErrorHighlight = function(id) {
  var borderColor = '';
  var backgroundColor = '';
  if ($('#' + id).is('select')) {
    $($('#select2-' + id + '-container').parent()).css('border-color', borderColor);
    $($('#select2-' + id + '-container').parent()).css('background', backgroundColor);
  } else {
    $('#' + id).css('background', backgroundColor);
    $('#' + id).css('border-color', borderColor);
  }
};

module.exports.clearLinkAndSelectFieldErrorHighlight = function() {
  $('#importantLinkWrapper .implink').each(function(idx) {
    var elem = $(this).attr('id');
    module.exports.clearFieldErrorHighlight(elem);
  });
  $('#importantLinkWrapper .implabel').each(function(idx) {
    var elem = $(this).attr('id');
    module.exports.clearFieldErrorHighlight(elem);
  });
};

module.exports.getJsonParametersFromUrl = function() {
  var query = location.search.substr(1);
  var result = {};
  query.split('&').forEach(function(part) {
    var item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
};

module.exports.showDateDDMMMYYYY = function(formatDate) {
  var newDateFormate = moment.utc(formatDate).format('DD MMM YYYY');
  return newDateFormate;
};

module.exports.showDateDDMMYYYY = function(formatDate) {
  var newDateFormate = moment.utc(formatDate).format('DDMMMYYYY');
  return newDateFormate;
};

module.exports.showDateDDMMYYYYV2 = function(formatDate, withoutSpacing) {
  var withoutSpacing = withoutSpacing || false;
  var format = 'DD MMM YYYY';
  if (!_.isEmpty(formatDate)) {
    if (withoutSpacing) {
      format = 'DDMMMYYYY';
    }
    var newDateFormate = moment(formatDate).format(format);
    return newDateFormate;
  }
};

module.exports.showDateMMDDYYYY = function(formatDate) {
  var date = new Date(formatDate.replace(/-/g, '/'));
  var month = date.getUTCMonth() + 1;
  month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
  var day = date.getUTCDate();
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  var newDateFormate = month + '/' + day + '/' + date.getUTCFullYear();
  return newDateFormate;
};

module.exports.showDateUTC = function(formatDate) {
  if (formatDate == null || formatDate == '' || formatDate == 'NaN') return 'Not available';
  //var utcTime = moment(formatDate).format('MMMM DD, YYYY, H:mm')format('MMM DD, YYYY, HH:mm (z);
  var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
  return utcTime;
};

module.exports.toLowerCase = function(s) {
  if (typeof(s) === 'string') {
    return s.toLowerCase();
  }
  return s;
};
