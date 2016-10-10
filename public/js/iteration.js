var teams;
var teamIterInfo;
var members;
var currentTeam;
var admins;
var global_currentAction = undefined;

jQuery(function($) {
  $(document).ready(function() {
    getPageVariables('iteration', initPageAction);
  });

  function initPageAction() {
    var urlParameters = getJsonParametersFromUrl();
    if (urlParameters != undefined && urlParameters.testUser != undefined) {
      setTestUser(urlParameters.testUser);
      alert('here TestUser is: ' + urlParameters.testUser);
    }

    if (urlParameters != undefined && urlParameters.id != undefined) {
      getTeam(urlParameters.id, updateAgileTeamCache, []);
      if (urlParameters != undefined && urlParameters.iter != undefined && urlParameters.iter != '')
        loadAgileTeams(urlParameters.id, urlParameters.iter);
      else
        loadAgileTeams(urlParameters.id, 'new');
    } else {
      loadAgileTeams('new', '');
      updateIterationInfo('clearIteration');
    }

    setToolTips();
    $('#iterationStartDate,#iterationEndDate').datepicker({
      dateFormat: 'ddMyy'
    });

    $('#iterationStartDate,#iterationEndDate').datepicker('option', 'dateFormat', 'ddMyy');
  }

  $('#teamSelectList').change(function() {
    updateIterationInfo('clearIteration');
    var teamId = $('#teamSelectList option:selected').val();
    getTeam(teamId, updateAgileTeamCache, []);
    loadAgileTeamIterationInfo(teamId, 'new');

  });

  $('#iterationName').change(function() {
    if ($('#iterationName').val().trim() != '')
      clearFieldErrorHighlight('iterationName');
  });

  $('#iterationName').blur(function() {
    if ($('#iterationName').val().trim() != '') {
      if (hasAccess($('#teamSelectList').val())) {
        $('#memberCount').val(teamMemCount());
        $('#fteThisiteration').val(teamMemFTE());
        enableIterationFields(true);
      }
    }
  });

  $('#fteThisiteration, #commStoriesDel, #commPointsDel').change(function() {
    calculateMetrics();
  });

  $('#iterationSelectList').change(function() {
    if ($('#iterationSelectList').val() == 'new') {
      updateIterationInfo('clearIteration');
      if (hasAccess($('#teamSelectList').val())) {
        $('#memberCount').val(teamMemCount());
        $('#fteThisiteration').val(teamMemFTE());
        enableIterationFields(true);
      }
    } else {
      $('#fteThisiteration').val(teamMemFTE());
      loadSelectedAgileTeamIterationInfo();
    }
  });

  $('#iterationEndDate').change(function() {
    selectedEndDate = formatMMDDYYYY($('#iterationEndDate').val());
    selectedStartDate = formatMMDDYYYY($('#iterationStartDate').val());
    if (selectedStartDate != '' && new Date(selectedEndDate) < new Date(selectedStartDate)) {
      // setFieldErrorHighlight("iterationEndDate");
      // showMessagePopup("End date must be >= start date");
      // $("#iterationEndDate").focus();
      return false;
    }
    clearFieldErrorHighlight('iterationStartDate');
    clearFieldErrorHighlight('iterationEndDate');
  });

  $('#iterationStartDate').change(function() {
    selectedEndDate = formatMMDDYYYY($('#iterationEndDate').val());
    selectedStartDate = formatMMDDYYYY($('#iterationStartDate').val());
    if (selectedStartDate != '' && new Date(selectedEndDate) < new Date(selectedStartDate)) {
      // setFieldErrorHighlight("iterationStartDate");
      // showMessagePopup("Start date must be <= end date");
      // $("#iterationStartDate").focus();
      return false;
    } else {
      today = new Date($.now());
      endDate = new Date(selectedEndDate);
      startDate = new Date(selectedStartDate);
      if (startDate != 'Invalid Date') // if invalid date, we don't display invalid end date
        $('#iterationEndDate').val(showDateDDMMMYYYY(addComputedDays(formatMMDDYYYY($('#iterationStartDate').val()))));
      clearFieldErrorHighlight('iterationStartDate');
      clearFieldErrorHighlight('iterationEndDate');

      if ($('#iterationSelectList option:selected').val() == 'new')
        getDefectsStartBalance($('#teamSelectList option:selected').val(), formatMMDDYYYY($('#iterationStartDate').val()), defectStartBalanceHandler, []);
    }
  });

  $('#defectsStartBal, #defectsIteration, #defectsClosed').change(function() {
    $('#defectsEndBal').val(computeDefectsEndBalance());
  });

  //$('#commStories, #commPoints, #memberCount, #commStoriesDel, #commPointsDel, #DeploythisIteration, #defectsStartBal, #defectsIteration, #defectsClosed, #defectsEndBal').keypress(function(e) {
  $('.wholeNumber').keypress(function(e) {
    var e = e || window.event;
    var charCode = (e.which) ? e.which : e.keyCode;
    var pattern = /^\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(this.value + '' + String.fromCharCode(e.charCode)))
    {
      return false;
    }
  }).on('paste',function(e){
    e.preventDefault();
  });

  //$('#fteThisiteration, #clientSatisfaction, #teamSatisfaction, #cycleTimeWIP, #cycleTimeInBacklog').keypress(function(e) {
  $('.decimalNumber').keypress(function(e) {
    var e = e || window.event;
    var charCode = (e.which) ? e.which : e.keyCode;
    var pattern = /^\d*[.]?\d*$/;
    if (e.charCode >= 32 && e.charCode < 127 &&  !pattern.test(this.value + '' + String.fromCharCode(e.charCode)))
    {
      return false;
    }
  }).on('paste',function(e){
    e.preventDefault();
  });

  $('#clientSatisfaction, #teamSatisfaction').blur(function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      $(this).val(parseFloat(value).toFixed(1));
      if (value == 0 || (value >= 1 && value <= 4)) {
        // this should only clear out the error highlights once conditions are satisfied.
        clearFieldErrorHighlight($(this).attr('id'));
      }
    }
  });

  $('#cycleTimeInBacklog, #cycleTimeWIP').blur(function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      $(this).val(parseFloat(value).toFixed(1));
    }
  });

  // handles number arrow click
  $('#clientSatisfaction, #teamSatisfaction').bind('input', function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      if (value >= 1 && value <= 4) {
        // this should only clear out the error highlights once conditions are satisfied.
        clearFieldErrorHighlight($(this).attr('id'));
      }
    }
  });

  $('#fteThisiteration').blur(function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      $(this).val(parseFloat(value).toFixed(1));
    }
  });

});

