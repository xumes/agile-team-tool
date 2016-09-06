var requests = []; //global array to keep track of the ajax called; used to cancel pending requests when switching tabs
var defSelTeamId="";
var defSelIndex="";
var squadList = [];
var loadedParentId = "";
var tempIterationData = [
	{
		'totalPoints' : 0,
		'totalStories' : 0,
		'totalCompleted' : 0,
		'totalDefects' : 0,
		'totalDplymts' : 0,
		'totTeamStat' : 0,
		'totClientStat' : 0,
		'totTeamStatIter' : 0,
		'totClientStatIter' : 0,
		'teamsLt5' : 0,
		'teams5to12' : 0,
		'teamsGt12' : 0,
		'totalSquad' : 0,
		'month':'',
		'partialMonth' : false

	},
	{
		'totalPoints' : 0,
		'totalStories' : 0,
		'totalCompleted' : 0,
		'totalDefects' : 0,
		'totalDplymts' : 0,
		'totTeamStat' : 0,
		'totClientStat' : 0,
		'totTeamStatIter' : 0,
		'totClientStatIter' : 0,
		'teamsLt5' : 0,
		'teams5to12' : 0,
		'teamsGt12' : 0,
		'totalSquad' : 0,
		'month':'',
		'partialMonth' : false

	},
	{
		'totalPoints' : 0,
		'totalStories' : 0,
		'totalCompleted' : 0,
		'totalDefects' : 0,
		'totalDplymts' : 0,
		'totTeamStat' : 0,
		'totClientStat' : 0,
		'totTeamStatIter' : 0,
		'totClientStatIter' : 0,
		'teamsLt5' : 0,
		'teams5to12' : 0,
		'teamsGt12' : 0,
		'totalSquad' : 0,
		'month':'',
		'partialMonth' : false

	},
	{
		'totalPoints' : 0,
		'totalStories' : 0,
		'totalCompleted' : 0,
		'totalDefects' : 0,
		'totalDplymts' : 0,
		'totTeamStat' : 0,
		'totClientStat' : 0,
		'totTeamStatIter' : 0,
		'totClientStatIter' : 0,
		'teamsLt5' : 0,
		'teams5to12' : 0,
		'teamsGt12' : 0,
		'totalSquad' : 0,
		'month':'',
		'partialMonth' : false

	},
	{
		'totalPoints' : 0,
		'totalStories' : 0,
		'totalCompleted' : 0,
		'totalDefects' : 0,
		'totalDplymts' : 0,
		'totTeamStat' : 0,
		'totClientStat' : 0,
		'totTeamStatIter' : 0,
		'totClientStatIter' : 0,
		'teamsLt5' : 0,
		'teams5to12' : 0,
		'teamsGt12' : 0,
		'totalSquad' : 0,
		'month':'',
		'partialMonth' : false
	},
	{
		'totalPoints' : 0,
		'totalStories' : 0,
		'totalCompleted' : 0,
		'totalDefects' : 0,
		'totalDplymts' : 0,
		'totTeamStat' : 0,
		'totClientStat' : 0,
		'totTeamStatIter' : 0,
		'totClientStatIter' : 0,
		'teamsLt5' : 0,
		'teams5to12' : 0,
		'teamsGt12' : 0,
		'totalSquad' : 0,
		'month':'',
		'partialMonth' : false
	}
];

var tempSquadScore = {
	"fte5to12" : 0,
	"fteGt12" : 0,
	"fteLt5" : 0,
	"tc5to12" : 0,
	"tcGt12" : 0,
	"tcLt5" : 0,
	"teams5to12" : 0,
	"teamsGt12" : 0,
	"teamsLt5" : 0
};

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
      getRootTeams();
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

function getRootTeams(parentsTree) {
	selectedElement = "";
	$('#mainContent').hide();
	$('#spinnerContainer').show();

	$("#teamTree").empty();
	$("#teamTable tbody").empty();
	$("#teamTable").hide();

	getAllAgileTeamsByParentId('', true, true, parentsTree);
}

