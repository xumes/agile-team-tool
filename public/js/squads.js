var allTeams;
var allTeamsLookup;
var members;
var roles;
var taPerson;
var isIter = false;

jQuery(function ($) {	
	$(document).ready(function () {
		$(".ibm-close-link" ).click(function() {
			if($('#teamDetailsPageSection h2 .ibm-show-active').length == 0){
				$('#teamDetailsPageSection h2 a').eq(0).trigger("click");
			}
			$('html, body').animate({scrollTop: $("#teamDetailsPageSection h2 a").offset().top}, 1000);	
		});

		
		var urlParameters = getJsonParametersFromUrl();
		if (urlParameters != undefined && urlParameters.id != undefined)
			agileTeamListHandler(urlParameters.id, allTeams);
		else
			agileTeamListHandler("new", allTeams);

		if (urlParameters != undefined && urlParameters.testUser != undefined) {
			resetUser(urlParameters.testUser);
			alert("here TestUser is: " + urlParameters.testUser);
		}

		agileTeamRolesHandler(memberRoles);
		disableAddTeam();

	});

	$("#teamSelectList").change(function () {
		if ($("#teamSelectList option:selected").val() == "new") {
			updateTeamInfo("clear");
			displayEditStatus(false);
			disableAddTeam();
			
		} else {
			jQuery("#teamDetailsPageSection .ibm-show-hide a[class='ibm-show-active']").click();
			// retrieve and load latest data about the team and update local cached data
			$.ajax({
				type 	: "GET",
				url 	: "/api/teams/" + encodeURIComponent($("#teamSelectList option:selected").val())
			}).done(function (data) {
				var jsonData = data;
				updateAgileTeamCache(jsonData);
				loadSelectedAgileTeam();
			});
		}
	});

	$("#teamName").change(function () {
		if ($("#teamName").val() != "")
			clearFieldErrorHighlight("teamName");
	});

	$("#teamSquadYesNo").change(function () {
		var teamSquad = $("#teamSquadYesNo option:selected").val();
		if (teamSquad.toLowerCase() == "yes") {
			$("#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection").show();
			$("#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection").hide();
			loadIterationInformation(null, false);
		} else {
			$("#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection").hide();
			$("#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection").show();
			loadIterationInformation(null, false);
		}

	});

	$("#teamMemberName").change(function () {
		if ($("#teamMemberName").val() == "")
			taPerson = null;
		else if (taPerson != undefined && $("#teamMemberName").val() != taPerson["notes-id"])
			taPerson = null;

		if (taPerson != null)
			clearFieldErrorHighlight("teamMemberName");
	});

	$("#teamMemberName").blur(function () {
		if (taPerson != null)
			clearFieldErrorHighlight("teamMemberName");
	});

	$("#memberRoleSelectList").change(function () {
		var role = $("#memberRoleSelectList option:selected").text();
		if ($("#memberRoleSelectList").val() == "other")
			$("#otherRoleDescSection").fadeIn();
		else
			$("#otherRoleDescSection").fadeOut();

		if ($("#memberRoleSelectList").val() != "")
			clearFieldErrorHighlight("memberRoleSelectList");
	});

	$("#otherRoleDesc").change(function () {
		if ($("#otherRoleDesc").val() != "")
			clearFieldErrorHighlight("otherRoleDesc");
	});

	$("#memberListAction").change(function () {
		if ($('input[name="member"]:checked').length < 1) {
			showMessagePopup("No selected members to perform desired action.");
			$("#memberListAction").val("");
			$("#select2-memberListAction-container").text("Actions...");
			$("#select2-memberListAction-container").attr("title", "Actions...");
			$("#select2-memberListAction-container").css('color', 'grey');
			$("#memberListAction").attr("disabled", "disabled");
			return;
		}
		var enableAction = false;
		var action = $("#memberListAction option:selected").val();
		if (action == "remove") {
			$("#addMemberBtn").attr("disabled", "disabled");
			$("#updateMemberBtn").attr("disabled", "disabled");
			deleteTeamMember();

		} else if (action == "update") {
			if ($('input[name="member"]:checked').length > 1) {
				showMessagePopup("Only one member can be selected for update.");

			} else {
				loadMemberInfo($('input[name="member"]:checked').val());
			}
			enableAction = true;
		}
		var count = $('input[name="member"]:checked').length;
		var actionText = count > 0 ? "Actions...(" + count + ")" : "Actions...";
		if (enableAction) {
			$("#memberListAction").removeAttr("disabled");
			$("#memberListAction").val("");
			$("#select2-memberListAction-container").text(actionText);
			$("#select2-memberListAction-container").attr("title", actionText);
			$("#select2-memberListAction-container").css('color', 'black');
		} else {
			$("#select2-memberListAction-container").text(actionText);
			$("#select2-memberListAction-container").attr("title", actionText);
			$("#select2-memberListAction-container").css('color', 'grey');
			$("#memberListAction").attr("disabled", "disabled");
		}

	});

	$("#childSelectList").change(function () {
		if ($("#childSelectList").val() != "")
			clearFieldErrorHighlight("childSelectList");
	});

	$("#childrenListAction").change(function () {
		if ($('input[name="child"]:checked').length < 1) {
			showMessagePopup("No selected children team to perform desired action.");
			$("#childrenListAction").val("");
			$("#select2-childrenListAction-container").text("Actions...");
			$("#select2-childrenListAction-container").attr("title", "Actions...");
			$("#select2-childrenListAction-container").css('color', 'grey');
			$("#childrenListAction").attr("disabled", "disabled");
			return;
		}

		var action = $("#childrenListAction option:selected").val();
		if (action == "remove") {
			$('input[name="child"]:checked').each(function () {
				$(this).parent().parent().remove();
			});

			deleteChildTeam();

			if ($("#childrenList tr").length == 0) {
				$("#teamSquadYesNo").removeAttr("disabled");
				$("#select2-teamSquadYesNo-container").css('color', 'black');
				$("#childrenList").append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
			}

			$("#childrenListAction").val("");
			$("#select2-childrenListAction-container").text("Actions...");
			$("#select2-childrenListAction-container").css('color', 'grey');
			$("#select2-childrenListAction-container").attr("title", "Actions...");
			$("#childrenListAction").attr("disabled", "disabled");
		} else {
			$("#childrenListAction").val("");
			$("#select2-childrenListAction-container").text("Actions...");
			$("#select2-childrenListAction-container").css('color', 'black');
			$("#select2-childrenListAction-container").attr("title", "Actions...");
		}
	});

	updateTeamInfo("clear");
});

function agileTeamListHandler(teamId, teamList) {
	$("#teamSelectList").attr("disabled", "disabled");	
	var listOption = getAgileTeamDropdownList(teamList, false);
	setSelectOptions("teamSelectList", listOption, ["new", "Create new..."], null, teamId);
	if (teamId != undefined && teamId != "new") {
		$("#teamSelectList").trigger("change");
	}
	$("#teamSelectList").removeAttr("disabled");
}

function updateAgileTeamCache(team) {
	// var lookupData = allTeamsLookup[team._id];
	// // were using the compacted team view
	// if (lookupData._rev == null) {
	// 	lookupData.doc = team;
	// 	lookupData.name = team.name;
	// 	lookupData.squadteam = team.squadteam;
	// 	lookupData.parent_team_id = team.parent_team_id;
	// 	lookupData.child_team_id = team.child_team_id;
	// 	allTeamsLookup[team._id] = lookupData;

	// } else
	// 	allTeamsLookup[team._id] = team;

	updateTeamCache(team);

	loadSelectableChildren(team._id);
}

var getAgileTeamCache = function(id) {
	 return _.isEmpty(allTeamsLookup[id].doc) ? allTeamsLookup[id] : allTeamsLookup[id].doc;
}