function setToolTips() {
  var tt = "Number of unique team members supporting this iteration.  The default is derived based on the team's current makeup and can be overridden by user input.  " + "This count is used to compute the iteration's FTE value and the 2 Pizza Rule metric results.";
  $('#memberCountTT').attr('title', tt);
  $('#memberCountTT').tooltip();

  tt = "FTE (Full-time Equivalent) is sum of all Team Member allocation percentages divided by number of unique Team Members.  The default is derived based on the current team's makeup and can be overridden by user input.  This value is used to compute the iteration's Unit Cost values";
  $('#fteThisiterationTT').attr('title', tt);
  $('#fteThisiterationTT').tooltip();

  tt = "Indicate if there was a change to the team's makeup during this iteration.  Changes might include adding/replacing/removing members or member allocation percentage updates that you feel are significant.  Indicating that a team change occurred might help to explain higher/lower team productivity when compared to other iterations.";
  $('#teamChangeListTT').attr('title', tt);
  $('#teamChangeListTT').tooltip();

  tt = 'Clicking this ICON will replace the team member count and the FTE value with current values from the Team Information area on the Home page.';
  $('#refreshFTE').attr('title', tt);
  $('#refreshFTE').tooltip();

  tt = 'Click to recalculate the opening balance of defects, based on the previous iteration, overwriting the value currently in this field.';
  $('#refreshDefectsStartBal').attr('title', tt);
  $('#refreshDefectsStartBal').tooltip();

  tt = 'Please indicate the satisfaction level of your client(s) with the results of this iteration using the following scale:' +
    '<br/>4 - Very satisfied' +
    '<br/>3 - Satisfied' +
    '<br/>2 - Dissatisfied' +
    '<br/>1 - Very dissatisfied';
  $('#clientSatisfactionTT').attr('title', tt);
  $('#clientSatisfactionTT').tooltip({
    content: function() {
      return $(this).attr('title');
    }
  });

  tt = 'Please indicate how happy your team was during the course of this iteration using the following scale:' +
    '<br/>4 - Very happy' +
    '<br/>3 - Happy' +
    '<br/>2 - Unhappy' +
    '<br/>1 - Very unhappy';
  $('#teamSatisfactionTT').attr('title', tt);
  $('#teamSatisfactionTT').tooltip({
    content: function() {
      return $(this).attr('title');
    }
  });

  $('div.ui-helper-hidden-accessible').each(function(index, obj) {
    $(obj).attr('aria-label', 'Tooltip');
  });
}

