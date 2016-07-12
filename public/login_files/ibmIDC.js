/*jslint  */
/**
  @author adestefa@us.ibm.com    v1.2.3 2015/02/07
  @author manabsarkar@in.ibm.com v1.2.4 2015/02/25
  @author manabsarkar@in.ibm.com v1.2.5 2015/08/18
  @author manabsarkar@in.ibm.com v1.3.0 2015/11/18
  @author adestefa@us.ibm.com    v1.4.0 2016/02/16
  @namespace IBM id Messaging Controller
  @description <p><b>ibmIDC</b> is designed to deliver adopter level contextual messaging content across the IBM id  Profile Application.</p>
  */
var ibmIDC;
ibmIDC = ibmIDC || {};
ibmIDC = {
    /**
        @description Current version
        @constant {String}
        */
    VER: '1.4.0',
    /**
        @description Show telemetry in console when true
        @constant {Boolean}
        */
    DEBUG: 0,
    /**
        @description Accommodate page loading latency, add delay in milliseconds before we write to the DOM when needed.
        <p>Default value set to 0, this is only used if a given page has heavy run-time changes and our messages are failing to load. </p>
        @constant {Int}
        */
    DELAY: 0,
    /**
    @description keep client ID from IDAAS SignIn Page
    @constant {String}
    */
    CLIENT: 'NULL',
    /**
	  @description creating base path
	   @type {String}
	 */
	basePath: window.location.protocol+"//"+window.location.host+'/account/us-en/signup',
    /**
        @description Path to install directory for adopter JSONP message files
         <p>This path will be used at run-time e.g., <br /><b>JSON_DATA_PATH</b> + appid + "_" + ctx + "_" + cc + "_" + lc + ".js";</p>
        @constant {String}
        */
    JSON_DATA_PATH: "js/msgs/",
    /**
        @description Final URL of JSONP message file
        <p>This will be used at run-time with <b>JSON_DATA_PATH</b> and adopter provided parameters to construct and store the final message file url.</p>
        @type {String}
        */
    json_data_url: "NULL",
    /**
        @description Local memory used to store adopter messages after loading
        @type {Array}
        */
    msgs: [],
    /**
        @description Number of tokens inserted into the DOM
        @type {Array}
        */
    inserts: [],
    /**
        @description Number of tokens skipped during DOM update
        <p>As each message file can contain a long list of tokens, it is expected most are specific to some views. Only applicable tokens should be inserted into any given view, so each session can expect some tokens to insert while others that are unrelated will be skipped on purpose which are stored here.</p>
        @type {Array}
        */
    skipped: [],
    /**
        @description Session adopter id
        @type {String}
        */
    appId: 'NULL',
    /**
        @description Session Context
        @type {String}
        */
    ctx: 'NULL',
    /**
        @description Session country code
        @type {String}
        */
    cc: 'us',
    /**
        @description Session language code
        @type {String}
        */
    lc: 'en',
    /**
        @description Query String
        @type {String}
        */
    qs: '',
    /**
        @description Session campaign id
        @type {String}
        */
    campaign: 'NULL',
    /**
     * @description Is adopter data loaded?
     * @type {Boolean}
     */
    isDataLoaded: false,
    /**
        @description Make console more readable
        @type {String}
        */
    consoleCSS: "background-color:#CACAD9;font-weight:800",
    /**
        @description Error Messages File Base Dir on server.
        @type {String}
     */
    JSON_ERR_MGS_DATA_PATH: '/js/error/',
    /**
        @description Local memory used to store error messages after loading
        @type {Array}
        */
    err: [],
    /**
    @description subscription info File Base Dir on server.
    @type {String}
    */
    SUBS_INFO_DATA_PATH: "/js/provision/",
    /**
    @description Local memory used to store subscription info after loading
    @type {Array}
    */
    subsInfo: [],
    

    /**
    @description Domain Whitelist used to store allowed domains. Period (.) should be preceeded by a '\\'
    @type {Array}
    */
    whitelist: [
		'bluemix\\.net',
		'mybluemix\\.net',
		'xtify\\.com',
		'ibmcloud\\.com',
		'jazz\\.net',
		'ihost\\.com',
		'smartercitiescloud\\.com',
		'ibmserviceengage\\.com',
		'ibmsmartcloud\\.com',
		'ibm\\.com',
		'ibm\\.biz'
		],
	/**
	  @description List of country and locales we are supporting'
	   @type {Array}
	 */
	locale: ['us-en','ca-fr'],
	
		
		
	/***
	 @function preventiframe
	 @description Prevent the page load in iframe
	 @return {void}
	 */
			
	preventiframe: function() {
		this.log("location",location);
		this.log("top.location",top.location);
		if (top.location != location) {
			this.log("Inside if");
			//alert("inside first if");
			top.location.href = document.location.href;
		}
		//if (self == top) {
		//   alert("inside second if");
		//    var theBody = document.getElementsByTagName('body')[0]
		//    theBody.style.display = "block"
		//  } else {
		//    alert("inside second else");
		//    top.location = self.location
		//  } 
	},

    /**
        @function
        @description Send log messages to the browser console when available
        @param {String} msg - content string to print
        @param {string} css - Optional css to style msg
        @returns {void}
        */
    log: function(str, css) {
        if (this.DEBUG && window.console && window.console.log) {
            if (css !== undefined) {
                window.console.log('%c' + str, css);
            } else {
                window.console.log(str);
            }
        }
    },
    /**
        @function draw
        @description Draw adopter contextual messaging to current view using data from query string
        <p>Both 'delay' and 'debug' are optional parameters. Messages may not load if other <i>unrelated</i> AJAX, or Dojo controllers are still loading and updating the DOM. Set a small delay to avoid this problem.it is best to dial this value in slowly at 200 millisecond increments until the messages load.</p>
        @param {int} delay - Optional delay in milliseconds, 0 by default
        @param {boolean} debug - Optional set to true to show telemetry in the console, off by default
        @returns {void}
        */
    draw: function(delay, debug,displaySpinner ,client) {
    	this.preventiframe();
    	this.getLocale();
    	
       CLIENT = client;
       jQuery("#main_container").hide();
       // code added by pavan for hiding loading img in IDaaS sign page.
       if(displaySpinner){
       	jQuery("body").after( '<div id="ibmidcloader"> <div class="ibm-spinner-container-page init-spin"> <svg viewBox="-75 -75 150 150" height="150" width="150" class="idc-spinner"> <circle r="37.5" cy="0" cx="0"/> </svg> </div></div>');
       }
        this.DELAY = (delay !== undefined) ? delay : 0;
        this.DEBUG = (debug !== undefined) ? 1 : 0;
        this.log("ibmIDC::init::IBM id Msg Controller v" + this.VER + " delay:" + this.DELAY, "background-color:#CACAD9;font-weight:800");
        /** we must give the DOM a chance to load, otherwise messages will not update */
        jQuery(window).bind("load", function(e) {
        	jQuery.getScript("//www.ibm.com/common/stats/ida_stats.js")
        	  .done(function( script, textStatus ) {
        		 switch(window.location.pathname.substring(window.location.pathname.lastIndexOf("/")).replace('/', '')){
        	     	case 'register.html':
        	     		ibmIDC.formUtil.coremetricsTagging("IBMid registration", "1");
        	     		break;
        	     	case 'register_bluemix.html':
        	     		ibmIDC.formUtilBM.triggerCoremetrics();
        	     		break;
        	     	case 'forgot-password-reset.html':
        	     		ibmIDC.passwordResetEventTag('Password reset page load', 'Password reset page load', 'BlueID forgot password processing');
        	     		break;
        	     	case 'forgot-password-check-email.html':
        	     		ibmIDC.passwordResetEventTag('Forgot password email page load',  'Forgot password email page load', 'BlueID forgot password check email');
        	     		break;
        	     	case 'forgot-password-reset-confirmed.html':
        	     		ibmIDC.passwordResetEventTag('Password confirmation page load', 'Password confirmation page load', 'BlueID forgot password confirmation');
        	     		break;
        	     }
        	 });
        	jQuery('#ibmidcloader').remove();
        	jQuery("#main_container").show();
        	jQuery('#ibm-footer-locale-selector').remove();
        });
        window.setTimeout(function() {
        	ibmIDC.readAdopterParamsFromURL();
            ibmIDC.get_browser_locale();
            ibmIDC.get_subscription_info();
        }, this.DELAY);
    },
    
    postRender : function(){
    	jQuery("#ibm-top").show();
    },
    
    /**
        @function service
        @description Provide adopter data directly for easy integration with other applications/layers
        <p>To ease integration with external applications, you can provide adopter data and run the service directly with any message file.</p>
        <p>  <b>ibmIDC.service("B01","C01","en","us");</b> The service() method will load the target JSONP file and fire the draw() method to paint the messages on the current DOM</p>
        @param {String} appId - Application/Adopter id
        @param {String} ctx - Context
        @param {String} cc - Country code (two chars)
        @param {String} lc - Language code (two chars)
        @param {int} delay - Delay to fire in milliseconds
        @param {int} debug - Set to 1 to show debugging information on the console
        <p>This function has side effects, it calls loadJSONPFile() to update the DOM once the file is loaded.</p>
        @return  {void}
        */
    service: function(appId, ctx, cc, lc, delay, debug) {
        this.appId = appId;
        this.ctx = ctx;
        this.cc = cc;
        this.lc = lc;
        this.DELAY = delay;
        this.DEBUG = debug;
        // mark adopter url data as loaded
        this.isDataLoaded = true;
        // try to load the file and start the service
        this.loadJSONPFile();
    },
    /**
        @function readAdopterParamsFromURL
        @description Parse adopter parameters from session query string to build JSON msg file path for loading
        <p>This function has side effects, it calls loadJSONPFile() when required data is found.</p>
        <p>Required data:
        <table border="1">
        <tr><th>URL param</th><th>Var</th><th>Description</th></tr>
        <tr><td>'a'</td><td>appId</td><td>Application/Adopter Id</td></tr>
         <tr><td>'ctx'</td><td>ctx</td><td>Context</td></tr>
         <tr><td>'cc'</td><td>cc</td><td>Country code (two chars)</td></tr>
         <tr><td>'lc'</td><td>lc</td><td>Language code (two chars)</td></tr>
         <tr><td>'campaign'</td><td>campaign</td><td>Campaign Id</td></tr>
        </table>
         <br /><br />
         This data is used to construct a JSONP message file name by concatenation at run-time. <br /><br />
         e.g., <b>this.JSON_DATA_PATH</b> + appId + "_" + ctx + "_" + cc + "_" + lc + ".js";<br /><br />
         <i><b>Warning</b></i>: expected URL params are listed in the first column, these much match the loaded session to parse correctly. (e.g., ?<b>a</b>=&<b>c</b>=&<b>cc</b>=&<b>lc</b>=)
        @return  {void}
    */
    readAdopterParamsFromURL: function() {
        var file;
        // use client id as adopter id when set
        if (CLIENT){
            this.appId = CLIENT;
        }
        // read adopter id "a" query param
        else {
            this.appId = this.getURLValue("a");
        }

        // UPDATE adestefa 2016/2/16

        // read context
        this.ctx = this.getURLValue("ctx");
        // fail-safe for older forms until we change all JSON names
        if(!this.ctx) { 
        	this.ctx = "C001"; 
        }
        // country
        //this.cc = this.getURLValue("cc");
        // fail-safe need to comment/remove when translation is supported
        if (!this.cc) { 
        	this.cc = "us";
        }
        // locale
        //this.lc = this.getURLValue("lc");
        // fail-safe need to comment/remove when translation is supported
        if (!this.lc) { 
        	this.lc = "en";
        }
        // read campaign id
        this.campaign = this.getURLValue("campaign");
        this.log("ibmIDC::readAdopterParams::parsing..", this.consoleCSS);
        // We must make sure all adopter data is present in the query string before even attempting to load our message file
        // Let's see if any params are missing, if so they will return null
        if ((ibmIDC.appId === null) || (ibmIDC.ctx === null) || (ibmIDC.cc === null) || (ibmIDC.lc === null)) {
            // param missing from url
            this.log("ibmIDC::readAdopterParams::Warning:: Data param is missing, Good-bye!", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
            // If all params are in the url, do they all have a value too?
        } else if ((ibmIDC.appId === "") || (ibmIDC.ctx === "") || (ibmIDC.cc === "") || (ibmIDC.lc === "")) {
            // param value missing from url
            this.log("ibmIDC::readAdopterParams::Warning:: Data value is empty, Good-bye!", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
        } else {
            // Huston, we have data! let's build a path and try to load a message file
            this.log("ibmIDC::readAdopterParams::Adopter data:: app:" + this.appId + ", ctx:" + this.ctx + ", cc:" + this.cc + ", lc:" + this.lc + ", campaign:" + this.campaign);
            // build path to JSON-P message file
            file = this.JSON_DATA_PATH + this.appId + "_" + this.ctx + "_" + this.cc + "_" + this.lc + ".js";
            this.log("ibmIDC::readAdopterParams::file to load::" + file);
            // set final file path and name into local property
            this.json_data_url = file;
            // mark adopter url data as loaded
            this.isDataLoaded = true;
            // try to load the file
            this.loadJSONPFile();
        }
    },
    /**
        @function loadJSONPFile
        @description Execute asynchronous request to load adopter message file
        <p>This function has side effects, it calls draw() to update the DOM once file is loaded.</p>
        @return  {void}
        */
    loadJSONPFile: function() {
		this.log("ibmIDC::loadMsgFile::begin fetch..");
		// make the call and attempt to load the file
		jQuery.getScript(ibmIDC.idUtil.staticPagesBasePath + ibmIDC.json_data_url)
				.done(function(script, textStatus) {
							if (window.ibmIDMsgs === undefined) {
								ibmIDC.postRender();
								ibmIDC.log("ibmIDC::loadJSONPFile::error unable to read msg file");
								// IBM id Message object found
							} else {
								// localize the data for better scoping
								ibmIDC.msgs = ibmIDMsgs;
								// write data to DOM
								ibmIDC.run();
								
								ibmIDC.showElement();
							}
						})
				.fail(function(jqxhr, settings, exception) {
							ibmIDC.postRender();
							// Exception - object not found, JSONP validation
							ibmIDC.log("ibmIDC::loadJSONPFile::error unable to load msg file");
						});
    },
    /**
        @function run
        @description Process all message data and insert into DOM . It alse reads the Campaign ID and builds the Query String.
        <p>Message tokens consist of two data members per record 'target element' and 'content'. Here we will increment over the token.length and update the DOM with each target element defined in the adopter message file that is applicable to this view or skip otherwise.</p>
        <p> It'll prepare the Query String from the session as well
	    </p>
        @return  {void}
        */
    run: function() {
    	var len, i, msgTemp;
        if(CLIENT){
        	if(this.msgs.LogInTokens){
	        	len = this.msgs.LogInTokens.length;
		        msgTemp = this.msgs.LogInTokens;
        	}else{
        		ibmIDC.postRender();
        	}
        }else{
        	len = this.msgs.tokens.length;
	        msgTemp = this.msgs.tokens;
        }
        this.log("ibmIDC::run::tokens found:" + len, this.consoleCSS);
        // let's try to draw every message
        for (i = 0; i < len; i = i + 1) {
            /** grab the next token (element, content) from the stack */
            var toke = msgTemp[i];
            /** do the DOM work! */
            this.writeToDOM(toke[0], toke[1], toke[2]);
            
            if(len === i+1){
            	ibmIDC.postRender();
            }
         }
        if (this.DEBUG) {
            this.results();
        }
        // prepare the Query String. The Campaign ID can be read only after JSON Data File load is completed.
        this.queryString();
    },
    /**
        @funciton writeToDOM
        @description Insert contextual text message content into target DOM element, HTML is also supported
        <p>If HTML content is used, ensure all quotes are nested properly in the JSONP file and each HTML feature injected into the DOM is tested properly.</p>
        @param {String} targetElement - DOM element to target e.g., '#id' or '.classname'
        @param {String} content - Message content to insert. This can be text or HTML but must have correct quote nesting.
        @return {void}
        */
    writeToDOM: function(targetElement, content,action) {
    	
        // let's first skip if this element is not in the DOM
        if (!jQuery(targetElement).length) {
        	
        	this.skipped.push([targetElement, content]);
            // otherwise, let's get to work
        } else {
        	
            //this.log("ibmIDC::updateDOM::insert:[" + targetElement + "]:" + content);
            // Handle HTML or text, so check for open HTML braces in the content. As and edge-case,
            // the adopter can still use individual '<' or '>' characters in their content to display if they like,
            // but for simplicity, we will assume HTML when both are found together.
            
            if(action === "append"){
            	jQuery(targetElement).append(content);
            }else if ((content.indexOf("<") !== -1) && (content.indexOf(">") !== -1)) {
            	
            	jQuery(targetElement).html(content);
            } else if(action === "addClass"){
            	jQuery(targetElement).addClass(content);
            }else if(action === "css"){
            	jQuery(targetElement).css(JSON.parse(content));
            }else if(action === "hrefPage"){
            	jQuery(targetElement).attr("href",ibmIDC.idUtil.staticPagesBasePath+content);
            }else if(action === "href"){
            	jQuery(targetElement).attr("href",content);
            }else if (content.indexOf("#") === 0) {
            	jQuery(targetElement).css("background-color", content);
            }else if(/{(.*)}/.test(content)){
            	jQuery(targetElement).css("background-image", content.replace(/[{}]/g, ""));
            }else if(/\[(.*)\]/.test(content)){
            	jQuery(targetElement).css("border-color", content.replace(/[\[\]]/g, ""));
            }else {
            	
                jQuery(targetElement).text(content);
            }
            
            this.inserts.push([targetElement, content]);
        }
    },
    /**
        @function setURLValues
        @description Given a link element ID as an argument, populate adopter data into matching DOM element as query string
        <p>Some views will have a call to action that will only require a GET request. In these cases we can populate a target link with our adopter data.</p>
        @param {String} linkId - Id of link element you want to target. This funciton will accept any number of paramater linkIds
        @return {void}
        */
    setURLValues: function(linkId) {
        var i, target, str, tarSrc, linkId_;
        // check required data
        if (this.isDataLoaded) {
            for (i = 0; i < arguments.length; i = i + 1) {
                linkId_ = arguments[i];
                this.log("ibmIDC::setURLValues::Link:" + linkId_, this.consoleCSS);
                // query link and grab href src
                target = jQuery("#" + linkId_);
                tarSrc = target.attr('href');
                // is the link element in the DOM?
                if (target.length) {
                    str = ibmIDC.queryString();
                    // we found the link, and the link has an existing query string
                    if (tarSrc.indexOf("?") !== -1) {
                        str = tarSrc + "&" + str;
                        this.log("ibmIDC::setURLValues:: link has query string, appending.. " + str);
                        target.attr('href', str);
                        // we found link without query string
                    } else {
                        str = tarSrc + "?" + str;
                        this.log("ibmIDC::setURLValues:: link does not have query string, adding.. " + str);
                        target.attr('href', str);
                    }
                    this.log(target);
                } else {
                    this.log("ibmIDC::setURLValues::Exception::link not found:" + linkId_);
                }
            }
        } else {
            this.log("ibmIDC::setURLValues::Exception:: Adopter data not found in session");
        }
    },
    /**
        @function setFormValues
        @description Given a form ID as an argument, populate adopter data into new hidden fields and add them to target form
        <p>Some views will have a call to action that will require a POST. In these cases we can populate a target form with our adopter data from the session automatically.</p>
        @param {String} frmId - Id of form you want to target, this function will accept any number of paramater values as a list of more than one formId
        @return {void}
        */
    setFormValues: function(frmId) {
        var frmId_, i;
        if (this.isDataLoaded) {
            for (i = 0; i < arguments.length; i = i + 1) {
                frmId_ = arguments[i];
                this.log("ibmIDC::setFormValues::Form:" + frmId_, this.consoleCSS);
                // make sure the form exists
                if (jQuery("#" + frmId_).length) {
                    this.log("ibmIDC::setFormValues::form:#" + frmId_ + " found, inserting data..");
                    jQuery('#' + frmId_).append('<input type="hidden" name="a" value="' + this.appId + '" />');
                    jQuery('#' + frmId_).append('<input type="hidden" name="ctx" value="' + this.ctx + '" />');
                    jQuery('#' + frmId_).append('<input type="hidden" name="cc" value="' + this.cc + '" />');
                    jQuery('#' + frmId_).append('<input type="hidden" name="lc" value="' + this.lc + '" />');
                    this.log(document.forms[frmId_]);
                } else {
                    this.log("ibmIDC::setFormValues::Exception::Form not found:" + frmId_);
                }
            }
        } else {
            this.log("ibmIDC::setFormValues::Exception:: Adopter data not found in session");
        }
    },
    /**
        @function
        @description Given a parameter name as a string, return the value from the URL query
        @param {String} name - name of parameter in query string
        @return {String} value of URL parameter
        */
    getURLValue: function(name) {
        return this.getNVP(window.location.search, "&", "=", name);
    },
    /**
     * @function
     * @description Given a parameter name as a string, return the value from the URL query
     * @param {String} url - url of parameter page url
     * @param {String} name - name of parameter in query string
     * @return {String} value of URL parameter
     */
    getIWMRefValue : function (url, name) {
 	   return this.getNVP(url, "&", "=", name);
    },
    /**
        @function
        @description Parse name/value pairs from query string and return value
        @param {String} nvps - name value pairs from query string
        @param {String} pSeparator - paramater separator for this context (e.g., normally &)
        @param {String} nvSeparator - name value pair separator for this context (e.g., normally "=")
        @param {String} name - name of parameter to grep
        @return {String} value of URL parameter
        */
    getNVP: function(nvps, pSeparator, nvSeparator, name) {
        var value, offset, end;
        value = null;
        offset = -1;
        end = -1;
        if (nvps !== null) {
            name += nvSeparator;
            offset = nvps.indexOf(name);
            if (offset >= 0) {
                end = nvps.indexOf(pSeparator, offset);
                if (end < 0) {
                    end = nvps.length;
                }
                value = nvps.substring(offset + name.length, end);
            }
        }
        return value;
    },
    /**
        @description Full session report
        <p>When called directly on the console <b>ibmIDC.report()</b> will print complete session data.</p>
        @return {void}
        */
    report: function() {
        this.DEBUG = 1;
        this.log("Init delay:" + this.DELAY);
        this.log("App ID:" + this.appId);
        this.log("Context:" + this.ctx);
        this.log("Country:" + this.cc);
        this.log("Language:" + this.lc);
        this.log("Campaign ID:" + this.campaign);
        this.log("Data path:" + this.JSON_DATA_PATH);
        this.log("Data url:" + this.json_data_url);
        this.log("typeof data: " + typeof ibmIDMsgs);
        this.results();
        this.log("Adopter JSONP Data Dump:");
        if (window.console && window.console.log) {
            window.console.dir(this.msgs);
        }
    },
    /**
        @description print results of operations to console
        <p>When called directly on the console <b>ibmIDC.results()</b> will show which tokens were inserted and which were skipped.</p>
        @return {void}
        */
    results: function() {
        this.log("%c -INSERTS:" + this.inserts.length, 'color: #008C23; font-weight:800');
        for (var i = 0; i < this.inserts.length; i = i + 1) {
            this.log(this.inserts[i] + '\n');
        }
        this.log("%c -SKIPPED:" + this.skipped.length, 'color: #FF0040; font-weight:800');
        for (var i = 0; i < this.skipped.length; i = i + 1) {
            this.log(this.skipped[i] + '\n');
        }
    },
    /**
        @function showTokens
        @description Show all token elements on a given view
        <p>To ease testing and debugging, it is important to see which elements on the page have been updated with the service. when called directly on the console <b>ibmIDC.showTokens()</b> will hightlight all inserted tokens with a border.</p>
        @return {void}
        */
    showTokens: function() {
        for (var i = 0; i < this.inserts.length; i = i + 1) {
            this.log(this.inserts[i] + '\n');
            jQuery(this.inserts[i][0]).css('border', '3px solid red');
        }
    },
    /**
        @function hideTokens
        @description Hide any borders applied to token elements
        <p>When called directly on the console <b>ibmIDC.hideTokens()</b> will hide any borders that were shown around inserted tokens.</p>
        @return {void}
        */
    hideTokens: function() {
        for (var i = 0; i < this.inserts.length; i = i + 1) {
            this.log(this.inserts[i] + '\n');
            jQuery(this.inserts[i][0]).css('border', '');
        }
    },
    /**
        @author manabsarkar@in.ibm.com
        @function get_browser_locale
        @description helper method to find the browser locale and request to load locale specific error message file
        @return  {void}
        */
    get_browser_locale: function() {
        var file;
        var locale = navigator.language || navigator.userLanguage || "en-US";
        ibmIDC.log("locale::" + locale);
        if (locale === undefined) {
            ibmIDC.log("ibmIDC::locale problem::error unable to find a valid locale");
            file = this.JSON_ERR_MGS_DATA_PATH + "messages.js";
        } else {
            //hardcoding the locale value to en-us for sep 30 release till we decide to support multiple locales
            locale = "en-us";
            //file = this.JSON_ERR_MGS_DATA_PATH + "messages_" + locale + ".js";
            file = this.JSON_ERR_MGS_DATA_PATH + "messages_" + this.lc+"-"+this.cc + ".js";
        }

        this.log("ibmIDC::file to load::" + file);
        // mark url data as loaded
        this.isDataLoaded = true;
        // try to load the file
        if( !(/idaas/.test(window.location.host) || /prepiam/.test(window.location.host))){
        	this.loadErrMsgJSONPFile(file);
        }
    },
    /**
        @author manabsarkar@in.ibm.com
        @function loadErrMsgJSONPFile
        @description Execute asynchronous request to load error message file
        @return  {void}
        */
    loadErrMsgJSONPFile: function(err_msg_json_data_url) {
        ibmIDC.log("ibmIDC::loadErrMsgFile::begin fetch.." + err_msg_json_data_url);
        // make the call and attempt to load the file
        
        jQuery.getScript(this.basePath+err_msg_json_data_url, function() {
            // Even if the file successfully loads, we need a working object
            if (ibmIDErrMsg === undefined) {
                // Exception - object not found, JSONP validation error
                ibmIDC.log("ibmIDC::loadMsgFile::error unable to load msg file");
                // NG Message object found
            } else {
                // localize the data for better scoping
                ibmIDC.err = ibmIDErrMsg;
            }
        });
    },
    /**
        @author manabsarkar@in.ibm.com
        @function get_subscription_info
        @description Method to load Subscriber Provisioning Info file
        @return  {void}
        */
    get_subscription_info: function() {
        var file;
        file = this.SUBS_INFO_DATA_PATH + "subscription.js";
        this.log("ibmIDC::file to load::" + file);
        // mark url data as loaded
        this.isDataLoaded = true;
        // try to load the file
        if( !(/idaas/.test(window.location.host) || /prepiam/.test(window.location.host))){
        	this.loadSubsInfoJSONPFile(file);
        }
    },
    /**
        @author manabsarkar@in.ibm.com
        @function loadSubsInfoJSONPFile
        @description Execute asynchronous request to load error message file
        @return  {void}
        */
    loadSubsInfoJSONPFile: function(subs_info_data_url) {
        ibmIDC.log("ibmIDC::loadSubsInfoFile::begin fetch.." + subs_info_data_url);
        // make the call and attempt to load the file
        jQuery.getScript(this.basePath+subs_info_data_url, function() {
            // Even if the file successfully loads, we need a working object
            if (ibmIDSubsInfo === undefined) {
                // Exception - object not found, JSONP validation error
                ibmIDC.log("ibmIDC::loadSubsInfoFile::error unable to load Subs Info file");
                // NG Message object found
            } else {
                // localize the data for better scoping
                ibmIDC.subsInfo = ibmIDSubsInfo;
            }
        });
    },
    /**
		@author manabsarkar@in.ibm.com
		@function queryString
		@description reconstruct the queryString to enable contextual message display on all views.
		<p>When called directly on the console <b>ibmIDC.qs OR ibmIDC.queryString()</b> will return the reconstructed query string for contextual msg. like... <b>a={ADOPTER}&ctx={CONTEXT}&cc={CNTRY}&lc={LANG}&campaign={CAMPAIGN_ID}</b>
	    </p>
		@return {String} value of query string
      */
    queryString: function() {
        // Let's see if any params or values are missing, if so will return empty query string to display default contextual messages
        if ((ibmIDC.appId === null) || (ibmIDC.appId === "") || (ibmIDC.appId === "null")) {
            // param missing from url
            this.log("ibmIDC::readAdopterParams::Warning:: appId Data param is missing/null, Good-bye!", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
            return this.qs;
        } else if ((ibmIDC.ctx === null) || (ibmIDC.ctx === "") || (ibmIDC.ctx === "null")) {
            // param value missing from url
            this.log("ibmIDC::readAdopterParams::Warning:: Context Data value is empty/null, Good-bye!", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
            return this.qs;
        } else if ((ibmIDC.cc === null) || (ibmIDC.cc === "") || (ibmIDC.cc === "null")) {
            // param value missing from url
            this.log("ibmIDC::readAdopterParams::Warning:: cc Data value is empty/null, Good-bye!", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
            return this.qs;
        } else if ((ibmIDC.lc === null) || (ibmIDC.lc === "") || (ibmIDC.lc === "null")) {
            // param value missing from url
            this.log("ibmIDC::readAdopterParams::Warning:: lc Data value is empty/null, Good-bye!", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
            return this.qs;
        } else {
            // We have data! let's build lets build the Query String.
            //set locale
            try {
                IBMCore.common.util.meta.changePageLocale(ibmIDC.lc + '-' + ibmIDC.cc);
                this.log("ibmIDC::LocaleParams::" + ibmIDC.lc + '-' + ibmIDC.cc);
            } catch (err) {
                this.log("ibmIDC::LocaleParams::Warning::Unable to set Locale ", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
            }
            // check if campaign has valid value in URL
            if ((ibmIDC.campaign === null) || (ibmIDC.campaign === "") || (ibmIDC.campaign === "null") || (ibmIDC.campaign === undefined)) {
                this.log("ibmIDC::readAdopterParams::Warning:: campaign ID Data value is empty/null! in URL", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
                // campaign param value missing from URL. Check if campaign value is present in JSON Data File
                if ((ibmIDC.msgs.campaign === null) || (ibmIDC.msgs.campaign === "") || (ibmIDC.msgs.campaign === "null") || (ibmIDC.msgs.campaign === undefined)) {
                    // campaign param value missing from URL as well as JSON Data File
                    this.log("ibmIDC::readAdopterParams::Warning:: campaign ID Data value is empty/null! in URL & JSON Data File", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
                    this.log("ibmIDC::readAdopterParams::Adopter data:: app:" + this.appId + ", context:" + this.ctx + ", cc:" + this.cc + ", lc:" + this.lc);
                    return this.qs = 'a=' + this.appId + '&ctx=' + this.ctx + '&cc=' + this.cc + '&lc=' + this.lc;
                } else {
                    // campaign param value missing from URL but Campaign value is present in JSON Data File
                    this.log("ibmIDC::readAdopterParams::Warning:: campaign ID Data value is empty/null! in URL but present in JSON Data File", 'background-color:#DBDBEA; color: #FF0040; font-weight:800');
                    this.log("ibmIDC::readAdopterParams::Adopter data:: app:" + this.appId + ", context:" + this.ctx + ", cc:" + this.cc + ", lc:" + this.lc + ", campaign:" + ibmIDC.msgs.campaign);
                    return this.qs = 'a=' + this.appId + '&ctx=' + this.ctx + '&cc=' + this.cc + '&lc=' + this.lc + '&campaign=' + ibmIDC.msgs.campaign;
                }
            } else {
                // campaign param value present in URL.
                this.log("ibmIDC::readAdopterParams::Adopter data:: app:" + this.appId + ", context:" + this.ctx + ", cc:" + this.cc + ", lc:" + this.lc + ", campaign:" + this.campaign);
                return this.qs = 'a=' + this.appId + '&ctx=' + this.ctx + '&cc=' + this.cc + '&lc=' + this.lc + '&campaign=' + this.campaign;
            }
        }
    },    /**
     * @author pavan.sunkara@in.ibm.com
     * @memberOf ibmIDC
     * @function getIWMPayload
     * @description preparing the iwm payload data
     * @return {JSON}
     */
	   getIWMPayload : function (){
	    	var flag = false;
	    	var iwmJson = {vcpi : "", S_TACT : "", S_OFF_CD : "", S_MAIL_CD : ""};
	    	var tactic = this.getIWMRefValue(window.location.search,"S_TACT");
	    	var off_cd = this.getIWMRefValue(window.location.search,"S_OFF_CD");
	    	var mail_cd = this.getIWMRefValue(window.location.search,"S_MAIL_CD");
	    	if(tactic){
	    		iwmJson.S_TACT = tactic;
	    		flag = true;
	    	}
	    	if(off_cd){
	    		iwmJson.S_OFF_CD = off_cd;
	    		flag = true;
	    	}
	    	if(mail_cd){
	    		iwmJson.S_MAIL_CD = mail_cd;
	    		flag = true;
	    	}
	    	//S_OFF_CD, S_MAIL_CD, S_TACT any one of this having the value then this condition will execute.
	    	if(flag){
	    		return iwmJson;
	    	}
	    	//cm_mmc, cm_mmca1, cm_mmca2, cm_mmca3 any one of this having in the referrer URL then this condition will execute.
	    	else if(jQuery(document).prop("referrer").toString()){
	    		var refUrl = decodeURIComponent(jQuery(document).prop("referrer").toString());
	    		var jsonData = this.iwmPayloadDataProcessing(refUrl);
	    		if(jsonData.flagData){
	    			return jsonData.pData;
	    		}
	    		//in the referer url if didn't find the values, then checking for the "url" parameter, if exists then checking for cm_mmc, cm_mmca1, cm_mmca2, cm_mmca3.
	    		else{
	    			var nestedUrl = this.getIWMRefValue(refUrl,"url");
	    			if(nestedUrl){
	    				jsonData = this.iwmPayloadDataProcessing(decodeURIComponent(nestedUrl));
	    				if(jsonData.flagData){
	    	    			return jsonData.pData;
	    	    		}
	    				else{
	    					return this.pageUrlIwmDataProcessing();
	    				}
	    			}
	    			else{
	    				return this.pageUrlIwmDataProcessing();
	    			}
	    		}
	    	}
	    	//cm_mmc, cm_mmca1, cm_mmca2, cm_mmca3 checking in the page url.
	    	else{
	    		return this.pageUrlIwmDataProcessing();
	    	}
	    },
	    /**
	      * @author pavan.sunkara@in.ibm.com
	      * @param {String} refUrl - in this url need to check rquired params and getting those values.
	      * @memberOf ibmIDC
	      * @function iwmPayloadDataProcessing
	      * @description processing the iwm payload data
	      * @return {JSON}
	      */
	    iwmPayloadDataProcessing : function(refUrl){
	    	var flag = false;
	    	var iwmJson = {vcpi : "", S_TACT : "", S_OFF_CD : "", S_MAIL_CD : ""};
	    	var vcpi = this.getIWMRefValue(refUrl,"cm_mmc");
 		var tactic = this.getIWMRefValue(refUrl,"cm_mmca1");
 		var off_cd = this.getIWMRefValue(refUrl,"cm_mmca2");
 		var mail_cd = this.getIWMRefValue(refUrl,"cm_mmca3");
 		if(vcpi){
 			iwmJson.vcpi = vcpi;
 			flag = true;
 		}
 		if(tactic){
 			iwmJson.S_TACT = tactic;
 			flag = true;
 		}
 		if(off_cd){
 			iwmJson.S_OFF_CD = off_cd;
 			flag = true;
 		}
 		if(mail_cd){
 			iwmJson.S_MAIL_CD = mail_cd;
 			flag = true;
 		}
 		var payloadData = {pData : iwmJson, flagData : flag};
 		return payloadData;
	    },
   /**
     * @author pavan.sunkara@in.ibm.com
     * @memberOf ibmIDC
     * @function pageUrlIwmDataProcessing
     * @description processing the page url iwm payload data
     * @return {JSON}
     */
	   pageUrlIwmDataProcessing : function(){
		var jsonData = this.iwmPayloadDataProcessing(window.location.search);
		if(jsonData.flagData){
			return jsonData.pData;
		}
		//in the page url if didn't find the values, then checking for the "url" parameter, if exists then checking for cm_mmc, cm_mmca1, cm_mmca2, cm_mmca3.
		else{
			var pageNestedUrl = this.getIWMRefValue(window.location.search,"url");
			if(pageNestedUrl){
				jsonData = this.iwmPayloadDataProcessing(decodeURIComponent(pageNestedUrl));
				if(jsonData.flagData){
	    			return jsonData.pData;
	    		}
				else{
					return {vcpi : "", S_TACT : "", S_OFF_CD : "", S_MAIL_CD : ""};
				}
			}
			else{
				return {vcpi : "", S_TACT : "", S_OFF_CD : "", S_MAIL_CD : ""};
			}
		}
	   },
	     /**
     * @author pavan.sunkara@in.ibm.com
     * @memberOf ibmIDC
     * @function registerJsonData
     * @description processing register json data with IWM data
     * @return {JSON}
     */
	   registerJsonData : function(req_data){
		   var iwmData = {source :  "",pkg : ""};
		   var regData = "";
		   var iwmPayLoad = this.getIWMPayload();
    	   if(ibmIDC.formUtil.queryParam("source") && ibmIDC.formUtil.queryParam("pkg")){
    		   iwmData.source = ibmIDC.formUtil.queryParam("source");
	    	   iwmData.pkg = ibmIDC.formUtil.queryParam("pkg");
	    	   regData = jQuery.extend(true, req_data, iwmData);
	    	   jQuery.each(iwmPayLoad,function(key,val){
	    		   if(val){
	    			   regData[key] = val;
	    		   }
	    	   });
               regData.refUrl = decodeURIComponent(jQuery(document).prop("referrer").toString());
    	   }else{
    		   
    		   iwmData.source = jQuery('#source').val();
	    	   iwmData.pkg = jQuery('#pkg').val();
		       if(iwmData.source && iwmData.pkg){
		    	   regData = jQuery.extend(true, req_data, iwmData);
		    	   jQuery.each(iwmPayLoad,function(key,val){
		    		   if(val){
		    			   regData[key] = val;
		    		   }
		    	   });
                   regData.refUrl = decodeURIComponent(jQuery(document).prop("referrer").toString());
		       }
		       else{
		    	   regData = req_data;
		       }
    	   }
		   return regData;
	   },
	   
	   
	     /** 
	     * @author sabhpadm@in.ibm.com 
	     * @memberOf ibmIDC
	     * @function passwordResetEventTag  
	     * @description trigger the event tag for forgot password pages
	     * @return {JSON}
	     */
	   
	   passwordResetEventTag : function(evttarget,evname,evmodule){
		   if(window.ibmStats){
			   ibmStats.event({
		            'ibmEV': 'Internal link',
		            'ibmEvAction': window.location.href,
		            'ibmEvTarget': evttarget,
		            'ibmEvLinkTitle': 'password change form',
		            'ibmEvGroup': 'IBM id',
		            'ibmEvName': evname,
		            'ibmEvModule': evmodule,
		            'ibmEvSection': 'null',
		            'ibmEvFileSize': 'null'
			    });
		   }
		},
		
		 /** 
	     * @author sabhpadm@in.ibm.com 
	     * @memberOf ibmIDC
	     * @function signInEventTag  
	     * @description trigger the event tag for Sign in page
	     * @return {JSON}
	     */
	   
	   signInEventTag : function(evttarget,evname){
		   if(window.ibmStats){
			   ibmStats.event({
		            'ibmEV': 'Internal link',
		            'ibmEvAction': window.location.href,
		            'ibmEvTarget': evttarget,
		            'ibmEvLinkTitle': 'Sign in',
		            'ibmEvGroup': 'IBM id',
		            'ibmEvName': evname,
		            'ibmEvModule': 'null',
		            'ibmEvSection': 'Sign in',
		            'ibmEvFileSize': 'null'
			    });
		   }
		},
		/** 
	     * @author nilmukh3@in.ibm.com 
	     * @memberOf ibmIDC
	     * @function getLocale  
	     * @description get language code from url
	     * @return string
	     */
	   
	   getLocale : function(){
        var url=window.location.href;
        var re = /\/[a-z]{2}-[a-z]{2}\//gi;
        
            if(re.test(url)){
                var res = url.match(re);
               
                var curlocale = res[0].replace(/[/]/g,'');
                
                var lc = curlocale.match(/[a-z]{2}/gi);
                
                if(jQuery.inArray( lc[0]+"-"+lc[1], this.locale ) > 0){
                    this.cc = lc[0];
                    this.lc = lc[1];
                    ibmIDC.idUtil.staticPagesBasePath = window.location.protocol+"//"+window.location.host+"/account/"+ibmIDC.cc+"-"+ibmIDC.lc+"/signup/";
                }
                
            }
		   
		},
		/** 
	     * @author nilmukh3@in.ibm.com 
	     * @memberOf ibmIDC
	     * @function showElement  
	     * @description get language code from url
	     * @return string
	     */
	   
	   showElement : function(){
		   if(ibmIDC.msgs && ibmIDC.msgs.phone_company == 1){
			   jQuery(".ibm-id-provision-custom-companyfield , .ibm-id-provision-custom-phonefield,.ibm-id-custom-companyfield,.ibm-id-custom-phonefield").show();
			   
		   }
	   }
		
		
};