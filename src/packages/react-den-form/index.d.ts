import React, { Component } from 'react';

interface IGetValuePaths {
  input: Array<String>,
  textarea: Array<String>,
  select: Array<String>,
}

interface IProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  data?: Object;
  style: React.CSSProperties;
  onChange?: (e:any, data: Object, field: String, value: any, element: React.ReactElement)=> void 0;
}

export default class extends Component<IProps> {}

export const getValuePaths: IGetValuePaths;