function teamMemCount() {
  var count = 0;
  var currentTeam = allTeamsLookup[($('#teamSelectList').val())];
  if (!_.isEmpty(currentTeam)) {
    count = currentTeam.total_members;
  }
  return count;
}

function teamMemFTE() {
  var count = 0.0;
  var currentTeam = allTeamsLookup[($('#teamSelectList').val())];
  if (!_.isEmpty(currentTeam)) {
    count = parseFloat(currentTeam.total_allocation).toFixed(1);
  }
  return count;
}

function refreshFTE() {
  var tmc = teamMemCount();
  var fte = teamMemFTE();
  confirmAction("You are about to overwrite the contents of these fields with '" + tmc + "' and '" + fte + "' respectively.  Do you want to continue?", 'Yes', 'No', refFTECount, [tmc, fte]);
}

function refFTECount(tmc, fte) {
  $('#memberCount').val(tmc);
  $('#fteThisiteration').val(fte);
  addIteration('update');
}

function refreshDefectsStartBalance(iterations) {
  var currentStartBalance = $('#defectsStartBal').val();
  var newStartBalance = 0;

  if (iterations == undefined)
    getDefectsStartBalance($('#teamSelectList option:selected').val(), formatMMDDYYYY($('#iterationStartDate').val()), refreshDefectsStartBalance, []);
  else if (!_.isEmpty(iterations) && !_.isUndefined(iterations[0].nbr_defects_end_bal) & !isNaN(parseInt(iterations[0].nbr_defects_end_bal)))
    newStartBalance = iterations[0].nbr_defects_end_bal;

  if (_.isEmpty(currentStartBalance) || currentStartBalance != newStartBalance) {
    confirmAction("You are about to overwrite the defect opening balance from '" + currentStartBalance + "' to '" + newStartBalance + "'.  Do you want to continue?", 'Yes', 'No', defectStartBalanceHandler, [iterations]);
  }
}

function defectStartBalanceHandler(iterations) {
  var startBalance = 0;
  if (iterations != undefined && !_.isUndefined(iterations[0].nbr_defects_end_bal) & !isNaN(parseInt(iterations[0].nbr_defects_end_bal)))
    startBalance = iterations[0].nbr_defects_end_bal;

  $('#defectsStartBal').val(startBalance);
  $('#defectsStartBal').trigger('change');
}

function computeDefectsEndBalance() {
  var openDefects = parseInt($('#defectsStartBal').val());
  var newDefects = parseInt($('#defectsIteration').val());
  var closedDefects = parseInt($('#defectsClosed').val());
  openDefects = isNaN(openDefects) ? 0 : openDefects;
  newDefects = isNaN(newDefects) ? 0 : newDefects;
  closedDefects = isNaN(closedDefects) ? 0 : closedDefects;
  return openDefects + newDefects - closedDefects;
}

function confirmAction(message, btn1, btn2, action, args) {
  $('#dialog').dialog({
    autoOpen: false,
    modal: true,
    height: 'auto',
    width: 520,
    buttons: [{
      id: 'btn1',
      text: btn1,
      click: function() {
        $(this).dialog('close');
        action.apply(this, args);
      }
    }, {
      id: 'btn2',
      text: btn2,
      click: function() {
        $(this).dialog('close');
      }
    }]
  });

  $('#dialog').text(message);
  $('#dialog').dialog('open');
}

function loadAgileTeams(selected, iteration) {
  $('#teamSelectList').attr('disabled', 'disabled');
  $('#iterationSelectList').attr('disabled', 'disabled');
  $('#select2-iterationSelectList-container').css('color', 'grey');

  addOptions('teamSelectList', sortAgileTeamsByName(squadTeams), null, null, selected);
  $('#teamSelectList').removeAttr('disabled');

  if (iteration != undefined && iteration != '')
    loadAgileTeamIterationInfo(selected, iteration);
}

