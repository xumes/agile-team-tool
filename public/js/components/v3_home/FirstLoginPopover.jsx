var React = require('react');
var ReactModal = require('react-modal');
var InlineSVG = require('svg-inline-react');

var FirstLoginPopover = React.createClass({
  componentDidMount: function() {
  },
  nextCard: function(count) {
    $('#firstLoginCard_' + count).hide();
    $('#firstLoginCard_' + (count+1)).show();
  },
  previousCard: function(count) {
    $('#firstLoginCard_' + count).hide();
    $('#firstLoginCard_' + (count-1)).show();
  },
  render: function() {
    return (
      <div tabIndex={2} class='first-login-block'>
        <div id='firstLoginCard_1' style={{'display':'block'}}>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'It appears this is your first time to this version of the Agile Team Tool.'}</h1>
          </div>
          <div class='sub-content'>
            <h1>{'Would you like us to show you around?'}</h1>
          </div>
          <div class='btns'>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' style={{'border':'none'}} onClick={this.props.hideFirstLoginPopover}>{'No Thanks.'}</button>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' style={{'right':'1%'}} onClick={this.nextCard.bind(null, 1)}>{'Please do!'}</button>
          </div>
        </div>
        <div id='firstLoginCard_2' style={{'display':'none'}}>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'The basics.'}</h1>
          </div>
          <div class='sub-content'>
            <h1>{'As you may know, this tool helps your team through its Agile journey by providing maturity direction,  trending data as well as iteration tracking data.  And this is how we do it… '}</h1>
          </div>
          <div class='btns'>
            <span style={{'backgroundColor': '#777677'}}></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' onClick={this.nextCard.bind(null, 2)}>{'What else?!'}</button>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' onClick={this.previousCard.bind(null, 2)} style={{'right':'1%'}}>{'back'}</button>
          </div>
        </div>
        <div id='firstLoginCard_3' style={{'display':'none'}}>
          <div class='pointer'>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
          </div>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'The team and it’s maturity.'}</h1>
          </div>
          <div class='sub-content'>
            <h1><span>{'The large blue area '}</span>{'above displays & changes your team information: name, description, setup, heirarchy, bookmarks and team members.'}</h1>
            <h1><span>{'The light blue area '}</span>{'displays an overview of your most recently submitted maturity assessment with access to the team’s action plan and previous assessment(s).'}</h1>
          </div>
          <div class='btns'>
            <span></span>
            <span style={{'backgroundColor': '#777677'}}></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' onClick={this.nextCard.bind(null, 3)}>{'What else?!'}</button>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' onClick={this.previousCard.bind(null, 3)} style={{'right':'1%'}}>{'back'}</button>
          </div>
        </div>
        <div id='firstLoginCard_4' style={{'display':'none'}}>
          <div class='pointer'>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
          </div>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'The Iteration Overview'}</h1>
          </div>
          <div class='sub-content'>
            <h1>{'Contains your team’s current and past iteration data.  It contains items such as start/end dates, story points, velocity or throughput, deployments, and defects. It is also what populates the Trends area below.'}</h1>
          </div>
          <div class='description'>
            <div class='desc-row'>
              <div>
                <InlineSVG src={require('../../../img/Att-icons/Att-icons_detail.svg')}></InlineSVG>
              </div>
              <h1>{'This area will be empty for parent teams.'}</h1>
            </div>
          </div>
          <div class='btns'>
            <span></span>
            <span></span>
            <span style={{'backgroundColor': '#777677'}}></span>
            <span></span>
            <span></span>
            <span></span>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' onClick={this.nextCard.bind(null, 4)}>{'What else?!'}</button>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' onClick={this.previousCard.bind(null, 4)} style={{'right':'1%'}}>{'back'}</button>
          </div>
        </div>
        <div id='firstLoginCard_5' style={{'display':'none'}}>
          <div class='pointer'>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
          </div>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'The Trends'}</h1>
          </div>
          <div class='sub-content'>
            <h1>{'Squad data is summarized in graph form and enables users to link to details about iteration results as well as maturity assessment results.'}</h1>
          </div>
          <div class='description'>
            <div class='desc-row'>
              <div>
                <InlineSVG src={require('../../../img/Att-icons/Att-icons_detail.svg')}></InlineSVG>
              </div>
              <h1>{'Parent teams show aggregate data across teams.'}</h1>
            </div>
          </div>
          <div class='btns'>
            <span></span>
            <span></span>
            <span></span>
            <span style={{'backgroundColor': '#777677'}}></span>
            <span></span>
            <span></span>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' onClick={this.nextCard.bind(null, 5)}>{'What else?!'}</button>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' onClick={this.previousCard.bind(null, 5)} style={{'right':'1%'}}>{'back'}</button>
          </div>
        </div>
        <div id='firstLoginCard_6' style={{'display':'none'}}>
          <div class='pointer'>
            <InlineSVG src={require('../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
          </div>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'My Teams. All Teams.'}</h1>
          </div>
          <div class='sub-content'>
            <h1><span>{'My Teams '}</span>{'display only those teams you have edit access for (which means you are a member).'}</h1>
            <h1><span>{'All Teams '}</span>{'display all IBM teams registered in the Agile Team Tool.'}</h1>
          </div>
          <div class='description'>
            <div class='desc-row'>
              <div>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_Add.svg')}></InlineSVG>
              </div>
              <h1>{'Icon creates a new team.'}</h1>
            </div>
            <div class='desc-row'>
              <div>
                <InlineSVG src={require('../../../img/Att-icons/Att-icons_detail.svg')}></InlineSVG>
              </div>
              <h1>{'To be added to a team contact its iteration manager or lead.'}</h1>
            </div>
          </div>
          <div class='btns'>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span style={{'backgroundColor': '#777677'}}></span>
            <span></span>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' onClick={this.nextCard.bind(null, 6)}>{'What else?!'}</button>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' onClick={this.previousCard.bind(null, 6)} style={{'right':'1%'}}>{'back'}</button>
          </div>
        </div>
        <div id='firstLoginCard_7' style={{'display':'none'}}>
          <div class='close-btn' onClick={this.props.hideFirstLoginPopover}>
            <InlineSVG src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
          <div class='content'>
            <h1>{'That\'s It!'}</h1>
          </div>
          <div class='sub-content'>
            <h1>{'If you need additional help feel free to check out the other resources in the top right corner under the "Help" menu.'}</h1>
          </div>
          <div class='btns'>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span style={{'backgroundColor': '#777677'}}></span>
            <button type='button' class='ibm-btn-pri ibm-btn-blue-50' onClick={this.props.hideFirstLoginPopover}>{'Ok. Thanks.'}</button>
            <button type='button' class='ibm-btn-sec ibm-btn-blue-50' onClick={this.previousCard.bind(null, 7)} style={{'right':'1%'}}>{'back'}</button>
          </div>
        </div>
      </div>
    )
  }
});
module.exports = FirstLoginPopover;
