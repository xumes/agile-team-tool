var teams;
var teamIterInfo;
var members;
var currentTeam;
var admins;
var global_currentAction = undefined;

jQuery(function($) {
  $(document).ready(function() {
    var urlParameters = getJsonParametersFromUrl();
    if (urlParameters != undefined && urlParameters.testUser != undefined) {
      resetUser(urlParameters.testUser);
      alert("here TestUser is: " + urlParameters.testUser);
    }

    if (urlParameters != undefined && urlParameters.id != undefined) {
      if (urlParameters != undefined && urlParameters.iter != undefined && urlParameters.iter != "")
        loadAgileTeams(urlParameters.id, urlParameters.iter);
      else
        loadAgileTeams(urlParameters.id, "new");
    } else {
      loadAgileTeams("new", "");
      updateIterationInfo("clearIteration");
    }

    $('input[type="number"]').on("contextmenu", function(e) {
      return false;
    });

    setToolTips();
    $("#iterationStartDate").datepicker({ dateFormat: 'ddMyy' });
    $("#iterationEndDate").datepicker({ dateFormat: 'ddMyy' });

    $("#iterationStartDate").datepicker( "option", "dateFormat", 'ddMyy' );
    $("#iterationEndDate").datepicker( "option", "dateFormat", 'ddMyy' );

    $(".numnodecimal").on("keypress keyup blur",function (event) {
       $(this).val($(this).val().replace(/[^\d].+/, ""));
       if ((event.which < 48 || event.which > 57) && 
          (event.which != 8 && event.which != 127 )) {
          event.preventDefault();
        }
    });
  });

  $("#teamSelectList").change(function() {
    updateIterationInfo("clearIteration");
    loadAgileTeamIterationInfo($("#teamSelectList option:selected").val(), "new");

  });

  $("#iterationName").change(function() {
    if ($("#iterationName").val().trim() != "")
      clearFieldErrorHighlight("iterationName");
  });

  $("#iterationName").blur(function() {
    if ($("#iterationName").val().trim() != "") {
      if (hasAccess($("#teamSelectList").val(), true)) {
        $("#memberCount").val(teamMemCount());
        $("#fteThisiteration").val(teamMemFTE());
        $("#iterationName,#iterationStartDate,#iterationEndDate,#commStories,#commPoints,#memberCount").removeAttr("disabled");
        $("#fteThisiteration,#DeploythisIteration,#defectsIteration,#clientSatisfaction,#teamSatisfaction,#commStoriesDel,#commPointsDel,#storyPullIn,#storyPtPullIn,#retroItems,#retroItemsComplete,#teamChangeList,#commentIter").removeAttr("disabled");
        $("#select2-teamChangeList-container,#commentIter").css('color', 'black');
        $("#refreshFTE").attr("onclick", "refreshFTE()");
        if ($("#iterationSelectList").val() == "new") {
          $("#addIterationBtn").removeAttr("disabled");
          $("#updateIterationBtn").attr("disabled", "disabled");
        } else {
          $("#addIterationBtn").attr("disabled", "disabled");
          $("#updateIterationBtn").removeAttr("disabled");
        }
      }
    }
  });

  $("#fteThisiteration").change(function() {
    if ($("#fteThisiteration").val().trim() != "") {
      var storiesFTE = $("#commStoriesDel").val() / $("#fteThisiteration").val();
      $("#unitcostStoriesFTE").val(storiesFTE.toFixed(1));
      var strPointsFTE = $("#commPointsDel").val() / $("#fteThisiteration").val();
      $("#unitcostStorypointsFTE").val(strPointsFTE.toFixed(1));
    }
  });

  $("#commStoriesDel").change(function() {
    if ($("#commStoriesDel").val().trim() != "") {
      var storiesFTE = $("#commStoriesDel").val() / $("#fteThisiteration").val();
      $("#unitcostStoriesFTE").val(storiesFTE.toFixed(1));
    }
  });

  $("#commPointsDel").change(function() {
    if ($("#commPointsDel").val().trim() != "") {
      var strPointsFTE = $("#commPointsDel").val() / $("#fteThisiteration").val();
      $("#unitcostStorypointsFTE").val(strPointsFTE.toFixed(1));
    }
  });

  $("#iterationSelectList").change(function() {
    if ($("#iterationSelectList").val() == "new") {
      updateIterationInfo("clearIteration");
      if (hasAccess($("#teamSelectList").val(), true)) {
        $("#memberCount").val(teamMemCount());
        $("#iterationName,#iterationStartDate,#iterationEndDate,#commStories,#commPoints,#memberCount").removeAttr("disabled");
        $("#fteThisiteration,#DeploythisIteration,#defectsIteration,#clientSatisfaction,#teamSatisfaction,#commStoriesDel,#commPointsDel,#storyPullIn,#storyPtPullIn,#retroItems,#retroItemsComplete,#teamChangeList,#commentIter").removeAttr("disabled");
        $("#updateIterationBtn").attr("disabled", "disabled");
        $("#addIterationBtn").removeAttr("disabled");
        $("#select2-teamChangeList-container,#commentIter").css('color', 'black');
        $("#refreshFTE").attr("onclick", "refreshFTE()");
      }
    } else {
      $("#fteThisiteration").val(teamMemFTE());
      loadSelectedAgileTeamIterationInfo();
    }
  });

  $("#iterationEndDate").change(function() {
    selectedEndDate = formatMMDDYYYY($("#iterationEndDate").val());
    selectedStartDate = formatMMDDYYYY($("#iterationStartDate").val());
    if (selectedStartDate != "" && new Date(selectedEndDate) < new Date(selectedStartDate)) {
      // setFieldErrorHighlight("iterationEndDate");
      // showMessagePopup("End date must be >= start date");
      // $("#iterationEndDate").focus();
      return false;
    }
    clearFieldErrorHighlight("iterationStartDate");
    clearFieldErrorHighlight("iterationEndDate");
  });

  $("#iterationStartDate").change(function() {
    selectedEndDate = formatMMDDYYYY($("#iterationEndDate").val());
    selectedStartDate = formatMMDDYYYY($("#iterationStartDate").val());
    if (selectedStartDate != "" && new Date(selectedEndDate) < new Date(selectedStartDate)) {
      // setFieldErrorHighlight("iterationStartDate");
      // showMessagePopup("Start date must be <= end date");
      // $("#iterationStartDate").focus();
      return false;
    } else {
      today = new Date($.now());
      endDate = new Date(selectedEndDate);
      startDate = new Date(selectedStartDate);
      if (startDate != "Invalid Date") // if invalid date, we don't display invalid end date
        $("#iterationEndDate").val(showDateDDMMMYYYY(addComputedDays(formatMMDDYYYY($("#iterationStartDate").val()))));
      clearFieldErrorHighlight("iterationStartDate");
      clearFieldErrorHighlight("iterationEndDate");
    }

  });

  $("#fteThisiteration, #clientSatisfaction, #teamSatisfaction").keypress(function(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode == 8 || charCode == 46 || charCode == 37 || charCode == 39) {
      return true;
    } else if (charCode == 46 && $(this).val().indexOf('.') != -1) {
      return false;

    } else if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  });

  $("#clientSatisfaction, #teamSatisfaction").blur(function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      $(this).val(parseFloat(value).toFixed(1));
      if (value == 0 || (value >= 1 && value <= 4)) {
        // this should only clear out the error highlights once conditions are satisfied.
        clearFieldErrorHighlight($(this).attr("id"));
      }
    }
  });

  // handles number arrow click
  $("#clientSatisfaction, #teamSatisfaction").bind("input", function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      if (value >= 1 && value <= 4) {
        // this should only clear out the error highlights once conditions are satisfied.
        clearFieldErrorHighlight($(this).attr("id"));
      }
    }
  });

  $("#fteThisiteration").blur(function() {
    var value = parseFloat($(this).val());
    if (!isNaN(value)) {
      $(this).val(parseFloat(value).toFixed(1));
    }
  });
});

