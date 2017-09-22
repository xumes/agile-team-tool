require('./wizard.scss');
const PropTypes = require('prop-types');
const React = require('react');
const _ = require('lodash');

class Wizard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // page: props.page || 1,
      previousLabel: 'Previous',
      nextLabel: 'Next',
      closeLabel: 'Close',
    };
    this.props = props;
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.close = this.close.bind(this);
    this.save = this.save.bind(this);

    this.navButtons = {
      btnPrevious: {
        id: 'btnPrevious',
        label: 'Previous',
        class: 'ibm-btn-sec ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.previousPage,
        hide: false,
        order: 1,
      },
      btnNext: {
        id: 'btnNext',
        label: 'Next',
        class: 'ibm-btn-pri ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.nextPage,
        hide: false,
        order: 2,
      },
      btnCancel: {
        id: 'btnCancel',
        label: 'Cancel',
        class: 'ibm-btn-sec ibm-btn-small ibm-btn-blue-50 u-mr-sm',
        onClick: this.close,
        hide: false,
        order: 3,
      },
    };
  }
  nextPage() {
    // this.setState({ page: this.props.wizard.page + 1 });
    this.props.goToPage(this.props.wizard.page + 1);
  }
  previousPage() {
    // this.setState({ page: this.props.wizard.page - 1 });
    this.props.goToPage(this.props.wizard.page - 1);
  }
  close() {
    this.props.onClose();
  }
  save() {
    this.props.onSave();
  }
  render() {
    let navButtons = _.toArray(this.navButtons);
    const displayedChild = this.props.children
      .find(child => Number.parseInt(child.props.page, 10) === this.props.wizard.page);

    const options = displayedChild.props.options;
    if (options) {
      //  applying custom options for buttons
      const newButtons = _.reject(options, opt => opt.id === this.navButtons[opt.id]);
      const unionButtons = _.union(newButtons, navButtons);
      const buttons = unionButtons.map((button) => {
        const option = options[button.id];
        return _.assign({}, button, option);
      });

      //  reordering the buttons
      navButtons = _.orderBy(buttons, 'order');
    }

    const listNavButtons = navButtons
      .map(button =>
        (
          !button.hide && <button
            key={button.id}
            className={button.class}
            onClick={button.onClick}
          >
            {button.label}
          </button>),
      );

    return (
      <div className="att-wizard__content-container">
        <div className="att-wizard__content">
          {displayedChild}
        </div>
        <footer className="att-wizard__footer">
          {listNavButtons}
        </footer>
      </div>
    );
  }
}

Wizard.defaultProps = {
  children: undefined,
  wizard: {},
  onClose: null,
  onSave: null,
  goToPage: null,
};

Wizard.propTypes = {
  children: PropTypes.node,
  wizard: PropTypes.shape({ page: PropTypes.number, close: PropTypes.bool }),
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  goToPage: PropTypes.func,
};

module.exports = Wizard;
