var requests = []; //global array to maintain ajax calls
var defSelTeamId="";
var defSelIndex="";
var squadList = [];
jQuery.expr[':'].Contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

jQuery(function($) {
	$(document).ready(function() {
		getSessionVars(initPageAction);
	});

	function initPageAction() {
		var urlParameters = getJsonParametersFromUrl();
		if (urlParameters != undefined && urlParameters.testUser != undefined) {
			setTestUser(urlParameters.testUser);
			alert("here TestUser is: " + urlParameters.testUser);
		}
		// default to My team(s) view
		//$("#myTeams").click();
		getMyTeams();
	}

	$("#myTeams").click(function() {
    if ($(this).attr('data-state') != "open"){
			
			clearRequests();
			
      $($(this)).attr('data-state', 'open');
      $("#allTeams").attr('data-state', '');
			
			hideAllContentAreaDivs();
      getMyTeams();
    }
  });

	$("#allTeams").click(function() {
   if ($(this).attr('data-state') != "open"){
		 	
		  clearRequests();

      $($(this)).attr('data-state', 'open');
      $("#myTeams").attr('data-state', '');

			hideAllContentAreaDivs();
      getRootTeams(true);
    }
	});
});

//this function will cancel ajax calls to prevent things from executing
//i.e clicking between tabs quickly or clicking a squad/team and then clicking a tab
function clearRequests(){
	for(var i = 0; i < requests.length; i++)
		requests[i].abort();
	requests.length = 0;
}

function hideAllContentAreaDivs(){
	$(".nano").nanoScroller({ destroy: true });
	$("#mainContent").hide();
	$("#no-teams-highlightbox").hide();
	$("#spinnerContainer").hide();
}

function getMyTeams() {
	selectedElement = "";
	$('#mainContent').hide();
	$('#spinnerContainer').show();

	$("#teamTree").empty();
	$("#teamTable tbody").empty();
	$("#teamTable").hide();

	$("#teamTree").append(createMainTwistySection("teamTreeMain", ""));
	$("#teamTreeMain").twisty();
	getMyTeamsFromDb(true);
}

function getRootTeams() {
	selectedElement = "";
	$('#mainContent').hide();
	$('#spinnerContainer').show();

	$("#teamTree").empty();
	$("#teamTable tbody").empty();
	$("#teamTable").hide();

	getAllAgileTeamsByParentId('', true, true);
}

function getMyTeamsFromDb(initial) {
	var cUrl = "/api/snapshot/getteams/" + encodeURIComponent(userInfo.email);
	var req = $.ajax({
		type : "GET",
		url : cUrl
	}).done(function(data) {
		if (data != undefined) {
			if (data.length > 0) {
				var twistyId = 'teamTreeMain';
				_.each(data, function(team){
					addTeamToTree(team, twistyId, true);
				});
				if (initial) {
					var defaultTeam = ($('#teamTreeMain li')[0]).id
					loadDetails(defaultTeam);
					$(".nano").nanoScroller();
				} else {
					if ( $("#no-teams-highlightbox").css('display') == 'none' )
						$('#mainContent').show();
					$('#spinnerContainer').hide();
				}
			} else {
				$('#spinnerContainer').hide();
				$("#no-teams-highlightbox").show();
				showLog("data loaded: " + JSON.stringify(data));
			}
		}
	}).fail(function(e) {
			$('#spinnerContainer').hide();
  });
	requests.push(req);
}

function removeHighlightParents(treeLinkId) {
	if (treeLinkId != null) {
		//console.log($("#"+jq(treeLinkId)).children("a.agile-team-link")[0]);
		$($("#"+jq(treeLinkId)).children("a.agile-team-link")[0]).removeClass("agile-team-parent-selected");
	}	else {
		$("#teamTree a.agile-team-parent-selected").removeClass("agile-team-parent-selected");
	}
}

