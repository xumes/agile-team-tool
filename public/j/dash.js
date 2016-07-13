// ***************************
// *** Start Context Model ***
// ***************************
function Context(who) {
	this.who = who;
	this.setWhoContext = function(who) {
		this.who = who;
	}
	this.getWhoContext = function() {
		return this.who;
	}
}
// *** End Context Model ***


// ******************************
// *** Start Context Instance ***
// ******************************

var baseContext = new Context(null);
var previousContext = null;
var currentContext = new Context(null);

// *** End Context Instance ***


// ***************************
// *** Start AWF App Setup ***
// ***************************

var exps = [
	{
		text: "Portfolio",
		url: "/",
		name: "portfolio",
		extraclass: "left-nav-home",
		onstate: "on",
		prime_color: "pink"
	},
	{
		text: "People",
		url: "/",
		name: "people",
		prime_color: "#FF5003"
	}
];

var left_nav_comp = awf.createComponent("left-nav", exps);
awf.page.place(left_nav_comp, "navigation");

$('[data-name="portfolio"]').on("click", function() {
	initPortfolioExperience();
});

$('[data-name="people"]').on("click", function() {
	initPeopleExperience();
});

/*
// ************************************
// ***** tried to use side drawer *****
// ************************************

Object.defineProperty(window, 'w3n', {
    value: {},
    enumerable: true
});

// ** LEFT AND RIGHT DRAWER VISUAL CONTROLLERS, CREATE AND ADD TO HEADER **
awf.left_drawer_controller = awf.createComponent("sidedrawer-controller", {
	class_name: "leftone",
	side:"left",
	drawer_dom_id:"leftdrawer",
	icon_class:"icon-hamburger1"
});
awf.page.prepend(awf.left_drawer_controller, "header");

w3n.right_drawer_controller = awf.createComponent("sidedrawer-controller", {
	class_name: "rightone",
	side:"right",
	drawer_dom_id:"rightdrawer",
	icon_class:"icon-rightnavcontrol"
});
awf.page.append(w3n.right_drawer_controller, "header");

// ** CREATE and PLACE THE DRAWERS **
w3n.right_drawer = awf.createComponent("sidedrawer", {class_name: "rightone",side:"right", drawer_dom_id:"rightdrawer"});
w3n.right_drawer.place(w3n.mini_grid, "drawer-contents");
awf.page.place(w3n.right_drawer, "gutter");

var experience_left_nav = awf.createComponent("left-nav", exps);
w3n.left_drawer = awf.createComponent("sidedrawer", {class_name: "leftone",side:"left", drawer_dom_id:"leftdrawer"});
awf.page.place(w3n.left_drawer, "navigation");
w3n.left_drawer.place(experience_left_nav, "drawer-contents");

experience_collection.configureIntentListener(experience_left_nav);
*/

/*
// ****************************************
// ***** not using any of this either *****
// ****************************************

var dash_exp = awf.createModel("experience",{name:"portfolio",title:"Portfolio"});
var portfolio_experience = awf.createModel("experience", {
	name: "portfolio",
	title: "Portfolio",
	card_names: ['stock']
});

var grid_comp = awf.createComponent("grid", {
	base_width: 306,
	base_height: 354,
	margin: 20,
	cols: 3,
	ids: portfolio_experience.card_names
});

var item = grid_comp.items[0];
item.setColSpan(2);

var title_name = item.name;

var flipcard = awf.createComponent("flipcard"),
	medium_card = awf.createComponent("titled-card", {title: title_name}),
	large_card = $('<div style="color: #999; width: 100%; left: 0;" id="large_card_'+item.name+'"></div>');

flipcard
	.place(medium_card, "front")
	.place(large_card, "back")
	.setBackHeight(500)
	.setBackWidth(500)
	.name = item.name;

item.place(flipcard, "content");

var view = awf.createView(stock_model, "stock", "stock");
medium_card.place(view, "content");
awf.page.place(grid_comp, "content");

// *** End AWF App Setup ***
*/

// ****************************
// *** Start Temp Container ***
// ****************************
function initTempContainer() {
	var tempGridTable = $("<table/>").attr({"class": "temp-grid"});
	var tempGridRow1 = $("<tr/>");
	var tempGridRow2 = $("<tr/>");
	var tempCard1 = $("<td/>").attr({"class": "temp-card normal-wide", "rowspan": "2"});
	var tempCard2 = $("<td/>").attr({"class": "temp-card normal-wide"});
	var tempCard3 = $("<td/>").attr({"class": "temp-card normal-wide"});
	var tempCard4 = $("<td/>").attr({"class": "temp-card double-wide", "colspan": "2"});

	tempGridTable.append(tempGridRow1);
	tempGridRow1.append(tempCard1);
	addContainerToCard(tempCard1, "tempContainer1", "temp-card-container double-high");
	tempGridRow1.append(tempCard2);
	addContainerToCard(tempCard2, "tempContainer2", "temp-card-container normal-high");
	tempGridRow1.append(tempCard3);
	addContainerToCard(tempCard3, "tempContainer3", "temp-card-container normal-high");

	tempGridTable.append(tempGridRow2);
	tempGridRow2.append(tempCard4);
	addContainerToCard(tempCard4, "tempContainer4", "temp-card-container normal-high");

	// place temp container
	awf.page.place(tempGridTable, "content");
}

function addContainerToCard(card, containerId, containerClass) {
	var cardLayoutTable = $("<table/>").attr({"class": "temp-card-layout"});
	
	var cardHeaderRow = $("<tr/>");
	var cardHeader = $("<th/>").attr({"class": "temp-card-header", "id": containerId + "_head"});
	var cardContainerRow = $("<tr/>");
	var cardContainerCell = $("<td/>");
	var cardContainer = $("<div/>").attr({"class": containerClass, "id": containerId});
	
	cardLayoutTable.append(cardHeaderRow);
	cardHeaderRow.append(cardHeader);
	
	cardLayoutTable.append(cardContainerRow);
	cardContainerRow.append(cardContainerCell);
	cardContainerCell.append(cardContainer);
	
	card.append(cardLayoutTable);
}

// *** End Temp Container ***


