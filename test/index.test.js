const assert = require('assert');
const sinon = require('sinon');
const PropTypes = require('prop-types');
const Bot = require('../index');

describe('general test', () => {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('createComponent should return valid object', () => {
    const SomeComponent = function () {
    };
    const component = Bot.createComponent(SomeComponent, {testProp: 'testProp'}, 'children');
    assert.ok(typeof component.component === 'function');
    assert.deepEqual(component.props, {
      testProp: 'testProp',
      children: 'children'
    });
  });

  it('createComponent should return array of children', () => {
    const SomeComponent = function () {
    };
    const component = Bot.createComponent(SomeComponent, {testProp: 'testProp'}, 1, 2);
    assert.deepEqual(component.props.children, [1, 2]);
  });

  it('should run child component', () => {
    const Parent = function ({children}) {
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
    const Parent = function ({children}) {
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

  it('useRunner should run child component', () => {
    function testAsync() {
      return new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
    }

    const Child = sinon.spy();

    const Parent = function ({children}) {
      const run = Bot.useRunner();
      return testAsync().then(() => run(children));
    };

    Bot.run(Bot.createComponent(Parent, null,
      Bot.createComponent(Child, null))
    ).then(() => {
      assert.ok(Child.called);
    });
  });

  it('createContext should create context', () => {
    const Component = function({children}) {
      const setContext = Bot.createContext();
      setContext({test: 1});
      return children;
    };

    const Child = function() {
      const context = Bot.useContext(Component);
      assert.deepEqual(context, {test: 1});
    };

    Bot.run(
      Bot.createComponent(Component, null,
        Bot.createComponent(Child, null))
    );
  });

  it('context should not be available outside of component stack', () => {
    const Component = function({children}) {
      const setContext = Bot.createContext();
      setContext({test: 1});
      return children;
    };

    Bot.run(Bot.createComponent(Component, null));
    assert.throws(() => Bot.useContext(Component), Error);
  });

  it('context should pass to array', () => {
    const Component = function({children}) {
      const setContext = Bot.createContext();
      setContext({test: 1});
      return children;
    };

    const Child1 = function() {};

    const Child2 = function() {
      const context = Bot.useContext(Component);
      assert.deepEqual(context, {test: 1});
    };

    Bot.run(
      Bot.createComponent(Component, null,
        Bot.createComponent(Child1, null),
        Bot.createComponent(Child2, null))
    );
  });

  it('context should not be changed in parent component', async () => {
    function test() {
      return new Promise((resolve, reject) => {
        function testAsync() {
          return new Promise(resolve => {
            setTimeout(resolve, 1);
          });
        }

        const Parent = function({children}) {
          const run = Bot.useRunner();
          const setContext = Bot.createContext();
          return testAsync().then(() => {
            setContext({parent: true});
            run(children);
          });
        };

        const Parent2 = function () {
          const setContext = Bot.createContext();
          setContext({parent2: true});
        };

        const Child = function () {
          const parentContext = Bot.useContext(Parent);
          try {
            assert.deepEqual(parentContext, {parent: true});
            assert.throws(() => Bot.useContext(Parent2), Error);
            resolve();
          } catch(err) {
            reject(err);
          }
        };

        Bot.run(Bot.createComponent(Bot.Fragment, null,
          Bot.createComponent(Parent, null,
            Bot.createComponent(Child, null)),
          Bot.createComponent(Parent2, null))
        );
      });
    }

    await test();
  });

  it('should return component result', () => {
    const Component = () => 'test';
    const result = Bot.run(Bot.createComponent(Component, null));
    assert.equal(result, 'test');
  });

  it('validate prop types', () => {
    const isProduction = process.env.NODE_ENV === 'production';
    sinon.stub(console, 'error');
    const Component = () => {};
    Component.propTypes = {
      someProp: PropTypes.string.isRequired
    };
    Bot.run(Bot.createComponent(Component, null));
    assert.ok(isProduction ? !console.error.called : console.error.called);
  });

  it('useRunner hook should return value', () => {
    const Child = () => 'result';

    const Component = ({child}) => {
      const run = Bot.useRunner();
      const result = run(child);
      assert.equal(result, 'result');
    };

    Bot.run(Bot.createComponent(Component, {child: Bot.createComponent(Child, null)}));
  });

  it('should not change current component when children is function', () => {
    const Component = ({children}) => {
      const setContext = Bot.createContext();
      setContext({test: 1});
      return children;
    };

    const Child = () => {
      const context = Bot.useContext(Component);
      assert.deepEqual(context, {test: 1});
    };

    Bot.run(Bot.createComponent(Component, null,
      () => {},
      Bot.createComponent(Child, null))
    );
  });

  it('composition', () => {
    const Component = () => {
      return 'test';
    };

    const Component2 = () => {
      return Bot.createComponent(Component);
    };

    const res = Bot.run(Bot.createComponent(Component2));
    assert.equal(res, 'test');
  });

  it('useContext throw error when no context', () => {
    const F = () => {};
    const Component = () => {
      Bot.useContext(F);
    };

    assert.throws(() => Bot.run(Bot.createComponent(Component, null)), Error);
  });
});
