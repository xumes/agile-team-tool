jQuery(function($) {
	$(document).ready(function() {
		// set current user
		getAuthenticatedUser(user.shortEmail);

		// set current system status
		setGlobalSystemStatus(systemStatus);

		gDialogWindow.init();
	
	});
});

/**
 * Modal dialog used to show messages in place of the regular javascript alert.
 */
var gDialogWindow = IBMCore.common.widget.overlay.createOverlay({
	fullwidth : false,
	id : "agile-dialog",
	contentHtml : "This is a dialog message handler.",
	classes : "ibm-overlay ibm-overlay-alt"
});

var gConfirmWindow = IBMCore.common.widget.overlay.createOverlay({
	fullwidth : false,
	id : "agile-confirm",
	contentHtml : "This is a dialog message handler.",
	classes : "ibm-overlay ibm-overlay-alt",
	titled : true
});

function getAuthenticatedUser(userEmail) {
	return getPersonFromFaces(userEmail, setAuthenticatedUser, [userEmail]);
}

var userInfo;
function setAuthenticatedUser(userEmail, facesPerson) {
	console.log(facesPerson);
	userInfo = facesPerson;
	if (userInfo == null) {
		userInfo = new Object();
		userInfo.email = userEmail;
		userInfo.uid = "";
		showLog("setting default user info: " + userInfo);
		return getPersonFromFaces(userEmail, showUserDetails, []);
	} else {
		showLog("setting user info from faces: " + userInfo);
		setUserDetails(userInfo.name, userInfo.uid);
	}
	localStorage.setItem("userInfo", JSON.stringify(userInfo));
	return userInfo;
}

function resetUser(userEmail) {
	return getAuthenticatedUser(userEmail);
}

function showUserDetails() {
  if (localStorage.getItem("userInfo") != null) {
  	setUserDetails(JSON.parse(localStorage.getItem("userInfo")).name, JSON.parse(localStorage.getItem("userInfo")).uid);
  }
}

function setUserDetails(userName, userImage) {
	$('#ibm-universal-nav').append('<span style="position: relative; left: 20px; padding-top: 15px; width:600px; float:left; color: #0061ff;font-size: 16px; important">' + userName + '</span>');
	$('.ibm-masthead-signin-link').css({
		'background-image' : 'url("//faces.tap.ibm.com/imagesrv/' + userImage + '?s=30")',
		'background-repeat' : 'no-repeat',
		'background-position' : '-4px 10px'
	});
	$('.ibm-masthead-signin-link').removeClass('ibm-masthead-signin-link');
}

/**
 * Global variable to cache faces retrieved data.
 */
var gFacesCache = [];

/**
 * Get person object from faces API.
 * 
 * @param userEmail - email address of person.
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - faces person object.
 */
function getPersonFromFaces(userEmail, _callback, args) {
	var person = null;
	if (userEmail != "") {
		var done = false;
		gFacesCache = JSON.parse(localStorage.getItem("facesCache"));
		if (gFacesCache != null) {
			gFacesCache.forEach(function(personCache) {
				if (!done && personCache != undefined && personCache.email.toUpperCase() == userEmail.toUpperCase()) {
					person = personCache;
					if (typeof _callback === "function") {
						if (typeof args != "undefined")
							args.push(person);
						
						showLog("Person cache, callback function: " + getFnName(_callback));
						_callback.apply(this, args);
					}
					done = true;
				}
			});
			if (done) {
				showLog("Person cache found: " + userEmail);
				return person;
			}
		} else
			gFacesCache = [];
		
		var svcRoot = 'https://faces.tap.ibm.com/api/';
		var svcFunc = 'find/?limit=100&q=email:'+encodeURIComponent('"' + escape(userEmail) + '"');
		var svcURL = svcRoot + svcFunc;
		$.ajax({
			url : svcURL,
			timeout : 5000,
			dataType : "jsonp"
		}).always(function(data) {
				if (data != null) {
					person = data[0];
					for (var i=0; i<data.length; i++) {
						if (data[i].email.toUpperCase() == userEmail.toUpperCase())
							person = data[i];
					}
					var cached = false;
					if (gFacesCache != null) {
						gFacesCache.forEach(function(personCache) {
							if (!cached && personCache != null && person != null && personCache.email.toUpperCase() == person.email.toUpperCase()) {
								cached = true;
							}
						});
					}
					if (!cached) {
						gFacesCache.push(person);					
						localStorage.setItem("facesCache", JSON.stringify(gFacesCache));
					}
					
					if (typeof args != "undefined")
						args.push(person);
				} else {
					if (typeof args != "undefined")
						args.push(null);
				}
				if (typeof _callback === "function") {
					showLog("success callback function: " + getFnName(_callback));
					_callback.apply(this, args);
				}
				return person;
		});
	}
	
	return person;
}