// =========================================

// ******************************
// ***** Start People Model *****
// ******************************

var peopleCache = [];

function getPerson(personId) {
	var retPerson = null;
	
	if(personId != null && personId != "") {
		peopleCache.forEach(function(person) {
			if(person.email == personId) {
				retPerson = person;
			}
		})
	
	}
	
	return retPerson;
}

function loadPersonCallback(data) {
	$.each(data, function(i, result) {
		if(result.email == personId || personId == "tbd@us.ibm.com") {
			person = result;
		}
	})
}

// *** End People Model ***


// *****************************
// *** Start Scorecard Model ***
// *****************************

function loadScorecardData(teamId) {
	var scoreCard = null;

	// local
	var svcRoot = './data/';
	var svcAPI = 'scorecards/';
	var svcFunc = 'sc-' + teamId + '.json';
		
	var svcURL = svcRoot + svcAPI + svcFunc;
	$.ajax({
		'async': false,
		'global': false,
		'cache': false,
		'url': svcURL,
		'dataType': 'json',
		'success': function(data) {scoreCard = data;},
		'error': function(data, status, error) {scorecard = null;}  // not really needed
	});
	
	return scoreCard;
}
// *** End Scorecard Model ***


// ************************
// *** Start Team Model ***
// ************************

function loadMembers(team) {
	if(team != null) {
		// local
		var svcRoot = './data/';
		var svcAPI = 'teams/';
		var svcFunc = team.id + '.json';
		
		var svcURL = svcRoot + svcAPI + svcFunc;
		$.ajax({
			'async': false,
			'global': false,
			'cache': false,
			'url': svcURL,
			'dataType': 'json',
			'success': function(data) {team.members = data;}
		});
	}
	
	return team;
}

function getTeamMemberships(team, personId) {
	var memberships = [];
	
	$.each(team.members, function(i, memb) {
		if(memb.id == personId) {
			memb.teamId = team.id;
			memberships.push(memb);
		}
	})
	
	return memberships;
}

// *** End Team Model ***


// ****************************
// *** Start RTC Team Model ***
// ****************************

function loadRTCProjectTeam(teamKey) {
	return loadRTCTeam(teamKey);
}

function loadRTCTeam(teamKey) {
	var rtcTeam = null;
	
	if(teamKey != null) {
	/*
		//remote
		var svcProxy = './proxy.php?url=';
		var svcRoot = 'https://igartc02.swg.usma.ibm.com/';
		var svcAPI = 'jazz/oslc/teamareas/';
		var svcFunc = teamKey + '/rtc_cm:members.json';
		var svcURL = svcProxy + svcRoot + svcAPI + svcFunc;
	*/

		// local
		var svcRoot = './data/';
		var svcAPI = 'rtc/';
		var svcFunc = teamKey + '.json';
		var svcURL = svcRoot + svcAPI + svcFunc;
		
		$.ajax({
			'async': false,
			'global': false,
			'cache': false,
			'url': svcURL,
			'dataType': 'json',
			'success': function(data) {rtcTeam = data;}
		});
	}
	
	return rtcTeam;
}
// *** End RTC Team Model ***


// *****************************
// *** Start Portfolio Model ***
// *****************************

function loadPortfolio() {
	var portData = null;
	$.ajax({
		'async': false,
		'global': false,
		'cache': false,
		'url': './data/portfolio.json',
		'dataType': 'json',
		'success': function(data) {portData = data;}
	});
	
	return portData.portfolio;
}

function getTeam(teamID) {
	var returnObj = null;
	if(portfolio.id == teamID) {
		returnObj = portfolio;
	}

	var initiatives = portfolio.initiatives;
	$.each(initiatives, function(i, initiative) {
		if(initiative.id == teamID) {
			returnObj = initiative;
		}

		var products = initiative.products;
		$.each(products, function(j, product) {
			if(product.id == teamID) {
				returnObj = product;
			}

			var scrums = product.scrums;
			$.each(scrums, function(k, scrum) {
				if(scrum.id == teamID) {
					returnObj = scrum;
				}
			})
			if(returnObj != null && !("prodName" in returnObj)) {returnObj.prodName = product.name;}
		})
		if(returnObj != null && !("initName" in returnObj)) {returnObj.initName = initiative.name;}
	})
	if(returnObj != null && !("portName" in returnObj)) {returnObj.portName = portfolio.name;}
	
	return returnObj;	
}
// *** End Portfolio Model ***


// ****************************
// *** Start Model Instance ***
// ****************************

var portfolio = loadPortfolio();

// *** End Model Instance ***


// *******************************
// *** Start Utility Functions ***
// *******************************

function toProperCase(str) {
    return str.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}
// *** End Utility Functions ***


// ******************************
// *** Start Common Functions ***
// ******************************

function addFieldListTableColoredRow(tableBody, label, value, color) {
	var row = $("<tr/>");
	row.append($("<th/>").text(label));
	row.append($("<td style='color: " + color + ";'/>").text(value));
	tableBody.append(row);
}

function addFieldListTableRow(tableBody, label, value) {
	var row = $("<tr/>");
	row.append($("<th/>").text(label));
	row.append($("<td/>").text(value));
	tableBody.append(row);
}

function addFieldListTableSectionRow(tableBody, label) {
	var row = $("<tr/>").attr({"class": "field-list-section"});
	var cell = $("<td/>").attr({"colspan": "2"});
	cell.text(label);
	row.append(cell);
	tableBody.append(row);
}
// *** End Common Functions ***


// *********************************
// *** Start Portfolio Navigator ***
// *********************************

function initTeamsTable() {
	$("#tempContainer1_head").text("Portfolio Navigator");
	
	var container = $("#tempContainer1");
	container.empty();

	// table
	var table = $("<table/>").attr({"id": "teamTable", "class": "list-table"});

	var tableHead = $("<thead/>");
	var headerRow = $("<tr/>");
	headerRow.append($("<th style='width: 20px;' />").text("Pt"));
	headerRow.append($("<th style='width: 20px;' />").text("In"));
	headerRow.append($("<th style='width: 20px;' />").text("Pr"));
	headerRow.append($("<th/>").text("Scrum"));
	tableHead.append(headerRow);
	table.append(tableHead);

	var tableBody = $("<tbody/>").attr({"class": "list-table-clickable"});

	table.append(tableBody);
	container.append(table);

}

