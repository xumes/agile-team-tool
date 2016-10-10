var taPerson;

jQuery(function($) {
  $(document).ready(function() {
    getPageVariables('team', initPageAction);
    /* Custom link label close-link listener */
    $('#ibm-overlaywidget-customLinkLabel .ibm-close-link').on('click', function(){
      cancelLinkLabel();
    });
    /* show or hide the Link group */
    showHideLinkDiv();
  });

  $(document).ready(function(){
    new Clipboard('#copy-button');
  });

  function initPageAction() {
    FacesTypeAhead.init(
      $('#teamMemberName')[0], {
        key: 'ciodashboard;agileteamtool@us.ibm.com',
        resultsAlign: 'left',
        showMoreResults: false,
        faces: {
          headerLabel: 'People',
          onclick: function(person) {
            taPerson = person;
            return person['notes-id'];
          }
        },
        topsearch: {
          headerLabel: 'w3 Results',
          enabled: true
        }
      });

    $('.ibm-close-link').click(function() {
      if ($('#teamDetailsPageSection h2 .ibm-show-active').length == 0) {
        $('#teamDetailsPageSection h2 a').eq(0).trigger('click');
      }
      $('html, body').animate({
        scrollTop: $('#teamDetailsPageSection h2 a').offset().top
      }, 1000);
    });


    var urlParameters = getJsonParametersFromUrl();
    if (urlParameters != undefined && urlParameters.id != undefined)
      agileTeamListHandler(urlParameters.id, allTeams);
    else
      agileTeamListHandler('new', allTeams);

    if (urlParameters != undefined && urlParameters.testUser != undefined) {
      setTestUser(urlParameters.testUser);
      alert('here TestUser is: ' + urlParameters.testUser);
    }

    agileTeamRolesHandler(memberRoles);
    disableAddTeam();
  }

  $('#teamSelectList').change(function() {
    if ($('#teamSelectList option:selected').val() == 'new') {
      updateTeamInfo('clear');
      displayEditStatus(false);
      disableAddTeam();

    } else {
      $("#teamDetailsPageSection .ibm-show-hide a[class='ibm-show-active']").click();
      // retrieve and load latest data about the team and update local cached data
      $.ajax({
        type: 'GET',
        url: '/api/teams/' + encodeURIComponent($('#teamSelectList option:selected').val())
      }).done(function(data) {
        updateAgileTeamCache(data);
        loadSelectedAgileTeam();
      });
    }
  });

  $('#teamName').change(function() {
    if ($('#teamName').val() != '')
      clearFieldErrorHighlight('teamName');
  });

  $('#teamSquadYesNo').change(function() {
    var teamSquad = $('#teamSquadYesNo option:selected').val();
    if (teamSquad.toLowerCase() == 'yes') {
      $('#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection').show();
      $('#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection').hide();
      loadIterationInformation(null, false);
    } else {
      $('#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection').hide();
      $('#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection').show();
      loadIterationInformation(null, false);
    }

  });

  $('#teamMemberName').change(function() {
    if ($('#teamMemberName').val() == '')
      taPerson = null;
    else if (taPerson != undefined && $('#teamMemberName').val() != taPerson['notes-id'])
      taPerson = null;

    if (taPerson != null)
      clearFieldErrorHighlight('teamMemberName');
  });

  $('#teamMemberName').blur(function() {
    if (taPerson != null)
      clearFieldErrorHighlight('teamMemberName');
  });

  $('#memberRoleSelectList').change(function() {
    var role = $('#memberRoleSelectList option:selected').text();
    if ($('#memberRoleSelectList').val() == 'other')
      $('#otherRoleDescSection').fadeIn();
    else
      $('#otherRoleDescSection').fadeOut();

    if ($('#memberRoleSelectList').val() != '')
      clearFieldErrorHighlight('memberRoleSelectList');
  });

  $('#otherRoleDesc').change(function() {
    if ($('#otherRoleDesc').val() != '')
      clearFieldErrorHighlight('otherRoleDesc');
  });

  $('#memberListAction').change(function() {
    if ($('input[name="member"]:checked').length < 1) {
      showMessagePopup('No selected members to perform desired action.');
      $('#memberListAction').val('');
      $('#select2-memberListAction-container').text('Actions...');
      $('#select2-memberListAction-container').attr('title', 'Actions...');
      $('#select2-memberListAction-container').css('color', 'grey');
      $('#memberListAction').attr('disabled', 'disabled');
      return;
    }
    var enableAction = false;
    var action = $('#memberListAction option:selected').val();
    if (action == 'remove') {
      $('#addMemberBtn').attr('disabled', 'disabled');
      $('#updateMemberBtn').attr('disabled', 'disabled');
      deleteTeamMember();

    } else if (action == 'update') {
      if ($('input[name="member"]:checked').length > 1) {
        showMessagePopup('Only one member can be selected for update.');

      } else {
        loadMemberInfo($('input[name="member"]:checked').val());
      }
      enableAction = true;
    }
    var count = $('input[name="member"]:checked').length;
    var actionText = count > 0 ? 'Actions...(' + count + ')' : 'Actions...';
    if (enableAction) {
      $('#memberListAction').removeAttr('disabled');
      $('#memberListAction').val('');
      $('#select2-memberListAction-container').text(actionText);
      $('#select2-memberListAction-container').attr('title', actionText);
      $('#select2-memberListAction-container').css('color', 'black');
    } else {
      $('#select2-memberListAction-container').text(actionText);
      $('#select2-memberListAction-container').attr('title', actionText);
      $('#select2-memberListAction-container').css('color', 'grey');
      $('#memberListAction').attr('disabled', 'disabled');
    }

  });

  $('#childSelectList').change(function() {
    if ($('#childSelectList').val() != '')
      clearFieldErrorHighlight('childSelectList');
  });

  $('#childrenListAction').change(function() {
    if ($('input[name="child"]:checked').length < 1) {
      showMessagePopup('No selected children team to perform desired action.');
      $('#childrenListAction').val('');
      $('#select2-childrenListAction-container').text('Actions...');
      $('#select2-childrenListAction-container').attr('title', 'Actions...');
      $('#select2-childrenListAction-container').css('color', 'grey');
      $('#childrenListAction').attr('disabled', 'disabled');
      return;
    }

    var action = $('#childrenListAction option:selected').val();
    if (action == 'remove') {
      $('input[name="child"]:checked').each(function() {
        $(this).parent().parent().remove();
      });

      deleteChildTeam();

      if ($('#childrenList tr').length == 0) {
        $('#teamSquadYesNo').removeAttr('disabled');
        $('#select2-teamSquadYesNo-container').css('color', 'black');
        $('#childrenList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
      }

      $('#childrenListAction').val('');
      $('#select2-childrenListAction-container').text('Actions...');
      $('#select2-childrenListAction-container').css('color', 'grey');
      $('#select2-childrenListAction-container').attr('title', 'Actions...');
      $('#childrenListAction').attr('disabled', 'disabled');
    } else {
      $('#childrenListAction').val('');
      $('#select2-childrenListAction-container').text('Actions...');
      $('#select2-childrenListAction-container').css('color', 'black');
      $('#select2-childrenListAction-container').attr('title', 'Actions...');
    }
  });

  updateTeamInfo('clear');
});

function agileTeamListHandler(teamId, teamList) {
  $('#teamSelectList').attr('disabled', 'disabled');
  var listOption = getAgileTeamDropdownList(teamList, false);
  setSelectOptions('teamSelectList', listOption, ['new', 'Create new...'], null, teamId);
  if (teamId != undefined && teamId != 'new') {
    $('#teamSelectList').trigger('change');
  }
  $('#teamSelectList').removeAttr('disabled');
}

function agileTeamRolesHandler(roles) {
  var listOption = [];
  for (var i = 0; i < roles.length; i++) {
    var option = [roles[i].name, roles[i].name];
    listOption.push(option);
  }
  setSelectOptions('memberRoleSelectList', listOption, null, ['other', 'Other...'], null);
}

var teamIterations = [];
var teamAssessments = [];

function loadSelectedAgileTeam() {
  var teamName = $('#teamSelectList option:selected').text();
  var teamId = $('#teamSelectList option:selected').val();
  $('#teamName').val(teamName);
  var currentTeam = getAgileTeamCache(teamId);
  if (!_.isEmpty(currentTeam)) {
    $('#addTeamBtn,#updateTeamBtn,#deleteTeamBtn,#updateChildBtn,#addMemberBtn,#updateParentBtn,#cancelMemberBtn').removeAttr('disabled');
    $('#teamName,#teamDesc,#teamMemberName,#memberAllocation').removeAttr('disabled');
    $('#teamSquadYesNo,#memberRoleSelectList,#memberListAction,#parentSelectList,#childSelectList,#childrenListAction,#iterTeamBtn,#assessBtn').removeAttr('disabled');
    $('#teamDesc,#select2-teamSquadYesNo-container,#select2-memberRoleSelectList-container,#select2-memberListAction-container,#select2-parentSelectList-container').css('color', 'black');

    $('#teamName').val(currentTeam.name);
    $('#teamDesc').val(currentTeam.desc);
    $('#lastUpdateUser').html(currentTeam.last_updt_user);
    $('#lastUpdateTimestamp').html(showDateUTC(currentTeam.last_updt_dt));
    $('#doc_id').html(currentTeam._id);
    $('#maturityTrendLink').html(window.location.origin+'/maturityTrends?id='+currentTeam._id);
    clearFieldErrorHighlight('teamName');
    clearFieldErrorHighlight('teamMemberName');
    clearFieldErrorHighlight('memberAllocation');
    clearFieldErrorHighlight('memberRoleSelectList');
    clearFieldErrorHighlight('otherRoleDesc');
    clearFieldErrorHighlight('childSelectList');

    $('#teamNameTitle').html('Team members for ' + currentTeam.name);
    $('#childrenNameTitle').html('Child team association for ' + currentTeam.name);

    loadSelectableParents(currentTeam);
    loadSelectableChildren(currentTeam);

    teamIterations = [];
    teamAssessments = [];
    loadIterationInformation(null, false);
    loadAssessmentInformation(null, false);
    if (currentTeam.squadteam != undefined && currentTeam.squadteam.toLowerCase() == 'yes') {
      $('#teamSquadYesNo').val('Yes');
      $('#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection').show();
      $('#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection').hide();
      // disable squad indicator if iteration data exist
      $.ajax({
        type: 'GET',
        url: '/api/iteration/searchTeamIteration?id=' + encodeURIComponent(currentTeam._id)
      })
        .fail(function(xhr, textStatus, errorThrown) {
          if (xhr.status === 400) {
            errorHandler(xhr, textStatus, errorThrown);
          }
        })
        .done(function(data) {
          if (!_.isEmpty(data)) {
            var list = _.pluck(data.rows, 'fields');
            if (!_.isEmpty(list)) {
              $('#teamSquadYesNo').attr('disabled', 'disabled');
              $('#select2-teamSquadYesNo-container').css('color', 'grey');
            }
            teamIterations = list;
            loadIterationInformation(sortIterations(list), false);
          }
        });

      $.ajax({
        type: 'GET',
        url: '/api/assessment/view?teamId=' + encodeURIComponent(teamId),
        async: false
      }).done(function(data) {
        if (!_.isEmpty(data)) {
          //var list = _.pluck(data.rows, "value");
          teamAssessments = data;
          //loadAssessmentInformation(sortAssessments(data), false);
          loadAssessmentInformation(data, false);
        }
      });

    } else {
      $('#teamSquadYesNo').val('No');
      $('#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection').hide();
      $('#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection').show();

      if (currentTeam.child_team_id.length > 0) {
        $('#teamSquadYesNo').attr('disabled', 'disabled');
        $('#select2-teamSquadYesNo-container').css('color', 'grey');
      } else {
        $('#teamSquadYesNo').removeAttr('disabled');
        $('#select2-teamSquadYesNo-container').css('color', 'black');
      }
      // Initial load will have Action disabled
      $('#select2-childrenListAction-container').text('Actions...');
      $('#select2-childrenListAction-container').css('color', 'grey');
      $('#select2-childrenListAction-container').attr('title', 'Actions...');
      $('#childrenListAction').attr('disabled', 'disabled');
    }
    $('#select2-teamSquadYesNo-container').text($('#teamSquadYesNo option:selected').text());
    $('#select2-teamSquadYesNo-container').attr('title', $('#teamSquadYesNo option:selected').text());
  }

  $('#addTeamBtn').attr('disabled', 'disabled');
  $('#teamDetailsPageSection').fadeIn();
  $('#teamMemberTable').fadeIn();

  loadTeamMembers($('#teamSelectList option:selected').val());
  loadLinks($('#teamSelectList option:selected').val());
  $('#memberListAction').val('');
  $('#select2-memberListAction-container').text('Actions...');
  $('#select2-memberListAction-container').attr('title', 'Actions...');
  $('#select2-memberListAction-container').css('color', 'grey');
  $('#memberListAction').attr('disabled', 'disabled');

  loadTeamChildren($('#teamSelectList option:selected').val());
  $('#childrenListAction').val('');
  $('#select2-childrenListAction-container').text('Actions...');
  $('#select2-childrenListAction-container').attr('title', 'Actions...');

  if (!hasAccess($('#teamSelectList option:selected').val())) {
    $('#addTeamBtn,#updateTeamBtn,#deleteTeamBtn,#updateChildBtn,#addMemberBtn,#updateParentBtn,#cancelMemberBtn').attr('disabled', 'disabled');
    $('#teamName,#teamDesc,#teamMemberName,#memberAllocation').attr('disabled', 'disabled');
    $('#teamSquadYesNo,#memberRoleSelectList,#memberListAction,#parentSelectList,#childSelectList,#childrenListAction,#iterTeamBtn,#assessBtn').attr('disabled', 'disabled');
    $('#teamDesc,#select2-teamSquadYesNo-container,#select2-memberRoleSelectList-container,#select2-memberListAction-container,#select2-parentSelectList-container').css('color', 'grey');
    displayEditStatus(true);
  } else {
    displayEditStatus(false);
  }
}

function manageIteration() {
  window.location = 'iteration?id=' + encodeURIComponent($('#teamSelectList option:selected').val()) + '&iter=new';
}

function manageAssessment() {
  window.location = 'assessment?id=' + encodeURIComponent($('#teamSelectList option:selected').val()) + '&assessId=new';
}

function loadIterationInformation(iterationList, more) {
  $('#moreIterations').hide();
  $('#lessIterations').hide();

  if (more) {
    $('#iterationTitle').html('Iterations for ' + $('#teamSelectList option:selected').text());
  } else {
    $('#iterationTitle').html('Last 5 iterations for ' + $('#teamSelectList option:selected').text());
  }

  $('#iterationList').empty();
  var found = false;
  var noOfIter = 0;

  if (iterationList != undefined) {
    if (more) {
      noOfIter = iterationList.length;
    } else {
      noOfIter = 5;
    }

    for (var j = 0; j < iterationList.length && j < noOfIter; j++) {
      found = true;
      var iter = iterationList[j];
      var iterLink = "<a style='text-decoration: underline;color:black;' href='iteration?id=" + encodeURIComponent(iter.team_id) + '&iter=' + encodeURIComponent(iter.id) + "' title='Manage current iteration information'>" + iter.name + '</a>';
      var row = "<tr id='irow_" + j + "'>";
      row = row + '<td></td>';
      row = row + '<td>' + iterLink + '</td>';
      row = row + '<td>' + showDateDDMMMYYYY(iter.iteration_start_dt) + '</td>';
      row = row + '<td>' + showDateDDMMMYYYY(iter.iteration_end_dt) + '</td>';
      row = row + '</tr>';
      $('#iterationList').append(row);
    }

    if (iterationList.length > 5) {
      if (!more) {
        $('#moreIterations').show();
      } else {
        $('#lessIterations').show();
      }
    }

    $('#moreIterations').click(function() {
      loadIterationInformation(iterationList, true);
    });

    $('#lessIterations').click(function() {
      loadIterationInformation(iterationList, false);
    });
  }

  if (!found) {
    $('#iterationList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
  }
}

function loadAssessmentInformation(assessmentlist, more) {
  $('#moreAssessments').hide();
  $('#lessAssessments').hide();

  $('#assessmentList').empty();
  var numRec = 5;
  if (more) {
    numRec = assessmentlist.length;
  }
  var link = '';
  if (assessmentlist != null && assessmentlist.length > 0) {
    var hasDraft = false;
    for (var x = 0; x < assessmentlist.length && x < numRec; x++) {
      var item = assessmentlist[x];
      if (item.assessmt_status == 'Submitted') {
        link = "<a style='text-decoration: underline;color:black;' href='progress?id=" + encodeURIComponent(item.team_id) + '&assessId=' + encodeURIComponent(item._id) + "'>" +
          showDateDDMMMYYYY(item['self-assessmt_dt'].substring(0, item['self-assessmt_dt'].indexOf(' '))) + '</a>';
      } else {
        hasDraft = true;
        link = "<a style='text-decoration: underline;color:black;' href='assessment?id=" + encodeURIComponent(item.team_id) + '&assessId=' + encodeURIComponent(item._id) + "'>" +
          showDateDDMMMYYYY(item.created_dt.substring(0, item.created_dt.indexOf(' '))) + '</a>';
      }
      var row = "<tr id='asmntrow_" + x + "'>";
      row = row + '<td></td>';
      row = row + '<td>' + link + '</td>';
      row = row + '<td>' + item.assessmt_status + '</td>';
      row = row + '<td>' + item.last_updt_user + '</td>';
      row = row + '</tr>';
      $('#assessmentList').append(row);
    }
    if (hasDraft) {
      $('#assessBtn').attr('disabled', 'disabled');
    }

    if (assessmentlist.length > 5 && numRec == 5) {
      $('#assessmentTitle').html('Last 5 Assessments for ' + $('#teamSelectList option:selected').text());
      $('#moreAssessments').show();
    } else if (assessmentlist.length > 5 && numRec > 5) {
      $('#assessmentTitle').html('All Assessments for ' + $('#teamSelectList option:selected').text());
      $('#lessAssessments').show();
    } else {
      $('#assessmentTitle').html('Last 5 Assessments for ' + $('#teamSelectList option:selected').text());

    }

    $('#moreAssessments').click(function() {
      loadAssessmentInformation(assessmentlist, true);
    });

    $('#lessAssessments').click(function() {
      loadAssessmentInformation(assessmentlist, false);
    });

  } else {
    $('#assessmentTitle').html('Last 5 Assessments for ' + $('#teamSelectList option:selected').text());
    $('#assessmentList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
  }
}

function disableAddTeam() {
  if (!_.isEmpty(systemStatus) &&
    systemStatus.agildash_system_status_display == 'AdminOnlyChange' &&
    !isAdmin()) {
    $('#updateTeamBtn,#addTeamBtn').attr('disabled', 'disabled');
    $('#teamName,#teamDesc').attr('disabled', 'disabled');
    $('#teamSquadYesNo').attr('disabled', 'disabled');
    $('#teamDesc,#select2-teamSquadYesNo-container').css('color', 'grey');
  }
}

var children = [];

function getAllChildren(parentId) {
  var currentTeam = getAgileTeamCache(parentId);
  if (!_.isEmpty(currentTeam)) {
    if (currentTeam.child_team_id != undefined) {
      for (var j in currentTeam.child_team_id) {
        if (children.indexOf(currentTeam.child_team_id[j]) == -1) {
          children.push(currentTeam.child_team_id[j]);
          getAllChildren(currentTeam.child_team_id[j]);
        }
      }
    }
  }
  return children;
}

function loadSelectableParents(team) {
  // children = [];
  // getAllChildren(team._id);
  // var parentList = [];
  // if (allTeams != undefined) {
  //  $.each(allTeams, function () {
  //    if (this._id != team._id && this.squadteam.toLowerCase() == "no") {
  //      if (children.indexOf(this._id) == -1)
  //        parentList.push(this);
  //    }
  //  });
  //  setSelectOptions("parentSelectList", getAgileTeamDropdownList(parentList, false), ["", "No parent team"], null, team.parent_team_id);
  if (!_.isEmpty(team)) {
    $.ajax({
      type: 'GET',
      url: '/api/teams/lookup/parents/' + encodeURIComponent(team._id)
    }).done(function(parentList) {
      setSelectOptions('parentSelectList', getAgileTeamDropdownList(parentList, false), ['', 'No parent team'], null, team.parent_team_id);
    });

  } else {
    showMessagePopup('No team data loaded on this page.');
  }

}

function loadSelectableChildren(team) {
  // children = [];
  // getAllChildren(team._id);

  // var childList = [];
  // if (allTeams != undefined) {
  //  $.each(allTeams, function () {
  //    if (this._id != team._id) {
  //      if (children.indexOf(this._id) == -1 && _.isEmpty(this.parent_team_id))
  //        childList.push(this);
  //    }
  //  });
  //  setSelectOptions("childSelectList", getAgileTeamDropdownList(childList, false), null, null, null);
  if (!_.isEmpty(team)) {
    $.ajax({
      type: 'GET',
      url: '/api/teams/lookup/children/' + encodeURIComponent(team._id)
    }).done(function(childrenList) {
      setSelectOptions('childSelectList', getAgileTeamDropdownList(childrenList, false), null, null, null);
    });

  } else {
    showMessagePopup('No team data loaded on this page.');
  }
}

function loadTeamMembers(teamId) {
  $('#memberList').empty();
  var found = false;
  if (teamId != undefined) {
    var currentTeam = getAgileTeamCache(teamId);
    if (!_.isEmpty(currentTeam)) {
      var members = sortTeamMembersByName(currentTeam.members);
      for (var j = 0; j < members.length; j++) {
        found = true;
        var member = members[j];
        var row = "<tr id='mrow_" + j + "'>";
        row = row + "<td scope='row' class='ibm-table-row'>";
        if (hasAccess($('#teamSelectList option:selected').val()))
          row = row + "<input name='member' id='member_" + j + "' type='checkbox' value='" + j + "' onclick='selectMember($(this))' />";
        else
          row = row + "<input name='member' id='member_" + j + "' type='checkbox' value='" + j + "' disabled='true' />";
        row = row + "<label for='member_" + j + "' class='ibm-access'>Select " + member.name + '</label>';
        row = row + '</td>';
        row = row + "<td id='name_ref_" + j + "'>" + member.name + '</span></td>';
        row = row + "<td id='email_ref_" + j + "'>" + member.id + '</span></td>';
        row = row + "<td id='alloc_ref_" + j + "'>" + (isNaN(parseInt(member.allocation)) ? '0' : member.allocation) + '</td>';
        row = row + "<td id='location_ref_" + j + "'><div class='ibm-spinner'></div></td>";
        row = row + "<td id='role_ref_" + j + "'>" + member.role + '</td>';
        row = row + '</tr>';
        $('#memberList').append(row);
        getPersonFromFaces(member.id, facesPersonHandler, [j, member.id]);
      }
    }
    $('#teamMemberName').removeAttr('disabled');
    $('#addMemberBtn').removeAttr('disabled');
    $('#updateMemberBtn').attr('disabled', 'disabled');

  }

  if (!found) {
    $('#memberList').append('<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty">No data available</td></tr>');
  }
}

function loadMemberInfo(index) {
  var email = $('#email_ref_' + index).text();
  var svcRoot = 'https://faces.tap.ibm.com/api/';
  var svcFunc = 'find/?format=faces&limit=100&q=email:' + escape(email);
  var svcURL = svcRoot + svcFunc;
  $('#addMemberBtn').attr('disabled', 'disabled');
  $('#updateMemberBtn').attr('disabled', 'disabled');
  $.ajax({
    'global': false,
    'cache': false,
    'url': svcURL,
    'timeout': 5000,
    'jsonp': 'callback',
    'scriptCharset': 'UTF-8',
    'success': function(data) {
      $.each(data.persons, function(i, result) {
        var facesPerson = result.person;
        if (facesPerson.email == email) {
          taPerson = facesPerson;
          $('#teamMemberName').val(taPerson['notes-id']);
          $('#teamMemberName').attr('disabled', 'disabled');
          var role = $('#role_ref_' + index).text();
          if ($("#memberRoleSelectList option[value='" + role + "']").length == 0) {
            $('#memberRoleSelectList').val('other');
            $('#select2-memberRoleSelectList-container').text('Other...');
            $('#select2-memberRoleSelectList-container').attr('title', 'Other...');
            $('#otherRoleDesc').val(role);
            $('#otherRoleDescSection').fadeIn();
          } else {
            $('#otherRoleDesc').val('');
            $('#otherRoleDescSection').fadeOut();
            $('#memberRoleSelectList').val(role);
            $('#select2-memberRoleSelectList-container').text(role);
            $('#select2-memberRoleSelectList-container').attr('title', role);
          }

          $('#memberAllocation').val($('#alloc_ref_' + index).text());
          $('#addMemberBtn').attr('disabled', 'disabled');
          $('#updateMemberBtn').removeAttr('disabled');
        }
      });
    },
    'error': function(data, status, error) {
      showMessagePopup(status);
      $('#teamMemberName').removeAttr('disabled');
      $('#addMemberBtn').removeAttr('disabled');
      $('#updateMemberBtn').attr('disabled', 'disabled');
    }
  });
}

function loadTeamChildren(currentId) {
  $('#childrenList').empty();
  var found = false;
  if (currentId != undefined) {
    var currentTeam = getAgileTeamCache(currentId);
    if (!_.isEmpty(currentTeam) && currentTeam.child_team_id != undefined) {
      var childTeams = [];
      for (var j = 0; j < currentTeam.child_team_id.length; j++) {
        var childTeamId = currentTeam.child_team_id[j];
        var childTeam = getAgileTeamCache(childTeamId);
        if (!_.isEmpty(childTeam)) {
          childTeams.push(childTeam);
        }
      }
      if (childTeams.length > 0) {
        found = true;
        var sortedChildTeams = sortAgileTeamsByName(childTeams);
        var childTeamId = '';
        var childTeamName = '';
        var childTeamDesc = '';
        var index = 0;

        for (var x in sortedChildTeams) {
          childTeamId = sortedChildTeams[x]._id;
          index = index + 1;
          childTeamName = sortedChildTeams[x].name;
          childSquadIndicator = sortedChildTeams[x].squadteam;
          childTeamDesc = sortedChildTeams[x].desc;
          var row = "<tr id='crow_" + index + "'>";
          row = row + "<td scope='row' class='ibm-table-row'>";
          if (hasAccess($('#teamSelectList option:selected').val()))
            row = row + "<input name='child' id='child_" + index + "'type='checkbox' value='" + index + "' onclick='selectChild($(this))' />";
          else
            row = row + "<input name='child' id='child_" + index + "'type='checkbox' value='" + index + "' disabled='true'/>";
          row = row + "<label for='child_" + index + "' class='ibm-access'>Select " + childTeamName + '</label>';
          row = row + '</td>';
          row = row + "<td id='ref_id_" + childTeamId + "'>" + childTeamName + '</td>';
          row = row + "<td id='ref_squadteam_" + index + "'>" + childSquadIndicator + '</td>';
          row = row + "<td id='ref_desc_" + index + "'>" + childTeamDesc + '</td>';
          row = row + '</tr>';
          $('#childrenList').append(row);
          if (childTeamDesc == undefined)
            getTeam(childTeamId, getTeamDetailHandler, [index]);
        }
      }
    }
  }

  if (!found) {
    $('#childrenList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
  }
}

var curLinkLabelID = '';
function popupCustomLabel(elem){
  curLinkLabelID = elem.id;
  if (elem.value == 'Other') {
    IBMCore.common.widget.overlay.show('customLinkLabel');
  }
}

var selectdata = [];
function addLink() {
  $('.updateLinkWrapper').show();
  $('#saveLinkBtn').removeAttr('disabled');
  var ctr = new Date().getTime();

  selectdata = [
    {id: '-1', text: 'Select label'},
    {id: 'Wall of work', text: 'Wall of work'},
    {id: 'Backlog', text: 'Backlog'},
    {id: 'Retrospectives', text: 'Retrospectives'},
    {id: 'Defects', text: 'Defects'},
    {id: 'Standup schedule', text: 'Standup schedule'},
    {id: 'Other', text: 'Other...'}
  ];

  var html =  "<div id='link_" + ctr +"' data-counter='" + ctr + "' class='imptlink'> \
                  <select id='linklabel_" + ctr + "' data-counter='" + ctr + "' name='linklabel_[]' onchange='popupCustomLabel(this)' class='implabel' style='width: 200px'> \
                  </select> \
                  <span class='urlwrapper'> \
                  <input type='text' name='url_[]' id='url_" + ctr + "' data-counter='" + ctr + "' size='20' value='' placeholder='URL' aria-label='URL' class='implink' style='width: 400px;'> \
                  </span> \
                  <a href='javascript:void(0)' id='removelink_" + ctr + "' class='removelink' onclick=removetmpLink('" + ctr + "')><img src='img/delete-ico.png'/></a> \
                </div>";
  $('#importantLinkWrapper').append(html);
  $('#linklabel_'+ctr).select2({
    data: selectdata
  });

  showHideLinkDiv();
}

function removetmpLink(id){
  $('#link_'+id).remove();
}
/*
 * Add new link label coming from modal(popup)
 */
function addnewLinkLabel(){
  var newlabel = $.trim($('#newlabel').val());
  if (newlabel !== ''){
    selectdata.push({id: newlabel, text: newlabel});
    $('#'+curLinkLabelID).select2({data: selectdata});
    IBMCore.common.widget.overlay.hide('customLinkLabel');
    $('#newlabel').val('');

    $('#'+curLinkLabelID).val(newlabel);
    $('#select2-' + curLinkLabelID + '-container').text(newlabel);
  } else {
    alert('Please enter a label name');
  }
}

function cancelLinkLabel(){
  $('#customLinkLabel').css('cursor', 'default');
  IBMCore.common.widget.overlay.hide('customLinkLabel');
  $('#select2-' + curLinkLabelID + '-container').text('Select label');
  $('#select2-' + curLinkLabelID + '-container').attr('title', 'Select label');
  $('#'+curLinkLabelID).val('-1');
}

function loadLinks(teamId){
  if (teamId != undefined) {
    var currentTeam = getAgileTeamCache(teamId);
    if (!_.isEmpty(currentTeam)) {
      $('#importantLinkWrapper').empty();
      var links = currentTeam.links;
      if (links && links.length > 0){
        $('.updateLinkWrapper').show();
        var numLinks = links.length;
        var selectdata = [
          {id: '-1', text: 'Select label'},
          {id: 'Wall of work', text: 'Wall of work'},
          {id: 'Backlog', text: 'Backlog'},
          {id: 'Retrospectives', text: 'Retrospectives'},
          {id: 'Defects', text: 'Defects'},
          {id: 'Standup schedule', text: 'Standup schedule'},
          {id: 'Other', text: 'Other...'}
        ];
        var linkIds1 = _.pluck(links, 'linkLabel');
        var linkIds2 = _.pluck(selectdata, 'id');
        var diffLinks = _.difference(linkIds1, linkIds2);
        if (diffLinks.length > 0) {
          _.each(diffLinks, function(tmp){
            selectdata.push({id: tmp, text: tmp});
          });
        }
        var html = '';
        if (numLinks > 0) {
          for (var ctr = 0; ctr < numLinks; ctr++) {
            var opts = '';
            var selectedVal = '';
            var id = links[ctr].id;
            for (var k=0; k < selectdata.length; k++) {
              if (links[ctr].linkLabel === selectdata[k].id) {
                opts = opts + '<option value="" selected=selected >' + selectdata[k].text + '</option>';
                selectedVal = selectdata[k].text;
              } else {
                opts = opts + '<option value="' + selectdata[k].id + '" >' + selectdata[k].text + '</option>';
              }
            }

            html =  html + "<div id='link_" + ctr +"' data-counter='" + ctr + "' class='imptlink'> \
                              <select id='linklabel_" + ctr + "' data-id='" + id + "' data-counter='" + ctr + "' name='linklabel_[]' onchange='popupCustomLabel(this)' class='implabel' style='width: 200px'> \
                              " + opts+ " \
                              </select> \
                              <span class='urlwrapper'> \
                              <input type='text' name='url_[]' id='url_" + ctr + "' data-counter='" + ctr + "' size='20' value='" + links[ctr].linkUrl + "' placeholder='URL' aria-label='URL' class='implink' style='width: 400px;'> \
                              </span> \
                              <a href='javascript:void(0)' id='removelink_" + ctr + "' style='display:none;' class='removelink' onclick=removeLink('" + id + "')><img src='img/delete-ico.png' /></a> \
                            </div>";
            $('#linklabel_' + ctr).val(selectedVal);
          }
          $('#importantLinkWrapper').append(html);
          $('.implabel').select2();
        }
      }
    }
  }
  showHideLinkDiv();
}

/* Delete a specific link */
function removeLink(linkId){
  var teamId = $('#teamSelectList option:selected').val();
  var currentTeam = getAgileTeamCache(teamId);
  var action = 'deleteLinks';
  if ((linkId != undefined) && !_.isEmpty(currentTeam)){
    var linkData = [];
    linkData.push({id: linkId});

    currentTeam.links = linkData;
    var updateData = {
      teamId: currentTeam['_id'],
      links: currentTeam['links']
    };

    $.ajax({
      type: 'DELETE',
      url: '/api/teams/links',
      contentType: 'application/json',
      data: JSON.stringify(updateData)
    }).fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status == 400) {
        handleTeamValidationErrors(JSON.parse(xhr.responseText), action);
      } else {
        errorHandler(xhr, textStatus, errorThrown);
      }
    }).done(function(data) {
      userTeamList = data.userTeams;
      clearLinkFieldErrorHighlight('url_');
      clearSelectLinkFieldErrorHighlight('linklabel_');
      $('#saveLinkBtn').removeAttr('disabled');
      updateAgileTeamCache(data.teamDetails);
      // agileTeamListHandler(data.team._id, allTeams);
      loadLinks($('#teamSelectList option:selected').val());
      showMessagePopup('You have successfully deleted a link.');
    });
  }
}

/* Save links to db */
function updateLink(){
  $('#saveLinkBtn').attr('disabled', 'disabled');
  var teamId = $('#teamSelectList option:selected').val();
  var currentTeam = getAgileTeamCache(teamId);
  var action = 'updateLinks';
  var linkData = getLinkData();
  console.log('linkData:', JSON.stringify(linkData));
  currentTeam.links = linkData;

  var updateData = {
    teamId: currentTeam['_id'],
    links: currentTeam['links']
  };

  $.ajax({
    type: 'PUT',
    url: '/api/teams/links',
    contentType: 'application/json',
    data: JSON.stringify(updateData)
  }).fail(function(xhr, textStatus, errorThrown) {
    if (xhr.status == 400) {
      handleTeamValidationErrors(JSON.parse(xhr.responseText), action);
    } else {
      errorHandler(xhr, textStatus, errorThrown);
    }

  }).done(function(data) {
    userTeamList = data.userTeams;
    clearLinkFieldErrorHighlight('url_');
    clearSelectLinkFieldErrorHighlight('linklabel_');
    $('#saveLinkBtn').removeAttr('disabled');
    updateAgileTeamCache(data.teamDetails);
    // agileTeamListHandler(data.team._id, allTeams);
    loadLinks($('#teamSelectList option:selected').val());
    showMessagePopup('You have successfully saved a links.');
  });
}

/* Get important link data from selectbox/textfield elements */
function getLinkData(){
  var labelArray = [];
  $('.implabel option:selected').each(function(){
    labelArray.push($(this).text());
  });

  var labelId = [];
  $('.implabel').each(function(){
    var labelID = $(this).attr('data-id');
    labelId.push(labelID);
  });

  var urlsArray = [];
  $('.implink').each(function(){
    urlsArray.push($(this).val());
  });

  var linkData = [];
  for (i=0; i<labelArray.length; i++){
    var obj = {};
    obj.id = labelId[i];
    obj.linkLabel = labelArray[i];
    obj.linkUrl = urlsArray[i];
    linkData.push(obj);
  }

  return linkData;
}

function showHideLinkDiv(){
  $('#importantLinkWrapper div.imptlink').on('mouseover', function(){
    var ctr = $(this).attr('data-counter');
    $('#removelink_'+ctr).show();
  });
  $('#importantLinkWrapper div.imptlink').on('mouseout', function(){
    $('.removelink').hide();
  });
}

function getTeamDetailHandler(index, team) {
  if (team != null) {
    $('#ref_desc_' + index).text(team.desc);
    $('#ref_squadteam_' + index).text(team.squadteam);
    updateAgileTeamCache(team);
  } else {
    $('#ref_desc_' + index).text('-unavailable-');
  }
}

function facesPersonHandler(index, userEmail, facesPerson) {
  if (facesPerson != null) {
    $('#location_ref_' + index).text(facesPerson.location);
  } else {
    $('#location_ref_' + index).text('-unavailable-');
  }
}

function updateAction(action) {
  var teamId = $('#teamSelectList option:selected').val();
  var currentTeam = getAgileTeamCache(teamId);
  if (!_.isEmpty(currentTeam)) {
    var message = 'You have successfully updated Team Information.';
    if (action == 'update') {
      currentTeam.name = $('#teamName').val().trim();
      currentTeam.desc = $('#teamDesc').val();
      currentTeam.squadteam = $('#teamSquadYesNo option:selected').val();

      currentTeam = $.extend(true, {}, initTeamTemplate(), currentTeam);
      $.ajax({
        type: 'PUT',
        url: '/api/teams/',
        async: false,
        contentType: 'application/json',
        data: JSON.stringify(currentTeam),
      }).fail(function(xhr, textStatus, errorThrown) {
        if (xhr.status == 400) {
          handleTeamValidationErrors(JSON.parse(xhr.responseText), action);
        } else {
          errorHandler(xhr, textStatus, errorThrown);
        }

      }).done(function(data) {
        userTeamList = data.userTeams;
        updateAgileTeamCache(data.team);
        agileTeamListHandler(data.team._id, allTeams);
        showMessagePopup(message);
      });

    } else if (action == 'delete') {
      deleteTeam(currentTeam);
      return;

    } else if (action == 'parent') {
      updateParentAssociation(currentTeam);
      return;

    } else if (action == 'child') {
      updateChildAssociation(currentTeam);
      return;

    }

  } else {
    currentTeam = initTeamTemplate();
    currentTeam.type = 'team';
    currentTeam.name = $('#teamName').val().trim();
    currentTeam.desc = $('#teamDesc').val();
    currentTeam.squadteam = $('#teamSquadYesNo option:selected').val();
    currentTeam.parent_team_id = $('#parentSelectList option:selected').val();

    var memberData = new Object();
    memberData.key = userInfo.uid;
    memberData.id = userInfo.email;
    memberData.name = userInfo.name;
    memberData.allocation = 0;
    if ($('#teamSquadYesNo option:selected').val().toLowerCase() == 'yes')
      memberData.role = 'Iteration Manager';
    else
      memberData.role = 'Team Lead';

    currentTeam.members = [memberData];
    currentTeam.child_team_id = [];

    $.ajax({
      type: 'POST',
      url: '/api/teams',
      contentType: 'application/json',
      data: JSON.stringify(currentTeam)
    }).fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status == 400) {
        handleTeamValidationErrors(JSON.parse(xhr.responseText), action);
      } else {
        errorHandler(xhr, textStatus, errorThrown);
      }

    }).done(function(data) {
      userTeamList = data.userTeams;
      updateAgileTeamCache(data.team);
      agileTeamListHandler(data.team._id, allTeams);
      showMessagePopup('You have successfully added a team and you have been added as the first team member. You can now add additional team members.');
    });
  }
}

