var React = require('react');
var api = require('../api.jsx');
var InlineSVG = require('svg-inline-react');

var HomeSearchField = React.createClass({
  getInitialState: function() {
    return {
      cancelBtnHide: 'none'
    }
  },

  componentDidUpdate: function() {
  },

  componentDidMount: function() {
    var self = this;
    $('.home-nav-search-field-cancel svg').attr('title','Cancel').children('title').remove();
    $('#nameSearchField').on('input',function() {
      var inputText = $('#nameSearchField').val();
      if (inputText.length > 0) {
        self.setState({'cancelBtnHide': 'block'});
      } else {
        self.setState({'cancelBtnHide': 'none'});
      }
    });
  },

  cancelBtnOnClick: function() {
    $('#nameSearchField').val('');
    this.setState({'cancelBtnHide': 'none'});
    $('#newSearchTree').hide();
    $('#newTeamTree').show();
    $('.home-team-nav').nanoScroller();
  },

  render: function() {
    var searchFieldStyle = {
      'display': 'none',
      'position': 'relative'
    };
    var cancelBtnStyle = {
      'display': this.state.cancelBtnHide
    };

    return (
      <div id='searchFieldDiv' class='home-nav-tab-search-field' style={{'display':'none'}}>
        <input id='nameSearchField' type='search' class='home-nav-search-field' name='search' placeholder='Enter team name to filter...' aria-label='nameSearchField'></input>
        <div id='searchCancel' class='home-nav-search-field-cancel' style={cancelBtnStyle} onClick={this.cancelBtnOnClick}>
          <InlineSVG src={require('../../../img/Att-icons/att-icons_close-cancel.svg')}></InlineSVG>
        </div>
      </div>
    )

  }
});

module.exports = HomeSearchField;