function loadTeamsTable() {
	var initiatives = portfolio.initiatives;
	var products = null;
	var scrums = null;

	var tableBody = $("#teamTable > tbody");

	// portfolio
	var row = $("<tr/>").attr({"id": portfolio.id, "class": "portfolio-name"});
	row.append($("<td colSpan=4 />").text(portfolio.name));
	tableBody.append(row);

	// initialize the context
	row.addClass('selected');

	// now build the rest of the team navigator
	$.each(initiatives, function(i, initiativeObj) {
		row = $("<tr/>").attr({"id": initiativeObj.id, "class": "initiative-name"});
		row.append($("<td/>"));
		row.append($("<td colSpan=3 />").text(initiativeObj.name));
		tableBody.append(row);
	
		products = initiativeObj.products;
		$.each(products, function(j, productObj) {
			row = $("<tr/>").attr({"id": productObj.id, "class": "product-name"});
			row.append($("<td/><td/>"));
			var secondaryProd = productObj.name;
			row.append($("<td colSpan=2 />").text(secondaryProd));
			tableBody.append(row);
		
			scrums = productObj.scrums;
			$.each(scrums, function(k, scrumObj) {
				row = $("<tr/>").attr({"id": scrumObj.id, "class": "scrum-name"});
				row.append($("<td/><td/><td/>"));
				var teamName = scrumObj.name;
				if("nickname" in scrumObj) {
					if(scrumObj.nickname != "") {
						teamName += " (" + scrumObj.nickname + ")";
					}
				}
				row.append($("<td/>").text(teamName));
				tableBody.append(row);
			})
		})
	})

	$("#teamTable tbody tr").on("click", function() {
		$(this).addClass('selected').siblings().removeClass('selected');
	
		// this is the place to set context
		//    the user has clicked on a team so their "who" context has changed  
		setContextToTeam($(this)[0].id);

		// push context change (TODO - replace with context pub)
		changeTeamInfoContext();
		new_changeScoreCardContext();
		loadTeamMembers($(this)[0].id);
	});
}

function setContextToTeam(teamID) {
	var teamObj = getTeam(teamID);
	
	if(teamObj.members == null) {
		loadMembers(teamObj);
	}

	if(teamObj.rtcMembers == null) {
		if("rtc_teamarea" in teamObj) {
			teamObj.rtcMembers = loadRTCTeam(teamObj.rtc_teamarea);
		} else if("rtc_projectarea" in teamObj) {
			teamObj.rtcMembers = loadRTCProjectTeam(teamObj.rtc_projectarea);
		}
	}

	currentContext.setWhoContext(teamObj);
}
// *** End Teams Table ***


// ***********************
// *** Start Team Info ***
// ***********************

function initTeamInfo() {
	$("#tempContainer2_head").text("Team Info");
	
	var container = $("#tempContainer2");
	container.empty();
	
	var banner = $("<section/>").attr({"id": "teamInfoBanner", "class": "team-info-banner"});
	container.append(banner);

	var tiTable = $("<table/>").attr({"id": "teamInfoTable", "class": "field-list-table"});
	var tiTableBody = $("<tbody/>");
	tiTable.append(tiTableBody);
	container.append(tiTable);
}

function changeTeamInfoContext() {
	var teamContext = currentContext.getWhoContext();
	
	var banner = $("#teamInfoBanner");
	banner.empty();
	banner.attr({"class": "team-info-banner " + teamContext.type + "-team"});
	banner.append($("<main/>").text(toProperCase(teamContext.type + " team")));

	var tableBody = $("#teamInfoTable > tbody");
	tableBody.empty();

	addFieldListTableRow(tableBody, "Name", teamContext.name);
	addFieldListTableRow(tableBody, "Id", teamContext.id);
	if(teamContext.type == "portfolio") {
		addFieldListTableRow(tableBody, "Initiatives", teamContext.initiatives.length);
		var productsCount = 0;
		var scrumsCount = 0;
		$.each(teamContext.initiatives, function(i, initiative) {
			productsCount += initiative.products.length;
			$.each(initiative.products, function(j, product) {
				scrumsCount += product.scrums.length;
			})
		})
		addFieldListTableRow(tableBody, "Products", productsCount);
		addFieldListTableRow(tableBody, "Scrums", scrumsCount);
		addFieldListTableRow(tableBody, "RTC Area", teamContext.rtc_projectarea);
	} else if(teamContext.type == "initiative") {
		addFieldListTableRow(tableBody, "Products", teamContext.products.length);
		var scrumsCount = 0;
		$.each(teamContext.products, function(i, product) {
			scrumsCount += product.scrums.length;
		})
		addFieldListTableRow(tableBody, "Scrums", scrumsCount);		
	} else if(teamContext.type == "product") {
		addFieldListTableRow(tableBody, "Scrums", teamContext.scrums.length);
		if("secondary" in teamContext) {
			addFieldListTableRow(tableBody, "Secondary", teamContext.secondary.toString());
		}
	} else if(teamContext.type == "scrum") {
		addFieldListTableRow(tableBody, "Status", teamContext.status);
		addFieldListTableRow(tableBody, "Nickname", teamContext.nickname);
	}
	
	if("rtc_teamarea" in teamContext) {
		addFieldListTableRow(tableBody, "RTC Area", teamContext.rtc_teamarea);
	}

	addFieldListTableRow(tableBody, "Members", teamContext.members.length);
}

// *** End Team Info ***


// *************************
// *** Start Team Scorecard ***
// *************************

function initTeamScoreCard() {
	$("#tempContainer3_head").text("Scorecard");

	var container = $("#tempContainer3");
	container.empty();
	
	container.append($("<div/>").attr({"id": "scorecardCanvas", "class": "scorecard-canvas"}));

	// older scorecard containers
	var scTable = $("<table/>").attr({"id": "scoreCardTable", "class": "field-list-table scorecard"});
	var scTableBody = $("<tbody/>");
	scTable.append(scTableBody);
	container.append(scTable);
	
	var scSection = $("<section/>").attr({"id": "teamScoreCard"});
	container.append(scSection);
}

