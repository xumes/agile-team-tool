// common javascript utilities
function getMin(array) {
  return Math.min.apply(Math, array);
}

function getMax(array) {
  return Math.max.apply(Math, array);
}

function setFieldErrorHighlight(id) {
  var borderColor = 'red';
  var backgroundColor = '';

  if ($('#' + id).is('select')) {
    $($('#select2-' + id + '-container').parent()).css('border-color', borderColor);
    $($('#select2-' + id + '-container').parent()).css('background', backgroundColor);

  } else {
    $('#' + id).css('background', backgroundColor);
    $('#' + id).css('border-color', borderColor);

  }
}

function clearFieldErrorHighlight(id) {
  var borderColor = '';
  var backgroundColor = '';

  if ($('#' + id).is('select')) {
    $($('#select2-' + id + '-container').parent()).css('border-color', borderColor);
    $($('#select2-' + id + '-container').parent()).css('background', backgroundColor);

  } else {
    $('#' + id).css('background', backgroundColor);
    $('#' + id).css('border-color', borderColor);

  }
}

/**
 * Updates the HTML select element options based on the values passed in the parameter.
 *
 * @param elementId - HTML select element id
 * @param listOption - array of [value, description] options
 * @param firstOption - [value, description] to show as the first option
 * @param lastOption - [value, description] to show as the last option
 * @param selectedOption - value or description of the selected option to default
 */
function setSelectOptions(elementId, listOption, firstOption, lastOption, selectedOption) {
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
}

function isNumber(evt) {
  evt = (evt) ? evt : window.event;
  var charCode = (evt.which) ? evt.which : evt.keyCode;
  if (charCode == 8 || charCode == 37 || charCode == 39) {
    return true;
  } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    return false;
  }
  return true;
}

/**
 * Sorts teams by name attribute.
 *
 * @param members - array of members in the agile team.
 * @returns
 */
function sortAgileTeamsByName(teams) {
  return _.sortBy(teams, function(team) {
    return team.name;
  });
}

/**
 * Create a lookup list by team id.
 *
 * @param teamList - Array of team information.
 * @returns a lookup array for team related information.
 */
function getLookupListById(teams) {
  return _.indexBy(teams, function(team) {
    return team._id;
  });
}

/**
 * Sorts the list member by name attribute.
 *
 * @param members - array of members in the agile team.
 * @returns
 */
function sortTeamMembersByName(members) {
  return _.sortBy(members, function(member) {
    return member.name.trim();
  });
}


/**
 * Sorts the list assessment template.
 *
 * @param members - array of members in the agile team.
 * @returns
 */
function sortAssessmentTemplate(templates) {
  templates = templates.sort(function(a, b) {
    var aDate = a['atma_eff_dt'].split(' ')[0].replace(/-/g, '/') + ' ' + a['atma_eff_dt'].split(' ')[1];
    var bDate = b['atma_eff_dt'].split(' ')[0].replace(/-/g, '/') + ' ' + b['atma_eff_dt'].split(' ')[1];
    if (a['atma_status'].toLowerCase() == 'active' && b['atma_status'].toLowerCase() == 'active') {
      if (new Date(bDate).getTime() == new Date(aDate).getTime()) {
        return 0;
      } else {
        return (new Date(bDate).getTime() > new Date(aDate).getTime()) ? 1 : -1;
      }
    } else {
      if (b['atma_status'].toLowerCase() == 'inactive')
        return -1;
      else
        return 1;
    }
  });
  return templates;
}


/**
 * Sorts the list of maturity assessments by status and date attribute.
 *
 * @param assessments - array of maturity assessment documents.
 * @returns
 */