function loadAgileTeamIterationInfo(teamId, iterationId) {
  var hasAcc = hasAccess(teamId);
  if (teamId == null || teamId == '') {
    loadAgileTeams('new', '');;
    if (hasAcc)
      addOptions('iterationSelectList', null, ['new', 'Create new...'], null, 'new');
    else
      addOptions('iterationSelectList', null, ['', 'Select one'], null, '');
    displayEditStatus(false);
    return;
  }
  $('#iterationSelectList').attr('disabled', 'disabled');
  $('#select2-iterationSelectList-container').css('color', 'grey');
  $('#iterationName').attr('disabled', 'disabled');
  // retrieve and load latest iteration information for the team
  $.ajax({
    type: 'GET',
    url: '/api/iteration/searchTeamIteration?id=' + encodeURIComponent(teamId) + '&limit=200'
  })
    .fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status === 400) {
        errorHandler(xhr, textStatus, errorThrown);
      }
    })
    .done(function(data) {
      var list = [];
      if (data != undefined) {
        list = _.pluck(data.rows, 'fields');
      }
      teamIterInfo = list;
      var iterInfo = [];
      for (var i = 0; i < teamIterInfo.length; i++) {
        var iteration = new Object();
        iteration._id = teamIterInfo[i].id;
        iteration.name = teamIterInfo[i].name;
        iterInfo.push(iteration);
      }

      if (hasAcc) {
        addOptions('iterationSelectList', iterInfo, ['new', 'Create new...'], null, iterationId);
        displayEditStatus(false);
      } else {
        addOptions('iterationSelectList', iterInfo, ['', 'Select one'], null, iterationId);
        displayEditStatus(true);
      }

      if (iterationId != undefined && iterationId != 'new') {
        loadSelectedAgileTeamIterationInfo();
      } else {
        if (hasAcc) {
          enableIterationFields(true);
        }
      }
      $('#iterationSelectList').removeAttr('disabled');
      $('#select2-iterationSelectList-container').css('color', 'black');
    });
}

function loadSelectedAgileTeamIterationInfo() {
  var iterationId = $('#iterationSelectList option:selected').val();
  // retrieve and load latest iteration information for the team
  $.ajax({
    type: 'GET',
    url: '/api/iteration/current/' + encodeURIComponent(iterationId)
  })
    .fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status === 400) {
        errorHandler(xhr, textStatus, errorThrown);
      }
    })
    .done(function(data) {
      teamIterInfo = data;
      clearHighlightedIterErrors();
      $('#iterationSelectList').val(teamIterInfo._id);
      $('#select2-iterationSelectList-container').text($('#iterationSelectList option:selected').text());
      $('#select2-iterationSelectList-container').attr('title', $('#iterationSelectList option:selected').text());
      $('#iterationName').val(teamIterInfo.iteration_name);
      $('#iterationStartDate').val(showDateDDMMMYYYY(teamIterInfo.iteration_start_dt));
      $('#iterationEndDate').val(showDateDDMMMYYYY(teamIterInfo.iteration_end_dt));
      $('#iterationinfoStatus').val(teamIterInfo.iterationinfo_status);
      $('#commStories').val(teamIterInfo.nbr_committed_stories);
      $('#commPoints').val(teamIterInfo.nbr_committed_story_pts);
      $('#memberCount').val(teamIterInfo.team_mbr_cnt);
      $('#commStoriesDel').val(teamIterInfo.nbr_stories_dlvrd);
      $('#commPointsDel').val(teamIterInfo.nbr_story_pts_dlvrd);
      $('#storyPullIn').val(teamIterInfo.nbr_stories_pulled_in);
      $('#storyPtPullIn').val(teamIterInfo.nbr_story_pts_pulled_in);
      $('#retroItems').val(teamIterInfo.retro_action_items);
      $('#retroItemsComplete').val(teamIterInfo.retro_action_items_complete);
      $('#teamChangeList').val(teamIterInfo.team_mbr_change);
      $('#select2-teamChangeList-container').text($('#teamChangeList option:selected').text());
      $('#select2-teamChangeList-container').attr('title', $('#teamChangeList option:selected').text());
      $('#lastUpdateUser').html(teamIterInfo.last_updt_user);
      $('#lastUpdateTimestamp').html(showDateUTC(teamIterInfo.last_updt_dt));
      $('#commentIter').val(teamIterInfo.iteration_comments);
      $('#doc_id').html(teamIterInfo._id);
      if (teamIterInfo.fte_cnt != '') {
        var alloc = parseFloat(teamIterInfo.fte_cnt).toFixed(1);
        $('#fteThisiteration').val(alloc);
      }
      $('#DeploythisIteration').val(teamIterInfo.nbr_dplymnts);
      $('#defectsStartBal').val(teamIterInfo.nbr_defects_start_bal);
      $('#defectsIteration').val(teamIterInfo.nbr_defects);
      $('#defectsClosed').val(teamIterInfo.nbr_defects_closed);
      $('#defectsEndBal').val(teamIterInfo.nbr_defects_end_bal);
      $('#cycleTimeWIP').val(teamIterInfo.nbr_cycletime_WIP);
      $('#cycleTimeInBacklog').val(teamIterInfo.nbr_cycletime_in_backlog);
      $('#clientSatisfaction').val(teamIterInfo.client_sat);
      $('#teamSatisfaction').val(teamIterInfo.team_sat);
      calculateMetrics();

      if (!hasAccess(teamIterInfo.team_id)) {
        enableIterationFields(false);
      } else {
        enableIterationFields(true);
      }
    });
}

