const Bot = {};
const isComponent = Symbol('isComponent');
let currentComponent;

function setCurrentComponent(component) {
  currentComponent = component;
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
  return currentComponent.context.get(key);
};

Bot.run = function(component) {
  if (!component) return;
  let componentResult;
  if (typeof(component) === 'function') {
    const context = currentComponent.context.get(currentComponent.component);
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
  if (!component.component) return component;
  const prevComponent = currentComponent;
  setCurrentComponent(component);
  if (prevComponent) currentComponent.context = new Map(prevComponent.context);
  componentResult = component.component(component.props);
  if (componentResult) return Bot.run(componentResult);
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