function highlightParents(treeLinkId) {
	if (treeLinkId != null) {
		//console.log(treeLinkId);
		if ($("#"+jq(treeLinkId)).attr("hasChildren") != "Yes") {
			var parentId = treeLinkId.substring(4, treeLinkId.length);
			getAllAgileTeamsByParentId(parentId, false);
		}
		$("#"+jq(treeLinkId)).attr("hasChildren","Yes");
		$("#" +jq(treeLinkId)).removeClass("agile-team-parent-selected");
		if (treeLinkId != "" && $("#" +jq(treeLinkId)+" a.agile-team-selected").length == 1) {
			$($("#" +jq(treeLinkId)).children("a.agile-team-link")[0]).addClass("agile-team-parent-selected");
		}
	} else {
		var li = $("#teamTree a.agile-team-selected").parents("li");
		for (var i=1; i<=li.length; i++) {
			var element = li[i];
			$($(element).children("a.agile-team-link")[0]).addClass("agile-team-parent-selected");
		}
	}
}

function expandParentTeam(treeLinkId) {
	if (treeLinkId != null) {
		if ($("#"+jq(treeLinkId)).attr("hasChildren") != "Yes") {
			var parentId = treeLinkId.substring(4, treeLinkId.length);
			getAllAgileTeamsByParentId(parentId, false);
		}
		$("#"+jq(treeLinkId)).attr("hasChildren","Yes");
	}
}

function getAllAgileTeamsByParentId(parentId, showLoading, initial) {
	if (showLoading) {
		$('#mainContent').hide();
		$('#spinnerContainer').show();
	}
	var cUrl;
	if (parentId == 'ag_team_standalone') {
		cUrl = "/api/teams?parent_team_id=";
	} else {
		cUrl = "/api/teams?parent_team_id=" +encodeURIComponent(parentId);
	}
	var req = $.ajax({
		type : "GET",
		url : cUrl
	}).done(function(data) {
		if (data != undefined) {
			console.log("data has rows " + _.has(data, 'docs'));
			//console.log("data has value " + _.has(data, 'value'));
			if (_.has(data, "docs")) {
				if (data.docs == null) {
					console.log("data loaded failed");
				} else {
					var twistyId;
					if (parentId == '') {
						twistyId = 'teamTreeMain';
						$("#teamTree").append(createMainTwistySection("teamTreeMain", ""));
						$("#teamTreeMain").twisty();
						var standaloneTeam = {
							'_id' : 'ag_team_standalone',
							'isSquad' : false,
							'name' : 'Standalone Teams',
						};
						data.docs.push(standaloneTeam);
					} else {
						//twistyId = 'main_' + parentId;
						//$("#"+ 'bodysub_' + jq(parentId)).append(createMainTwistySection(twistyId, ""));
						twistyId = "bodysub_" + parentId;
					}
					//$("#"+jq(twistyId)).twisty();
					if (data.docs.length > 0) {
						var mainTwistyId = "main_sub_" + parentId;
						$("#" + jq(twistyId)).append(createMainTwistySection(mainTwistyId, ""));
					}
					_.each(data.docs, function(team){
						addTeamToTree(team, mainTwistyId, false);
					});
					if (initial) {
						var defaultTeam = ($('#teamTreeMain li')[0]).id
						loadDetails(defaultTeam);
						$(".nano").nanoScroller();
					} else {
						$('#mainContent').show();
						$('#spinnerContainer').hide();
					}
				}
			} else {
				showLog("data loaded: " + JSON.stringify(data));
			}
		}
	});
	requests.push(req);
}

function getSnapshot(teamId, teamName) {
	$('#mainContent').hide();
	$('#spinnerContainer').show();
	var cUrl = "/api/snapshot/rollupsquadsbyteam/" + encodeURIComponent(teamId);
	var req = $.ajax({
		type : "GET",
		url : cUrl
	}).done(function(data) {
		if (data != undefined) {
			//console.log("data has rows " + _.has(data, 'rows'));
			//console.log("data has value " + _.has(data, 'value'));
			if (_.has(data, "rows")) {
				if (data.rows == null) {
					//console.log("data loaded failed");
				} else if (data.rows.length <= 0) {
					//console.log("no iteation data for team: ", teamId);
				} else {
					var nonsquadScore = data.rows[0].value.value;
					var cUrl = "/api/snapshot/rollupdatabyteam/" + encodeURIComponent(teamId);
					var innerReq = $.ajax({
						type : "GET",
						url : cUrl
					}).done(function(data) {
						if (data != undefined) {
							console.log("data has rows " + _.has(data, 'rows'));
							//console.log("data has value " + _.has(data, 'value'));
							if (_.has(data, "rows")) {
								if (data.rows == null) {
									console.log("data loaded failed");
								} else if (data.rows.length <= 0) {
									console.log("no iteation data for team: ", teamId);
								} else {
									var iterationData = data.rows[0].value.value;
									iterationScoreCard(teamId, teamName, iterationData, nonsquadScore);
								}
							} else {
								showLog("data loaded: " + JSON.stringify(data));
							}
						}
					});
					requests.push(innerReq);
					// iterationScoreCard(teamId, teamName, iterationData);
				}
			} else {
				showLog("data loaded: " + JSON.stringify(data));
			}
		}
	});
	requests.push(req);
}

