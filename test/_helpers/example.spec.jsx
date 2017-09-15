import React from 'react';
import { shallow, mount } from 'enzyme';

const CommonModal = require('../../public/js/components/common-modal/common-modal.jsx');

describe('Welcome', () => {
  it('Welcome renders hello world', () => {
    const welcome = shallow(<CommonModal />);
    expect(welcome.find('Modal').length).toBe(1);
  });
});

class Add extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    };
    this.handleAdd = this.handleAdd.bind(this);
  }

  handleAdd(e) {
    e.preventDefault();
    this.props.onAdd(this.state.name);
  }

  render() {
    return (
      <form>
        <input
          type="text"
          name="name"
          value={this.state.name}
          onChange={e => this.setState({ name: e.target.value })}
        />
        <button onClick={this.handleAdd}>Add</button>
      </form>
    );
  }
}

describe('Add', () => {
  let add;
  let onAdd;

  beforeEach(() => {
    onAdd = jasmine.createSpy('onAdd');
    add = mount(<Add onAdd={onAdd} />);
  });

  afterEach(() => {
    this.onAdd = null;
    delete this.onAdd;
  });

  it('Add requires onAdd prop', () => {
    expect(add.props().onAdd).toBeDefined();
  });

  it('Add renders button', () => {
    const button = add.find('button').first();
    expect(button).toBeDefined();
  });

  it('Button click calls onAdd', () => {
    const button = add.find('button').first();
    const input = add.find('input').first();
    input.simulate('change', { target: { value: 'Name 4' } });
    button.simulate('click');
    expect(onAdd).toHaveBeenCalledWith('Name 4');
  });
});
