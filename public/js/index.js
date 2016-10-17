var requests = []; //global array to keep track of the ajax called; used to cancel pending requests when switching tabs
var defSelTeamId = '';
var defSelIndex = '';
var squadList = [];
var loadedParentId = '';
var teamLocation = [];
var piechartData = {};
var isFirefox = typeof InstallTrigger !== 'undefined';
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var userAccess = ['Yanliang.Gu1@ibm.com','leip@us.ibm.com','hourihan@us.ibm.com','john.elden.revano@ibm.com','amy_travis@us.ibm.com'];
var colorArray = ['#4178BE','#C0E6FF','#7CC7FF','#5AAAFA','#5596E6','#4178BE','#325C80','#264A60','#1D3649','#152935','#010205','#008571','#A7FAE6','#6EEDD8','#41D6C3','#00B4A0','#006D5D','#005448'];
var tempIterationData = function() {
  var iterationMonth = 5;
  var rollupDataList = [];
  for (var i=0; i<=iterationMonth; i++) {
    rollupDataList.push({
      'totalPoints': 0,
      'totalCommPoints': 0,
      'totalStories': 0,
      'totalCommStories': 0,
      'totalCompleted': 0,
      'totalDefectsStartBal': 0,
      'totalDefects': 0,
      'totalDefectsClosed': 0,
      'totalDefectsEndBal': 0,
      'totalDplymts': 0,
      'totTeamStat': 0,
      'totClientStat': 0,
      'totTeamStatIter': 0,
      'totClientStatIter': 0,
      'totCycleTimeBacklog': 0,
      'totCycleTimeWIP': 0,
      'totCycleTimeBacklogIter': 0,
      'totCycleTimeWIPIter': 0,
      'teamsLt5': 0,
      'teams5to12': 0,
      'teamsGt12': 0,
      'totalSquad': 0,
      'month': '',
      'partialMonth': false
    });
  }
  return rollupDataList;
};

var tempSquadScore = {
  'fte5to12': 0,
  'fteGt12': 0,
  'fteLt5': 0,
  'tc5to12': 0,
  'tcGt12': 0,
  'tcLt5': 0,
  'teams5to12': 0,
  'teamsGt12': 0,
  'teamsLt5': 0
};

var assessmentTempData = function() {
  var iterationMonth = 5;
  var rollupDataList = [];
  for (var i=0; i<=iterationMonth; i++) {
    rollupDataList.push({
      'less_120_days': 0,
      'gt_120_days': 0,
      'no_submission': 0,
      'prj_foundation_score': 0,
      'prj_devops_score': 0,
      'operation_score': 0,
      'total_prj_foundation': 0,
      'total_prj_devops': 0,
      'total_operation': 0,
      'totalSquad': 0,
      'month': '',
      'partialMonth': false
    });
  }
  return rollupDataList;
};

google.charts.load('current', {packages:['corechart']});

jQuery.expr[':'].Contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

jQuery(function($) {
  $(document).ready(function() {
    getPageVariables('home', initPageAction);
  });

  function initPageAction() {
    var urlParameters = getJsonParametersFromUrl();
    if (urlParameters != undefined && urlParameters.testUser != undefined) {
      setTestUser(urlParameters.testUser);
      alert('here TestUser is: ' + urlParameters.testUser);
    }
    // default to My team(s) view
    //$("#myTeams").click();
    hideAllContentAreaDivs();
    getMyTeams();
  }

  $( window ).resize(function() {
    redrawCharts('iterationSection');
    redrawCharts('assessmentSection');
  });

  $('#myTeams').click(function() {
    if ($(this).attr('data-state') != 'open') {

      $($(this)).attr('data-state', 'open');
      $('#allTeams').attr('data-state', '');
      $('#nameSearchField').hide();
      $('#nameSearchField').val('');
      // if (isFirefox) {
      $('#searchCancel').hide();
      // }
      hideAllContentAreaDivs();
      getMyTeams();
    }
  });

  $('#allTeams').click(function() {
    if ($(this).attr('data-state') != 'open') {

      $($(this)).attr('data-state', 'open');
      $('#myTeams').attr('data-state', '');
      $('#nameSearchField').show();
      // if (isFirefox) {
      // $('#searchCancel').css('display','inline-block');
      // }
      hideAllContentAreaDivs();
      if (defSelTeamId != '') {
        $('#teamTree').hide();
        $('#spinnerContainer-search').show();
        loadParentInAllTeams(defSelTeamId, true);
      } else {
        getRootTeams();
      }
    }
  });

  $('#nameSearchField').focus(function(){
    if ($('#nameSearchField').val() != '') {
      $('#teamTree').hide();
      $('#searchTree').show();
    }
  });

  // $('#nameSearchField').focusout(function(){
  //   // if ($('#nameSearchField').val() != '') {
  //   //   $('#teamTree').hide();
  //   //   $('#searchTree').show();
  //   // }
  //   setTimeout(function(){
  //     $('#teamTree').show();
  //     $('#searchTree').hide();
  //   }, 300);
  // });

  $('#nameSearchField').on('input', function() {
    var inputText = $('#nameSearchField').val();
    if (inputText == '') {
      clearRequests();
      $('#spinnerContainer-search').hide();
      $('#teamTree').show();
      $('#searchTree').empty();
      $('#searchTree').hide();
      $('#searchCancel').hide();
    }
    if (inputText != '' && inputText != ' ') {
      $('#searchCancel').show();
      searchTeams(inputText);
    }
  });

  $('#switchBtn').click(function(){
    if ($('#switchBtn').html() == 'Switch to Time Zone Analysis') {
      $('#switchBtn').html('Switch to Location Analysis');
      google.charts.setOnLoadCallback(function(){
        drawChart(piechartData, false);
      });
    } else {
      $('#switchBtn').html('Switch to Time Zone Analysis');
      google.charts.setOnLoadCallback(function(){
        drawChart(piechartData, true);
      });
    }
  });

  $('#teamscoreFormula').click(function(){
    $.getJSON('./docs/teamscore.json', function(data) {
      $('#overlayExampleLarge').html('');
      var items = '<h>';
      items = items + (data.header)[0] + '</h><p>';
      items = items + (data.content)[0] + '</p><br><h>';
      items = items + (data.header)[1] + '</h><p>';
      items = items + (data.content)[1] + '</p><br>';
      items = items + '<img id=\'teamscoreImg\' src=\'\.\/img\/teamscore-formula\.png\' alt=\'Team score formula\'>';
      $('#overlayExampleLarge').html(items);
    });
    IBMCore.common.widget.overlay.show('overlayExampleLarge');
    return false;
  });

  $('#searchCancel').click(function(){
    $('#nameSearchField').val('');
    $('#teamTree').show();
    $('#searchTree').hide();
    $('#searchCancel').hide();
  });
});

