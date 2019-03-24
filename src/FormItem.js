import React from 'react';

export default class extends React.PureComponent {
  tempProps = void 0;

  updateFromProps = props => {
    this.tempProps = props;

    this.forceUpdate();
  };

  render() {
    const { children, fixUpdateProps, ...rest } = this.props;

    const node = React.cloneElement(children, {
      ...rest,
      ...fixUpdateProps(children, this.tempProps),
    });

    this.tempProps = void 0;
    return node;
  }
}