function calculateMetrics() {
  if (!isNaN(parseFloat($('#fteThisiteration').val().trim())) && parseFloat($('#fteThisiteration').val().trim()) > 0) {
    var commStoriesDel = $('#commStoriesDel').val().trim();
    var commStoriesDel = !isNaN(parseFloat(commStoriesDel)) ? commStoriesDel : 0;
    var storiesFTE = commStoriesDel / $('#fteThisiteration').val();
    $('#unitcostStoriesFTE').val(storiesFTE.toFixed(1));
    var commPointsDel = $('#commPointsDel').val().trim();
    var commPointsDel = !isNaN(parseFloat(commPointsDel)) ? commPointsDel : 0;
    var strPointsFTE = commPointsDel / $('#fteThisiteration').val();
    $('#unitcostStorypointsFTE').val(strPointsFTE.toFixed(1));
  }
}

function enableIterationFields(enabled) {
  if (enabled) {
    $('#iterationForm input[type="text"], #iterationForm textarea').removeAttr('disabled');
    $('#teamChangeList').removeAttr('disabled');
    $('#unitcostStoriesFTE,#unitcostStorypointsFTE,#defectsEndBal').attr('disabled','disabled');
    $('#select2-teamChangeList-container,#commentIter').css('color', 'black');
    $('#refreshFTE,#refreshDefectsStartBal,#defectHelp').show();
    $('#refreshFTE').attr('onclick','refreshFTE()');
    $('#refreshDefectsStartBal').attr('onclick','refreshDefectsStartBalance()');
    $('#defectsStartBal').attr('style','position: relative; top: -.6rem;');

    if ($('#iterationSelectList').val() == 'new') {
      $('#addIterationBtn').removeAttr('disabled');
      $('#updateIterationBtn').attr('disabled', 'disabled');
    } else {
      $('#addIterationBtn').attr('disabled', 'disabled');
      $('#updateIterationBtn').removeAttr('disabled');
    }
  } else {
    $('#iterationForm input[type="text"], #iterationForm textarea').attr('disabled', 'disabled');
    $('#teamChangeList').attr('disabled', 'disabled');
    $('#addIterationBtn,#updateIterationBtn').attr('disabled', 'disabled');
    $('#select2-teamChangeList-container,#commentIter').css('color', 'grey');
    $('#refreshFTE,#refreshDefectsStartBal,#defectHelp').hide();
    $('#defectsStartBal').attr('style','position: relative;');

    if ($('#iterationSelectList').val() == 'new') {
      $('#addIterationBtn').removeAttr('disabled');
      $('#updateIterationBtn').attr('disabled', 'disabled');
    } else {
      $('#addIterationBtn').attr('disabled', 'disabled');
      $('#updateIterationBtn').removeAttr('disabled');
    }
  }
}

function updateIterationCache_old(iteration) {
  var found = false;
  for (var i = 0; i < teamIterInfo.length; i++) {
    if (iteration._id == teamIterInfo[i]._id) {
      teamIterInfo[i] = iteration;
      found = true;
      break;
    }
  }
  if (!found)
    teamIterInfo.push(iteration);

  var iterInfo = [];
  for (i = 0; i < teamIterInfo.length; i++) {
    var iter = new Object();
    iter._id = teamIterInfo[i]._id;
    iter.name = teamIterInfo[i].iteration_name;
    iterInfo.push(iter);
    // console.log(iterInfo[i]._id + " " + iterInfo[i].name);
  }

  addOptions('iterationSelectList', iterInfo, ['new', 'Create new...'], null, iteration._id);
}

function updateIterationCache(iteration) {
  var teamId = iteration.team_id;
  var currentIterId = iteration._id;
  var iterInfo = [];
  // retrieve and load latest iteration information for the team
  $.ajax({
    type: 'GET',
    url: '/api/iteration/searchTeamIteration?id=' + encodeURIComponent(teamId)
  })
    .fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status === 400) {
        errorHandler(xhr, textStatus, errorThrown);
      }
    })
    .done(function(data) {
      var list = [];
      if (data != undefined) {
        list = _.pluck(data.rows, 'fields');
      }
      var teamIterInfo = list;
      for (var i = 0; i < teamIterInfo.length; i++) {
        var iteration = new Object();
        iteration._id = teamIterInfo[i].id;
        iteration.name = teamIterInfo[i].name;
        iterInfo.push(iteration);
      }
      addOptions('iterationSelectList', iterInfo, ['new', 'Create new...'], null, currentIterId);
    });
}

