import React from 'react';

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
  }

  componentWillUnmount() {
    this.data = null;
    this.editChild = null;
    this.errorList = null;
    this.editIsError = null;
  }

  handleOnChange = (e, child, childOnChange) => {
    const { onChange, updateOnChange, onErrorCheck } = this.props;
    let value = void 0;

    this.editChild = child;

    // 如果有getter函数, 使用 getter函数获取对象
    if (typeof child.props.onChangeGetter === 'function') {
      value = child.props.onChangeGetter(e);
    }
    // 如果child的对象的读取路径存在预设, 解析后返回
    else if (getValuePaths[child.type] && e) {
      const path = getValuePaths[child.type];
      console.log(',,', child.type);

      value = e;
      path.forEach(p => {
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

    // 执行child的onChange
    if (typeof childOnChange === 'function') {
      childOnChange({
        event: e,
        data: this.data,
        field: child.props.field,
        value,
        update: this.forceUpdate,
        element: child,
      });
    }

    // 执行 From的onChange
    if (typeof onChange === 'function') {
      onChange({
        event: e,
        data: this.data,
        field: child.props.field,
        value,
        update: this.forceUpdate,
        element: child,
      });
    }

    const isError = this.errorChecker(child);
    this.editIsError = isError;

    // 如果this.errorList历史的错误和当前校验的不一致, 更新form组件
    if (this.errorList[child.props.field] !== isError) {
      if (typeof onErrorCheck === 'function') {
        onErrorCheck({
          isError,
          event: e,
          data: this.data,
          field: child.props.field,
          value,
          update: this.forceUpdate,
          element: child,
        });
      }
      this.forceUpdate();
    } else if (updateOnChange) {
      this.forceUpdate();
    }

    // 更新旧的错误记录
    this.errorList[child.props.field] = isError;
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
          return React.cloneElement(child, { toForm: this.getChild });
        }
        return this.getChild(child.type());
      }
      if (child.props && child.props.field) {
        const errorProps = this.fixErrorProps(child);

        return React.cloneElement(child, {
          onChange: e => this.handleOnChange(e, child, child.props.onChange),
          ...errorProps,
        });
      }
      if (child.props && child.props.children) {
        return React.cloneElement(child, { toForm: this.getChild }, [this.getChild(child.props.children)]);
      }
      return child;
    });
  };

  handleOnSubmit = e => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const { onSubmit } = this.props;

    const field = this.editChild && this.editChild.props && this.editChild.props.field;

    if (typeof onSubmit === 'function') {
      onSubmit({
        isError: this.editIsError,
        event: e,
        data: this.data,
        field,
        value: this.data[field],
        update: this.forceUpdate,
        element: this.editChild,
      });
    }
  };

  render() {
    const { children } = this.props;

    return (
      <form style={{ display: 'inline' }} onSubmit={this.handleOnSubmit}>
        {this.getChild(children)}
      </form>
    );
  }
}

export default Form;