//this function will cancel ajax calls to prevent things from executing
//i.e clicking between tabs quickly or clicking a squad/team and then clicking a tab
function clearRequests() {
  for (var i = 0; i < requests.length; i++)
    requests[i].abort();
  requests.length = 0;
}

function hideAllContentAreaDivs() {
  $('.nano').nanoScroller({
    destroy: true
  });
  clearRequests();
  //$('#searchTree').empty();
  $('#searchTree').hide();
  $('#mainContent').hide();
  $('#no-teams-highlightbox').hide();
  $('#spinnerContainer').hide();
  $('#spinnerContainer-search').hide();
  $('#nameSearchField').val('');
}

function getMyTeams() {
  selectedElement = '';
  $('#mainContent').hide();
  $('#spinnerContainer').show();

  $('#teamTree').empty();
  $('#teamTree').show();
  $('#teamTree').append(createMainTwistySection('teamTreeMain', ''));
  $('#teamTreeMain').twisty();
  getMyTeamsFromDb(true);
}

function getRootTeams(parentsTree) {
  selectedElement = '';
  $('#mainContent').hide();
  $('#spinnerContainer').show();
  $('#teamTree').empty();
  $('#teamTree').show();

  getAllAgileTeamsByParentId('', true, true, parentsTree);
}

function searchTeams(keyword) {
  clearRequests();
  $('#spinnerContainer-search').show();
  $('#teamTree').hide();
  $('#searchTree').empty();
  $('#searchTree').append(createMainTwistySection('searchTreeMain', ''));
  var cUrl = '/api/teams/search/' + encodeURIComponent(keyword);
  var req = $.ajax({
    type: 'GET',
    url: cUrl
  }).done(function(data) {
    if (data != undefined) {
      if (data.docs.length > 0) {
        var teams = data.docs;
        var twistyId = 'searchTreeMain';
        var sortedTeams = _.sortBy(teams, function(team) {
          return team.name.toUpperCase();
        });
        _.each(sortedTeams, function(team){
          addTeamToSearchTree(team, twistyId);
        });
      }
    }
    $('#spinnerContainer-search').hide();
    $('#searchTree').show();
  }).fail(function(e){
    console.log(e);
    if (e.status == 404) {
      $('#spinnerContainer-search').hide();
      $('#searchTree').show();
    } else {
      $('#spinnerContainer-search').hide();
      $('#teamTree').show();
    }
  });
  requests.push(req);
}

function getMyTeamsFromDb(initial, loadStandalone) {
  var cUrl = '/api/snapshot/getteams/' + encodeURIComponent(userInfo.email);
  var req = $.ajax({
    type: 'GET',
    url: cUrl
  }).done(function(data) {
    if (data != undefined) {
      if (data.length > 0) {
        //no duplicates
        var uniqueTeams = _.uniq(data, function(item) {
          return item._id;
        });
        var twistyId = 'teamTreeMain';
        var standalone = false;
        var sortedTeams = _.sortBy(uniqueTeams, function(team) {
          if (team.children.length == 0 && team.parents.length == 0) {
            standalone = true;
          }
          return team.name.toUpperCase();
        });

        if (standalone) {
          var standaloneTeam = {
            '_id': 'ag_team_standalone',
            'isSquad': false,
            'name': 'Standalone Teams',
          };
          sortedTeams.push(standaloneTeam);
        }
        _.each(sortedTeams, function(team) {
          addTeamToTree(team, twistyId, true);
        });
        if (initial) {
          if (standalone) {
            twistyId = 'main_sub_ag_team_standalone';
            $('#bodysub_ag_team_standalone').append(createMainTwistySection(twistyId, ''));
            _.each(sortedTeams, function(team) {
              addTeamToTree(team, twistyId, true);
            });
            $('#sub_' + jq('ag_team_standalone')).addClass('ibm-active');
            $('#sub_' + jq('ag_team_standalone')).attr('hasChildren', 'Yes');
            $('#sub_' + jq('ag_team_standalone') + (' a.ibm-twisty-body')).css('display', 'block');
            var defaultTeam = ($('#teamTreeMain li')[0]).id;
            if (defaultTeam == 'sub_ag_team_standalone') {
              defaultTeam = ($('#sub_ag_team_standalone li')[0]).id;
            }
          } else {
            var defaultTeam = ($('#teamTreeMain li')[0]).id;
          }
          if ($('#sub_'+jq(defSelTeamId)).length > 0) {
            loadDetails('sub_' + defSelTeamId);
          } else {
            loadDetails(defaultTeam);
          }
          $('.nano').nanoScroller();
        } else {
          if ($('#no-teams-highlightbox').css('display') == 'none')
            $('#mainContent').show();
          $('#spinnerContainer').hide();
        }
      } else {
        $('#spinnerContainer').hide();
        $('#no-teams-highlightbox').show();
        showLog('data loaded: ' + JSON.stringify(data));
      }
    }
  }).fail(function(e) {
    $('#spinnerContainer').hide();
  });
  requests.push(req);
}

