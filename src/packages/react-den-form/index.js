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
  }

  handleOnChange = (e, child, childOnChange) => {
    const { onChange } = this.props;
    let value = void 0;

    // 如果有getter函数, 使用 getter函数获取对象
    if (typeof child.props.onChangeGetter === 'function') {
      value = child.props.onChangeGetter(e);
    }
    // 如果child的对象的读取路径存在预设, 解析后返回
    else if (getValuePaths[child.type]) {
      const path = getValuePaths[child.type];

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
      childOnChange(e, this.data, child.props.field, value, child);
    }

    // 执行 From的onChange
    if (typeof onChange === 'function') {
      onChange(e, this.data, child.props.field, value, child);
    }
  };

  getChild = children => {
    return React.Children.map(children, child => {
      if (child.props && child.props.field) {
        return React.cloneElement(child, {
          onChange: e => this.handleOnChange(e, child, child.props.onChange),
        });
      }
      if (child.props && child.props.children) {
        return React.cloneElement(child, { toForm: this.getChild }, [this.getChild(child.props.children)]);
      }
      if (typeof child.type === 'function' && !child.type.isForm) {
        if (child.type.prototype.render) {
          return React.cloneElement(child, { toForm: this.getChild });
        }
        return this.getChild(child.type());
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