var compactTeam = function(team) {
  var compactedTeam = new Object();
  if (!_.isEmpty(team)) {
    var teamMembers = [];
    var teamCount = 0;
    var teamAlloc = 0;
    for (var i in team.members) {
      if (teamMembers.indexOf(team.members[i].id) == -1) {
        teamCount++;
        teamMembers.push(team.members[i].id);
      }
      teamAlloc += parseInt(team.members[i].allocation);
    }
    teamAlloc = teamAlloc/100;
    compactedTeam['_id'] = team._id, 
    compactedTeam['name'] = team.name, 
    compactedTeam['squadteam'] = team.squadteam,
    compactedTeam['parent_team_id'] = team.parent_team_id,
    compactedTeam['child_team_id'] = team.child_team_id,
    compactedTeam['total_members'] = teamCount,
    compactedTeam['total_allocation'] = teamAlloc
    compactedTeam['doc'] = team;
  }
  return compactedTeam;
};

var updateAgileTeamCache = function(team) {
  if (!_.isEmpty(allTeamsLookup) && !_.isEmpty(team)) {
    var compactedTeam = compactTeam(team);
    if (!_.isEmpty(allTeamsLookup[team._id]))
      allTeams.push(compactedTeam);
    else
      _.extend(_.findWhere(allTeams, { _id: team._id}), compactedTeam)

    allTeamsLookup[team._id] = compactedTeam;
  }
  allTeams = _.sortBy(allTeams, function(team) {return team.name});
  loadSelectableChildren(team._id);
};

function agileTeamRolesHandler(roles) {
	var listOption = [];
	for(var i=0; i<roles.length; i++) {
		var option = [roles[i].name, roles[i].name];
		listOption.push(option);
	}
	setSelectOptions("memberRoleSelectList", listOption, null, ["other", "Other..."], null);
}

function loadSelectedAgileTeam() {
	var teamName = $("#teamSelectList option:selected").text();
	var teamId = $("#teamSelectList option:selected").val();
	$("#teamName").val(teamName);
	if (allTeams != undefined) {
		var currentTeam = getAgileTeamCache(teamId);
		if (currentTeam != null) {
			$("#addTeamBtn,#updateTeamBtn,#deleteTeamBtn,#updateChildBtn,#addMemberBtn,#updateParentBtn,#cancelMemberBtn").removeAttr("disabled");
			$("#teamName,#teamDesc,#teamMemberName,#memberAllocation").removeAttr("disabled");
			$("#teamSquadYesNo,#memberRoleSelectList,#memberListAction,#parentSelectList,#childSelectList,#childrenListAction,#iterTeamBtn,#assessBtn").removeAttr("disabled");
			$("#teamDesc,#select2-teamSquadYesNo-container,#select2-memberRoleSelectList-container,#select2-memberListAction-container,#select2-parentSelectList-container").css('color', 'black');

			$("#teamName").val(currentTeam.name);
			$("#teamDesc").val(currentTeam.desc);
			$('#lastUpdateUser').html(currentTeam.last_updt_user);
			$('#lastUpdateTimestamp').html(showDateDDMMMYYYYTS(currentTeam.last_updt_dt));
			$('#doc_id').html(currentTeam._id);
			clearFieldErrorHighlight("teamName");
			clearFieldErrorHighlight("teamMemberName");
			clearFieldErrorHighlight("memberAllocation");
			clearFieldErrorHighlight("memberRoleSelectList");
			clearFieldErrorHighlight("otherRoleDesc");
			clearFieldErrorHighlight("childSelectList");

			$("#teamNameTitle").html("Team members for " + currentTeam.name);
			$("#childrenNameTitle").html("Child team association for " + currentTeam.name);

			loadSelectableParents($("#teamSelectList option:selected").val());
			loadSelectableChildren($("#teamSelectList option:selected").val());

			if (currentTeam.squadteam != undefined && currentTeam.squadteam.toLowerCase() == "yes") {
				$("#teamSquadYesNo").val("Yes");
				$("#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection").show();
				$("#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection").hide();
				// disable squad indicator if iteration data exist
				$.ajax({
					type 	: "GET",
					url 	: "/api/iteration/" + encodeURIComponent(currentTeam._id),
					async	: false
				}).done(function (data) {
					if (!_.isEmpty(data)) {
						$("#teamSquadYesNo").attr("disabled", "disabled");
						$("#select2-teamSquadYesNo-container").css('color', 'grey');
						var list = _.pluck(data.rows, "value");
						loadIterationInformation(sortIterations(list), false);
					}
				});

				$.ajax({
					type 	: "GET",
					url 	: "/api/assessment/view?teamId=" + encodeURIComponent(teamId),
					async	: false
				}).done(function (data) {
					if (!_.isEmpty(data)) {
						var list = _.pluck(data.rows, "value");
						loadAssessmentInformation(sortAssessments(list), false);
					}
				});

			} else {
				$("#teamSquadYesNo").val("No");
				$("#squadChildPageSection, #squadIterationPageSection, #squadAssessmentPageSection").hide();
				$("#nonSquadChildPageSection, #nonSquadIterationPageSection, #nonSquadAssessmentPageSection").show();

				if (currentTeam.child_team_id.length > 0) {
					$("#teamSquadYesNo").attr("disabled", "disabled");
					$("#select2-teamSquadYesNo-container").css('color', 'grey');
				} else {
					$("#teamSquadYesNo").removeAttr("disabled");
					$("#select2-teamSquadYesNo-container").css('color', 'black');
				}
				// Initial load will have Action disabled
				$("#select2-childrenListAction-container").text("Actions...");
				$("#select2-childrenListAction-container").css('color', 'grey');
				$("#select2-childrenListAction-container").attr("title", "Actions...");
				$("#childrenListAction").attr("disabled", "disabled");
			}
			$("#select2-teamSquadYesNo-container").text($("#teamSquadYesNo option:selected").text());
			$("#select2-teamSquadYesNo-container").attr("title", $("#teamSquadYesNo option:selected").text());

			if (currentTeam.parent_team_id != undefined && currentTeam.parent_team_id != "") {
				$("#parentSelectList").val(currentTeam.parent_team_id);
				$("#select2-parentSelectList-container").text($("#parentSelectList option:selected").text());
				$("#select2-parentSelectList-container").attr("title", $("#parentSelectList option:selected").text());

			} else {
				$("#parentSelectList").val("");
				$("#select2-parentSelectList-container").text($("#parentSelectList option:selected").text());
				$("#select2-parentSelectList-container").attr("title", $("#parentSelectList option:selected").text());

			}
		}
		
		$("#addTeamBtn").attr("disabled", "disabled");
		$("#teamDetailsPageSection").fadeIn();
		$("#teamMemberTable").fadeIn();

		loadTeamMembers($("#teamSelectList option:selected").val());
		$("#memberListAction").val("");
		$("#select2-memberListAction-container").text("Actions...");
		$("#select2-memberListAction-container").attr("title", "Actions...");
		$("#select2-memberListAction-container").css('color', 'grey');
		$("#memberListAction").attr("disabled", "disabled");

		loadTeamChildren($("#teamSelectList option:selected").val());
		$("#childrenListAction").val("");
		$("#select2-childrenListAction-container").text("Actions...");
		$("#select2-childrenListAction-container").attr("title", "Actions...");

		if (!hasAccess($("#teamSelectList option:selected").val(), true)) {
			$("#addTeamBtn,#updateTeamBtn,#deleteTeamBtn,#updateChildBtn,#addMemberBtn,#updateParentBtn,#cancelMemberBtn").attr("disabled", "disabled");
			$("#teamName,#teamDesc,#teamMemberName,#memberAllocation").attr("disabled", "disabled");
			$("#teamSquadYesNo,#memberRoleSelectList,#memberListAction,#parentSelectList,#childSelectList,#childrenListAction,#iterTeamBtn,#assessBtn").attr("disabled", "disabled");
			$("#teamDesc,#select2-teamSquadYesNo-container,#select2-memberRoleSelectList-container,#select2-memberListAction-container,#select2-parentSelectList-container").css('color', 'grey');
			displayEditStatus(true);
		} else {
			displayEditStatus(false);
		}
	}
}

