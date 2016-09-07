// some function calls are found on dashUtils.js, commons.js
jQuery(function($) {
  $(document).ready(function() {
  	getPageVariables('assessment', initPageAction);
	});

	function initPageAction() {
		getAssessmentQuestionnaire(assessmentQuestionnaireHandler, [null]);
		var urlParameters = getJsonParametersFromUrl();
		if (urlParameters != undefined && urlParameters.testUser != undefined) {
			setTestUser(urlParameters.testUser);
			alert("here TestUser is: " + urlParameters.testUser);
		}
		if (urlParameters != undefined && urlParameters.id != undefined && urlParameters.id != "") {
			if (urlParameters.assessId != undefined && urlParameters.assessId != "") {
				agileTeamListHandler("teamSelectList", urlParameters.id, urlParameters.assessId, null, null, squadTeams);
			} else {
				agileTeamListHandler("teamSelectList", urlParameters.id, "new", null, null, squadTeams);
			}
		} else {
			agileTeamListHandler("teamSelectList", null, null, null, null, squadTeams);
		}

		setToolTips();
		$("#assessmentDate").datepicker({ maxDate: 0 , dateFormat: 'ddMyy' });
		$("#assessmentDate" ).datepicker( "option", "dateFormat", 'ddMyy' );
	}

	$("#teamSelectList").change(function() {
		var teamId = $("#teamSelectList option:selected").val();
		getTeamAssessments(teamId, false, teamAssessmentListHander, ["assessmentSelectList", teamId, "new"]);
	});

	$("#assessmentSelectList").change(function() {
		getTeamAssessmentAnswers($("#assessmentSelectList option:selected").val(), assessmentQuestionnaireHandler, []);
	});

	$("#teamTypeSelectList").change(function() {
		var opsExist = false;
		$("#assessmentContainer > ul > li > a").each(function() {
			if (($(this).html().toLowerCase().indexOf("ops") > -1) || ($(this).html().toLowerCase().indexOf("operations") > -1)) {
				opsExist = true;
			}
		});
		if (opsExist) {
	  	if ($("#teamTypeSelectList option:selected").val().toLowerCase() == "operations") {
	  		$("#assessmentContainer > ul > li > a").each(function() {
	  			if ($(this).html().toLowerCase().indexOf("leadership") > -1) {
	  				$(this).parent().hide();
	  			}
	  			if (($(this).html().toLowerCase().indexOf("ops") > -1) || ($(this).html().toLowerCase().indexOf("operations") > -1)) {
	  				$(this).parent().show();
	  			}
	  		});

	  	} else {
	  		$("#assessmentContainer > ul > li > a").each(function() {
	  			if ($(this).html().toLowerCase().indexOf("leadership") > -1) {
	  				$(this).parent().show();
	  			}
	  			if (($(this).html().toLowerCase().indexOf("ops") > -1) || ($(this).html().toLowerCase().indexOf("operations") > -1)) {
	  				$(this).parent().hide();
	  			}
	  		});

	  	}
		}

		if (gTeamAssessment != null)
			gTeamAssessment["team_proj_ops"] = $("#teamTypeSelectList option:selected").val();
	});

	$("#softwareYesNo").change(function() {
		if ($("#softwareYesNo option:selected").val().toLowerCase() == "no") {
			$("#assessmentContainer > ul > li > a").each(function() {
				if ($(this).html().toLowerCase().indexOf("delivery") > -1) {
					$(this).parent().hide();
				}
			});

		} else {
			$("#assessmentContainer > ul > li > a").each(function() {
				if ($(this).html().toLowerCase().indexOf("delivery") > -1) {
					$(this).parent().show();
				}
			});

		}

		if (gTeamAssessment != null)
			gTeamAssessment["team_dlvr_software"] = $("#softwareYesNo option:selected").val();
	});
});

function setToolTips() {
	var tt = "Operations teams support a repeatable process that delivers value to the customer.  Unlike a project, it normally has no definite start and end date.  "
					+ "Operation examples include recruitment, budgeting, call centers, supply chain and software operations.";
	$("#teamTypeTT").attr("title", tt);
	$("#teamTypeTT").tooltip();

	tt = "Answering yes to this will add the optional DevOps software delivery practices.";
	$("#softwareTT").attr("title", tt);
	$("#softwareTT").tooltip();

	tt = "The assessment date is assigned when the Submit action is taken.  To assign a specific date, i.e. when recording a previously completed assessment, select the date to use as the assessment date.";
	$("#assDateTT").attr("title", tt);
	$("#assDateTT").tooltip();

	$("div.ui-helper-hidden-accessible").each(function (index, obj) {
		$(obj).attr("aria-label", "Tooltip");
	});
}

function agileTeamListHandler(elementId, teamId, assessmentId, firstOption, lastOption, teamList) {
	$("#" + elementId).attr("disabled", "disabled");
	var listOption = getSquadDropdownList(teamList);
	setSelectOptions(elementId, listOption, firstOption, lastOption, teamId);
	$("#" + elementId).removeAttr("disabled");

	if (assessmentId != null)
		getTeamAssessments(teamId, true, teamAssessmentListHander, ["assessmentSelectList", teamId, assessmentId]);

	setScreenControls();
}

/**
 * Global variable to hold current team maturity assessment document being handled by the page.
 */
var gTeamAssessment = null;
function getTeamAssessmentAnswers(assessmentId, _callback, args) {
	if (assessmentId == null || assessmentId == "new" || assessmentId == "") {
		if (assessmentId == "")
			gTeamAssessment = null;
		else
			gTeamAssessment = initAssessmentAnswersTemplate();

		args.push(gTeamAssessment);
		args.push(gAssessmentTemplateList);

		if (typeof _callback === "function") {
			showLog("callback function: " + getFnName(_callback));
			_callback.apply(this, args);
		}

	} else {
		$.ajax({
			type : "GET",
			url : "/api/assessment/view?assessId=" + encodeURIComponent(assessmentId),
			async : false
		}).done(function(data) {
			if (data != undefined) {
				gTeamAssessment = data;
				args.push(gTeamAssessment);
				args.push(gAssessmentTemplateList);

				showLog("data loaded: " + JSON.stringify(data));
				if (typeof _callback === "function") {
					showLog("callback function: " + getFnName(_callback));
					_callback.apply(this, args);
				}
			}
		});
	}
}

/**
 * Global variable holder for maturity assessment questionnaire template.
 */
var gAssessmentTemplate = null;
/**
 * Global variable holder for maturity assessment questionnaire template list.
 */
var gAssessmentTemplateList = [];
function assessmentQuestionnaireHandler(teamAssessment, assessmentTemplateList) {
	gAssessmentTemplateList = sortAssessmentTemplate(assessmentTemplateList);
	if (assessmentTemplateList.length > 0)
		gAssessmentTemplate = assessmentTemplateList[0];

	if (teamAssessment != null) {
		var result = _.find(gAssessmentTemplateList, function(value){
			if (value.atma_version == teamAssessment.assessmt_version ||
				value._id == teamAssessment.assessmt_version){
				return value;
			}
		});
		if (result != null){
			gAssessmentTemplate = result;
		}
	}

	createAssessmentTable(gAssessmentTemplate);
	setScreenAnswers(teamAssessment);
	setScreenControls();
}

/**
 * Global variable to hold an array of maturity assessment documents.
 */
