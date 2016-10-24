var React = require('react');
var api = require('../api.jsx');

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
    $('#searchTree').hide();
    $('#teamTree').show();
    $('.nano').nanoScroller();
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
      <div id='searchFieldDiv' style={searchFieldStyle}>
        <input id="nameSearchField" type="search" class="agile-search-field" name="search" placeholder="Enter team name to filter..." aria-label="nameSearchField"></input>
        <input type="image" src="../../img/ibm_icon/close_128.png" id="searchCancel" class="agile-search-field-cancel" style={cancelBtnStyle} onClick={this.cancelBtnOnClick}></input>
      </div>
    )

  }
});

module.exports = HomeSearchField;
