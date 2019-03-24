import React from 'react';

export default class extends React.Component {
  tempProps = void 0;

  setTempProps = props => {
    this.tempProps = props;
  };

  render() {
    console.log('render-item');
    const { children, fixErrorProps, ...rest } = this.props;

    const node = React.cloneElement(children, {
      ...rest,
      ...fixErrorProps(children, this.tempProps),
    });
    this.tempProps = void 0;
    return node;
  }
}
