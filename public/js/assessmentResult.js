var team = null;
var assessmentData = [];
var hasIndAssessment = false;
var selAssessment;
var principles = [];

var teamId = '';
var assessId = '';
jQuery(function($) {
  $(document).ready(function() {
    var urlParameters = getJsonParametersFromUrl();
    if (urlParameters != undefined) {
      teamId = urlParameters.id;
      assessId = urlParameters.assessId;
      if (teamId != undefined && assessId != undefined) {
        retrieveAssessmentResult(teamId, assessId);
        setAssessmentLink(teamId, assessId);
      }
    }
    if (urlParameters != undefined && urlParameters.testUser != undefined) {
			resetUser(urlParameters.testUser);
			alert("here TestUser is: " + urlParameters.testUser);
		}
  });
});

function setIndAssessor(assessor){
	$("#indAssessor").text(assessor);
}

function setAssessHeader(index, assessName){
	$("#assessId_"+ index+ " a").text($("#assessId_"+ index+ " a").text()+ ' '+assessName);
}

function loadActionPlan(data){
	var row = "<tr>";
	row = row + "<td>" + data.get_better_action_item + "</td>";
	row = row + "<td>" + data.principle_name + "</td>";
	row = row + "<td>" + data.practice_name + "</td>";
	row = row + "<td>" + data.tar_mat_lvl_score + "</td>";
	row = row + "<td>" + data.cur_mat_lvl_score + "</td>";
	row = row + "<td>" + data.progress_summ + "</td>";
	row = row + "<td>" + data.key_metric + "</td>";
	row = row + "<td>" + data.review_dt + "</td>";
	row = row + "<td>" + data.action_item_status + "</td>";
	row = row + "</tr>";
	$("#actionPlan").append(row);
}

function loadHeader(teamName, assessDate, status, indDate, indstatus){
	$("#teamName").text(teamName);
	$("#assessmentDt").text(showDateDDMMMYYYY(assessDate));
	$("#selfStatus").text(status);
	if ($("#indAssessor").text() != ""){
		$("#indDt").text(showDateDDMMMYYYY(indDate));
		$("#indStatus").text(indstatus);
	}
	else{
		$("#indAssmtStat").remove();
		$("#indAssmtDt").remove();
	}
}