function setToolTips() {
  var tt = "Number of unique team members supporting this iteration.  The default is derived based on the team's current makeup and can be overridden by user input.  " + "This count is used to compute the iteration's FTE value and the 2 Pizza Rule metric results.";
  $("#memberCountTT").attr("title", tt);
  $("#memberCountTT").tooltip();

  tt = "FTE (Full-time Equivalent) is sum of all Team Member allocation percentages divided by number of unique Team Members.  The default is derived based on the current team's makeup and can be overridden by user input.  This value is used to compute the iteration's Unit Cost values";
  $("#fteThisiterationTT").attr("title", tt);
  $("#fteThisiterationTT").tooltip();

  tt = "Indicate if there was a change to the team's makeup during this iteration.  Changes might include adding/replacing/removing members or member allocation percentage updates that you feel are significant.  Indicating that a team change occurred might help to explain higher/lower team productivity when compared to other iterations.";
  $("#teamChangeListTT").attr("title", tt);
  $("#teamChangeListTT").tooltip();

  tt = "Clicking this ICON will replace the team member count and the FTE value with current values from the Team Information area on the Home page.";
  $("#refreshFTE").attr("title", tt);
  $("#refreshFTE").tooltip();

  tt = "Please indicate the satisfaction level of your client(s) with the results of this iteration using the following scale:"
    +"<br/>4 - Very satisfied"
    +"<br/>3 - Satisfied"
    +"<br/>2 - Dissatisfied"
    +"<br/>1 - Very dissatisfied";
  $("#clientSatisfactionTT").attr("title", tt);
  $("#clientSatisfactionTT").tooltip({
      content: function() {
          return $(this).attr('title');
      }
  });

  tt = "Please indicate how happy your team was during the course of this iteration using the following scale:"
    +"<br/>4 - Very happy"
    +"<br/>3 - Happy"
    +"<br/>2 - Unhappy"
    +"<br/>1 - Very unhappy";
  $("#teamSatisfactionTT").attr("title", tt);
  $("#teamSatisfactionTT").tooltip({
      content: function() {
          return $(this).attr('title');
      }
  });

  $("div.ui-helper-hidden-accessible").each(function (index, obj) {
    $(obj).attr("aria-label", "Tooltip");
  });
}

