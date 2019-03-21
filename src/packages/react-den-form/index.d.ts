import React, { Component } from 'react';

interface IGetValuePaths {
  input: Array<String>,
  textarea: Array<String>,
  select: Array<String>,
}

interface IProps {
  data?: Object;
  onChange?: (e:any, data: Object, field: String, value: any, element: React.ReactElement)=> void 0;
}

export default class extends Component<IProps> {}

export const getValuePaths: IGetValuePaths;
