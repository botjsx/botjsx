const Bot = {};
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

Bot.run = function(botComponent) {
  if (!botComponent) return;
  let componentResult;
  if (typeof(botComponent) === 'function') {
    const context = currentComponent.context.get(currentComponent.component);
    componentResult = botComponent(context);
    return Bot.run(componentResult);
  }
  if (Array.isArray(botComponent)) {
    const results = [];
    for (let i = 0; i < botComponent.length; i++) {
      if (botComponent[i] === null || botComponent[i] === undefined) continue;
      const result = Bot.run(botComponent[i]);
      results.push(result);
    }
    return results;
  }
  if (!botComponent.component) return botComponent;
  const prevComponent = currentComponent;
  setCurrentComponent(botComponent);
  if (prevComponent) currentComponent.context = new Map(prevComponent.context);
  componentResult = botComponent.component(botComponent.props);
  if (componentResult) {
    return Bot.run(componentResult);
  }
};

Bot.createComponent = function(component, props, ...children) {
  if (!props) props = {};
  if (children.length) {
    props.children = children.length === 1 ? children[0] : children;
  }

  return {
    component,
    props,
    context: new Map()
  };
};

Bot.Fragment = function({children}) {
  return children;
};

module.exports = Object.freeze(Bot);
