/**
 * @author manabsarkar@in.ibm.com v1.0 2015/08/24
 * @namespace IBM id form validation Utilities
 * @memberOf ibmIDC
 * @description
 * <p>
 * Contains  Validation logic for the different forms used in IBM id Application.
 * </p>
 */
var ibmIDC = ibmIDC || {};
ibmIDC.formUtil = ibmIDC.formUtil || {};

(function($) {//jli: use $ instead of jQuery
	
ibmIDC.formUtil = {
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @description <p>Max Password length Variable</p>
     * @type {int}
     */
    PASSWORD_MAX_LENGTH: 31,
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @description <p>Min Password length Variable</p>
     * @type {int}
     */
    PASSWORD_MIN_LENGTH: 8,
    user_Attempt : 0,
    USER_STATUS : false,
    USER_CHKSBS : false,
    RESEND_OTP : false,
    RANDOM_NUMBER: Math.floor(Math.random()*1000000),
    FEDUSER_STATUS:false,
    isLoggedIn:false,
    userDetails:false, // Loggedn In User Object
    EMAIL_VERIFIED: false,
    LOGGED_IN_USER: "",
    BUSINESS_EMAIL: "",
    REGISTER_ONLY: false,
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @description error message scenarios that can occur during form filed validation</p>
     * @type {object}
     */
    DEFAULT_COUNTRY: "en-US",
    error_messages: {
        'missing_required_field': 'missing_required_field',
        'invalid_email_address': 'invalid_email_address',
        'email_already_registered': 'email_already_registered',
        'email_not_registered': 'email_not_registered',
        'invalid_character_in_password': 'invalid_character_in_password',
        'password_too_short': 'password_too_short',
        'password_too_long': 'password_too_long',
        'passwords_dont_match': 'passwords_dont_match',
        'invalid_phone_number': 'invalid_phone_number',
        'password_length_err': 'password_length_err',
        'invalid_name': 'invalid_name',
        'invalid_company': 'invalid_company',
        'invalid_token': 'invalid_token',
        'invalid_char_in_token': 'invalid_char_in_token',
        'invalid_country': 'invalid_country'
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @description Check if an input field is empty.</p>
     * @type {object} Regular expressions from the registration form
     */
    _regexp: {
        name: /^[a-z'\-\s]+$/i,
        token: "^[0-9]+$",
        company:/^[A-Za-z0-9-'&\s]+$/,
        numeric: "^[0-9]*$",
        emailFormat: /^(([^\.@"]+(\.[^<>()\[\]\\.\*,;:\s@=/&"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	    email: /^[_A-Za-z0-9-!#$%'?^~`\{\}\|\+]+(\.[_A-Za-z0-9-!#$%'?^~`\{\}\|\+]+)*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}]com)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        emailExcludeChars: "[$+?&#*]",
        passwordAllowedChars: "^[A-Za-z0-9-_.@]+$",
        ibmId: "^([!$&\\x5D\\x5B#-'+\\-\\/-9=?A-Z^-~]+[.])*[!$&\\x5D\\x5B#-'+\\-\\/-9=?A-Z^-~]+" + "([\\(]{1}[!$&\\x5D\\x5B#-'+\\-\\/-9=?A-Z^-~]+[\\)]{1}){0,}[!$&\\x5D\\x5B#-'+\\-\\/-9=?A-Z^-~]{0,}" + "\\@[a-zA-Z0-9]+([a-zA-Z0-9]*\\-[a-zA-Z0-9]+)*(([.]|\\_)([a-zA-Z0-9]+)(\\-[a-zA-Z0-9]+)*)*[.]([a-zA-Z]{2,4})$",
        url: "^(notes|http(s?))://[0-9a-zA-Z]([-.w]*[0-9a-zA-Z])*(:(0-9)*)*(/?)([a-zA-Z0-9()-.?,'/\\+=@&amp;%$#_]*)?$",
        urlProtocol: "^(notes|http(s?))://",
        phone: /^((?=.*\d)(?!\.+))([\d\-\+\(\)\s.]{0,22})+[0-9)]$/,
        phone1: "^(\\+|00)(( )*\\(([. -~]*[0-9]+[. -~]*)+\\))?([. -~]*[0-9]+[. -~]*)+((\\(([. -~]*[0-9]+[. -~]*)+\\))?([. -~]*[0-9]+[. -~]*)*)*$",
        phone2: "^((\\(([1-9]\\d{2})\\))|([1-9]\\d{2}))[ -.~]?(\\d{3})[ -.~]?(\\d{4})$",
        phone3: "^[0-9]+([ ]*[-~]?[ ]*[0-9]+)*$",
        ibmid: "^[_A-Za-z0-9-!#$%&'/\=?^~`@\.]+$",
        alphaNumericWithSpecialChar: "^([a-zA-Z0-9]+((([ ]?[-][ ]?)|[_]|[ ]|([ ]?['][ ]?)|([ ]?[.][ ]?)|([ ]?[&][ ]?)|([ ]?[~][ ]?)|" + "([ ]?[!][ ]?)|([ ]?[#][ ]?)|([ ]?[$][ ]?)|([ ]?[*][ ]?)|([ ]?[+][ ]?)|([ ]?[=][ ]?))?[a-zA-Z0-9]+)*([.]|['])?)$"
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_required
     * @description Check if an input field is empty.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {String} - error message string
     */
    validate_required: function(input) {
        if (!$(input).val() || $(input).val().trim().length === 0) {
            return 'missing_required_field';
        }
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function get_company
     * @description <p>Get the company ID field value from the form.</p>
     * @returns {string} - company
     */
    get_company: function() {
        var field_name = "company";
        var company = $('input[name=' + field_name + ']').val();
        if(company)
            return company.trim();
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function get_state
     * @description <p>Get the state ID field value from the form.</p>
     * @returns {string} - state
     */
    get_state: function() {
        var field_name = "state";
        var state = jQuery('#'+field_name+' :selected').val();
        if(state)
            return state.trim();
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_phoneNumber
     * @description <p>Get the Phone Number field value from the form.</p>
     * @returns {string} - phoneNumber
     */
    get_phoneNumber: function() {
        var field_name = "phoneNumber";
        var phoneNumber = $('input[name=' + field_name + ']').val();
        if(phoneNumber)
        return phoneNumber.trim();
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_email
     * @description <p>Get the email ID field value from the form.</p>
     * @returns {string} - email Address
     */
    get_email: function(emailFed) {//jli
        var field_name = emailFed || "emailAddress";
        var emailAddress = $('input[name=' + field_name + ']').val();
        return emailAddress.trim();
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function get_email
     * @description <p>Get the IBMid field value from the form.</p>
     * @returns {string} - ibmid value
     */
    get_ibmid: function() {
        var field_name = "ibmid";
        var emailAddress = $('input[name=' + field_name + ']').val().trim();
        return emailAddress;
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function get_fed_ibmid
     * @description <p>Get the IBMid field value from the form.</p>
     * @returns {string} - ibmid value
     */
    get_fed_ibmid: function() {
        //var field_name = "ibmid";
        //var emailAddress = $('input[name=' + field_name + ']').val();
    	var emailAddress = $('#ibmSigninformEmail').text().trim();
        return emailAddress;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_token
     * @description <p>Get the token field value from the form.</p>
     * @returns {string} - token value
     */
    get_token: function() {
        var field_name = "token";
        var token = $('input[name=' + field_name + ']').val();
        return token;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_firstName
     * @description <p>Get the first Name field value from the form.</p>
     * @returns {string} - first Name value
     */
    get_firstName: function() {
        var field_name = "firstName";
        var firstName = $('input[name=' + field_name + ']').val().trim();
        return firstName;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_lastName
     * @description <p>Get the last Name field value from the form.</p>
     * @returns {string} - last Name value
     */
    get_lastName: function() {
        var field_name = "lastName";
        var lastName = $('input[name=' + field_name + ']').val().trim();
        return lastName;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_userName
     * @description <p>Get the User Name field value from the form.</p>
     * @returns {string} - User Name value
     */
    get_userName: function() {
        var userName = this.get_email().trim();
        return userName;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_password
     * @description <p>Get the password field value from the form.</p>
     * @returns {string} - password value
     */
    get_password: function() {
        var field_name = "password";
        var password = $('input[name=' + field_name + ']').val();
        return password;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function get_country
     * @description <p>Get the country field value from the form.</p>
     * @returns {string} - country value
     */
    get_country: function() {
        var field_name = "country";
        var country = $('#' + field_name).val();
        if (!country || country === "") {
        	country = "US";
        }
        return country;
    },
    /**
     * @author sabhpadm@in.ibm.com
     * @memberOf ibmIDC
     * @function setEmailId
     * @description <p>Set the email field if the URL contains the query</p>
     * @returns {string} - n&c permission value
     */
    setEmailId : function(){
    	var email="";
    	if(ibmIDC.formUtil.queryParam("emailid")){
    		email =decodeURIComponent(ibmIDC.formUtil.queryParam("emailid"));
    		if((new RegExp(ibmIDC.formUtil._regexp.emailFormat).test(email))&&(new RegExp(ibmIDC.formUtil._regexp.email).test(email))) {
    			$("#email").val(email);
            };
    	};
    	
    },
    
    /**
     * @author pavan.sunkara@in.ibm.com
     * @memberOf ibmIDC
     * @function get_N&C permission check box
     * @description <p>Get the  n&C permission value from the form.</p>
     * @returns {string} - n&c permission value
     */
    get_permission: function() {
        var field_name = "NC_CHECK_AllMedia";
        if($('#' + field_name).prop("checked")){
        	var permissions = 'yes';
        }else{
        	var permissions = 'no';
        }
        return permissions;
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function get_N&C permission check box for existing user
     * @description <p>Get the  n&C permission value from the form.</p>
     * @returns {string} - n&c permission value
     */
    get_permission_existing: function() {
        var field_name = "NC_CHECK_AllMedia_EXISTING";
        if($('#' + field_name).prop("checked")){
        	var permissions = 'yes';
        }else{
        	var permissions = 'no';
        }
        return permissions;
    },
    /**
     * @author pavan.sunkara@in.ibm.com
     * @memberOf ibmIDC
     * @function
     * @description <p>Get the otp value from the email.</p>
     * @returns {string} - otp value
     */
    get_Otp: function() {
    	var field_name = "otp";
        var otp = $('input[name=' + field_name + ']').val();
        return otp;
    },    
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function get_company_existing
     * @description <p>Get the company ID field value from the short form.</p>
     * @returns {string} - company_existing
     */
    get_company_existing: function() {
        var field_name = "company_existing";
        var company_existing = $('input[name=' + field_name + ']').val();
        if(company_existing){
        	return company_existing.trim();
        }
        else{
        	return company_existing;
        }
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function get_phoneNumber_existing
     * @description <p>Get the Phone Number field value from the short form.</p>
     * @returns {string} - phoneNumber_existing
     */
    get_phoneNumber_existing: function() {
        var field_name = "phoneNumber_existing";
        var phoneNumber_existing = $('input[name=' + field_name + ']').val();
        if(phoneNumber_existing){
        	return phoneNumber_existing.trim();
        }
        else{
        	return phoneNumber_existing;
        }
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     */
    stateId:"",
	 /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function showEmailField
     * @description <p>Show the email field.</p>
     * @returns {string} - country value
     */
   showEmailField : function(){
    	$("#resendEmail").hide();
    	$(".arrow-container").addClass("arrow-bright");
    	},
    changeLoaderState : function(state){
    	var spinner =document.querySelectorAll(".ibm-spinner-container")[0];
    	var arrow=document.querySelectorAll(".arrow-container")[0];
    	if(state === "init"){
    		$('input[name=emailAddress]').prop('disabled', true);
    		ibmIDC.formUtil.showEmailField();
    		$("#email").removeClass('valid');
    		$(".arrow-container").show();
    		$(".arrow-container .buttontext").hide();
    		spinner.style.visibility = "visible";
    	}else{
    		$('input[name=emailAddress]').prop('disabled', false);
    		$(".arrow-container").removeAttr('style');
    		$(".ibm-spinner-container").removeClass('init-spin').removeAttr('style');
			$(".arrow-container .buttontext").show();
    	}
        if(window.ActiveXObject || "ActiveXObject" in window ){
            spinner.setAttribute('class','ibm-spinner-container init-spin ie-init-spin');
        }else{
            spinner.setAttribute('class','ibm-spinner-container init-spin');
        }
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_email_existence
     * @description <p>Check the existence of USER in IDAAS.</p>
     * @param {boolean} input - boolean value which will diffentiate it is federated or not.
     * @returns {void}
     */
    validate_email_existence: function(email,isLoginForm) {
        isLoginForm=isLoginForm || false;
        // firing async call to check
        ibmIDC.log("VALIDATE USER");
        var req_data = {
            email: email
        };
        
        //Send the user to SBS to verify if its new or existing user or already provisioned
        $.ajax({
            url: ibmIDC.idUtil.servicesBasePath + 'sendemail',
            type: 'POST',
            data: req_data,
            dataType: "json",
            timeout: 30000,
            beforeSend: function() {
            	ibmIDC.formUtil.changeLoaderState("init");
            },
            success: function(data) {
            	$('input[name=uname]').val(ibmIDC.formUtil.get_email());
                ibmIDC.formUtil.changeLoaderState("end");
                if (data.status === 'success') {
                    switch (data.statuscode) {
                        case '110':
                        	if(isLoginForm === true){
	                        	ibmIDC.formUtil.displayErrorMsg("emailFed",'We didn\'t recognize this IBMid or email. Please check your entry or <a id="createNewIBMid" href="#">Create a new IBMid?</a>');
	                        	$('#processing').fadeOut();
                        	}
                        	else{
                        		ibmIDC.formUtil.longFormvisiable();
                        	}
                        	//ibmIDC.formUtil.longFormvisiable();
                            //Create your IBM id
                            break;
                    }
                } else {
                    switch (data.statuscode) {
                    	case '118':
                        case 'FBTRBA363E':
                        	//Below piece of code is regarding shortfom with UserName and Password field, this format currently we are not using currently, commented by Ravi
                        	/*var errormsg='';
                        	if(ibmIDC.formUtil.checkTrial()){
                        		errormsg=ibmIDC.err["FBTRBA363ETRIAL"];
                        		$('span[data-message="usererror"]').hide();
                        		$("#shortform").find('form').find("input[type=password]").val("");
                        		$("#ibmid >  span[data-message=\"ibmid\"]").addClass('visible').html(errormsg);
                        	}else{
                        		errormsg=ibmIDC.err["FBTRBA363E"];
                        		$("#ibmid >  span[data-message=\"ibmid\"]").addClass('visible').html(errormsg);
                        	}*/
                        	
                        	//TODO, jli: exiting user. show Fed or IBMid view. Task 1179449
                        	
                        	$("#ibmidtxt").val(email);
					    	$("#email").addClass('valid');
					    	//Below piece of code is regarding shortfom with UserName and Password field, this format currently we are not using currently, commented by Ravi
					    	//ibmIDC.formUtil.showTrial(); //jli: might need to move the logic to it
					    	ibmIDC.formUtil.prepareFormForPassword(email);
                                
					    	$('#processing').fadeOut();
						    ibmIDC.formUtil.changeLoaderState("end");
                            break;
                        case '101':
                            ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["101"]);
                            break;
                        case '201':
               			 ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg1, ibmIDC.err['201']);
                            break;
                        default:
                            ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg1, ibmIDC.err['REGFAIL']);
                    }
                }
            },
            error: function() {
            	$('input[name=uname]').val(email);
                ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            }
        });
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_email
     * @description <p>Validate the email field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_email: function(input) {
        var email = $(input).val().trim();
        /*email = email.replace(/  +/g, ' ');*/
        $(input).val(email);
    	if(email.length < 1){
    		return ibmIDC.err.emailRequired;
    	}
    	if (!(new RegExp(ibmIDC.formUtil._regexp.emailFormat).test(email))) {
            return ibmIDC.err.invalidEmail; 
        }else if (!(new RegExp(ibmIDC.formUtil._regexp.email).test(email))) {
            return ibmIDC.err.invalidCharsEmail;
        }else{
            $(input).val(email);
        }
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_ibmid
     * @description <p>Validate the ibmid field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_ibmid: function() {
        //var ibmid = $("#ibmidtxt").val();
    	var ibmid = $('#ibmSigninformEmail').text().trim();
    	if(ibmid.length < 1){
    		return ibmIDC.err.ibmIdRequired;
    	}
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_shortForm_ibmid
     * @description <p>Validate the ibmid field in the short form.</p>
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_shortForm_ibmid: function() {
        //var ibmid = $("#ibmidtxt").val();
    	var ibmid = $('#emailFedId').val().trim();
    	$('#emailFedId').val(ibmid);
    	if(ibmid.length < 1){
    		return ibmIDC.err.ibmIdRequired;
    	}
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_phone_number
     * @description <p>Validate the phone number field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_phone_number : function(item) {
        var phNo = $(item).val();
        phNo = phNo.replace(/  +/g, ' ');
        $(item).val(phNo);
        phNo=phNo.trim();
        if(phNo.length < 1){
        	return ibmIDC.err.phNoRequired;
        }
        else if ((phNo.length >= 1) && !(new RegExp(ibmIDC.formUtil._regexp.phone).test(phNo))) {
        	return ibmIDC.err.invalidPhNo;
        }
     },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_name
     * @description <p>Validate the name field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_name: function(item) {
        var name = $(item).val().trim();
        name = name.replace(/  +/g, ' ');
        $(item).val(name);
        var errorMsg='';
        if (name.length >= 1) {
            if(!(new RegExp(ibmIDC.formUtil._regexp.name).test(name))){
           	 errorMsg = ibmIDC.err.invalidName;
            }
       }else{    	   
       	if(item.name === 'firstName'){
       		errorMsg = ibmIDC.err.firstNameRequired;
       	}else{
       		errorMsg = ibmIDC.err.LastNameRequired;
       	}
       }
        return errorMsg;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_country
     * @description <p>Validate the country field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_country: function(item) {
        var valid = false;
        var name = $(item).children("select > option:selected").text();
        if (!(name === "Select one")) {
            valid = true;
        }
        if (!valid) {
            return ibmIDC.err.invalidCountry;
        }
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_state
     * @description <p>Validate the state field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_state: function(item) {
        var valid = false;
        var name = $(item).children("select > option:selected").text();
        if (!(name === "Select one")) {
            valid = true;
        }
        if (!valid) {
            return ibmIDC.err.invalidState;
        }
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_token
     * @description <p>Validate the token field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_token: function(item) {
    	var  name = $(item).val().trim();
        if (name.length < 1) {
        	return ibmIDC.err.tokenRequired;
        }else if((name.length >= 1 && name.length < 7) || !(new RegExp(ibmIDC.formUtil._regexp.token).test(name))){
        	return ibmIDC.err.invalidTokenMsg;
        }
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_top
     * @description <p>Validate the otp field in the short form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_otp: function(item) {
    	var  name = $(item).val().trim();
        if (name.length < 1) {
        	return ibmIDC.err.otpRequired;
        }else if((name.length >= 1 && name.length < 7) || !(new RegExp(ibmIDC.formUtil._regexp.token).test(name))){
        	return ibmIDC.err.invalidOtp;
        }
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_company
     * @description <p>Validate the company field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_company : function(item){
		var name = $(item).val();//,regEx =/^[A-Za-z0-9-_.@ ]+$/;
	    name = name.replace(/  +/g, ' ');
		$(item).val(name);
	    name=name.trim();
        regEx=ibmIDC.formUtil._regexp.company;
        if(name.length < 1){
			return ibmIDC.err.companyRequired;
		}
        else if (name.length >= 1 && !( regEx.test(name))) {
            return ibmIDC.err.invalidCompany;
        }
    },
	/**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function validate_default_password
     * @description <p>Validate the password field in the form.</p>
     * @param {String} input - DOM element to target e.g., '#id' or '.classname'
     * @returns {string} - error message
     * @returns {void} - if no error
     */
    validate_default_password: function(item) {
    	var password = $(item).val();
	    	if (password.length < ibmIDC.formUtil.PASSWORD_MIN_LENGTH) {
	            $(this).addClass('error');
	            $('.tooltipcontainer').show();
	            $('.tooltip').addClass('error');
	            $('.tooltip p').text("Use at least 8 characters. Don't re-use another password.");
	            return " ";
	        }else if ($('.tooltip').hasClass('error')) {
	        	$('.tooltipcontainer').slideDown();
	        	return "false";
			}
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function valid_password_chars
     * @description <p>Validate if a candidate password contains only reasonable characters</p>
     * @param {String} password
     * @returns {boolean} - error message
     */
    valid_password_chars: function(password) {
        var valid_characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-_.@'.split('');
        for (var i = 0; i < password.length; i++) {
            var c = password.charAt(i);
            if (valid_characters.indexOf(c) === -1) {
                return false;
            }
        }
        return true;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function validatePassword
     * @description <p>Performs additional validations for the password entered in the registration page.</p>
     * @param {String} newPassword - password value
     * @return {Boolean} true for valid password
     */
    validatePassword: function(newPassword) {
        var patt = /^[A-Z0-9a-z.@_-]{8,31}$/;
        var password = newPassword.toLowerCase();
        var validatePassword = patt.test(password);
        var email_id = $("#emailAddress").val();
        if (password.length < 8) {
            $('.coaching').addClass('error').text('Use at least 8 characters - it is best to include numbers, capital letters, or special characters.');
        } else if ((!patt.test(password))) {
            $('.coaching').addClass('error').text('The special character used is not permitted. Valid special characters: hyphen(-), underscore(_), period(.) and the at sign(@).').addClass('error');
            $('#new_password, #ng_pwr_password').removeClass('success').addClass('error');
        } else if (password.toLowerCase().indexOf(email_id.toLowerCase()) !== -1 && email_id !== '') {
            validatePassword = false;
            $('.coaching').text('Password can not be same as IBMid.').addClass('error');
            $('#new_password, #ng_pwr_password').removeClass('success').addClass('error');
        } else if (!$('#strengthMeter').html()) {
            $('.coaching').addClass('error').text('This password is very easy to guess. Please make your password more unique.');
        } else {
            if ($('#strengthMeter').html() == 'Acceptable')
                $('.coaching').text('Your password is OK, but try adding a few more characters for extra security.');
            else
                $('.coaching').text('Your password is ready to use.');
        }
        return validatePassword;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function populate_country
     * @description <p>populate the country field from the picklist and select the country based upon the browser locale. If no suitable locale is found then selected country will be US</p>
     * @return {void}
     */
    populate_country: function() {
    	var country_cc="";
    	$.ajax({
            url: ibmIDC.idUtil.servicesBasePath + 'browserlanguage',
            dataType: "json",
            global: false,
            async:false,
            success: function(data) {
            	if(data.locale){
            		country_cc=data.locale;
      		  }
            }
    	});
        	$.getJSON(ibmIDC.basePath +"/js/country.js", function(getValue) {
            if (country_cc.indexOf('-') !== -1) {
                country_cc = country_cc.split('-')[1].toLowerCase();
            } else {
                country_cc = "us";
            }
            ibmIDC.log("country_cc::" + country_cc);
            
            $('#country').empty();
            $("<option/>").attr("value", unescape("Select one")).text(unescape("Select one")).appendTo($("#country"));
            for (var v = 0; v < getValue[0].pickList.entry.length; v++) {
                var $option = $("<option/>").attr("value", unescape(getValue[0].pickList.entry[v].name)).text(unescape(getValue[0].pickList.entry[v].description.content)).appendTo($("#country"));
                if (country_cc) {
                    if (country_cc === (unescape(getValue[0].pickList.entry[v].name.toLowerCase()))) {
                        $option.attr('selected', 'selected');
                        $('select#country').select2();
                    }
                } else if (!country_cc) {
                    $('select#country').find('option[value="Select one"]').prop('selected', true);
                    $('select#country').select2();
                }
            }
        });
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function set_errormsg_and_redirect
     * @description <p>set the error messages for the cookies before redirect</p>
     * @param {String} regretmasg - Meaningful Regret message to the user.
     * @param {String} errmsg - exact error message.
     * @return {void}
     */
    set_errormsg_and_redirect: function(regretmesg, errmsg) {
        ibmIDC.idUtil.createCookie("regretmsg_cookie", regretmesg);
        ibmIDC.idUtil.createCookie("reg_msg_cookie", errmsg);
        //code added by Ravi for removing ctx paramter from failure pages.
        var qs = ibmIDC.qs;
        var ctxValue = ibmIDC.getIWMRefValue(qs,"ctx");
        qs = qs.replace("&ctx="+ctxValue,"");
        window.location.href = ibmIDC.idUtil.staticPagesBasePath +"failure_msg.html" + "?" + qs;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function resend_code
     * @description <p>resend code for registration</p>
     */
    resend_code: function() {
        var code_resend_data = {
            emailAddress: this.get_email()
        };
        // firing async call to check
        $.ajax({
            url: ibmIDC.idUtil.servicesBasePath + 'sendemail',
            type: 'POST',
            data: {
                "email": this.get_email()
            },
            beforeSend: function() {
               ibmIDC.formUtil.changeLoaderState("init");
            },
            dataType: "json",
            timeout: 30000,
            success: function(data) {
                $('input[name=emailAddress]').prop('disabled', false);
            	$('.ibm-spinner-container').css({'visibility':'hidden'});
            	if (data.status === 'success') {
                $('.sent-text').html(ibmIDC.err["emailSent"]);
                $("#resend_code").show();
                $(".resend-code").show();
                $("#resendemail").html("We have resent the code. Please check your inbox.");
                $(".arrow-container .buttontext").show();
            	}else{
            		 switch (data.statuscode) {
            		 case '201':
            			 ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg1, ibmIDC.err['201']);
                         break;
                     default:
                         ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg1, ibmIDC.err['REGFAIL']);
            		 }
            	}
            }
        });
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function validateUser
     * @description <p>validateUser </p>
     */
    validateUser: function(username,password,regExistingUser){
    	var req_data = {
                userName: username,
                password: password
              };
    	$.ajax({
            url: ibmIDC.idUtil.servicesBasePath + 'validateuser',
            type: 'POST',
            data: req_data,
            dataType: "json",
            async: false,
            global: false,
            timeout: 30000,
            success: function(data) {
            	if (data.status === 'success') {

            		//This line added by sridhar to delete the jsessionid cookie to resolve the product & services page issue
            		if(data.statuscode === '110'){
            			ibmIDC.formUtil.doRememberMe();
            			$("#ibmid >  span[data-message=\"ibmid\"]").removeClass('visible');
            			$('span[data-message="usererror"]').hide();
            			$("#ibmidtxt").attr('disabled', true);
            			$("#password-signin").hide();
            			$('#password-signin').parent().hide();
            			$('#keepSignedin').hide();
            			if(ibmIDC.formUtil.checkSbsProv()){
            				ibmIDC.formUtil.USER_STATUS=true;
                			ibmIDC.formUtil.checkSbs(regExistingUser);
            			}else{
            				ibmIDC.formUtil.delCookie("JSESSIONID");
            				ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
            		    	var targeturl=ibmIDC.formUtil.queryParam("Target");
            		    	if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
            		        	targeturl=ibmIDC.formUtil.queryParam("Target");
            		        }else if(ibmIDC.msgs.dest_url){
            		        	targeturl= ibmIDC.msgs.dest_url;
            		        }else{
            		        	targeturl= ibmIDC.idUtil.pwdContinueUrl;
            		        }
            				$('body').addClass('state-registering');
            		        $('#processing').fadeIn();
            		        $('#processing .loading-message').html('');
                            ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
            			}
            		}else{
            			if(regExistingUser === true){
            				$('#processing').fadeOut();
            				ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            			}
            			else{
            				switch(data.statuscode){
                    		case 'FBTBLU101E':
                    			$('#processing').fadeOut();
                    			//$('span[data-message="usererror"]').show().text(ibmIDC.err["FBTBLU101E"]);
                    			$('span[data-message="usererror"]').show().text("The password you have entered is incorrect. Please try again!");
                        	break;
                    		case 'FBTBLU106E':
                    			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTBLU106E"]);
                    		break;
                    		case 'FBTLU108E':
                    			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTLU108E"]);
                    		break;
                    		default:
                    			$('#processing').fadeOut();
                				//$('span[data-message="usererror"]').show().text(ibmIDC.err["FBTBLU101E"]);
                    			$('span[data-message="usererror"]').show().text("The password you have entered is incorrect. Please try again!");
                    		}
            			}
            		}
            	}else{
            		if(regExistingUser === true){
            			$('#processing').fadeOut();
        				ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
        			}
            		else{
            			ibmIDC.formUtil.delCookie("JSESSIONID");
            			ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                		$('span[data-message="ibmid"]').removeClass('visible');
                		switch(data.statuscode){
                		case 'FBTBLU101E':
                			$('#processing').fadeOut();
                			//$('span[data-message="usererror"]').show().text(ibmIDC.err["FBTBLU101E"]);
                			$('span[data-message="usererror"]').show().text("The password you have entered is incorrect. Please try again!");
                    	break;
                		case 'FBTBLU106E':
                			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTBLU106E"]);
                		break;
                		case 'FBTLU108E':
                			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTLU108E"]);
                		break;
                		default:
                			$('#processing').fadeOut();
            				//$('span[data-message="usererror"]').show().text(ibmIDC.err["FBTBLU101E"]);
                			$('span[data-message="usererror"]').show().text("The password you have entered is incorrect. Please try again!");
                		}
            		}
            	}
            },
            error: function() {
                $('#processing').fadeOut();
                ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            }
    	 });
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @param String
     * @memberOf ibmIDC
     * @function delCookie
     * @description <p>Delete cookie in ".ibm.com" domain </p>
     * @return {void}
     */
    delCookie: function(cookieName) {
        $.removeCookie(cookieName, {
            path: '/',
            domain: ".ibm.com"
        });
    },
    /**
     * @author pavan.sunkara@in.ibm.com
     * @param String
     * @memberOf ibmIDC
     * @function checkEmailValidation
     * @description <p>check business email validated or not</p>
     * @return {void}
     */
    checkEmailValidation: function() {
    	console.log("Sending Confirmation Code.");
    	//var req_data = {"action":"check","sendotp":"true","emailmask":"false"};
    	$.ajax({
            url: "https://"+ibmIDC.idUtil.idaasDomain+"/idaas/mtfim/sps/apiauthsvc?PolicyId=urn:ibm:security:authentication:asf:idaasEmailVerification",
            xhrFields: { withCredentials: true },
            type: 'POST',
            //data: JSON.stringify(req_data),
            dataType: "json",
            contentType: "application/json",
            async: 'false',
            global: false,
            timeout: 30000,
            success: function(data) {
            	$('#ibmSigninformDiff').hide();
            	if (data.state) {
            		console.log("Confirmation code sent.");
        			ibmIDC.formUtil.stateId = data.state;
        			if(ibmIDC.formUtil.RESEND_OTP){
        				var msg = ibmIDC.err["otpemailresent"];
        				if(ibmIDC.formUtil.BUSINESS_EMAIL && $("#ibmSigninformEmail").text() && ibmIDC.formUtil.BUSINESS_EMAIL !== $("#ibmSigninformEmail").text()){
        					msg = msg.replace("code", "code to "+ibmIDC.formUtil.BUSINESS_EMAIL);
        				}
        				$("#resendotp").html(msg);
        				$("#otp .field-code >div").html("");
        			}else{
        				var msg = ibmIDC.err["otpemailsent"];
        				if(ibmIDC.formUtil.BUSINESS_EMAIL && $("#ibmSigninformEmail").text() && ibmIDC.formUtil.BUSINESS_EMAIL !== $("#ibmSigninformEmail").text()){
        					msg = msg.replace("to", "to "+ibmIDC.formUtil.BUSINESS_EMAIL+" to");
        				}
        				$("#otp .field-code >div").html(msg);
        			}
        			$('#otp').css('display','block');
        			$('#otp').parent().show();
            	}else{
            		$('#otp').css('display','none');
             	}
            	$('#processing').fadeOut();
            },
        error: function(xhr) {
            var errorCode = xhr.responseJSON.execptionMsg;
            errorCode = errorCode.substring(0,errorCode.indexOf(" ")).trim();
            if(xhr.status === 500 && errorCode === 'FBTAUT010E'){
            	//login session expire
            	ibmIDC.formUtil.resetSignInForm();
            }
            else{
            	jQuery('#processing').fadeOut();
                jQuery('body').addClass('state-register-failure');
                ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            }
        }
    	 });
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function autoLogin
     * @description <p>autologin June/10 repalce valicate user call with login api. By sanjit </p>
     */
    autoLogin: function(redirecturl,username,password){

        $.when(ibmIDC.formUtil.loginUser(username,password)).then(
              function( response ) {
                ibmIDC.formUtil.delCookie("JSESSIONID");
                        ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                        ibmIDC.formUtil.redirectProvisionUserToServicePage(redirecturl);
                        /*window.setTimeout(function(){
                            window.location.href = redirecturl;
                        }, 3000 );*/
              },
              function( error ) {redirecturl
                jQuery('#processing').fadeOut();
                ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err[error.errorCode]);
              },
              function( notify ){
                if(notify.result == 'validation'){            
                    $('span[data-message="email"]').addClass('visible').text(ibmIDC.err[notify.errorCode]);
                }
              }
          );
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function confirmPassword
     * @description <p>Confirm Password</p>
     * @param {String} confirmPassword
     * @return {boolean} validateConfirmPassword
     */
    confirmPassword: function(confirmPassword) {
        if ($('#new_password').val() === confirmPassword || $('#ng_pwr_password').val() === confirmPassword) {
            var validateConfirmPassword = true;
            $('#confirmPassword, #ng_pwr_confirmPassword').removeClass('error').addClass('success');
            this.validatePassword($.trim($("#new_password, #ng_pwr_password").val()));
        } else {
            validateConfirmPassword = false;
            $('.coaching').addClass('error').text('These passwords do not match');
            $('#confirmPassword, #ng_pwr_confirmPassword').removeClass('success').addClass('error');
        }
        if (confirmPassword === "") {
            $('#confirmPassword, #ng_pwr_confirmPassword').removeClass('success').addClass('error');
        }
        return validateConfirmPassword;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function extractHost
     * @description <p>Extract Hostname from the URL</p>
     * @return {String} hostname
     */
    extractHost: function() {
        var urlparts = ibmIDC.idUtil.servicesBasePath.replace('https://', '').split(/[/?#]/);
        return urlparts[0];
    },
    /**
     * @author sabhpadm@in.ibm.com
     * @memberOf ibmIDC
     * @function provisionFailed
     * @description <p>Display the message when the user is registered but failed to provision.</p>
     */
   provisionFailed : function(userType,email){
        email=email || ibmIDC.formUtil.get_userName();
        $('#existinguserform input[name=email]').val(email);
        $('#existinguserform input[name=userType]').val(userType);
		ibmIDC.formUtil.user_Attempt = ibmIDC.formUtil.user_Attempt+1 ;
		$('#processing').fadeIn();

		if(userType === "newUser"){
   		$('#processing .loading-message').html(ibmIDC.err['NEW-USER-TRIAL-FAILS']);
	   	}else {
	   		$('#processing .loading-message').html(ibmIDC.err['EXISTING-USER-TRIAL-FAILS']);
	   	}

        setTimeout(function(){
            if(ibmIDC.formUtil.user_Attempt < 3){
                $('#processing').fadeOut();
                ibmIDC.formUtil.showExistingUser();
            }else{
                ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err['000']);
            }
        },4000);

	},
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function queryParam
     * @description <p>return the query param value based on the key passed</p>
     * @return {String} value of the query param
     */
    queryParam: function(key) {
        key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx control chars
        var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
        return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    },
 /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function targetParam
     * @description <p>return the target param value based on the URL passed</p>
     * @return {String} value of the Target Query param
     */
    targetParam: function(url) {
	var urls= ibmIDC.whitelist;
	var target=url;
	var basedesturl="";
	if(target){
	var base_target = target.split('?')[0];
	//Check for XSS Attack
	if(/[();"<>]+/g.test(target)){
	 basedesturl = "";
	}
	else{
		//loop through the domain whitelist and set the target URL as per requirement
		$.each(urls,function(index, value){
  	 	var matchurl= new RegExp('\\b('+value+')','g');
 	 	if(matchurl.test(base_target) == true){
    	 		basedesturl = target;
    	 		return false;
   	 	}
		else{
			basedesturl = "";
		}
		});
	}
	}
	return basedesturl;
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @function getPageName
     * @description <p>return the query param value based on the key passed</p>
     * @return {String} pagename - the name of the html file
     */
    getPageName: function() {
        var pagename = window.location.pathname.substring(window.location.pathname.lastIndexOf("/")).replace('/', '');
        return pagename;
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function getPageName
     * @description <p>return the query param value based on the key passed</p>
     * @return {String} pagename - the name of the html file
     */
    checkSbs: function(regExistingUser,email) {
    	console.log("Checking trial.");
    	var req_data = {
    			checkDeletedSubscriber: true,
       		 	partNumber:ibmIDC.formUtil.queryParam("partNumber"),
       		    emailAddress:ibmIDC.formUtil.get_fed_ibmid(),
       		    prov:ibmIDC.formUtil.getProv()
            };
    	if(regExistingUser === true){
    		req_data.emailAddress = ibmIDC.formUtil.get_userName();
    	}
    	else if(ibmIDC.formUtil.FEDUSER_STATUS === true){
    		req_data.emailAddress = email;
    	}
    	else if(ibmIDC.formUtil.LOGGED_IN_USER){
    		req_data.emailAddress = ibmIDC.formUtil.LOGGED_IN_USER;
    	}
    	var targeturl=ibmIDC.formUtil.queryParam("Target");
    	if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
        	targeturl=ibmIDC.formUtil.queryParam("Target");
        }else if(ibmIDC.msgs.dest_url){
        	targeturl= ibmIDC.msgs.dest_url;
        }else{
        	targeturl= ibmIDC.idUtil.pwdContinueUrl;
        }
        if(ibmIDC.formUtil.USER_STATUS || ibmIDC.formUtil.FEDUSER_STATUS){
        /*if(ibmIDC.formUtil.checkSbsProv()){*/
		    	$.ajax({
		            url: ibmIDC.idUtil.servicesBasePath + 'chkuser',
		            type: 'POST',
		            data: req_data,
		            dataType: "json",
		            timeout: 30000,
		            beforeSend: function() {
		            	if(!ibmIDC.formUtil.FEDUSER_STATUS){
			                $('body').addClass('state-registering');
			                $('#processing').fadeIn();
			                $('#processing .loading-message').html(ibmIDC.err['DFLT-EXISTING']);
		            	}
		            },
		            success: function(data) {
		            	ibmIDC.formUtil.USER_CHKSBS = true;
		            	if(data.status === 'success'){
		                	switch(data.statuscode){
		                    case '303':
		                    	
		                    	console.log("Trial doesn't exist.");
		                    	if(regExistingUser === true){
		                    		ibmIDC.formUtil.doSbs(ibmIDC.formUtil.get_userName(),regExistingUser);
		                    	}
		                    	else if(ibmIDC.formUtil.FEDUSER_STATUS === true){
		                    		console.log("Federated User.");
		                    		jQuery.removeCookie("IBMID_REMEMBERME_FED",{path:'/'});
		                    		ibmIDC.formUtil.chkRememberMeFed();
		                    		ibmIDC.formUtil.formVisiable('fedCompletenessform', email);
		                    		ibmIDC.formUtil.showAddfields('fedCompletenessform');
		            				$('.addfields').removeClass('loginaddfields').addClass('loginaddfieldshow');
		            				$('#fedSigninformAlready').hide();
                                    $('#processing').fadeOut();
		                    	}
		                    	else{
		                    		//Common code for both conditions.
		                    		console.log("IBMid user.");
		                    		$("#password-signin").hide();
	                    			$('#password-signin').parent().hide();
	                    			$("#signin").addClass("loginaddfields");
	                    			$('.addfields').removeClass('loginaddfields').addClass('loginaddfieldshow');
	                    			$('#fedSigninformDiff').hide();
	                    			$('#fedSigninformAlready').hide();
	                    			if($('#fedCompAddFields').children().length !== 0){
	                    			  ibmIDC.formUtil.showAddfields('signinFormAddFields');
	                    			}
	                    			if(!$('#company_existing > label').text()){
	                    			  $('#signinFormAddFields').removeClass('loginaddfieldshow').addClass('loginaddfields');
	                    			}
	                    			
		                    		if(ibmIDC.formUtil.EMAIL_VERIFIED === true){
		                    			//Email verfied.
		                    			console.log("Email verified.");
		                    			$('#processing').fadeOut();
		                    		}
		                    		else{
		                    			//Email not verified.
		                    			console.log("Email not verified.");
		                    			ibmIDC.formUtil.checkEmailValidation();
		                    		}
		                    	}
		                    	//code commnted by pavan
		                    break;
		                    default:
		                    	if(regExistingUser === true){
		                    		if(data.statuscode == '302'){
		                    			ibmIDC.formUtil.delCookie("JSESSIONID");
		                    			ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
		                    			$('body').addClass('state-registering');
		                    	        $('#processing').fadeIn();
		                    	        $('#processing .loading-message').html(ibmIDC.err['TRIAL-ALREADY']);
                                        ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
		                    		}
		                    		else{
		                    			$('#processing').fadeOut();
					            		ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
		                    		}
		                    	}
		                    	else{
		                    		console.log("Already having the trial.");
                                    ibmIDC.formUtil.delCookie("JSESSIONID");
                                    ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                                    $('body').addClass('state-registering');
                                    $('#processing').fadeIn();
                                    if(ibmIDC.formUtil.FEDUSER_STATUS){
                                    	$('#processing .loading-message').html(ibmIDC.err['FED-USER-TRIAL-ALREADY']);
                                        ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl,email);
                                    }else{
                                    	$('#processing .loading-message').html(ibmIDC.err['TRIAL-ALREADY']);
                                       ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
                                    }

		                    	}
		                    }
		            	}else{
		            		$('#processing').fadeOut();
		            		 ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
		            	}
		            },
		            error: function() {
		                $('#processing').fadeOut();
		                $('body').addClass('state-register-failure');
		                ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
		            }
		        });
        /*}else{
            ibmIDC.formUtil.delCookie("JSESSIONID");
            ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");;
            ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl,'');
            }*/
        }
    },

    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmIDC
     * @function doFedprovisionUserRedirectToServicePage
     * @description <p>check fed user provision is there and logged in as well.</p>
     * @param {String} targeturl
     */
    redirectProvisionUserToServicePage: function(targeturl,email){
        /*$('body').addClass('state-registering');
        $('#processing').fadeIn();
        $('#processing .loading-message').html(msgs);*/
    	var timeout = 3000;
    	var rwait = ibmIDC.formUtil.queryParam("rwait");
    	if(rwait && isNaN(rwait) === false && rwait >= 0){
    		console.log("rwait ::: "+rwait);
    		if(rwait <= 15){
    			timeout = rwait * 1000;
    		}
    		else{
    			timeout = 15000;
    		}
		    
		}
		else{
		    console.log("Not a number OR Negative value ::: "+rwait);
		}
    	console.log("timeout::: "+timeout);
        setTimeout(function(){
        	if(ibmIDC.formUtil.queryParam("trial")!=='yes' && ibmIDC.formUtil.REGISTER_ONLY !== true){
        		ibmIDC.formUtil.doIwm(email);
        	}
        	console.log("Redirecting to ::: "+targeturl);
            window.location.href = targeturl;
        }, timeout);
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function corematrixCreate
     * @description <p>SBS Provision</p>
     * @param {String} email
     */
    doSbs: function(user_email,regExistingUser) {
    	var sbsdata={
    			email:user_email,
       		 	partNumber:ibmIDC.formUtil.queryParam("partNumber"),
       		 	permission: ibmIDC.formUtil.get_permission_existing(),
       		 	federated: 'no',
       		 	action:'provision',
       		 	prov:ibmIDC.formUtil.getProv()
    	};
    	/*if((ibmIDC.formUtil.get_Otp() !== "undefined" && ibmIDC.formUtil.get_Otp() !== "") && (ibmIDC.formUtil.get_Otp() !== "undefined" && ibmIDC.formUtil.get_Otp() !== "")){
    		sbsdata.otpvalue = ibmIDC.formUtil.get_Otp();
    		sbsdata.stateid = ibmIDC.formUtil.stateId;
    	}*/
    	if(ibmIDC.formUtil.get_company_existing()){
    		sbsdata.company = ibmIDC.formUtil.get_company_existing();
    	}
    	if(ibmIDC.formUtil.get_phoneNumber_existing()){
			 sbsdata.phone = ibmIDC.formUtil.get_phoneNumber_existing();
			 sbsdata.type = ibmIDC.subsInfo.shortform.type;
    	}
    	if(ibmIDC.formUtil.FEDUSER_STATUS === true){
    		sbsdata.federated = 'yes';
    		ibmIDC.formUtil.doRemembermefed('SBS',user_email);
    	}
    	sbsdata = ibmIDC.registerJsonData(sbsdata);
        var targeturl=ibmIDC.formUtil.queryParam("Target");
        if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
        	targeturl=ibmIDC.formUtil.queryParam("Target");
        }else if(ibmIDC.msgs.dest_url){
        	targeturl= ibmIDC.msgs.dest_url;
        }else{
        	targeturl= ibmIDC.idUtil.pwdContinueUrl;
        }
    	$.ajax({
            url: ibmIDC.idUtil.servicesBasePath + 'register',
            type: 'POST',
            data: sbsdata,
            dataType: "json",
            beforeSend: function() {
                $('body').addClass('state-registering');
                $('#processing').fadeIn();
                if(ibmIDC.err[ibmIDC.formUtil.queryParam("partNumber")+'-EXISTING']){
                $('#processing .loading-message').html(ibmIDC.err[ibmIDC.formUtil.queryParam("partNumber")+'-EXISTING']);
                }else{
                	$('#processing .loading-message').html(ibmIDC.err['TRIAL-EXISTING']);
                }
            },
            success: function(data) {
            	if(regExistingUser === true){
            	 	if(data.statuscode == '114'){
            	 		ibmIDC.formUtil.delCookie("JSESSIONID");
            	 		ibmIDC.formUtil.coremetricsTagging("IBMid registration", "2");
            	 		ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
            	 		/*window.setTimeout(function(){
	                     	window.location.href = targeturl;
                        }, 3000 );*/
            	 	}
            	 	else{
            	 		$('#processing').fadeOut();
            	 		ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            	 	}
            	}
            	else{
            		switch(data.statuscode){
                	case '117':
                	case '304':
                	case '308':
                	case '309':
                	case '310':
                	case '313':
                		$('#processing').fadeOut();
                		ibmIDC.formUtil.provisionFailed("registered",user_email);
                    break;
                    case '303':
                    	ibmIDC.formUtil.delCookie("JSESSIONID");
                    	ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                    	ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
                    	/*window.setTimeout(function(){
	                    	window.location.href = targeturl;
                        }, 3000 );*/
                    break;
                    case '114':
                    	ibmIDC.formUtil.delCookie("JSESSIONID");
                    	ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                    	ibmIDC.formUtil.coremetricsTagging("IBMid registration", "2");
                    	ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
                    	/*window.setTimeout(function(){
	                    	window.location.href = targeturl;
                        }, 3000 );*/
                    break;
                    case '130':
                    	//Some reason otp is not verified
                    	$("#resendotp").html("");
                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.otpNotVerified);
                    	$('#processing').fadeOut();
                    	break;
                    case 'FBTAUT017E':
                    	//invalid state id
                    	$("#resendotp").html("");
                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.invalidStateId);
                    	$('#processing').fadeOut();
                    	break;
                    case 'FBTOTP310E':
                    	//invalid otp
                    	$("#resendotp").html("");
                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.invalidOtp);
                    	$('#processing').fadeOut();
                    	break;
                    default:
                    	ibmIDC.formUtil.delCookie("JSESSIONID");
                    	ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                    	ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
                    /*window.setTimeout(function(){
                    	window.location.href = targeturl;
                    }, 3000 );*/
                	}
            	}
            },
            error: function() {
               ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
           }
    	});
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function registerExistingUser
     * @description <p>SBS Provision</p>
     * @param {String} email
     */
    registerExistingUser: function(user_email) {
    	var regExistingUser = true;
    	//ibmIDC.formUtil.validateUser(ibmIDC.formUtil.get_userName(),ibmIDC.formUtil.get_password(),regExistingUser);
    	jQuery.when(ibmIDC.formUtil.loginUser(ibmIDC.formUtil.get_userName(),ibmIDC.formUtil.get_password(),regExistingUser)).then(function( response ) {
    		ibmIDC.formUtil.loginSuccessCallback(regExistingUser);
            // do additional stuff after login success
          },
          function( error ) {
            jQuery('#processing').fadeOut();
            ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err[error.errorCode]);
            //handle additional error condition if any call fails.
          }
      );
    },
    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmIDC
     * @function retryProvision
     * @description <p>SBS Provision</p>
     * @param {String} email
     */
    retryProvision: function(email) {
        var regExistingUser = true;
        email=email || ibmIDC.formUtil.get_userName();
        ibmIDC.formUtil.doSbs(email,true);
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function checkSbs
     * @description <p>Check Sbs</p>
     * @param {boolean}
     */
    checkSbsProv: function() {
    	if(ibmIDC.formUtil.queryParam("partNumber") && ibmIDC.formUtil.queryParam("trial")==='yes'){
    		return true;
    	}else{
    		return false;
    	}
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function checkTrial
     * @description <p>Check Trial</p>
     * @param {boolean}
     */
    checkTrial: function() {
    	if((ibmIDC.formUtil.queryParam("trial")==='yes') || (ibmIDC.formUtil.queryParam("trial")==='no')){
    		return true;
    	}else{
    		return false;
    	}
    },
    showTrial: function(){
    	$('.alreadyibmid').html('<a id="signin" href="#" class="ibm-forward-link ibm-inlinelink">Need an IBMid?</a>').removeClass('alreadyibmid').addClass('createibmid');
    	$('.alreadyibmid').html();
    	$('#longform').hide();
    	$('#shortform').show();
    	$('.ibmid-ctx-title').addClass("ibm-hide");
		$('.ibmid-ctx-title-existing').removeClass("ibm-hide");
		/*var tok=ibmIDC.msgs['tokens'];
    	if(tok){
    		//$('#ibm-pagetitle-h1').html(tok[1][1]);
    		$('title').text(tok[3][1]);
    	}else{
    		$('title').text('Sign in using your IBMid');
    	}*/
    },
    
    getProv : function(){
    	var prov = "sbs";
    	if(window.ibmIDMsgs && ibmIDMsgs.prov || $.inArray(ibmIDC.formUtil.queryParam('a'), ["BMcdt","BMstg","BM"]) !== -1){
    		if(window.ibmIDMsgs){
    			prov = ibmIDMsgs.prov;
    		}else{
    			prov = "bms";
    		}
    	}
    	return prov;
    },
    
    
    showExistingUser: function(){
    	$('.alreadyibmid').html("");
    	$('#longform').hide();
        $('.form-view').hide();
    	$('#existinguserform').show();
    	//$('#emailFedId').val("");
    	//$('input[name=emailAddress]').val("");
    	/*var tok=ibmIDC.msgs['tokens'];
    	if(tok){
    		$('#ibm-pagetitle-h1').html(tok[1][1]);
    		$('title').text(tok[3][1]);
    	}else{

    		$('title').text('Sign in using your IBMid');
    	}*/
    	$('.ibmid-ctx-title').addClass("ibm-hide");
		$('.ibmid-ctx-title-existing').removeClass("ibm-hide");
    },
    showLongform: function(){
    	$('#shortform').hide();
    	$('#longform').show();
    	$('#emailFedId').val("");
    	$('input[name=emailAddress]').val("");
    	/*var tok=ibmIDC.msgs['tokens'];
    	if(tok){
    		$('#ibm-pagetitle-h1').html(tok[0][1]);
    		$('title').text(tok[2][1]);
        	}else{

        		$('title').text('Sign up for an IBMid');
        	}*/
    	$('.ibmid-ctx-title').removeClass("ibm-hide");
		$('.ibmid-ctx-title-existing').addClass("ibm-hide");

        $('.signin-title').hide();
        $('#fedSigninformAlready').show();

    	$('.sent-text').removeClass('sent-show');
    	$('#edit_email').hide();
    	$('#resend_code').hide();
    },
    longFormvisiable: function(){
    	$('#emailAddress').addClass('valid');
    	$('.sent-text').addClass('sent-show');
    	$('.sent-show').removeClass('sent-text');
    	$('.email-text').hide();
        $("#emailAddress").addClass("valid");
        $('.dimmed :input').attr('disabled', false);
        $('.dimmed').addClass('un-dimmed');
        $('#email-description').hide();
        $('.email-code').show();
        $(".border-line:odd").show();
        $('#email-input').css('margin-bottom', '0');
        $(".sent-text").html(ibmIDC.err["emailSent"]);
        $("#resend_code").show();
        $(".resend-code").show();
        $('.select2-selection.select2-selection--single:first').focus();
        $('#processing').fadeOut();
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function corematrixCreate
     * @description <p>Core matrix event</p>
     * @param {String} email Id
     * @return {boolean} validateConfirmPassword
     */
    doIwm: function(email) {
    	if(ibmIDC.formUtil.queryParam("source") && ibmIDC.formUtil.queryParam("pkg")){
    		var iwmdata={
        			//email:ibmIDC.formUtil.get_email(),
    				email:$('#ibmSigninformEmail').text().trim(),
        			action:'registeriwm'
        	};
    		if(ibmIDC.formUtil.FEDUSER_STATUS === true){
    			iwmdata.email = email;
    		}
    		iwmdata = ibmIDC.registerJsonData(iwmdata);
    		$.ajax({
	            url: ibmIDC.idUtil.servicesBasePath + 'register',
	            type: 'POST',
	            beforeSend: function() {
	                $('body').addClass('state-registering');
	                //$('#processing').fadeIn();
	                //$('#processing .loading-message').html(ibmIDC.err['DFLT-EXISTING']);
	            },
	            async: false,
	            data: iwmdata
	    	});
    	}
    },
    /**
     * @author sabhpadm@in.ibm.com
     * @memberOf ibmIDC
     * @function corematrixCreate
     * @description <p>Core matrix event Tagging</p>
     * @param {String} eventtargest, eventname
     */
    corematrixCreate: function(evttarget, evtname) {
    	if(window.ibmStats){
	        ibmStats.event({
	            'ibmEV': 'Internal link',
	            'ibmEvAction': window.location.href,
	            'ibmEvTarget': evttarget,
	            'ibmEvLinkTitle': 'Registration form',
	            'ibmEvGroup': 'IBM id iDaaS default',
	            'ibmEvName': evtname,
	            'ibmEvModule': 'Registration A1',
	            'ibmEvSection': 'null',
	            'ibmEvFileSize': 'null'
	        });
    	}
    },
    
    /**
     * @author sabhpadm@in.ibm.com
     * @memberOf ibmIDC
     * @function coremetricsTagging
     * @description <p>Core metrics conversion Tagging</p>
     * @param {String} param1, param2
     */
    coremetricsTagging: function(param1, param2) {
    	var productName ="iDaaS Trial Sign Up";
    	if(ibmIDC.formUtil.queryParam("trial")==='yes' && ibmIDC.formUtil.queryParam("siteID") ==='ECOM' && ibmIDC.formUtil.queryParam("a")&&
    			window.ibmIDMsgs && ibmIDMsgs.product_name){
	    			productName = "MK Trial Sign UP";
	    			param1 = "Trial "+ibmIDMsgs.product_name;
    	}
    	if(param2==="2"){
    		ibmIDC.formUtil.formSuccess();
    	}
    	
    	if(window.ibmStats){
    		cmCreateConversionEventTag(param1, param2, productName);
    	} 
    },
    
    
    /**
     * @author sabhpadm@in.ibm.com
     * @memberOf ibmIDC
     * @function formSuccess
     * @description <p>optmizely event is triggred</p>
     * @param {String} param1, param2
     */
    
    formSuccess : function(){
    	window['optimizely'] = window['optimizely'] || [];
    	window.optimizely.push(["trackEvent", "form_success"]);
	},
    formVisiable: function(formId, email){
        $('input#'+formId+'Email').val(email);
    	$('#emailFieldId').val(email);
    	$('.signin-title').toggleClass('ibm-hide', true);
    	if(formId == 'longform'){
    		$('#shortformDiff').toggleClass('ibm-hide', false);
    	}else{
    		$('#fedSigninformDiff').toggleClass('ibm-hide', false);
    	}

    	$('.reg-view').toggleClass('ibm-hide', true);
    	$('#'+formId).toggleClass('ibm-hide', false);
    	//fallback
    	$('.reg-view, .form-view').hide();
    	$('#'+formId).show();


    },
    ibmidFormVisiable: function(){
        $('.signin-title').hide();
        $('#shortformDiff').removeClass('ibm-hide').show();
        $(".ibm-id-fields").removeClass("un-dimmed");
    	$('#emailFedId').val("");
    	$('input[name=emailAddress]').val("");
        $('.form-view').hide();
    	$('#shortform').show();

    	$('.ibmid-ctx-title').addClass("ibm-hide");
		$('.ibmid-ctx-title-existing').removeClass("ibm-hide");
        //$('title').text('Sign in to Silverpop');
        $("#shortform #emailFedId").focus();
        var tok=ibmIDC.msgs['tokens'];
        if(tok){
    		jQuery('title').text(tok[3][1]);
    	}else{
    		jQuery('title').text('Sign in using your IBMid');
    	}
    	//$('#signin')[0].click();
    },
    coremetricsTagging: function(param1, param2) {
        cmCreateConversionEventTag(param1, param2, "iDaaS Trial Sign Up");
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmid
     * @param String
     * @function displayErrorMsg
     * @description <p>Display error message repective feild</p>
     * @return String
     */
    displayErrorMsg: function(fieldName,error){
    	//Show appropriate error message
    	var fieldName= fieldName === 'country'?'countryCode':fieldName;
    	if(fieldName!=='password'){
			var error_element_query = '#' + fieldName + ' > ' + ' span[data-message="' + fieldName + '"]';
			$('#'+fieldName+' input').addClass('ibm-field-error');
			$(error_element_query).addClass('visible').html(error);
    	}else{
    		$('#'+fieldName+' input').addClass('ibm-field-error');
    		$(".tooltipcontainer").show();
    		$('.tooltip').addClass('error');
    	}
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmid
     * @param
     * @function chkRememberme
     * @description <p>Check if the remember me checkbox is checked or not</p>
     * @return
     */
    doRememberMe: function(){
    	if($('#IBMidKeepSignedin').prop('checked')){
    	$.cookie("IBMID_REMEMBERME", ibmIDC.formUtil.get_fed_ibmid(),{expires:20*365,path:'/'});
    	}else{
    		jQuery.removeCookie("IBMID_REMEMBERME",{path:'/'});
    	}

    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmid
     * @param
     * @function chkRememberme
     * @description <p>Check if the remember me checkbox is checked or not</p>
     * @return
     */
    doRemembermefed: function(status,email ){
    	if(typeof email === 'undefined'){
    		email = ibmIDC.formUtil.get_email();
    	}
   	 switch(status){
   	 
   	 case 'SBS':
   		 if($.cookie('IBMID_REMEMBERME_FED')){
      		 jQuery.removeCookie("IBMID_REMEMBERME_FED",{path:'/'});
   		 }
   		 
   		 $.cookie("IBMID_REMEMBERME_FED_SBS", email,{expires:20*365,path:'/'});
   	 break;
   	 default:
   		 
       	 if($('#KEEP_CHECK').prop('checked') && !$.cookie('IBMID_REMEMBERME_FED')){
       	  $.cookie("IBMID_REMEMBERME_FED", ibmIDC.formUtil.get_email(),{expires:20*365,path:'/'});
       	   }else if($('#KEEP_CHECK').prop('checked')== false && !$.cookie('IBMID_REMEMBERME_FED_SBS')){
       		jQuery.removeCookie("IBMID_REMEMBERME_FED",{path:'/'});
       	   }else if($('#KEEP_CHECK').prop('checked')== false && $.cookie('IBMID_REMEMBERME_FED_SBS')){
       		jQuery.removeCookie("IBMID_REMEMBERME_FED_SBS",{path:'/'});
       	   }
       	    		
   	 }
   	

   },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmid
     * @param
     * @function chkRemembermefed
     * @description <p>Check if the remember me checkbox is checked or not for fedarated user</p>
     * @return
     */
   chkRememberMeFed: function(){
    var targeturl=ibmIDC.formUtil.queryParam("Target");
		if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
	   	targeturl=ibmIDC.formUtil.queryParam("Target");
    }else if(ibmIDC.msgs.dest_url){
    	targeturl= ibmIDC.msgs.dest_url;
    }else{
    	targeturl= ibmIDC.idUtil.pwdContinueUrl;
    }
   	var feduser = $.cookie('IBMID_REMEMBERME_FED');
   	var fedusersbs = $.cookie('IBMID_REMEMBERME_FED_SBS');
   	var fuser="";
   	if(feduser)
   	{
   		fuser=feduser;
   	}else{
   		
   		fuser=fedusersbs;
   	}
   	if(ibmIDC.formUtil.isLoggedIn == false && fuser){
   		var formName='shortForm';
       
        jQuery.ajax({
            url: ibmIDC.idUtil.servicesBasePath+'idsource?userName='+encodeURIComponent(fuser),
            dataType: "json",
            timeout: 30000,
            beforeSend: function() {
            	if(formName == 'longForm'){
                    ibmIDC.formUtil.changeLoaderState("init");
                }else{
                    $('#processing .loading-message').html('Please wait while we process your request.');
                    $('#processing').fadeIn();
                }
            },
            success: function(data) {
            	ibmIDC.formUtil.changeLoaderState("end");
                if(data.status == 'success'){
                    var responseObj=data.response[0] || false;
                    if(responseObj.providerType == 'ibmldap'){
                    	//IBMid User
                        jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                        //ask for the password only
                        //If the authenticated session is IBMid then need to show short form with the password field, so commented above code and written below code.
                        ibmIDC.formUtil.prepareFormForPassword(email);
                        jQuery('#processing').fadeOut();
                    }else{
                    	//Fed User
                    	ibmIDC.formUtil.FEDUSER_STATUS = true;
                        $.cookie("ORG_INSTANCE_NAME",responseObj.instanceName ,{expires:20*365,path:'/'});
                        var redURL = responseObj.properties[0].value;
                    	if(redURL.indexOf("?") > -1){
                    		redURL = redURL+"&Target="+escape(window.location.href);
                    	}
                    	else{
                    		redURL = redURL+"?Target="+escape(window.location.href);
                    	}
                    	jQuery('#redirectURL').val(redURL);
                        if(ibmIDC.formUtil.isLoggedIn){
                            if(ibmIDC.formUtil.checkSbsProv()){
                        		console.log("Trial Required.");
                        		ibmIDC.formUtil.checkSbs(false,email);
                        	}
                        	else{
                        		console.log("Trial Not Required, sending to destination page.");
                        		ibmIDC.formUtil.delCookie("JSESSIONID");
                                ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                                $('body').addClass('state-registering');
                                $('#processing').fadeIn();
                                $('#processing .loading-message').html();
                                ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
                        	}
                        }
                    }
                }else{
                	//If the response is failure, need to take the user to faliure page.
                	jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                	$('#processing').fadeOut();
                   	switch(data.statuscode){
            		case 'FBTBLU127E':
            			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTBLU127E"]);
            			break;
            		default:
            			ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            	}
                    
                }
            },
            error: function(xhr,data) {
            	//The user id is not available in the federated and idaas which is treated as a New user and the response is 404. So, the flow will come here and hadled here.
            	if (xhr.status == 404) {
                    jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                    if(formName == 'longForm'){
                        ibmIDC.formUtil.validate_email_existence(email);
                    }
                    else{
                    	$('#processing').fadeOut();
                    	switch(data.statuscode){
	                		case 'FBTBLU127E':
	                			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTBLU127E"]);
	                			break;
	                		case 'FBTIDA038E':
	                			ibmIDC.formUtil.displayErrorMsg("emailFed",'We didn\'t recognize this IBMid or email. Please check your entry or <a id="createNewIBMid" href="#">Create a new IBMid?</a>');
	                			break;
	                		default:
	                			ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg1, ibmIDC.err['REGFAIL']);
                    	}
                    }
            	}
            	else{
            		jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                	$('#processing').fadeOut();
                    ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            	}
            }
        });
   	}
   	
   	if(fuser){
   		
   		ibmIDC.formUtil.prepareFedForm(fuser);
   		ibmIDC.formUtil.switchFormView(jQuery('#fedform'));
   		$('#KEEP_CHECK').iCheck('check');
   	}else{
   		jQuery("#fedform").hide();
   	}

   },

    

    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmid
     * @param
     * @function chkRememberme
     * @description <p>Check if the remember me checkbox is checked or not</p>
     * @return
     */
    chkRememberMe: function(){
    	var feduser = $.cookie('IBMID_REMEMBERME');
    	if(feduser){
    		$('#ibmSigninformEmail').html(feduser);
    		$('#emailFieldId').val(feduser);
    		$('#IBMidKeepSignedin').iCheck('check');
    		$('#shortform').addClass('ibm-hide');
    		$('#ibmSigninform').removeClass('ibm-hide');
    	}else{
    		ibmIDC.formUtil.showLongform();
    	}

    },
    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmid
     * @param
     * @function checkUserByEmail
     * @description <p>ajax response mocking for checkuser ajax call</p>
     * @return
     */
    checkUserByEmail: function(email){
    	var targeturl=ibmIDC.formUtil.queryParam("Target");
    	if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
        	targeturl=ibmIDC.formUtil.queryParam("Target");
        }else if(ibmIDC.msgs.dest_url){
        	targeturl= ibmIDC.msgs.dest_url;
        }else{
        	targeturl= ibmIDC.idUtil.pwdContinueUrl;
        }
    	var formName='shortForm';
        if(ibmIDC.formUtil.get_email()){
            formName='longForm';
        }
        jQuery.ajax({
            url: ibmIDC.idUtil.servicesBasePath+'idsource?userName='+encodeURIComponent(email),
            dataType: "json",
            timeout: 30000,
            beforeSend: function() {
            	if(formName == 'longForm'){
                    ibmIDC.formUtil.changeLoaderState("init");
                }else{
                    $('#processing .loading-message').html('Please wait while we process your request.');
                    $('#processing').fadeIn();
                }
            },
            success: function(data) {
            	ibmIDC.formUtil.changeLoaderState("end");
                if(data.status == 'success'){
                    var responseObj=data.response[0] || false;
                    if(responseObj.providerType == 'ibmldap'){
                    	//IBMid User
                        jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                        //ask for the password only
                        //If the authenticated session is IBMid then need to show short form with the password field, so commented above code and written below code.
                        ibmIDC.formUtil.prepareFormForPassword(email);
                        jQuery('#processing').fadeOut();
                    }else{
                    	//Fed User
                    	ibmIDC.formUtil.FEDUSER_STATUS = true;
                    	var companyName = responseObj.instanceName.trim();
                    	if(companyName.indexOf('--') !== -1){
                    		companyName = companyName.split('--')[1].trim();
                    	}
                    	ibmIDC.log("Company ::: "+companyName);
                        $.cookie("ORG_INSTANCE_NAME", companyName, {expires:20*365,path:'/'});
                        var redURL = responseObj.properties[0].value;
                    	if(redURL.indexOf("?") > -1){
                    		redURL = redURL+"&Target="+escape(window.location.href);
                    	}
                    	else{
                    		redURL = redURL+"?Target="+escape(window.location.href);
                    	}
                    	jQuery('#redirectURL').val(redURL);
                        if(ibmIDC.formUtil.isLoggedIn){
                        	if(ibmIDC.formUtil.checkSbsProv()){
                        		console.log("Trial Required.");
                        		ibmIDC.formUtil.checkSbs(false,email);
                        	}
                        	else{
                        		console.log("Trial Not Required, sending to destination page.");
                        		ibmIDC.formUtil.delCookie("JSESSIONID");
                                ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                                $('body').addClass('state-registering');
                                $('#processing').fadeIn();
                                $('#processing .loading-message').html();
                                ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl,email);
                        	}
                        }else{
                            ibmIDC.formUtil.prepareFedForm(email);
                            ibmIDC.formUtil.switchFormView($('#fedform'));
                            jQuery('#processing').fadeOut();
                        }
                    }
                }else{
                	//If the response is failure, need to take the user to faliure page.
                	jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                	$('#processing').fadeOut();
                   	switch(data.statuscode){
            		case 'FBTBLU127E':
            			ibmIDC.formUtil.set_errormsg_and_redirect("", ibmIDC.err["FBTBLU127E"]);
            			break;
            		default:
            			ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            	}
                    
                }
            },
            error: function(xhr,data) {
            	//The user id is not available in the federated and idaas which is treated as a New user and the response is 404. So, the flow will come here and hadled here.
            	if (xhr.status == 404) {
                    jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                    if(formName == 'longForm'){
                        ibmIDC.formUtil.validate_email_existence(email);
                    }
                    else{
                    	ibmIDC.formUtil.displayErrorMsg("emailFed",'We didn\'t recognize this IBMid or email. Please check your entry or <a id="createNewIBMid" href="#">Create a new IBMid?</a>');
                    	$('#processing').fadeOut();
                    }
            	}
            	else{
            		jQuery.removeCookie("ORG_INSTANCE_NAME",{path:'/'});
                	$('#processing').fadeOut();
                    ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
            	}
            }
        });
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmid
     * @param
     * @function checkAuthenticatedSession
     * @description <p>Checking the login session is available or not.</p>
     * @return
     */
    checkAuthenticatedSession: function(){
    	$.ajax({
    		url: ibmIDC.idUtil.userStatusUrl,
    		type: 'GET',
    		//sync:true,
    		jsonp: "callback",
    		jsonpCallback: 'ibmidcallback',
    		contentType: "application/json",
    		dataType: 'jsonp',
    		beforeSend: function() {
    			jQuery('#processing').fadeIn();
                jQuery('#processing .loading-message').html('Please wait while we process your request');
            },
    		async: false,
            global: false,
            timeout: 30000,
    		success: function(data){
    			jQuery('#processing').fadeOut();
    			if(data.user !== "Unauthenticated"){
                    ibmIDC.formUtil.userDetails=data;
    				//Need to write here the Federated API call.
                    ibmIDC.formUtil.isLoggedIn=true;
                    var fedId = "";
                    /*if(data.user){
                    	if(new RegExp(ibmIDC.formUtil._regexp.emailFormat).test(data.user)){
                    		fedId = data.user;
                    	}
                    	else{
                    		fedId = data.user.substring(data.user.lastIndexOf("/")+1, data.user.length);
                    	}
                    }*/
    				ibmIDC.log("User authenticated ::: "+data.user);
    				//For non federated ids we are not calling identity source api.
    				if(data.isFederated === false){
    					//Should not ask password again, already session recognised.
    					//ibmIDC.formUtil.prepareFormForPassword(data.user);
						// code commented by pavan for fixing defect 1231984
                        //ibmIDC.formUtil.validate_email_existence(data.user);
    					console.log("Idaas User.. calling self care API.");
    					ibmIDC.formUtil.getUser();
    				}
    				else{
    					console.log("Federated User, and calling Identity souce API.");
    					ibmIDC.formUtil.checkUserByEmail(data.user);
    				}
    			}
    			else{
                    ibmIDC.formUtil.isLoggedIn=false;
    				ibmIDC.log("User ::: "+data.user);
    			}
    		},
    		error: function(e){
    			ibmIDC.log("checkSignin "+e.message);
    		}
    	});
    },
    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmid
     * @param 
     * @function switchFormView
     * @description <p>swich between form-view elements depemnding upon users action</p>
     * @return null
     */
    switchFormView: function(object){
        $('.form-view').addClass('ibm-hide').hide();
        object.removeClass('ibm-hide').fadeIn();
        $('#processing').fadeOut();
        $('.ibmid-ctx-title').addClass("ibm-hide");
		$('.ibmid-ctx-title-existing').removeClass("ibm-hide");
		if(object.attr('id')=='fedform'){
			$('#continue_to_fed').focus();
		}
    },
    prepareFedForm:function(email){
        if($.cookie("ORG_INSTANCE_NAME") && $.cookie("ORG_INSTANCE_NAME")!=''){
            $('.orgInstanceName').html($.cookie("ORG_INSTANCE_NAME"));
        }
        else{
            $('.orgInstanceName').html('Your Organization');
        }
    	$('.ibmid-ctx-title').addClass("ibm-hide");
		$('.ibmid-ctx-title-existing').removeClass("ibm-hide");
        $("#fedform h5 strong").text(email);
        $('.signin-title').hide();
        $('#fedSigninformDiff').show();
        
        //jli: static fake text for now.
//        if($('input[name=emailAddress]').val() == email)
//        	$("#fedform h4 span").html("Your email is already linked to an account.");
//        else
//        	$("#fedform h4 span").html("");
    },
    prepareFormForPassword: function(email){
        $("#ibmSigninformEmail").text(email);
        $('#emailFieldId').val(email);
        $('.signin-title,.form-view').hide();
        $('#ibmSigninform, #fedSigninformDiff').show();
        $('.ibmid-ctx-title').addClass("ibm-hide");
		$('.ibmid-ctx-title-existing').removeClass("ibm-hide");
		$("#ibmSigninform #password-field-signin").focus();
		$("#password-signin > .ibm-alert-link").removeClass("visible").text("");
		$('#password-signin > span.error').removeClass('visible');
		$('#password-field-signin').removeClass('valid');
		$('#password-field-signin input').removeClass('ibm-field-error');
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmid
     * @function showAddfields
     * @description <p>Displaying the additional fiedls (company & phone) in the short form and federated form.</p>
     * @param {String} input - string value which will diffentiate which form need to show.
     * @returns {void}
     */
    showAddfields: function(fedForm){
    	if(fedForm === 'fedCompletenessform'){
    		$('#company_existing').hide();
    		var addHtml=$('#signinFormAddFields').html();
        	$('#fedCompAddFields').html(addHtml);
        	$('#signinFormAddFields').html('');
        	if(!$('#company_existing > label').text()){
        		$('#addInfo').hide();
    		}
        	$('#fedCompAddFields #phoneNumber_existing input[type="text"]').focus();
    	}
    	else{
    		$('#company_existing').show();
    		var addHtml=$('#fedCompAddFields').html();
        	$('#signinFormAddFields').html(addHtml);
        	$('#fedCompAddFields').html('');
        	if(!$('#company_existing > label').text()){
        		$('#signinFormAddFields').removeClass('loginaddfieldshow').addClass('loginaddfields');
    		}
    	}
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmid
     * @function resetIbmSigninForm
     * @description <p>Restting the ibmSigninForm to intial state.</p>
     * @returns {void}
     */
    resetIbmSigninForm: function(){
        $('input[name=company_existing],input[name=phoneNumber_existing]').val('');
    	$('.addfields').removeClass('loginaddfieldshow').addClass('loginaddfields');
    	$('#password-field-signin').val('');
    	$('#password-signin').show();
    	jQuery('#password-signin').parent().show();
        // do not show remember me 
    	//$('#keepSignedin').show();
    	$('.ibm-columns > span[data-message="usererror"]').css("display","none").text("");
    	$('#password-signin span[data-message="passwordfield"]').removeClass("visible").text("");
    	ibmIDC.formUtil.USER_CHKSBS = false;
    	ibmIDC.formUtil.USER_STATUS = false;
    },
    /**
     * @author sabhpadm@in.ibm.com
     * @memberOf ibmIDC
     * @function setTermsAndConditionLink
     * @description <p>Set the terms and condition link as per the adopter</p>
     * @returns {void}
     */
    setTermsAndConditionLink : function(){
       
        setInterval(function () {
             var tcLinkObj=$("#privacyid  :nth-child(4) :nth-child(2)");
            if(window.ibmIDMsgs && ibmIDMsgs.tc_link && tcLinkObj && tcLinkObj.attr('href').indexOf(ibmIDMsgs.tc_link) == -1){
                    tcLinkObj.attr("href",ibmIDMsgs.tc_link);
            }
        },
        3000);
    	
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function getUser
     * @description <p>Get the user details from the authenticated session</p>
     * @param regExistingUser boolean value
     * @return {void}
     */
    getUser : function(regExistingUser){
    	var targeturl=ibmIDC.formUtil.queryParam("Target");
        if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
            targeturl=ibmIDC.formUtil.queryParam("Target");
        }else if(ibmIDC.msgs.dest_url){
            targeturl= ibmIDC.msgs.dest_url;
        }else{
            targeturl= ibmIDC.idUtil.pwdContinueUrl;
        }
    	jQuery.ajax({
    		type: 'GET',
    		url:'https://'+ibmIDC.idUtil.idaasDomain+'/v1/mgmt/idaas/user/', 
    		xhrFields: { withCredentials: true },
    		async:"false",
    		dataType: 'json',
    		timeout: 30000,
    		success: function(data) {
    			/*if(regExistingUser !== true){
    				jQuery('#longform').hide();
        	    	jQuery('#ibmSigninform').show();
    			}*/
    			if(regExistingUser !== true){
    				jQuery('#longform').hide();
        			jQuery('#ibmSigninform').show();
    			}
    			if(data.emailVerified){
    				ibmIDC.formUtil.EMAIL_VERIFIED = true;
    			}
    			if(data.emails.length !== 0){
    				ibmIDC.formUtil.BUSINESS_EMAIL = data.emails[0].value;
				}
    			if(data.userName){
    				ibmIDC.formUtil.LOGGED_IN_USER = data.userName;
    				ibmIDC.formUtil.USER_STATUS = true;
    				//Checking if trial required or not.
    				if(ibmIDC.formUtil.checkSbsProv()){
    					console.log("data.userName ::: "+data.userName);
    					jQuery('#ibmSigninformEmail').text(data.userName);
                		ibmIDC.formUtil.checkSbs(regExistingUser);
                	}
                	else{
                		ibmIDC.formUtil.delCookie("JSESSIONID");
                        ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                        console.log("No trial, redirecting to destination page.");
                        jQuery('#ibmSigninformEmail').text(data.userName);
                        jQuery('body').addClass('state-registering');
                        jQuery('#processing').fadeIn();
                        jQuery('#processing .loading-message').html();
                        ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
                	}
    			}
    			else{
    				ibmIDC.log("Email not available.");
    			}
    			
    		},
    		error: function(xhr){
    			//show page and hide spinner.
    			//ibmIDC.formUtil.displayPage();
    			var errorCode = xhr.responseJSON.result;
			    errorCode = errorCode.substring(0,errorCode.indexOf(" ")).trim();
    			if(xhr.status === 401 && errorCode === 'FBTRBA306E' && ibmIDC.formUtil.userDetails.user && ibmIDC.formUtil.userDetails.isFederated === false){
    				console.log("WI SSO Session.");
    				ibmIDC.formUtil.prepareFormForPassword(ibmIDC.formUtil.userDetails.user);
    			}
    			else{
    				ibmIDC.log("User session not available.");
    			}
    			
    		}
    	}); 
    },
    /**
     * @author pavan.sunkara@in.ibm.com
     * @memberOf ibmIDC
     * @function 
     * @description <p>validate OTP</p>
     * @param {String} 
     */
    validateOtp : function() {
    	var req_data = {
    		    "otp.user.otp-hint": "",
    		    "otp.user.otp": ibmIDC.formUtil.get_Otp()
    		};
    		var otpData = JSON.stringify(req_data);
    		jQuery.ajax({
    			url: 'https://'+ibmIDC.idUtil.idaasDomain+'/idaas/mtfim/sps/apiauthsvc?StateId='+ibmIDC.formUtil.stateId, 
    			xhrFields: { withCredentials: true },
    			type: 'PUT',
    			data: otpData,
    			dataType: "json",
    			contentType: "application/json",
    			async: "false",
    			global: false,
    			timeout: 30000,
    			success: function(data) {
    				if(data){
    					var errorCode = data.message;
    					errorCode = errorCode.substring(0,errorCode.indexOf(" ")).trim();
	    				switch(errorCode){
		    				/*case 'FBTAUT010E':
		                    	//login session expire
		                    	jQuery("#resendotp").html("");
		                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.loginSessionExpired);
		                    	jQuery('#processing').fadeOut();
		                    	break;
		                    case 'FBTAUT017E':
		                    	//invalid state id
		                    	jQuery("#resendotp").html("");
		                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.invalidStateId);
		                    	jQuery('#processing').fadeOut();
		                    	break;*/
		                    case 'FBTOTP310E':
		                    	//invalid otp
		                    	jQuery("#resendotp").html("");
		                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.invalidOtp);
		                    	jQuery('#processing').fadeOut();
		                    	break;
		                    default:
		                    	//Some reason otp is not verified
		                    	jQuery("#resendotp").html("");
		                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.otpNotVerified);
		                    	jQuery('#processing').fadeOut();
	    				}
    				}
    				else{
    					console.log("calling dosbs.");
    					ibmIDC.formUtil.doSbs(ibmIDC.formUtil.LOGGED_IN_USER);
    				}
    			},
    			error: function(xhr) {
    			    var errorCode = xhr.responseJSON.execptionMsg;
    			    errorCode = errorCode.substring(0,errorCode.indexOf(" ")).trim();
    			    if(xhr.status === 400 && errorCode === 'FBTAUT017E'){
    			    	//invalid state id
                    	jQuery("#resendotp").html("");
                    	jQuery("#otp .field-code >div").html('');
                    	ibmIDC.formUtil.displayErrorMsg("otp",ibmIDC.err.invalidStateId);
                    	jQuery('#processing').fadeOut();
    			    }
    			    else if (xhr.status === 500 && errorCode === 'FBTAUT010E'){
    			    	//login session expire
    			    	ibmIDC.formUtil.resetSignInForm();
    			    }
    			    else{
    			    	jQuery('#processing').fadeOut();
        				jQuery('body').addClass('state-register-failure');
        				ibmIDC.formUtil.set_errormsg_and_redirect(ibmIDC.err.regretmsg2, ibmIDC.err["000"]);
    			    }
    			}
    		}); 
    },
    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmIDC
     * @function loginUser
     * @description <p>login method</p>
     * @param 
     * @return {void}
     */

    loginUser : function(userName,passWord){

        var deferred = jQuery.Deferred();

        deferred.notify({"result":"calling state service"});
        var stateAjax=jQuery.ajax({
            method: "POST",
            url: "https://"+ibmIDC.idUtil.idaasDomain+"/idaas/mtfim/sps/apiauthsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser",
            contentType:"application/json",
            xhrFields: { withCredentials: true },
            dataType:"JSON"
            });

        stateAjax.done(function(data){

            deferred.notify({"result":"calling login service"});
            if(data.state){
                jQuery.ajax({
                method: "PUT",
                url: "https://"+ibmIDC.idUtil.idaasDomain+"/idaas/mtfim/sps/apiauthsvc?StateId="+data.state,
                contentType:"application/json",
                data:JSON.stringify({ "username": userName, "password": passWord }),
                dataType:"JSON",
                xhrFields: { withCredentials: true }
                })
                .done(function( data ) {
                    if(data && data.execptionMsg){
                        var FCode=ibmIDC.formUtil.handleErrorCode(data);
                        if(FCode){
                                if(FCode=="FBTBLU101E"){
                                    jQuery('#processing').fadeOut();
                                    jQuery('span[data-message="ibmid"]').removeClass('visible');
                                    jQuery('span[data-message="usererror"]').show().text(ibmIDC.err[FCode]);
                                    deferred.notify({result:"validation",service:"login",reponse:data,errorCode:FCode});
                                }else{
                                    deferred.reject({result:"validation",service:"login",reponse:data,errorCode:FCode});
                                }
                                
                            }
                            else{
                                deferred.reject({result:"validation",service:"login",reponse:data,errorCode:"000"});
                        }
                        
                    }
                    else{
                        
                        deferred.resolve({result:"success",service:"login",response:data});
                    }

                })
                .fail(function(err){
                    var data=jQuery.parseJSON(err.responseText);
                    var FCode=ibmIDC.formUtil.handleErrorCode(data);
                    deferred.reject({result:"error",service:"state",reponse:data,errorCode:FCode});
                });
            }else{
               deferred.reject({result:"error",service:"state",reponse:data,errorCode:"000"});
            }
        })
        .fail(function(err){
            var data=jQuery.parseJSON(err.responseText);
            var FCode=ibmIDC.formUtil.handleErrorCode(data);
            deferred.reject({result:"error",service:"state",reponse:data,errorCode:FCode});
        });
        return deferred.promise();
    },
    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmIDC
     * @function handleErrorCode
     * @description <p>split F series error code from repsonse.</p>
     * @param 
     * @return {FCode}
     */
    handleErrorCode: function(data){
                var msg=data.message || "";
                console.log(msg);
                if(msg!="")
                {
                    var FCode=msg.split(" ")[0];
                    console.log(FCode);

                }else{
                    var FCode="000";
                }
        return FCode;
    },
    /**
     * @author sanbauli@in.ibm.com
     * @memberOf ibmIDC
     * @function loginSuccessCallback
     * @description <p>after login success</p>
     * @param 
     * @return {void}
     */
    loginSuccessCallback:function(regExistingUser){
    	
        jQuery("#ibmid >  span[data-message=\"ibmid\"]").removeClass('visible');
            jQuery('span[data-message="usererror"]').hide();
            jQuery("#ibmidtxt").attr('disabled', true);
            jQuery("#password-signin").hide();
            if(ibmIDC.formUtil.queryParam("trial")==='yes'){
                ibmIDC.formUtil.USER_STATUS=true;
                //ibmIDC.formUtil.getUser(regExistingUser);
                //Here need to think the logic.
                //ibmIDC.formUtil.checkSbs();
                console.log("Login succefull.. invoking selfcare API.");
                ibmIDC.formUtil.getUser(regExistingUser);
            }else{
            	jQuery('#processing').fadeIn();
                jQuery('#processing .loading-message').html('Please wait while we process your request');
                ibmIDC.formUtil.delCookie("JSESSIONID");
                ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
                var targeturl=ibmIDC.formUtil.queryParam("Target");
                if(ibmIDC.formUtil.targetParam(targeturl) !== ""){
                    targeturl=ibmIDC.formUtil.queryParam("Target");
                }else if(ibmIDC.msgs.dest_url){
                    targeturl= ibmIDC.msgs.dest_url;
                }else{
                    targeturl= ibmIDC.idUtil.pwdContinueUrl;
                }
                jQuery('body').addClass('state-registering');
                
                ibmIDC.formUtil.redirectProvisionUserToServicePage(targeturl);
            }
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function resetSignInForm
     * @description <p>Resetting the SignIn form with IBMid as lebel and Password fields. Remaining fields are clearing and hiding.</p>
     * @param 
     * @return {void}
     */
    resetSignInForm: function(){
    	ibmIDC.formUtil.prepareFormForPassword(ibmIDC.formUtil.LOGGED_IN_USER);
    	jQuery('#otp').hide();
    	jQuery('#otp > div #otp').val('');
    	jQuery('.addfields').removeClass('loginaddfieldshow').addClass('loginaddfields');
    	//jQuery("#emailFed .field-email >div").html("");
    	jQuery('#company_existing1').val('');
    	jQuery('#phoneNumber_existing1').val('');
    	jQuery('#password-signin #password-field-signin').val('');
    	jQuery('#password-signin').show();
    	jQuery('#password-signin').parent().show();
    	jQuery("#ibmSigninform #password-field-signin").focus();
    	ibmIDC.formUtil.USER_CHKSBS = false;
    	ibmIDC.formUtil.USER_STATUS = false;
    	ibmIDC.formUtil.RESEND_OTP = false;
    	jQuery('span[data-message="usererror"]').show().text(ibmIDC.err["loginSessionExpired"]);
    },
    /**
     * @author nilmukh3@in.ibm.com
     * @memberOf ibmIDC
     * @function getState
     * @description <p>Load state json file and populate in select box</p>
     * @param 
     * @return {void}
     */
    getState: function(country){
    	
    	if((country.toUpperCase() == 'US') && (ibmIDC.msgs.phone_company) && (ibmIDC.msgs.phone_company == 1)){
    		
    	jQuery.getJSON( ibmIDC.basePath+"/js/state.json", function( data ) {
    		data.states.splice(0, 0,{"stateCode":"Select one","stateName":"Select one"});
    		
    		  $.each( data.states, function( key, val ) {
    			  jQuery('#stateCode').append($('<option/>', { 
    			        value: val.stateCode,
    			        text : val.stateName 
    			    }));
    		  });
    		  
    		  jQuery('#stateCode').find('option[value="Select one"]').prop('selected', true);
    		  jQuery('select#stateCode').select2();
    		  jQuery("#countryCode").removeClass('ibm-col-6-2').addClass('ibm-col-6-1');
    		  jQuery('#state').show();
    		});
    	
    	}else{
    		
    		jQuery('#state').hide();
    		jQuery('#state').find('option').remove();
    		jQuery("#countryCode").removeClass('ibm-col-6-1').addClass('ibm-col-6-2');
  		  
    		
    	}
    },
    /**
     * @author ramalise@in.ibm.com
     * @memberOf ibmIDC
     * @function removeIbmDomainCookies
     * @description <p>Removing the IBM domain(.ibm.com) cookies which is created by Bluemix page.</p>
     * @return {void}
     */
    removeIbmDomainCookies: function(){
    	console.log("Deleting PD-S-SESSIONID, DPJSESSIONID, JSESSIONID_IDAAS cookies from .ibm.com");
    	ibmIDC.formUtil.delCookie("PD-S-SESSION-ID");
    	ibmIDC.formUtil.delCookie("DPJSESSIONID");
    	ibmIDC.formUtil.delCookie("JSESSIONID_IDAAS");
    }
}
//return ibmIDC.formUtil;

})(jQuery);