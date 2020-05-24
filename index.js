const isProduction = process.env.NODE_ENV === 'production';
const PropTypes = isProduction ? undefined : require('prop-types');

const Bot = {};
const isComponent = Symbol('isComponent');
let currentComponent;

function setCurrentComponent(component) {
  if (!component || component[isComponent]) {
    currentComponent = component;
  }
}

function validatePropTypes(component) {
  const componentFn = component.component;
  if (!componentFn.propTypes) return;
  if (component.props) {
    const componentName = componentFn.name || '';
    PropTypes.checkPropTypes(componentFn.propTypes, component.props, 'prop', componentName);
  }
}

function runFunction(component) {
  const context = Bot.useContext(currentComponent.component);
  return Bot.run(component(context));
}

function runArray(components) {
  const results = [];
  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    if (component === null || component === undefined) continue;
    const prevComponent = component[isComponent] ? component : currentComponent;
    const result = Bot.run(component);
    setCurrentComponent(prevComponent);
    results.push(result);
  }
  setCurrentComponent(undefined);
  return results;
}

function runComponent(component) {
  let componentResult;
  const prevComponent = currentComponent;
  setCurrentComponent(component);
  if (!isProduction) validatePropTypes(component);
  if (prevComponent) currentComponent.context = new Map(prevComponent.context);
  const useDefaultWrapper = component.component.useDefaultWrapper;
  const componentFn = useDefaultWrapper === false ? component.component : Bot.defaultWrapper(component.component);
  componentResult = componentFn(component.props);
  if (componentResult) {
    return Bot.run(componentResult);
  }
  setCurrentComponent(undefined);
}

Bot.useRunner = function() {
  const _currentComponent = currentComponent;
  return component => {
    setCurrentComponent(_currentComponent);
    return Bot.run(component);
  };
};

Bot.createContext = function() {
  const _currentComponent = currentComponent;
  return [
    context => _currentComponent.context.set(_currentComponent.component, context),
    () => _currentComponent.context.delete(_currentComponent.component)
  ]
};

Bot.useContext = function(key) {
  if (!currentComponent) {
    throw new Error('useContext should be running inside of component');
  }
  return currentComponent.context.get(key);
};

Bot.run = function(component) {
  if (component) {
    if (typeof(component) === 'function') {
      return runFunction(component);
    }
    if (Array.isArray(component)) {
      return runArray(component);
    }
    if (component[isComponent]) {
      return runComponent(component);
    }
  }
  setCurrentComponent(undefined);
  return component;
};

Bot.createComponent = function(component, props, ...children) {
  if (!component) throw new Error('component is not defined');
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

function Fragment({children}) {
  return children;
}
Fragment.useDefaultWrapper = false;
Bot.Fragment = Fragment;

Bot.defaultWrapper = function(component) {
  return function(props) {
    const run = Bot.useRunner();
    const [setContext, removeContext] = Bot.createContext();

    const res = component(props);

    function handleResult(res) {
      if (res && props.children) {
        if (props.children !== res) {
          setContext(res);
        } else {
          removeContext()
        }
        run(props.children);
      }
    }

    // res is Promise
    if (res && typeof res.then === 'function') {
      return new Promise((resolve) => {
        res.then(res => {
          handleResult(res);
          removeContext();
          resolve(res);
        });
      });
    } else {
      handleResult(res);
    }

    removeContext();
    return res;
  }
};

module.exports = Object.freeze(Bot);