function manageIteration() {
	window.location = "iteration?id=" + encodeURIComponent($("#teamSelectList option:selected").val()) + "&iter=new";
}

function loadIterationInformation(iterationList, more) {
	$("#moreIterations").hide();
	$("#lessIterations").hide();

	if (more) {
		$("#iterationTitle").html("Iterations for " + $("#teamSelectList option:selected").text());
	} else {
		$("#iterationTitle").html("Last 5 iterations for " + $("#teamSelectList option:selected").text());
	}

	$("#iterationList").empty();
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
			var iterLink = "<a style='text-decoration: underline;color:black;' href='iteration?id=" + encodeURIComponent(iter.team_id) + "&iter=" + encodeURIComponent(iter._id) + "' title='Manage current iteration information'>" + iter.iteration_name + "</a>";
			var row = "<tr id='irow_" + j + "'>";
			row = row + "<td></td>";
			row = row + "<td>" + iterLink + "</td>";
			row = row + "<td>" + showDateDDMMMYYYY(iter.iteration_start_dt) + "</td>";
			row = row + "<td>" + showDateDDMMMYYYY(iter.iteration_end_dt) + "</td>";
			row = row + "</tr>";
			$("#iterationList").append(row);
		}

		if (iterationList.length > 5) {
			if (!more) {
				$("#moreIterations").show();
			} else {
				$("#lessIterations").show();
			}
		}

		$('#moreIterations').click(function () {
			loadIterationInformation(iterationList, true);
		});

		$('#lessIterations').click(function () {
			loadIterationInformation(iterationList, false);
		});
	}

	if (!found) {
		$("#iterationList").append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
	}
}

function loadAssessmentInformation(assessmentlist, more) {
	$("#moreAssessments").hide();
	$("#lessAssessments").hide();
	
	$("#assessmentList").empty();
	var numRec = 5;
	if (more){
		numRec= assessmentlist.length;
	}
	var link='';
	if (assessmentlist != null && assessmentlist.length > 0){
		var hasDraft = false;
		for (var x=0; x<assessmentlist.length && x<numRec; x++) {
			var item = assessmentlist[x];
			if (item.assessmt_status == 'Submitted'){
				link = "<a style='text-decoration: underline;color:black;' href='progress?id=" + encodeURIComponent(item.team_id) + "&assessId=" + encodeURIComponent(item._id) + "'>" + 
				showDateDDMMMYYYY(item["self-assessmt_dt"].substring(0,item["self-assessmt_dt"].indexOf(" "))) + "</a>";
			}
			else{
				hasDraft = true;
				link = "<a style='text-decoration: underline;color:black;' href='assessment?id=" + encodeURIComponent(item.team_id) + "&assessId=" + encodeURIComponent(item._id) + "'>" + 
				showDateDDMMMYYYY(item.created_dt.substring(0,item.created_dt.indexOf(" "))) + "</a>";
			}
			var row = "<tr id='asmntrow_"+x+"'>";
	        row = row + "<td></td>";
	        row = row + "<td>"+link+"</td>";
	        row = row + "<td>"+item.assessmt_status+"</td>";
	        row = row + "<td>"+item.last_updt_user+"</td>";
	        row = row + "</tr>";
	        $("#assessmentList").append(row);
		}
		if (hasDraft){
			$("#assessBtn").attr("disabled", "disabled");
		}

		if (assessmentlist.length > 5 && numRec == 5){
			$("#assessmentTitle").html("Last 5 Assessments for " + $("#teamSelectList option:selected").text());			
			$("#moreAssessments").show();
		} else if(assessmentlist.length > 5 && numRec > 5){
			$("#assessmentTitle").html("All Assessments for " + $("#teamSelectList option:selected").text());
			$("#lessAssessments").show();
		} else {
			$("#assessmentTitle").html("Last 5 Assessments for " + $("#teamSelectList option:selected").text());
			
		}

		$('#moreAssessments').click(function () {
			loadAssessmentInformation(assessmentlist, true);
		});

		$('#lessAssessments').click(function () {
			loadAssessmentInformation(assessmentlist, false);
		});

	} else {
		$("#assessmentTitle").html("Last 5 Assessments for " + $("#teamSelectList option:selected").text());
		$("#assessmentList").append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
	}
}

function disableAddTeam() {
	if (localStorage.getItem("sysStatusFlag") != undefined 
			&& localStorage.getItem("sysStatusFlag") == 'AdminOnlyChange' 
			&& !isAdmin()) {
		$("#updateTeamBtn,#addTeamBtn").attr("disabled", "disabled");
		$("#teamName,#teamDesc").attr("disabled", "disabled");
		$("#teamSquadYesNo").attr("disabled", "disabled");
		$("#teamDesc,#select2-teamSquadYesNo-container").css('color', 'grey');
	}
}

var children = [];
function getAllChildren(parentId) {
	var currentTeam = getAgileTeamCache(parentId);
	if (currentTeam != null) {
		if (currentTeam.child_team_id != undefined) {
			for (var j = 0; j < currentTeam.child_team_id.length; j++) {
				if (children.indexOf(currentTeam.child_team_id[j]) == -1) {
					children.push(currentTeam.child_team_id[j]);
					getAllChildren(currentTeam.child_team_id[j]);
				}
			}
		}
	}
	return children;
}

function loadSelectableParents(currentTeamId) {
	children = [];
	getAllChildren(currentTeamId);
	var parentList = [];
	if (allTeams != undefined) {
		$.each(allTeams, function () {
			if (this._id != currentTeamId && this.squadteam.toLowerCase() == "no") {
				if (children.indexOf(this._id) == -1)
					parentList.push(this);
			}
		});
		addOptions("parentSelectList", parentList, ["", "No parent team"], null, null);

	} else {
		showMessagePopup("No team data loaded on this page.");
	}

}

function loadSelectableChildren(currentTeamId) {
	children = [];
	getAllChildren(currentTeamId);
	var currentTeam;
	if (allTeams != undefined) {
		currentTeam = getAgileTeamCache(currentTeamId);
		if (currentTeam != null)
			children.push(currentTeam.parent_team_id);
	}

	var childList = [];
	if (allTeams != undefined) {
		$.each(allTeams, function () {
			if (this._id != currentTeamId) {
				if (children.indexOf(this._id) == -1 && this.parent_team_id != undefined && this.parent_team_id == "")
					childList.push(this);
			}
		});
		addOptions("childSelectList", childList, null, null, null);

	} else {
		showMessagePopup("No team data loaded on this page.");
	}

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

	for (var i = 0; i < listOption.length; i++) {
		var option = "";
		if (listOption[i]._id == selectedOption || listOption[i].name == selectedOption) {
			option = "<option value='" + listOption[i]._id + "' selected='selected'>" + listOption[i].name + "</option>";
			$("#select2-" + selectId + "-container").text(listOption[i].name);
			$("#select2-" + selectId + "-container").attr("title", listOption[i].name);
		} else
			option = "<option value=\"" + listOption[i]._id + "\">" + listOption[i].name + "</option>";

		$("#" + selectId).append(option);
	}

	if (lastOption != undefined) {
		option = "<option value='" + lastOption[0] + "'>" + lastOption[1] + "</option>";
		$("#" + selectId).append(option);

	}
}

