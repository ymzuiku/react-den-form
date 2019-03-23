import React from 'react';

export const immitProps = {
  change: 'onChange',
  click: 'onClick',
};

export const getValuePaths = {
  input: ['target', 'value'],
  textarea: ['target', 'value'],
  select: ['target', 'value'],
};

class Form extends React.Component {
  static isFrom = true;

  constructor(props) {
    super(props);
    this.data = props.data || {};
    this.editChild = void 0;
    this.editIsError = false;
    this.errorList = {};
    this.refsList = {};
  }

  componentWillUnmount() {
    this.data = null;
    this.editChild = null;
    this.errorList = null;
    this.editIsError = null;
  }

  handleOnClick = (e, child, childOnClick) => {
    const { onSubmit } = this.props;
    const field = child && child.props && child.props.field;

    if (typeof childOnClick === 'function') {
      childOnClick();
    }

    if (typeof onSubmit === 'function') {
      onSubmit({
        isError: this.editIsError,
        event: e,
        data: this.data,
        field,
        value: this.data[field],
        update: this.forceUpdate,
        element: child,
      });
    }
  };

  handleOnChange = (e, child, childOnChange) => {
    const { onChange, updateOnChange, onErrorCheck, onSubmit } = this.props;
    let value = void 0;

    this.editChild = child;

    // 如果有getter函数, 使用 getter函数获取对象
    if (typeof child.props.onChangeGetter === 'function') {
      value = child.props.onChangeGetter(e);
    }
    // 如果child的对象的读取路径存在预设, 解析后返回
    else if (getValuePaths[child.type] && e) {
      value = e;
      getValuePaths[child.type].forEach(p => {
        value = value[p];
      });
    }
    // e 为具体的值或者无法计算的函数, 直接返回 e
    else if (typeof e !== 'object' || typeof e === 'function') {
      value = e;
    }
    // 如果child的对象不是一个dom对象, 直接返回 e
    else if (typeof child.type === 'function') {
      value = e;
    }

    // 更新data数据
    this.data[child.props.field] = value;
    this.editIsError = this.errorChecker(child);

    const callbackParams = {
      isError: this.editIsError,
      event: e,
      data: this.data,
      field: child.props.field,
      value,
      update: this.forceUpdate,
      element: child,
    };

    // 执行child的onChange
    if (typeof childOnChange === 'function') {
      childOnChange(callbackParams);
    }

    // 执行 From的onChange
    if (typeof onChange === 'function') {
      onChange(callbackParams);
    }

    // 如果this.errorList历史的错误和当前校验的不一致, 更新form组件
    if (this.errorList[child.props.field] !== this.editIsError) {
      if (typeof onErrorCheck === 'function') {
        onErrorCheck(callbackParams);
      }
      this.forceUpdate();
    } else if (updateOnChange) {
      this.forceUpdate();
    }

    // 如果有e有keyCode, 监听回车事件
    if (e && e.target && !e.target.keydownListen && e.target.addEventListener) {
      const keydownListen = event => {
        if (event && event.keyCode === 13 && typeof onSubmit === 'function') {
          onSubmit(callbackParams);
        }
      };

      e.target.addEventListener('keydown', keydownListen);
      e.target.keydownListen = keydownListen;
    }

    // 更新旧的错误记录
    this.errorList[child.props.field] = this.editIsError;
  };

  errorChecker = child => {
    let isError = false;

    if (typeof child.props.errorcheck === 'object') {
      isError = !child.props.errorcheck.test(this.data[child.props.field]);
    }

    if (typeof child.props.errorcheck === 'function') {
      isError = !child.props.errorCheck({
        data: this.data,
        field: child.props.field,
        value: this.data[child.props.field],
      });
    }

    return isError;
  };

  fixErrorProps = child => {
    if (this.errorChecker(child)) {
      return {
        style: { ...child.props.style, ...child.props.errorstyle },
        className: child.props.className
          ? child.props.className + ' ' + child.props.errorclass
          : child.props.errorclass,
        ...child.props.errorprops,
      };
    }
    return {};
  };

  getChild = children => {
    return React.Children.map(children, child => {
      if (typeof child.type === 'function' && !child.type.isForm) {
        if (child.type.prototype.render) {
          return React.cloneElement(child, { toForm: this.getChild, ...this.fixErrorProps(child) });
        }
        return this.getChild(child.type());
      }
      if (child.props && (child.props.type === 'submit' || child.props.submit)) {
        // 如果包含submit并且也包含field属性
        return React.cloneElement(child, {
          [immitProps.change]: e => this.handleOnChange(e, child, child.props.onChange),
          [immitProps.click]: e => this.handleOnClick(e, child, child.props.onClick),
          ...this.fixErrorProps(child),
        });
      }
      if (child.props && child.props.field) {
        const errorProps = this.fixErrorProps(child);

        return React.cloneElement(child, {
          [immitProps.change]: e => this.handleOnChange(e, child, child.props.onChange),
          ...errorProps,
        });
      }
      if (child.props && child.props.children) {
        return React.cloneElement(child, {}, [this.getChild(child.props.children)]);
      }
      return child;
    });
  };

  render() {
    const { children } = this.props;

    return this.getChild(children);
  }
}

export default Form;
