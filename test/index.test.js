const assert = require('assert');
const Bot = require('../index');

describe('library test', () => {
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
});