function loadTeamMembers(teamId) {
	$("#memberList").empty();
	var found = false;
	if (teamId != undefined) {
		var currentTeam = getAgileTeamCache(teamId);
		if (currentTeam != null) {
			var members = sortTeamMembersByName(currentTeam.members);
			for (var j = 0; j < members.length; j++) {
				found = true;
				var member = members[j];
				var row = "<tr id='mrow_" + j + "'>";
				row = row + "<td scope='row' class='ibm-table-row'>";
				if (hasAccess($("#teamSelectList option:selected").val(), true)) 
					row = row + "<input name='member' id='member_"+ j + "' type='checkbox' value='" + j + "' onclick='selectMember($(this))' />";
				else
					row = row + "<input name='member' id='member_"+ j + "' type='checkbox' value='" + j + "' disabled='true' />";
				row = row + "<label for='member_" + j + "' class='ibm-access'>Select " + member.name + "</label>";
				row = row + "</td>";
				row = row + "<td id='name_ref_" + j + "'>" + member.name + "</span></td>";
				row = row + "<td id='email_ref_" + j + "'>" + member.id + "</span></td>";
				row = row + "<td id='alloc_ref_" + j + "'>" + (isNaN(parseInt(member.allocation)) ? "0" : member.allocation) + "</td>";
				row = row + "<td id='location_ref_" + j + "'><div class='ibm-spinner'></div></td>";
				row = row + "<td id='role_ref_" + j + "'>" + member.role + "</td>";
				row = row + "</tr>";
				$("#memberList").append(row);
				getPersonFromFaces(member.id, facesPersonHandler, [j, member.id]);
			}
		}
		$("#teamMemberName").removeAttr("disabled");
		$("#addMemberBtn").removeAttr("disabled");
		$("#updateMemberBtn").attr("disabled", "disabled");

	}

	if (!found) {
		$("#memberList").append('<tr class="odd"><td valign="top" colspan="6" class="dataTables_empty">No data available</td></tr>');
	}
}

function loadMemberInfo(index) {
	var email = $("#email_ref_" + index).text();
	var svcRoot = 'https://faces.tap.ibm.com/api/';
	var svcFunc = 'find/?format=faces&limit=100&q=email:' + escape(email); 
	var svcURL = svcRoot + svcFunc;
	$("#addMemberBtn").attr("disabled", "disabled");
	$("#updateMemberBtn").attr("disabled", "disabled");
	$.ajax({
		'global' : false,
		'cache' : false,
		'url' : svcURL,
		'timeout' : 5000,
		'jsonp' : 'callback',
		'scriptCharset': 'UTF-8',
		'success' : function (data) {
			$.each(data.persons, function (i, result) {
				var facesPerson = result.person;
				if (facesPerson.email == email) {
					taPerson = facesPerson;
					$("#teamMemberName").val(taPerson["notes-id"]);
					$("#teamMemberName").attr("disabled", "disabled");
					var role = $("#role_ref_" + index).text();
					if ($("#memberRoleSelectList option[value='" + role + "']").length == 0) {
						$("#memberRoleSelectList").val("other");
						$("#select2-memberRoleSelectList-container").text("Other...");
						$("#select2-memberRoleSelectList-container").attr("title", "Other...");
						$("#otherRoleDesc").val(role);
						$("#otherRoleDescSection").fadeIn();
					} else {
						$("#otherRoleDesc").val("");
						$("#otherRoleDescSection").fadeOut();
						$("#memberRoleSelectList").val(role);
						$("#select2-memberRoleSelectList-container").text(role);
						$("#select2-memberRoleSelectList-container").attr("title", role);
					}

					$("#memberAllocation").val($("#alloc_ref_" + index).text());
					$("#addMemberBtn").attr("disabled", "disabled");
					$("#updateMemberBtn").removeAttr("disabled");
				}
			});
		},
		'error' : function (data, status, error) {
			showMessagePopup(status);
			$("#teamMemberName").removeAttr("disabled");
			$("#addMemberBtn").removeAttr("disabled");
			$("#updateMemberBtn").attr("disabled", "disabled");
		}
	});
}

function loadParentChildren(parentId, currentId) {
	$("#siblingList").empty();
	var found = false;
	if (parentId != undefined) {
		var currentTeam = getAgileTeamCache(parentId);
		if (currentTeam != null && currentTeam.child_team_id != undefined) {
			for (var j = 0; j < currentTeam.child_team_id.length; j++) {
				if (currentTeam.child_team_id[j] != currentId) {
					var childTeamId = currentTeam.child_team_id[j];
					var childTeamName = "";
					var childTeamDesc = "";
					var childTeamChildren = 0;
					var childTeam = getAgileTeamCache(childTeamId);
					if (childTeam = null) {
						found = true;
						childTeamName = allTeams[k].name;
						childTeamDesc = allTeams[k].desc;
						if (childTeam.child_team_id != undefined)
							childTeamChildren = childTeam.child_team_id.length;

						var row = "<tr id='srow_" + k + "'>";
						row = row + "<td>" + childTeamName + "</td>";
						row = row + "<td>" + childTeamDesc + "</td>";
						row = row + "<td>" + childTeamChildren + "</td>";
						row = row + "</tr>";
						// showLog(row);
						$("#siblingList").append(row);
					}
				}
			}
		}
	}
	if (!found) {
		$("#siblingList").append('<tr class="odd"><td valign="top" colspan="3" class="dataTables_empty">No data available</td></tr>');
	}
}

function loadTeamChildren(currentId) {
	$("#childrenList").empty();
	var found = false;
	if (currentId != undefined) {
		var currentTeam = getAgileTeamCache(currentId);
			if (currentTeam != null && currentTeam.child_team_id != undefined) {
				var childTeams = [];
				for (var j = 0; j < currentTeam.child_team_id.length; j++) {
					var childTeamId = currentTeam.child_team_id[j];
					var childTeam = getAgileTeamCache(childTeamId);
					if (childTeam != null) {
						childTeams.push(childTeam);
					}
				}
				if (childTeams.length > 0){
					found = true;
					var allTeams = sortAgileTeamsByName(childTeams);
					var childTeamId = "";
					var childTeamName = "";
					var childTeamDesc = "";
					var index = 0;

					for (var x = 0; x < allTeams.length; x++) {
						childTeamId = allTeams[x]._id;
						index = index + 1;
						childTeamName = allTeams[x].name;
						childSquadIndicator = allTeams[x].squadteam;
						childTeamDesc = allTeams[x].desc;
						var row = "<tr id='crow_" + index + "'>";
						row = row + "<td scope='row' class='ibm-table-row'>";
						if (hasAccess($("#teamSelectList option:selected").val(), true))
							row = row + "<input name='child' id='child_" + index + "'type='checkbox' value='" + index + "' onclick='selectChild($(this))' />";
						else
							row = row + "<input name='child' id='child_" + index + "'type='checkbox' value='" + index + "' disabled='true'/>";
						row = row + "<label for='child_" + index + "' class='ibm-access'>Select " + childTeamName + "</label>";
						row = row + "</td>";
						row = row + "<td id='ref_id_" + childTeamId + "'>" + childTeamName + "</td>";
						row = row + "<td>" + childSquadIndicator + "</td>";
						row = row + "<td>" + childTeamDesc + "</td>";
						row = row + "</tr>";
						$("#childrenList").append(row);
					}
				}
			}
	}
	
	if (!found) {
		$("#childrenList").append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
	}
}

function facesPersonHandler(index, userEmail, facesPerson) {
	if (facesPerson != null) {
		$("#location_ref_" + index).text(facesPerson.location);
	} else {
		$("#location_ref_" + index).text("-unavailable-");
	}
}