function handleTeamValidationErrors(errors, action) {
  var fields = {
    '_id': '',
    'name': 'teamName',
    'desc': 'teamDesc',
    'squadteam': '',
    'member.name': 'teamMemberName',
    'member.role': '',
    'parent_team_id': 'parentSelectList',
    'targetparent': 'parentSelectList',
    'child_team_id': 'childSelectList',
    'targetChild': 'childSelectList',
    'links': 'url_'
  };
  var msgs = '';
  var err = _.reduce(errors);

  Object.keys(fields).forEach(function(key, index) {
    var frmElement = fields[key];
    if (err[key]) {
      if (frmElement == 'member.role') {
        if ($('#memberRoleSelectList option:selected').val() == 'other')
          setFieldErrorHighlight('otherRoleDesc');
        else
          setFieldErrorHighlight('memberRoleSelectList');
      } else if (frmElement == 'url_') {
        var errmsg = handleLinkValidation(frmElement, err);
        err[key][0] = errmsg;
      } else if (frmElement) {
        setFieldErrorHighlight(frmElement);
      }
      msgs = msgs + err[key][0] + '\n';
    } else {
      if (frmElement == 'member.role') {
        if ($('#memberRoleSelectList option:selected').val() == 'other')
          clearFieldErrorHighlight('otherRoleDesc');
        else
          clearFieldErrorHighlight('memberRoleSelectList');
      } else if (frmElement) {
        clearFieldErrorHighlight(frmElement);
      }
    }
  });
  if (_.isEmpty(msgs)) {
    msgs = errors.error;
  }
  console.log('msg:', msgs);
  showMessagePopup(msgs);
  $('#saveLinkBtn').removeAttr('disabled');

  // enable necessary controls
  if (action == 'add')
    $('#addTeamBtn').removeAttr('disabled');
  else if (action == 'update')
    $('#updateTeamBtn').removeAttr('disabled');
  else if (action == 'delete')
    $('#deleteTeamBtn').removeAttr('disabled');
  else if (action == 'associateParent' || action == 'removeParent' || action == 'parent')
    $('#updateParentBtn').removeAttr('disabled');
  else if (action == 'associateChild' || action == 'removeChild' || action == 'child')
    $('#updateChildBtn').removeAttr('disabled');
  else if (action == 'addTeamMember')
    $('#addMemberBtn').removeAttr('disabled');
  else if (action == 'updateTeamMember')
    $('#updateMemberBtn').removeAttr('disabled');
}