function sortAssessments(assessments) {
  if (assessments != null && assessments.length > 1) {
    assessments.sort(function(a, b) {
      if (a['assessmt_status'].toLowerCase() == 'draft' && b['assessmt_status'].toLowerCase() == 'draft') {
        var aCreateDate = a['created_dt'].split(' ')[0].replace(/-/g, '/') + ' ' + a['created_dt'].split(' ')[1];
        var bCreateDate = b['created_dt'].split(' ')[0].replace(/-/g, '/') + ' ' + b['created_dt'].split(' ')[1];
        if (new Date(bCreateDate).getTime() == new Date(aCreateDate).getTime()) {
          return 0;
        } else {
          return (new Date(bCreateDate).getTime() > new Date(aCreateDate).getTime()) ? 1 : -1;
        }

      } else if (a['assessmt_status'].toLowerCase() == 'submitted' && b['assessmt_status'].toLowerCase() == 'submitted') {
        var aSubmitDate = a['self-assessmt_dt'].split(' ')[0].replace(/-/g, '/') + ' ' + a['self-assessmt_dt'].split(' ')[1];
        var bSubmitDate = b['self-assessmt_dt'].split(' ')[0].replace(/-/g, '/') + ' ' + b['self-assessmt_dt'].split(' ')[1];
        if (new Date(bSubmitDate).getTime() == new Date(aSubmitDate).getTime()) {
          return 1;
        } else {
          return (new Date(bSubmitDate).getTime() > new Date(aSubmitDate).getTime()) ? 1 : -1;
        }
      } else {
        if (b['assessmt_status'].toLowerCase() == 'submitted')
          return -1;
        else
          return 1;
      }

    });
  }
  return assessments;
}

/**
 * Assembles the list of options made available for the maturity assessment select HTML element.
 *
 * @param assessments - array of maturity assessment documents.
 * @returns {Array} - an array of [value, description] values.
 */
function getAssessmentDropdownList(assessments) {
  var listOption = [];

  if (assessments == undefined || assessments == null) return listOption;

  for (var i = 0; i < assessments.length; i++) {
    var option = [];
    option.push(assessments[i]._id);
    if (assessments[i]['assessmt_status'] != '' && assessments[i]['assessmt_status'].toLowerCase() == 'submitted')
      option.push(showDateDDMMMYYYY(assessments[i]['self-assessmt_dt'].split(' ')[0]));
    else
      option.push('Created: ' + showDateDDMMMYYYY(assessments[i]['created_dt'].split(' ')[0]) + ' (' + assessments[i]['assessmt_status'] + ')');

    listOption.push(option);
  }
  return listOption;
}

/**
 * Find the assessment component that would indicate if its a Project or Ops related assessment.
 *
 * @param assessment - assessment to verify
 * @returns {String} - assessment type.
 */
function getAssessmentType(assessment) {
  var identifier = '';
  var results = assessment['assessmt_cmpnt_rslts'];
  for (var j = 0; j < results.length; j++) {
    if ((results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('ops') == -1) &&
      (results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('operations') == -1)) {
      identifier = 'Project';

    } else if ((results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('ops') > -1) ||
      (results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('operations') > -1)) {
      identifier = 'Ops';

    } else {
      identifier = '';

    }
    break;
  }
  return identifier;
}

/**
 * Assembles the list of options available for the team select HTML element.
 *
 * @param teams - array of team documents.
 * @param squadOnly - flag to check if only squad teams are needed
 * @returns {Array} - an array of [value, description] values.
 */
function getAgileTeamDropdownList(teams, squadOnly) {
  var listOption = [];

  if (teams == undefined || teams == null) return listOption;
  teams = sortAgileTeamsByName(teams);

  for (var i in teams) {
    var option = [];
    if ((teams[i].doc_status === undefined || teams[i].doc_status.toLowerCase() != 'delete')) {
      if (squadOnly) {
        if (teams[i].squadteam != undefined && teams[i].squadteam.toLowerCase() == 'yes') {
          option.push(teams[i]._id);
          option.push(teams[i].name);
          listOption.push(option);
        }
      } else {
        option.push(teams[i]._id);
        option.push(teams[i].name);
        listOption.push(option);
      }
    }
  }

  return listOption;
}