var gTeamAssessmentList = null;
function teamAssessmentListHander(elementId, teamId, assessmentId, teamAssessments) {
	if (teamId == "") {
		gTeamAssessment = null;
		setSelectOptions(elementId, null, ["new", "Create new assessment..."], null, "new");
		assessmentQuestionnaireHandler(gTeamAssessment, gAssessmentTemplateList);
		return;

	}

	$("#" + elementId).attr("disabled", "disabled");

	gTeamAssessmentList = teamAssessments;
	var allowAccess = hasAccess(teamId);
	var listOption = getAssessmentDropdownList(gTeamAssessmentList);
	var firstOption = null;
	var draftExist = false;

	if (teamId != "" && assessmentId != "new" && assessmentId != "") {
		for (var i=0; i<listOption.length; i++) {
			if (listOption[i][1].toLowerCase().indexOf("draft") > -1) {
				firstOption = null;
				draftExist = true;
				break;
			}
		}

		if (!draftExist && allowAccess)
			firstOption = ["new", "Create new assessment..."];

		setSelectOptions(elementId, listOption, firstOption, null, assessmentId);
		getTeamAssessmentAnswers(assessmentId, assessmentQuestionnaireHandler, []);

	} else if (teamId != "" && assessmentId == "new") {
		for (var i=0; i<listOption.length; i++) {
			if (listOption[i][1].toLowerCase().indexOf("draft") > -1) {
				firstOption = null;
				assessmentId = listOption[i][0];
				draftExist = true;
				setSelectOptions(elementId, listOption, firstOption, null, assessmentId);
				getTeamAssessmentAnswers(assessmentId, assessmentQuestionnaireHandler, []);
				break;
			}
		}

		if (!draftExist) {
			if (allowAccess) {
				firstOption = ["new", "Create new assessment..."];
				gTeamAssessment = initAssessmentAnswersTemplate();
			} else {
				firstOption = null;
				gTeamAssessment = null;
				assessmentId = null;
			}
			setSelectOptions(elementId, listOption, firstOption, null, assessmentId);
			assessmentQuestionnaireHandler(gTeamAssessment, gAssessmentTemplateList);

		}

	} else {
		setSelectOptions(elementId, listOption, null, null, assessmentId);
		gTeamAssessment = null;
		assessmentQuestionnaireHandler(gTeamAssessment, gAssessmentTemplateList);

	}

	$("#" + elementId).removeAttr("disabled");

}

function updateAgileTeamAssessmentsCache(teamAssessment) {
	var found = false;
	for (var i=0; i<gTeamAssessmentList.length; i++) {
		if (gTeamAssessmentList[i]._id == teamAssessment._id) {
			gTeamAssessmentList[i] = teamAssessment;
			found = true;
			break;
		}
	}
	if (!found) {
		gTeamAssessmentList.push(teamAssessment);
	}

	gTeamAssessmentList = sortAssessments(gTeamAssessmentList);
	var listOption = getAssessmentDropdownList(gTeamAssessmentList);

	var draftExist = false;
	var firstOption = "";
	var selectedOption = teamAssessment._id;
	for (var i=0; i<listOption.length; i++) {
		if (listOption[i][1].toLowerCase().indexOf("draft") > -1) {
			firstOption = null;
			selectedOption = listOption[i][0];
			draftExist = true;
			break;
		}
	}
	if (!draftExist) {
		firstOption = ["new", "Create new assessment..."];
	}

	setSelectOptions("assessmentSelectList", listOption, firstOption, null, selectedOption);
}

function createAssessmentTable(assessmentTemplate) {
	$("#assessmentContainer").empty();

	if (assessmentTemplate == null) {
		var p = document.createElement("p");
		p.appendChild(document.createTextNode("No maturity assessment template found."));
		$("#assessmentContainer").append(p);
		return;
	}

	var assessments = assessmentTemplate["atma_cmpnt_tbl"];
	var versionId = "atma_ver_" + assessmentTemplate["atma_version"];
	var html = createMainTwistySection(versionId, "agile-assessment");
	$("#assessmentContainer").append(html);
	for (var i=0; i<assessments.length; i++) {
		var atmaId = versionId + "_" + i;
		label = assessments[i]["atma_name"];
		html = createSubTwistySection(atmaId, label, "", false);
		$("#"+versionId).append(html);

		var mainPrincipleId = atmaId + "_prin";
		html = createMainTwistySection(mainPrincipleId, "agile-principle");
		$("#body"+atmaId).append(html);

		var principles = assessments[i]["principle_tbl"];
		for (var j=0; j<principles.length; j++) {
			var principleId = mainPrincipleId + "_" + principles[j]["principle_id"];
			label = principles[j]["principle_name"];
			html = createSubTwistySection(principleId, label, "", false);
			$("#"+mainPrincipleId).append(html);

			var mainPracticeId = principleId + "_prac";
			html = createMainTwistySection(mainPracticeId, "agile-practice");
			$("#body"+principleId).append(html);

			var practices = principles[j]["practice_tbl"];
			for (var k=0; k<practices.length; k++) {
				label = practices[k]["practice_name"];

				var practiceId = mainPracticeId + "_" + practices[k]["practice_id"];
				html = createSubTwistySection(practiceId, label, "", false);
				$("#"+mainPracticeId).append(html);

				createCriteriaTable(practices[k], "body"+practiceId, practiceId);
			}
		}
	}

	jQuery("#"+versionId).attr("data-widget", "twisty");
	jQuery("#"+versionId).twisty();
	$("input:radio").each(function() {
		IBMCore.common.widget.checkboxradio.init(this);
		$(this.parentElement).attr("aria-label","Maturity level");
	});
	setPracticeAnswerStatus();
	setCollapsableLinks();
	setAssessmentToolTips();
}

function createMainTwistySection(twistyId, extraClass) {
	var ul = document.createElement("ul");
	ul.setAttribute("class", "ibm-twisty " + extraClass);
	ul.setAttribute("id", twistyId);
	return ul;
}

function createSubTwistySection(twistyId, twistyLabel, extraClass, collapseLink) {
	var li = document.createElement("li");
	li.setAttribute("data-open", "true");
	li.setAttribute("class", extraClass);
	li.setAttribute("id", twistyId);

	var span = document.createElement("span");
	span.setAttribute("class", "ibm-twisty-head");
	span.appendChild(document.createTextNode(twistyLabel));
	li.appendChild(span);

	var div = document.createElement("div");
	div.setAttribute("class", "ibm-twisty-body");
	div.setAttribute("id", "body"+twistyId);

	if (collapseLink) {
		var p = document.createElement("p");
		p.setAttribute("class", extraClass);
		var a = document.createElement("a");
		a.setAttribute("id", twistyId + "_hide");
		a.setAttribute("href", "");
		a.appendChild(document.createTextNode("Collapse all"));
		p.appendChild(a);
		p.appendChild(document.createTextNode(" | "));
		a = document.createElement("a");
		a.setAttribute("id", twistyId + "_show");
		a.setAttribute("href", "");
		a.appendChild(document.createTextNode("Show all"));
		p.appendChild(a);

		div.appendChild(p);
	}

	li.appendChild(div);

	return li;
}