function handleLinkValidation(frmElement, err){
  var errmsg = '';
  var ctr;
  var isValidUrl = true;
  var link, lbl, tmp, tmpErr;
  clearLinkFieldErrorHighlight('url_');
  clearSelectLinkFieldErrorHighlight('linklabel_');
  err.links.forEach(function(klinkStr, iddx) {
    if (klinkStr['linkUrl'] == undefined && klinkStr['linkLabel'] == undefined){
      tmpErr = klinkStr;
    }
    // check linkUrl value e.g. abcd is not a valid url.
    if (klinkStr['linkUrl']) {
      tmpErr = klinkStr['linkUrl'];
      tmp = $.trim(tmpErr.split('is not a valid url').shift());
      $('#importantLinkWrapper .implink').each(function(idx) {
        link = $.trim($(this).val());
        ctr = $(this).attr('data-counter');
        // check if the link is empty then highlight field error
        if (link == '') {
          setFieldErrorHighlight(frmElement + ctr);
        }
        // check if the url is not valid
        if (link === tmp) {
          setFieldErrorHighlight(frmElement + ctr);
          isValidUrl = false;
        }
      });
    }
    // check if the linkId is valid e.g. Wall of work, Defects
    if (klinkStr['linkLabel']){
      tmpErr = klinkStr['linkLabel'];
      $('#importantLinkWrapper .implabel').each(function(idx) {
        ctr = $(this).attr('data-counter');
        lbl = $('#select2-linklabel_'+ctr+'-container').text();
        if (lbl === 'Select label') {
          setFieldErrorHighlight('linklabel_' + ctr);
        }
      });
    }
    errmsg = errmsg + tmpErr + '\n';
  });
  if (isValidUrl==false) errmsg = errmsg + 'URL must start with either http:// or https://';
  return errmsg;
}