function teamMemCount() {
  var currentTeam = allTeamsLookup[($("#teamSelectList").val())];
  if (!_.isEmpty(currentTeam)) {
    return currentTeam.total_members;
  } else return 0;
  // var teamCount = 0;
  // var tmArr = [];
  // for ( var i = 0; i < teams.length; i++) {
  //   if (teams[i]._id == $("#teamSelectList").val()) {
  //     currentTeam = teams[i];
  //     if (currentTeam.members != undefined) {
  //       $.each(teams[i].members, function(key, member) {
  //         if (tmArr.indexOf(member.id) == -1) {
  //           teamCount++;
  //           tmArr.push(member.id);
  //         }
  //       });
  //     }
  //   }
  // }
  // return teamCount;
}

function teamMemFTE() {
  var currentTeam = allTeamsLookup[($("#teamSelectList").val())];
  if (!_.isEmpty(currentTeam)) {
    return parseFloat(currentTeam.total_allocation).toFixed(1);
  } else return 0;
  // var teamCount = 0;
  // for ( var i = 0; i < teams.length; i++) {
  //   if (teams[i]._id == $("#teamSelectList").val()) {
  //     currentTeam = teams[i];
  //     if (currentTeam.members != undefined) {
  //       $.each(teams[i].members, function(key, member) {
  //         teamCount = teamCount + member.allocation;
  //       });
  //     }
  //   }
  // }
  // var val = parseFloat(teamCount / 100).toFixed(1);

  // return val;
}

function refreshFTE() {
  var tmc = teamMemCount();
  var fte = teamMemFTE();
  confirmAction("You are about to overwrite the contents of these fields with '"+tmc+"' and '" + fte +"' respectively.  Do you want to continue?",  "Yes", "No", refFTECount, [tmc,fte]);
}

function refFTECount(tmc, fte){
  $("#memberCount").val(tmc);
  $("#fteThisiteration").val(fte);
  addIteration('update');
}

function confirmAction(message, btn1,btn2, action, args) {
  $("#dialog").dialog({
    autoOpen: false,
    modal: true,
    height:'auto',
    width: 520,
    buttons :
      [
        {
          id: "btn1",
          text: btn1,
          click: function() {
            $(this).dialog("close");
            action.apply(this,args);
          }
        },
        {
          id: "btn2",
          text: btn2,
          click:function() {
            $(this).dialog("close");
          }
        }
      ]
    });

   $("#dialog").text(message);
   $("#dialog").dialog("open");
}