function addOptions(id, list) {
  addOptions(id, list, null, null, null);
}

function addOptions(selectId, listOption, firstOption, lastOption, selectedOption) {
  $('#' + selectId).empty();

  if (firstOption != undefined) {
    $('#select2-' + selectId + '-container').text(firstOption[1]);
    option = "<option value='" + firstOption[0] + "' selected='selected'>" + firstOption[1] + '</option>';
    $('#' + selectId).append(option);

  } else {
    $('#select2-' + selectId + '-container').text('Select one');
    var option = "<option value='' selected='selected'>Select one</option>";
    $('#' + selectId).append(option);
  }

  if (listOption == undefined)
    return;

  for (var i = 0; i < listOption.length; i++) {
    var option = '';

    if (listOption[i]._id == selectedOption || listOption[i].name == selectedOption) {
      option = "<option value='" + listOption[i]._id + "' selected='selected'>" + listOption[i].name + '</option>';
      $('#select2-' + selectId + '-container').text(listOption[i].name);
      $('#select2-' + selectId + '-container').text(listOption[i].name);
      $('#select2-' + selectId + '-container').attr('title', listOption[i].name);

    } else
      option = "<option value='" + listOption[i]._id + "'>" + listOption[i].name + '</option>';

    $('#' + selectId).append(option);
  }

  if (lastOption != undefined) {
    option = "<option value='" + lastOption[0] + "'>" + lastOption[1] + '</option>';
    $('#' + selectId).append(option);

  }

}

function addIteration(action) {
  $.ajax({
    type: 'GET',
    url: '/api/teams/' + encodeURIComponent($('#teamSelectList').val()),
    async: false
  }).done(function(data) {
    if (data != undefined) {
      updateAgileTeamCache(data);
      var jsonData = data;
      if (jsonData.squadteam != undefined && jsonData.squadteam.toLowerCase() == 'no') {
        showMessagePopup('Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.');
        loadAgileTeams('new', '');
        updateIterationInfo('clearIteration');
        return;
      }

      var exists = false;
      var currentIteration = new Object();

      if (teamIterInfo != undefined) {
        var teamSelectList = $('#teamSelectList').val();
        var iterationSelectList = $('#iterationSelectList').val();
        var iterationInfoId = teamIterInfo._id;
        var iterationInfoTeamId = teamIterInfo.team_id;

        if ((iterationInfoTeamId == teamSelectList) && (iterationInfoId == iterationSelectList)) {
          exists = true;
          currentIteration = teamIterInfo;
        }
      }
      if (exists) {
        $.ajax({
          type: 'GET',
          url: '/api/iteration/current/' + encodeURIComponent(currentIteration._id)
        }).done(function(data) {
          var jsonData = data;
          var rev = jsonData._rev;
          console.log('Updating ' + currentIteration._id + '. The current revision is ' + rev + '.');
          jsonData = updateIterationData(jsonData);
          $.ajax({
            type: 'PUT',
            url: '/api/iteration/' + encodeURIComponent(currentIteration._id),
            contentType: 'application/json',
            data: JSON.stringify(jsonData)
          })
            .fail(function(xhr, textStatus, errorThrown) {
              if (xhr.status === 400) {
                handleIterationErrors(xhr, textStatus, errorThrown);
              }
            })
            .done(function(data) {
              var putResp = (typeof data == 'string' ? JSON.parse(data) : data);
              var rev2 = putResp.rev;
              console.log('Done updating ' + currentIteration._id + '. The new revision is ' + rev2 + '.');
              // update cache
              updateIterationCache(jsonData);
              loadSelectedAgileTeamIterationInfo();
              clearHighlightedIterErrors();
              showMessagePopup('You have successfully updated Iteration information.');
            });
        });
      } else {
        jsonData = createIterationData();
        $.ajax({
          type: 'POST',
          url: '/api/iteration',
          contentType: 'application/json',
          data: JSON.stringify(jsonData)
        })
          .fail(function(xhr, textStatus, errorThrown) {
            if (xhr.status === 400) {
              handleIterationErrors(xhr, textStatus, errorThrown);
            }
          })
          .done(function(data) {
            console.log(data);
            var json = (typeof data == 'string' ? JSON.parse(data) : data);
            var id = json.id;
            console.log('Added iteration ' + jsonData.team_id + ' / ' + jsonData.iteration_name + '. The new document ID is ' + id + '.');

            loadAgileTeamIterationInfo(jsonData.team_id, id);
            clearHighlightedIterErrors();
            showMessagePopup('You have successfully added Iteration information.');
          });
      }
    }
  });
}

