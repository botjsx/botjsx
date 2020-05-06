const PropTypes = require('prop-types');

const Bot = {};
const isComponent = Symbol('isComponent');
let currentComponent;

function setCurrentComponent(component) {
  currentComponent = component;
}

function validatePropTypes(component) {
  const componentFn = component.component;
  if (!componentFn.propTypes) return;
  if (component.props) {
    const componentName = componentFn.name || '';
    PropTypes.checkPropTypes(componentFn.propTypes, component.props, 'prop', componentName);
  }
}

Bot.useAsync = function() {
  const _currentComponent = currentComponent;
  return component => {
    setCurrentComponent(_currentComponent);
    Bot.run(component);
  };
};

Bot.createContext = function() {
  const _currentComponent = currentComponent;
  return context => _currentComponent.context.set(_currentComponent.component, context);
};

Bot.useContext = function(key) {
  if (!currentComponent) {
    throw new Error('useContext should be running inside of component');
  }
  return currentComponent.context.get(key);
};

Bot.run = function(component) {
  let componentResult;
  if (typeof(component) === 'function') {
    const context = Bot.useContext(currentComponent.component);
    componentResult = component(context);
    return Bot.run(componentResult);
  }
  if (Array.isArray(component)) {
    const results = [];
    for (let i = 0; i < component.length; i++) {
      if (component[i] === null || component[i] === undefined) continue;
      const result = Bot.run(component[i]);
      results.push(result);
    }
    return results;
  }
  if (!component || !component[isComponent]) {
    setCurrentComponent(undefined);
    return component;
  }
  const prevComponent = currentComponent;
  setCurrentComponent(component);
  validatePropTypes(component);
  if (prevComponent) currentComponent.context = new Map(prevComponent.context);
  componentResult = component.component(component.props);
  if (componentResult) return Bot.run(componentResult);
  setCurrentComponent(undefined);
};

Bot.createComponent = function(component, props, ...children) {
  if (!props) props = {};
  if (children.length) {
    props.children = children.length === 1 ? children[0] : children;
  }
  return {
    [isComponent]: true,
    component,
    props,
    context: new Map()
  };
};

Bot.Fragment = function({children}) {
  return children;
};

module.exports = Object.freeze(Bot);