function loadAgileTeams(selected, iteration) {
  $("#teamSelectList").attr("disabled", "disabled");
  $("#iterationSelectList").attr("disabled", "disabled");
  $("#select2-iterationSelectList-container").css('color', 'grey');

  teams = _.filter(allTeams, function(team) {
  if (team.squadteam.toLowerCase() == 'yes') 
    return team;
  });
  addOptions("teamSelectList", teams, null, null, selected);
  $("#teamSelectList").removeAttr("disabled");

  if (iteration != undefined && iteration != "")
    loadAgileTeamIterationInfo(selected, iteration);
}

function loadAgileTeamIterationInfo(teamId, iterationId) {
  var hasAcc = hasAccess(teamId, true);
  console.log("loadAgileTeamIterationInfo: " + teamId + " / " + iterationId);
  if (teamId == null || teamId == "") {
    loadAgileTeams("new", "");;
    if (hasAcc)
      addOptions("iterationSelectList", null, [ "new", "Create new..." ], null, "new");
    else
      addOptions("iterationSelectList", null, [ "", "Select one" ], null, "");
    displayEditStatus(false);
    return;
  }
  $("#iterationSelectList").attr("disabled", "disabled");
  $("#select2-iterationSelectList-container").css('color', 'grey');
  $("#iterationName").attr("disabled", "disabled");
  // retrieve and load latest iteration information for the team
  $.ajax({
    type : "GET",
    url : "/api/iteration/" + encodeURIComponent(teamId)
  }).done(function(data) {
    var list = [];
    if (data != undefined) {
      list = _.pluck(data.rows, "value");
    }
    teamIterInfo = list;

    // sort by date
    teamIterInfo = teamIterInfo.sort(function(a, b) {
      if (new Date(b.iteration_end_dt).getTime() == new Date(a.iteration_end_dt).getTime()) {
        return 0;
      } else {
        return (new Date(b.iteration_end_dt).getTime() > new Date(a.iteration_end_dt).getTime()) ? 1 : -1;
      }
    });

    var iterInfo = [];
    for ( var i = 0; i < teamIterInfo.length; i++) {
      var iteration = new Object();
      iteration._id = teamIterInfo[i]._id;
      iteration.name = teamIterInfo[i].iteration_name;
      iterInfo.push(iteration);
    }

    if (hasAcc) {
      addOptions("iterationSelectList", iterInfo, [ "new", "Create new..." ], null, iterationId);
      displayEditStatus(false);
    } else {
      addOptions("iterationSelectList", iterInfo, [ "", "Select one" ], null, iterationId);
      displayEditStatus(true);
    }

    if (iterationId != undefined && iterationId != "new") {
      loadSelectedAgileTeamIterationInfo();
    } else {
      if (hasAcc) {
        $("#iterationName,#iterationStartDate,#iterationEndDate,#commStories,#commPoints,#memberCount").removeAttr("disabled");
        $("#fteThisiteration,#DeploythisIteration,#defectsIteration,#clientSatisfaction,#teamSatisfaction,#commStoriesDel,#commPointsDel,#storyPullIn,#storyPtPullIn,#retroItems,#retroItemsComplete,#teamChangeList,#commentIter").removeAttr("disabled");
        $("#updateIterationBtn").attr("disabled", "disabled");
        $("#addIterationBtn").removeAttr("disabled");
        $("#select2-teamChangeList-container,#commentIter").css('color', 'black');
        $("#refreshFTE").attr("onclick", "refreshFTE()");
      }
    }
    $("#iterationSelectList").removeAttr("disabled");
    $("#select2-iterationSelectList-container").css('color', 'black');
  });

}

