var React = require('react');
var InlineSVG = require('svg-inline-react');

var HomeHeader = React.createClass({
  render: function() {
    var userName = user.ldap.preferredFirstName || user.ldap.hrFirstName;
    var callupName = user.ldap.callupName || userName;
    var userImage = '//images.w3ibm.mybluemix.net/image/'+user.ldap.uid.toUpperCase();
    var siteEnv = '';
    if (_.isEmpty(environment) || environment.toLowerCase() == 'development')
      siteEnv = 'Stage'
    return (
      <div class='agile-home-header'>
        <div class='header-title'>
          <div>IBM</div>&nbsp;<div>Agile Team Tool</div>&nbsp;
          <div>{siteEnv}</div>
        </div>
        <div class="header-menu">
          <div class="header-menu-dropdown">
            <InlineSVG class='header-menu-icon' src={require('../../../img/Att-icons/att-icons_Profile.svg')}></InlineSVG>
            <div class='header-menu-label'>{userName}</div>
            <InlineSVG class='header-menu-icon-chev' src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            <InlineSVG class='header-menu-icon-chev-hide' src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            <ul class="header-menu-profile-block">
              <li>
                <div>Manage user profile</div>
              </li>
              <li>
                <img src={userImage}/>
                <div>{callupName}</div>
              </li>
              <li>
                <div class="header-menu-icon-api">
                  <a href="javascript: launchApiKey();">
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_api.svg')}></InlineSVG>
                    <div>API Key Generation</div>
                  </a>
                </div>
              </li>
              <li>
                <div class="header-menu-icon-logout">
                  <a href="/logout">
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_logout.svg')}></InlineSVG>
                    <div>Log out</div>
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div class="header-menu-dropdown">
            <InlineSVG class='header-menu-icon' src={require('../../../img/Att-icons/att-icons_question.svg')}></InlineSVG>
            <div class='header-menu-label'>Help</div>
            <InlineSVG class='header-menu-icon-chev' src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            <InlineSVG class='header-menu-icon-chev-hide' src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            <ul class="header-menu-help-block">
              <li>
                <div>How to:</div>
              </li>
              <li>
                <a href="./howto/AgileTeamTool_TeamDataGuide.pdf" target="_blank">Maintain Your Team Data</a>
              </li>
              <li>
                <a href="./howto/AgileTeamTool_IterationResultsGuide.pdf" target="_blank">Record Iteration Results</a>
              </li>
              <li>
                <a href="./howto/AgileTeamTool_MaturityAssessmentGuide.pdf" target="_blank">Assess Your Agile Maturity</a>
              </li>

              <li>
                <a href="./howto/AgileTeamTool_UserGuide.pdf" target="_blank">User Guide</a>
              </li>
              <li>
                <a href="./howto/Agile Team Tool - Quick Ref.pdf" target="_blank">Quick Reference Card</a>
              </li>
              <li>
                <a href="./howto/AgileTeamTool_FrequentlyAskedQuestions.pdf" target="_blank">FAQ</a>
              </li>
              <li>
                <a href="javascript: launchFeeback();" title="Feedback" id="feedback-modal">Support & Feedback</a>
              </li>
              <li>
                <a href="https://w3-connections.ibm.com/forums/html/topic?id=b3e1586f-37a5-4d2a-a3e1-653867728fd8&ps=25" target="_blank">What's new</a>
              </li>
              <li>
                <a href="javascript: launchApiKey();">API Key Generation</a>
              </li>
            </ul>
          </div>
          <div class='header-logo'>
            <InlineSVG class='header-ibm-logo' src={require('../../../img/Att-icons/att-icons-IBM_logo.svg')}></InlineSVG>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeHeader;