function addTeam(action) {
	if ($("#teamName").val() == "" || $("#teamName").val().trim() == "") {
		$("#addTeamBtn").removeAttr("disabled");
		setFieldErrorHighlight("teamName");
		showMessagePopup("Team name cannot be blank.  Please enter a team name.");
		return;
	}
	var exists = false;
	var currentTeam = null;

	if (allTeams != undefined) {
		var teamName = $("#teamName").val().trim();
		var teamId = $("#teamSelectList option:selected").val();
		// find if team data already exists
		for (var i = 0; i < allTeams.length; i++) {
			if (allTeams[i].name == teamName && allTeams[i]._id != teamId) {
				if (action == "add" || action == "update") {
					if (action == "add")
						$("#addTeamBtn").removeAttr("disabled");
					else if (action == "update")
						$("#updateTeamBtn").removeAttr("disabled");

					setFieldErrorHighlight("teamName");
					showMessagePopup("This team name already exists.  Please enter a different team name");
					return
				}
			}
		}

		// find if team data already exists
		currentTeam = getAgileTeamCache(teamId);
		if (currentTeam != null)
			exists = true; 
	}

	if (exists) {
		$.ajax({
			type 	: "GET",
			url 	: "/api/teams/" + encodeURIComponent(currentTeam._id)
		}).done(function (data) {
			var jsonData = data;
			// copy object to persist to follow hierarchy of columns in the template
			jsonData = $.extend(true, {}, initTeamTemplate(), jsonData);
			
			// check to see if a parallel update for iteration data has been entered for this team
			if ($("#teamSquadYesNo option:selected").val().toLowerCase() == "no"
				 && jsonData.squadteam != undefined
				 && jsonData.squadteam.toLowerCase() == "yes") {

				$.ajax({
					type 	: "GET",
					url 	: "/api/iteration/" + encodeURIComponent(jsonData._id)
				}).done(function (data) {
					var allowed = true;
					if (data != undefined) {
						if (data.length > 0) {
							showMessagePopup("Cannot change this team into a non squad team.  Iteration information has been entered for this team.");
							$("#teamSquadYesNo").attr("disabled", "disabled");
							$("#select2-teamSquadYesNo-container").css('color', 'grey');
							updateAgileTeamCache(jsonData);
							loadSelectedAgileTeam();
							allowed = false;
						}
					}

					if (allowed) {
						var rev = jsonData._rev;
						showLog('Updating ' + currentTeam._id + '. The current revision is ' + rev + '.');
						jsonData.name = $("#teamName").val().trim();
						jsonData.desc = $("#teamDesc").val();
						jsonData.squadteam = $("#teamSquadYesNo option:selected").val();
						// jsonData.last_updt_dt = new Date($.now()).toString();
						jsonData.last_updt_dt = getServerDateTime();
						jsonData.last_updt_user = userInfo.email;
						showLog(JSON.stringify(jsonData));
						$.ajax({
							type 				: "PUT",
							url 				: "/api/teams/",
							async 			: false,
							contentType : "application/json",
							data 				: JSON.stringify(jsonData),
							error 			: errorHandler
						}).done(function (data) {
							console.log(data);
							var putResp = (typeof data == 'string' ? JSON.parse(data) : data);
							var rev2 = putResp.rev;
							showLog('Done updating ' + currentTeam._id + '. The new revision is ' + rev2 + '.');

							updateAgileTeamCache(jsonData);
							loadSelectedAgileTeam();

							showMessagePopup("You have successfully updated Team Information.");
						});
					}
				});
			} else {
				// check to see if a parallel update for the child team info
				if ($("#teamSquadYesNo option:selected").val().toLowerCase() == "yes"
					 && jsonData.squadteam != undefined
					 && jsonData.squadteam.toLowerCase() == "no"
					 && jsonData.child_team_id != undefined
					 && jsonData.child_team_id.length > 0) {
					showMessagePopup("Cannot change this team into a squad team.  Child team has been entered for this team.");
					updateAgileTeamCache(jsonData);
					loadSelectedAgileTeam();

					return;
				}

				var rev = jsonData._rev;
				var message = "You have successfully updated Team Information.";
				showLog('Updating ' + currentTeam._id + '. The current revision is ' + rev + '.');

				if (action == "update") {
					jsonData.name = $("#teamName").val().trim();
					jsonData.desc = $("#teamDesc").val();
					jsonData.squadteam = $("#teamSquadYesNo option:selected").val();

				} else if (action == "parent") {
					var parentId = $("#parentSelectList option:selected").val();

					// if parent team changed, remove as a child of the original parent
					if (jsonData.parent_team_id != undefined && jsonData.parent_team_id != parentId && jsonData.parent_team_id != "")
						removeChildOfParent(jsonData.parent_team_id, currentTeam._id);

					// assign selected parent
					jsonData.parent_team_id = parentId;
					if (parentId != "")
						updateParentWithChild(parentId, currentTeam._id);
					message = "You have successfully updated the Parent team association.";

				} else if (action == "child") {
					var childId = $("#childSelectList option:selected").val();

					var found = false;
					if (jsonData.child_team_id != undefined && 
							jsonData.child_team_id.indexOf(childId) != -1) {
						found = true;
					}
					
					if (!found)
						jsonData.child_team_id.push(childId);

					jsonData.squadteam = $("#teamSquadYesNo option:selected").val();
					if (childId != "") {
						// check to see if a parallel update for the child team parent info
						$.ajax({
							type 	: "GET",
							url 	: "/api/teams/" + encodeURIComponent(childId)
						}).done(function (jsonChildData) {
							var rev = jsonChildData._rev;

							showLog('Updating ' + childId + ' child with new parent [' + jsonChildData.parent_team_id + '] to [' + currentTeam._id + ']. The current revision is ' + rev + '.');
							showLog(jsonChildData);
							
							if (jsonChildData.parent_team_id != undefined) {
								if (jsonChildData.parent_team_id == "") {
									message = "You have successfully created a Child team association.";
									updateChildTeamWithParentHandler(currentTeam._id, jsonChildData);

								} else {
									showMessagePopup("Unable to add selected team as a child.  Team may have been updated with another parent.");
									updateAgileTeamCache(jsonChildData);
									//loadSelectableChildren(currentTeam._id);
									return;
								}
							}
						});

					} else {
						setFieldErrorHighlight("childSelectList");
						showMessagePopup("No team selected to associate as a Child team.");
						return;

					}
				}

				jsonData.last_updt_dt = getServerDateTime();
				jsonData.last_updt_user = userInfo.email;
				showLog(JSON.stringify(jsonData));
				$.ajax({
					type 				: "PUT",
					url 				: "/api/teams/",
					async 			: false,
					contentType : "application/json",
					data 				: JSON.stringify(jsonData),
					error 			: errorHandler
				}).done(function (data) {
					console.log(data);
					var putResp = (typeof data == 'string' ? JSON.parse(data) : data);
					var rev2 = putResp.rev;
					showLog('Done updating ' + currentTeam._id + '. The new revision is ' + rev2 + '.');

					updateAgileTeamCache(jsonData);
					loadSelectedAgileTeam();

					showMessagePopup(message);
				});
			}
		});
	} else {
		var newTeamId = prefixTeam + $("#teamName").val() + "_" + new Date().getTime();
		newTeamId = newTeamId.replace(/^[^a-z]+|[^\w:.-]+/gi, "");
		
		var serverDateTime = getServerDateTime();
		var jsonData = initTeamTemplate(); //new Object();
		// if generated team id is the same as the prefix, we let cloudant generate the _id value as a last option
		if (newTeamId != prefixTeam)
			jsonData._id = newTeamId;
		jsonData.type = "team";
		jsonData.name = $("#teamName").val().trim();
		jsonData.desc = $("#teamDesc").val();
		jsonData.squadteam = $("#teamSquadYesNo option:selected").val();
		jsonData.parent_team_id = $("#parentSelectList option:selected").val();
		jsonData.last_updt_dt = serverDateTime;
		jsonData.last_updt_user = userInfo.email;
		// store who created this entry and created date
		jsonData.created_user = userInfo.email;
		jsonData.created_dt = serverDateTime;
		var person = JSON.parse(localStorage.getItem("userInfo"));
		var memberData = new Object();
		memberData.key = person.uid;
		memberData.id = person.email;
		memberData.name = person.name;
		memberData.allocation = 0;
		if ($("#teamSquadYesNo option:selected").val().toLowerCase() == 'yes')
			memberData.role = "Iteration Manager";
		else
			memberData.role = "Team Lead";

		jsonData.members = [memberData];
		jsonData.child_team_id = [];
		showLog(jsonData);
		$.ajax({
			type 				: "POST",
			url 				: "/api/teams",
			contentType : "application/json",
			data 				: JSON.stringify(jsonData),
			error 			: errorHandler
		}).done(function (data) {
			var json = (typeof data == 'string' ? JSON.parse(data) : data);
			var id = json.id;
			showLog('Added ' + jsonData.name + '. The new document ID is ' + id + '.');
			getAllAgileTeams(agileTeamListHandler, [id]);

			showMessagePopup("You have successfully added a team and you have been added as the first team member. You can now add additional team members.");
		});
	}
}