function createCriteriaTable(practice, htmlLoc, practiceId) {
	var table = document.createElement("table");
	table.setAttribute("class", "ibm-data-table ibm-altrows agile-practice");
	table.setAttribute("width", "100%");
	table.setAttribute("summary", "Maturity assessment level and description for the identified practice.");

	var caption = document.createElement("caption");
	caption.appendChild(document.createTextNode(practice["practice_desc"]));
	table.appendChild(caption);

	var thead = document.createElement("thead");
	var tr = document.createElement("tr");
	var th = document.createElement("th");
	var a =  document.createElement("a");

	th.setAttribute("scope", "col");
	th.setAttribute("width", "15%");
	th.appendChild(document.createTextNode("Maturity level"));
	tr.appendChild(th);

	th = document.createElement("th");
	th.setAttribute("scope", "col");
	tr.appendChild(th);

	th = document.createElement("th");
	th.setAttribute("scope", "col");
	th.setAttribute("width", "8%");
	th.setAttribute("id", practiceId+"_th_curr");
	th.setAttribute("style", "text-align: center; display: none");
	th.appendChild(document.createTextNode("Current"));

	a.setAttribute("class", "ibm-information-link");
	a.setAttribute("id", practiceId+"_currentTT");
	a.setAttribute("data-widget", "tooltip");
	a.setAttribute("style", "cursor: default; position: relative; left: 5px; top :0px; display: inline;");
	th.appendChild(a);
	tr.appendChild(th);

	th = document.createElement("th");
	th.setAttribute("scope", "col");
	th.setAttribute("width", "8%");
	th.setAttribute("id", practiceId+"_th_targ");
	th.setAttribute("style", "text-align: center; display: none");
	th.appendChild(document.createTextNode("Target"));

	a = document.createElement("a");
	a.setAttribute("class", "ibm-information-link");
	a.setAttribute("id", practiceId+"_targetTT");
	a.setAttribute("data-widget", "tooltip");
	a.setAttribute("style", "cursor: default; position: relative; left: 5px; top :0px; display: inline;");
	th.appendChild(a);
	tr.appendChild(th);

	th = document.createElement("th");
	th.setAttribute("scope", "col");
	th.setAttribute("width", "8%");
	th.setAttribute("id", practiceId+"_th_ind");
	th.appendChild(document.createTextNode("Independent"));
	th.setAttribute("style", "text-align: center; display: none");
	tr.appendChild(th);

	thead.appendChild(tr);
	table.appendChild(thead);

	var tbody = document.createElement("tbody");
	var criteria = practice["mat_criteria_tbl"];
	for (var i=0; i<criteria.length; i++) {
		tr = document.createElement("tr");
		tr.setAttribute("id", practiceId+"_tbtr_"+i);

		var td = document.createElement("td");
		td.appendChild(document.createTextNode(criteria[i]["mat_lvl_name"]));
		tr.appendChild(td);

		td = document.createElement("td");
		var ul = document.createElement("ul");
		for (var j=0; j<criteria[i]["mat_lvl_criteria"].length; j++) {
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(criteria[i]["mat_lvl_criteria"][j]));
			ul.appendChild(li);
		}
		td.appendChild(ul);
		tr.appendChild(td);

		var radio = document.createElement("input");
		radio.setAttribute("type", "radio");
		radio.setAttribute("name", practiceId+"_curr");
		radio.setAttribute("value", criteria[i]["mat_lvl_name"]);
		radio.setAttribute("aria-label", criteria[i]["mat_lvl_name"]);
		td = document.createElement("td");
		td.setAttribute("id", practiceId+"_td_curr_"+i);
		td.setAttribute("class", "agile-question-opt ibm-background-cool-gray-20");
		td.setAttribute("style", "display: none;");
		td.appendChild(radio);
		tr.appendChild(td);

		radio = document.createElement("input");
		radio.setAttribute("type", "radio");
		radio.setAttribute("name", practiceId+"_targ");
		radio.setAttribute("value", criteria[i]["mat_lvl_name"]);
		radio.setAttribute("aria-label", criteria[i]["mat_lvl_name"]);
		td = document.createElement("td");
		td.setAttribute("id", practiceId+"_td_targ_"+i);
		td.setAttribute("class", "agile-question-opt ibm-background-cool-gray-10");
		td.setAttribute("style", "display: none;");
		td.appendChild(radio);
		tr.appendChild(td);

		radio = document.createElement("input");
		radio.setAttribute("type", "radio");
		radio.setAttribute("name", practiceId+"_ind");
		radio.setAttribute("value", criteria[i]["mat_lvl_name"]);
		radio.setAttribute("aria-label", criteria[i]["mat_lvl_name"]);
		td = document.createElement("td");
		td.setAttribute("id", practiceId+"_td_ind_"+i);
		td.setAttribute("class", "agile-question-opt ibm-background-cool-gray-20");
		td.setAttribute("style", "display: none;");
		td.appendChild(radio);
		tr.appendChild(td);

		tbody.appendChild(tr);
	}
	tr = document.createElement("tr");
	tr.setAttribute("id", practiceId+"_tbtr_action");
	tr.setAttribute("style", "display: none;");
	var textArea = document.createElement("textarea");
	textArea.setAttribute("style", "width:1120px");
	textArea.setAttribute("cols", "350");
	textArea.setAttribute("rows", "3");
	textArea.setAttribute("aria-label", "Action plan item");
	textArea.setAttribute("maxlength", "350");
	textArea.setAttribute("id", practiceId+"_action");
	td = document.createElement("td");
	td.setAttribute("id", practiceId+"_td_action");
	td.setAttribute("colspan", "5");
	td.appendChild(document.createTextNode("How do we get better? (Action plan item; 350 char limit)"));
	td.appendChild(document.createElement("br"));
	td.appendChild(textArea);
	tr.appendChild(td);
	tbody.appendChild(tr);

	tr = document.createElement("tr");
	tr.setAttribute("id", practiceId+"_tbtr_comment");
	tr.setAttribute("style", "display: none;");
	textArea = document.createElement("textarea");
	textArea.setAttribute("style", "width:1120px");
	textArea.setAttribute("id", practiceId+"_comment");
	td = document.createElement("td");
	td.setAttribute("id", practiceId+"_td_comment");
	td.setAttribute("colspan", "5");
	td.appendChild(document.createTextNode("Independent assessment comment"));
	td.appendChild(document.createElement("br"));
	td.appendChild(textArea);
	tr.appendChild(td);
	tbody.appendChild(tr);

	table.appendChild(tbody);

	$("#"+htmlLoc).append(table);
}

function setPracticeAnswerStatus() {
	if (gAssessmentTemplate == null) return;

	$("#assessmentContainer [id^='atma_ver'] [id*='_prac'] a[class*='ibm-twisty-trigger']").each(function(index, obj) {
		var span = document.createElement("span");
		span.setAttribute("id", $(obj).parent().attr("id") + "_ans");
		if (gTeamAssessment != null)
			span.appendChild(document.createTextNode("Not answered"));
		$(obj).append(span);
	});

	jQuery("#assessmentContainer input[name^='atma_ver']").on("ifChanged", function(event){
		var optionName = this.name;
		var principleId = "";
		if (optionName.indexOf("_curr") > -1)
			principleId = optionName.substring(0, optionName.indexOf("_curr"));
		else if (optionName.indexOf("_targ") > -1)
			principleId = optionName.substring(0, optionName.indexOf("_targ"));
		else if (optionName.indexOf("_ind") > -1)
			principleId = optionName.substring(0, optionName.indexOf("_ind"));

		var status = "";
		if (isReviewer(gTeamAssessment) && getAssessmentStatus(gTeamAssessment).toLowerCase() == "independent review") {
			var indAnswered = $("[name='"+principleId+"_ind']:checked").length > 0;
			status = (indAnswered ? "Review: " + $("[name='"+principleId+"_ind']:checked").attr("value") : "Unanswered");

		} else if (getAssessmentStatus(gTeamAssessment).toLowerCase() == "submitted and reviewed") {
			var currAnswered = $("[name='"+principleId+"_curr']:checked").length > 0;
			var targAnswered = $("[name='"+principleId+"_targ']:checked").length > 0;
			status = "Current: " + (currAnswered ? $("[name='"+principleId+"_curr']:checked").attr("value") : "---");
			status = status + " | Target: "+ (targAnswered ? $("[name='"+principleId+"_targ']:checked").attr("value") : "---");
			var indAnswered = $("[name='"+principleId+"_ind']:checked").length > 0;
			status = status + " | Review: " + (indAnswered ? $("[name='"+principleId+"_ind']:checked").attr("value") : "---");

		} else {
			var currAnswered = $("[name='"+principleId+"_curr']:checked").length > 0;
			var targAnswered = $("[name='"+principleId+"_targ']:checked").length > 0;
			status = "Current: " + (currAnswered ? $("[name='"+principleId+"_curr']:checked").attr("value") : "---");
			status = status + " | Target: "+ (targAnswered ? $("[name='"+principleId+"_targ']:checked").attr("value") : "---");

		}
		$("#"+principleId+" > a").removeAttr("style");
		$("#"+principleId+"_ans").html(status);

		setChangeIndiactor();
	});

	jQuery("#assessmentContainer textarea[id^='atma_ver']").on("change", function(event) {
		setChangeIndiactor();
	});
}

function setCollapsableLinks() {
	jQuery("#assessmentContainer div > p > a[id*='_show']").each(function (index, obj) {
		var id = $(obj).attr("id");
		var sectionId = id.substring(0, id.indexOf("_show"));
		var bodyId = "body" + sectionId;
		$(obj).bind("click", function() {
			$("div[id='"+bodyId+"'] > ul > li[class=''] > a").each(function (index, obj) {
				$(obj).click();
			});
			return false;
		});
	});

	$("#assessmentContainer div > p > a[id*='_hide']").each(function (index, obj) {
		var id = $(obj).attr("id");
		var sectionId = "";
		for (var i=0; i<id.split("_").length - 1; i++) {
			sectionId = sectionId + id.split("_")[i];
			if (i < id.split("_").length - 2)
				sectionId = sectionId + "_";
		}
		var bodyId = "body" + sectionId;
		$(obj).bind("click", function(event) {
			$("div[id='"+bodyId+"'] > ul > li[class='ibm-active'] > a").each(function (index, obj) {
			  $(obj).click();
			});
			return false;
		});
	});
}