function new_changeScoreCardContext() {
	$("#tempContainer3_head").text("Scorecard");

	var container = $("#tempContainer3");
	container.empty();
	
	container.append($("<div/>").attr({"id": "scorecardCanvas", "class": "scorecard-canvas"}));

	var canvas = $("#scorecardCanvas");
	canvas.empty();
	
	//temp
	$("#scoreCardTable > tbody").empty;
	$("#teamScoreCard").empty();

	// end temp

	var teamContext = currentContext.getWhoContext();
	var sc = loadScorecardData(teamContext.id);
	
	if(sc != null) {
		if(teamContext.type == "product") {
			if(sc.length == 1) {
				addScoreTile(canvas, "Deployment frequency", sc[0].devOps.deplymentFrequency, null, null);
				addScoreTile(canvas, "Change volume (lines of code)", sc[0].devOps.changeVolume, null, null);
				addScoreTile(canvas, "Lead time (weeks)", sc[0].devOps.leadTime, null, null);
				addScoreTile(canvas, "Failed deployment %", sc[0].devOps.failedDeploymentPercentage, null, null);
				addScoreTile(canvas, "User ticket volume", sc[0].devOps.customerTicketVolume, null, null);
				addScoreTile(canvas, "User volume", sc[0].devOps.userVolume, null, null);
				addScoreTile(canvas, "Availability (uptime %)", sc[0].devOps.availability, null, null);
				addScoreTile(canvas, "Mean time to recovery", sc[0].devOps.meanTimeToRecovery, null, null);
				addScoreTile(canvas, "Response time", sc[0].devOps.responseTime, null, null);		
			} else {
				addScoreTile(canvas, "Deployment frequency", sc[0].devOps.deplymentFrequency, sc[1].devOps.deplymentFrequency, "up");
				addScoreTile(canvas, "Change volume (lines of code)", sc[0].devOps.changeVolume, sc[1].devOps.changeVolume, "up");
				addScoreTile(canvas, "Lead time (weeks)", sc[0].devOps.leadTime, sc[1].devOps.leadTime, "down");
				addScoreTile(canvas, "Failed deployment %", sc[0].devOps.failedDeploymentPercentage, sc[1].devOps.failedDeploymentPercentage, "down");
				addScoreTile(canvas, "User ticket volume", sc[0].devOps.customerTicketVolume, sc[1].devOps.customerTicketVolume, "down");
				addScoreTile(canvas, "User volume", sc[0].devOps.userVolume, sc[1].devOps.userVolume, "up");
				addScoreTile(canvas, "Availability (uptime %)", sc[0].devOps.availability, sc[1].devOps.availability, "up");
				addScoreTile(canvas, "Mean time to recovery", sc[0].devOps.meanTimeToRecovery, sc[1].devOps.meanTimeToRecovery, "down");
				addScoreTile(canvas, "Response time", sc[0].devOps.responseTime, sc[1].devOps.responseTime, "down");		
			}
		} else if(teamContext.type == "scrum") {
			if(sc.length == 1) {
				addScoreTile(canvas, "Team change", sc[0].agile.teamChange, null, "no");
				addScoreTile(canvas, "2 pizza rule (members < 10)", twoPizzaRule(teamContext), null, "pass");
				addScoreTile(canvas, "Completed sprints", sc[0].agile.completedSprints, null, null);
				addScoreTile(canvas, "Velocity (story points)", sc[0].agile.velocity, null, null);
				addScoreTile(canvas, "Completed story points", sc[0].agile.completedStoryPoints, null, null);
				addScoreTile(canvas, "Backlog (story points)", sc[0].agile.backlogStoryPoints, null, null);
				addScoreTile(canvas, "Retrospective action items", sc[0].agile.openRetrospectiveItems, null, null);
				addScoreTile(
					canvas, 
					"Iterations remaining", 
					getRemainingIterations(sc[0].agile.backlogStoryPoints, sc[0].agile.velocity), 
					null, 
					null
				);
			} else {
				addScoreTile(canvas, "Team change", sc[0].agile.teamChange, sc[1].agile.teamChange, "no");
				addScoreTile(canvas, "2 pizza rule (members < 10)", twoPizzaRule(teamContext), null, "pass");
				addScoreTile(canvas, "Completed sprints", sc[0].agile.completedSprints, sc[1].agile.completedSprints, "up");
				addScoreTile(canvas, "Velocity (story points)", sc[0].agile.velocity, sc[1].agile.velocity, "up");
				addScoreTile(canvas, "Completed story points", sc[0].agile.completedStoryPoints, sc[1].agile.completedStoryPoints, "up");
				addScoreTile(canvas, "Backlog (story points)", sc[0].agile.backlogStoryPoints, sc[1].agile.backlogStoryPoints, "down");
				addScoreTile(canvas, "Retrospective action items", sc[0].agile.openRetrospectiveItems, sc[1].agile.openRetrospectiveItems, null);
				addScoreTile(
					canvas, 
					"Iterations remaining", 
					getRemainingIterations(sc[0].agile.backlogStoryPoints, sc[0].agile.velocity), 
					getRemainingIterations(sc[1].agile.backlogStoryPoints, sc[1].agile.velocity), 
					"down"
				);
			}
		} else {
			changeScoreCardContext();
		}
	} else {
			changeScoreCardContext();	// temp
	}
}