function loadSelectedAgileTeamIterationInfo() {
  var iterationId = $("#iterationSelectList option:selected").val();
  if (teamIterInfo != undefined) {
    for ( var i = 0; i < teamIterInfo.length; i++) {
      if (teamIterInfo[i]._id == iterationId) {
        console.log(teamIterInfo[i]);
        clearFieldErrorHighlight("iterationName");
        clearFieldErrorHighlight("iterationStartDate");
        clearFieldErrorHighlight("iterationEndDate");
        $("#iterationSelectList").val(teamIterInfo[i]._id);
        $("#select2-iterationSelectList-container").text($("#iterationSelectList option:selected").text());
        $("#select2-iterationSelectList-container").attr("title", $("#iterationSelectList option:selected").text());
        $("#iterationName").val(teamIterInfo[i].iteration_name);
        $("#iterationStartDate").val(showDateDDMMMYYYY(teamIterInfo[i].iteration_start_dt));
        $("#iterationEndDate").val(showDateDDMMMYYYY(teamIterInfo[i].iteration_end_dt));
        $("#iterationinfoStatus").val(teamIterInfo[i].iterationinfo_status);
        $("#commStories").val(teamIterInfo[i].nbr_committed_stories);
        $("#commPoints").val(teamIterInfo[i].nbr_committed_story_pts);
        $("#memberCount").val(teamIterInfo[i].team_mbr_cnt);
        $("#commStoriesDel").val(teamIterInfo[i].nbr_stories_dlvrd);
        $("#commPointsDel").val(teamIterInfo[i].nbr_story_pts_dlvrd);
        $("#storyPullIn").val(teamIterInfo[i].nbr_stories_pulled_in);
        $("#storyPtPullIn").val(teamIterInfo[i].nbr_story_pts_pulled_in);
        $("#retroItems").val(teamIterInfo[i].retro_action_items);
        $("#retroItemsComplete").val(teamIterInfo[i].retro_action_items_complete);
        $("#teamChangeList").val(teamIterInfo[i].team_mbr_change);
        $("#select2-teamChangeList-container").text($("#teamChangeList option:selected").text());
        $("#select2-teamChangeList-container").attr("title", $("#teamChangeList option:selected").text());
        $("#lastUpdateUser").html(teamIterInfo[i].last_updt_user);
        $("#lastUpdateTimestamp").html(showDateDDMMMYYYYTS(teamIterInfo[i].last_updt_dt));
        $('#commentIter').val(teamIterInfo[i].iteration_comments);
        $('#doc_id').html(teamIterInfo[i]._id);
        if (teamIterInfo[i].fte_cnt != "") {
          //$("#fteThisiteration").val(teamIterInfo[i].fte_cnt);
          var alloc = parseFloat(teamIterInfo[i].fte_cnt).toFixed(1);
          $("#fteThisiteration").val(alloc);
        }
        // $("#fteThisiteration").val(teamIterInfo[i].fte_cnt);
        $("#DeploythisIteration").val(teamIterInfo[i].nbr_dplymnts);
        $("#defectsIteration").val(teamIterInfo[i].nbr_defects);
        $("#clientSatisfaction").val(teamIterInfo[i].client_sat);
        $("#teamSatisfaction").val(teamIterInfo[i].team_sat);
        var storiesFTE = $("#commStoriesDel").val() / $("#fteThisiteration").val();
        $("#unitcostStoriesFTE").val(storiesFTE.toFixed(1));
        var strPointsFTE = $("#commPointsDel").val() / $("#fteThisiteration").val();
        $("#unitcostStorypointsFTE").val(strPointsFTE.toFixed(1));

        var temp = 0;
        if (teamIterInfo[i].nbr_committed_stories != 0) {
          temp = (teamIterInfo[i].nbr_stories_dlvrd / teamIterInfo[i].nbr_committed_stories) * 100;
          $("#percStoriesDel").val(parseFloat(temp).toFixed(0) + "%");
        } else {
          temp = "N/A";
          $("#percStoriesDel").val(temp);
        }

        temp = 0;
        if (teamIterInfo[i].nbr_committed_story_pts != 0) {
          temp = (teamIterInfo[i].nbr_story_pts_dlvrd / teamIterInfo[i].nbr_committed_story_pts) * 100;
          $("#percPointsDel").val(parseFloat(temp).toFixed(0) + "%");
        } else {
          temp = "N/A";
          $("#percPointsDel").val(temp);
        }

        if (teamIterInfo[i].team_mbr_cnt < 10)
          temp = "<10";
        else
          temp = ">=10";
        $("#pizzaRule").val(temp);

        $("#addIterationBtn").attr("disabled", "disabled");
        $("#updateIterationBtn").removeAttr("disabled");

        if (!hasAccess(teamIterInfo[i].team_id, true)) {
          $("#iterationName,#iterationStartDate,#iterationEndDate,#commStories,#commPoints,#memberCount").attr("disabled", "disabled");
          $("#fteThisiteration,#DeploythisIteration,#defectsIteration,#clientSatisfaction,#teamSatisfaction,#commStoriesDel,#commPointsDel,#storyPullIn,#storyPtPullIn,#retroItems,#retroItemsComplete,#teamChangeList,#commentIter").attr("disabled", "disabled");
          $("#addIterationBtn,#updateIterationBtn").attr("disabled", "disabled");
          $("#select2-teamChangeList-container,#commentIter").css('color', 'grey');
          $("#refreshFTE").removeAttr("onclick");
        } else {
          $("#iterationName,#iterationStartDate,#iterationEndDate,#commStories,#commPoints,#memberCount").removeAttr("disabled");
          $("#fteThisiteration,#DeploythisIteration,#defectsIteration,#clientSatisfaction,#teamSatisfaction,#commStoriesDel,#commPointsDel,#storyPullIn,#storyPtPullIn,#retroItems,#retroItemsComplete,#teamChangeList,#commentIter").removeAttr("disabled");
          $("#select2-teamChangeList-container,#commentIter").css('color', 'black');
          $("#refreshFTE").attr("onclick", "refreshFTE()");

        }
      }
    }
  }
}