function clearLinkFieldErrorHighlight(frmElement) {
  $('#importantLinkWrapper .implink').each(function(idx) {
    var ctr = $(this).attr('data-counter');
    clearFieldErrorHighlight(frmElement + ctr);
  });
}

function clearSelectLinkFieldErrorHighlight(frmElement) {
  $('#importantLinkWrapper .implabel').each(function(idx) {
    var ctr = $(this).attr('data-counter');
    clearFieldErrorHighlight(frmElement + ctr);
  });
}

function setAssociation(obj, action, msg) {
  $.ajax({
    type: 'PUT',
    url: '/api/teams/associates',
    contentType: 'application/json',
    data: JSON.stringify(obj)
  }).fail(function(xhr, textStatus, errorThrown) {
    if (xhr.status == 400) {
      handleTeamValidationErrors(JSON.parse(xhr.responseText), action);
    } else {
      errorHandler(xhr, textStatus, errorThrown);
    }

  }).done(function(data) {
    userTeamList = data.userTeams;
    _.each(data.team, function(obj) {
      updateAgileTeamCache(obj);
    });
    loadSelectedAgileTeam();
    if (!_.isEmpty(msg))
      showMessagePopup(msg);
  });
}

function updateParentAssociation(team) {
  var action = '';
  var message = 'You have successfully updated the Parent team association.';
  var parentId = $('#parentSelectList option:selected').val();

  if (team.parent_team_id == parentId) return;

  if (parentId == '') {
    action = 'removeParent';
    var associate = {
      action: action,
      teamId: team._id,
      targetParent: team.parent_team_id
    };
  } else {
    action = 'associateParent';
    var associate = {
      action: action,
      teamId: team._id,
      targetParent: parentId
    };
  }

  setAssociation(associate, action, message);
}

