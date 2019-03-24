import React from 'react';

export default class extends React.Component {
  tempProps = void 0;

  updateFromProps = props => {
    this.tempProps = props;
    // this.setState({
    //   [immitProps.value]: props.val !== void 0 ? props.val : props[immitProps.value],
    // });
    this.forceUpdate();
  };

  render() {
    console.log('render-item', this.props.children.props.field);
    const { children, fixErrorProps, ...rest } = this.props;

    const node = React.cloneElement(children, {
      ...rest,
      ...fixErrorProps(children, this.tempProps),
    });
    this.tempProps = void 0;
    return node;
  }
}