function getSquadDropdownList(teams) {
  var listOption = [];
  if (teams == undefined || teams == null)
    return listOption;
  teams = sortAgileTeamsByName(teams);

  var listOption = _.map(teams, function(val, key) {
    var option = [];
    option.push(val._id);
    option.push(val.name);
    return option;
  });
  return listOption;
}

/**
 * Sorts the list of iteration documents by date.
 *
 * @param iterations - array of iteration documents.
 * @returns
 */
function sortIterations(iterations) {
  if (iterations != null && iterations.length > 1) {
    iterations.sort(function(a, b) {
      if (new Date(b.iteration_end_dt).getTime() == new Date(a.iteration_end_dt).getTime()) {
        return 0;
      } else {
        return (new Date(b.iteration_end_dt).getTime() > new Date(a.iteration_end_dt).getTime()) ? 1 : -1;
      }
    });
  }
  return iterations;
}

/**
 * Assembles the list of options available for the iteration select HTML element.
 *
 * @param iterations - array of iteration documents.
 * @returns {Array} - an array of [value, description] values.
 */
function getIterationDropdownList(iterations) {
  var listOption = [];

  if (iterations == undefined || iterations == null) return listOption;

  for (var i = 0; i < iterations.length; i++) {
    var option = [];
    option.push(iterations[i]._id);
    option.push(iterations[i].iteration_name);
    listOption.push(obj);
  }
  return listOption;
}

function showDateMMMDDYYYY(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var date = new Date(formatDate.replace(/-/g, '/'));
  var day = date.getUTCDate();
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  var monthIndex = date.getUTCMonth();
  var year = date.getUTCFullYear();

  console.log(day, monthNames[monthIndex], year);
  return (monthNames[monthIndex] + ' ' + day + ', ' + year);
}

function showDateDDMMMYYYY(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var date = new Date(formatDate.replace(/-/g, '/'));
  var day = date.getDate();
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return (day + monthNames[monthIndex] + year);
}

function showDateYYYYMMDDTS(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var day = formatDate.substring(0, 2);
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  var month = monthNames.indexOf(formatDate.substring(2, 5)) + 1;
  month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
  var year = formatDate.substring(5, 9);

  return (year + '-' + month + '-' + day + ' 00:00:01 EDT');
}

function showDateUTC(formatDate) {
  if (formatDate == null || formatDate == '' || formatDate == 'NaN') return 'Not available';
  //var utcTime = moment(formatDate).format('MMMM DD, YYYY, H:mm')format('MMM DD, YYYY, HH:mm (z);
  var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
  return utcTime;
}

function showDateDDMMMYYYYTS(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var tsArr = formatDate.split(' ');
  var dateArr = tsArr[0].split('-');

  var day = dateArr[2];
  var monthIndex = dateArr[1];
  var year = dateArr[0];

  return (day + monthNames[monthIndex - 1] + year + ' ' + tsArr[1] + ' ' + (tsArr.length > 2 ? tsArr[2] : ''));
}

function formatDDMMMYYYY(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var tsArr = formatDate.split(' ');
  var dateArr = tsArr[0].split('-');

  var day = dateArr[2];
  var monthIndex = dateArr[1];
  var year = dateArr[0];

  return (day + monthNames[monthIndex - 1] + year);
}

function formatMMDDYYYY(formatDate) {
  if (formatDate == null || formatDate == '') return '';
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var day = formatDate.substring(0, 2);
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  var month = monthNames.indexOf(formatDate.substring(2, 5)) + 1;
  month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
  var year = formatDate.substring(5, 9);

  return month + '/' + day + '/' + year;
}

function showDateMMDDYYYY(formatDate) {
  var date = new Date(formatDate.replace(/-/g, '/'));
  var month = date.getUTCMonth() + 1;
  month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
  var day = date.getUTCDate();
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();

  return month + '/' + day + '/' + date.getUTCFullYear();
}