function addScoreTile(canvas, metricLabel, scoreThis, scoreLast, direction) {
	var tile = $("<section/>");
	tile.addClass("scorecard-tile");
	tile.append($("<header/>").text(metricLabel));

	var main = $("<main/>");
	main.append($("<p/>").text("This sprint: " + scoreThis));
	if(scoreLast != null) {
		main.append($("<p/>").text("Last sprint: " + scoreLast));
	}

	if(direction == "pass" || direction == "fail" || direction == "yes" || direction == "no") {
		// set background
		if(direction == scoreThis) {
			tile.addClass("green-50");
		} else {
			tile.addClass("orange-50");
		}
		
		// set icon background
		if(scoreThis == "pass") {
			tile.addClass("pass-icon");
		} else if(scoreThis == "fail") {
			tile.addClass("fail-icon");
		} else if(direction != scoreThis) {
			tile.addClass("info-icon");
		}
	} else if(scoreLast != null) {
		// set background
		var compResult = getComparisonResult(scoreThis, scoreLast, direction);
		if(compResult == "neg") {
			tile.addClass("orange-50");
		} else {
			tile.addClass("green-50");
		}
		
		// set trending icon background
		if(scoreThis > scoreLast) {
			tile.addClass("trending-up-icon");
		} else if(scoreThis < scoreLast) {
			tile.addClass("trending-down-icon");
		} else {
			tile.addClass("trending-flat-icon");
		}
	} else {
		tile.addClass("green-50");
	}
	
	tile.append(main);

	canvas.append(tile);
}

function getComparisonResult(scoreThis, scoreLast, direction) {
	var result = "pos";

	if(scoreThis == scoreLast) {
		result = "flat";
	} else if(direction == "up") {
		if(scoreThis < scoreLast) {
			result = "neg";
		}
	} else {
		if(scoreThis > scoreLast) {
			result = "neg";
		}
	}
	
	return result;
}

function changeScoreCardContext() {
	$("#tempContainer3_head").text("Scorecard");

	var container = $("#tempContainer3");
	container.empty();
	
	// older scorecard containers
	var scTable = $("<table/>").attr({"id": "scoreCardTable", "class": "field-list-table scorecard"});
	var scTableBody = $("<tbody/>");
	scTable.append(scTableBody);
	container.append(scTable);
	
	var scSection = $("<section/>").attr({"id": "teamScoreCard"});
	container.append(scSection);

	var tableBody = $("#scoreCardTable > tbody");
	tableBody.empty();

	var teamContext = currentContext.getWhoContext();
	
	if(teamContext.type == "portfolio") {
		addFieldListTableSectionRow(tableBody, "Agile");
		addFieldListTableRow(tableBody, "Initiatives", teamContext.initiatives.length);
		var productsCount = 0;
		var scrumsCount = 0;
		$.each(teamContext.initiatives, function(i, initiative) {
			productsCount += initiative.products.length;
			$.each(initiative.products, function(j, product) {
				scrumsCount += product.scrums.length;
			})
		})
		addFieldListTableRow(tableBody, "Products", productsCount);
		addFieldListTableRow(tableBody, "Scrum Teams", scrumsCount);
	} else if(teamContext.type == "scrum") {
		addFieldListTableSectionRow(tableBody, "Agile");
		addFieldListTableRow(tableBody, "Team members", teamContext.members.length)
		var pizzaRule = twoPizzaRule(teamContext);
		var resultColor = "Green";
		if (pizzaRule == "Fail") {resultColor = "Red";}
		addFieldListTableColoredRow(tableBody, "2 pizza rule (< 10)", pizzaRule, resultColor);
	}

	var sc = loadScorecardData(teamContext.id);

	var scSection = $("#teamScoreCard");
	scSection.empty();

	if(sc != null) {
		if(teamContext.type == "initiative") {
			appendMetricHeader(scSection, "Agile Assessment (scale 0 - 4)");
			$.each(sc[0].agile.maturityAssessment, function(i, assessed) {
				var baseCardClass = "mini-metric-row";
				var cardClass = baseCardClass + " d" + assessed.currentScore;
	
				appendMetricRow(scSection, assessed.practice, assessed.currentScore, cardClass);
			})
		} else if(teamContext.type == "scrum") {
			addFieldListTableRow(tableBody, "Current velocity", sc[0].agile.velocity);
			addFieldListTableRow(tableBody, "Completed sprints", sc[0].agile.completedSprints);
			addFieldListTableRow(tableBody, "Completed story points", sc[0].agile.completedStoryPoints);
			addFieldListTableRow(tableBody, "Backlog story points", sc[0].agile.backlogStoryPoints);
			addFieldListTableRow(tableBody, "Open retrospective items", sc[0].agile.openRetrospectiveItems);
		}
	}
}

function twoPizzaRule(team) {
	if(team.members.length < 10) {
		return "pass";
	} else {
		return "fail";
	}
}

function getRemainingIterations(remainingPoints, velocity) {
	var remainingIterations = "-";
	if(velocity != null && velocity != 0) {
		var calc = remainingPoints / velocity;
		if($.isNumeric(calc)) {
			remainingIterations = Math.round(calc);
		}
	}
	
	return remainingIterations;
}

function appendMetricRow(parentElement, metricLabel, score, rowClass) {
	var metricCard = $("<section/>").attr({"class": rowClass});
	var metricMain = $("<main/>");
	metricMain.append($("<div class='metric-label' />").text(metricLabel));
	metricMain.append($("<div class='metric-value' />").text(score));
	metricCard.append(metricMain);
	parentElement.append(metricCard);
}

function appendMetricHeader(parentElement, headerLabel) {
	var header = $("<header/>").attr({"class": "metric-header"});
	header.text(headerLabel);
	parentElement.append(header);
}


// *** End Team Badges ***


// ***************************
// *** Start Members Table ***
// ***************************

function initTeamMembers() {
	$("#tempContainer4_head").text("Team Members");

	var container = $("#tempContainer4");
	container.empty();

	var membTable = $("<table/>").attr({"id": "membersTable", "class": "list-table"});

	var membTableHead = $("<thead/>");
	var membHeaderRow = $("<tr/>");
	membHeaderRow.append($("<th style='width: 150px;' />").text("Name"));
	membHeaderRow.append($("<th style='width: 35px;' />").text("Alloc"));
	membHeaderRow.append($("<th style='width: 35px;' />").text("RTC"));
	membHeaderRow.append($("<th style='width: 150px;' />").text("Location"));
	membHeaderRow.append($("<th/>").text("Role"));
	membTableHead.append(membHeaderRow);
	membTable.append(membTableHead);

	var membTableBody = $("<tbody/>");
	membTable.append(membTableBody);
	container.append(membTable);
}