function setAssessmentToolTips() {
	var tt = "Your team's current maturity level.";
	$("#assessmentContainer [id*='currentTT']").each(function (index, obj) {
		$(obj).attr("title", tt);
		$(obj).tooltip();
	});

	tt = "Your team's targets for the next 90 days.  Choose the practices that the team agrees will have the most impact.";
	$("#assessmentContainer [id*='targetTT']").each(function (index, obj) {
		$(obj).attr("title", tt);
		$(obj).tooltip();
	});

	$("div.ui-helper-hidden-accessible").each(function (index, obj) {
		$(obj).attr("aria-label", "Tooltip");
	});
}

function assessmentAction(obj) {
	$("input[type='button']").each(function () {
		$(this).attr("disabled", "disabled");
	});

	var action = obj.value.toLowerCase();
	if (action == "save as draft") {
		updateAgileTeamAssessment(action);
		return true;

	} else if (action == "delete draft") {
		if (confirm("You have requested to delete this draft assessment.  All saved progress will be deleted. Please confirm that you want to proceed with this delete."))
			updateAgileTeamAssessment(action);

		else
			setScreenControls();

		return true;

	} else if (action == "submit") {
		// store selected values
		gTeamAssessment["team_proj_ops"] = $("#teamTypeSelectList option:selected").val();
		gTeamAssessment["team_dlvr_software"] = $("#softwareYesNo option:selected").val();

		/*var leadershipID = "";
		// look for projects section if presented and store prefix id of children elements
		$("#assessmentContainer > ul > li > a").each(function() {
			if (($(this).html().toLowerCase().indexOf("leadership") > -1 &&
					$(this).html().toLowerCase().indexOf("ops") == -1) &&
					($(this).html().toLowerCase().indexOf("leadership") > -1 &&
					$(this).html().toLowerCase().indexOf("operations") == -1)) {
				leadershipID = $(this).parent().attr("id");
			}
		});

		var deliveryID = "";
		var includeDelivery = $("#softwareYesNo option:selected").val().toLowerCase() == "yes";
		// look for delivery section if presented and store prefix id of children elements
		$("#assessmentContainer > ul > li > a").each(function() {
			if ($(this).html().toLowerCase().indexOf("delivery") > -1) {
				deliveryID = $(this).parent().attr("id");
			}
		});

		var isOperations = false;
		var operationsID = "";
		var opsExist = false;
		// look for operations section if presented in the template
		$("#assessmentContainer > ul > li > a").each(function() {
			if (($(this).html().toLowerCase().indexOf("ops") > -1) || ($(this).html().toLowerCase().indexOf("operations") > -1)) {
				opsExist = true;
			}
		});
		if (opsExist) {
			isOperations = $("#teamTypeSelectList option:selected").val().toLowerCase() == "operations";
			// look for operations section if presented and store prefix id of children elements
			$("#assessmentContainer > ul > li > a").each(function() {
				if (($(this).html().toLowerCase().indexOf("leadership") > -1 &&
						$(this).html().toLowerCase().indexOf("ops") > -1) ||
						($(this).html().toLowerCase().indexOf("leadership") > -1 &&
						$(this).html().toLowerCase().indexOf("operations") > -1)) {
					operationsID = $(this).parent().attr("id");
				}
			});
  	}

		var isComplete = true;
		var errorMsg = "";
		if (getAssessmentStatus(gTeamAssessment).toLowerCase() == "draft") {
			$("#assessmentContainer li[id*='_prac']").each(function() {
				var answers = this.id;
				// query for section unanswered practices
				var thisSectionComplete = true;
				if ($("[name*='"+answers+"_curr']:checked").length == 0 || $("[name*='"+answers+"_targ']:checked").length == 0) {
					if (opsExist) {
						if (answers.indexOf(leadershipID) > -1 && isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(operationsID) > -1 && !isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
					} else {
						if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
					}
					if (!thisSectionComplete) {
						$("#"+answers+" > a").attr("style", "background: yellow");
						isComplete = false;
					}
				}
			});

			errorMsg = "All assessment maturity practices need to be answered.  See highlighted practices in yellow.";

		} else if (getAssessmentStatus(gTeamAssessment).toLowerCase() == "independent review") {
			$("#assessmentContainer li[id*='_prac']").each(function() {
				var answers = this.id;
				// query for section unanswered practices
				var thisSectionComplete = true;
				if ($("[name*='"+answers+"_ind']:checked").length == 0) {
					if (opsExist) {
						if (answers.indexOf(leadershipID) > -1 && isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(operationsID) > -1 && !isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
						if (!thisSectionComplete) {
							$("#"+answers+" > a").attr("style", "background: yellow");
							isComplete = false;
						}
					} else {
						if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
					}
				}
			});

			errorMsg = "All assessment maturity practices need to be answered.  See highlighted practices in yellow.";

		}

		if (!isComplete) {
			showMessagePopup(errorMsg);
			$("input[type='button']").each(function () {
				$(this).removeAttr("disabled");
			});
			return false;
		}
		*/
		updateAgileTeamAssessment(action);
		return true;

	} else if (action == "cancel current changes") {
		getTeamAssessmentAnswers($("#assessmentSelectList option:selected").val(), assessmentQuestionnaireHandler, []);
		showMessagePopup("Current changes have been cancelled.");
		return true;
	}

}