function getJsonParametersFromUrl() {
  var query = location.search.substr(1);
  var result = {};
  query.split('&').forEach(function(part) {
    var item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

function siteEnv() {
  //  if (environment != null) {
  //    if (environment.toLowerCase() != 'prod') {
  //      $("#environment").text(environment);
  //    }
  if (_.isEmpty(environment) || environment.toLowerCase() == 'development') {
    $('#debugSection').show();
  } else {
    $('#debugSection').hide();
  }
  // }
}

function displayEditStatus(status) {
  if (status) {
    $('#userEditMsg').show();
    $('#userEditMsg').text('You have view-only access for the selected team (to update a team, you must be a member or a member of its parent team).');
  } else {
    $('#userEditMsg').hide();
  }
}

/**
 * id - element id to where the graph will be inserted
 * title - label for the graph
 * type - type of graph to be created (e.g. line, bar)
 * categories - label for the x-axis
 * yAxisLabel - label for the y-axis. pass null if no label needed
 * series - the array of values. should have an object with name and data on it
 * unit - unit for plotted values
 * addText - additional text to be displayed below the legend
 */

function loadResultChart(id, title, type, categories, yAxisLabel, series, unit, addText) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      events: {
        load: function() {
          var text = this.renderer.text(addText, 145, 395)
            .css({
              width: '450px',
              color: '#222',
              fontSize: '11px'
            }).add();
        }
      }
    },

    title: {
      text: title
    },

    xAxis: {
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      max: 5,
      min: 0,
      title: {
        text: yAxisLabel
      },
      allowDecimals: false
    },

    tooltip: {
      valueSuffix: unit,
      formatter: function() {
        var s1 = this.series.chart.series[0].processedYData[this.point.index];
        var s2 = this.series.chart.series[1].processedYData[this.point.index];
        var s3;
        if (this.series.chart.series[2] != undefined) {
          s3 = this.series.chart.series[2].processedYData[this.point.index];
        }

        var formatResult = '';
        if (s1 == s2) {
          formatResult = '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.chart.series[0].name + ' :<b>' + s1 + '</b><br/>' + '<span style="color:' + this.series.chart.series[1].color + '">\u25CF</span>' + this.series.chart.series[1].name + ' :<b>' + s2 + '</b>';
        } else {
          formatResult = '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ' :<b>' + this.y + '</b>';
        }

        if (s3 != undefined) {
          if (this.y == s3 && this.series.name != this.series.chart.series[2].name) {
            formatResult = formatResult + '<br/><span style="color:' + this.series.chart.series[2].color + '">\u25CF</span>' + this.series.chart.series[2].name + ' :<b>' + s3 + '</b>';
          }
        }

        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },

    series: series
  });
}

/**
 * This will create regular expression for monthly range in a year
 * -it will generate based from minimum from passed
 *  date until the end of the year
 *  -e.g selected date is 06/25/2016 then regular expression
 *    resulted is [1-6]/[0-3][0-9]/2016
 *    --this will be used to fetch January to June of 2016
 *    selected date is 10/25/2016 then regular expression
 *    resulted is 1[0-2]/[0-3][0-9]/2016
 *    --this will be used to fetch October to December of 2016
 * @param selectedDate
 * @returns {String}
 */
function getMonthlyRange(selectedDate) {
  var tempStart = selectedDate.split('/');
  var month = tempStart[0];
  var yr = tempStart[2];

  var tempMonth = month.charAt(0);
  var startReg = '0';
  if (tempMonth != '0') {
    startReg = tempMonth;
    startReg += '[' + month.charAt(1) + '-' + '2' + ']';
  } else {
    startReg = '[' + '1' + '-' + month.charAt(1) + ']';
  }
  startReg += '/' + '[0-3][0-9]' + '/' + yr;
  return startReg;
}

