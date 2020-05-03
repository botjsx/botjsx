const assert = require('assert');
const sinon = require('sinon');
const Bot = require('../index');

describe('library test', () => {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('createComponent should return valid object', () => {
    const SomeComponent = function() {};
    const component = Bot.createComponent(SomeComponent, {testProp: 'testProp'}, 'children');
    assert.deepEqual(component, {
      component: SomeComponent,
      props: {
        testProp: 'testProp',
        children: 'children'
      },
      context: component.context
    });
  });

  it('createComponent should return array of children', () => {
    const SomeComponent = function() {};
    const component = Bot.createComponent(SomeComponent, {testProp: 'testProp'}, 1, 2);
    assert.deepEqual(component.props.children, [1,2]);
  });

  it('should run child component', () => {
    const Parent = function({children}) {
      return children;
    };

    const Child = sinon.spy();

    Bot.run(
      Bot.createComponent(Parent, null,
        Bot.createComponent(Child, null))
    );

    assert.ok(Child.called);
  });
});