function updateAgileTeamAssessment(action) {
	var msg = "";
	if ($("#assessmentSelectList").val().toLowerCase() == "new") {
		var serverDateTime = getServerDateTime();
		var screenAnswers = getScreenAnswers();
		screenAnswers["assessmt_status"] = "Draft";
		screenAnswers["created_dt"] = serverDateTime;
		screenAnswers["created_user"] = userInfo.email;
		screenAnswers["last_updt_dt"] = serverDateTime;
		screenAnswers["last_updt_user"] = userInfo.email;

		if (action == "save as draft") {
			screenAnswers["assessmt_status"] = "Draft";
			screenAnswers["assessmt_action_plan_tbl"] = [];
			msg = "Maturity assessment has been saved as draft.";

		} else if (action == "submit") {
			screenAnswers["assessmt_status"] = "Submitted";
			screenAnswers["submitter_id"] = userInfo.email;
			//screenAnswers["self-assessmt_dt"] = serverDateTime;
			if(screenAnswers["self-assessmt_dt"] == undefined || screenAnswers["self-assessmt_dt"].length == 0){
				screenAnswers["self-assessmt_dt"] = serverDateTime;
			}
			//screenAnswers["assessmt_action_plan_tbl"] = [];
			msg = "Maturity assessment has been submitted.";

		}

		$("#lastUpdateUser").html(userInfo.email);
		$("#lastUpdateTimestamp").html(showDateDDMMMYYYYTS(serverDateTime));

		gTeamAssessment = screenAnswers;
		showLog(screenAnswers);
		$.ajax({
			type : "POST",
			url : "/api/assessment",
			contentType : "application/json",
			data : JSON.stringify(screenAnswers)
		}).done(function(data) {
			$("#doc_id").html(data.id);
			getTeamAssessments($("#teamSelectList option:selected").val(), false, teamAssessmentListHander, ["assessmentSelectList", $("#teamSelectList option:selected").val(), data.id]);
   		showMessagePopup(msg);
    }).fail(function( jqXHR, textStatus, errorThrown){
			if (jqXHR.status == 400){
				if (jqXHR.responseJSON.error  != null)
					validationHandler(jqXHR.responseJSON.error);
			}
		});

	} else {
		$.ajax({
			type : "GET",
			url : "/api/assessment/view?assessId=" + encodeURIComponent($("#assessmentSelectList").val()),
			async : false
		}).done(function(data) {

			var jsonData = data;
			if (action == "delete draft") {
				showLog(JSON.stringify(jsonData));
				$.ajax({
					type : "DELETE",
					url : "/api/assessment" + "?docId=" + encodeURIComponent(jsonData["_id"]) + '&revId=' + jsonData["_rev"]
				}).done(function(data) {
					showMessagePopup("Draft assessment has been deleted.");
					getTeamAssessments(jsonData["team_id"], false, teamAssessmentListHander, ["assessmentSelectList", jsonData["team_id"], "new"]);
				}).fail(function( jqXHR, textStatus, errorThrown){
					if (jqXHR.status == 400){
						if (jqXHR.responseJSON.error != null)
							validationHandler(jqXHR.responseJSON.error);
					}
				});

			} else {
				var screenAnswers = getScreenAnswers();
				var serverDateTime = getServerDateTime();
				jsonData["team_proj_ops"] = screenAnswers["team_proj_ops"];
				jsonData["team_dlvr_software"] = screenAnswers["team_dlvr_software"];
				jsonData["assessmt_cmpnt_rslts"] = screenAnswers["assessmt_cmpnt_rslts"];
				jsonData["self-assessmt_dt"] = screenAnswers["self-assessmt_dt"];
				jsonData["last_updt_dt"] = serverDateTime;
				jsonData["last_updt_user"] = userInfo.email;

				if (action == "save as draft" && getAssessmentStatus(jsonData).toLowerCase() == "draft") {
					jsonData["assessmt_status"] = "Draft";
					jsonData["assessmt_action_plan_tbl"] = [];
					msg = "Maturity assessment has been saved as draft.";

				} else if (action == "submit" && getAssessmentStatus(jsonData).toLowerCase() == "draft") {
					jsonData["assessmt_status"] = "Submitted";
					jsonData["submitter_id"] = userInfo.email;
					//jsonData["self-assessmt_dt"] = serverDateTime;
					if(screenAnswers["self-assessmt_dt"] != undefined && screenAnswers["self-assessmt_dt"].length > 0){
						jsonData["self-assessmt_dt"] = screenAnswers["self-assessmt_dt"];
					}else{
						if(jsonData["self-assessmt_dt"] == undefined || jsonData["self-assessmt_dt"].length == 0){
							jsonData["self-assessmt_dt"] = serverDateTime;
						}
					}
					jsonData["assessmt_action_plan_tbl"] = screenAnswers["assessmt_action_plan_tbl"];
					msg = "Maturity assessment has been submitted.";

				} else if (action == "save as draft" && getAssessmentStatus(jsonData).toLowerCase() == "independent review") {
					jsonData["assessmt_status"] = "Submitted";
					jsonData["ind_assessmt_status"] = "Draft";
					jsonData["ind_assessor_id"] = userInfo.email;
					jsonData["assessmt_action_plan_tbl"] = mergeActionItems(jsonData["assessmt_action_plan_tbl"], screenAnswers["assessmt_action_plan_tbl"]);
					msg = "Independent review for the maturity assessment has been saved as draft.";

				} else if (action == "submit" && getAssessmentStatus(jsonData).toLowerCase() == "independent review") {
					jsonData["ind_assessmt_status"] = "Submitted";
					jsonData["ind_assessor_id"] = userInfo.email;
					jsonData["ind_assessmt_dt"] = serverDateTime;
					jsonData["assessmt_action_plan_tbl"] = mergeActionItems(jsonData["assessmt_action_plan_tbl"], screenAnswers["assessmt_action_plan_tbl"]);
					msg = "Independent review for the maturity assessment has been submitted.";

				}

				$("#lastUpdateUser").html(userInfo.email);
				$("#lastUpdateTimestamp").html(showDateDDMMMYYYYTS(serverDateTime));
				$("#doc_id").html(jsonData["_id"]);

				// copy object to persist to follow hierarchy of columns in the template
				jsonData = $.extend(true, {}, screenAnswers, jsonData);
				$.ajax({
					type : "PUT",
					url : "/api/assessment/",
					contentType : "application/json",
					data : JSON.stringify(jsonData)
				}).done(function(data) {
					gTeamAssessment = jsonData;
					gTeamAssessment["_rev"] = data["rev"];
					updateAgileTeamAssessmentsCache(gTeamAssessment);
					assessmentQuestionnaireHandler(gTeamAssessment, gAssessmentTemplateList);
					setScreenControls();
					showMessagePopup(msg);
				}).fail(function( jqXHR, textStatus, errorThrown){
					if (jqXHR.status == 400){
						if (jqXHR.responseJSON.error != null)
							validationHandler(jqXHR.responseJSON.error);
					}
				});
			}
		});
	}
}

function mergeActionItems(oldAnswers, newAnswers) {
	var actionItemsList = [];
	for (var i=0; i<newAnswers.length; i++) {
		var found = false;
		for (var j=0; j<oldAnswers.length; j++) {
			if ((newAnswers[i]["principle_id"] == oldAnswers[j]["principle_id"] ||
					newAnswers[i]["principle_name"] == oldAnswers[j]["principle_name"]) &&
					(newAnswers[i]["practice_id"] == oldAnswers[j]["practice_id"] ||
					newAnswers[i]["practice_name"] == oldAnswers[j]["practice_name"])) {

				newAnswers[i]["progress_summ"] = oldAnswers[j]["progress_summ"];
				newAnswers[i]["key_metric"] = oldAnswers[j]["key_metric"];
				newAnswers[i]["review_dt"] = oldAnswers[j]["review_dt"];
				newAnswers[i]["action_item_status"] = oldAnswers[j]["action_item_status"];
				found = true;
				actionItemsList.push(newAnswers[i]);
			}
		}
		if (!found)
			actionItemsList.push(newAnswers[i]);
	}
	return actionItemsList;
}

function setScreenAnswers(teamAssessment) {
	if (teamAssessment == null) {
		return;
	}
	var found = true;
	var msg = "";
	var eleVersionId = "atma_ver_" + gAssessmentTemplate["atma_version"];
	var assessments = gAssessmentTemplate["atma_cmpnt_tbl"];
	for (var i=0; i<assessments.length; i++) {
		var eleAtmaId = eleVersionId + "_" + i;
		var eleMainPrincipleId = eleAtmaId + "_prin";

		var result = teamAssessment["assessmt_cmpnt_rslts"];
		if (result == null) break;

		var processAnswers = null;
		for (var a=0; a<result.length; a++) {
			if (result[a]["assessed_cmpnt_name"] != null && assessments[i]["atma_name"] != null
					&& (result[a]["assessed_cmpnt_name"].toLowerCase() == assessments[i]["atma_name"].toLowerCase())) {
				processAnswers =result[a]["assessed_cmpnt_tbl"];
			}
		}
		if (processAnswers == null) continue;

		var principles = assessments[i]["principle_tbl"];
		for (var j=0; j<principles.length; j++) {
			var principleName = principles[j]["principle_name"];
			var principleId = principles[j]["principle_id"];
			var elePrincipleId = eleMainPrincipleId + "_" + principles[j]["principle_id"];

			var practices = principles[j]["practice_tbl"];
			for (var k=0; k<practices.length; k++) {
				var eleMainPracticeId = elePrincipleId + "_prac";
				var elePracticeId = eleMainPracticeId + "_" + practices[k]["practice_id"];

				var practiceName = practices[k]["practice_name"];
				var practiceId = practices[k]["practice_id"];
				for (var b=0; b<processAnswers.length; b++) {
					var answer = processAnswers[b];
					if ((answer["principle_name"] == null || answer["principle_name"] == ""  )
							&& (answer["practice_name"] == null || answer["practice_name"] == ""))
							continue;

					if ((answer["principle_name"].toLowerCase() == principleName.toLowerCase() || answer["principle_id"] == principleId)
							&& (answer["practice_name"].toLowerCase() == practiceName.toLowerCase() || answer["practice_id"] == practiceId)) {
						var current = answer["cur_mat_lvl_achieved"];
						var target = answer["tar_mat_lvl_achieved"];
						var independent = answer["ind_mat_lvl_achieved"];
						//console.log(elePracticeId + " " + current + "/" + target + "/" + independent);
						$("[name='"+elePracticeId+"_curr']").each(function(index, obj) {
							if ($(obj).attr("value") == current)
								$($(obj)).iCheck("check");
						});
						$("[name='"+elePracticeId+"_targ']").each(function(index, obj) {
							if ($(obj).attr("value") == target)
								$($(obj)).iCheck("check");
						});
						$("[name='"+elePracticeId+"_ind']").each(function(index, obj) {
							if ($(obj).attr("value") == independent) {
								$($(obj)).iCheck("check");
							}
						});

						$("#"+elePracticeId+"_action").val(answer["how_better_action_item"]);
						$("#"+elePracticeId+"_comment").val(answer["ind_assessor_cmnt"]);
					} else {
						found = true;

					}
				}
				if (!found)
					msg = msg + " * " + practiceName + "<br>";
			}
		}
	}

	$("#lastUpdateUser").html(teamAssessment["last_updt_user"]);
	$("#lastUpdateTimestamp").html(showDateDDMMMYYYYTS(teamAssessment["last_updt_dt"]));
	$("#doc_id").html(teamAssessment["_id"]);

	if (!found)
		showMessagePopup("Previous answers for the the following practice(s) cannot be mapped to the current template: <br>" + msg);

	if (isReviewer(teamAssessment) && getAssessmentStatus(teamAssessment).toLowerCase() == "independent review") {
		$("[id*='th_ind'], [id*='td_ind'], [id*='tbtr_comment']").each(function() {
			$(this).show();
		});
		$("[id*='th_curr'], [id*='td_curr'], [id*='th_targ'], [id*='td_targ'], [id*='tbtr_action']").each(function() {
			$(this).hide();
		});

	} else if (getAssessmentStatus(teamAssessment).toLowerCase() == "submitted and reviewed") {
		$("[id*='th_ind'], [id*='td_ind'], [id*='tbtr_comment']").each(function() {
			$(this).show();
		});
		$("[id*='th_curr'], [id*='td_curr'], [id*='th_targ'], [id*='td_targ'], [id*='tbtr_action']").each(function() {
			$(this).show();
		});

	} else {
		$("[id*='th_ind'], [id*='td_ind'], [id*='tbtr_comment']").each(function() {
			$(this).hide();
		});
		$("[id*='th_curr'], [id*='td_curr'], [id*='th_targ'], [id*='td_targ'], [id*='tbtr_action']").each(function() {
			$(this).show();
		});

	}
}