function jq( myid ) {
    return myid.replace( /(:|\.|\[|\]|,|\/| )/g, "\\$1" );
}

function addTeamToTree(team, twistyId, isMyTeams) {
	if (team != null) {
		var isSquad = false;
		if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES") {
			isSquad = true;
		}
		var label = team.name;
		var subTwistyId = "sub_" + team._id;


		if (isMyTeams) {
			if (!_.isEmpty(team.child_team_id)) {
				$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, (isSquad ? "agile-team-standalone" : ""), team._id));
			} else {
				$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
			}
		} else {
			if (twistyId == "main_sub_ag_team_standalone") {
				if (team.child_team_id.length == 0 && (team.parent_team_id == "" || team.parent_team_id == undefined)) {
					$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
				}
			} else if (team._id == 'ag_team_standalone'){
				$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "", team._id));
			} else{
				if (!_.isEmpty(team.child_team_id)) {
					$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, (isSquad ? "agile-team-standalone" : ""), team._id));
				} else if (_.isEmpty(team.child_team_id) && team.parent_team_id != "" && team.parent_team_id != undefined) {
					$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
				}
			}
		}

		if (team._id != 'ag_team_standalone') {
			var link = $("#" + jq(subTwistyId)).find("a.agile-team-link");
			var linkId = "link_" + subTwistyId;
			link.attr("id", linkId);
			link.on("click", function() {
				$(".nano").nanoScroller;
				loadDetails(subTwistyId);
			});
		}
		//treeLinkId = "";
		var trigger = $("#" + jq(subTwistyId)).find("a.ibm-twisty-trigger");
		trigger.attr("title", "Expand/Collapse").on("click", function() {
			if ($("#" + jq(subTwistyId)).hasClass("ibm-active")) {
				//removeHighlightParents(subTwistyId);
			} else {
				//highlightParents(subTwistyId);
				expandParentTeam(subTwistyId);
			}
		});
	}
}

function createMainTwistySection(twistyId, extraClass) {
	var ul = document.createElement("ul");
	ul.setAttribute("class", "ibm-twisty " + extraClass);
	ul.setAttribute("id", twistyId);
	return ul;
}

function createSubTwistySection(twistyId, twistyLabel, extraClass, teamId) {
	var li = document.createElement("li");
	li.setAttribute("data-open", "false");
	if (extraClass.indexOf("agile-team-standalone") > -1)
		li.setAttribute("class", "agile-team-standalone");
	li.setAttribute("id", twistyId);

	var spanLink = document.createElement("span");
	spanLink.setAttribute("class", "ibm-access");
	spanLink.appendChild(document.createTextNode(twistyLabel));

	var span = document.createElement("a");
	span.setAttribute("class", "ibm-twisty-trigger");
	span.setAttribute("href", "#toggle");
	span.appendChild(spanLink);
	li.appendChild(span);

	var href = document.createElement("a");
	href.setAttribute("class", "agile-team-link " + extraClass);
	href.setAttribute("title", "View " + twistyLabel + " team information ");
	href.appendChild(document.createTextNode(twistyLabel));
	li.appendChild(href);

	//we're putting this span to hold the relevant team id
	span = document.createElement("span");
	span.setAttribute("class", "ibm-access");
	span.appendChild(document.createTextNode(teamId));
	li.appendChild(span);

	var div = document.createElement("div");
	div.setAttribute("class", "ibm-twisty-body");
	div.setAttribute("id", "body"+twistyId);
	div.setAttribute("display", "none");
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
		$("#location_ref_" + index).text(facesPerson.location);
	} else {
		$("#location_ref_" + index).text("-unavailable-");
	}
}