function deleteTeam() {
	var teamId = $("#teamSelectList option:selected").val();
	//find if team data already exists
	var currentTeam = getAgileTeamCache(teamId);
	if (currentTeam != null) {
		currentTeam = currentTeam.doc == null ? currentTeam : currentTeam.doc;
		getTeam(currentTeam._id, deleteTeamHandler, []);
	}
}

function deleteTeamHandler(team, iterations, assessments) {
	if (team != null) {
		if (iterations == null) {
			console.log("getting iterations");
			getTeamIterations(team._id, deleteTeamHandler, [team]);
			return;
		}
		if (assessments == null) {
			console.log("getting assessments");
			getTeamAssessments(team._id, deleteTeamHandler, [team, iterations]);
			return;
		}
		var hasAssoc = false;
		var msg = "You have requested to delete " + team.name + ". \n\n";
		msg = msg + "This team has the following associations: \n";

		if (team.parent_team_id != undefined && team.parent_team_id != "") {
			msg = msg + "\t Parent team: 1 \n";
			hasAssoc = true;
		}
		if (team.child_team_id != undefined && team.child_team_id.length > 0) {
			msg = msg + "\t Child team(s): " + team.child_team_id.length + " \n";
			hasAssoc = true;
		}
		if (iterations != null && iterations.length > 0) {
			msg = msg + "\t Iteration information: " + iterations.length + " \n";
			hasAssoc = true;
		}
		if (assessments != null && assessments.length > 0) {
			msg = msg + "\t Maturity assessment(s): " + assessments.length + " \n";
			hasAssoc = true;
		}
		if (!hasAssoc)
			msg = msg + "\t Team has no assciations. \n";
		
		msg = msg + "\n\t *You can return to Team Management page to review any of these associations. \n\n";
		
		msg = msg + "If you delete this team, any parent/child associations, iteration information, and maturity assessments will be DELETED. \n\n";

		msg = msg + "Select OK to proceed with the team delete or Cancel.";
		
		if (confirm(msg)) {
			var serverDateTime = getServerDateTime();
			var docs = new Object();			
			docs.docs = [];
			
			// delete parent/child association
			if (team.parent_team_id != undefined && team.parent_team_id != "") {
				removeChildOfParent(team.parent_team_id, team._id);
			}

			if (team.child_team_id != undefined ) {
				for (var i = 0; i < team.child_team_id.length; i++) 
					removeParentOfChild(team.child_team_id[i]);
			}
			
			// soft delete iteration information			
			for (var i in iterations) {
				iterations[i] = $.extend(true, {}, initIterationTemplate(), iterations[i]);
				iterations[i].doc_status = "delete";
				iterations[i].last_updt_dt = serverDateTime;
				iterations[i].last_updt_user = userInfo.email;
				docs.docs.push(iterations[i]);
			}
			
			// soft delete assessments
			for (var i in assessments) {
				assessments[i] = $.extend(true, {}, initAssessmentAnswersTemplate(), assessments[i]);
				assessments[i].doc_status = "delete";
				assessments[i].last_updt_dt = serverDateTime;
				assessments[i].last_updt_user = userInfo.email;
				docs.docs.push(assessments[i]);
			}
			
			// set team details for soft delete
			team = $.extend(true, {}, initTeamTemplate(), team);
			team.doc_status = "delete";
			team.last_updt_dt = serverDateTime;
			team.last_updt_user = userInfo.email;
			docs.docs.push(team);
			
			if (docs.docs.length > 0) {
				// make the bulk commit
				_db.bulkSave(docs, {
				  success: function(resp){
				  	console.log(resp.length + " document(s) deleted.");
				  	updateTeamInfo('reset');
				  	showMessagePopup("You have successfully deleted the team.");
				  },
				  error: errorHandler
				});
			}
		} else {
			$("#deleteTeamBtn").removeAttr("disabled");
		}
	}
}


function removeChildOfParent(parentId, childId) {
	getTeam(parentId, removeChildOfParentTeamHandler, [childId]);
}

function removeChildOfParentTeamHandler(childId, team) {
	var childTeam = [];
	if (team.child_team_id != undefined) {
		for (var i = 0; i < team.child_team_id.length; i++)
			if (team.child_team_id[i] != childId) {
				childTeam.push(team.child_team_id[i]);
			}
	}
	team = $.extend(true, {}, initTeamTemplate(), team);
	team.child_team_id = childTeam;
	team.last_updt_dt = getServerDateTime();
	team.last_updt_user = userInfo.email;

	setTeam(team, updateAgileTeamCache, []);
}

function updateParentWithChild(parentId, childId) {
	getTeam(parentId, updateParentWithChildTeamHandler, [childId]);
}

function updateParentWithChildTeamHandler(childId, team) {
	var childTeam = [];
	if (team.child_team_id == undefined)
		team.child_team_id = childTeam;

	var found = false;
	if (team.child_team_id != undefined) {
		for (var i = 0; i < team.child_team_id.length; i++)
			if (team.child_team_id[i] == childId) {
				found = true;
			}
	}
	if (!found) {
		team = $.extend(true, {}, initTeamTemplate(), team);
		team.child_team_id.push(childId);
		team.last_updt_dt = getServerDateTime();
		team.last_updt_user = userInfo.email;

		setTeam(team, updateAgileTeamCache, []);
	}
}

function updateChildTeamWithParent(childId, parentId) {
	getTeam(childId, updateChildTeamWithParentHandler, [parentId]);
}

function updateChildTeamWithParentHandler(parentId, team) {
	team = $.extend(true, {}, initTeamTemplate(), team);
	team.parent_team_id = parentId;
	team.last_updt_dt = getServerDateTime();
	team.last_updt_user = userInfo.email;

	setTeam(team, updateAgileTeamCache, []);
	
}

function addTeamMember(person, oldAlloc, newAlloc, oldRole, newRole) {
	var teamId = $("#teamSelectList option:selected").val();
	var currentTeam = null;
	if (allTeams != undefined) {
		currentTeam = getAgileTeamCache(teamId);
	}

	var existsMember = false;
	if (currentTeam != undefined) {
		currentTeam = currentTeam.doc == null ? currentTeam : currentTeam.doc;
		for (var i = 0; i < currentTeam.members.length; i++) {
			var tempAlloc = isNaN(parseInt(currentTeam.members[i].allocation)) ? 0 : currentTeam.members[i].allocation;
			if (currentTeam.members[i].id == person.email
				 && tempAlloc == oldAlloc
				 && currentTeam.members[i].role == oldRole) {
				existsMember = true;
			}
		}
		$.ajax({
			type 	: "GET",
			url 	: "/api/teams/" + encodeURIComponent(currentTeam._id)
		}).done(function (data) {
			var jsonData = data;
			var rev = jsonData._rev;
			showLog('Adding/updating team member ' + person.name + ' to ' + currentTeam._id + '. The current revision is ' + rev + '.');
			var found = false;
			if (jsonData.members != undefined && existsMember) {
				for (var i = 0; i < jsonData.members.length; i++) {
					var tempAlloc = isNaN(parseInt(jsonData.members[i].allocation)) ? 0 : jsonData.members[i].allocation;
					if (jsonData.members[i].id == person.email
						 && tempAlloc == oldAlloc
						 && jsonData.members[i].role == oldRole) {
						jsonData.members[i].name = person.name;
						jsonData.members[i].role = newRole;
						if (isNaN(parseInt(newAlloc))) {
							jsonData.members[i].allocation = 0;
						} else {
							jsonData.members[i].allocation = newAlloc;
						}
						found = true;
						break;
					}
				}
			}
			if (!found) {
				var memberData = new Object();
				memberData.key = person.uid;
				memberData.id = person.email;
				memberData.name = person.name;
				memberData.role = newRole;
				if (isNaN(parseInt(newAlloc))) {
					memberData.allocation = 0;
				} else {
					memberData.allocation = newAlloc;
				}
				jsonData.members.push(memberData);
				showLog(JSON.stringify(jsonData));
			}
			// jsonData.last_updt_dt = new Date($.now()).toString();
			jsonData.last_updt_dt = getServerDateTime();
			jsonData.last_updt_user = userInfo.email;
			$.ajax({
				type 				: "PUT",
				url 				: "/api/teams/",
				async 			: false,
				contentType : "application/json",
				data 				: JSON.stringify(jsonData),
				error 			: errorHandler
			}).done(function (data) {
				updateAgileTeamCache(jsonData);
				loadSelectedAgileTeam();
				loadTeamMembers(currentTeam._id);
				updateMemberInfo("clear");

				if (!found)
					showMessagePopup("You have successfully added a Team Member to team " + currentTeam.name + ".");
				else
					showMessagePopup("You have successfully updated a Team Member.");
			});
		});
	}
}