function updateIterationCache(iteration) {
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

  addOptions("iterationSelectList", iterInfo, [ "new", "Create new..." ], null, iteration._id);
}

function addOptions(id, list) {
  addOptions(id, list, null, null, null);
}

function addOptions(selectId, listOption, firstOption, lastOption, selectedOption) {
  $("#" + selectId).empty();

  if (firstOption != undefined) {
    $("#select2-" + selectId + "-container").text(firstOption[1]);
    option = "<option value='" + firstOption[0] + "' selected='selected'>" + firstOption[1] + "</option>";
    $("#" + selectId).append(option);

  } else {
    $("#select2-" + selectId + "-container").text("Select one");
    var option = "<option value='' selected='selected'>Select one</option>";
    $("#" + selectId).append(option);
  }

  if (listOption == undefined)
    return;

  for ( var i = 0; i < listOption.length; i++) {
    var option = "";

    if (listOption[i]._id == selectedOption || listOption[i].name == selectedOption) {
      option = "<option value='" + listOption[i]._id + "' selected='selected'>" + listOption[i].name + "</option>";
      $("#select2-" + selectId + "-container").text(listOption[i].name);
      $("#select2-" + selectId + "-container").text(listOption[i].name);
      $("#select2-" + selectId + "-container").attr("title", listOption[i].name);

    } else
      option = "<option value='" + listOption[i]._id + "'>" + listOption[i].name + "</option>";

    $("#" + selectId).append(option);
  }

  if (lastOption != undefined) {
    option = "<option value='" + lastOption[0] + "'>" + lastOption[1] + "</option>";
    $("#" + selectId).append(option);

  }

}

