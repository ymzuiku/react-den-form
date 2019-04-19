import React from 'react';

export default class extends React.PureComponent {
  tempProps = void 0;

  updateFromProps = props => {
    this.tempProps = props;

    this.forceUpdate();
  };

  render() {
    const { children, fixUpdateProps, ...rest } = this.props;

    const nextProps = fixUpdateProps(children, this.tempProps);

    // 受控组件必须有默认值
    if (nextProps.value === void 0) {
      nextProps.value = '';
    }

    const node = React.cloneElement(children, {
      ...rest,
      ...nextProps,
    });

    this.tempProps = void 0;
    return node;
  }
}