function loadTeamMembers(teamID) {
	var memTableBody = $("#membersTable tbody");
	memTableBody.empty();

	var teamObj = getTeam(teamID);

	$.each(teamObj.members, function(i, member) {
		var person = getPerson(member.id);
		
		// build and append member row
		var row = $("<tr/>").attr({"id": member['id'], "style": "color: DarkSlateGray;"});
		row.append($("<td/>").text(member['name']));
		row.append($("<td/>").text(member['allocation']));
		row.append($("<td/>").text(memberInRTCTeam(teamObj, member.id)));
		var locCell = $("<td/>").attr({"id": "loc" + member['id']});
		row.append(locCell);
		var membRole = member.role;
		if(teamObj.type == "scrum") {
			membRole = member.scrumRole + " - " + member.role;
		}
		row.append($("<td/>").text(membRole));
		memTableBody.append(row);
		
		// update location
		if(person != null) {
			locCell.text(person.location);
		} else {
			getPersonLocFromFaces(member.id, locCell);
		}
	})
}

function memberInRTCTeam(teamObj, memberid) {
	var returnFlag = "?";
	if("rtcMembers" in teamObj && teamObj.rtcMembers != null) {
		returnFlag = "N";
		$.each(teamObj.rtcMembers, function(i, member) {
			if(memberid == member['rtc_cm:userId']) {
				returnFlag = "Y";
			}
		})
	}
	
	return returnFlag;
}

function getPersonLocFromFaces(personId, cell) {
	cell.attr({"class": "loading-bar"});

	var svcRoot = 'http://faces.tap.ibm.com/api/';
	var svcFunc = 'find/?format=faces&limit=6&q=' + escape(personId);	// limit below 6 adds report to chain info
	var svcURL = svcRoot + svcFunc;
	$.ajax({
		'global': false,
		'cache': false,
		'url': svcURL,
		'timeout': 5000,
		'dataType': 'jsonp',
		'jsonp': 'callback',
		'success': function(data) {
			cell.attr({"class": ""});

			var person = null;

			$.each(data.persons, function(i, result) {
				var facesPerson = result.person;
				if(facesPerson.email == personId || personId == "tbd@us.ibm.com") {
					person = facesPerson;
				}
			})

			if(person != null) {
				peopleCache.push(person);
				cell.text(person.location);
			}
		},
		'error': function(data, status, error) {
			cell.attr({"class": ""});
			cell.text("-unavailable-");
		} 
	});
}
// *** End Members Table ***


// ******************************
// ***** Start People Table *****
// ******************************

function initPeopleTable() {
	$("#tempContainer1_head").text("People");
	
	var container = $("#tempContainer1");
	container.empty();

	// table
	var table = $("<table/>").attr({"id": "peopleTable", "class": "list-table"});

	var tableHead = $("<thead/>");
	var headerRow = $("<tr/>");
	//headerRow.append($("<th style='width: 25px;' />").text("Pr"));
	headerRow.append($("<th/>").text("Name"));
	tableHead.append(headerRow);
	table.append(tableHead);

	var tableBody = $("<tbody/>").attr({"class": "list-table-clickable"});
	table.append(tableBody);
	container.append(table);
}

function loadPeopleTable() {
	var initiatives = portfolio.initiatives;
	var products = null;
	var scrums = null;

	var tableBody = $("#peopleTable > tbody");

	// portfolio
	insertTeamMembers(tableBody, portfolio);
	
	// now build the rest of the team navigator
	$.each(initiatives, function(i, initiativeObj) {
		insertTeamMembers(tableBody, initiativeObj);
	
		products = initiativeObj.products;
		$.each(products, function(j, productObj) {
			insertTeamMembers(tableBody, productObj);
		
			scrums = productObj.scrums;
			$.each(scrums, function(k, scrumObj) {
				insertTeamMembers(tableBody, scrumObj);
			})
		})
	})

	$("#peopleTable tbody tr").on("click", function() {
		$(this).addClass('selected').siblings().removeClass('selected');
	
		// this is the place to set context
		//    the user has clicked on a team so their "who" context has changed  
		setContextToPerson($(this)[0].id);

		// push context change (TODO - replace with context pub)
		changePersonInfoContext();
		changePersonScoreCardContext();
		changeTeamMembershipContext();
	});
}

function insertTeamMembers(tableBody, team) {

	if(team.members == null) {
		loadMembers(team);
	}

	$.each(team.members, function(i, member) {
		var selected = $("[id='" + member.id + "']");
		if(selected.length == 0) {
			var row = $("<tr/>").attr({"id": member.id, "style": "color: DarkBlue;"});
			row.append($("<td/>").text(member.name));
			
			var inserted = false;
			var peopleRows = tableBody.children('tr');
			$.each(peopleRows, function(j, personRow) {
				var person = $("[id='" + personRow.id + "'] > td").text();
				if(!inserted && person > member.name) {
					row.insertBefore(personRow);
					inserted = true;
				}
			});
			
			if(!inserted) {
				tableBody.append(row);
				inserted = true;
			}
			
			// Select the first row added
			if(peopleRows.length == 0) {
				row.addClass('selected');
			}
		}
	})
}

function setContextToPerson(personId) {
	var personObj = {"id": personId};

	currentContext.setWhoContext(personObj);
}
// *** End People Table ***


// *****************************
// ***** Start Person Info *****
// *****************************

function initPersonInfo() {
	$("#tempContainer2_head").text("Person Info");
	
	var container = $("#tempContainer2");
	container.empty();
	
	var personCard = $("<section/>").attr({"id": "personCard", "class": "person-card"});
	var header = $("<header/>").attr({"id": "personCardHeader"});
	personCard.append(header);
	
	var main = $("<main/>").attr({"id": "personCardMain"});
	personCard.append(main);
	
	container.append(personCard);
}

function changePersonInfoContext() {
	var personContext = currentContext.getWhoContext();
	var person = getPerson(personContext.id);

	var header = $("#personCardHeader");
	header.empty();
	var main = $("#personCardMain");
	main.empty();

	if(person == null) {
		getPersonInfoFromFaces(personContext.id);
	} else {
		updatePersonInfoTable(person);
	}
}

