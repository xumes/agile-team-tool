var React = require('react');
var api = require('../api.jsx');
var lodash = require('lodash');

var anchorInfo = {
      'cursor': 'default',
      'position': 'relative',
      'left': '5px',
      'top' :'0px',
      'display': 'inline'
    };
var thWidth = {'width' : '7%'};

var hideContainer = { 'display' : 'none'};
var showContainer = { 'display': 'block', 'height' : 'auto'};
var displayBlock = { 'display': 'block', 'height' : 'auto'};

var Criteria = React.createClass({
    render: function(){
        var criteria =this.props.criteria.map(function(c){
            return (<li>{c}</li>)
        });

        return(<ul>{criteria}</ul>);
    }
});

var Level = React.createClass({
    /*
    <td>
      Criteria Radio
    </td>
    <td>Target Radio</td>
    */
    render: function(){
        var thisLevel = this.props.levels.map(function(l){
            return (
              <tr key={l.name}>
                <td>{l.name}</td>
                <td>
                  <Criteria criteria={l.criteria} />
                </td>
              </tr>
            )
        });
        /*
        <th scope='col' style={thWidth}>
          Current<a style={anchorInfo} class='ibm-information-link' data-widget='tooltip' title='Your team's current maturity level.'></a>
        </th>
        <th scope='col' style={thWidth}>
          Target<a style={anchorInfo} class='ibm-information-link' data-widget='tooltip' title='Your team's targets for the next 90 days.  Choose the practices that the team agrees will have the most impact.'></a>
        </th>
        */
        return (<div class='ibm-twisty-body' style={displayBlock}>
        <table class='ibm-data-table ibm-altrows agile-practice' width='100%' summary='Maturity assessment level and description for the identified practice.'>
          <caption>{this.props.description}</caption>
          <thead>
            <tr>
              <th scope='col' colSpan='2'>Maturity level</th>
            </tr>
          </thead>
          <tbody>
           {thisLevel}
          </tbody>
          </table>
        </div>);
    }
});

var SubTwistyContent = React.createClass({
    render: function(){
        var content = this.props.practices.map(function(con){
            return(<li class='ibm-active'>
            <a class='ibm-twisty-trigger' href='#toggle'>{con.name}</a>
            <Level description={con.description} levels={con.levels} />
          </li>)
        });
        return (<div class='ibm-twisty-body' style={displayBlock}>
        <ul class='ibm-twisty agile-practice'>
         {content}
        </ul>
      </div>)
    }
});

var SubTwisty = React.createClass({
    render: function(){
        var subTwistyContent = this.props.principles.map(function(content) {
          return(
            <li class='ibm-active' key={content.name}>
              <a class='ibm-twisty-trigger' href='#toggle'>{content.name}</a>
              <SubTwistyContent practices={content.practices} />
            </li>
          );
        });
        console.log('containerTag: ', this.props.containerTag);
        return (<div class='ibm-twisty-body' style={displayBlock} ref={this.props.containerTag}>
          <ul class='ibm-twisty agile-principle'>
            {subTwistyContent}
          </ul>
        </div>)
    }
});

var AssessmentActiveTemplates = React.createClass({
  getInitialState: function() {
    return {
      activeTemplates: [],
      childVisible : hideContainer
    }
  },

  componentDidMount: function() {
    var self = this;
    api.getAssessmentTemplate(null, 'active')
      .then(function(tpl) {
        self.setState({
          activeTemplates: tpl[0]
        })
      });
  },

  toggleChild: function(e){
    var target = e.target.id;
    var thisStyle = this.refs[target].style;
    if(thisStyle.display == 'none'){
      this.refs[target].style.display =  'block';
      this.refs['i' + target].className = 'ibm-active';
    } else {
      this.refs[target].style.display =  'none';
      this.refs['i' + target].className = '';
    }
  },

  render: function() {
    var toggleChild = this.toggleChild;
    if(!lodash.isEmpty(this.state.activeTemplates)) {
        var tplId = this.state.activeTemplates.cloudantId;
        var cnt = 1;
        var visibility = this.state.childVisible;
        var componentName = this.state.activeTemplates['components'].map(function(tpl){
          var childTag = 'firstChild' + cnt;
          var indicator = 'i' + childTag;
          cnt++;
          return(
            <li id={tplId} class='' ref={indicator} key={tplId}>
              <a class='ibm-twisty-trigger' id={childTag} onClick={toggleChild} href='#toggle'>{tpl.name}</a>
              <div ref={childTag} style={visibility}>
                <SubTwisty principles={tpl.principles}/>
              </div>
            </li>
          );
        });
    } else {
        var tplId = null;
        var componentName = null;
    }

    return (<div id='assessmentContainer' class='agile-maturity'>
        <ul class='ibm-twisty agile-assessment ibm-widget-processed'>
        {componentName}
        </ul>
        </div>)
  }
});

module.exports = AssessmentActiveTemplates;
