const assert = require('assert');
const sinon = require('sinon');
const Bot = require('../index');

describe('createContext wrapper', () => {
  afterEach(() => {
    // Restore the default sandbox here
    sinon.restore();
  });

  it('first', () => {
    const Component = Bot.createContext(() => {
      return 1;
    });
    const res = Bot.run(Bot.createComponent(Component));
    assert.equal(res, 1);
  });

  it('should call child component', () => {
    const Parent = Bot.createContext(() => {
      return {
        ping: 'pong'
      }
    });

    const Child = sinon.spy();

    Bot.run(Bot.createComponent(Parent, null,
      Bot.createComponent(Child))
    );
    assert.ok(Child.called);
  });

  it('should not call child component', () => {
    const Parent = Bot.createContext(() => {});
    const Child = sinon.spy();
    Bot.run(Bot.createComponent(Parent, null,
      Bot.createComponent(Child))
    );
    assert.ok(!Child.called);
  });

  it('child component should has context from parent', () => {
    const Parent = Bot.createContext(() => {
      return {
        ping: 'pong'
      }
    });

    function Child() {
      const context = Bot.useContext(Parent);
      assert.deepEqual(context, {ping: 'pong'});
    }

    Bot.run(Bot.createComponent(Parent, null,
      Bot.createComponent(Child))
    );
  });

  it('result should contain result from Child', () => {
    const Parent = Bot.createContext(() => {
      return {
        arr: []
      }
    });

    function Child() {
      const context = Bot.useContext(Parent);
      context.arr.push(1);
    }

    const res = Bot.run(Bot.createComponent(Parent, null,
      Bot.createComponent(Child))
    );

    assert.deepEqual(res, {arr: [1]});
  });

  it('useRunner should run prop', () => {
    const Component = Bot.createContext(({anotherComponent}) => {
      const run = Bot.useRunner();
      return {
        res: run(anotherComponent)
      }
    });

    function AnotherComponent() {
      return 'test';
    }

    const res = Bot.run(Bot.createComponent(Component, {anotherComponent: Bot.createComponent(AnotherComponent)}));
    assert.deepEqual(res, {res: 'test'});
  });

  it('async: should return async result', async () => {
    async function test() {
      function asyncFn() {
        return new Promise(resolve => {
          setTimeout(resolve, 1);
        });
      }

      const Component = Bot.createContext(async function() {
        await asyncFn();
        return 1;
      });

      const res = await Bot.run(Bot.createComponent(Component));
      assert.deepEqual(res, 1);
    }

    await test();
  });

  it('async: should pass context to child', async () => {
    async function test() {
      let childIsRun = false;
      function asyncFn() {
        return new Promise(resolve => {
          setTimeout(resolve, 1);
        });
      }

      const Component = Bot.createContext(async function() {
        await asyncFn();
        return {test: 1};
      });

      function Child() {
        const context = Bot.useContext(Component);
        childIsRun = true;
        assert.deepEqual(context, {test: 1});
      }

      await Bot.run(Bot.createComponent(Component, null,
        Bot.createComponent(Child)));
      assert.ok(childIsRun);
    }

    await test();
  });
});
