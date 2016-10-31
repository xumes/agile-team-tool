var React = require('react');
var api = require('../api.jsx');
var lodash = require('lodash');
var displayBlock = {'display':'none'};

var Criteria = React.createClass({
    render: function(){
        var criteria =this.props.criteria.map(function(c){
            return (<li>{c}</li>)
        });

        return(<ul>{criteria}</ul>);
    }
});

var Level = React.createClass({
    render: function(){
        var thisLevel = this.props.levels.map(function(l){
            return (<tr id="atma_ver_006_0_prin_1_prac_1_tbtr_0">
            <td>{l.name}</td>
            <td>
                <Criteria criteria={l.criteria} />
            </td>
            </tr>)
        });

        return (<div class="ibm-twisty-body" id="bodyatma_ver_006_0_prin_1_prac_1" style={displayBlock}>
        <table class="ibm-data-table ibm-altrows agile-practice" width="100%" summary="Maturity assessment level and description for the identified practice.">
          <caption>{this.props.description}</caption>
          <thead>
            <tr>
              <th scope="col" colspan="2">Maturity level</th>
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
            return(<li data-open="true" class="" id="atma_ver_006_0_prin_1_prac_1">
            <a class="ibm-twisty-trigger" href="#toggle">{con.name}<span id="atma_ver_006_0_prin_1_prac_1_ans"></span></a>
            <Level description={con.description} levels={con.levels} />
          </li>)
        });
        return (<div class="ibm-twisty-body" id="bodyatma_ver_006_0_prin_1" style={displayBlock}>
        <ul class="ibm-twisty agile-practice" id="atma_ver_006_0_prin_1_prac">
         {content}  
        </ul>
      </div>)
    }
});

var SubTwisty = React.createClass({
    render: function(){
        var subTwistyContent = this.props.principles.map(function(content) {
             return(<li data-open="true" class="ibm-active" id="atma_ver_006_0_prin_1">
              <a class="ibm-twisty-trigger" href="#toggle">{content.name}</a>
              <SubTwistyContent practices={content.practices} />
            </li>)
        });
        return (<div class="ibm-twisty-body" id="bodyatma_ver_006_0" style={displayBlock}>
          <ul class="ibm-twisty agile-principle" id="atma_ver_006_0_prin">
            {subTwistyContent}
          </ul>
        </div>)
    }
});

var AssessmentActiveTemplates = React.createClass({
  getInitialState: function() {
    return {
      activeTemplates: []
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

  render: function() {
    if(!lodash.isEmpty(this.state.activeTemplates)) {
        var tplId = this.state.activeTemplates.cloudantId;
        var componentName = this.state.activeTemplates['components'].map(function(tpl){
            return(<li data-open="true" id="{tplId}">
            <a class="ibm-twisty-trigger" href="#toggle">{tpl.name}</a>
            <SubTwisty principles={tpl.principles} />
        </li>)
        });
    } else {
        var tplId = null;
        var componentName = null;
    }
  
    return (<div id="assessmentContainer" class="agile-maturity">
        <ul class="ibm-twisty agile-assessment ibm-widget-processed" id="atma_ver_006" data-widget="twisty">
        {componentName}
        </ul>
        </div>)
  }
});

module.exports = AssessmentActiveTemplates;
