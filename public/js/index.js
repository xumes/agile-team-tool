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
var squadlist = [];
var iterationList = [];
jQuery.expr[':'].Contains = function(a, i, m) {
	return jQuery(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

jQuery(function($) {
	$(document).ready(function() {

		$(document).ajaxStop($.unblockUI); 
		
		var urlParameters = getJsonParametersFromUrl();
		if (urlParameters != undefined && urlParameters.testUser != undefined) {
			alert("here TestUser is: " + urlParameters.testUser);
			resetUser(urlParameters.testUser);
		}

		initializeTable();
		getAllAgileTeams(agileTeamListHandler, [false]);
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
		if ($(this).hasClass("ibm-btn-pri ibm-btn-blue-50"))
				return;
		
		filter($(this).attr("id"));
		$($(this)).removeClass("ibm-btn-sec ibm-btn-gray-50");
		$($(this)).addClass("ibm-btn-pri ibm-btn-blue-50");

		$("#allTeams").removeClass("ibm-btn-pri ibm-btn-blue-50");
		$("#allTeams").addClass("ibm-btn-sec ibm-btn-gray-50");
	});
	
	$("#allTeams").click(function() {
		if ($(this).hasClass("ibm-btn-pri ibm-btn-blue-50"))
			return;

		filter($(this).attr("id"));
		$($(this)).removeClass("ibm-btn-sec ibm-btn-gray-50");
		$($(this)).addClass("ibm-btn-pri ibm-btn-blue-50");
		
		$("#myTeams").removeClass("ibm-btn-pri ibm-btn-blue-50");
		$("#myTeams").addClass("ibm-btn-sec ibm-btn-gray-50");
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
function agileTeamListHandler(show, teamList) {
	setGlobalTeamList(teamList);	
	allTeams = teamList;
	allTeamsLookup = getLookupListById(allTeams);
	if (show)
		organizeTeamHierarchy(allTeams);
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
	myTeams = sortAgileTeamsByName(userTeamList);
	if (show) 
		organizeTeamHierarchy(myTeams);
}

/**
 * Filters team hierarchy listing.
 * 
 * @param id - element id for either "My teams" or "All teams".
 */
function filter(id) {
	$.blockUI({message: ""});

	selectedTeam = "";
	
	if (id == "myTeams") {
		//TODO when backend works
		//getAllAgileTeamsForUser(JSON.parse(localStorage.getItem("userInfo")).email, userAgileTeamListHandler, [true, JSON.parse(localStorage.getItem("userInfo")).email]);
		//temporary 
		getAllAgileTeamsForUser("cjscotta@us.ibm.com", userAgileTeamListHandler, [true, "cjscotta@us.ibm.com"]);

	} else {
		getAllAgileTeams(agileTeamListHandler, [true]);

	}
}

/**
 * Variable holder for teams already shown in the team hierarchy table.
 */
var publishedTeam = [];
/**
 * Variable holder for top most parents to show in team hierarchy table.
 */
var firstParents = [];

var standAloneTeams = [];
/**
 * Recursive lookup for topmost parent team from the master team list, and if it already exist in a given team list.
 * 
 * @masterListLookup - master team list to traverse.
 * @teamListLookup - current team list to traverse.
 * @param id - current team id used to look for parent related information.
 * @returns - team object if topmost parent is found after cross checking the given lists.
 */
function getTopmostParentInList(masterListLookup, teamListLookup, id) {
	var topmostTeam = null;
	var team = masterListLookup[id];
	if (team != null) {
		var found = false;
		if (team.parent_team_id != undefined && team.parent_team_id != "") {
			topmostTeam = teamListLookup[team._id];
			var nextTopmostTeam = null;
			if (topmostTeam != null && topmostTeam.parent_team_id != undefined && topmostTeam.parent_team_id != "") {
				// need to validate the selected top team as we may need to go up further
				nextTopmostTeam = getTopmostParentInList(masterListLookup, teamListLookup, topmostTeam.parent_team_id);
				if (nextTopmostTeam != null)
					topmostTeam = nextTopmostTeam;
			}
				
			if (topmostTeam != null) { 
				found = true;
				showLog("nearest immediate top most team exist in the list [" +topmostTeam.name+ "/" +topmostTeam._id+ "]");
			}
		}
		
		if (!found && team.parent_team_id != undefined && team.parent_team_id != "") {
			topmostTeam = getTopmostParentInList(masterListLookup, teamListLookup, team.parent_team_id);
		
		} else if (team.parent_team_id != undefined && team.parent_team_id == "") {
			// working on the a top most team, check if it is already the current team list.
			if (teamListLookup[team._id] != null)
				topmostTeam = teamListLookup[team._id];
		}
	}

	return topmostTeam;
}

/**
 * Recursive lookup for topmost parent teams in a given team list.
 * 
 * @teamListLookup - current team list to traverse.
 * @param id - current team id used to look for parent related information.
 */
function getFirstParentInList(teamListLookup, id) {
	var parentTeam = null;
	var found = false;
	var team = teamListLookup[id];
	if (team != null) {
		if (team.parent_team_id != undefined && team.parent_team_id != "") {
			found = getFirstParentInList(teamListLookup, team.parent_team_id);
			if (!found) {
				parentTeam = team;
				// essentially not a top parent team but no parent info was found while traversing the current team list
				showLog("there is a top parent that is not found in the current team list for [" + team.name + "/" + team._id + "]");
				var topParent = getTopmostParentInList(allTeamsLookup, teamListLookup, team.parent_team_id);
				if (topParent != null)
					parentTeam = topParent;
			}
		} else {
			// there is no parent info related to the team
			parentTeam = team;
			found = true;
		}
	}
	
	// list it down if it is one of the top most parent of a team.
	if (parentTeam != undefined && firstParents.indexOf(parentTeam.name.toUpperCase()+parentTeam._rev) == -1) {
		// uppercase for sorting purposes
		firstParents.push(parentTeam.name.toUpperCase()+parentTeam._rev);
	}
 
	return found;
}

/**
 * Organizes the team hierarchy structure to display.
 * 
 * @param teamList - array of user teams that should be organized.
 */
function organizeTeamHierarchy(teamList) {
	var start = new Date().getTime();
	publishedTeam = [];
	firstParents = [];
	standAloneTeams = [];
	$("#teamTree").empty();
	$("#teamTable tbody").empty();
	$("#teamTable").hide();
	// start with highest parents (non squad teams with no parents).
	// we do this so hierarchy will be sorted by top most parents first.
	var teamListLookup =  getLookupListById(teamList);
	if (teamList != undefined && teamList.length > 0) {
		for ( var i = 0; i < teamList.length; i++) {
			var team = teamList[i];
			getFirstParentInList(teamListLookup, team._id);
		}
		// sort names alphabetically
		firstParents.sort();
		
		$("#teamTree").append(createMainTwistySection("teamTreeMain", ""));
		
		for ( var i = 0; i < firstParents.length; i++) {
			for ( var j = 0; j < allTeams.length; j++) {
				var team = allTeams[j];
				if ((team.name.toUpperCase()+team._rev) == firstParents[i]) {
					addTeamTwisty(team, "teamTreeMain");
					break;
				}
			}
		}
		
		if (standAloneTeams.length > 0) {
			var twistyId = "sub_" + $("#teamTree li").length;
			$("#teamTreeMain").append(createSubTwistySection(twistyId, "Standalone teams", ""));
			for (var i in standAloneTeams) {
				var team = allTeamsLookup[standAloneTeams[i]];
				var isSquad = false;
				if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES")
					isSquad = true;
								
				var label = team.name;
				var subTwistyId = "sub_" + $("#teamTree li").length;
				$("#body"+twistyId).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
			}
		}
		
		$("#teamTreeMain").twisty();
		
		// assign ids to manipulate elements easily
		defSelIndex = "";
		$("#teamTree a.agile-team-link").each(function(index) {
			var linkId = "link_"+index;
			$(this).attr("id", linkId);
			var teamId = $($(this)[0]).siblings("span")[0].innerHTML;
			if (defSelTeamId != null && defSelTeamId != "" && defSelTeamId == teamId)
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
	if (defSelIndex != "")
		loadDetails(defSelIndex);
	else if ($("#teamTree a.agile-team-link").length > 0)
		loadDetails($("#teamTree a.agile-team-link")[0].id);
	
	var filter = $("#teamFilter").val();
	if (filter.trim() != "") {
		$("#teamTable").show();
		$("#teamTable tbody tr td a:not(:Contains('" + filter + "'))").each(function(index, obj) {
			$($(obj).parent()).hide();
		});
	}
	
	var end = new Date().getTime();
	
	showLog("Organized teams duration: " + (end-start)/1000);
	// force and show scroll bar
	$(".nano").nanoScroller();
	
	$.unblockUI();
}

function addTeamTwisty(team, twistyId) {
	if (team != null && publishedTeam.indexOf(team._id) == -1 && standAloneTeams.indexOf(team._id)) {
		var isSquad = false;
		if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES")
			isSquad = true;

		// publishedTeam is a global variable to indicate that the team has been processed already.
		publishedTeam.push(team._id);

		// if there are any child teams indicated, process child teams.
		if (team.child_team_id != undefined && team.child_team_id.length > 0) {
			team.child_team_id = sortChildTeams(team.child_team_id);
			
			var label = team.name;
			var subTwistyId = "sub_" + $("#teamTree li").length;
			$("#"+twistyId).append(createSubTwistySection(subTwistyId, label, (isSquad ? "agile-team-standalone" : ""), team._id));
			
			for ( var j = 0; j < team.child_team_id.length; j++) {
				var childTeam = allTeamsLookup[team.child_team_id[j]];
				var mainTwistyId = "main_" + $("#teamTree ul").length;
				
				if (childTeam.child_team_id != undefined && childTeam.child_team_id.length > 0) {
					$("#body"+subTwistyId).append(createMainTwistySection(mainTwistyId, ""));
				} else {
					mainTwistyId = "body"+subTwistyId;
				}				
				
				addTeamTwisty(childTeam, mainTwistyId);
			}
		} else {
			if (twistyId == "teamTreeMain" && (team.parent_team_id == null || team.parent_team_id == "")) {
				publishedTeam.splice(publishedTeam.indexOf(team._id), 1);
				standAloneTeams.push(team._id);
//			} else if (twistyId == "teamTreeMain") {
//				var label = team.name;
//				var subTwistyId = "sub_" + $("#teamTree li").length;
//				$("#"+twistyId).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
			} else {
				//addTeamDetail(twistyId, team._id, team.name, isSquad);
				var label = team.name;
				var subTwistyId = "sub_" + $("#teamTree li").length;
				$("#"+twistyId).append(createSubTwistySection(subTwistyId, label, "agile-team-standalone" + (isSquad ? " agile-team-squad" : ""), team._id));
			}
		}
	}
}

function addTeamDetail(twistyId, teamId, name, isSquad) {
	var row = "<p><a href='#'";
	row = row + (isSquad ? " title='Squad team' class='agile-team-link agile-team-squad'>" : ">") + name + "</a>";//agile-team-squad
	// we're putting this span to hold the relevant team id
	row = row + "<span class='ibm-access'>"+teamId+"</span>";
	row = row + "</p>";
	$("#"+twistyId).append(row);
	
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
 * Add the child team(s) of the current team in the hierarchy.  This should list down
 * all downstream teams.  This is a recursive call to drill down through the team list.
 * 
 * @param level - indicates the level of drill down it has processed.
 * @param id - team id to drill down.
 */
function addTeamChildren(level, id) {
	// allTeams is a global variable holding all available teams.
	var team = allTeamsLookup[id]; 
	if (team != null && team._id == id && publishedTeam.indexOf(id) == -1) {
		var isSquad = false;
		if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES")
			isSquad = true;
		// publishedTeam is a global variable to indicate that the team has been processed already.
		publishedTeam.push(team._id);
		if (defSelTeamId != "" && defSelTeamId == team._id){
			defSelIndex = $("#teamTable tbody tr").length + 1;
		}
		addTeamInRow(level, id, team.name, isSquad);

		// if there are any child teams indicated, process to child teams.
		if (team.child_team_id != undefined && team.child_team_id.length > 0) {
			level = level + 1;
			team.child_team_id = sortChildTeams(team.child_team_id);
			for ( var j = 0; j < team.child_team_id.length; j++) {
				addTeamChildren(level, team.child_team_id[j]);
			}
		}
	}
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
	childTeams = childTeams.sort(function(a, b) {
		if (a.name.toUpperCase() == b.name.toUpperCase()) {
			return 0;
		} else {
			return (a.name.toUpperCase() > b.name.toUpperCase()) ? 1 : -1;
		}
	});
	childTeamIds = [];
	for ( var i = 0; i < childTeams.length; i++) {
		childTeamIds.push(childTeams[i]._id);
	}
	return childTeamIds;
}

function addTeamLevel(level, id, data) {
	var levelData = "<p><a onclick=\"loadDetails('" + id + "');\">" + data + "</a></p>";
	$("#teamTree").append(levelData);
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

/**
 * Initializes the table container for listing the team hierarchy.
 */
function initializeTable() {
	var row = "<tr><th>Agile Teams</th>";
	row = row + "</tr>";
	$("#teamTable thead").append(row);
}

/**
 * Appends the team name information in the table container listing the team hierarchy.
 *  
 * @param level - indicates the drill down level of the team. 1 being parent, 2 being child, 3 being grandchild and so on.
 * @param id - team id.
 * @param name - team name.
 * @param isSquad - if team is a squad.
 */
function addTeamInRow(level, id, name, isSquad) {
	var rowId = $("#teamTable tbody tr").length + 1;
	var row = "<tr id='" + rowId + "'><td>";
	var spacing = ((level - 1) * 14) + "px";
	row = row + "<a style='padding-left: "+spacing+";' href='#' onclick=\"loadDetails('" + rowId + "' ,'" + id + "');\"";
	row = row + (isSquad ? "title='Squad team'>" : ">") + name + "</a>";
	row = row + (isSquad ? "&nbsp;<span class='ibm-important'>*</span>" : "");
	row = row + "</td></tr>";
	$("#teamTable tbody").append(row);
}

/**
 * Iterate the global team list variable to search for specific information/column details.
 * 
 * @param id - team id.
 * @param detail - team information/column detail to retrieve.
 * @returns {String} - retrieved information/column value.	
 */
function getTeamInfo(id, detail) {
	var info = "";
	if (allTeamsLookup != undefined) {
		var team = allTeamsLookup[id];
		if (team != null) {
			if (detail == "name") {
				info = team.name;
			} else if (detail == "desc") {
				info = team.desc;
			}
		}
	}
	return info;
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
	if (team != null) {
		if (team._id == teamId) {
			removeHighlightParents();
			$.blockUI({message: ""});
			defSelTeamId = teamId;
			// make sure team data is always the latest data to show
			$.ajax({
				type : "GET",
				url : baseUrlDb + "/" + encodeURIComponent(team["_id"]),
				dataType : "jsonp",
				scriptCharset: 'UTF-8'
			}).done(function(currentTeam) {
				team = currentTeam;
				allTeamsLookup[currentTeam._id] = currentTeam;
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
						keyValue = "<a href='squads.jsp?id=" + encodeURIComponent(team["_id"]) + "' title='Manage team information'>" + tn + "</a>";
						appendRowDetail(keyLabel, keyValue);
					}
					if (team["squadteam"] != undefined) {
						keyLabel = "Squad Team?";
						keyValue = team["squadteam"];
						//appendRowDetail(keyLabel, keyValue);
						if (keyValue.toLowerCase() == "yes")
							isSquadTeam = true;

					}
					if (team["desc"] != undefined) {
						keyLabel = "Team Description";
						keyValue = team["desc"];
						appendRowDetail(keyLabel, keyValue);
					}

					/*if (team["child_team_id"] != undefined) {
						keyLabel = "Child team(s)";
						keyValue = "";
						if (team["child_team_id"].length > 0) {
							keyValue = keyValue + "<ul>";
							for ( var j = 0; j < team["child_team_id"].length; j++) {
								//keyValue = keyValue + "<li><a href=\"javascript:loadDetails('"+team["child_team_id"][j]+"');\">" + getTeamInfo(team["child_team_id"][j], "name") + "</a></li>";
								teamName = getTeamInfo(team["child_team_id"][j], "name");
								var x = 0;
								var rowId = 0;
								var found = false;
								$("#teamTable tbody tr a").each(function() {
									x++;
									var text = $(this).text();
									//console.log("text " + text);
									if (text.contains("*"))
										text = text.substring(0, text.length - 2);
									if (!found && text == teamName) {
										rowId = x;
										found = true;
									}
								});
								keyValue = keyValue + "<li><a href=\"javascript:loadDetails('" + rowId + "');\">" + teamName + "</a></li>";
							}
							keyValue = keyValue + "</ul>";
						} else {
							keyValue = "(No children team information)";
						}
						//appendRowDetail(keyLabel, keyValue);
					}*/
					
					if (team["members"] != undefined) {
						keyLabel = "Team Member Count";
						keyValue = team["members"].length;
						keyValue = teamMemCount(team["members"]);
						appendRowDetail(keyLabel, keyValue);
					}
					if (team["members"] != undefined) {
						keyLabel = "FTE";
						keyValue = teamMemFTE(team["members"]);
						appendRowDetail(keyLabel, keyValue);
					}
					if (team["parent_team_id"] != undefined) {
						keyLabel = "Parent Team Name";
						keyValue = "(No parent team information)";
						
						
						
						if (team["parent_team_id"] != undefined && team["parent_team_id"] != "") {
							teamName = getTeamInfo(team["parent_team_id"], "name");
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
						getTeamAssessments(team["_id"], teamAssessmentListHander, [team["_id"]]);
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
						/* This commented code is intended for rollup using cloudant query
						 * 
						var currDate = getServerDateTime().split(" ")[0].replace(/-/g, "/");
						var dateArr = currDate.split("/");
						var tempDate = parseInt(dateArr[2]);
						if (tempDate == 1){
							currDate = dateArr[0]+"/"+dateArr[1]+"/"+"02";
						}
						var tempDate = new Date(currDate);
						
						var currMonth = tempDate.getUTCMonth()+1;
						var startMonth;
						var startYear;
						if (currMonth > 5)
							startMonth = currMonth - 5;
						else{
							startMonth = 13 - (6 - currMonth);
							startYear = tempDate.getUTCFullYear()-1;
						}
						var startDate = showDateMMDDYYYY(startYear+"/"+startMonth+"/"+"02");
						var endDate = showDateMMDDYYYY(currDate);
						//reset the squadlist for selected parent team to refresh for new selected parent
						squadlist = [];
						var children = team.child_team_id;
						
						if (children.length > 0){
							//this will get all squad teams of selected parent team and store in squadlist (global variable)
							findChildren(team["_id"]);
						}
						
						if (squadlist.length > 0){
							retrieveIterations(squadlist, startDate, endDate, iterationScoreCard, [team["_id"], team['name']);
						}
						else{
							iterationEmptyScoreCard(team["_id"], team['name']);
						}
						 */
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
						
						//reset the squadlist for selected parent team to refresh for new selected parent
						squadlist = [];
						iterationList = [];
						var children = team.child_team_id;
						
						if (children.length > 0){
							//this will get all squad teams of selected parent team and store in squadlist (global variable)
							findChildren(team["_id"]);
						}
						
						if (squadlist.length > 0){
							getCompletedIterations(start, end, collectIterations, [team["_id"], team['name'], startDate, endDate, squadlist]);
						}
						else{
							//iterationEmptyScoreCard(team["_id"], team['name']);
							iterationScoreCard(team["_id"], team['name'],[]);
						}
						//$('#nsquad_team_scard p').html("Coming soon...");
						$('#nsquad_team_scard').show();
						$('#squad_team_scard').hide();
						$('#iterationSection .agile-section-nav').hide();
						$('#assessmentSection .agile-section-nav').hide();
						isSquadTeam = false;
						//this is done to hide the 2 other chart groups as 1st batch of rollup will only show velocity and throughput
						//$("#chartgrp2").hide();
						//$("#chartgrp3").hide();
						
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
				$.unblockUI();
			});
			
			openSelectedTeamTree(setScrollPosition);

		}
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

function findChildren(id){
	if (allTeamsLookup != undefined) {
		var team = allTeamsLookup[id];
		if (team != null) {
			if (team.squadteam != undefined && team.squadteam.toUpperCase() == "YES") {
				squadlist.push(team._id);
			} else {
				for (var x = 0; x < team.child_team_id.length; x++) {
					findChildren(team.child_team_id[x]);
				}
			}
		}
	}
}

function collectIterations(teamId, teamName, startDate, endDate, squadlist, iterations){
	if (iterations != null){
		for (var x= 0; x< iterations.length; x++){
			iterationList.push(iterations[x]);
		}
	}
	
	if (startDate.length > 0){
		var start = startDate[0];
		var end = endDate[0];
		startDate.shift();
		endDate.shift();
		getCompletedIterations(start, end, collectIterations,[teamId, teamName, startDate, endDate, squadlist]);
	}
	else{
		iterationParentScoreCard(teamId, teamName, squadlist, iterationList);
	}
}