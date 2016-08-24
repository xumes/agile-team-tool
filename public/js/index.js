/**
 * Global variable holder list of teams where user is a member.
 */
var myTeams;
/**
 * Global variable holder for all defined teams.
 */
var allTeams;
var allTeamsLookup;
var defSelTeamId="";
var defSelIndex="";
var squadList = [];
var collectedIterations = [];
jQuery.expr[':'].Contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

jQuery(function($) {
	$(document).ready(function() {
		
		var urlParameters = getJsonParametersFromUrl();
		if (urlParameters != undefined && urlParameters.testUser != undefined) {
			resetUser(urlParameters.testUser);
			alert("here TestUser is: " + urlParameters.testUser);
		}

		// default to My team(s) view
		filter($('#myTeams').attr("id"));
	});

	$("#teamFilter").keyup(function() {
		$("#teamTable").show();
		$("#teamTable tbody tr td a").parent().show();

		var filter = $("#teamFilter").val();
		if (filter.trim() != "") {
			$("#teamTree").hide();
			$(".agile-section-expand-collapse").hide();
			$("#teamTable tbody tr td a:not(:Contains('" + filter + "'))").parent().hide();
		} else if (filter == ""){
			$("#teamTree").show();
			$(".agile-section-expand-collapse").show();
			$("#teamTable").hide();
			openSelectedTeamTree(true);
		}
	});
	
	$("#myTeams").click(function() {
    if ($(this).attr('data-state') != "open"){
      $($(this)).attr('data-state', 'open');
      $("#allTeams").attr('data-state', '');
			$("#mainContent").hide();
			$(".nano").nanoScroller({ destroy: true });
      filter($(this).attr("id"));
    }
  });
	
	$("#allTeams").click(function() {
   if ($(this).attr('data-state') != "open"){
      $($(this)).attr('data-state', 'open');
      $("#myTeams").attr('data-state', '');
			$("#no-teams-highlightbox").hide();
      filter($(this).attr("id"));
    }
	});

	$("#teamExpand").click(function() {
		$("#teamTree li").each(function() {
		  $(this).addClass("ibm-active");
		  $("#body"+$(this).attr("id")).css("display", "block");
		});
		removeHighlightParents();
		openSelectedTeamTree(true);
		$(".nano").nanoScroller();
	});

	$("#teamCollapse").click(function() {
		$("#teamTree li").each(function() {
		  $(this).removeClass("ibm-active");
		  $("#body"+$(this).attr("id")).css("display", "none");
		});
		highlightParents();
		$(".nano").nanoScroller();
	});
	
	$("#iterationSection a").click(function() {
		if ($(this).attr("class") == "ibm-show-active") {
			redrawCharts("iterationSection");
		}
	});
	
	$("#assessmentSection a").click(function() {
		if ($(this).attr("class") == "ibm-show-active") {
			redrawCharts("assessmentSection");
		}
	});

});

//CLEARABLE INPUT
function tog(v) {
	return v ? 'addClass' : 'removeClass';
}