/**
 * Gets the server date and time.
 */
var getServerDateTime = function() {
	var dateTime = "";
	$.ajax({
		type : "GET",
		url : "/api/util/servertime",
		async : false
	}).done(function(data) {
		dateTime = data;
	});
	return dateTime;
};

/**
 * Generic error handler used in ajax calls.
 * 
 * @param jqXHR
 * @param textStatus
 * @param errorThrown
 */
function errorHandler(jqXHR, textStatus, errorThrown) {
	showMessagePopup("Something went wrong: " + textStatus + " " + errorThrown + " " + JSON.stringify(jqXHR));
}

/**
 * Loads all available team information used for referencing user access to team related documents.
 */
function getGlobalAgileTeamList() {
	getAllAgileTeams(setGlobalTeamList, []);
}

/**
 * List of teams referenced when checking user access to team related documents.
 * 
 * @param teamList - array of agile team documents.
 */
function setGlobalTeamList(teamList) {
	allTeams = teamList;
}

/**
 * Checks the access of the current user to the specific team.
 * 
 * @param teamId - team id to check user membership.
 * @param checkParent - set to true if we need to check the parent team documents for user membership.
 * @returns {Boolean}
 */
function hasAccess(teamId, checkParent) {
	var flag = false;

	// valid admin status for Admin user related updates only.
	if (!_.isEmpty(systemStatus.agildash_system_status_display) 
		&& (systemStatus.agildash_system_status_display.toUpperCase() == 'AdminOnlyChange'.toUpperCase() || 
				systemStatus.agildash_system_status_display == 'AdminOnlyReadChange'.toUpperCase())) {
		if (isAdmin()) {
			flag = true;
		} else {
			flag = false;
		}
	} else {
		flag = isAdmin() || isUserMemberOfTeam(teamId, checkParent);

	}
	return flag;
}

/**
 *  Checks the membership of the current user to the specific team.
 *  
 * @param teamId - team id to check user membership.
 * @param checkParent - set to true if we need to check the parent team documents for user membership.
 * @returns {Boolean}
 */
function isUserMemberOfTeam(teamId, checkParent) {
	var userExist = false;
	
	if (allTeams == null)
		return userExist;

	var userTeams = myTeams;
	if (_.has(userTeams, "_root") || _.has(userTeams, "_branch") || _.has(userTeams, "_standalone"))
		userTeams = _.union(_.union(userTeams._root, userTeams._branch), userTeams._standalone);

	if (userTeams != null) {
		for (var i in userTeams) {
			if (userTeams[i]._id == teamId) {					
				userExist = true;
				break;
			}
		}
	} 

	if (!userExist && checkParent) {
		var team = allTeamsLookup[teamId];
		if (!_.isEmpty(team) && !_.isEmpty(team.parent_team_id))
			return isUserMemberOfTeam(team.parent_team_id, checkParent);
	}

	return userExist;
}

/**
 * Loads the list of identified users with administrator access.
 */
function getAllAdministrator() {
	var cUrl = "/api/util/admins";
	getRemoteData(cUrl, setGlobalAdministorList, []);
}

/**
 * Administrator list referenced when checking user access to team related documents.
 * 
 * @param administrator - administrator document.
 */
function setGlobalAdministorList(administrator) {
	if (!_.isEmpty(administrator))
		systemAdmin = administrator.ACL_Full_Admin;	
	else
		systemAdmin = []
}

/**
 * Checks user information if user has Admin access.
 * 
 * @returns {Boolean}
 */
function isAdmin() {
	if (!_.isEmpty(systemAdmin) && !_.isEmpty(user)) {
		return systemAdmin.ACL_Full_Admin.indexOf(user.shortEmail) > -1;
	}
	return false;
}

/**
 * Global implementation of modal dialog popup.
 * 
 * @param message
 */