function createIterationData() {
  var jsonData = new Object();
  jsonData.type = 'iterationinfo';
  jsonData.team_id = $('#teamSelectList').val();
  jsonData.iteration_name = $('#iterationName').val();
  jsonData.iteration_start_dt = formatMMDDYYYY($('#iterationStartDate').val());
  jsonData.iteration_end_dt = formatMMDDYYYY($('#iterationEndDate').val());
  jsonData.team_mbr_cnt = $('#memberCount').val();
  jsonData.nbr_committed_stories = $('#commStories').val();
  jsonData.nbr_stories_dlvrd = $('#commStoriesDel').val();
  jsonData.nbr_committed_story_pts = $('#commPoints').val();
  jsonData.nbr_story_pts_dlvrd = $('#commPointsDel').val();
  jsonData.nbr_stories_pulled_in = $('#storyPullIn').val();
  jsonData.nbr_story_pts_pulled_in = $('#storyPtPullIn').val();
  jsonData.retro_action_items = $('#retroItems').val();
  jsonData.retro_action_items_complete = $('#retroItemsComplete').val();
  jsonData.iteration_comments = $('#commentIter').val();
  jsonData.team_mbr_change = $('#teamChangeList').val();
  jsonData.fte_cnt = $('#fteThisiteration').val();
  jsonData.nbr_dplymnts = $('#DeploythisIteration').val();
  jsonData.nbr_defects_start_bal = $('#defectsStartBal').val();
  jsonData.nbr_defects = $('#defectsIteration').val();
  jsonData.nbr_defects_closed = $('#defectsClosed').val();
  jsonData.nbr_defects_end_bal = $('#defectsEndBal').val();
  jsonData.nbr_cycletime_WIP = $('#cycleTimeWIP').val();
  jsonData.nbr_cycletime_in_backlog = $('#cycleTimeInBacklog').val();
  jsonData.client_sat = $('#clientSatisfaction').val();
  jsonData.team_sat = $('#teamSatisfaction').val();
  jsonData = $.extend(true, {}, initIterationTemplate(), jsonData);
  return jsonData;
}

function updateIterationData(jsonData) {
  jsonData.iteration_name = $('#iterationName').val();
  jsonData.iteration_start_dt = formatMMDDYYYY($('#iterationStartDate').val());
  jsonData.iteration_end_dt = formatMMDDYYYY($('#iterationEndDate').val());
  jsonData.team_mbr_cnt = $('#memberCount').val();
  jsonData.nbr_committed_stories = $('#commStories').val();
  jsonData.nbr_stories_dlvrd = $('#commStoriesDel').val();
  jsonData.nbr_committed_story_pts = $('#commPoints').val();
  jsonData.nbr_story_pts_dlvrd = $('#commPointsDel').val();
  jsonData.nbr_stories_pulled_in = $('#storyPullIn').val();
  jsonData.nbr_story_pts_pulled_in = $('#storyPtPullIn').val();
  jsonData.retro_action_items = $('#retroItems').val();
  jsonData.retro_action_items_complete = $('#retroItemsComplete').val();
  jsonData.iteration_comments = $('#commentIter').val();
  jsonData.team_mbr_change = $('#teamChangeList').val();
  jsonData.fte_cnt = $('#fteThisiteration').val();
  jsonData.nbr_dplymnts = $('#DeploythisIteration').val();
  jsonData.nbr_defects_start_bal = $('#defectsStartBal').val();
  jsonData.nbr_defects = $('#defectsIteration').val();
  jsonData.nbr_defects_closed = $('#defectsClosed').val();
  jsonData.nbr_defects_end_bal = $('#defectsEndBal').val();
  jsonData.nbr_cycletime_WIP = $('#cycleTimeWIP').val();
  jsonData.nbr_cycletime_in_backlog = $('#cycleTimeInBacklog').val();
  jsonData.client_sat = $('#clientSatisfaction').val();
  jsonData.team_sat = $('#teamSatisfaction').val();
  jsonData = $.extend(true, {}, initIterationTemplate(), jsonData);
  return jsonData;
}

