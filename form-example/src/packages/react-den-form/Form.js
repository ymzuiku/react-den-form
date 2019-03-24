import React from 'react';
import FormItem from './FormItem';
import { getValuePaths, immitProps } from './utils';

class Form extends React.Component {
  static isFrom = true;

  constructor(props) {
    super(props);
    this.data = props.data || {};
    this.editChild = void 0;
    this.editIsError = false;
    this.errorList = {};
    this.refList = {};
  }

  shouldComponentUpdate() {
    return false;
  }

  componentWillUnmount() {
    this.data = null;
    this.editChild = null;
    this.errorList = null;
    this.editIsError = null;
  }

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

  updateByData = (updateObj = { [this.editChild.field]: { val: this.data[this.editChild.field] } }) => {
    for (const field in updateObj) {
      if (this.refList[field] && this.refList[field].length > 0) {
        this.refList[field].forEach(ref => {
          if (updateObj[field].val !== void 0) {
            this.data[field] = updateObj[field].val;
          }
          if (ref.current) {
            let node;
            if (ref.current._default) {
              node = ref.current._default;
            } else {
              node = ref.current;
            }
            node.updateFromProps(updateObj[field]);
          }
        });
      }
    }
  };

  fixUpdateProps = (child, props) => {
    const isError = this.errorChecker(child);

    if (isError) {
      return {
        [immitProps.value]: this.data[child.props.field],
        style: { ...child.props.style, ...child.props.errorstyle },
        className: child.props.className
          ? child.props.className + ' ' + child.props.errorclass
          : child.props.errorclass,
        ...child.props.errorprops,
        ...props,
      };
    }

    return {
      [immitProps.value]: this.data[child.props.field],
      style: { ...child.props.style },
      className: child.props.className,
      ...props,
    };
  };

  handleOnClick = (e, child, childOnClick) => {
    const { onSubmit } = this.props;
    const field = child && child.props && child.props.field;

    if (typeof childOnClick === 'function') {
      childOnClick();
    }

    const isError = this.errorChecker(child);

    if (typeof onSubmit === 'function') {
      onSubmit({
        isError,
        event: e,
        data: this.data,
        field,
        value: this.data[field],
        update: this.updateByData,
        element: child,
      });
    }
  };

  handleOnChange = (e, child, childOnChange) => {
    const { onChange, onErrorCheck, onSubmit } = this.props;
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
    const isError = this.errorChecker(child);

    const callbackParams = {
      isError,
      event: e,
      data: this.data,
      field: child.props.field,
      value,
      update: this.updateByData,
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
    if (this.errorList[child.props.field] !== isError) {
      // 更新旧的错误记录
      this.errorList[child.props.field] = isError;
      if (typeof onErrorCheck === 'function') {
        onErrorCheck(callbackParams);
      }
      this.updateByData();
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
  };

  getChild = children => {
    return React.Children.map(children, child => {
      if (typeof child.type === 'function' && !child.type.isForm) {
        if (child.type.prototype.render) {
          return React.cloneElement(child, { toForm: this.getChild, ...this.fixUpdateProps(child) });
        }
        return this.getChild(child.type());
      }
      if (child.props && (child.props.type === 'submit' || child.props.submit)) {
        // 如果包含submit并且也包含field属性
        if (child.props.field) {
          if (!this.refList[child.props.field]) {
            this.refList[child.props.field] = [];
          }

          const ref = React.createRef();

          this.refList[child.props.field].push(ref);

          const props = {
            ref,
            fixErrorProps: this.fixUpdateProps,
            [immitProps.value]: this.data[child.props.field] || child.props[immitProps.value],
            [immitProps.change]: e => this.handleOnChange(e, child, child.props.onChange),
            [immitProps.click]: e => this.handleOnClick(e, child, child.props.onClick),
          };

          return <FormItem {...props}>{child}</FormItem>;
        }
        return React.cloneElement(child, {
          [immitProps.value]: this.data[child.props.field] || child.props[immitProps.value],
          [immitProps.click]: e => this.handleOnClick(e, child, child.props.onClick),
          ...this.fixUpdateProps(child),
        });
      }
      if (child.props && child.props.field) {
        if (!this.refList[child.props.field]) {
          this.refList[child.props.field] = [];
        }

        const ref = React.createRef();

        this.refList[child.props.field].push(ref);

        const props = {
          ref,
          fixErrorProps: this.fixUpdateProps,
          [immitProps.value]: this.data[child.props.field] || child.props[immitProps.value],
          [immitProps.change]: e => this.handleOnChange(e, child, child.props.onChange),
        };

        return <FormItem {...props}>{child}</FormItem>;
      }
      if (child.props && child.props.children) {
        return React.cloneElement(child, {}, [this.getChild(child.props.children)]);
      }
      return child;
    });
  };

  render() {
    this.refList = {};

    const { children } = this.props;

    const node = this.getChild(children);
    console.log(node);
    return node;
  }
}

export default Form;
