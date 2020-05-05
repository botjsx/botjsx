const assert = require('assert');
const sinon = require('sinon');
const PropTypes = require('prop-types');
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

  it('should run array of child components', () => {
    const Parent = function({children}) {
      return children;
    };

    const Child1 = sinon.spy();
    const Child2 = sinon.spy();

    Bot.run(
      Bot.createComponent(Parent, null,
        Bot.createComponent(Child1, null),
        Bot.createComponent(Child2, null))
    );

    assert.ok(Child1.called);
    assert.ok(Child2.called);
  });

  it('useAsync should resolve child component', () => {
    function testAsync() {
      return new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
    }

    const Child = sinon.spy();

    const Parent = function({children}) {
      const resolve = Bot.useAsync();
      return testAsync().then(() => resolve(children));
    };

    Bot.run(Bot.createComponent(Parent, null,
      Bot.createComponent(Child, null))
    ).then(() => {
      assert.ok(Child.called);
    });
  });

  it('createContext should create context', () => {
    const Component = function() {
      const setContext = Bot.createContext();
      setContext({test: 1});
    };

    Bot.run(Bot.createComponent(Component, null));

    assert.deepEqual(Bot.useContext(Component), {test: 1});
  });

  it('should return component result', () => {
    const Component = () => 'test';
    const result = Bot.run(Bot.createComponent(Component, null));
    assert.equal(result, 'test');
  });

  it('validate prop types', () => {
    sinon.stub(console, 'error');
    const Component = () => {};
    Component.propTypes = {
      someProp: PropTypes.string.isRequired
    };
    Bot.run(Bot.createComponent(Component, null));
    assert.ok(console.error.called);
  });
});