function setProgressIndicator() {
	// TODO: on hold as per Ed!!!
	if (gAssessmentTemplate != null && gTeamAssessment != null) {
		var eleVersionId = "atma_ver_" + gAssessmentTemplate["atma_version"];
		var assessments = gAssessmentTemplate["atma_cmpnt_tbl"];
		for (var i=0; i<assessments.length; i++) {
			var eleAtmaId = eleVersionId + "_" + i;
		}
	}
}

function setProgressLink(teamId, assessId) {
	$("#progressLink").empty();
	$("#progressLink").append(document.createTextNode("Team Assessment Summary"));

	var progressPage = "progress";
	if ((teamId != null && teamId != "")
			&& (assessId != null && (assessId != "" || assessId != "new"))
			&& getAssessmentStatus(gTeamAssessment).toLowerCase() != "draft" ) {
		progressPage = progressPage + "?id=" + teamId;
		progressPage = progressPage + "&assessId=" + assessId;
		var link = document.createElement("a");
		link.setAttribute("href", progressPage);
		link.appendChild(document.createTextNode("Team Assessment Summary"));

		$("#progressLink").empty();
		$("#progressLink").append(link);
		$("#progressSep").show();

	}	else {
		$("#progressSep").hide();

	}
}

function getScreenAnswers() {
	var assessments = gAssessmentTemplate["atma_cmpnt_tbl"];
	var eleVersionId = "atma_ver_" + gAssessmentTemplate["atma_version"];
	var screenAnswers = initAssessmentAnswersTemplate();
	screenAnswers["assessmt_version"] = gAssessmentTemplate["_id"];
	screenAnswers["team_id"] = $("#teamSelectList").val();
	screenAnswers["team_proj_ops"] = $("#teamTypeSelectList").val();
	screenAnswers["team_dlvr_software"] = $("#softwareYesNo").val();
	screenAnswers["self-assessmt_dt"] = showDateYYYYMMDDTS($("#assessmentDate").val());
	screenAnswers["assessmt_cmpnt_rslts"] = [];

	var opsExist = false;
	$("#assessmentContainer > ul > li > a").each(function() {
		if (($(this).html().toLowerCase().indexOf("ops") > -1) ||  ($(this).html().toLowerCase().indexOf("operations") > -1)) {
			opsExist = true;
		}
	});

	var actionItemsList = [];
	for (var i=0; i<assessments.length; i++) {
		var eleAtmaId = eleVersionId + "_" + i;
		var eleMainPrincipleId = eleAtmaId + "_prin";

		console.log(assessments[i]["atma_name"]);

		if (assessments[i]["atma_name"] != null && assessments[i]["atma_name"].toLowerCase().indexOf("leadership") > -1) {
			if (opsExist) {
				if ($("#teamTypeSelectList option:selected").val().toLowerCase() == "operations") {
					if ((assessments[i]["atma_name"].toLowerCase().indexOf("leadership") > -1 && assessments[i]["atma_name"].toLowerCase().indexOf("ops") == -1)
							&& (assessments[i]["atma_name"].toLowerCase().indexOf("leadership") > -1 && assessments[i]["atma_name"].toLowerCase().indexOf("operations") == -1)) {
							//alert("skip: " +assessments[i]["atma_name"]);
							continue;
					}
				} else if ((assessments[i]["atma_name"].toLowerCase().indexOf("ops") > -1) || (assessments[i]["atma_name"].toLowerCase().indexOf("operations") > -1)) {
					//alert("skip: " +assessments[i]["atma_name"]);
					continue;
				}
			}
		}


		if (assessments[i]["atma_name"] != null && assessments[i]["atma_name"].toLowerCase().indexOf("delivery") > -1) {
			if ($("#softwareYesNo option:selected").val().toLowerCase() == "no") {
				//alert("skip: " +assessments[i]["atma_name"]);
				continue;
			}
		}

		var assessmentName = new Object();
		assessmentName["assessed_cmpnt_name"] = assessments[i]["atma_name"];
		assessmentName["assessed_cmpnt_tbl"] = [];

		var principles = assessments[i]["principle_tbl"];
		var totalCurrentScore = 0;
		var totalTargetScore = 0;
		var totalPractices = 0;
		for (var j=0; j<principles.length; j++) {
			var principleName = principles[j]["principle_name"];
			var principleId = principles[j]["principle_id"];
			var elePrincipleId = eleMainPrincipleId + "_" + principles[j]["principle_id"];

			var practices = principles[j]["practice_tbl"];
			for (var k=0; k<practices.length; k++) {
				totalPractices += 1;
				var eleMainPracticeId = elePrincipleId + "_prac";
				var elePracticeId = eleMainPracticeId + "_" + practices[k]["practice_id"];

				var practiceName = practices[k]["practice_name"];
				var practiceId = practices[k]["practice_id"];

				var current = "";
				var target = "";
				var independent = "";
				if ($("[name='"+elePracticeId+"_curr']:checked").length > 0)
					current = $("[name='"+elePracticeId+"_curr']:checked").attr("value");
				if ($("[name='"+elePracticeId+"_targ']:checked").length > 0)
					target = $("[name='"+elePracticeId+"_targ']:checked").attr("value");
				if ($("[name='"+elePracticeId+"_ind']:checked").length > 0)
					independent = $("[name='"+elePracticeId+"_ind']:checked").attr("value");

				var currentScore = 0;
				var targetScore = 0;
				var independentScore = 0;
				var criteria = practices[k]["mat_criteria_tbl"];
				for (var x=0; x<criteria.length; x++) {
					if (criteria[x]["mat_lvl_name"].toLowerCase() == current.toLowerCase())
						currentScore = isNaN(parseInt(criteria[x]["mat_lvl_score"])) ? 0 : parseInt(criteria[x]["mat_lvl_score"]);
					if (criteria[x]["mat_lvl_name"].toLowerCase() == target.toLowerCase())
						targetScore = isNaN(parseInt(criteria[x]["mat_lvl_score"])) ? 0 : parseInt(criteria[x]["mat_lvl_score"]);
					if (criteria[x]["mat_lvl_name"].toLowerCase() == independent.toLowerCase())
						independentScore = isNaN(parseInt(criteria[x]["mat_lvl_score"])) ? 0 : parseInt(criteria[x]["mat_lvl_score"]);
				}
				totalCurrentScore += currentScore;
				totalTargetScore += targetScore;

				var practiceAnswers = new Object();
				practiceAnswers["principle_id"] = principleId;
				practiceAnswers["principle_name"] = principleName;
				practiceAnswers["practice_id"] = practiceId;
				practiceAnswers["practice_name"] = practiceName;
				practiceAnswers["cur_mat_lvl_achieved"] = current;
				practiceAnswers["cur_mat_lvl_score"] = currentScore;
				practiceAnswers["tar_mat_lvl_achieved"] = target;
				practiceAnswers["tar_mat_lvl_score"] = targetScore;
				practiceAnswers["ind_mat_lvl_achieved"] = independent;
				practiceAnswers["ind_target_mat_lvl_score"] = independentScore;
				practiceAnswers["how_better_action_item"] = $("#"+elePracticeId+"_action").val();
				practiceAnswers["ind_assessor_cmnt"] =  $("#"+elePracticeId+"_comment").val();
				assessmentName["assessed_cmpnt_tbl"].push(practiceAnswers);

				if ($("#"+elePracticeId+"_action").val() != null && $("#"+elePracticeId+"_action").val() != "") {
					var actionItems = new Object();
					actionItems["action_plan_entry_id"] = (actionItemsList.length).toString();
					actionItems["user_created"] = "No";
					actionItems["assessmt_cmpnt_name"] = assessments[i]["atma_name"];
					actionItems["principle_id"] = principleId;
					actionItems["principle_name"] = principleName;
					actionItems["practice_id"] = practiceId;
					actionItems["practice_name"] = practiceName;
					actionItems["how_better_action_item"] = $("#"+elePracticeId+"_action").val();
					actionItems["cur_mat_lvl_score"] = currentScore;
					actionItems["tar_mat_lvl_score"] = targetScore;
					// these fields get populated on progress screen
					actionItems["progress_summ"] = "";
					actionItems["key_metric"] = "";
					actionItems["review_dt"] = "";
					// default status is Open, can be changed on progress screen
					actionItems["action_item_status"] = "Open";
					actionItemsList.push(actionItems);
				}
			}

		}
		//alert (totalCurrentScore +  " " + totalTargetScore + " " + practices.length);
		if (totalPractices > 0) {
			assessmentName["ovralcur_assessmt_score"] = (totalCurrentScore / totalPractices).toFixed(1);
			assessmentName["ovraltar_assessmt_score"] = (totalTargetScore / totalPractices).toFixed(1);
		} else {
			assessmentName["ovralcur_assessmt_score"] = 0;
			assessmentName["ovraltar_assessmt_score"] = 0;
		}

		screenAnswers["assessmt_cmpnt_rslts"].push(assessmentName);

	}
	screenAnswers["assessmt_action_plan_tbl"] = actionItemsList;

	return screenAnswers;
}