function updateChildAssociation(team) {
  var action = 'associateChild';
  var message = 'You have successfully created a Child team association.';
  var childId = $('#childSelectList option:selected').val();
  var newChild = [];

  if (team.child_team_id.indexOf(childId) == -1)
    newChild.push(childId);

  if (childId != '') {
    var associate = {
      action: action,
      teamId: team._id,
      targetChild: newChild
    };
    setAssociation(associate, action, message);

  } else {
    setFieldErrorHighlight('childSelectList');
    showMessagePopup('No team selected to associate as a Child team.');
    var errorMsg = {
      'error': {
        'child_team_id': [
          'No team selected to associate as a Child team.'
        ]
      }
    };
    handleTeamValidationErrors(errorMsg, action);
  }
}

function deleteTeam(team) {
  deleteTeamHandler(team, teamIterations, teamAssessments);
}

function deleteTeamHandler(team, iterations, assessments) {
  if (team != null) {
    if (iterations == null) {
      getTeamIterations(team._id, deleteTeamHandler, [team]);
      return;
    }
    if (assessments == null) {
      getTeamAssessments(team._id, true, deleteTeamHandler, [team, iterations]);
      return;
    }
    var hasAssoc = false;
    var msg = 'You have requested to delete ' + team.name + '. \n\n';
    msg = msg + 'This team has the following associations: \n';

    if (team.parent_team_id != undefined && team.parent_team_id != '') {
      msg = msg + '\t Parent team: 1 \n';
      hasAssoc = true;
    }
    if (team.child_team_id != undefined && team.child_team_id.length > 0) {
      msg = msg + '\t Child team(s): ' + team.child_team_id.length + ' \n';
      hasAssoc = true;
    }
    if (iterations != null && iterations.length > 0) {
      msg = msg + '\t Iteration information: ' + iterations.length + ' \n';
      hasAssoc = true;
    }
    if (assessments != null && assessments.length > 0) {
      msg = msg + '\t Maturity assessment(s): ' + assessments.length + ' \n';
      hasAssoc = true;
    }
    if (!hasAssoc)
      msg = msg + '\t Team has no associations. \n';

    msg = msg + '\n\t *You can return to Team Management page to review any of these associations. \n\n';

    msg = msg + 'If you delete this team, any parent/child associations, iteration information, and maturity assessments will be DELETED. \n\n';

    msg = msg + 'Select OK to proceed with the team delete or Cancel.';

    if (confirm(msg)) {
      // set team details for soft delete
      team = $.extend(true, {}, initTeamTemplate(), team);
      team.doc_status = 'delete';

      $.ajax({
        type: 'DELETE',
        url: '/api/teams',
        contentType: 'application/json',
        data: JSON.stringify(team)
      }).fail(function(xhr, textStatus, errorThrown) {
        if (xhr.status == 400) {
          handleTeamValidationErrors(JSON.parse(xhr.responseText), 'delete');
        } else {
          errorHandler(xhr, textStatus, errorThrown);
        }

      }).success(function(data) {
        userTeamList = data;
        updateAgileTeamCache(team);
        updateTeamInfo('reset');
        showMessagePopup('You have successfully deleted the team.');
      });

    } else {
      $('#deleteTeamBtn').removeAttr('disabled');
    }
  }
}


