/* Helper functions that can be shared to other components */
var _ = require('underscore');
var moment = require('moment');
var api = require('./api.jsx');

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
  return moment.utc(date).format('MM/DD/YYYY');

  // var month = date.getUTCMonth() + 1;
  // month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
  // var day = date.getUTCDate();
  // day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  // var newDateFormate = month + '/' + day + '/' + date.getUTCFullYear();
  // return newDateFormate;
};

module.exports.showDateUTC = function(formatDate) {
  if (formatDate == null || formatDate == '' || formatDate == 'NaN') return 'Not available';
  //var utcTime = moment(formatDate).format('MMMM DD, YYYY, H:mm')format('MMM DD, YYYY, HH:mm (z);
  var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
  return utcTime;
};

/**
 * Updates the HTML select element options based on the values passed in the parameter.
 *
 * @param elementId - HTML select element id
 * @param listOption - array of [value, description] options
 * @param firstOption - [value, description] to show as the first option
 * @param lastOption - [value, description] to show as the last option
 * @param selectedOption - value or description of the selected option to default
 */
module.exports.setSelectOptions = function(elementId, listOption, firstOption, lastOption, selectedOption) {
  $('#' + elementId).empty();
  var selectedText = '';
  var option = document.createElement('option');
  if (firstOption != undefined) {
    option.setAttribute('value', firstOption[0]);
    if (firstOption[0] == selectedOption || firstOption[1] == selectedOption) {
      option.setAttribute('selected', 'selected');
      selectedText = firstOption[1];
    }
    option.appendChild(document.createTextNode(firstOption[1]));
    $('#' + elementId).append(option);

  } else {
    option.setAttribute('value', '');
    if (selectedOption == '' || selectedOption == null) {
      option.setAttribute('selected', 'selected');
      selectedText = 'Select one';
    }
    option.appendChild(document.createTextNode('Select one'));
    $('#' + elementId).append(option);
  }

  if (listOption != undefined) {
    for (var i = 0; i < listOption.length; i++) {
      option = document.createElement('option');
      if (listOption[i][0] == selectedOption || listOption[i][1] == selectedOption) {
        option.setAttribute('value', listOption[i][0]);
        option.setAttribute('selected', 'selected');
        option.appendChild(document.createTextNode(listOption[i][1]));
        selectedText = listOption[i][1];
      } else {
        option.setAttribute('value', listOption[i][0]);
        option.appendChild(document.createTextNode(listOption[i][1]));
      }

      $('#' + elementId).append(option);
    }
  }

  if (lastOption != undefined) {
    option = document.createElement('option');
    option.setAttribute('value', lastOption[0]);
    if (lastOption[0] == selectedOption || lastOption[1] == selectedOption) {
      option.setAttribute('selected', 'selected');
      selectedText = lastOption[1];
    }
    option.appendChild(document.createTextNode(lastOption[1]));
    $('#' + elementId).append(option);

  }
  //IBMCore.common.widget.selectlist.init("#" + elementId);
  //$("#" + elementId).trigger("change");
  //alert("defaulting value to : " + selectedText);
  $('#select2-' + elementId + '-container').text(selectedText);
  $('#select2-' + elementId + '-container').attr('title', selectedText);
  $('#' + elementId).attr('aria-label',elementId);
};

module.exports.handleIterationErrors = function (errorResponse) {
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){
        // Return iteration errors as String
        errorlist = this.getIterationErrorPopup(errors);
        if (!_.isEmpty(errorlist)) {
          alert(errorlist);
        }
      }
      else {
        this.setFieldErrorHighlight(response.error.path);
        alert(response.error.message);
      }
    }
};

 module.exports.getIterationErrorPopup = function(errors) {
  var errorLists = '';
  var self = this;
  // Model fields/Form element field
  var fields = [
    'name',
    'startDate',
    'endDate',
    'committedStories',
    'committedStoryPoints',
    'personDaysUnavailable',
    'deliveredStories',
    'storyPointsDelivered',
    'deployments',
    'defectsStartBal',
    'defects',
    'defectsClosed',
    'defectsEndBal',
    'cycleTimeWIP',
    'cycleTimeInBacklog',
    'memberChanged',
    'clientSatisfaction',
    'teamSatisfaction'
  ];

  _.each(fields, function(mdlField, index) {
    if (errors[mdlField]) {
      self.setFieldErrorHighlight(mdlField);
      errorLists = errorLists + errors[mdlField].message + '\n';
    } else {
      self.clearFieldErrorHighlight(mdlField);
    }
  });
    return errorLists;
  };

module.exports.clearHighlightedIterErrors = function () {
  var self = this;
  var fields = [
      'name',
      'startDate',
      'endDate',
      'committedStories',
      'committedStoryPoints',
      'personDaysUnavailable',
      'deliveredStories',
      'storyPointsDelivered',
      'deployments',
      'defectsStartBal',
      'defects',
      'defectsClosed',
      'defectsEndBal',
      'cycleTimeWIP',
      'cycleTimeInBacklog',
      'memberChanged',
      'clientSatisfaction',
      'teamSatisfaction'
    ];

    _.each(fields, function(field, index) {
      self.clearFieldErrorHighlight(field);
    });
  };

module.exports.toTitleCase = function(str) {
  if (_.isEmpty(str)) return '';
  var strArray = str.toUpperCase().split(',');
  if (strArray.length < 3) {
    return str.toUpperCase();
  } else {
    strArray[0] = strArray[0].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    return strArray.join(', ');
  }
};

module.exports.numericValue = function(data) {
    var value = parseInt(data);
    if (!isNaN(value)) {
      return value;
    }
    else {
      return 0;
    }
  };

module.exports.getOptimumAvailability = function(maxWorkDays, teamId){
  var self = this;
  return new Promise(function(resolve, reject){
    api.loadTeam(teamId)
      .then(function(team){
        var members = self.getTeamMembers(team);
        var availability = 0;      
        _.each(members, function(member){
          var allocation =  member.allocation/100;
          var avgWorkWeek = (member.workTime != null ? self.numericValue(member.workTime) : 100 )/100;
          availability += (allocation * avgWorkWeek * maxWorkDays);
        });
        return resolve(availability.toFixed(2));
      })
      .catch(function(err){
        return reject(err);
      });
   });
  };

module.exports.getTeamMembers = function(team){
    var teamMembers = [];
    if (!_.isEmpty(team) && team.members) {
      _.each(team.members, function(member) {
        var temp = _.find(teamMembers, function(item){
          if( item.userId === member.userId)
            return item;
        });
        if (temp === undefined) {
          teamMembers.push(member);
        }
      });
    }
    return teamMembers;
  };