//add refresh timestamp after Iteration trend title
function setRefreshDate(timestamp) {
  //var myDate = new Date(timestamp*1000); // creates a date that represents the number of milliseconds after midnight GMT on Januray 1st 1970.
  //$("#refreshDate").html(moment(myDate).format("DD-MMM-YYYY, hh:mm"));
  $('#refreshDate').html(moment.utc(timestamp * 1000).format('MMM DD, YYYY, HH:mm (z)'));
}

//refresh button on the screen to refresh snapshot from workers
function performChartRefresh(teamId, teamName) {
  destroyIterationCharts();
  //destroyAssessmentCharts();
  getSnapshot(teamId, teamName);
}

function removeHighlightParents(treeLinkId) {
  if (treeLinkId != null) {
    //console.log($("#"+jq(treeLinkId)).children("a.agile-team-link")[0]);
    $($('#' + jq(treeLinkId)).children('a.agile-team-link')[0]).removeClass('agile-team-parent-selected');
  } else {
    $('#teamTree a.agile-team-parent-selected').removeClass('agile-team-parent-selected');
  }
}

function highlightParents(treeLinkId) {
  if (treeLinkId != null) {
    $('#' + jq(treeLinkId)).removeClass('agile-team-parent-selected');
    if (treeLinkId != '' && $('#' + jq(treeLinkId) + ' a.agile-team-selected').length == 1) {
      $($('#' + jq(treeLinkId)).children('a.agile-team-link')[0]).addClass('agile-team-parent-selected');
    }
  } else {
    var li = $('#teamTree a.agile-team-selected').parents('li');
    for (var i = 1; i <= li.length; i++) {
      var element = li[i];
      $($(element).children('a.agile-team-link')[0]).addClass('agile-team-parent-selected');
    }
  }
}

function expandParentTeam(treeLinkId, parentsTree) {
  if (treeLinkId != null) {
    if ($('#' + jq(treeLinkId)).attr('hasChildren') != 'Yes') {
      var parentId = treeLinkId.substring(4, treeLinkId.length);
      getAllAgileTeamsByParentId(parentId, false);
    }
    $('#' + jq(treeLinkId)).attr('hasChildren', 'Yes');
  }
}

function loadParentInAllTeams(teamId, fromSearch) {
  $('#mainContent').hide();
  $('#spinnerContainer').show();
  var cUrl = '/api/teams/lookup/team/' + encodeURIComponent(teamId);
  var req = $.ajax({
    type: 'GET',
    url: cUrl
  }).done(function(data) {
    if (data != null) {
      if (fromSearch) {
        if (data.parents.length == 0 && data.children.length == 0) {
          data.parents.push('ag_team_standalone');
        }
        data.parents.unshift(teamId);
      }
      if (data.parents != undefined && !_.isEmpty(data.parents)) {
        $($('#allTeams')).attr('data-state', 'open');
        $('#myTeams').attr('data-state', '');
        $('.nano').nanoScroller({
          destroy: true
        });
        //$('#searchTree').empty();
        $('#nameSearch').show();
        $('#searchTree').hide();
        $('#mainContent').hide();
        $('#no-teams-highlightbox').hide();
        $('#spinnerContainer').hide();
        $('#spinnerContainer-search').hide();
        getRootTeams(data.parents);
      }
    }
  });
  requests.push(req);
}

function getAllAgileTeamsByParentId(parentId, showLoading, initial, parentsTree) {
  if (showLoading) {
    $('#mainContent').hide();
    $('#spinnerContainer').show();
  }
  var cUrl;
  if (parentId == 'ag_team_standalone') {
    cUrl = '/api/teams?parent_team_id=';
  } else {
    cUrl = '/api/teams?parent_team_id=' + encodeURIComponent(parentId);
  }
  var req = $.ajax({
    type: 'GET',
    url: cUrl,
    async: false
  }).done(function(data) {
    if (data != undefined) {
      console.log('data has rows ' + _.has(data, 'docs'));
      //console.log("data has value " + _.has(data, 'value'));
      if (_.has(data, 'docs')) {
        if (data.docs == null) {
          console.log('data loaded failed');
        } else {
          var twistyId;
          var sortedTeams = _.sortBy(data.docs, function(team) {
            return team.name.toUpperCase();
          });
          if (parentId == '') {
            twistyId = 'teamTreeMain';
            $('#teamTree').append(createMainTwistySection('teamTreeMain', ''));
            $('#teamTreeMain').twisty();
            var standaloneTeam = {
              '_id': 'ag_team_standalone',
              'isSquad': false,
              'name': 'Standalone Teams',
            };
            sortedTeams.push(standaloneTeam);
          } else {
            //twistyId = 'main_' + parentId;
            //$("#"+ 'bodysub_' + jq(parentId)).append(createMainTwistySection(twistyId, ""));
            twistyId = 'bodysub_' + parentId;
          }
          //$("#"+jq(twistyId)).twisty();
          if (sortedTeams.length > 0) {
            var mainTwistyId = 'main_sub_' + parentId;
            $('#' + jq(twistyId)).append(createMainTwistySection(mainTwistyId, ''));
          }
          _.each(sortedTeams, function(team) {
            if (team.doc_status != 'delete') {
              addTeamToTree(team, mainTwistyId, false);
            }
          });
          if (parentsTree != undefined) {
            if (!_.isEmpty(parentsTree)) {
              var findVar = _.find(parentsTree, function(parentTeamId){
                if ($('#sub_' + jq(parentTeamId)).length > 0) {
                  loadedParentId = parentsTree.splice(parentsTree.indexOf(parentTeamId),1);
                  $('#sub_' + jq(parentTeamId)).addClass('ibm-active');
                  $('#sub_' + jq(parentTeamId)).attr('hasChildren', 'Yes');
                  $('#sub_' + jq(parentTeamId) + (' a.ibm-twisty-body')).css('display', 'block');
                  getAllAgileTeamsByParentId(parentTeamId, false, false, parentsTree);
                  return parentTeamId;
                }
              });
              // var parentTeamId = parentsTree[parentsTree.length - 1];
              // $('#sub_' + jq(parentTeamId)).addClass('ibm-active');
              // $('#sub_' + jq(parentTeamId)).attr('hasChildren', 'Yes');
              // $('#sub_' + jq(parentTeamId) + (' a.ibm-twisty-body')).css('display', 'block');
              // loadedParentId = parentsTree.splice(parentsTree.length - 1, 1);
              // getAllAgileTeamsByParentId(parentTeamId, false, false, parentsTree);
            } else {
              if (loadedParentId != undefined && loadedParentId != '') {
                var subTwistyId = 'sub_' + loadedParentId;
                loadDetails(subTwistyId, true);
                $('.nano').nanoScroller();
              }
              // $('#mainContent').show();
              // $('#spinnerContainer').hide();
            }
          } else {
            if (initial) {
              var defaultTeam = ($('#teamTreeMain li')[0]).id;
              loadDetails(defaultTeam);
              $('.nano').nanoScroller();
            } else {
              $('#mainContent').show();
              $('#spinnerContainer').hide();
            }
          }
        }
      } else {
        showLog('data loaded: ' + JSON.stringify(data));
      }
    }
  })
  .fail(function(e){
    console.log(e);
  });
  requests.push(req);
}