function addIteration(action) {
  $.ajax({
    type  : "GET",
    url   : "/api/teams/"  + encodeURIComponent($("#teamSelectList").val()),
    async : false
  }).done(function(data) {
    if (data != undefined) {
      updateAgileTeamCache(data);
      var jsonData = data;
      if (jsonData.squadteam != undefined && jsonData.squadteam.toLowerCase() == "no") {
        showMessagePopup("Team information has been changed to non squad.  Iteration information cannot be entered for non squad teams.");
        loadAgileTeams("new", "");
        updateIterationInfo("clearIteration");
        return;
      }

      var exists = false;
      var currentIteration = new Object();

      if (teamIterInfo != undefined) {
        // find if team data already exists
        for ( var i = 0; i < teamIterInfo.length; i++) {
          if (teamIterInfo[i].team_id == $("#teamSelectList").val() && teamIterInfo[i]._id == $("#iterationSelectList").val()) {
            exists = true;
            currentIteration = teamIterInfo[i];
          }
        }
      }

      if (exists) {

        $.ajax({
          type : "GET",
          url : "/api/iteration/current/" + encodeURIComponent(currentIteration._id)
        }).done(function(data) {
          var jsonData = data;
          var rev = jsonData._rev;
          console.log('Updating ' + currentIteration._id + '. The current revision is ' + rev + '.');
          jsonData.iteration_name = $("#iterationName").val();
          jsonData.iteration_start_dt = formatMMDDYYYY($("#iterationStartDate").val());
          jsonData.iteration_end_dt = formatMMDDYYYY($("#iterationEndDate").val());
          jsonData.team_mbr_cnt = $("#memberCount").val();
          jsonData.nbr_committed_stories = $("#commStories").val();
          jsonData.nbr_stories_dlvrd = $("#commStoriesDel").val();
          jsonData.nbr_committed_story_pts = $("#commPoints").val();
          jsonData.nbr_story_pts_dlvrd = $("#commPointsDel").val();
          jsonData.nbr_stories_pulled_in = $("#storyPullIn").val();
          jsonData.nbr_story_pts_pulled_in = $("#storyPtPullIn").val();
          jsonData.retro_action_items = $("#retroItems").val();
          jsonData.retro_action_items_complete = $("#retroItemsComplete").val();
          jsonData.iteration_comments = $("#commentIter").val();
          jsonData.team_mbr_change = $("#teamChangeList").val();
          jsonData.fte_cnt = $("#fteThisiteration").val();
          jsonData.nbr_dplymnts = $("#DeploythisIteration").val();
          jsonData.nbr_defects = $("#defectsIteration").val();
          jsonData.client_sat = $("#clientSatisfaction").val();
          jsonData.team_sat = $("#teamSatisfaction").val();
          jsonData = $.extend(true, {}, initIterationTemplate(), jsonData);
          $.ajax({
            type        : "PUT",
            url         : "/api/iteration/" + encodeURIComponent(currentIteration._id),
            contentType : "application/json",
            data        : JSON.stringify(jsonData)
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
            showMessagePopup("You have successfully updated Iteration information.");

          });
          // update cache
          // updateIterationCache(jsonData);
          // loadSelectedAgileTeamIterationInfo();
          // showMessagePopup("You have successfully updated Iteration information.");
        });
      } else {
        // showMessagePopup ("insert new iteration");
        var newIterationId = prefixIteration + $("#teamSelectList").val() + " " + $("#iterationName").val() + "_" + new Date().getTime();
        newIterationId = newIterationId.replace(/^[^a-z]+|[^\w:.-]+/gi, "");

        // showMessagePopup ("newIterationId: " + newIterationId);
        var serverDateTime = getServerDateTime();
        var jsonData = new Object();
        jsonData._id = newIterationId;
        jsonData.type = "iterationinfo";
        jsonData.team_id = $("#teamSelectList").val();
        jsonData.iteration_name = $("#iterationName").val();
        jsonData.iteration_start_dt = formatMMDDYYYY($("#iterationStartDate").val());
        jsonData.iteration_end_dt = formatMMDDYYYY($("#iterationEndDate").val());
        jsonData.team_mbr_cnt = $("#memberCount").val();
        jsonData.nbr_committed_stories = $("#commStories").val();
        jsonData.nbr_stories_dlvrd = $("#commStoriesDel").val();
        jsonData.nbr_committed_story_pts = $("#commPoints").val();
        jsonData.nbr_story_pts_dlvrd = $("#commPointsDel").val();
        jsonData.nbr_stories_pulled_in = $("#storyPullIn").val();
        jsonData.nbr_story_pts_pulled_in = $("#storyPtPullIn").val();
        jsonData.retro_action_items = $("#retroItems").val();
        jsonData.retro_action_items_complete = $("#retroItemsComplete").val();
        jsonData.iteration_comments = $("#commentIter").val();
        jsonData.team_mbr_change = $("#teamChangeList").val();
        jsonData.fte_cnt = $("#fteThisiteration").val();
        jsonData.nbr_dplymnts = $("#DeploythisIteration").val();
        jsonData.nbr_defects = $("#defectsIteration").val();
        jsonData.client_sat = $("#clientSatisfaction").val();
        jsonData.team_sat = $("#teamSatisfaction").val();
        jsonData = $.extend(true, {}, initIterationTemplate(), jsonData);
        console.log(jsonData);
        console.log(JSON.stringify(jsonData));
        $.ajax({
          type        : "POST",
          url         : "/api/iteration",
          contentType : "application/json",
          data        : JSON.stringify(jsonData)
        })
        .fail(function(xhr, textStatus, errorThrown) {
          if (xhr.status === 400) {
            handleIterationErrors(xhr, textStatus, errorThrown);
          }
        })
        .done(function(data) {
          var json = (typeof data == 'string' ? JSON.parse(data) : data);
          var id = json.id;
          console.log('Added iteration ' + jsonData.team_id + ' / ' + jsonData.iteration_name + '. The new document ID is ' + id + '.');

          loadAgileTeamIterationInfo(jsonData.team_id, id);
          clearHighlightedIterErrors();
          showMessagePopup("You have successfully added Iteration information.");
        });
      }
    }
  });
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
        $("#addIterationBtn").removeAttr("disabled");
      } else if (global_currentAction === 'update') {
        $("#updateIterationBtn").removeAttr("disabled");
      }
    }
  }
}