function showMessagePopup(message) {
	gDialogWindow.setHtml(message);
	if (!gDialogWindow.isOpen())
		gDialogWindow.show();
}

/**
 * Gets the hidden input HTML element indicator any change action done.
 */
function hasChanges() {
	if ($("#changeIndicator").val() == 1)
		return true;
	else
		return false;
};

/**
 * Sets the hidden input HTML element indicator if page update action needs to be tracked.
 */
function setChangeIndiactor() {
	$("#changeIndicator").val(1);
	window.onbeforeunload = function(){ return "You have unsaved changes on this page.";};
};

/**
 * Resets the hidden input HTML element indicator for page update actions.
 */
function resetChangeIndiactor() {
	$("#changeIndicator").val("");
	window.onbeforeunload = null;
};

/**
 * Convenience function to show console logs only on certain environment.
 * 
 * @param message - message to show on console.
 */
function showLog(message) {
	if (environment != null && environment.toLowerCase() == 'sit')
		console.log(message);
}


function getFnName(fn) {
	return (/function ([^\(]*)/.exec(fn.toString())[1]);
}

/**
 * Ajax call to get remote Cloudant jsonp data.
 * 
 * @param cUrl - Cloudant API URL.
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getRemoteJsonpData(cUrl, _callback, args) {
	var returnObj = null;
	$.ajax({
		type : "GET",
		url : cUrl,
		dataType : "jsonp"
	}).done(function(data) {
		if (data != undefined) {
			if (data.rows != undefined) {
				var list = [];
				for ( var i = 0; i < data.rows.length; i++) {
					list.push(data.rows[i].value);
				}
				// we let the callback function handle how the data will be handled.
				showLog("data loaded: " + list.length);
				args.push(list);
				returnObj = list;
			} else {
				// call just returned one jsonp object
				showLog("data loaded: " + JSON.stringify(data));
				args.push(data);
				returnObj = data;
			}
		}
		
		if (typeof _callback === "function") {
			showLog("callback function: " + getFnName(_callback));
			_callback.apply(this, args);
		}
	});
	
	return returnObj;
}

function getRemoteData(cUrl, _callback, args) {
	var returnObj = null;
	$.ajax({
		type : "GET",
		url : cUrl,
		//TODO: Removing "async: false" tends to give the impression that the page has loaded all its data
		// even though it is still processing the ajax call.  Need to work on a busy indicator if removed.
		async: false
	}).done(function(data) {
		if (data != undefined) {
			var list = [];
			console.log("data has rows " + _.has(data.rows, 'rows'));
			console.log("data has value " + _.has(data, 'value'));
			if (_.has(data, "rows")) {
				if (_.has(data.rows, "doc"))
					list = _.pluck(data.rows, 'doc');
				else 
					list = _.pluck(data.rows, 'value');
				args.push(list);
				showLog("data loaded: " + list.length);
				returnObj = list;

			} else if (data.length > 0) {
				if (!_.isEmpty(data[0].doc)) 
					list = _.pluck(data, 'doc')
				else 
					list = _.pluck(data, 'value');

				args.push(list);
				showLog("data loaded: " + list.length);
				returnObj = list;

			} else {
				// call just returned one object
				showLog("data loaded: " + JSON.stringify(data));
				args.push(data);
				returnObj = data;
			}
		}
		
		if (typeof _callback === "function") {
			showLog("callback function: " + getFnName(_callback));
			_callback.apply(this, args);
		}
	}).fail(function() {
		if (typeof _callback === "function") {
			showLog("callback function: " + getFnName(_callback));
			_callback.apply(this, args);
		}
	})
	
	return returnObj;
}

/**
 * Ajax call to update remote Cloudant jsonp data.
 * 
 * @param docId - document ID.
 * @param jsonData - document.
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns
 */
function setTeam(jsonData, _callback, args) {
	var returnObj = null;
	$.ajax({
		type 				: "PUT",
		url 				: "/api/team/",
		contentType : "application/json",
		data 				: JSON.stringify(jsonData),
		error 			: errorHandler
	}).done(function(data) {
		var putResp = (typeof data == 'string' ? JSON.parse(data) : data);
		var rev = putResp.rev;
		showLog('Done updating ' + docId + '. The new revision is ' + rev + '.');
		args.push(data);
		returnObj = data;
		
		if (typeof _callback === "function") {
			showLog("callback function: " + getFnName(_callback));
			_callback.apply(this, args);
		}
	});
	
	return returnObj;
}

/**
 * Get current system status.
 */
function getSystemStatus() {
	var cUrl = "/api/util/systemstatus"
	getRemoteData(cUrl, setGlobalSystemStatus, []);
}

/**
 * Updates localStorage of system status referenced when checking user access.
 * 
 * @param systemStatus
 */
function setGlobalSystemStatus() {
	if (!_.isEmpty(systemStatus)) {
		if (!_.isEmpty(systemStatus.agildash_system_status_msgtext_display) && !_.isEmpty(systemStatus.agildash_system_status_values_tbl)) {
			var validStatus = systemStatus.agildash_system_status_values_tbl;
			for (var i in validStatus) {
				if (systemStatus.agildash_system_status_display.toUpperCase() == validStatus[i].system_status_flag.toUpperCase()) {				
					$('#systMsg').addClass("sysMsg");
					$('#systMsg').show();
					$('#systMsg').html(systemStatus.agildash_system_status_msgtext_display);
			
				}
			}	
		} else {	
			$('#systMsg').remove();
		}
	}
}

/**
 * Get all available teams.
 * 
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getAllAgileTeams(_callback, args) {
	var teamUrl = "/api/teams";
	return getRemoteData(teamUrl, _callback, args);
}

function getTeamNames(_callback, args) {
	var teamUrl = "/api/teams/names";
	return getRemoteData(teamUrl, _callback, args);
}


/**
 * Get all available roles for team members.
 * 
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getAllAgileTeamRoles(_callback, args) {
	var teamUrl = "/api/teams/roles";
	return getRemoteData(teamUrl, _callback, args);
}

/**
 * Get all avaialable team for the person with indicated user email.
 * 
 * @param userEmail - email address to process.
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getAllAgileTeamsForUser(userEmail, _callback, args) {
	if (userEmail == null || userEmail == "") {
		_callback.apply(this, args);
		return null;
	}	
	var teamUrl = '/api/teams/members/'+encodeURIComponent(userEmail);
	return getRemoteData(teamUrl, _callback, args);
}

var userTeams;
function setAgileTeamsForUser(teams, newTeam) {
	userTeams = teams;

	if (newTeam != null) {
		var found = false;
		for (var i in userTeams) {
			if (userTeams[i]._id == newTeam._id) {
				found = true;
				break;
			}
		}
		if (!found) {
			var obj = new Object();
			obj._id = newTeam._id;
			obj._rev = newTeam._rev;
			obh._name = newTeam.name;
			userTeams.push(obj);
		}
	}
}

/**
 * Get all assessments available for the team.
 * 
 * @param teamId - team id to process
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getTeamAssessments(teamId, _callback, args) {
	if (teamId == null || teamId == "") {
		_callback.apply(this, args);
		return null;
	}
	var teamUrl = "/api/assessment/view?teamId=" + encodeURIComponent(teamId);
	return getRemoteData(teamUrl, _callback, args);
}

/**
 * Get all available assessment maturity templates.
 * 
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getAssessmentQuestionnaire(_callback, args) {
	var teamUrl = "/api/assessment/template";
	return getRemoteData(teamUrl, _callback, args);	
}

/**
 * Get all iterations available for the team.
 * 
 * @param teamId - team id to process
 * @param _callback - handler function to handle data.
 * @param args - arguments to be used by the handler function.
 * @returns - any returnable object.
 */
function getTeamIterations(teamId, _callback, args) {
	if (teamId == null || teamId == "") {
		_callback.apply(this, args);
		return null;
	}
	var teamUrl = "/api/iteration/" + encodeURIComponent(teamId);
	return getRemoteData(teamUrl, _callback, args);
}


function getCompletedIterations(startDate, endDate, _callback, args) {
	if (startDate == null || startDate == "" || endDate == null || endDate == "") {
		_callback.apply(this, args);
		return null;
	}
	var teamUrl = "/api/iteration/completed?startkey=" + startDate + "&endkey=" + endDate ;
	return getRemoteData(teamUrl, _callback, args);
}	

function getTeam(docId, _callback, args) {
	if (docId == null || docId == "") {
		_callback.apply(this, args);
		return null;
	}
	var docUrl = "/api/team/" + encodeURIComponent(docId);
	return getRemoteJsonpData(docUrl, _callback, args);
}

/**
 * Team document template to arrange field order accordingly.
 * @returns - empty team document.
 */
function initTeamTemplate() {
	var teamTemplate = {
	  "_id": "",
	  //"_rev": "",
	  "type": "",
	  "name": "",
	  "desc": "",
	  "squadteam": "",
	  "parent_team_id": "",
	  "last_updt_dt": "",
	  "last_updt_user": "",
	  "created_user": "",
	  "created_dt": "",
	  "doc_status": "",
	  "members": 
	  	[
        {
          "key": "",
          "id": "",
          "name": "",
          "allocation": 0,
          "role": ""
        }
      ],
	  "child_team_id": []
	};
	teamTemplate["members"] = [];
	return teamTemplate;
}

/**
 * Iteration document template to arrange order of the main fields.
 * @returns - empty iteration document
 */
function initIterationTemplate() {
	var iterationTemplate = {
	  "_id": "",
	  //"_rev": "",
	  "type": "iterationinfo",
	  "team_id": "",
	  "iteration_name": "",
	  "iteration_start_dt": "",
	  "iteration_end_dt": "",
	  "iterationinfo_status": "",
	  "team_mbr_cnt": "",
	  "nbr_committed_stories": "",
	  "nbr_stories_dlvrd": "",
	  "nbr_committed_story_pts": "",
	  "nbr_story_pts_dlvrd": "",
	  "iteration_comments": "",
	  "team_mbr_change": "",
	  "last_updt_user": "",
	  "fte_cnt": "",
	  "nbr_dplymnts": "",
	  "nbr_defects": "",
	  "client_sat": "",
	  "team_sat": "",
	  "last_updt_dt": "",
	  "created_user": "",
	  "created_dt": "",
	  "doc_status": ""
	};
	return iterationTemplate;
}

/**
 * Assessment document template to arrange order of the main fields.
 * @returns - empty assessment document.
 */
function initAssessmentAnswersTemplate() {
	var assessmentAnswersTemplate = {
	  "_id": "",
	  //"_rev": "",
	  "type": "matassessmtrslt",
	  "team_id": "",
	  "assessmt_version": "",
	  "team_proj_ops": "",
	  "team_dlvr_software": "",
	  "assessmt_status": "",
	  "submitter_id": "",
	  "self-assessmt_dt": "",
	  "ind_assessor_id": "",
	  "ind_assessmt_status": "",
	  "ind_assessmt_dt": "",
	  "created_dt": "",
	  "created_user": "",
	  "last_updt_dt": "",
	  "last_updt_user": "",
	  "doc_status": "",
	  "assessmt_cmpnt_rslts": 
	   [
	    {
	    	"assessed_cmpnt_name": "",
	  	 	"assessed_cmpnt_tbl": 
	      	 [
	      	  {
	           "principle_id": "",
	           "principle_name": "",
	           "practice_id": "",
	           "practice_name": "",
	           "cur_mat_lvl_achieved": "",
	           "cur_mat_lvl_score": "",
	           "tar_mat_lvl_achieved": "",
	           "tar_mat_lvl_score": "",
	           "ind_mat_lvl_achieved": "",
	           "ind_target_mat_lvl_score": "",
	           "how_better_action_item": "",
	           "ind_assessor_cmnt": ""
	         }
      	  ]	  	 
	  	},
	  	"ovralcur_assessmt_score",
	  	"ovraltar_assessmt_score"
	   ],
    "assessmt_action_plan_tbl":
   	 [
   	  {
   	  	"action_plan_entry_id": "",
       	"assessmt_cmpnt_name": "",
       	"principle_id": "",
       	"principle_name": "",
       	"practice_id": "",
       	"practice_name": "",
       	"how_better_action_item": "",
       	"cur_mat_lvl_score": "",
       	"tar_mat_lvl_score": "",
       	"progress_summ": "",
       	"key_metric": "",
       	"review_dt": "",
       	"action_item_status": ""
      }
   	 ]
	};
	assessmentAnswersTemplate["assessmt_cmpnt_rslts"] = [];
	assessmentAnswersTemplate["assessmt_action_plan_tbl"] = [];
	return assessmentAnswersTemplate;
}