function getTeamSnapshots(teamId, teamName){
  getSnapshot(teamId, teamName);
  getAssessmentSnapshot(teamId);
}

function getAssessmentSnapshot(teamId) {
  $('#squad_assessment_card').hide();
  $('#nsquad_assessment_card').show();
  var cUrl = '/api/snapshot/rollupassessmentbyteam/' + encodeURIComponent(teamId);
  var req = $.ajax({
    type: 'GET',
    url: cUrl
  }).done(function(data) {
    if (data != undefined) {
      if (_.has(data, 'rows')) {
        var timestamp;
        if (data.rows == null) {
            //console.log("data loaded failed");
        } else if (data.rows.length <= 0) {
          console.log('no assessment data for team: ', teamId);
          timestamp = getServerDateTime();
          timestamp =  getDate(timestamp, false);
          assessmentParentRollup(assessmentTempData(), timestamp);
        } else {
          timestamp = data.rows[0].value.timestamp;
          timestamp =  getDate(timestamp, true);
          assessmentParentRollup(data.rows[0].value.value, timestamp);
        }
      } else {
        showLog('data loaded: ' + JSON.stringify(data));
      }
    }
  })
  .fail(function(err) {
    console.log(err);
    $('#spinnerContainer').hide();
  });
  requests.push(req);
}

function getSnapshot(teamId, teamName) {
  $('#mainContent').hide();
  $('#spinnerContainer').show();
  var cUrl = '/api/snapshot/rollupsquadsbyteam/' + encodeURIComponent(teamId);
  var req = $.ajax({
    type: 'GET',
    url: cUrl
  }).done(function(data) {
    if (data != undefined) {
        //console.log("data has rows " + _.has(data, 'rows'));
        //console.log("data has value " + _.has(data, 'value'));
      if (_.has(data, 'rows')) {
        if (data.rows == null) {
            //console.log("data loaded failed");
        } else if (data.rows.length <= 0) {
          console.log('no iteation data for team: ', teamId);
          $('#refreshDate').html('Waiting for updating');
          iterationScoreCard(teamId, teamName, tempIterationData(), tempSquadScore);
        } else {
          var nonsquadScore = data.rows[0].value.value;
          var cUrl = '/api/snapshot/rollupdatabyteam/' + encodeURIComponent(teamId);
          var innerReq = $.ajax({
            type: 'GET',
            url: cUrl
          }).done(function(data) {
            if (data != undefined) {
              console.log('data has rows ' + _.has(data, 'rows'));
              //console.log("data has value " + _.has(data, 'value'));
              if (_.has(data, 'rows')) {
                if (data.rows == null) {
                  console.log('data loaded failed');
                } else if (data.rows.length <= 0) {
                  console.log('no squad data for team: ', teamId);
                  $('#refreshDate').html('Waiting for updating');
                  iterationScoreCard(teamId, teamName, data.rows[0].value.value, tempSquadScore);
                } else {
                  var iterationData = data.rows[0].value.value;
                  setRefreshDate(data.rows[0].value.timestamp); //TODO
                  iterationScoreCard(teamId, teamName, iterationData, nonsquadScore);
                }
              } else {
                showLog('data loaded: ' + JSON.stringify(data));
              }
            }
          });
          requests.push(innerReq);
          // iterationScoreCard(teamId, teamName, iterationData);
        }
      } else {
        showLog('data loaded: ' + JSON.stringify(data));
      }
    }
  })
  .fail(function(err) {
    console.log(err);
    $('#spinnerContainer').hide();
  });
  requests.push(req);
};