function updatePersonInfoTable(person) {
	var header = $("#personCardHeader");
	var main = $("#personCardMain");

	var photoCell = $("<div/>").attr({"class": "person-photo-cell"});
	var photoFrame = $("<div/>").attr({"class": "person-photo-frame"});
	var photoImg = $("<img/>");
	photoFrame.append(photoImg);
	photoCell.append(photoFrame);
	header.append(photoCell);
	
	var nameCell = $("<div/>").attr({"class": "person-name-title-cell"});
	header.append(nameCell);

	if(person != null) {
		photoImg.attr({
			"src": "http://images.tap.ibm.com:10002/image/" + person.email + ".jpg?s=115", 
			"alt": person.name + " photo"
		});
		
		var nameLink = $("<a/>").attr({
			"href": "http://faces.tap.ibm.com/bluepages/profile.html?email=" + person.email, 
			"target": "_blank"
		});
		nameLink.text(person.name);
		nameCell.append($("<h1/>").append(nameLink));
		nameCell.append($("<h2/>").text(person.bio));
		
		main.append($("<div/>").text(person['org-title']));
		main.append($("<div style='margin-bottom: 15px;'/>").text(person.location));
		if("office-phone" in person) {
			main.append($("<div/>").text(person['office-phone'] + " (Office)"));
		}
		if("mobile-phone" in person) {
			main.append($("<div/>").text(person['mobile-phone'] + " (Mobile)"));
		}
		var emailLink = $("<a/>").attr({"href": "mailto:" + person.email});
		emailLink.text(person.email);
		main.append($("<div/>").append(emailLink));
		main.append($("<div/>").text(person['notes-id']));
	} else {
		main.append($("<div/>").text("unable to retrieve user from faces"));
	}
}

function getPersonInfoFromFaces(personId) {
	var container = $("#tempContainer2");
	var startClass = container[0].className;
	container.attr({"class": startClass + " loading"});

	var svcRoot = 'http://faces.tap.ibm.com/api/';
	var svcFunc = 'find/?format=faces&limit=6&q=' + escape(personId);	// limit below 6 adds report to chain info
	var svcURL = svcRoot + svcFunc;

	$.ajax({
		'global': false,
		'cache': false,
		'url': svcURL,
		'timeout': 5000,
		'dataType': 'jsonp',
		'jsonp': 'callback',
		'success': function(data) {
			container.attr({"class": startClass});

			var person = null;

			$.each(data.persons, function(i, result) {
				var facesPerson = result.person;
				if(facesPerson.email == personId || personId == "tbd@us.ibm.com") {
					person = facesPerson;
				}
			})

			if(person != null) {
				peopleCache.push(person);
				updatePersonInfoTable(person);
			}
		},
		'error': function(data, status, error) {
			container.attr({"class": startClass});
			var banner = $("#personInfoBanner");
			banner.attr({"style": "background-image: url(./images/person_icon.png);"});
			banner.append($("<main/>").text("Error loading person info"));
		} 
	});
}



// *** End Person Info ***


// **********************************
// ***** Start Person Scorecard *****
// **********************************

function initPersonScoreCard() {
	$("#tempContainer3_head").text("Scorecard");
	
	var container = $("#tempContainer3");
	container.empty();
	
	// the following was moved from the Team Membership card - processing logic is still there
	var banner = $("<section/>").attr({"id": "badgeSection", "class": "badge-canvas"});
	container.append(banner);
}

function changePersonScoreCardContext() {
	var banner = $("#badgeSection");
	banner.empty();
	
	var badgeHeading = $("<header/>").text("Badges");
	banner.append(badgeHeading);

	var personContext = currentContext.getWhoContext();
	getPersonBadges(personContext.id);
}

function getPersonBadges(personId) {
	var container = $("#tempContainer3");
	var startClass = container[0].className;
	container.attr({"class": startClass + " loading"});

	var svcRoot = './data/badges/';
	var svcFunc = 'assertions_' + personId + '.json';
	var svcURL = svcRoot + svcFunc;

	$.ajax({
		'global': false,
		'cache': false,
		'url': svcURL,
		'timeout': 5000,
		'dataType': 'json',
		'jsonp': 'callback',
		'success': function(data) {
			container.attr({"class": startClass});
			
			var main = $("#badgeSection").append("<main/>");
			
			if(data.length == 0) {
				main.text("Found " + data.length + " badges");
			} else {
				$.each(data, function(i, assertion) {
					var badgeFig = $("<figure/>").attr({"id": assertion.uid, "class": "badge-display"});
					badgeFig.append($("<img/>").attr({"src": "." + assertion.image}));
					badgeFig.append($("<figcaption/>"));
					main.append(badgeFig);
					
					getBadgeInfo(assertion);
				})
			}
		},
		'error': function(data, status, error) {
			container.attr({"class": startClass});
			var banner = $("#badgeSection");
			if(error == "Not Found") {
				banner.append($("<main/>").text("No badges found for this person"));
			} else {
				banner.append($("<main/>").text("Unknown error loading badge info"));
			}
		} 
	});
}

function getBadgeInfo(assertion) {
	$.ajax({
		'global': false,
		'cache': false,
		'url': '.' + assertion.badge,
		'timeout': 5000,
		'dataType': 'json',
		'jsonp': 'callback',
		'success': function(data) {
			var caption = $("#" + assertion.uid + " figcaption");
			caption.text(data.name);
		},
		'error': function(data, status, error) {
		} 
	});
}

// *** End Person Scorecard ***


// *********************************
// ***** Start Team Membership *****
// *********************************

function initPersonTeams() {
	$("#tempContainer4_head").text("Team Membership");
	
	var container = $("#tempContainer4");
	container.empty();

	var banner = $("<section/>").attr({"id": "membershipBanner", "class": "mini-metric-banner"});
	container.append(banner);

	// team membership table
	var table = $("<table/>").attr({"id": "membershipTable", "class": "list-table"});
	var tableHead = $("<thead/>");
	var headerRow = $("<tr/>");
	headerRow.append($("<th style='width: 20px;' />").text("Pt"));
	headerRow.append($("<th style='width: 20px;' />").text("In"));
	headerRow.append($("<th style='width: 20px;' />").text("Pr"));
	headerRow.append($("<th style='width: 150px;' />").text("Scrum"));
	headerRow.append($("<th style='width: 35px;' />").text("Alloc"));
	headerRow.append($("<th/>").text("Role"));
	tableHead.append(headerRow);
	table.append(tableHead);
	var tableBody = $("<tbody/>");
	table.append(tableBody);
	container.append(table);
}