function removeChildOfParent(parentId, childId) {
  getTeam(parentId, removeChildOfParentTeamHandler, [childId]);
}

function removeChildOfParentTeamHandler(childId, team) {
  team = $.extend(true, {}, initTeamTemplate(), team);
  team.child_team_id = _.reject(team.child_team_id, function(id) {
    return id == childId;
  });
  setTeam(team, updateAgileTeamCache, []);
}

function updateParentWithChild(parentId, childId) {
  getTeam(parentId, updateParentWithChildTeamHandler, [childId]);
}

function updateParentWithChildTeamHandler(childId, team) {
  team = $.extend(true, {}, initTeamTemplate(), team);
  if (!_.contains(team.child_team_id, childId)) {
    team.child_team_id.push(childId);
  }
  setTeam(team, updateAgileTeamCache, []);
}

function updateChildTeamWithParent(childId, parentId) {
  getTeam(childId, updateChildTeamWithParentHandler, [parentId]);
}

function updateChildTeamWithParentHandler(parentId, team) {
  team = $.extend(true, {}, initTeamTemplate(), team);
  team.parent_team_id = parentId;
  setTeam(team, updateAgileTeamCache, []);
}

function addTeamMember(person, oldAlloc, newAlloc, oldRole, newRole, action) {
  var teamId = $('#teamSelectList option:selected').val();
  var currentTeam = getAgileTeamCache(teamId);
  var existsMember = false;
  if (!_.isEmpty(currentTeam)) {
    var memberData = _.find(currentTeam.members, function(member) {
      member.allocation = isNaN(parseInt(member.allocation)) ? 0 : member.allocation;
      return member.id == person.email && member.allocation == oldAlloc && member.role == oldRole;
    });

    if (_.isEmpty(memberData)) {
      memberData = new Object();
      memberData.key = person.uid;
      memberData.id = person.email;
      memberData.name = person.name;
      memberData.role = newRole;
      memberData.allocation = isNaN(parseInt(newAlloc)) ? 0 : newAlloc;
      currentTeam.members.push(memberData);

    } else {
      memberData.name = person.name;
      memberData.role = newRole;
      memberData.allocation = isNaN(parseInt(newAlloc)) ? 0 : newAlloc;
    }

    var modifyMembers = {
      teamId : currentTeam['_id'],
      members : currentTeam['members']
    };
    $.ajax({
      type: 'PUT',
      url: '/api/teams/members', // 'api/teams'
      contentType: 'application/json',
      data: JSON.stringify(modifyMembers)  // currentTeam
    }).fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status == 400) {
        handleTeamValidationErrors(JSON.parse(xhr.responseText), action);
      } else {
        errorHandler(xhr, textStatus, errorThrown);
      }

    }).done(function(data) {
      userTeamList = data.userTeams;
      updateAgileTeamCache(data.teamDetails);
      loadSelectedAgileTeam();
      updateMemberInfo('clear');
      if (action == 'addTeamMember')
        showMessagePopup('You have successfully added a Team Member to team ' + currentTeam.name + '.');
      else
        showMessagePopup('You have successfully updated a Team Member.');
    });
  }
}