function getParentName(team) {
  var keyLabel = 'Parent Team Name';
  var keyValue = '(No parent team information)';
  if (team['parent_team_id'] != '' && team['parent_team_id'] != undefined) {
    var cUrl = '/api/teams/lookup/team/' + encodeURIComponent(team['parent_team_id']);
    var req = $.ajax({
      type: 'GET',
      url: cUrl
    }).done(function(data) {
      if (data != null && data.name != undefined) {
        keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:loadParentInAllTeams('" + team['_id'] + "');\">" + data.name + '</a>' + "<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:loadParentInAllTeams('" + team['_id'] + "');\"><span class='ibm-access'>Go to parent team</span></a></p>";
      }
      appendRowDetail(keyLabel, keyValue);
    })
    .fail(function(err) {
      console.log(err);
      appendRowDetail(keyLabel, keyValue);
    });
    requests.push(req);
  }
};

function jq(myid) {
  return myid.replace(/(:|\.|\[|\]|,|\/| )/g, '\\$1');
};

function addTeamToSearchTree(team, twistyId) {
  if (team != null && team.doc_status != 'delete') {
    var subTwistyId = 'search_' + team._id;
    var label = team.name;
    var isSquad = false;
    if (team.squadteam != undefined && team.squadteam.toUpperCase() == 'YES') {
      isSquad = true;
    }
    $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, 'agile-team-standalone' + (isSquad ? ' agile-team-squad' : ''), team._id));
    var link = $('#' + jq(subTwistyId) + ' a.agile-team-link');
    var linkId = 'link_' + subTwistyId;
    link.attr('id', linkId);
    link.on('click', function() {
      $('.nano').nanoScroller;
      $('#searchTree').hide();
      $('#teamTree').show();
      loadParentInAllTeams(team._id, true);
    });
  }
}

function addTeamToTree(team, twistyId, isMyTeams) {
  if (team != null) {
    var isSquad = false;
    if (team.squadteam != undefined && team.squadteam.toUpperCase() == 'YES') {
      isSquad = true;
    }
    var label = team.name;
    var subTwistyId = 'sub_' + team._id;

    if (twistyId == 'main_sub_ag_team_standalone') {
      if (isMyTeams) {
        if (team._id != 'ag_team_standalone') {
          if (team.parents.length == 0 && team.children.length == 0) {
            $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, 'agile-team-standalone' + (isSquad ? ' agile-team-squad' : ''), team._id));
          }
        }
      } else {
        if (team.child_team_id.length == 0 && (team.parent_team_id == '' || team.parent_team_id == undefined)) {
          $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, 'agile-team-standalone' + (isSquad ? ' agile-team-squad' : ''), team._id));
        }
      }
    } else {
      if (team._id == 'ag_team_standalone') {
        $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, '', team._id));
      } else {
        if (isMyTeams) {
          if (!_.isEmpty(team.child_team_id)) {
            $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, (isSquad ? 'agile-team-standalone' : ''), team._id));
          } else if (team.children.length == 0 && team.parents.length > 0) {
            $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, 'agile-team-standalone' + (isSquad ? ' agile-team-squad' : ''), team._id));
          }
        } else {
          if (!_.isEmpty(team.child_team_id)) {
            $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, (isSquad ? 'agile-team-standalone' : ''), team._id));
          } else if (_.isEmpty(team.child_team_id) && team.parent_team_id != '' && team.parent_team_id != undefined) {
            $('#' + jq(twistyId)).append(createSubTwistySection(subTwistyId, label, 'agile-team-standalone' + (isSquad ? ' agile-team-squad' : ''), team._id));
          }
        }
      }
    }

    if (team._id != 'ag_team_standalone') {
      var link = $('#' + jq(subTwistyId)).find('a.agile-team-link');
      var linkId = 'link_' + subTwistyId;
      link.attr('id', linkId);
      link.on('click', function() {
        $('.nano').nanoScroller;
        loadDetails(subTwistyId);
      });
    }
    //treeLinkId = "";
    var trigger = $('#' + jq(subTwistyId)).find('a.ibm-twisty-trigger');
    trigger.attr('title', 'Expand/Collapse').on('click', function() {
      if ($('#' + jq(subTwistyId)).hasClass('ibm-active')) {
        highlightParents(subTwistyId);
      } else {
        removeHighlightParents(subTwistyId);
        expandParentTeam(subTwistyId);
      }
    });
  }
}

function createMainTwistySection(twistyId, extraClass) {
  var ul = document.createElement('ul');
  ul.setAttribute('class', 'ibm-twisty ' + extraClass);
  ul.setAttribute('id', twistyId);
  return ul;
}

function createSubTwistySection(twistyId, twistyLabel, extraClass, teamId) {

  var li = document.createElement('li');
  li.setAttribute('data-open', 'false');
  if (extraClass.indexOf('agile-team-standalone') > -1)
    li.setAttribute('class', 'agile-team-standalone');
  li.setAttribute('id', twistyId);

  var spanLink = document.createElement('span');
  spanLink.setAttribute('class', 'ibm-access');
  spanLink.appendChild(document.createTextNode(twistyLabel));

  var span = document.createElement('a');
  span.setAttribute('class', 'ibm-twisty-trigger');
  span.setAttribute('href', '#toggle');
  span.appendChild(spanLink);
  li.appendChild(span);

  var href = document.createElement('a');
  href.setAttribute('class', 'agile-team-link ' + extraClass);
  href.setAttribute('title', 'View ' + twistyLabel + ' team information ');
  href.appendChild(document.createTextNode(twistyLabel));
  li.appendChild(href);

  //we're putting this span to hold the relevant team id
  span = document.createElement('span');
  span.setAttribute('class', 'ibm-access');
  span.appendChild(document.createTextNode(teamId));
  li.appendChild(span);

  var div = document.createElement('div');
  div.setAttribute('class', 'ibm-twisty-body');
  div.setAttribute('id', 'body' + twistyId);
  div.setAttribute('display', 'none');
  li.appendChild(div);

  return li;
}

/**
 * Callback function to handle other related faces information for a team member.
 *
 * @param index - element index id to update
 * @param userEmail - user email.
 * @param facesPerson - faces object.
 */
