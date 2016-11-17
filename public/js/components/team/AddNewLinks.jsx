var React = require('react');
var LinksForm = require('./LinksForm.jsx');

var AddNewLinks = React.createClass({

  render: function() {
    var self = this;
    var numChildLinks = self.props.getNumChildLinks();
    // console.log('render numChildLinks:',numChildLinks)
    var childLinks = [];
    for (var i = 0; i < numChildLinks; i++) {
      childLinks.push(<LinksForm key={i}
        data-counter={i}
        selectedTeam={self.props.selectedTeam}
        initSelectLabel={self.props.initSelectLabel}
        updateLink={self.props.updateLink}
        resetNumChildLinks={self.props.resetNumChildLinks}
        getSelectedLinkLabel={self.props.getSelectedLinkLabel}
        setSelectedLinkLabel={self.props.setSelectedLinkLabel} />);
    };
    return (
      <div>
        {childLinks}
      </div>
    );
  }
});

module.exports = AddNewLinks;
