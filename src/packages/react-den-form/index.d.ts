import React, { Component } from 'react';

interface IGetValuePaths {
  input: Array<String>,
  textarea: Array<String>,
  select: Array<String>,
}

interface IOnChangeParams {
  /** onChange的原始返回值 */
  event:any;
  /** 整个form.data */
  data: Object;
  /** 当前修改的field */
  field: String;
  /** 当前修改的值 */
  value: any;
  /** 当前修改的 ReactElement */
  element: React.ReactElement;
  /** 强制更新内容 */
  update: Function;
}

interface IProps {
  /** 每次输入都强制更新Form的子组件 */
  updateOnChange: Boolean;
  /** 显式设定form.data */
  data?: Object;
  /** form监管的组件onChange时的统一回调 */
  onChange?: (params:IOnChangeParams) => void;
}

export default class extends Component<IProps> {}

export const getValuePaths: IGetValuePaths;