function facesPersonHandler(index, userEmail, facesPerson) {
  if (facesPerson != null) {
    $('#location_ref_' + index).text(facesPerson.location);
    teamLocation.push(facesPerson.location);
  } else {
    teamLocation.push('us');
    $('#location_ref_' + index).text('-unavailable-');
  }
}

/**
 * Appends team related information in the team information table.
 *
 * @param keyLabel - team information label.
 * @param keyValue - team information value.
 */
function appendRowDetail(keyLabel, keyValue, noParagraph) {
  var rowId = jq(keyLabel)
  var row = '<tr id="'+rowId+'">';
  if (noParagraph) {
    row = row + '<td><p>' + keyLabel + '</p></td>';
    row = row + '<td>' + keyValue + '</td>';
  } else {
    row = row + '<td><p>' + keyLabel + '</p></td>';
    row = row + '<td><p>' + keyValue + '</p></td>';
  }
  row = row + '</tr>';
  $('#levelDetail').append(row);
}

function teamMemCount(teamMembers) {
  var teamCount = 0;
  var tmArr = [];
  $.each(teamMembers, function(key, member) {
    if (tmArr.indexOf(member.id) == -1) {
      teamCount++;
      tmArr.push(member.id);
    }
  });
  return teamCount;
}

function teamMemFTE(teamMembers) {
  var teamCount = 0;
  var tmArr = [];
  $.each(teamMembers, function(key, member) {
    teamCount += parseInt(member.allocation);
  });
  return (teamCount / 100);
}

function displaySelected(teamId, reload) {
  //defSelTeamId = teamId;
  if (reload == null) {
    $('#allTeams').click();
  } else if (reload) {
    loadDetails('sub_' + teamId, true);
  } else
    loadDetails('sub_' + teamId);
}


/**
 * Global variable holder for highligted team in the team hierarchy table.
 */
var selectedElement = '';
/**
 * Retrieves the team related information to be shown in the page.
 *
 * @param elementId - selected element id. ('sub_xxxx')
 */

function performSnapshotPull(teamId, teamName) {
  destroyIterationCharts();
  //destroyAssessmentCharts();
  getSnapshot(teamId, teamName);
}

/**
 * Ajax-call to retrieve the hierarchy of a team
 */
function getHierarchyTeam(teamId, callback) {
  var strHierarchy = '';
  $.ajax({
    type: 'GET',
    url: '/api/teams/hierarchy/team/' + encodeURIComponent(teamId)
  }).fail(function(e) {
    console.log(e);
  }).done(function(res) {
    var separator = '&nbsp;>&nbsp;';
    for (var n = res.length-1; n >= 0; n--){
      var pos = res[n].ordering;
      var name = res[n].name;
      var id = res[n].teamId;
      var nItems = (res.length-1)-n;
      if (pos === nItems) {
        if (n === 0) {
          strHierarchy = strHierarchy + name;
        } else {
          strHierarchy = strHierarchy + createHierarchylink(id, name) + separator;
        }
      }
    }
    callback(strHierarchy);
  });
}

function hierarchyTeamHandler(linkedTeams, team) {
  if (team != null)
    linkedTeams.push(team);
  if (team['parent_team_id'] != undefined && team['parent_team_id'] != '') {
    getTeam(team['parent_team_id'], hierarchyTeamHandler, [linkedTeams]);
  }

  var strHierarchy = '';
  var separator = '&nbsp;&gt;&nbsp;';
  for (var i=linkedTeams.length-1; i>=0; i--) {
    if (i!=0) {
      var teamId = linkedTeams[i]['_id'];
      var elementId = jq(teamId);
      var teamIdLink = $('#link_sub_' + elementId);
      if (teamIdLink && teamIdLink.html() != undefined) {
        strHierarchy = strHierarchy + "<a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id='plink_'"+elementId+" href='#' onclick=\"javascript:displaySelected('" + linkedTeams[i]['_id'] + "', true);\">" + linkedTeams[i]['name'] + '</a>' + separator;
      } else {
        strHierarchy = strHierarchy + "<a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id='plink_'"+elementId+" href='#' onclick=\"javascript:loadParentInAllTeams('" + linkedTeams[i-1]['_id'] + "');\">" + linkedTeams[i]['name'] + '</a>' + separator;
      }
    } else {
      strHierarchy = strHierarchy + linkedTeams[i]['name'];
    }
  }
  $('#Hierarchy td')[1].innerHTML = strHierarchy;
}