function deleteTeamMember() {
  var teamId = $('#teamSelectList option:selected').val();
  var currentTeam = getAgileTeamCache(teamId);
  if (!_.isEmpty(currentTeam)) {
    var removeMember = [];
    $("input[name='member']:checked").each(function() {
      var members = [];
      var index = this.value;
      var email = $('#email_ref_' + index).text();
      var alloc = $('#alloc_ref_' + index).text();
      var role = $('#role_ref_' + index).text();
      for (var i = 0; i < currentTeam.members.length; i++) {
        var tempAlloc = isNaN(parseInt(currentTeam.members[i].allocation)) ? 0 : currentTeam.members[i].allocation;
        if (currentTeam.members[i].id == email && tempAlloc == alloc && currentTeam.members[i].role == role) {
          removeMember.push(currentTeam.members[i]);

        } else {
          members.push(currentTeam.members[i]);

        }
      }
      currentTeam.members = members;
    });

    var modifyMembers = {
      teamId : currentTeam['_id'],
      members : currentTeam['members']
    };

    $.ajax({
      type: 'PUT',
      url: '/api/teams/members', //'/api/teams/',
      contentType: 'application/json',
      data: JSON.stringify(modifyMembers)
    }).fail(function(xhr, textStatus, errorThrown) {
      if (xhr.status == 400) {
        handleTeamValidationErrors(JSON.parse(xhr.responseText), 'deleteTeamMember');
      } else {
        errorHandler(xhr, textStatus, errorThrown);
      }

    }).done(function(data) {
      userTeamList = data.userTeams;
      updateAgileTeamCache(data.teamDetails);
      loadSelectedAgileTeam();
      updateMemberInfo('clear');
      showMessagePopup('You have successfully removed Team member(s).');
    });
  }
}

function deleteChildTeam() {
  var message = 'You have successfully removed Child team association(s).';
  var teamId = $('#teamSelectList option:selected').val();
  var currentTeam = getAgileTeamCache(teamId);
  if (!_.isEmpty(currentTeam)) {
    var remainingChildren = [];

    // get the remaining children listed in the table
    for (var i in currentTeam.child_team_id) {
      $("#childrenList tr td[id^='ref_id_']").each(function() {
        var childId = $(this).attr('id').split('ref_id_')[1];
        remainingChildren.push(childId);
      });
    }

    var removeChildren = _.difference(currentTeam.child_team_id, remainingChildren);
    var action = 'removeChild';
    var associate = {
      action: action,
      teamId: currentTeam._id,
      targetChild: removeChildren
    };
  }

  setAssociation(associate, action, message);
}

function removeParentOfChild(teamId) {
  getTeam(teamId, removeParentOfChildTeamHandler, []);
}

function removeParentOfChildTeamHandler(team) {
  team = $.extend(true, {}, initTeamTemplate(), team);
  team.parent_team_id = '';
  setTeam(team, updateAgileTeamCache, []);
}

