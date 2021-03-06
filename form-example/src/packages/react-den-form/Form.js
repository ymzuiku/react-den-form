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
    const { shouldUpdate } = this.props;

    if (shouldUpdate !== void 0) {
      return shouldUpdate;
    }

    return true;
  }

  componentWillUnmount() {
    this.data = null;
    this.editChild = null;
    this.errorList = null;
    this.editIsError = null;
    this.refList = {};
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

  updateByData = (
    updateObj = { [this.editChild.props.field]: { [immitProps.value]: this.data[this.editChild.props.field] } },
  ) => {
    for (const field in updateObj) {
      if (this.refList[field] && this.refList[field].length > 0) {
        this.refList[field].forEach(ref => {
          let props = updateObj[field];

          if (typeof props === 'string') {
            props = { [immitProps.value]: props };
          }

          if (props[immitProps.value] !== void 0) {
            this.data[field] = props[immitProps.value];
          }
          if (ref.current) {
            const node = ref.current._default ? ref.current._default : ref.current;

            node.updateFromProps(props);
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
    const { onChange, onErrorCheck } = this.props;

    let value = void 0;

    this.editChild = child;

    if (typeof child.props.onChangeGetter === 'function') {
      // 如果有getter函数, 使用 getter函数获取对象
      value = child.props.onChangeGetter(e);
    } else if (getValuePaths[child.type] && e) {
      // 如果child的对象的读取路径存在预设, 解析后返回
      value = e;
      getValuePaths[child.type].forEach(p => {
        value = value[p];
      });
    } else if (typeof e !== 'object' || typeof e === 'function') {
      // e 为具体的值或者无法计算的函数, 直接返回 e
      value = e;
    } else if (typeof child.type === 'function') {
      // 如果child的对象不是一个dom对象, 直接返回 e
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
    }

    this.callbackParams = callbackParams;
    this.updateByData();

    // 如果有e有keyCode, 监听回车事件
    if (e && e.target && !e.target.keydownListen && e.target.addEventListener) {
      e.target.addEventListener('keydown', this.keydownListen);
      e.target.keydownListen = this.keydownListen;
    }
  };

  keydownListen = event => {
    const { onSubmit } = this.props;

    if (event && event.keyCode === 13 && typeof onSubmit === 'function') {
      onSubmit(this.callbackParams);
    }
  };

  getChild = ({ children }) => {
    return React.Children.map(children, child => {
      if (child.props.field || child.props.toform || child.props.submit || child.props.type === 'submit') {
        if (!this.refList[child.props.field]) {
          this.refList[child.props.field] = [];
        }

        // 每次Form, 或者 ToForm重绘, 就重新获取ref
        const ref = React.createRef();

        this.refList[child.props.field].push(ref);

        let fieldProps;
        let toformProps;
        let submitProps;

        if (child.props.field) {
          fieldProps = {
            [immitProps.value]: this.data[child.props.field] || child.props[immitProps.value],
            [immitProps.change]: e => this.handleOnChange(e, child, child.props.onChange),
          };
        }

        if (child.props.toform) {
          toformProps = {
            ToForm: this.getChild,
          };
        }

        if (child.props.submit || child.props.type === 'submit') {
          submitProps = {
            [immitProps.click]: e => this.handleOnClick(e, child, child.props.onClick),
            [immitProps.touch]: e => this.handleOnClick(e, child, child.props.onClick),
          };
        }

        return (
          <FormItem ref={ref} fixUpdateProps={this.fixUpdateProps} {...fieldProps} {...submitProps} {...toformProps}>
            {child}
          </FormItem>
        );
      }

      return child;
    });
  };

  render() {
    this.refList = {};

    const { children } = this.props;

    return this.getChild({ children });
  }
}

export default Form;