$(document).on('input', '.clearable', function() {
	$(this)[tog(this.value)]('x');
}).on('mousemove', '.x', function(e) {
	$(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');
}).on('touchstart click', '.onX', function(ev) {
	ev.preventDefault();
	$(this).removeClass('x onX').val('').change();
	/*
	 * $("#teamTable tbody tr td a").each(function(index, obj) {
	 * $($(obj).parent()).show(); });
	 */
	$("#teamTree").show();
	$("#teamTable").hide();
	$(".agile-section-expand-collapse").show();

	openSelectedTeamTree(true);
	
});
// $('.clearable').trigger("input");
//Uncomment the line above if you pre-fill values from LS or server

function openSelectedTeamTree(setScrollPosition) {
	// this expands the tree where the team is found (that is if that section is not expanded)
	if (!$("#" + selectedTeam).is(":visible"))	{
		$("#" + selectedTeam).parents("li").each(function() {
			$(this).addClass("ibm-active");
			$("#body" + $(this).attr("id")).css("display", "block");
		});
	}
	
	// look for the nearest visible team link
	var scrollPosition = selectedTeam.split("_")[1] - 2;
	var scrollLink = selectedTeam;
	var positionFound = false;
	while (!positionFound && scrollPosition >= 0) {
	  scrollLink = "link_" + scrollPosition;
	  if (!$("#" + scrollLink).is(":visible")) {
	    if ($("#" + scrollLink).parents("li").length > 0 && !$($("#" + scrollLink).parents("li")[0]).is(":visible"))
	      scrollPosition = scrollPosition - 1;
	  } else {
	    positionFound = true;
	  }
	}
	
	if (!IBMCore.common.util.scrolledintoview($("#"+selectedTeam))) {
		//document.getElementById("ibm-content-main").scrollIntoView();
		if (positionFound) {
			$(".nano").nanoScroller();
			$(".nano").nanoScroller({
				scrollTo : $("#" + scrollLink)
			});
		}
	} 

	if (setScrollPosition != undefined && setScrollPosition) {
		if (positionFound) {
			$(".nano").nanoScroller();
			$(".nano").nanoScroller({
				scrollTo : $("#" + scrollLink)
			});
		}
	}
}
/**
 * Redraw charts to handle sizing of graphs in collapsable section display.
 * 
 * @param section - collapsable section id.
 */
function redrawCharts(section) {
	console.log(Highcharts.charts)
	$(Highcharts.charts).each(function(i,chart) {
		if (chart == null) return;
		
		
		if ($("#" + section + " #" + $(chart.container).attr("id")).length > 0) {
			showLog("adjusting graphs at section: " + section);
			var height = chart.renderTo.clientHeight; 
	    var width = chart.renderTo.clientWidth; 

	    chart.setSize(width, height); 
		}
  });
}

/**
 * Callback function to handle returned teams.
 * 
 * @param show - show hierarchy in team table.
 * @param userEmail - member user email to search.
 * @param teamList - array of teams
 */
function agileTeamListHandler(show, allTeamList) {
	allTeams = organizeTeamList(allTeamList);
	if (show)
		organizeTeamHierarchy(false);
	else
		$("#myTeams").click();

}

/**
 * Callback function to handle returned teams where user is a member.
 * 
 * @param show - show hierarchy in team table.
 * @param userEmail - member user email to search.
 * @param userTeamList - array of teams where user email exists as a member.
 */
function userAgileTeamListHandler(show, userEmail, userTeamList) {
	if(_.isEmpty(userTeamList)){
		$("#spinnerContainer").hide();
		$("#no-teams-highlightbox").show();
	}
	myTeams = organizeTeamList(userTeamList);
	if (show) 
		organizeTeamHierarchy(true);
	
}

/**
 * Arrange team node hierarchy.
 * 
 * @param teamList - array of teams.
 */
function organizeTeamList(teamList) {
	if (_.has(teamList, "_root") || _.has(teamList, "_branch") || _.has(teamList, "_standalone"))
		return teamList;

	teamList = _.groupBy(teamList, function(team) {
		var level =  "_root";
		if (_.isEmpty(team.parent_team_id) && _.isEmpty(team.child_team_id))
			level = "_standalone";
		else if (!_.isEmpty(team.parent_team_id))
    	level = "_branch";
		return level;
	});

	if (_.has(teamList, '_root'))
		teamList._root = _.sortBy(teamList._root, function(team) {return team.name});
	if (_.has(teamList, '_branch'))
		teamList._branch = _.sortBy(teamList._branch, function(team) {return team.name});
	if (_.has(teamList, '_standalone')) 
		teamList._standalone = _.sortBy(teamList._standalone, function(team) {return team.name});

	return teamList;
}

/**
 * Filters team hierarchy listing.
 * 
 * @param id - element id for either "My teams" or "All teams".
 */
function filter(id) {
	//$.({message: ""});

	selectedTeam = "";
	
	if (id == "myTeams") {
		if (myTeams != null)
			userAgileTeamListHandler(true, user.shortEmail, myTeams);
		else
			getAllAgileTeamsForUser(user.shortEmail, userAgileTeamListHandler, [true, user.shortEmail]);

	} else {
		if (allTeams != null){
			agileTeamListHandler(true, allTeams);
		}
		else
			getAllAgileTeams(agileTeamListHandler, [true]);

	}
}

function organizeTeamHierarchy(myTeamsOnly) {
	//$.({message: ""});
	var start = new Date().getTime();

	$("#teamTree").empty();
	$("#teamTable tbody").empty();
	$("#teamTable").hide();

	var teamList = myTeamsOnly ? myTeams : allTeams;
	if (!_.isEmpty(teamList)) {
		$("#teamTree").append(createMainTwistySection("teamTreeMain", ""));
		if (myTeamsOnly) {
			var list = _.union(teamList._root, teamList._branch);
			var cleanList = [];
			var childIds = _.flatten(_.pluck(list, "child_team_id"));
			_.each(list, function(team) {
				if (childIds.indexOf(team._id) == -1)
					cleanList.push(team);
			});

			_.each(_.sortBy(
				cleanList, function(team) {return team.name})
				, function(team) {
					addTeamTwisty(team, "teamTreeMain");
			});

		} else {
			if (_.has(teamList, "_root"))
				_.each(teamList._root, function(team) {
					addTeamTwisty(team, "teamTreeMain");
				});
		}

		if (_.has(teamList, "_standalone")) {
			var twistyId = "sub_" + $("#teamTree li").length;
			$("#teamTreeMain").append(createSubTwistySection(twistyId, "Standalone teams", ""));
			_.each(teamList._standalone, function(team) {
				var isSquad = false;
				if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES")
					isSquad = true;
								
				var label = team.name;
				var subTwistyId = "sub_" + $("#teamTree li").length;
				$("#body"+twistyId).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
			});
		}

		$("#teamTreeMain").twisty();
		
		// assign ids to manipulate elements easily
		defSelIndex = "";
		$("#teamTree a.agile-team-link").each(function(index) {
			var linkId = "link_"+index;
			$(this).attr("id", linkId);
			var teamId = $(this).siblings("span")[0].innerHTML;
			if (defSelTeamId == teamId)
				defSelIndex = linkId;
			
			// populate the filter search table (this is arranged according to hierarchy)
			addTeamFilteredData(linkId, $(this).html(), $(this).hasClass('agile-team-squad'));
		});
		
		sortFilteredDataTable();
		
		treeLinkId = "";
		$("#teamTree li a.ibm-twisty-trigger").attr("title", "Expand/Collapse").on("mouseover", function() {
			// track which tree is being collapsed/expanded
			treeLinkId = $(this).parent("li").attr("id");
			
		}).on("click", function() {
			if ($(this).parent("li").hasClass("ibm-active")) {
				// console.log("click: being closed");
				highlightParents(treeLinkId);				
			} else {
				// console.log("click: being opened");
				removeHighlightParents(treeLinkId);
			}
			
		});
		
		$("#teamTree a.agile-team-link").on("click", function() {
			$(".nano").nanoScroller;
			loadDetails($(this).attr("id"));
		});
	}
	var filter = $("#teamFilter").val();
	if (filter.trim() != "") {
		$("#teamTable").show();
		$("#teamTable tbody tr td a:not(:Contains('" + filter + "'))").each(function(index, obj) {
			$($(obj).parent()).hide();
		});
	}

	if (defSelIndex != "")
		loadDetails(defSelIndex);
	else if ($("#teamTree a.agile-team-link").length > 0)
		loadDetails($("#teamTree a.agile-team-link")[0].id);
	else		
		//$.un();
	
	var end = new Date().getTime();
	
	showLog("Organized teams duration: " + (end-start)/1000);
	// force and show scroll bar
	$(".nano").nanoScroller();
}

function addTeamTwisty(team, twistyId) {
	if (team != null) {
		var isSquad = false;
		if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES")
			isSquad = true;

		// if there are any child teams indicated, process child teams.
		if (!_.isEmpty(team.child_team_id)) {
			team.child_team_id = sortChildTeams(team.child_team_id);
			
			var label = team.name;
			var subTwistyId = "sub_" + $("#teamTree li").length;
			$("#"+twistyId).append(createSubTwistySection(subTwistyId, label, (isSquad ? "agile-team-standalone" : ""), team._id));
			
			for ( var j = 0; j < team.child_team_id.length; j++) {
				var childTeam = allTeamsLookup[team.child_team_id[j]];
				var mainTwistyId = "main_" + $("#teamTree ul").length;
				
				if (_.isEmpty(childTeam))
					continue;

				if (childTeam.child_team_id != undefined && childTeam.child_team_id.length > 0) {
					$("#body"+subTwistyId).append(createMainTwistySection(mainTwistyId, ""));
				} else {
					mainTwistyId = "body"+subTwistyId;
				}				
				
				addTeamTwisty(childTeam, mainTwistyId);
			}
		} else {
			var label = team.name;
			var subTwistyId = "sub_" + $("#teamTree li").length;
			$("#"+twistyId).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
		}
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
	
	var span = document.createElement("span");
	span.setAttribute("class", "ibm-twisty-head");
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
	li.appendChild(div);

	return li;
}

/**
 * Sorts the indicated child teams by name and returns the sorted child team ids.
 * 
 * @param childTeamIds - array of child team ids.
 * @returns {Array} - sorted array of child team ids.
 */
function sortChildTeams(childTeamIds) {
	var childTeams = [];
	for ( var i = 0; i < childTeamIds.length; i++) {
		var team = allTeamsLookup[childTeamIds[i]];
		if (team != null)
			childTeams.push(team);
	}
	if (!_.isEmpty(childTeams)) {
		childTeams = _.sortBy(childTeams, function(team) {return team.name})
		childTeamIds = _.pluck(childTeams, "_id");
	}

	return childTeamIds;
}

function addTeamFilteredData(linkId, name, isSquad) {
	var rowId = "search_" + linkId;
	var row = "<tr id='" + rowId + "'><td>";
	row = row + "<a href='#' onclick=\"loadDetails('" + linkId + "',true);\"";
	row = row + (isSquad ? " title='Squad team' class='agile-team-squad'>" : ">") + name + "</a>";
	row = row + "</td></tr>";
	$("#teamTable tbody").append(row);
}

function sortFilteredDataTable() {
	var rows = $('#teamTable tbody  tr').get();

	rows.sort(function(a, b) {
		var A = $($(a).children("td")).children("a").eq(0).text().toUpperCase();
		var B = $($(b).children("td")).children("a").eq(0).text().toUpperCase();

		if (A < B) {
			return -1;
		} else if (A > B) {
			return 1;
		} else
			return 0;
	});

	$.each(rows, function(index, row) {
		$('#teamTable').children('tbody').append(row);
	});
}

function displaySelected(teamId, reload){
	defSelTeamId = teamId;
	if (reload == null) {
		if ($("#teamFilter").val("") != "") {
			$("#teamFilter").val("");
			$("#teamTable").hide();
			$("#teamTree").show();
			$(".agile-section-expand-collapse").show();
		}
		$("#allTeams").click();
	} else if (reload) {
		if ($("#teamFilter").val("") != "") {
			$("#teamFilter").val("");
			$("#teamTable").hide();
			$("#teamTree").show();
			$(".agile-section-expand-collapse").show();
		}
		loadDetails(teamId, true);
	} else
		loadDetails(teamId);
}

function removeHighlightParents(treeLinkId) {
	if (treeLinkId != null) 
		$($("#" +treeLinkId).children("a.agile-team-link")[0]).removeClass("agile-team-parent-selected");
	else	
		$("#teamTree a.agile-team-parent-selected").removeClass("agile-team-parent-selected");
}

function highlightParents(treeLinkId) {
	if (treeLinkId != null) {
		$("#" +treeLinkId).removeClass("agile-team-parent-selected");
		if (treeLinkId != "" && $("#" +treeLinkId+" a.agile-team-selected").length == 1) {
			$($("#" +treeLinkId).children("a.agile-team-link")[0]).addClass("agile-team-parent-selected");
		}
	} else {	
		var li = $("#teamTree a.agile-team-selected").parents("li");
		for (var i=1; i<=li.length; i++) {
			var element = li[i];
			$($(element).children("a.agile-team-link")[0]).addClass("agile-team-parent-selected");
		}
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

/**
 * Global variable holder for highligted team in the team hierarchy table.
 */
var selectedTeam = "";
/**
 * Retrieves the team related information to be shown in the page.
 * 
 * @param elementId - selected element id.
 */

function loadDetails(elementId, setScrollPosition) {
	if (selectedTeam == elementId || $("#"+elementId).html() == "Standalone teams") {
  	return;
  	
  } else if (selectedTeam != elementId) {
  	if (selectedTeam != "") {
  		$("#"+selectedTeam).removeClass("agile-team-selected");
  		$("#search_"+selectedTeam).removeClass("agile-team-selected");
  	}
	  selectedTeam = elementId;
	}
  
	$("#search_"+elementId).addClass("agile-team-selected");
	$("#"+elementId).addClass("agile-team-selected");

	var teamId = $("#"+elementId).siblings("span")[0].innerHTML;	
	var team = allTeamsLookup[teamId];
	var isSquadTeam = false;
	if (!_.isEmpty(team) && defSelTeamId != teamId) {
		$('#mainContent').hide();
		$('#spinnerContainer').show();

		if (team._id == teamId) {
			removeHighlightParents();
			// $.({message: ""});
			defSelTeamId = teamId;
			// make sure team data is always the latest data to show
			$.ajax({
				type : "GET",
				url : "/api/teams/" + encodeURIComponent(team["_id"])
			}).fail(function() {
				// $.un(); 
			
			}).done(function(currentTeam) {
				team = currentTeam;
				var lookupData = allTeamsLookup[currentTeam._id];
				// were using the compacted team view
				if (!_.has(lookupData, "._rev")) {
					lookupData.doc = currentTeam;
					allTeamsLookup[currentTeam._id] = lookupData;

				} else 				
					allTeamsLookup[currentTeam._id] = team;

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
						if (keyValue.toLowerCase() == "yes")
							isSquadTeam = true;

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

						if (!_.has(lookupData, "._rev"))
							lookupData["total_members"] = keyValue;
					}
					if (team["members"] != undefined) {
						keyLabel = "FTE";
						keyValue = teamMemFTE(team["members"]);
						appendRowDetail(keyLabel, keyValue);

						if (!_.has(lookupData, "._rev"))
							lookupData["total_allocation"] = keyValue;

					}
					if (team["parent_team_id"] != undefined) {
						keyLabel = "Parent Team Name";
						keyValue = "(No parent team information)";						
						
						
						if (team["parent_team_id"] != undefined && team["parent_team_id"] != "") {
							teamName = allTeamsLookup[team["parent_team_id"]]["name"];
							var parentLinkId = "";
							var found = false;
							
							for (var i=0; i< $("#teamTree a.agile-team-link").length; i++) {
							  parentLinkId = $("#teamTree a.agile-team-link")[i].id;
							  var teamId = $("#"+parentLinkId).siblings("span")[0].innerHTML;
							  
							  if (team["parent_team_id"] == teamId) {
							  	found = true;
							  	break;
							  }
							}
							
							if (found) {
								keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:displaySelected('" + parentLinkId + "', true);\">"+ teamName +"</a>"
								+"<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:displaySelected('" + parentLinkId + "', true);\"><span class='ibm-access'>Go to parent team</span></a></p>";
							} else {
								keyValue = "<p style=\"display:inline-block\" class=\"ibm-ind-link\"><a style=\"display:inline; padding-left: 0px;\" title=\"View parent team information\" alt=\"View parent team information\" id ='parentName' href='#' onclick=\"javascript:displaySelected('" + team["parent_team_id"] + "');\">"+ teamName +"</a>"
								+"<a title=\"View parent team information\" alt=\"View parent team information\" style=\"display:inline;top:-5px;left:5px;\" class=\"ibm-forward-link\" href='#' onclick=\"javascript:displaySelected('" + team["parent_team_id"] + "');\"><span class='ibm-access'>Go to parent team</span></a></p>";
							}
						}
						appendRowDetail(keyLabel, keyValue);
					}

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
						
						var currDate = getServerDateTime().split(" ")[0].replace(/-/g, "/");
						var dateArr = currDate.split("/");
						var tempDate = parseInt(dateArr[2]);
						var startDate = [];
						var endDate = [];
						if (tempDate == 1){
							currDate = dateArr[0]+"/"+dateArr[1]+"/"+"02";
						}
						var tempDate = new Date(currDate);
						
						var currMonth = tempDate.getUTCMonth()+1;
						var startMonth;
						var startYear = tempDate.getUTCFullYear();
						if (currMonth > 5)
							startMonth = currMonth - 5;
						else{
							startMonth = 13 - (6 - currMonth);
							startYear = tempDate.getUTCFullYear()-1;
						}
						var defStartYear = "01/01/"+tempDate.getUTCFullYear();
						var defEndYear = "12/31/"+startYear;
						var start = showDateMMDDYYYY(startYear+"/"+startMonth+"/"+"02");
						var end;
						if (startYear != tempDate.getUTCFullYear()){
							end  = defEndYear;
							startDate.push(defStartYear);
							endDate.push(showDateMMDDYYYY(currDate));
						}
						else{
							end = showDateMMDDYYYY(currDate);
						}
						
						//reset the squadList for selected parent team to refresh for new selected parent
						squadList = [];
						if (!_.isEmpty(team.child_team_id)){
							//this will get all squad teams of selected parent team and store in squadList (global variable)
							getSquadChildren(team["_id"]);
						}
						
						if (squadList.length > 0) {
							// this is a one time pull of all completed iterations with the current view design
							// TODO: need to design a view that pulls completed iterations by teams only.
							if (_.isEmpty(collectedIterations)) {
								getCompletedIterations(start, end, completedIterationsHandler, [team["_id"], team['name'], squadList]);
								
							} else
								parentIterationScoreCard(team["_id"], team['name'], squadList, collectedIterations);
						
						} else {
							iterationScoreCard(team["_id"], team['name'],[]);

						}

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
					
					
					if ($("#iterationSection h2 a").hasClass("ibm-show-active"))
						redrawCharts("iterationSection");
					if ($("#assessmentSection h2 a").hasClass("ibm-show-active"))
						redrawCharts("assessmentSection");
					if (!_.has(lookupData, "._rev")) 
						allTeamsLookup[currentTeam._id] = lookupData;
				}
			});
			openSelectedTeamTree(setScrollPosition);
		} 
	} else {
		openSelectedTeamTree(setScrollPosition);
	}
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

function getSquadChildren(id){
	if (allTeamsLookup != undefined) {
		var team = allTeamsLookup[id];
		if (team != null) {
			if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES") {
				squadList.push(team._id);
			} else {
				for (var x in team.child_team_id) {
					getSquadChildren(team.child_team_id[x]);
				}
			}
		}
	}
}