function updateTeamInfo(action) {
  if (action == 'add') {
    $('#addTeamBtn').attr('disabled', 'disabled');
    updateAction(action);

  } else if (action == 'update') {
    $('#updateTeamBtn').attr('disabled', 'disabled');
    updateAction(action);

  } else if (action == 'delete') {
    $('#deleteTeamBtn').attr('disabled', 'disabled');
    updateAction(action);
      //deleteTeam();

  } else if (action == 'clear' || action == 'reset') {
    $('#addTeamBtn,#updateChildBtn,#addMemberBtn,#updateParentBtn,#cancelMemberBtn').removeAttr('disabled');
    $('#teamName,#teamDesc,#teamMemberName,#memberAllocation').removeAttr('disabled');
    $('#teamSquadYesNo,#memberRoleSelectList,#memberListAction,#parentSelectList,#childSelectList,#childrenListAction,#iterTeamBtn,#assessBtn').removeAttr('disabled');
    $('#teamDesc,#select2-teamSquadYesNo-container,#select2-memberRoleSelectList-container,#select2-memberListAction-container,#select2-parentSelectList-container').css('color', 'black');
    $('#updateTeamBtn,#deleteTeamBtn').attr('disabled', 'disabled');
    jQuery("#teamDetailsPageSection .ibm-show-hide a[class='ibm-show-active']").click();
    displayEditStatus(false);

    if (action == 'clear') {
      var listOption = getAgileTeamDropdownList(allTeams, false);
      //setSelectOptions("teamSelectList", listOption, ["new", "Create new..."], null, null);
    }

    // reload all available teams
    if (action == 'reset')
      agileTeamListHandler('new', allTeams);

    $('#teamSquadYesNo').val('Yes');
    $('#select2-teamSquadYesNo-container').text('Yes');
    $('#select2-teamSquadYesNo-container').attr('title', 'Yes');
    $('#teamName').val('');
    clearFieldErrorHighlight('teamName');
    $('#teamDesc').val('');

    loadTeamMembers(null);
    updateMemberInfo('clear');
    $('#memberListAction').val('');
    $('#select2-memberListAction-container').text('Actions...');
    $('#select2-memberListAction-container').attr('title', 'Actions...');
    $('#select2-memberListAction-container').css('color', 'grey');
    $('#memberListAction').attr('disabled', 'disabled');

    $('#parentSelectList').val('');
    $('#select2-parentSelectList-container').text($('#parentSelectList option:selected').text());
    $('#select2-parentSelectList-container').attr('title', $('#parentSelectList option:selected').text());

    $('#childSelectList').val('');
    $('#select2-childSelectList-container').text($('#childSelectList option:selected').text());
    $('#select2-childSelectList-container').attr('title', $('#childSelectList option:selected').text());

    $('#childrenListAction').val('');
    $('#select2-childrenListAction-container').text('Actions...');
    $('#select2-childrenListAction-container').attr('title', 'Actions...');

    $('#teamDetailsPageSection').fadeOut();

  } else if (action == 'parent') {
    $('#updateParentBtn').attr('disabled', 'disabled');
    updateAction(action);

  } else if (action == 'child') {
    $('#updateChildBtn').attr('disabled', 'disabled');
    updateAction(action);

  }
}

function updateMemberInfo(action) {
  if (action == 'clear') {
    taPerson = null;
    //getAllAgileTeamRoles(agileTeamRolesHandler, []);
    $('#otherRoleDescSection').fadeOut();
    $('#memberRoleSelectList').val('');
    $('#memberRoleSelectList').trigger('change');
    clearFieldErrorHighlight('memberRoleSelectList');
    $('#otherRoleDesc').val('');
    clearFieldErrorHighlight('otherRoleDesc');
    $('#teamMemberName').val('');
    clearFieldErrorHighlight('teamMemberName');
    $('#memberAllocation').val('');
    clearFieldErrorHighlight('memberAllocation');
    $('#teamMemberName').removeAttr('disabled');
    $('#addMemberBtn').removeAttr('disabled');
    $('#updateMemberBtn').attr('disabled', 'disabled');
    $('#memberListAction').attr('disabled', 'disabled');
    $('#select2-memberListAction-container').text('Action...');
    $("input[name='member']:checked").each(function() {
      this.checked = false;
    });
    return;
  }

  if (action == 'addTeamMember' || action == 'updateTeamMember') {
    $('#addMemberBtn').attr('disabled', 'disabled');
    $('#memberListAction').attr('disabled', 'disabled');
    $('#updateMemberBtn').attr('disabled', 'disabled');
    var hasError = false;
    var currAlloc = isNaN(parseInt($('#memberAllocation').val())) ? 0 : parseInt($('#memberAllocation').val());
    if (taPerson == undefined || $('#teamMemberName').val() == '') {
      setFieldErrorHighlight('teamMemberName');
      showMessagePopup('Unable to retrieve information from Faces for the member indicated.  Please try the selection again.');
      hasError = true;
    } else if (isNaN(currAlloc) || (currAlloc < 0 || currAlloc > 100)) {
      setFieldErrorHighlight('memberAllocation');
      showMessagePopup('Team member allocation should be between <br> 0 - 100');
      hasError = true;
    } else if ($('#memberRoleSelectList option:selected').val() == '') {
      setFieldErrorHighlight('memberRoleSelectList');
      showMessagePopup('Please select a valid role');
      hasError = true;
    } else if ($('#memberRoleSelectList option:selected').val() == 'other' && $('#otherRoleDesc').val().trim() == '') {
      setFieldErrorHighlight('otherRoleDesc');
      showMessagePopup('Specify the "Other" role for the selected member.');
      hasError = true;
    }

    if (hasError) {
      if (action == 'addTeamMember')
        $('#addMemberBtn').removeAttr('disabled');
      else if (action == 'updateTeamMember')
        $('#updateMemberBtn').removeAttr('disabled');

      return;
    }
  }

  var name = taPerson['name'];
  var email = taPerson['email'];
  var alloc = currAlloc;
  var location = taPerson['location'];
  var role = $('#memberRoleSelectList option:selected').val();

  if ($('#memberRoleSelectList option:selected').val() == 'other') {
    role = $('#otherRoleDesc').val();
  }

  if (action == 'addTeamMember') {
    $('#memberList td.dataTables_empty').parent().remove();
    addTeamMember(taPerson, null, alloc, null, role, action);

  } else if (action == 'updateTeamMember') {
    var index = $("input[name='member']:checked").attr('value');

    var oldAlloc = $('#alloc_ref_' + index).text();
    var oldRole = $('#role_ref_' + index).text();

    $('#email_ref_' + index).html(email);
    $('#alloc_ref_' + index).html(alloc);
    $('#role_ref_' + index).html(role);

    addTeamMember(taPerson, oldAlloc, alloc, oldRole, role, action);
    $("input[name='member']")[index].checked = false;
    $('#memberListAction').val('');
    $('#select2-memberListAction-container').text('Action...');
    $('#select2-memberListAction-container').attr('title', 'Action...');
  }
}

function selectMember(elmnt) {
  elmnt.attr('checked') ? elmnt.parent().parent().addClass('ibm-row-selected') :
    elmnt.parent().parent().removeClass('ibm-row-selected');

  var count = $('input[name="member"]:checked').length;
  if (count == $('input[name="member"]').length) {
    $('#all').attr('checked', 'checked');
  } else {
    $('#all').removeAttr('checked');
  }

  if (count > 0) {
    clearFieldErrorHighlight('teamMemberName');
    $('#memberListAction').removeAttr('disabled');
    $('#memberAction').html('Actions... (' + count + ')');
    $('#select2-memberListAction-container').text('Actions... (' + count + ')');
    $('#select2-memberListAction-container').attr('title', 'Actions... (' + count + ')');
    $('#select2-memberListAction-container').css('color', 'black');

  } else {
    $('#memberListAction').val('');
    $('#select2-memberListAction-container').text('Actions...');
    $('#select2-memberListAction-container').attr('title', 'Actions...');
    $('#select2-memberListAction-container').css('color', 'grey');
    $('#memberListAction').attr('disabled', 'disabled');
    updateMemberInfo('clear');
  }
}

function selectChild(elmnt) {
  elmnt.attr('checked') ? elmnt.parent().parent().addClass('ibm-row-selected') :
    elmnt.parent().parent().removeClass('ibm-row-selected');

  var count = $('input[name="child"]:checked').length;
  if (count == $('input[name="child"]').length) {
    $('#all').attr('checked', 'checked');
  } else {
    $('#all').removeAttr('checked');
  }

  if (count > 0) {
    $('#childrenListAction').removeAttr('disabled');
    $('#childrenAction').html('Actions... (' + count + ')');
    $('#select2-childrenListAction-container').text('Actions... (' + count + ')');
    $('#select2-childrenListAction-container').attr('title', 'Actions... (' + count + ')');
    $('#select2-childrenListAction-container').css('color', 'black');
  } else {
    $('#childrenListAction').val('');
    $('#select2-childrenListAction-container').text('Actions...');
    $('#select2-childrenListAction-container').attr('title', 'Actions...');
    $('#select2-childrenListAction-container').css('color', 'grey');
    $('#childrenListAction').attr('disabled', 'disabled');
  }
}

function getApiKey() {
  // call server side to get a JSON with uuid
  var uuidKey;

  $.ajax({
    type: 'GET',
    url: '/api/developer/apiKey'
  }).done(function(data) {
    if (data != undefined) {
      uuidKey = data.apiKey;
      //console("user id: "+ req.session['user'].shortEmail+"|| apiKey: "+uuidKey);

      $('#apiKey').html(uuidKey);
      $('#apiKeySection').show();
    }
  });
}