function changeTeamMembershipContext() {
	var banner = $("#membershipBanner");
	banner.empty();

	var tableBody = $("#membershipTable > tbody");
	tableBody.empty();

	var personContext = currentContext.getWhoContext();
	var memberships = [];

	// traverse portfolio teams and build array
	memberships.push.apply(memberships, getTeamMemberships(portfolio, personContext.id));
	var initiatives = portfolio.initiatives;
	$.each(initiatives, function(i, initiative) {
		memberships.push.apply(memberships, getTeamMemberships(initiative, personContext.id));
	
		var products = initiative.products;
		$.each(products, function(j, product) {
			memberships.push.apply(memberships, getTeamMemberships(product, personContext.id));
		
			var scrums = product.scrums;
			$.each(scrums, function(k, scrum) {
				memberships.push.apply(memberships, getTeamMemberships(scrum, personContext.id));
			})
		})
	})
	
	// ***** Metrics Cards *****
	var baseCardClass = "mini-metric-tag";
	var problemClass = " problem";
	var warningClass = " warning";
	var cardClass = "";
	
	// Metric Card - Team Memberships
	if(memberships.length > 3) {
		cardClass = baseCardClass + problemClass;
	} else if(memberships.length == 3) {
		cardClass = baseCardClass + warningClass;
	} else {
		cardClass = baseCardClass;
	}
	appendMetricCard(banner, "Team Memberships", memberships.length, cardClass);
		
	// Metric Card - Total Allocation
	var allocationTotal = 0;
	
	$.each(memberships, function(i, member) {
		// increment total allocation
		allocationTotal += +member.allocation;
	})

	if(allocationTotal > 100) {
		cardClass = baseCardClass + problemClass;
	} else if(allocationTotal < 50) {
		cardClass = baseCardClass + warningClass;
	} else {
		cardClass = baseCardClass;
	}
	appendMetricCard(banner, "Total Allocation", allocationTotal + "%", cardClass);
	
	// Metric Card - Karma
//	cardClass = baseCardClass;
//	appendMetricCard(banner, "Karma", "TBD", cardClass);
	
	// ***** Metrics Cards *****
	var lastPort = "";
	var lastInit = "";
	var lastProd = "";

	$.each(memberships, function(i, member) {
		// build membership table
		var team = getTeam(member.teamId);

		// team
		var portRow = $("<tr/>");
		var initRow = $("<tr/>");
		var prodRow = $("<tr/>");
		var scrumRow = $("<tr/>");
		var teamRow = null;
		var teamSpan = 0;
		
		
		portRow.append($("<td colspan='4' class='portfolio-name' />").text(team.portName));
		if(team.type == "portfolio") {
			teamRow = portRow;
			lastPort = team.portName;
		} else {
			if(team.portName != lastPort) {
				portRow.append($("<td colspan='2' />"));
				tableBody.append(portRow);
				lastPort = team.portName;
			}
			
			initRow.append($("<td/>"));
			initRow.append($("<td colspan='3' class='initiative-name' />").text(team.initName));
			if(team.type == "initiative") {
				teamRow = initRow;
				lastInit = team.initName;
			} else {
				if(team.initName != lastInit) {
					initRow.append($("<td colspan='2' />"));
					tableBody.append(initRow);
					lastInit = team.initName;
				}

				prodRow.append($("<td colspan='2' />"));
				prodRow.append($("<td colspan='2' class='product-name' />").text(team.prodName));
				if(team.type == "product") {
					teamRow = prodRow;
					lastProd = team.prodName;
				} else {
					if(team.prodName != lastProd) {
						prodRow.append($("<td colspan='2' />"));
						tableBody.append(prodRow);
						lastProd = team.prodName;
					}

					scrumRow.append($("<td colspan='3' />"));
					scrumRow.append($("<td/ class='scrum-name'>").text(team.name));
					teamRow = scrumRow;
				}
				lastProd = team.prodName;
			}
		}
		
		teamRow.append($("<td/>").text(member.allocation));
		var membRole = member.role;
		if(team.type == "scrum") {
			membRole = member.scrumRole + " - " + member.role;
		}
		teamRow.append($("<td/>").text(membRole));
		teamRow.attr({"class": "highlight-blue"})
		tableBody.append(teamRow);
	})
}

function appendMetricCard(parentElement, metricLabel, score, cardClass) {
	var metricCard = $("<section/>").attr({"class": cardClass});
	var metricMain = $("<main/>");
	metricMain.append($("<div class='metric-label'/>").text(metricLabel));
	metricMain.append($("<div class='metric-value'/>").text(score));
	metricCard.append(metricMain);
	parentElement.append(metricCard);
}

// *** End Team Membership ***


// =========== Experiences ============


// ******************************
// ***** Project Experience *****
// ******************************

function initPortfolioExperience() {
	// init
	initTeamsTable();
	initTeamInfo();
	initTeamScoreCard();
	initTeamMembers();

	// set initial context
	setContextToTeam(portfolio.id);
	
	// load cards
	loadTeamsTable();
	changeTeamInfoContext();
	new_changeScoreCardContext();
	loadTeamMembers(portfolio.id);
}

// *** End Project Experience ***


// ******************************
// ***** People Experience *****
// ******************************

function initPeopleExperience() {
	// init
	initPeopleTable();
	initPersonInfo();
	initPersonScoreCard();
	initPersonTeams();
	
	// set initial context
	setContextToPerson("jpasqual@us.ibm.com");

	// load cards
	loadPeopleTable();
	changePersonInfoContext();
	changePersonScoreCardContext();
	changeTeamMembershipContext();
}

// *** End Project Experience ***


// ***********************************
// ***** load default experience *****
// ***********************************

initTempContainer();
initPortfolioExperience();