function getAssessmentStatus(teamAssessment) {
	if (teamAssessment == null)
		return "Draft";

	if (teamAssessment["assessmt_status"] != null && teamAssessment["assessmt_status"].toLowerCase() == "submitted") {
		if (teamAssessment["ind_assessor_id"] != null && teamAssessment["ind_assessor_id"] != ""
			&& teamAssessment["ind_assessmt_dt"] != null && teamAssessment["ind_assessmt_dt"] == "")
			return "Independent Review";
		else if (teamAssessment["ind_assessor_id"] != null && teamAssessment["ind_assessor_id"] != ""
			&& teamAssessment["ind_assessmt_dt"] != null && teamAssessment["ind_assessmt_dt"] != "")
			return "Submitted and Reviewed";
		else
			return "Submitted";

	} else {
		return "Draft";

	}
}

function isReviewer(teamAssessment) {
	var user = _.isEmpty(userInfo) ? "" : userInfo.email;
	return (teamAssessment["ind_assessor_id"] != null && (teamAssessment["ind_assessor_id"].toLowerCase() == user || isAdmin()));

}

function isInactiveTemplate(version) {
	var inactive = false;
	if (gAssessmentTemplateList != null) {
		for (var i=0; i<gAssessmentTemplateList.length; i++) {
			var template = gAssessmentTemplateList[i];
			if (template["atma_version"] == version || template["_id"] == version)
				inactive = (template["atma_status"] != null && template["atma_status"].toLowerCase() == "inactive");
		}
	}
	return inactive;
}

function setScreenControls() {
	var allowAccess = hasAccess($("#teamSelectList option:selected").val());
	displayEditStatus(false);

	setProgressLink($("#teamSelectList option:selected").val(), $("#assessmentSelectList option:selected").val());

	if (($("#teamSelectList option:selected").val() != "") && $("#assessmentSelectList option:selected").val() == "new") {
		if (allowAccess) {
			$("input[type='button']").each(function () {
				$(this).show();
				$(this).removeAttr("disabled");
			});
		}

		$("#softwareYesNo").val("Yes"); // default value
		$("#softwareYesNo").trigger("change");

		$("#teamTypeSelectList").val("Project"); // default value
		$("#teamTypeSelectList").trigger("change");
		$("#assessmentDate").val("");
	}

	if (gTeamAssessment == null) {
		$("#assessmentContainer input[type='radio'], #assessmentContainer textarea[id*='_action'], #assessmentContainer textarea[id*='_comment']").each(function() {
			$(this).attr("disabled", "disabled");
		});
		$("#softwareYesNo").removeAttr("disabled");
		$("input[type='button']").each(function () {
			$(this).show();
			$(this).attr("disabled", "disabled");
		});
		$("#softwareYesNo").val("Yes"); // default value
		$("#softwareYesNo").trigger("change");
		$("#softwareYesNo").attr("disabled", "disabled");

		$("#teamTypeSelectList").val("Project"); // default value
		$("#teamTypeSelectList").trigger("change");
		$("#teamTypeSelectList").attr("disabled", "disabled");
		$("#assessmentDate").attr("disabled", "disabled");
		$($("#assessmentForm > p[class='ibm-btn-row']")[1]).attr("style","display: none");

		if (!allowAccess && ($("#teamSelectList option:selected").val() != ""))
			displayEditStatus(true);

		$("#assessmentStatus").hide();


	} else {
		if(gTeamAssessment["self-assessmt_dt"] != undefined && gTeamAssessment["self-assessmt_dt"].length > 0){
			$("#assessmentDate").val(formatDDMMMYYYY(gTeamAssessment["self-assessmt_dt"]));
		}else{
			$("#assessmentDate").val(gTeamAssessment["self-assessmt_dt"]);
		}

		var hasDeliveryAssessment = gTeamAssessment["team_dlvr_software"] != null && gTeamAssessment["team_dlvr_software"].toLowerCase() == "yes";
		//var hasOperationAssessment = gTeamAssessment["team_proj_ops"] != null && gTeamAssessment["team_proj_ops"].toLowerCase() == "operations";

		if (getAssessmentStatus(gTeamAssessment).toLowerCase() != "draft") {
			$("#assessmentContainer input[type='radio'], #assessmentContainer textarea").each(function() {
				if (($(this).attr("name") != null && $(this).attr("name") != "" && $(this).attr("name").indexOf("_ind") == -1)
						|| ($(this).attr("id") != null && $(this).attr("id") != "" && $(this).attr("id").indexOf("_comment") == -1)) {// disable non independent related input
					$(this).attr("disabled", "disabled");
				} else if (getAssessmentStatus(gTeamAssessment).toLowerCase() == "submitted and reviewed") {
					$(this).attr("disabled", "disabled");
				} else if (isReviewer(gTeamAssessment)
						&& getAssessmentStatus(gTeamAssessment).toLowerCase() == "independent review") {
					$(this).removeAttr("disabled");
				}
			});
			if (hasDeliveryAssessment) {
				$("#softwareYesNo").val("Yes");
			} else {
				$("#softwareYesNo").val("No");
			}
			$("#softwareYesNo").trigger("change");
			$("#softwareYesNo").attr("disabled", "disabled");

			if (gTeamAssessment["team_proj_ops"] == null || gTeamAssessment["team_proj_ops"] == "" || gTeamAssessment["team_proj_ops"].toLowerCase() == "project") {
				$("#teamTypeSelectList").val("Project");
			} else {
				$("#teamTypeSelectList").val("Operations");
			}
			$("#teamTypeSelectList").trigger("change");
			$("#teamTypeSelectList").attr("disabled", "disabled");

			$("#assessmentDate").attr("disabled", "disabled");
			if (isReviewer(gTeamAssessment) && getAssessmentStatus(gTeamAssessment).toLowerCase() == "independent review") {
				$("input[type='button']").each(function () {
					if ($(this).attr("value").toLowerCase() == "delete draft") {
						$(this).hide();
						$(this).attr("disabled", "disabled");
					} else {
						$(this).show();
						$(this).removeAttr("disabled");
					}

				});
			} else {
				$("input[type='button']").each(function () {
					if (getAssessmentStatus(gTeamAssessment).toLowerCase() == "submitted and reviewed")
						$(this).hide();
					else if ($(this).attr("value").toLowerCase() == "delete draft")
						$(this).hide();

					$(this).attr("disabled", "disabled");
				});

				if (!allowAccess && !isReviewer(gTeamAssessment) && ($("#teamSelectList option:selected").val() != ""))
					displayEditStatus(true);
			}

		} else {
			$("#assessmentContainer input[type='radio'], #assessmentContainer textarea").each(function() {
				if (($(this).attr("name") != null && $(this).attr("name") != "" && $(this).attr("name").indexOf("_ind") > -1)
					|| ($(this).attr("id") != null && $(this).attr("id") != "" && $(this).attr("id").indexOf("_comment") > -1))  // disable independent related input
					$(this).attr("disabled", "disabled");
				else
					if (allowAccess) {
						$(this).removeAttr("disabled");
					} else {
						$(this).attr("disabled", "disabled");
						displayEditStatus(true);
					}
			});
			if (hasDeliveryAssessment) {
				$("#softwareYesNo").val("Yes");
			} else {
				$("#softwareYesNo").val("No");
			}
			$("#softwareYesNo").trigger("change");

			if (gTeamAssessment["team_proj_ops"] == null || gTeamAssessment["team_proj_ops"] == "" || gTeamAssessment["team_proj_ops"].toLowerCase() == "project") {
				$("#teamTypeSelectList").val("Project");
			} else {
				$("#teamTypeSelectList").val("Operations");
			}
			$("#teamTypeSelectList").trigger("change");

			if (allowAccess) {
				//if (isInactiveTemplate(gTeamAssessment["assessmt_version"]))
				//	showMessagePopup("This draft assessment was created using questionnaires from a template that was already deactivated.  You need to delete or submit this assessment before a new assessment can be initiated using the latest questionnaire.");
				$("#softwareYesNo").removeAttr("disabled");
				$("#teamTypeSelectList").removeAttr("disabled");
				$("#assessmentDate").removeAttr("disabled");
				$("input[type='button']").each(function () {
					if ($(this).attr("value").toLowerCase() == "delete draft") {
						$(this).show();
						if (gTeamAssessment["assessmt_status"] != "")
							$(this).removeAttr("disabled");
						else
							$(this).attr("disabled", "disabled");

					} else {
						$(this).show();
						$(this).removeAttr("disabled");
					}
				});

			} else {
				$("input[type='button']").each(function () {
					$(this).attr("disabled", "disabled");
				});

				displayEditStatus(true);

			}

		}
		$($("#assessmentForm > p[class='ibm-btn-row']")[1]).attr("style","text-align: right;");

		var teamStatus = "";
		var reviewStatus = "";
		if (gTeamAssessment["assessmt_status"] != null) {
			if (gTeamAssessment["assessmt_status"] == null || gTeamAssessment["assessmt_status"] == "") {
				teamStatus = ""; //"Team assessment: <span>Ready to start</span>";
			} else if (gTeamAssessment["assessmt_status"].toLowerCase() != "submitted") {
				teamStatus = "Team assessment status: <span>" + gTeamAssessment["assessmt_status"] + "</span>";
			} else {
				teamStatus = "Team assessment status: <span>" + gTeamAssessment["assessmt_status"] + "</span>";
			}

			if (gTeamAssessment["assessmt_status"].toLowerCase() == "submitted" &&
					(gTeamAssessment["ind_assessor_id"] != null && gTeamAssessment["ind_assessor_id"] != "")) {
				if (gTeamAssessment["ind_assessmt_status"] == null || gTeamAssessment["ind_assessmt_status"] == "") {
					reviewStatus = ""; //"Independent review: <span>Ready to start</span>";
				} else if (gTeamAssessment["ind_assessmt_status"].toLowerCase() != "submitted") {
					reviewStatus = "Independent assessment status: <span>" + gTeamAssessment["ind_assessmt_status"] + "</span>";
				} else {
					reviewStatus = "Independent assessment status: <span>" + gTeamAssessment["ind_assessmt_status"] + "</span>"
						+ "Independent assessment date: <span>" + showDateDDMMMYYYY(gTeamAssessment["ind_assessmt_dt"].split(" ")[0]) + "</span>";
				}
			}
		}

		$("#assessmentStatus").html(teamStatus + (reviewStatus == "" ? "" : "<br>"+reviewStatus));
		$("#assessmentStatus").show();

	}

	resetChangeIndiactor();
}