function updateAssessorInfo(action) {
	if (action == "clear") {
		taPerson = null;
		loadAgileRoles();
		$("#indAssessorName").val(""); clearFieldErrorHighlight("indAssessorName");
		return;
	}	

	if (action == "add") {
		var hasError = false;
		if (taPerson == undefined || $("#indAssessorName").val() == "") {
			setFieldErrorHighlight("indAssessorName");
			dialogPopup ("Unable to retrieve information from Faces for the member indicated.  Please try the selection again.");
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
	
	if (action == "add") {
		assignAssessor();
	}
}

function assignAssessor(){
	$("#indAssessorName").val(taPerson["notes-id"]);
	clearFieldErrorHighlight("indAssessorName");
}

function setAssessor(){
	$("#indAssessorName").change(function () {
		if ($("#indAssessorName").val() == "")
			taPerson = null;
		else if (taPerson != undefined && $("#indAssessorName").val() != taPerson["notes-id"])
			taPerson = null;
		
		if (taPerson != null)
		  clearFieldErrorHighlight("indAssessorName");
	});
	$("#indAssessorName").blur(function () {
		if (taPerson != null)
			clearFieldErrorHighlight("indAssessorName");
	});
}

function retrieveAssessmentResult(teamId, assessId){
	teamListHandler(teamId, assessId, allTeams);
}

function teamListHandler(teamId, assessId, teamList) {
	team = allTeamsLookup[teamId];
	getTeamAssessments(teamId, processData, [teamId, assessId]);
}

function getSummaryData(teamId, assessId){
	$.ajax({
			type:     "GET",
			url : baseUrlDb + "/_design/agile/_view/maturityAssessmentResult",
			data: {"key":"\""+encodeURIComponent(teamId)+"\""},
			dataType: "jsonp"
		}).done (function(data) {
			getTeamAssessments(teamId, processData, [teamId, assessId]);
	});
}

function processData(teamId, assessId, jsonData){
	jsonData = sortAssessments(jsonData);
	var filtered = filterSubmitted(jsonData, teamId, assessId);
	filtered.reverse();
	displaySelected(filtered);
}

function displayOverAll(id, ovralcur_assessmt_score, ovraltar_assessmt_score, assessed_index){
	loadDefaultChart(id, assessed_index);
	loadOverAll(id, ovraltar_assessmt_score, ovralcur_assessmt_score, assessed_index);		
}

function loadOverAll(id, ovralctar_assessmt_score, ovralcur_assessmt_score, assessed_index){
	var graphId='';
	var label = "Overall";
	if (id == 'resultBody'){
		graphId = 'container';
	}
	else if (id == 'deliveryResult'){
		graphId = 'deliveryContainer';
	}
		var link = "<a role='button' onclick=displaySelectedChart(" +assessed_index+","+"'"+label+ "'"+","+graphId+") style='cursor: pointer;'>" + 
					'Overall'  + "</a>";
		row = "<tr> <td> "+ link + "</td>";
		row += "<td>" + (ovralcur_assessmt_score != "" && ovralcur_assessmt_score != undefined? ovralcur_assessmt_score:"-")+ "</td>";
		row += "<td>" + (ovralctar_assessmt_score != "" && ovralctar_assessmt_score != undefined? ovralctar_assessmt_score:"-")+ "</td>";
		if (hasIndAssessment){
			row += "<td>" + "-"+ "</td>";
		}
		row = row + "</tr>";
		$("#"+id).append(row);
}

function removeIndAssessment(){
	if (!hasIndAssessment){
		$("#colContainer").find("#resultIndAsses").remove();
		$("#delContainer").find("#deliveryIndAsses").remove();
	}
}

function loadResult(id, result, assessed_index){
	var graphId='';
	if (id == 'resultBody'){
		graphId = 'container';
	}
	else if (id == 'deliveryResult'){
		graphId = 'deliveryContainer';
	}
		var link = "<a role='button' onclick=displaySelectedChart(" +assessed_index+ ","+result.practice_id+ "," +graphId+")  style='cursor: pointer;'>" + 
					result.practice_name + "</a>";
		row = "<tr> <td> "+ link + "</td>";
		row += "<td>" + (result.cur_mat_lvl_score != ""? result.cur_mat_lvl_score:"-")+ "</td>";
		row += "<td>" + (result.tar_mat_lvl_score != ""? result.tar_mat_lvl_score:"-")+ "</td>";
		if (hasIndAssessment){
			row += "<td>" + result.ind_target_mat_lvl_score + "</td>";
		}
		
		row = row + "</tr>";
		$("#"+id).append(row);
}
	
function loadDefaultChart(id, index){
	var label = "Overall";
	var graphId='';
	if (id == 'resultBody'){
		graphId = 'container';
	}
	else if (id == 'deliveryResult'){
		graphId = 'deliveryContainer';
	}
	displaySelectedChart(index,label,graphId);
}

function displaySelectedChart(assessed_index, id, elementId) {
	var chartData = new Object();
	var title;
	if (id == 'Overall'){
		var ave = getOverAllRawData(assessed_index);
		chartData = plotOverAll(ave);
		title = id;
	}
	else{
		cat = getAssessedData(assessed_index, id);
		chartData = getChartData(cat);
		title = getPracticeName(assessed_index, id);
	}
	var assessments = [];
	if (hasIndAssessment){
		assessments = [ {
			name : 'Target',
			data : chartData.target_score,
		}, {
			name : 'Current',
			data : chartData.current_score,
		}, {
			name : 'Independent',
			data : chartData.ind_score,
		} ];
	}
	else{
		assessments = [ {
			name : 'Target',
			data : chartData.target_score,
		}, {
			name : 'Current',
			data : chartData.current_score,
		} ];
	}
	
	
	loadResultChart(elementId, title, 'line', chartData.categories, 'Maturity Level', assessments,
			null, "Select practice from adjacent table to see the results."); 
}

function getChartData(data){
	var result = new Object();
	if (data != null){
		result.categories = [];
		result.target_score = [null];
		result.current_score = [null];
		result.ind_score = [null];
		for (var x=0; x<data.length;x++){
			var date = data[x].self_assessmt_dt;
			result.categories[x] = showDateDDMMMYYYY(date.substring(0,date.indexOf(" ")));
			for (var y=0; y<data[x].assessed.length;y++){
				if (data[x].assessed[y].tar_mat_lvl_score != ""){
					result.target_score[x]=parseInt(data[x].assessed[y].tar_mat_lvl_score);
				}
				else{
					result.target_score[x]=null;
				}
				if(data[x].assessed[y].cur_mat_lvl_score != ""){
					result.current_score[x]=parseInt(data[x].assessed[y].cur_mat_lvl_score);
				}
				else{
					result.current_score[x]=null;
				}
				if (data[x].assessed[y].ind_target_mat_lvl_score != ""){
					result.ind_score[x]=parseInt(data[x].assessed[y].ind_target_mat_lvl_score);
				}
				else{
					result.ind_score[x]=null;
				}
			}
		}
	}
	return result;
}

function plotOverAll(data){
	var result = new Object();
	if (data != null){
		result.categories = [];
		result.target_score = [];
		result.current_score = [];
		result.ind_score = [];
		for (var x=0; x<data.length;x++){
			var date = data[x].self_assessmt_dt;
			result.categories[x] = showDateDDMMMYYYY(date.substring(0,date.indexOf(" ")));
			if (data[x].assessed.ovraltar_assessmt_score != null){
				result.target_score[x]=data[x].assessed.ovraltar_assessmt_score;
			}
			else{
				result.target_score[x]=0;
			}
			if (data[x].assessed.ovralcur_assessmt_score != null){
				result.current_score[x]=data[x].assessed.ovralcur_assessmt_score;
			}
			else{
				result.current_score[x]=0;
			}
		}
	}
	return result;
}

function getOverAllRawData(assessed_index){
	var result = [];
	for (var i=0; i<assessmentData.length;i++){
		var obj = new Object();
		obj.self_assessmt_dt = assessmentData[i]["self-assessmt_dt"];
		var assessmt_cmpnt = assessmentData[i].assessmt_cmpnt_rslts[assessed_index];
		obj.assessed = new Object;
		if (assessmt_cmpnt != null){
			if (assessmt_cmpnt.ovraltar_assessmt_score != undefined)
				obj.assessed.ovraltar_assessmt_score = parseFloat(assessmt_cmpnt.ovraltar_assessmt_score);
			if (assessmt_cmpnt.ovralcur_assessmt_score != undefined)
				obj.assessed.ovralcur_assessmt_score = parseFloat(assessmt_cmpnt.ovralcur_assessmt_score);
		}
		result.push(obj);
	}
	return result;
}

function getAssessedData(assessed_index,practice_id){
	var result=[];
	for (var i=0; i<assessmentData.length;i++){
		var obj = new Object();
		obj.self_assessmt_dt = assessmentData[i]["self-assessmt_dt"];
		var assessmt_cmpnt = assessmentData[i].assessmt_cmpnt_rslts[assessed_index];
		obj.assessed = [];
		if (assessmt_cmpnt != null){
			for (var x=0;x<assessmt_cmpnt.assessed_cmpnt_tbl.length;x++){
				var assessed_cmpnt_tbl = assessmt_cmpnt.assessed_cmpnt_tbl[x];
				if (assessed_cmpnt_tbl != null){
					if (assessed_cmpnt_tbl.practice_id == practice_id){
						obj.assessed[0] = assessed_cmpnt_tbl;
						break;
					}
				}
			}
		}
		result.push(obj);
	}
	return result;
}

function getPracticeName(assessed_index, practice_id){
	var result="";
	for (var i=0; i<assessmentData.length;i++){
		var assessmt_cmpnt = assessmentData[i].assessmt_cmpnt_rslts[assessed_index];
		if (assessmt_cmpnt != null){
			for (var x=0;x<assessmt_cmpnt.assessed_cmpnt_tbl.length;x++){
				var assessed_cmpnt_tbl = assessmt_cmpnt.assessed_cmpnt_tbl[x];
				if (assessed_cmpnt_tbl != null){
					if (assessed_cmpnt_tbl.practice_id == practice_id){
						result = assessed_cmpnt_tbl.practice_name;
						break;
					}
				}
			}
		}
	}
	return result;
}

function setAssessmentLink(teamId, assessId) {
	var assessmentPage = "assessment";
	if (teamId != "" && assessId != "") {
		assessmentPage = assessmentPage + "?id=" + teamId;
		assessmentPage = assessmentPage + "&assessId=" + assessId;
		$("#assessmentLink").attr("href", assessmentPage);
		
	} else {
		$("#assessmentLink").attr("href", assessmentPage);
		
	}
}

function hasDevOps(team_dlvr_software){
	if (team_dlvr_software == "No"){
		$("#delContainer").remove();
	}
}

function replaceEmpty(input){
	var result = "";
	if (input != undefined && input != null){
		result = input;
	}
	return result;
}

function displayActionPlan(data){
	var allowEdit = "disabled";
	if (hasAccess(teamId, true)){
		allowEdit = "";
	}
	for (var index=0; index<data.length;index++){
		var row = "<tr id = 'action_"+index+"'>";
		var userCreated = data[index].user_created;
		if (data[index] != undefined && data[index] != ""){
			if (userCreated != undefined && userCreated.toLowerCase() == "yes"){
				row = row + "<td>" + "<input name='	"+index+"' aria-label='Select action' id='select_item_"+index+"' type='checkbox' onclick='deleteBtnControl()' "+allowEdit+"/> </td>" ;
				row = row + "<td id='td_practice_"+index+"' >"  +"<span> <select aria-label='Practice list' id='practice_"+index+"' name='practice_"+index+"'  style='width: 120px; font-size: 11px;' onchange='prepopulate("+index+")' "+allowEdit+"> " +
				"</select></span></td>";
			}
			else{
				row = row + "<td style='min-width: 15px;'>" + "&nbsp;" + "</td>";
				row = row + "<td id='td_practice_"+index+"' style='width: 120px;'>"  + replaceEmpty(data[index].practice_name) + "</td>";
			}
			
			row = row + "<td id='td_principle_"+index+"' style='min-width: 120px;'>"  + replaceEmpty(data[index].principle_name) + "</td>";
			row = row + "<td id='td_curScore_"+index+"'>"  + replaceEmpty(data[index].cur_mat_lvl_score) + "</td>";
			row = row + "<td id='td_tarScore_"+index+"'>"  + replaceEmpty(data[index].tar_mat_lvl_score) + "</td>";
			if (userCreated != undefined && userCreated.toLowerCase() == "yes"){
				row = row + "<td>" + "<span><textarea aria-label='Action item' id='action_item_"+index+"' maxlength = '350' cols='28' style='resize: none; font-size: 11px;' type='text' name='action_item_"+index+"' "+allowEdit+">"+replaceEmpty(data[index].how_better_action_item)+"</textarea></span> </td>";
			}
			else{
				row = row + "<td>" + "<span><textarea aria-label='Action item' id='action_item_"+index+"' maxlength = '350' cols='28' style='resize: none; font-size: 11px;' type='text' name='action_item_"+index+"' disabled>"+replaceEmpty(data[index].how_better_action_item)+"</textarea></span> </td>";
			}
			row = row + "<td>"  +"<span><textarea aria-label='Progress summary' id='summary_"+index+"' maxlength = '350' type='text' name='summary_"+index+"' cols='28' style='resize: none; font-size: 11px;' "+allowEdit+">"+ replaceEmpty(data[index].progress_summ)+"</textarea></span> </td>";
			row = row + "<td>"  + "<span><textarea aria-label='Key metric' id='metric_"+index+"' maxlength = '350' type='text' name='metric_"+index+"' cols='28' style='resize: none; font-size: 11px;' "+allowEdit+">"+replaceEmpty(data[index].key_metric)+"</textarea></span> </td>";
			row = row + "<td>"  + "<span><input aria-label='Review date' id='revDate_"+index+"' class='ibm-date-picker' style='width: 80px; font-size: 11px;' type='text' value='"+replaceEmpty(data[index].review_dt)+"' name=''revDate_"+index+"' "+allowEdit+"> </span>"+"</td>";
			row = row + "<td id='td_status_"+index+"'>"  +"<span> <select aria-label='Action status' id='status_"+index+"' name='status_"+index+"' "+allowEdit+" style='font-size: 11px; width: 80px;'> " +
			"</select></span></td>";
		}
		row = row + "</tr>";
		$("#actionPlan").append(row);
		jQuery("#revDate_"+index).datepicker();
		addActionStatusList(data[index].action_item_status, index);
		if (userCreated != undefined && userCreated.toLowerCase() == "yes"){
			addActionPracticeList(index,data[index].practice_name);
		}
		if (allowEdit == "disabled"){
			$("#status_"+index).css('color', 'grey');
		}
	
	}
}

function addActionStatusList(action_item_status, index){
	var statusList = ["Open","In-progress","Closed"];
	for (var i=0; i<statusList.length; i++) {
        var option = "";
        if (statusList[i] == action_item_status) {
        	option = "<option value='"+statusList[i]+"' selected='selected'>"+statusList[i]+"</option>";
        }
        else{
        	option = "<option value=\""+statusList[i]+"\">"+statusList[i]+"</option>";
        }
        $("#status_"+index).append(option);
    }
}

function addActionPracticeList(index, practice){
	var practicesList = retrievePractices();
	for (var i=0; i<practicesList.length; i++) {
	  if (practicesList[i].practice_name == practice) {
  		option = "<option value='"+practicesList[i].index+"' selected='selected'>"+practicesList[i].practice_name+"</option>";
	  } else {
	  	option = "<option value=\""+practicesList[i].index+"\">"+practicesList[i].practice_name+"</option>";
	  }
  	$("#practice_"+index).append(option);
  }
}

function addEmptyRow(index){
	$("#saveActPlanBtn").attr("disabled","disabled");
	var index = $('#actionPlan > tr').length;
	var row = "<tr id = 'td_action_"+index+"'>";
	row = row + "<td style='max-width: 15px;'>" + "<input name='select_item_"+index+"' aria-label='Select action' id='select_item_"+index+"' type='checkbox' onclick='deleteBtnControl()' /> </td>" ;
	row = row + "<td id='td_practice_"+index+"' >"  +"<span> <select aria-label='Practice list' id='practice_"+index+"' name='practice_"+index+"'  style='width: 120px; font-size: 11px;' onchange='prepopulate("+index+")'> " +
	 "<option value='' selected='selected'></option>" +
		"</select></span></td>";
	row = row + "<td id='td_principle_"+index+"' style='min-width: 120px;'>"  + "" + "</td>";		
	row = row + "<td id='td_curScore_"+index+"'>"  + "" + "</td>";
	row = row + "<td id='td_tarScore_"+index+"'>"  + "" + "</td>";
	row = row + "<td>" + "<span><textarea aria-label='Action item' id='action_item_"+index+"' maxlength = '350' cols='28' style='resize: none; font-size: 11px;' type='text' name='action_item_"+index+"' disabled/></span> </td>";
	row = row + "<td>" +"<span><textarea aria-label='Progress summary' id='summary_"+index+"' maxlength = '350' type='text' cols='28' name='summary_"+index+"' style='resize: none; font-size: 11px;' disabled/></span> </td>";
	row = row + "<td>" + "<span><textarea aria-label='Key metric' id='metric_"+index+"' maxlength = '350' type='text' cols='28' name='metric_"+index+"' style='resize: none; font-size: 11px;' disabled/></span> </td>";
	row = row + "<td>" + "<span><input aria-label='Review date' id='revDate_"+index+"' class='ibm-date-picker' style='width: 80px; font-size: 11px;' type='text' value='"+"" +"' name='revDate_"+index+"' disabled> </span>"+"</td>";
	row = row + "<td id='td_status_"+index+"'>"  +"<span> <select aria-label='Action list' id='status_"+index+"' name='status_"+index+"' disabled style='font-size: 11px;'> " +
	"</select></span></td>";
	row = row + "</tr>";
	$("#actionPlan").append(row);
	jQuery("#revDate_"+index).datepicker();
	addActionStatusList("", index);
	addActionPracticeList(index,null);
	$("#status_"+index).css('color', 'grey');
}

function resetActionPlan(assessmentList){
	if (assessmentList != undefined){
		var selected = getSelectedAssessment(assessmentList);
		confirmAction("Any unsaved data will be lost. Please confirm that you want to proceed with the reset.","Reset", "Cancel",executeReset, [selected.assessmt_action_plan_tbl]);
	}
}

function executeReset(actionPlan){
	$("#actionPlan").empty();
	displayActionPlan(actionPlan);
	deleteBtnControl();
}

function prepopulate(index){
	var practiceIndex = $("#practice_"+index+" option:selected").val();
	if (practiceIndex == "") {
		
	}
	//$("#select_item_"+index).removeAttr("disabled");
	$("#action_item_"+index).removeAttr("disabled");		
	$("#summary_"+index).removeAttr("disabled");
	$("#metric_"+index).removeAttr("disabled");
	$("#revDate_"+index).removeAttr("disabled");
	$("#status_"+index).removeAttr("disabled");
	$("#status_"+index).css('color', 'black');
	$("#td_principle_"+index).html(principles[practiceIndex].assessed_cmpnt.principle_name);
	$("#td_curScore_"+index).html(principles[practiceIndex].assessed_cmpnt.cur_mat_lvl_score);
	$("#td_tarScore_"+index).html(principles[practiceIndex].assessed_cmpnt.tar_mat_lvl_score);
	$("#saveActPlanBtn").removeAttr("disabled");
	$("#cancelActPlanBtn").removeAttr("disabled");
}

function deleteBtnControl(){
	if ($("input[id^='select_item_']").filter(':checked').length > 0){
		$("#deleteActPlanBtn").removeAttr("disabled");
	}
	else{
		$("#deleteActPlanBtn").attr("disabled","disabled");
	}
}

function addNote(){
	var msg = "Action Plan is not functional per this release.";
	var text = "<div class='ibm-col-1-1' style='margin-bottom: 20px;'><span style='font-style: italic;'>"+msg+"</span></div>";
	$("#actPlanContainer").append(text);
}

function updateActionPlan(action){
	switch(action){
	case "add":
		addEmptyRow();
		break;
	case "delete":
		getTeamAssessments(team._id, deleteActionItems, []);
		break;
	case "update":
		getTeamAssessments(team._id, processActionPlan, []);
		break;
	case "reset":
		getTeamAssessments(team._id, resetActionPlan, []);
		break;
	}
}

function processActionPlan(assessmentList){
	if (assessmentList != null && assessmentList != undefined){
		var selected = getSelectedAssessment(assessmentList);
		
		if (selected != null && selected != undefined){
			var updatedActions = getUpdatedAction(selected);
			if (updatedActions != false){
				submitActionPlan(updatedActions, "Action Plan item(s) saved successfully.");
			}
		}
	}
}

function getSelectedAssessment(assessmentList){
	var selectedAssessment="";
	if (assessmentList != null && assessmentList != undefined){
		for (var y=0;y<assessmentList.length;y++){
			var assessmt = assessmentList[y];
			if (assessmt._id == assessId){
				selectedAssessment = assessmt;
				break;
			}
		}
	}
	return selectedAssessment;
}

function submitActionPlan(jsonData, msg){
	jsonData.last_updt_dt = getServerDateTime();
	jsonData.last_updt_user = JSON.parse(localStorage.getItem("userInfo")).email;
	
	$("#lastUpdateUser").html(jsonData.last_updt_user);
	$("#lastUpdateTimestamp").html(showDateDDMMMYYYYTS(jsonData.last_updt_dt));
	
	$.ajax({
		type : "PUT",
		//url : baseUrlDb + "/" + encodeURIComponent(jsonData._id),
		url: "/api/assessment",
		contentType : "application/json",
		/*headers : {
			"Authorization" : "Basic " + btoa(user + ":" + pass)
		},*/
		data : JSON.stringify(jsonData),
		error : errorHandler
	}).done(function (data) {
		if(msg != null && msg != "")
			showMessagePopup(msg);
	});
}

function getUpdatedAction(actions){
	var actionId = -1;
	var hasError = false;
	for (var x= 0; x < $('#actionPlan > tr').length;x++){
		
		var practiceIndex = $("#practice_"+x+" option:selected").val();
		if ($("#select_item_"+x).length && practiceIndex == ""){
			hasError = true;
			break;
		}
		
		if (actions.assessmt_action_plan_tbl[x] == undefined){
			actions.assessmt_action_plan_tbl[x] = new Object();
		}
		
		if (actions.assessmt_action_plan_tbl[x].action_plan_entry_id != undefined && actions.assessmt_action_plan_tbl[x].action_plan_entry_id != ""){
			actionId = parseInt(actions.assessmt_action_plan_tbl[x].action_plan_entry_id);
		}
		else {
			actionId +=1;
		}
		actions.assessmt_action_plan_tbl[x].action_plan_entry_id = actionId;
		
		if ($("#select_item_"+x).length){
			actions.assessmt_action_plan_tbl[x].user_created = "Yes";
		}
		else{
			actions.assessmt_action_plan_tbl[x].user_created = "No";
		}
		if (practiceIndex != undefined){
			actions.assessmt_action_plan_tbl[x].assessmt_cmpnt_name = principles[practiceIndex].assessmt_cmpnt_name;
			actions.assessmt_action_plan_tbl[x].principle_id = principles[practiceIndex].assessed_cmpnt.principle_id;
			actions.assessmt_action_plan_tbl[x].principle_name = principles[practiceIndex].assessed_cmpnt.principle_name;
			actions.assessmt_action_plan_tbl[x].practice_id = principles[practiceIndex].assessed_cmpnt.practice_id;
			actions.assessmt_action_plan_tbl[x].practice_name = principles[practiceIndex].assessed_cmpnt.practice_name;
			actions.assessmt_action_plan_tbl[x].how_better_action_item = $("#action_item_"+x).val();
			actions.assessmt_action_plan_tbl[x].cur_mat_lvl_score = principles[practiceIndex].assessed_cmpnt.cur_mat_lvl_score;
			actions.assessmt_action_plan_tbl[x].tar_mat_lvl_score = principles[practiceIndex].assessed_cmpnt.tar_mat_lvl_score;
		}
		actions.assessmt_action_plan_tbl[x].progress_summ = $("#summary_"+x).val();
		actions.assessmt_action_plan_tbl[x].key_metric = $("#metric_"+x).val();
		actions.assessmt_action_plan_tbl[x].review_dt = $("#revDate_"+x).val();
		actions.assessmt_action_plan_tbl[x].action_item_status = $("#status_"+x+" option:selected").text();
	}
	if (hasError){
		showMessagePopup("Please select principle.");
		$("#practice_"+x).focus();
		return false;
	}
	return actions;
}

/**
 * Filters all Submitted assessment of certain type based on the first assessment it finds.
 * 
 * @param assessmtList - list of assessments for a team.
 * @param teamId - team id
 * @param assessId - assessment id 
 * @returns {Array} - list of filtered assessments of certain type.
 */
function filterSubmitted(assessmtList, teamId, assessId){
	var assessmt_data = [];
	var assessmtType  = "";
	var identifier = "";
	if (assessmtList != undefined) {
		for ( var i = 0; i < assessmtList.length; i++) {
			if(assessmtList[i].team_id == teamId && assessmtList[i].assessmt_status == 'Submitted' && assessmtList[i]._id == assessId) {
				assessmtType = getAssessmentType(assessmtList[i]);
				break;
			}
		}
		
		for ( var i = 0; i < assessmtList.length; i++) {
			if(assessmtList[i].team_id == teamId && assessmtList[i].assessmt_status == 'Submitted') {
				identifier = getAssessmentType(assessmtList[i]);
				
				if (assessmtType == "") {
					assessmtType = identifier;
					assessmt_data.push(assessmtList[i]);
					
				} else if (assessmtType == identifier) {
					assessmt_data.push(assessmtList[i]);
					
				}	
			}
		}
	}
	return assessmt_data;
}

function displaySelected(assessmt_data){
		var lastRecord = -1;
		for (var y=0;y<assessmt_data.length;y++){
			//index 0 - leadership
			//index 1- delivery
			var assessmt = assessmt_data[y];
			if (assessmt._id == assessId){
				lastRecord = y;
				
				var selfAsstDate = "";
				if (assessmt["self-assessmt_dt"] != null && assessmt["self-assessmt_dt"] != ""){
					selfAsstDate = showDateMMDDYYYY(assessmt["self-assessmt_dt"].substring(0,assessmt["self-assessmt_dt"].indexOf(" ")));
				}
				
				var indAsstDate = "";
				
				if (assessmt.ind_assessmt_dt != null && assessmt.ind_assessmt_dt != ""){
					indAsstDate = showDateMMDDYYYY(assessmt.ind_assessmt_dt.substring(0,assessmt.ind_assessmt_dt.indexOf(" ")));
				}
				
				setIndAssessor(assessmt.ind_assessor_id);
				loadHeader(team.name, selfAsstDate, assessmt.assessmt_status, indAsstDate, assessmt.ind_assessmt_status);
				
				$("#lastUpdateUser").html(assessmt.last_updt_user);
				$("#lastUpdateTimestamp").html(showDateDDMMMYYYYTS(assessmt.last_updt_dt));
				$("#doc_id").html(assessmt["_id"]);
				
				if (assessmt.ind_assessmt_status == "Submitted"){
					hasIndAssessment = true;
				}
				else{
					removeIndAssessment();
				}
				
				var firstIndex = lastRecord-6;
				if (firstIndex < 0){
					firstIndex = 0;
				}
				else{
					firstIndex = firstIndex+1;
				}
				for (var x=firstIndex;x<=lastRecord;x++){
					if (assessmt_data[x] != null){
						assessmentData.push(assessmt_data[x]);
					}
				}
				
				if (assessmt.assessmt_cmpnt_rslts != null){
					var practicesCnt = 0;
					for (var x=0;x<assessmt.assessmt_cmpnt_rslts.length;x++){
						var assessmt_cmpnt_rslts = assessmt.assessmt_cmpnt_rslts[x];
						var id='';
						if (x==0){
							id = 'resultBody';
							//adjust min length
							//$("#assessContainer_0").css("min-height", "470px");
						}
						else{
							id = 'deliveryResult';
							//adjust min length
							//$("#assessContainer_1").css("min-height", "470px");
						}
					
						setAssessHeader(x, assessmt_cmpnt_rslts.assessed_cmpnt_name);
						displayOverAll(id,assessmt_cmpnt_rslts.ovralcur_assessmt_score,assessmt_cmpnt_rslts.ovraltar_assessmt_score,x);
						
						for (var y=0;y<assessmt_cmpnt_rslts.assessed_cmpnt_tbl.length;y++){
							var assessed_cmpnt = assessmt_cmpnt_rslts.assessed_cmpnt_tbl[y];
							loadResult(id, assessed_cmpnt, x);
							storePrinciples(practicesCnt,assessed_cmpnt, assessmt_cmpnt_rslts.assessed_cmpnt_name);
							practicesCnt++;
						}
					}
				}
				
				hasDevOps(assessmt.team_dlvr_software);
				
				if (assessmt.assessmt_action_plan_tbl != null){
					displayActionPlan(assessmt.assessmt_action_plan_tbl);
					
					if (hasAccess(teamId, true)){
						if (assessmt.assessmt_action_plan_tbl.length > 0){
							$("#saveActPlanBtn").removeAttr("disabled");
							$("#cancelActPlanBtn").removeAttr("disabled");
						}
						$("#addActEntryBtn").removeAttr("disabled");
					}
				}
				selAssessment = assessId;
				break;
			}
		}
		//This is a temporary note while action plan is not yet fully implemented
		//addNote();
}
	
function storePrinciples(index, assessed_cmpnt, assessmt_cmpnt_name){
	var obj = new Object();
	obj.index = index;
	obj.assessed_cmpnt = assessed_cmpnt;
	obj.assessmt_cmpnt_name = assessmt_cmpnt_name;
	principles.push(obj);
}

function retrievePractices(){
	var list = [];
	if (principles != null){
		for (var x=0; x<principles.length; x++){
			var practices = new Object();
			practices.index = principles[x].index;
			practices.practice_name = principles[x].assessed_cmpnt.practice_name;
			list.push(practices);
		}
	}
	return list;
}

function deleteActionItems(assessmentList){
	var deleteList = [];
	var selected = getSelectedAssessment(assessmentList);
	for (var x= 0; x < $('#actionPlan > tr').length ;x++){
		if ($("#select_item_"+x).is(":checked")){
			deleteList.push("td_action_"+x);
			selected.assessmt_action_plan_tbl.splice(x,1);
		}
	}
	if (deleteList.length > 0){
		confirmAction("You have requested to delete the selected action item(s). Please confirm that you want to proceed with the deletion.",  "Delete", "Cancel", executeDelete, [selected,deleteList]);
	}
}
	
function executeDelete(selected, deleteList){
	submitActionPlan(selected,"Actions item(s) deleted successfully.");
	for (var x= 0; x < deleteList.length; x++){
		$("#"+deleteList[x]).remove();
	}
	$("#deleteActPlanBtn").attr("disabled","disabled");
}
	
function confirmAction(message, btn1,btn2, action, args){
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
				click:function() {
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