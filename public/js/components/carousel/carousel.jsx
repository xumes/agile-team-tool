const React = require('react');
const PropTypes = require('prop-types');
require('./../../../css/w3ds/w3ds');

const defaultOptions = {
  index: 0,
  isLooping: false,
  autoPlay: true,
  interval: 5000,
};

class Carousel extends React.Component {
  constructor(options = defaultOptions) {
    super();
    this.options = options;
  }

  componentDidMount() {
    this.carousel = global.w3ds.carousel(global.document.querySelector('.ds-carousel'), this.options);
  }

  prev() {
    this.carousel.prev();
  }

  next() {
    this.carousel.next();
  }

  stop() {
    this.carousel.stop();
  }

  play(index, interval) {
    this.carousel.play(index, interval);
  }

  goToSlide(index) {
    this.carousel.goToSlide(index);
  }

  render() {
    return (
      <div className="ds-carousel ds-autoplay">
        {this.props.children}
      </div>
    );
  }
}

Carousel.propTypes = {
  children: PropTypes.node,
};

Carousel.defaultProps = {
  children: undefined,
};

module.exports = Carousel;