function validationHandler(errors){
	var unfilled = false;
	var otherMsg = '';
	var defaultMsg = '';
	if (_.isObject(errors)){
	_.each(errors, function(err, attr){
		if (attr != null && attr.contains('mat_lvl_achieved')){
			unfilled = true;
			defaultMsg = err;
		}else{
			otherMsg += err + '<br>';
		}
	});
}
else{
	defaultMsg = errors;
}
	$("input[type='button']").each(function () {
		$(this).removeAttr("disabled");
	});

	if (unfilled){
		highlightFields();
	}

	if (!_.isEmpty(otherMsg)){
		defaultMsg += '<br>'+ otherMsg;
	}

	if (!_.isEmpty(defaultMsg)){
		showMessagePopup(defaultMsg);
	}
}

function highlightFields(){
	var leadershipID = "";
		// look for projects section if presented and store prefix id of children elements
		$("#assessmentContainer > ul > li > a").each(function() {
			if (($(this).html().toLowerCase().indexOf("leadership") > -1 &&
					$(this).html().toLowerCase().indexOf("ops") == -1) &&
					($(this).html().toLowerCase().indexOf("leadership") > -1 &&
					$(this).html().toLowerCase().indexOf("operations") == -1)) {
				leadershipID = $(this).parent().attr("id");
			}
		});

		var deliveryID = "";
		var includeDelivery = $("#softwareYesNo option:selected").val().toLowerCase() == "yes";
		// look for delivery section if presented and store prefix id of children elements
		$("#assessmentContainer > ul > li > a").each(function() {
			if ($(this).html().toLowerCase().indexOf("delivery") > -1) {
				deliveryID = $(this).parent().attr("id");
			}
		});

		var isOperations = false;
		var operationsID = "";
		var opsExist = false;
		// look for operations section if presented in the template
		$("#assessmentContainer > ul > li > a").each(function() {
			if (($(this).html().toLowerCase().indexOf("ops") > -1) || ($(this).html().toLowerCase().indexOf("operations") > -1)) {
				opsExist = true;
			}
		});
		if (opsExist) {
			isOperations = $("#teamTypeSelectList option:selected").val().toLowerCase() == "operations";
			// look for operations section if presented and store prefix id of children elements
			$("#assessmentContainer > ul > li > a").each(function() {
				if (($(this).html().toLowerCase().indexOf("leadership") > -1 &&
						$(this).html().toLowerCase().indexOf("ops") > -1) ||
						($(this).html().toLowerCase().indexOf("leadership") > -1 &&
						$(this).html().toLowerCase().indexOf("operations") > -1)) {
					operationsID = $(this).parent().attr("id");
				}
			});
  	}

		var currStatus = getAssessmentStatus(gTeamAssessment).toLowerCase();
		if (currStatus == "submitted" || currStatus == "draft") {
			$("#assessmentContainer li[id*='_prac']").each(function() {
				var answers = this.id;
				// query for section unanswered practices
				var thisSectionComplete = true;
				if ($("[name*='"+answers+"_curr']:checked").length == 0 || $("[name*='"+answers+"_targ']:checked").length == 0) {
					if (opsExist) {
						if (answers.indexOf(leadershipID) > -1 && isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(operationsID) > -1 && !isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
					} else {
						if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
					}
					if (!thisSectionComplete) {
						$("#"+answers+" > a").attr("style", "background: yellow");
					}
				}
			});
		} else if (getAssessmentStatus(gTeamAssessment).toLowerCase() == "independent review") {
			$("#assessmentContainer li[id*='_prac']").each(function() {
				var answers = this.id;
				// query for section unanswered practices
				var thisSectionComplete = true;
				if ($("[name*='"+answers+"_ind']:checked").length == 0) {
					if (opsExist) {
						if (answers.indexOf(leadershipID) > -1 && isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(operationsID) > -1 && !isOperations) {
							thisSectionComplete = true;
						} else if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
						if (!thisSectionComplete) {
							$("#"+answers+" > a").attr("style", "background: yellow");
						}
					} else {
						if (answers.indexOf(deliveryID) > -1 && !includeDelivery) {
							thisSectionComplete = true;
						} else {
							thisSectionComplete = false;
						}
					}
				}
			});
		}
}