function deleteTeamMember() {
	var teamId = $("#teamSelectList option:selected").val();
	var currentTeam = null;
	if (allTeams != undefined) {
		currentTeam = getAgileTeamCache(teamId);
	}

	if (currentTeam != undefined) {
		currentTeam = currentTeam.doc == null ? currentTeam : currentTeam.doc;
		$.ajax({
			type 	: "GET",
			url 	: "/api/teams/" + encodeURIComponent(currentTeam._id)
		}).done(function (data) {
			var jsonData = data;
			var rev = jsonData._rev;
			showLog('Deleting team member from ' + currentTeam._id + '. The current revision is ' + rev + '.');
			var members = [];
			var removeMember = [];
			$("input[name='member']:checked").each(function () {
				var index = this.value;
				var email = $("#email_ref_" + index).text();
				var alloc = $("#alloc_ref_" + index).text();
				var role = $("#role_ref_" + index).text();
				for (var i = 0; i < jsonData.members.length; i++) {
					var tempAlloc = isNaN(parseInt(jsonData.members[i].allocation)) ? 0 : jsonData.members[i].allocation;
					if (jsonData.members[i].id == email
						 && tempAlloc == alloc
						 && jsonData.members[i].role == role) {
						showLog("Removing member: " + jsonData.members[i].id + " / " + jsonData.members[i].allocation + " / " + jsonData.members[i].role);
						removeMember.push(jsonData.members[i]);
					} else {
						members.push(jsonData.members[i]);
					}
				}
				jsonData.members = members;
				members = [];
			});

			// jsonData.last_updt_dt = new Date($.now()).toString();
			jsonData.last_updt_dt = getServerDateTime();
			jsonData.last_updt_user = userInfo.email;
			$.ajax({
				type 				: "PUT",
				url 				: "/api/teams/",
				async 			: false,
				contentType : "application/json",
				data 				: JSON.stringify(jsonData),
				error 			: errorHandler
			}).done(function (data) {
				updateAgileTeamCache(jsonData);
				loadSelectedAgileTeam();
				loadTeamMembers(currentTeam._id);
				updateMemberInfo("clear");

				showMessagePopup("You have successfully removed Team member(s).");
			});
		});
	}
}

function deleteChildTeam() {
	var teamId = $("#teamSelectList option:selected").val();
	var currentTeam = null;
	if (allTeams != undefined) {
		currentTeam = getAgileTeamCache(teamId);
	}
	
	if (currentTeam != undefined) {
		currentTeam = currentTeam.doc == null ? currentTeam : currentTeam.doc;
		$.ajax({
			type 	: "GET",
			url 	: "/api/teams/" + encodeURIComponent(currentTeam._id)
		}).done(function (data) {
			var jsonData = data;
			var rev = jsonData._rev;
			showLog('Deleting child team from ' + currentTeam._id + '. The current revision is ' + rev + '.');
			var childTeams = [];
			var removeParents = [];
			// get the remaining children listed in the table
			for (var i = 0; i < jsonData.child_team_id.length; i++) {
				$("#childrenList tr td[id^='ref_id_']").each(function () {
					var childId = $(this).attr("id").split("ref_id_")[1];
					showLog(jsonData.child_team_id[i] + " " + jsonData.child_team_id[i] + " " + childId);
					if (jsonData.child_team_id[i] == childId) {
						childTeams.push(jsonData.child_team_id[i]);
					}
				});
			}
			// showLog(childTeams);
			for (var i = 0; i < jsonData.child_team_id.length; i++) {
				if (childTeams.indexOf(jsonData.child_team_id[i]) == -1)
					removeParents.push(jsonData.child_team_id[i]);
			}
			// showLog(removeParents);
			for (var i = 0; i < removeParents.length; i++) {
				removeParentOfChild(removeParents[i]);
			}

			// jsonData.last_updt_dt = new Date($.now()).toString();
			jsonData.last_updt_dt = getServerDateTime();
			jsonData.last_updt_user = userInfo.email;
			jsonData.child_team_id = childTeams;
			showLog(JSON.stringify(jsonData));
			$.ajax({
				type 				: "PUT",
				url 				: "/api/teams/",
				async 			: false,
				contentType : "application/json",
				data 				: JSON.stringify(jsonData),
				error 			: errorHandler
			}).done(function (data) {
				updateAgileTeamCache(jsonData);
				loadTeamChildren(currentTeam._id);
				//loadSelectableChildren(currentTeam._id);

				showMessagePopup("You have successfully removed Child team association(s).");
			});
		});
	}
}

function removeParentOfChild(teamId) {
	getTeam(teamId, removeParentOfChildTeamHandler, []);
}

function removeParentOfChildTeamHandler(team) {
	team.parent_team_id = "";
	team.last_updt_dt = getServerDateTime();
	team.last_updt_user = userInfo.email;

	setTeam(team, updateAgileTeamCache, []);
}

function updateTeamInfo(action) {

	if (action == "add") {
		$("#addTeamBtn").attr("disabled", "disabled");
		addTeam(action);

	} else if (action == "update") {
		$("#updateTeamBtn").attr("disabled", "disabled");
		addTeam(action);
		
	} else if (action == "delete") {
		$("#deleteTeamBtn").attr("disabled", "disabled");
		deleteTeam();

	} else if (action == "clear" 
		|| (action == "reset" 
			&& ((localStorage.getItem("sysStatusFlag") != undefined && localStorage.getItem("sysStatusFlag") != 'AdminOnlyChange') 
					|| isAdmin()))) {
		$("#addTeamBtn,#updateChildBtn,#addMemberBtn,#updateParentBtn,#cancelMemberBtn").removeAttr("disabled");
		$("#teamName,#teamDesc,#teamMemberName,#memberAllocation").removeAttr("disabled");
		$("#teamSquadYesNo,#memberRoleSelectList,#memberListAction,#parentSelectList,#childSelectList,#childrenListAction,#iterTeamBtn,#assessBtn").removeAttr("disabled");
		$("#teamDesc,#select2-teamSquadYesNo-container,#select2-memberRoleSelectList-container,#select2-memberListAction-container,#select2-parentSelectList-container").css('color', 'black');
		$("#updateTeamBtn,#deleteTeamBtn").attr("disabled", "disabled");
		jQuery("#teamDetailsPageSection .ibm-show-hide a[class='ibm-show-active']").click();
		displayEditStatus(false);

		if (action == "clear") {
			var listOption = getAgileTeamDropdownList(allTeams, false);
			//setSelectOptions("teamSelectList", listOption, ["new", "Create new..."], null, null);
		}

		// reload all available teams
		if (action == "reset")
			getAllAgileTeams(agileTeamListHandler, ["new"]);
		$("#teamSquadYesNo").val("Yes");
		$("#select2-teamSquadYesNo-container").text("Yes");
		$("#select2-teamSquadYesNo-container").attr("title", "Yes");
		$("#teamName").val("");
		clearFieldErrorHighlight("teamName");
		$("#teamDesc").val("");

		loadTeamMembers(null);
		updateMemberInfo("clear");
		$("#memberListAction").val("");
		$("#select2-memberListAction-container").text("Actions...");
		$("#select2-memberListAction-container").attr("title", "Actions...");
		$("#select2-memberListAction-container").css('color', 'grey');
		$("#memberListAction").attr("disabled", "disabled");

		$("#parentSelectList").val("");
		$("#select2-parentSelectList-container").text($("#parentSelectList option:selected").text());
		$("#select2-parentSelectList-container").attr("title", $("#parentSelectList option:selected").text());

		$("#childSelectList").val("");
		$("#select2-childSelectList-container").text($("#childSelectList option:selected").text());
		$("#select2-childSelectList-container").attr("title", $("#childSelectList option:selected").text());

		$("#childrenListAction").val("");
		$("#select2-childrenListAction-container").text("Actions...");
		$("#select2-childrenListAction-container").attr("title", "Actions...");

		$("#teamDetailsPageSection").fadeOut();

	} else if (action == "parent") {
		$("#updateParentBtn").attr("disabled", "disabled");
		addTeam(action);

	} else if (action == "child") {
		$("#updateChildBtn").attr("disabled", "disabled");
		addTeam(action);

	}
}