function selectorQuery(query, _callback, args) {
  $.ajax({
    type: 'POST',
    url: baseUrlDb + '/_find',

    contentType: 'application/json',
    headers: {
      'Authorization': 'Basic ' + btoa(user + ':' + pass)
    },
    data: JSON.stringify(query)
  }).done(function(selectorRes) {
    args.push(selectorRes.docs);
    _callback.apply(this, args);
  });
}

function showDateMMMYYYY(formatDate) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var date = new Date(formatDate);
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return (monthNames[monthIndex] + '-' + year);
}

function sortMMMYYYY(iterations) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  if (iterations != null && iterations.length > 1) {
    iterations.sort(function(a, b) {

      var date1 = a.month.split('-');
      var date2 = b.month.split('-');
      var month1 = monthNames.indexOf(date1[0]);
      var yr1 = parseInt(date1[1]);
      var month2 = monthNames.indexOf(date2[0]);
      var yr2 = parseInt(date2[1]);
      if (yr1 == yr2) {
        if (month1 == month2)
          return 0;
        else {
          return (month2 > month1) ? 1 : -1;
        }
      } else
        return (yr2 > yr1) ? 1 : -1;
    });
  }
  return iterations;
}

/**
 * JS utility to validate parent/child links.
 *
 * @param teamList - array of all available teams to check.
 */
function checkParentChildLink(teamList) {
  var count = 0;
  var invalid = 0;
  var notFound = 0;
  var lookup = getLookupListById(teamList);
  for (var x = 0; x < teamList.length; x++) {
    var currTeam = teamList[x];
    if (currTeam.child_team_id != null && currTeam.child_team_id.length > 0) {

      for (var a = 0; a < currTeam.child_team_id.length; a++) {
        var childTeamFound = false;
        var childTeam = lookup[currTeam.child_team_id[a]];
        if (childTeam == null) {
          console.log('Child team record [' + currTeam.child_team_id[a] + '] not found but is associated with parent [' + currTeam.name + ' / ' + currTeam._id + ']');
          notFound++;
        } else {
          childTeamFound = true;

        }

        if (childTeamFound) {
          if (childTeam.parent_team_id != currTeam._id) {
            invalid++;
            console.log('Child team [' + childTeam.name + ' / ' + childTeam._id + '] indicated a different parent id [' + childTeam.parent_team_id + '] instead of [' + currTeam.name + ' / ' + currTeam._id + ']');

            var otherTeam = lookup[childTeam.parent_team_id];
            if (otherTeam == null) {
              console.log('\t Parent team [' + childTeam.parent_team_id + '] not found.');
            } else {
              var foundAsChild = false;
              for (var b = 0; b < otherTeam.child_team_id.length; b++) {
                if (otherTeam.child_team_id[b] == childTeam._id) {
                  console.log('\t Also found as child of team  [' + otherTeam.name + ' / ' + otherTeam._id + ']');
                  foundAsChild = true;
                }
              }
              if (!foundAsChild)
                console.log('\t Not found as child of team  [' + otherTeam.name + ' / ' + otherTeam._id + ']');
            }

          } else {
            count++;
          }
        }
      }
    }

    if (currTeam.parent_id != null && currTeam.parent_id != '') {
      var parentTeam = lookup[currTeam.parent_id];
      if (parentTeam == null)
        console.log('\t Parent team record [' + currTeam.parent_id + '] not found for [' + currTeam.name + ' / ' + currTeam._id + ']');
      else if (parentTeam.child_team_id != null && parentTeam.child_team_id.indexOf(currTeam.parent_id) < 0) {
        console.log('\t Parent team [' + parentTeam.name + ' / ' + parentTeam._id + '] has no child [' + currTeam.name + ' / ' + currTeam._id + ']');
      }
    }
  }
  console.log(count + ' teams have correct parent/child links.');
  console.log(invalid + ' teams have invalid parent/child links.');
  console.log(notFound + ' teams not found.');
};