function handleIterationErrors(jqXHR, textStatus, errorThrown) {
  var errorlist = '';
  var response = jqXHR.responseText;
  console.log('Error response:', response);
  if (response) {
    var errors = JSON.parse(response);

    // Return iteration errors as String
    errorlist = getIterationErrorPopup(errors['error']);

    if (errorlist != '') {
      showMessagePopup(errorlist);
      if (global_currentAction === 'add') {
        $('#addIterationBtn').removeAttr('disabled');
      } else if (global_currentAction === 'update') {
        $('#updateIterationBtn').removeAttr('disabled');
      }
    }
  }
}

function getIterationErrorPopup(errors) {
  console.log('error list: ' + JSON.stringify(errors));
  var errorLists = '';
  // Model fields/Form element field
  var fields = {
    '_id': '',
    'team_id': 'teamSelectList',
    'iteration_name': 'iterationName',
    'iteration_start_dt': 'iterationStartDate',
    'iteration_end_dt': 'iterationEndDate',
    'nbr_committed_stories': 'commStories',
    'nbr_committed_story_pts': 'commPoints',
    'team_mbr_cnt': 'memberCount',
    'fte_cnt': 'fteThisiteration',
    'nbr_stories_dlvrd': 'commStoriesDel',
    'nbr_story_pts_dlvrd': 'commPointsDel',
    'nbr_dplymnts': 'DeploythisIteration',
    'nbr_defects_start_bal': 'defectsStartBal',
    'nbr_defects': 'defectsIteration',
    'nbr_defects_closed': 'defectsClosed',
    'nbr_defects_end_bal': 'defectsEndBal',
    'nbr_cycletime_WIP': 'cycleTimeWIP',
    'nbr_cycletime_in_backlog': 'cycleTimeInBacklog',
    'team_mbr_change': 'teamChangeList',
    'client_sat': 'clientSatisfaction',
    'team_sat': 'teamSatisfaction'
  };

  Object.keys(fields).forEach(function(mdlField, index) {
    var frmElement = fields[mdlField];
    if (errors[mdlField]) {
      if (frmElement) {
        setFieldErrorHighlight(frmElement);
      }
      errorLists = errorLists + errors[mdlField][0] + '\n';
    } else {
      if (frmElement) {
        clearFieldErrorHighlight(frmElement);
      }
    }
  });

  return errorLists;
}

function updateIterationInfo(action) {
  global_currentAction = action;
  if (action == 'add') {
    // stop gap to disable multiple add
    $('#addIterationBtn').attr('disabled', 'disabled');
    addIteration(action);
  } else if (action == 'update') {
    $('#updateIterationBtn').attr('disabled', 'disabled');
    addIteration(action);
  } else if (action == 'clear' || action == 'clearIteration') {
    if (action == 'clear')
      loadAgileTeamIterationInfo(null, null);
    $('#doc_id').html('');
    $('#newIterationNameSection').fadeIn();
    $('input[type="text"], #commentIter').val('');
    $('#teamChangeList').val('No');
    $('#select2-teamChangeList-container').text($('#teamChangeList option:selected').text());
    $('#select2-teamChangeList-container').attr('title', $('#teamChangeList option:selected').text());
    clearHighlightedIterErrors();
    enableIterationFields(false);
    window.scrollTo(0, 0);
  }

}

function addComputedDays(date) {
  /*var result = new Date(date);
  if (result.getDay() == 0) // Sunday
    return addDays(date, 12);
  else if (result.getDay() == 1) // Monday
    return addDays(date, 11);
  else
    return addDays(date, 13);*/
  return addDays(date, 13);
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  result = new Date(result);
  var month = result.getMonth() + 1;
  month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
  var day = result.getDate();
  day = day.toString().length < 2 ? '0' + day.toString() : day.toString();
  /*
   * if(isNaN(day)){ return ""; }
   */
  return month + '/' + day + '/' + result.getFullYear();
}

function clearHighlightedIterErrors() {
  var fields = [
    'teamSelectList',
    'iterationName',
    'iterationStartDate',
    'iterationEndDate',
    'commStories',
    'commPoints',
    'memberCount',
    'fteThisiteration',
    'commStoriesDel',
    'commPointsDel',
    'DeploythisIteration',
    'defectsStartBal',
    'defectsIteration',
    'defectsClosed',
    'defectsEndBal',
    'cycleTimeWIP',
    'cycleTimeInBacklog',
    'teamChangeList',
    'commentIter',
    'clientSatisfaction',
    'teamSatisfaction'
  ];

  for (j = 0; j < fields.length; j++) {
    clearFieldErrorHighlight(fields[j]);
  }
}
