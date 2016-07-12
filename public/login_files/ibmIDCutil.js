/*jslint  */
/**
 * @author manabsarkar@in.ibm.com v1.0 2015/08/16
 * @namespace IBM id Utilities
 * @memberOf ibmIDC
 * @description
 * <p>
 * Contains utilities required for different views across the IBM id Profile Application.
 * </p>
 */
var ibmIDC = ibmIDC || {};
ibmIDC.idUtil = ibmIDC.idUtil || {};
ibmIDC.idUtil = {
    /**
     * @author manabsarkar@in.ibm.com
     * @memberOf ibmIDC
     * @description <p>IBM id Services Base path for various Deployment Environments</p>
     * @type {String}
     */
    servicesBasePath: "https://www.ibm.com/ibmweb/account/ibmid/",
    /**
     * @author manabsarkar@in.ibm.com
     * @param String
     * @memberOf ibmIDC
     * @function delCookie
     * @description <p>Delete cookie in ".ibm.com" domain </p>
     * @return {void}
     */
    delCookie: function(cookieName) {
        jQuery.removeCookie(cookieName, {
            path: '/',
            domain: ".ibm.com"
        });
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @param String
     * @memberOf ibmIDC
     * @function createCookie
     * @description <p>create secure cookie in ".ibm.com" domain </p>
     * @return {void}
     */
    createCookie: function(cookieName, cookieVal) {
        jQuery.cookie(cookieName,  cookieVal, {
            path: '/',
            domain: ".ibm.com",
            secure  : true
        });
    },
    /**
     * @author manabsarkar@in.ibm.com
     * @param String
     * @memberOf ibmIDC
     * @function idaasSignUpPage
     * @description <p>redirect IDAAS login</p>
     * @return {void}
     */
    idaasSignUpPage: function(URL) {
        jQuery("#cancelLinkId, #ng_pwr_continue1, #ng_pwr_continue2").attr('href', URL);
    }
};
/**
 * End of Utilities
 */
/**
 * @author manabsarkar@in.ibm.com
 * @function self invoking
 * @description Auto detect various development and EI environments
 */
(function() {
    switch (window.location.host) {
        case "localhost:6574":
            ibmIDC.idUtil.servicesBasePath = "https://esa012.somerslab.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "http://localhost:6574/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "ip.ibm.com:6790":
            ibmIDC.idUtil.servicesBasePath = "https://esa012.somerslab.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "http://ip.ibm.com:8080/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "esa009.somerslab.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://esa009.somerslab.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://esa009.somerslab.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "esa012.somerslab.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://esa012.somerslab.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://esa012.somerslab.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "jade.webmaster.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://jade.webmaster.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://jade.webmaster.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.idsourceUrl = 'https://esa012.somerslab.ibm.com/ibmweb/account/ibmid/idsource';
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            break;    
		case "idm02.somerslab.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://idm02.somerslab.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://idm02.somerslab.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.idsourceUrl = 'https://idm02.somerslab.ibm.com/ibmweb/account/ibmid/idsource';
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            break;                
        case "idm02.somerslab.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://idm02.somerslab.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://idm02.somerslab.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "wwwtest.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://wwwtest.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://wwwtest.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "wwwstage.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://wwwstage.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://wwwstage.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://prepiam.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://prepiam.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://prepiam.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'http://wwwpoc.ibm.com/myibm/dashboard';
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://prepiam.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'prepiam.toronto.ca.ibm.com';
            break;
        case "www.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://www.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://www.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.pwdContinueUrl = 'https://www.ibm.com/myibm';
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.iam.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.iam.ibm.com';
            break;
        case "idaas.toronto.ca.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://wwwtest.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://wwwtest.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.toronto.ca.ibm.com';
            break;
        case "prepiam.toronto.ca.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://wwwstage.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://wwwstage.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://prepiam.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://prepiam.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://prepiam.toronto.ca.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            digitalData.page.pageInfo.ibm.siteID="IBMTEST";
            ibmIDC.idUtil.userStatusUrl = 'https://prepiam.toronto.ca.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'prepiam.toronto.ca.ibm.com';
            break;
        case "idaas.iam.ibm.com":
            ibmIDC.idUtil.servicesBasePath = "https://www.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://www.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.iam.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.iam.ibm.com';
            break;
        default:
            ibmIDC.idUtil.servicesBasePath = "https://www.ibm.com/ibmweb/account/ibmid/";
            ibmIDC.idUtil.staticPagesBasePath = "https://www.ibm.com/account/us-en/signup/";
            ibmIDC.idUtil.idaasSignUpPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fconsole.ng.bluemix.net";
            ibmIDC.idUtil.defaultidaasSignUpPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser&Target=https%3A%2F%2Fwww.ibm.com%2Fmyibm";
            ibmIDC.idUtil.idaasSignInPagePath = "https://idaas.iam.ibm.com/idaas/mtfim/sps/authsvc?PolicyId=urn:ibm:security:authentication:asf:basicldapuser";
            ibmIDC.idUtil.userStatusUrl = 'https://idaas.iam.ibm.com/v1/mgmt/idaas/user/status/';
            ibmIDC.idUtil.idaasDomain = 'idaas.iam.ibm.com';
            break;
    }
}());