function getMyTeamsFromDb(initial, loadStandalone) {
	var cUrl = "/api/snapshot/getteams/" + encodeURIComponent(userInfo.email);
	var req = $.ajax({
		type : "GET",
		url : cUrl
	}).done(function(data) {
		if (data != undefined) {
			if (data.length > 0) {
				//no duplicates
				var uniqueTeams = _.uniq(data, function(item) {
						return item._id;
				});
				var twistyId = "teamTreeMain";
				var standalone = false;
				var sortedTeams = _.sortBy(uniqueTeams, function(team){
					if (team.children.length == 0 && team.parents.length == 0) {
						standalone = true;
					}
					return team.name.toUpperCase();
				});

				if (standalone) {
					var standaloneTeam = {
						'_id' : 'ag_team_standalone',
						'isSquad' : false,
						'name' : 'Standalone Teams',
					};
					sortedTeams.push(standaloneTeam);
				}
				_.each(sortedTeams, function(team){
					addTeamToTree(team, twistyId, true);
				});
				if (initial) {
					if (standalone) {
						twistyId = "main_sub_ag_team_standalone";
						$("#bodysub_ag_team_standalone").append(createMainTwistySection(twistyId, ""));
						_.each(sortedTeams, function(team){
							addTeamToTree(team, twistyId, true);
						});
						$("#sub_"+jq("ag_team_standalone")).addClass("ibm-active");
						$("#sub_"+jq("ag_team_standalone")).attr("hasChildren","Yes");
						$("#sub_"+jq("ag_team_standalone")+(" a.ibm-twisty-body")).css("display","block");
						var defaultTeam = ($('#teamTreeMain li')[0]).id
						if (defaultTeam == "sub_ag_team_standalone") {
							defaultTeam = ($("#sub_ag_team_standalone li")[0]).id
						}
						loadDetails(defaultTeam);
						$(".nano").nanoScroller();
					} else {
						var defaultTeam = ($('#teamTreeMain li')[0]).id
						loadDetails(defaultTeam);
						$(".nano").nanoScroller();
					}
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

//add refresh timestamp after Iteration trend title
function setRefreshDate(timestamp){
	//var myDate = new Date(timestamp*1000); // creates a date that represents the number of milliseconds after midnight GMT on Januray 1st 1970.
	//$("#refreshDate").html(moment(myDate).format("DD-MMM-YYYY, hh:mm"));
	$("#refreshDate").html(moment.utc(timestamp*1000).format("MMM DD, YYYY, HH:mm (z)"));
}

//refresh button on the screen to refresh snapshot from workers
function performChartRefresh(teamId, teamName){
    destroyIterationCharts();
    destroyAssessmentCharts();
    getSnapshot(teamId, teamName);
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

function expandParentTeam(treeLinkId, parentsTree) {
	if (treeLinkId != null) {
		if ($("#"+jq(treeLinkId)).attr("hasChildren") != "Yes") {
			var parentId = treeLinkId.substring(4, treeLinkId.length);
			getAllAgileTeamsByParentId(parentId, false);
		}
		$("#"+jq(treeLinkId)).attr("hasChildren","Yes");
	}
}

function getAllAgileTeamsByParentId(parentId, showLoading, initial, parentsTree) {
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
					var sortedTeams = _.sortBy(data.docs, function(team){
						return team.name.toUpperCase();
					});
					if (parentId == '') {
						twistyId = 'teamTreeMain';
						$("#teamTree").append(createMainTwistySection("teamTreeMain", ""));
						$("#teamTreeMain").twisty();
						var standaloneTeam = {
							'_id' : 'ag_team_standalone',
							'isSquad' : false,
							'name' : 'Standalone Teams',
						};
						sortedTeams.push(standaloneTeam);
					} else {
						//twistyId = 'main_' + parentId;
						//$("#"+ 'bodysub_' + jq(parentId)).append(createMainTwistySection(twistyId, ""));
						twistyId = "bodysub_" + parentId;
					}
					//$("#"+jq(twistyId)).twisty();
					if (sortedTeams.length > 0) {
						var mainTwistyId = "main_sub_" + parentId;
						$("#" + jq(twistyId)).append(createMainTwistySection(mainTwistyId, ""));
					}
					_.each(sortedTeams, function(team){
						if (team.doc_status != 'delete') {
							addTeamToTree(team, mainTwistyId, false);
						}
					});
					if (parentsTree != undefined) {
						if (!_.isEmpty(parentsTree)){
							var parentTeamId = parentsTree[parentsTree.length - 1];
							$("#sub_"+jq(parentTeamId)).addClass("ibm-active");
							$("#sub_"+jq(parentTeamId)).attr("hasChildren","Yes");
							$("#sub_"+jq(parentTeamId)+(" a.ibm-twisty-body")).css("display","block");
							loadedParentId = parentsTree.splice(parentsTree.length - 1, 1);
							getAllAgileTeamsByParentId(parentTeamId, false, false, parentsTree);
						} else {
							if (loadedParentId != undefined && loadedParentId != "") {
								var subTwistyId = "sub_" + loadedParentId;
								loadDetails(subTwistyId,true);
								$(".nano").nanoScroller();
							}
							// $('#mainContent').show();
							// $('#spinnerContainer').hide();
						}
					} else {
						if (initial) {
							var defaultTeam = ($('#teamTreeMain li')[0]).id
							loadDetails(defaultTeam);
							$(".nano").nanoScroller();
						} else {
							$('#mainContent').show();
							$('#spinnerContainer').hide();
						}
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
					console.log("no iteation data for team: ", teamId);
					$("#refreshDate").html("Waiting for updating");
					iterationScoreCard(teamId, teamName, tempIterationData, tempSquadScore);
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
									console.log("no squad data for team: ", teamId);
									$("#refreshDate").html("Waiting for updating");
									iterationScoreCard(teamId, teamName, data.rows[0].value.value, tempSquadScore);
								} else {
									var iterationData = data.rows[0].value.value;
									setRefreshDate(data.rows[0].value.timestamp);  //TODO
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
	})
	.fail(function(err){
		$('#spinnerContainer').hide();
	})
	requests.push(req);
};

function getParentName(team) {
	var keyLabel = "Parent Team Name";
	var keyValue = "(No parent team information)"
	if (team['parent_team_id'] != "" && team['parent_team_id'] != undefined) {
		var cUrl = "/api/teams/lookup/team/" + encodeURIComponent(team['parent_team_id']);
		var req = $.ajax({
			type : "GET",
			url : cUrl
		}).done(function(data) {
			if (data != null && data.name != undefined) {
				keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:loadParentInAllTeams('" + team["_id"] + "');\">" + data.name + "</a>"+"<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:loadParentInAllTeams('" + team["_id"] + "');\"><span class='ibm-access'>Go to parent team</span></a></p>";
			}
			appendRowDetail(keyLabel, keyValue);
		})
		.fail(function(err){
			console.log(err);
			appendRowDetail(keyLabel, keyValue);
		});
		requests.push(req);
	}
};

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

		if (twistyId == "main_sub_ag_team_standalone") {
			if (isMyTeams) {
				if (team._id != "ag_team_standalone") {
					if (team.parents.length == 0 && team.children.length == 0) {
						$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
					}
				}
			} else {
				if (team.child_team_id.length == 0 && (team.parent_team_id == "" || team.parent_team_id == undefined)) {
					$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
				}
			}
		} else {
			if (team._id == 'ag_team_standalone') {
				$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "", team._id));
			} else {
				if (isMyTeams) {
					if (!_.isEmpty(team.child_team_id)) {
						$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, (isSquad ? "agile-team-standalone" : ""), team._id));
					} else if (team.children.length == 0 && team.parents.length > 0) {
						$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
					}
				} else {
					if (!_.isEmpty(team.child_team_id)) {
						$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, (isSquad ? "agile-team-standalone" : ""), team._id));
					} else if (_.isEmpty(team.child_team_id) && team.parent_team_id != "" && team.parent_team_id != undefined) {
						$("#"+jq(twistyId)).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
					}
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

function performSnapshotPull(teamId, teamName){
 destroyIterationCharts();
 destroyAssessmentCharts();
 getSnapshot(teamId, teamName);
}

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
	var isLeafTeam = false;
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
						$("#teamName").html(tn);
						keyValue = "<a href='team?id=" + encodeURIComponent(team["_id"]) + "' title='Manage team information'>" + tn + "</a>";
						appendRowDetail(keyLabel, keyValue);
					}

					if (team["squadteam"] != undefined) {
						keyLabel = "Squad Team?";
						keyValue = team["squadteam"];
						if (keyValue.toLowerCase() == "yes") {
							isLeafTeam = true;
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
						var parentLinkId = $("#link_sub_"+jq(parent_team_id));
						if(parentLinkId){
							var parentName;
							if (parentLinkId.html() != undefined) {
								parentName = parentLinkId.html();
								keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:displaySelected('" + parent_team_id + "', true);\">"+ parentName +"</a>"+"<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:displaySelected('" + parent_team_id + "', true);\"><span class='ibm-access'>Go to parent team</span></a></p>";
								appendRowDetail(keyLabel, keyValue);
							} else {
								getParentName(team);
							}
						}
					} else {
						keyLabel = "Parent Team Name";
						keyValue = "(No parent team infomation)";
						appendRowDetail(keyLabel, keyValue);
					}

					/* draw iteration and assessment charts */
					if (isLeafTeam) {
						getTeamIterations(team["_id"], teamIterationListHander, [team["_id"]]);
						getTeamAssessments(team["_id"], true, teamAssessmentListHander, [team["_id"]]);
						//this is done to display back the 2 other chart groups as 1st batch of rollup will only show velocity and throughput
						//$("#chartgrp2").show();
						//$("#chartgrp3").show();
						$('#snapshotPull').hide(); //hiding the refresh snapshot date
						$('#teamType').html("Squad:&nbsp;");
						$('#nsquad_team_scard').hide();
						$('#squad_team_scard').show();
						$('#iterationSection .agile-section-nav').show();
						$('#assessmentSection .agile-section-nav').show();

						$('assessmentSection .agile-section-title').addClass('ibm-showing');
						$('#assessmentSection a').addClass('ibm-show-active');
						$('#assessmentSection .ibm-container-body').css('display','block');

					} else {
						destroyIterationCharts();
						destroyAssessmentCharts();

						getSnapshot(team["_id"], team["name"]);
            $('#snapshotPull').show(); //show the refresh snapshot date
						$('#teamType').html("Team:&nbsp;");
						$('#nsquad_team_scard').show();
						$('#squad_team_scard').hide();
						$('#iterationSection .agile-section-nav').hide();
						$('#assessmentSection .agile-section-nav').hide();
						$('#refreshData').attr("onclick", "performChartRefresh('"+team._id+"','"+ team.name+"')");
						$('assessmentSection .agile-section-title').removeClass('ibm-showing');
						$('#assessmentSection a').removeClass('ibm-show-active');
						$('#assessmentSection .ibm-container-body').css('display','none');
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

	if (setScrollPosition != undefined && setScrollPosition) {
			$(".nano").nanoScroller();
			$(".nano").nanoScroller({
				scrollTo : $("#" + jq(scrollLink))
			});
	}

	// var positionFound = false;
	// var parentFound = false;
	// while(!positionFound) {
	// 	if (!$("#"+scrollLink).is(":visible")) {
	// 		if ($("#"+scrollLink).parents("li").length > 0) {
	// 			scrollLink = "link_"+$($("#"+scrollLink).parents("li")).id
	// 		} else {
	// 			break;
	// 		}
	// 	} else {
	// 		positionFound = true;
	// 	}
	// }

	// if (!IBMCore.common.util.scrolledintoview($("#"+jq(selectedElement)))) {
	// 	document.getElementById("ibm-content-main").scrollIntoView();
	// 	if (positionFound) {
	// 		$(".nano").nanoScroller();
	// 		$(".nano").nanoScroller({
	// 			scrollTo : $("#" + jq(scrollLink))
	// 		});
	// 	}
	// }
}

function loadParentInAllTeams(teamId) {
	$('#mainContent').hide();
	$('#spinnerContainer').show();
	var cUrl = "/api/teams/lookup/team/" + encodeURIComponent(teamId);
	var req = $.ajax({
		type : "GET",
		url : cUrl
	}).done(function(data) {
		if (data != null) {
			if (data.parents != undefined && !_.isEmpty(data.parents)) {
				if ($("#allTeams").attr('data-state') != "open"){

					 clearRequests();

					 $($("#allTeams")).attr('data-state', 'open');
					 $("#myTeams").attr('data-state', '');

					 hideAllContentAreaDivs();
					 getRootTeams(data.parents);
				 }
			}
		}
	});
}
//
// function trigger(data) {
// 	// for (var i = data.parents.length-1; i >= 0; i++) {
// 	// 	console.log(data.parents[i]);
// 		var trigger = $($("#sub_" + jq(data.parents[2]) + 'a.ibm-twisty-trigger')[0])
// 		//var trigger = $("#sub_" + jq(data.parents[2])).find("a.ibm-twisty-trigger");
// 		trigger.click();
// 	// }
// }