function loadDetails(elementId, setScrollPosition) {
  if (selectedElement == elementId || $('#' + jq(elementId)).html() == 'Standalone teams') {
    return;

  } else if (selectedElement != elementId) {
    if (selectedElement != '') {
      $('#' + 'link_' + jq(selectedElement)).removeClass('agile-team-selected');
      //$("#search_"+selectedElement).removeClass("agile-team-selected");
    }
    selectedElement = elementId;
  }

  //$("#search_"+elementId).addClass("agile-team-selected");
  $('#' + 'link_' + jq(elementId)).addClass('agile-team-selected');

  var teamId = elementId.substring(4, elementId.length);
  var isLeafTeam = false;
  if (defSelTeamId != teamId) {
    $('#mainContent').hide();
    $('#spinnerContainer').show();

    if (teamId == teamId) {
      removeHighlightParents();
      // $.({message: ""});
      defSelTeamId = teamId;
      // make sure team data is always the latest data to show
      var req = $.ajax({
        type: 'GET',
        url: '/api/teams/' + encodeURIComponent(teamId)
      }).fail(function(e) {
        console.log(e);
      }).done(function(currentTeam) {
        team = currentTeam;
        if (team != undefined) {
          $('#levelDetail').empty();
          var keyLabel = '';
          var keyValue = '';
          if (team['_id'] != undefined) {
            keyLabel = 'Team Id';
            keyValue = team['_id'];
          }

          if (team['name'] != undefined) {
            keyLabel = 'Team Name';
            var tn = team['name'];
            if (tn.trim() == '')
              tn = '&nbsp;';
            $('#teamName').html(tn);
            keyValue = "<a class='wlink' href='team?id=" + encodeURIComponent(team['_id']) + "' title='Manage team information'>" + tn + '</a>';
            appendRowDetail(keyLabel, keyValue);
          }

          if (team['squadteam'] != undefined) {
            keyLabel = 'Squad Team?';
            keyValue = team['squadteam'];
            if (keyValue.toLowerCase() == 'yes') {
              isLeafTeam = true;
            }
          }

          if (team['desc'] != undefined) {
            keyLabel = 'Description';
            keyValue = team['desc'];
            appendRowDetail(keyLabel, keyValue);
          }

          /* Get parent name and link */
          if (team['parent_team_id'] != undefined && team['parent_team_id'] != '') {
            var parent_team_id = team['parent_team_id'];
            keyLabel = 'Hierarchy';
            keyValue = '<div class="ibm-spinner"></div>';
            appendRowDetail(keyLabel, keyValue);
            var linkedTeams = [];
            linkedTeams.push(team);
            getTeam(team['parent_team_id'], hierarchyTeamHandler, [linkedTeams]);
          } else {
            keyLabel = 'Hierarchy';
            keyValue = '(No parent team infomation)';
            appendRowDetail(keyLabel, keyValue);
          }

          if (team['parent_team_id'] != undefined && team['parent_team_id'] != '') {
          }

          // getHierarchyTeam(teamId, function(keyValue){
          //   var keyLabel = 'Hierarchy';
          //   appendRowDetail(keyLabel, keyValue);
            
          // });

          if (team['links'] != undefined) {
            keyLabel = 'Important links';
            var links = team['links'];
            var tr = '';
            if (links.length > 0) {
              _.each(links, function(value, key, list){
                tr = tr + '<tr>';
                tr = tr + '<td>' + value.linkLabel + '</td>';
                tr = tr + '<td><a href="'+value.linkUrl+'" target="_blank" class="wlink" >'+value.linkUrl+'</a></td>';
                tr = tr + '</tr>';
              });
              var html = '<table class=\'tImportantlink\'>';
              html = html + tr;
              html = html + '</table>';
              keyValue = html;
              appendRowDetail(keyLabel, keyValue, true);
            }
          }

          if (team['members'] != undefined) {
            keyLabel = 'Number of members';
            keyValue = teamMemCount(team['members']);
            appendRowDetail(keyLabel, keyValue);
          }

          if (team['members'] != undefined) {
            keyLabel = 'FTE';
            keyValue = teamMemFTE(team['members']);
            appendRowDetail(keyLabel, keyValue);
          }

          

          /* draw iteration and assessment charts */
          if (isLeafTeam) {
            getTeamIterations(team['_id'], teamIterationListHander, [team['_id']]);
            getTeamAssessments(team['_id'], true, teamAssessmentListHander, [team['_id']]);

            //this is done to display back the 2 other chart groups as 1st batch of rollup will only show velocity and throughput
            //$("#chartgrp2").show();
            //$("#chartgrp3").show();
            $('#snapshotPull').hide(); //hiding the refresh snapshot date
            $('#teamType').html('Squad:&nbsp;');
            $('#nsquad_team_scard').hide();
            $('#squad_team_scard').show();
            $('#iterationSection .agile-section-nav').show();
            $('#assessmentSection .agile-section-nav').show();
            $('#nsquad_assessment_card').hide();
            $('#squad_assessment_card').show();

          } else {
            destroyIterationCharts();
            destroyAssessmentCharts();

            //getSnapshot(team['_id'], team['name']);
            getTeamSnapshots(team['_id'], team['name']);
            $('#snapshotPull').show(); //show the refresh snapshot date
            $('#teamType').html('Team:&nbsp;');
            $('#nsquad_team_scard').show();
            $('#squad_team_scard').hide();
            $('#nsquad_assessment_card').show();
            $('#squad_assessment_card').hide();
            $('#iterationSection .agile-section-nav').hide();
            $('#assessmentSection .agile-section-nav').hide();
            $('#refreshData').attr('onclick', "performChartRefresh('" + team._id + "','" + team.name + "')");
          }

          $('#membersList').empty();
          teamLocation = [];
          managerIndex = 0;
          hideScorePieChart();
          if (team.members != undefined && team.members.length > 0) {
            var members = sortTeamMembersByName(team.members);
            for (var j = 0; j < members.length; j++) {
              var member = members[j];
              var row = "<tr><td id='name_" + j + "'>" + member.name + '</td>';
              row = row + '<td>' + member.allocation + '</td>';
              row = row + "<td id='location_ref_" + j + "'><div class='ibm-spinner'></div></td>";
              row = row + '<td>' + member.role + '</td>';
              row = row + '</tr>';
              $('#membersList').append(row);
              if (member.role == 'Manager') {
                managerIndex = j;
              }
              getPersonFromFaces(member.id, facesPersonHandler, [j, member.id]);
            }
          } else {
            $('#membersList').append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
          }
          if (managerIndex != 0) {
            var manager = teamLocation.splice(managerIndex, 1);
            teamLocation.unshift(manager.toString());
          }
          if (isLeafTeam) {
            if (findUserAccess(userInfo.email)) {
              teamLocationHandler(teamLocation);
            }
          }
        }
      });
      requests.push(req);
      openSelectedTeamTree(setScrollPosition);
    }
  } else {
    $('#mainContent').show();
    $('#spinnerContainer').hide();
    $('#teamTree').show();
    $('#spinnerContainer-search').hide();
    openSelectedTeamTree(setScrollPosition);
  }
}