/**
 * Appends team related information in the team information table.
 *
 * @param keyLabel - team information label.
 * @param keyValue - team information value.
 */
function appendRowDetail(keyLabel, keyValue) {
	var row = "<tr>";
	row = row + "<td><p>" + keyLabel + "</p></td>";
	row = row + "<td><p>" + keyValue + "</p></td>";
	row = row + "</tr>";
	$("#levelDetail").append(row);
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

function displaySelected(teamId, reload){
	//defSelTeamId = teamId;
	if (reload == null) {
		$("#allTeams").click();
	} else if (reload) {
		loadDetails("sub_" + teamId, true);
	} else
		loadDetails("sub_" + teamId);
}


/**
 * Global variable holder for highligted team in the team hierarchy table.
 */
var selectedElement = "";
/**
 * Retrieves the team related information to be shown in the page.
 *
 * @param elementId - selected element id. ('sub_xxxx')
 */

function loadDetails(elementId, setScrollPosition) {
	if (selectedElement == elementId || $("#"+jq(elementId)).html() == "Standalone teams") {
  	return;

  } else if (selectedElement != elementId) {
  	if (selectedElement != "") {
  		$("#"+"link_"+jq(selectedElement)).removeClass("agile-team-selected");
  		//$("#search_"+selectedElement).removeClass("agile-team-selected");
  	}
	  selectedElement = elementId;
	}

	//$("#search_"+elementId).addClass("agile-team-selected");
	$("#"+"link_"+jq(elementId)).addClass("agile-team-selected");

	var teamId = elementId.substring(4,elementId.length);
	var isSquadTeam = false;
	if (defSelTeamId != teamId) {
		$('#mainContent').hide();
		$('#spinnerContainer').show();

		if (teamId == teamId) {
			//removeHighlightParents();
			// $.({message: ""});
			defSelTeamId = teamId;
			// make sure team data is always the latest data to show
			var req = $.ajax({
				type : "GET",
				url : "/api/teams/" + encodeURIComponent(teamId)
			}).fail(function() {
				// $.un();

			}).done(function(currentTeam) {
				team = currentTeam;
				if (team != undefined) {
					$("#levelDetail").empty();
					var keyLabel = "";
					var keyValue = "";
					if (team["_id"] != undefined) {
						keyLabel = "Team Id";
						keyValue = team["_id"];
					}

					if (team["name"] != undefined) {
						keyLabel = "Team Name";
						var tn = team["name"];
						if (tn.trim() == "")
							tn = "&nbsp;";
						$("#teamName").html("Data for: " + tn);
						keyValue = "<a href='team?id=" + encodeURIComponent(team["_id"]) + "' title='Manage team information'>" + tn + "</a>";
						appendRowDetail(keyLabel, keyValue);
					}

					if (team["squadteam"] != undefined) {
						keyLabel = "Squad Team?";
						keyValue = team["squadteam"];
						if (keyValue.toLowerCase() == "yes") {
							isSquadTeam = true;
						}
					}

					if (team["desc"] != undefined) {
						keyLabel = "Team Description";
						keyValue = team["desc"];
						appendRowDetail(keyLabel, keyValue);
					}

					if (team["members"] != undefined) {
						keyLabel = "Team Member Count";
						keyValue = teamMemCount(team["members"]);
						appendRowDetail(keyLabel, keyValue);
					}

					if (team["members"] != undefined) {
						keyLabel = "FTE";
						keyValue = teamMemFTE(team["members"]);
						appendRowDetail(keyLabel,keyValue);
					}

					/* Get parent name and link */
					if (team["parent_team_id"] != undefined && team["parent_team_id"] != "") {
						var parent_team_id = team["parent_team_id"];
						keyLabel = "Parent Team Name";
						keyValue = "(No parent team infomation)";
						var found = false;
						if (parent_team_id != "") {
							var parentLinkId = $("#link_sub_"+jq(parent_team_id));
							if(parentLinkId){
								var parentName = parentLinkId.html();
								found = true;
							} else {
								//TODO need use id to get info from db
							}
						}
						if (found) {
							keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:displaySelected('" + parent_team_id + "', true);\">"+ parentName +"</a>"+"<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:displaySelected('" + parent_team_id + "', true);\"><span class='ibm-access'>Go to parent team</span></a></p>";
						} else {
							keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:displaySelected('" + team["parent_team_id"] + "');\">"+ parentName +"</a>"+"<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:displaySelected('" + team["parent_team_id"] + "');\"><span class='ibm-access'>Go to parent team</span></a></p>";
						}
						appendRowDetail(keyLabel, keyValue);
					}

					/* draw iteration and assessment charts */
					if (isSquadTeam) {
						getTeamIterations(team["_id"], teamIterationListHander, [team["_id"]]);
						getTeamAssessments(team["_id"], true, teamAssessmentListHander, [team["_id"]]);
						//this is done to display back the 2 other chart groups as 1st batch of rollup will only show velocity and throughput
						//$("#chartgrp2").show();
						//$("#chartgrp3").show();
						$('#nsquad_team_scard').hide();
						$('#squad_team_scard').show();
						$('#iterationSection .agile-section-nav').show();
						$('#assessmentSection .agile-section-nav').show();
						isSquadTeam = false;
					} else {
						destroyIterationCharts();
						destroyAssessmentCharts();

						getSnapshot(team["_id"], team["name"]);

						$('#nsquad_team_scard').show();
						$('#squad_team_scard').hide();
						$('#iterationSection .agile-section-nav').hide();
						$('#assessmentSection .agile-section-nav').hide();
						isSquadTeam = false;
					}

					$("#membersList").empty();
					if (team.members != undefined && team.members.length > 0) {
						var members = sortTeamMembersByName(team.members);
						for ( var j = 0; j < members.length; j++) {
							var member = members[j];
							var row = "<tr><td id='name_" + j + "'>" + member.name + "</td>";
							row = row + "<td>" + member.allocation + "</td>";
							row = row + "<td id='location_ref_" + j + "'><div class='ibm-spinner'></div></td>";
							row = row + "<td>" + member.role + "</td>";
							row = row + "</tr>";
							$("#membersList").append(row);
							getPersonFromFaces(member.id, facesPersonHandler, [j, member.id]);
						}
					} else {
						$("#membersList").append('<tr class="odd"><td valign="top" colspan="4" class="dataTables_empty">No data available</td></tr>');
					}
				}
			});
			requests.push(req);
			openSelectedTeamTree(setScrollPosition);
		}
	} else {
		openSelectedTeamTree(setScrollPosition);
	}
}

function openSelectedTeamTree(setScrollPosition) {

	// this expands the tree where the team is found (that is if that section is not expanded)
	if (!$("#" + jq(selectedElement)).is(":visible"))	{
		$("#" + jq(selectedElement)).parents("li").each(function() {
			$(this).addClass("ibm-active");
			$("#body" + $(this).attr("id")).css("display", "block");
		});
	}

	var scrollLink = "link_"+selectedElement;

	var positionFound = false;
	var parentFound = false;
	while(!positionFound) {
		if (!$("#"+scrollLink).is(":visible")) {
			if ($("#"+scrollLink).parents("li").length > 0) {
				scrollLink = "link_"+$($("#"+scrollLink).parents("li")).id
			} else {
				break;
			}
		} else {
			positionFound = true;
		}
	}

	if (!IBMCore.common.util.scrolledintoview($("#"+jq(selectedElement)))) {
		//document.getElementById("ibm-content-main").scrollIntoView();
		if (positionFound) {
			$(".nano").nanoScroller();
			$(".nano").nanoScroller({
				scrollTo : $("#" + jq(scrollLink))
			});
		}
	}

	if (setScrollPosition != undefined && setScrollPosition) {
		if (positionFound) {
			$(".nano").nanoScroller();
			$(".nano").nanoScroller({
				scrollTo : $("#" + jq(scrollLink))
			});
		}
	}
}