function getIterationErrorPopup(errors) {
  console.log('error list: '+JSON.stringify(errors));
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
    'nbr_defects': 'defectsIteration',
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
      errorLists = errorLists + errors[mdlField][0] + "<br>";
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
  if (action == "add") {
    // stop gap to disable multiple add
    $("#addIterationBtn").attr("disabled", "disabled");
    addIteration(action);
  } else if (action == "update") {
    $("#updateIterationBtn").attr("disabled", "disabled");
    addIteration(action);
  } else if (action == "clear" || action == "clearIteration") {
    if (action == "clear")
      loadAgileTeamIterationInfo(null, null);
    $("#newIterationNameSection").fadeIn();
    $("#iterationName").val("");
    clearFieldErrorHighlight("iterationName");
    $("#iterationStartDate").val("");
    clearFieldErrorHighlight("iterationStartDate");
    $("#iterationEndDate").val("");
    clearFieldErrorHighlight("iterationEndDate");
    $("#commStories").val("");
    $("#commPoints").val("");
    $("#memberCount").val("");
    $("#commStoriesDel").val("");
    $("#commPointsDel").val("");
    $("#storyPullIn").val("");
    $("#storyPtPullIn").val("");
    $("#retroItems").val("");
    $("#retroItemsComplete").val("");
    $("#teamChangeList").val("No");
    $("#select2-teamChangeList-container").text($("#teamChangeList option:selected").text());
    $("#select2-teamChangeList-container").attr("title", $("#teamChangeList option:selected").text());
    $("#percStoriesDel").val("");
    $("#percPointsDel").val("");
    $("#pizzaRule").val("");
    $("#commentIter").val("");
    $("#lastUpdateUser").html("");
    $("#lastUpdateTimestamp").html("");
    $("#fteThisiteration").val("");
    $("#DeploythisIteration").val("");
    $("#defectsIteration").val("");
    $("#clientSatisfaction").val("");
    $("#teamSatisfaction").val("");
    $("#unitcostStoriesFTE").val("");
    $("#unitcostStorypointsFTE").val("");

    $("#iterationName,#iterationStartDate,#iterationEndDate,#commStories,#commPointsDel,#storyPullIn,#storyPtPullIn").attr("disabled", "disabled");
    $("#fteThisiteration,#DeploythisIteration,#defectsIteration,#clientSatisfaction,#teamSatisfaction,#retroItems,#commPoints,#memberCount,#commStoriesDel,#retroItemsComplete,#commentIter,#teamChangeList").attr("disabled", "disabled");
    $("#addIterationBtn,#updateIterationBtn").attr("disabled", "disabled");
    $("#select2-teamChangeList-container,#commentIter").css('color', 'grey');
    $("#refreshFTE").removeAttr("onclick");

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
  month = month.toString().length < 2 ? "0" + month.toString() : month.toString();
  var day = result.getDate();
  day = day.toString().length < 2 ? "0" + day.toString() : day.toString();
  /*
   * if(isNaN(day)){ return ""; }
   */
  return month + "/" + day + "/" + result.getFullYear();
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
  'defectsIteration',
  'teamChangeList',
  'commentIter',
  'clientSatisfaction',
  'teamSatisfaction'
  ];

  for (j=0; j < fields.length; j++) {
    clearFieldErrorHighlight(fields[j]);
  }
}