function createHierarchylink(id, name){
  return '<a href="team?id=' + encodeURIComponent(id) + '" title="' + name + '"  target="_blank" class="wlink">' + name + '</a>';
}

function teamLocationHandler(data) {
  var requestData = {};
  requestData.loc = data;
  var req = $.ajax({
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(requestData),
    url: '/api/teamscore/calculate/'
  }).fail(function(e) {
    console.log(e);
  }).done(function(score) {
    if (score.score != null) {
      showScorePieChart();
      piechartData = {};
      piechartData = score.analyze;
      $('#teamscoreDiv').html(score.score);
      google.charts.setOnLoadCallback(function(){
        drawChart(score.analyze, true);
      });
    }
  });
  requests.push(req);
}

function drawChart(data, isTimezone) {
  var siteData = [['Site','#']];
  var sites = Object.keys(data.sites);
  var timeData = [['Timezone','#']];
  var time =  Object.keys(data.timezone);
  for (var i = 0; i < sites.length; i++) {
    siteData.push([sites[i],data.sites[sites[i]]]);
  }
  for (var i = 0; i < time.length; i++) {
    timeData.push([time[i],data.timezone[time[i]]]);
  }
  var srdata = google.visualization.arrayToDataTable(siteData);
  var trdata = google.visualization.arrayToDataTable(timeData);
  var leftmargin = $('#teamscore-piechart').width() * 0.05;
  var topmargin = $('#teamscore-piechart').width() * 0.05;
  var sliceColor = [];
  var title = '';
  if (isTimezone) {
    title = 'Location Analysis';
    for (var i = 0; i < siteData.length; i++) {
      var color = {'color':null};
      color['color'] = colorArray[i];
      sliceColor.push(color);
    }
  } else {
    title = 'Time Zone Analysis';
    for (var i = 0; i < timeData.length; i++) {
      var color = {'color':null};
      color['color'] = colorArray[i];
      sliceColor.push(color);
    }
  }
  //var leftmargin = $('#teamscore-piechart').width() * 0.1 ;
  var options = {
    title: title,
    titleTextStyle: {
      fontName: 'normal',
      fontSize: '14'
    },
    pieSliceText: 'none',
    height: 300,
    pieHole: 0.4,
    chartArea: {left:leftmargin,top:'20px',width:'90%',height:'80%'},
    legend: {
      textStyle: {
        fontName: 'normal',
        fontSize: '12'
      },
      position: 'labeled'
    },
    slices: sliceColor
  };
  // $('#titleLabel').html(title);
  if (isTimezone) {
    var siteChart = new google.visualization.PieChart(document.getElementById('teamscore-piechart'));
    siteChart.draw(srdata, options);
  } else {
    var siteChart = new google.visualization.PieChart(document.getElementById('teamscore-piechart'));
    siteChart.draw(trdata, options);
  }
}

function showScorePieChart() {
  $('#teamscoreDiv').show();
  $('#teamscore-header').css('visibility','visible');
  $('#levelTable').css('width','50%');
  $('#teamscore-piechart').css('height','70%');
  $('#teamscore-piechart').show();
  $('#switchBtn').show();
  $('#teamscoreFormula').show();
  // $('#titleLabel').show();
}

function hideScorePieChart() {
  $('#teamscoreDiv').hide();
  $('#teamscore-header').css('visibility','hidden');
  $('#switchBtn').html('Switch to Time Zone Analysis');
  $('#levelTable').css('width','100%');
  $('#teamscore-piechart').css('height','0px');
  $('#teamscore-piechart').hide();
  $('#switchBtn').hide();
  $('#teamscoreFormula').hide();
  // $('#titleLabel').hide();
}

function findUserAccess(email) {
  var access = false;
  _.find(userAccess, function(user){
    if (user == email) {
      access = true;
    }
  });
  return access;
}

function openSelectedTeamTree(setScrollPosition) {

  // this expands the tree where the team is found (that is if that section is not expanded)
  if (!$('#' + jq(selectedElement)).is(':visible')) {
    $('#' + jq(selectedElement)).parents('li').each(function() {
      $(this).addClass('ibm-active');
      $('#body' + $(this).attr('id')).css('display', 'block');
    });
  }

  var scrollLink = 'link_' + selectedElement;

  if (setScrollPosition != undefined && setScrollPosition) {
    $('.nano').nanoScroller();
    $('.nano').nanoScroller({
      scrollTo: $('#' + jq(scrollLink))
    });
  }

  // var positionFound = false;
  // var parentFound = false;
  // while(!positionFound) {
  //  if (!$("#"+scrollLink).is(":visible")) {
  //    if ($("#"+scrollLink).parents("li").length > 0) {
  //      scrollLink = "link_"+$($("#"+scrollLink).parents("li")).id
  //    } else {
  //      break;
  //    }
  //  } else {
  //    positionFound = true;
  //  }
  // }

  // if (!IBMCore.common.util.scrolledintoview($("#"+jq(selectedElement)))) {
  //  document.getElementById("ibm-content-main").scrollIntoView();
  //  if (positionFound) {
  //    $(".nano").nanoScroller();
  //    $(".nano").nanoScroller({
  //      scrollTo : $("#" + jq(scrollLink))
  //    });
  //  }
  // }
}

/**
 * Redraw charts to handle sizing of graphs in collapsable section display.
 *
 * @param section - collapsable section id.
 */
function redrawCharts(section) {
  $(Highcharts.charts).each(function(i,chart) {
    if (chart == null) return;

    if ($('#' + section + ' #' + $(chart.container).attr('id')).length > 0) {
      var height = chart.renderTo.clientHeight;
      var width = chart.renderTo.clientWidth;
      chart.setSize(width, height);
    }
  });
}