function updateMemberInfo(action) {
	if (action == "clear") {
		taPerson = null;
		//getAllAgileTeamRoles(agileTeamRolesHandler, []);
		$("#otherRoleDescSection").fadeOut();
		$("#memberRoleSelectList").val("");
		$("#memberRoleSelectList").trigger("change");
		clearFieldErrorHighlight("memberRoleSelectList");
		$("#otherRoleDesc").val("");
		clearFieldErrorHighlight("otherRoleDesc");
		$("#teamMemberName").val("");
		clearFieldErrorHighlight("teamMemberName");
		$("#memberAllocation").val("");
		clearFieldErrorHighlight("memberAllocation");
		$("#teamMemberName").removeAttr("disabled");
		$("#addMemberBtn").removeAttr("disabled");
		$("#updateMemberBtn").attr("disabled", "disabled");
		$("#memberListAction").attr("disabled", "disabled");
		$("#select2-memberListAction-container").text("Action...");
		$("input[name='member']:checked").each(function () {
			this.checked = false;
		});
		return;
	}

	if (action == "add" || action == "update") {
		$("#addMemberBtn").attr("disabled", "disabled");
		$("#memberListAction").attr("disabled", "disabled");
		$("#updateMemberBtn").attr("disabled", "disabled");
		var hasError = false;
		var currAlloc = isNaN(parseInt($("#memberAllocation").val())) ? 0 : parseInt($("#memberAllocation").val());
		if (taPerson == undefined || $("#teamMemberName").val() == "") {
			setFieldErrorHighlight("teamMemberName");
			showMessagePopup("Unable to retrieve information from Faces for the member indicated.  Please try the selection again.");
			hasError = true;
		} else if (isNaN(currAlloc) || (currAlloc < 0 || currAlloc > 100)) {
			setFieldErrorHighlight("memberAllocation");
			showMessagePopup("Team member allocation should be between <br> 0 - 100");
			hasError = true;
		} else if ($("#memberRoleSelectList option:selected").val() == "") {
			setFieldErrorHighlight("memberRoleSelectList");
			showMessagePopup("Please select a valid role");
			hasError = true;
		} else if ($("#memberRoleSelectList option:selected").val() == "other" && $("#otherRoleDesc").val().trim() == "") {
			setFieldErrorHighlight("otherRoleDesc");
			showMessagePopup("Specify the \"Other\" role for the selected member.");
			hasError = true;
		}

		if (hasError) {
			if (action == "add")
				$("#addMemberBtn").removeAttr("disabled");
			else if (action == "update")
				$("#updateMemberBtn").removeAttr("disabled");

			return;
		}
	}

	var name = taPerson["name"];
	var email = taPerson["email"];
	var alloc = currAlloc;
	var location = taPerson["location"];
	var role = $("#memberRoleSelectList option:selected").val();

	if ($("#memberRoleSelectList option:selected").val() == "other") {
		role = $("#otherRoleDesc").val();
	}

	if (action == "add") {
		$("#memberList td.dataTables_empty").parent().remove();
		addTeamMember(taPerson, null, alloc, null, role);

	} else if (action == "update") {
		var index = $("input[name='member']:checked").attr("value");

		var oldAlloc = $("#alloc_ref_" + index).text();
		var oldRole = $("#role_ref_" + index).text();

		$("#email_ref_" + index).html(email);
		$("#alloc_ref_" + index).html(alloc);
		$("#role_ref_" + index).html(role);

		addTeamMember(taPerson, oldAlloc, alloc, oldRole, role);
		$("input[name='member']")[index].checked = false;
		$("#memberListAction").val("");
		$("#select2-memberListAction-container").text("Action...");
		$("#select2-memberListAction-container").attr("title", "Action...");
	}
}

function selectMember(elmnt) {
	elmnt.attr("checked") ? elmnt.parent().parent().addClass("ibm-row-selected")
	 : elmnt.parent().parent().removeClass("ibm-row-selected");

	var count = $('input[name="member"]:checked').length;
	if (count == $('input[name="member"]').length) {
		$("#all").attr("checked", "checked");
	} else {
		$("#all").removeAttr("checked");
	}

	if (count > 0) {
		clearFieldErrorHighlight("teamMemberName");
		$("#memberListAction").removeAttr('disabled');
		$("#memberAction").html("Actions... (" + count + ")");
		$("#select2-memberListAction-container").text("Actions... (" + count + ")");
		$("#select2-memberListAction-container").attr("title", "Actions... (" + count + ")");
		$("#select2-memberListAction-container").css('color', 'black');

	} else {
		$("#memberListAction").val("");
		$("#select2-memberListAction-container").text("Actions...");
		$("#select2-memberListAction-container").attr("title", "Actions...");
		$("#select2-memberListAction-container").css('color', 'grey');
		$("#memberListAction").attr('disabled', 'disabled');
		updateMemberInfo('clear');
	}
	// showLog(elmnt.parent().parent().attr('id'));
}

function selectChild(elmnt) {
	elmnt.attr("checked") ? elmnt.parent().parent().addClass("ibm-row-selected")
	 : elmnt.parent().parent().removeClass("ibm-row-selected");

	var count = $('input[name="child"]:checked').length;
	if (count == $('input[name="child"]').length) {
		$("#all").attr("checked", "checked");
	} else {
		$("#all").removeAttr("checked");
	}

	if (count > 0) {
		$("#childrenListAction").removeAttr("disabled");
		$("#childrenAction").html("Actions... (" + count + ")");
		$("#select2-childrenListAction-container").text("Actions... (" + count + ")");
		$("#select2-childrenListAction-container").attr("title", "Actions... (" + count + ")");
		$("#select2-childrenListAction-container").css('color', 'black');
	} else {
		$("#childrenListAction").val("");
		$("#select2-childrenListAction-container").text("Actions...");
		$("#select2-childrenListAction-container").attr("title", "Actions...");
		$("#select2-childrenListAction-container").css('color', 'grey');
		$("#childrenListAction").attr("disabled", "disabled");
	}
	// showLog(elmnt.parent().parent().attr('id'));
}


$(function () {
	ta1 = FacesTypeAhead.init(
			$('#teamMemberName')[0], 
			{
				key : "ciodashboard;agileteamtool@us.ibm.com",
				resultsAlign : "left",
				showMoreResults : false,
				faces : {
					headerLabel : "People",	
					onclick : function (person) {
						taPerson = person;
						return person["notes-id"];
					}
			},
			topsearch : {
				headerLabel : "w3 Results",
				enabled : true
			}
		});
});