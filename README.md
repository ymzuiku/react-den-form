# Den Form

> 为什么叫 Den Form ?  可能是因为 `丹凤眼` 非常迷人吧...  

一个非常轻巧的 Form 实现, gzip 体积只有 2kb, 可以很方便跨越组件层级获取表单对象, 支持 React, ReactNative

## 安装

```sh
$ yarn add react-den-form
```

## 基础使用

Form组件会在有 field 属性的子组件上注入 onChange 事件, 并获取其中的值

```js
import React from 'react';
import Form from 'react-den-form';

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)}>
        <input field="userName" />
      </Form>
    </div>
  );
};
```

当我们输入数据时, onChange 方法打印如下:

```
{userName: "333"}
```

## 主动传入的 onChange 事件不会受到影响

Form组件会在有 field 属性的子组件上注入 onChange 事件, 并获取其中的值

```js
import React from 'react';
import Form from 'react-den-form';

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)} onError>
        <input onChange={()=>console.log('self-onChange')} field="userName" />
      </Form>
    </div>
  );
};
```

当我们输入数据时, onChange 方法打印如下:

```
self-onChange
{userName: "333"}
```

## 多层级获取数据不需要进行额外处理

```js
import React from 'react';
import Form from 'packages/react-den-form';

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)}>
        <div>
          <div>
            <div>
              <input field="userName" />
            </div>
            <input field="password" />
          </div>
        </div>
      </Form>
    </div>
  );
};
```

当我们输入数据时, onChange 方法打印如下:

```
{userName: "333", password: "555"}
```

## 子函数组件也不需额外处理

```js
import React from 'react';
import Form from 'packages/react-den-form';

function SubInput() {
  return (
    <div>
      <div>
        <input field="subPassword" />
      </div>
    </div>
  );
}

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)}>
        <div>
          <div>
            <div>
              <input field="userName" />
            </div>
            <input field="password" />
            <SubInput />
          </div>
        </div>
      </Form>
    </div>
  );
};
```

当我们输入数据时, onChange 方法打印如下:

```
{userName: "333", password: "555", subPassword: "666"}
```

## Form 组件嵌套不需要处理

如下结构, userName2 的 input 只会被其父级 Form 捕获, 最外层的 Form 只会捕获 userName 及 password 两个 input

```js
export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log('1', data)}>
        <input field="userName" />
        <input field="password" />
         <Form onChange={({data}) => console.log('2', data)}>
          <input field="userName2" />
          <input field="password2" />
          </Form>
      </Form>
    </div>
  );
};
```

## 自定义Input组件

如果我们自己定义的特殊组件, 需要满足两个条件:

  1. 组件外部的 props 需要设置 field 属性
  2. 组件内部需要使用 this.props.onChange 返回数据

```js
import React from 'react';
import Form from 'packages/react-den-form';

class SubInput extends React.Component {
  handleOnChange = e => {
   // 需要使用 this.props.onChange 返回数据
    this.props.onChange(e.target.value);
  };

  render() {
    return <input onChange={this.handleOnChange} />;
  }
}

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)}>
        {/* 需要设置 field 属性 */}
        <SubInput field="userName" />
      </Form>
    </div>
  );
};
```


## 类组件的嵌套需要使用 toForm 进行处理

被 Form 组件包裹过的组件的 props 都会有一个 toForm 的函数

类组件不同于函数组件, 需要使用 toForm 对其内部的 render 返回值进行处理, 才可以识别其内部有 field 属性的对象, 将其划分在 Form 组件的监管范围内:

```js
import React from 'react';
import Form from 'packages/react-den-form';

// 例子, 这是一个有表单的页面, 使用类组件进行编写
class HomePage extends React.Component {
  render() {
    // 需要使用 toForm 处理返回值
    return this.props.toForm(<div>
      <nav>导航栏</nav>
      <div>
        <div>输入区域</div>
        <input field="userName" />
      </div>
    </div>);
  }
}

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)}>
        <SubInput />
      </Form>
    </div>
  );
};
```

## 使用 onChangeGetter 获取自定义组件的值

以下标签, From 会自动识别 onChange 的返回值, 进行解析获取

```js
import React from 'react';
import Form from 'react-den-form';

export default () => {
  return (
    <div>
      <Form onChange={(...args)=>console.log(args)}>
        <input field="userName" />
        <textarea field="password" />
        <select field="loginType">
          <option value="signUp">Sign up</option>
          <option value="signIn">Sign in</option>
        </select>
      </Form>
    </div>
  )
}
```

我们自己定义的特殊组件, 如果它们的onChange的返回值结构不确定, 我们可以编写 onChangeGetter 属性:

```js
import React from 'react';
import Form from 'packages/react-den-form';

class SubInput extends React.Component {
  // 假定数据有一定的层级
  inputData = {
    value: '',
  };

  handleOnChange = e => {
    this.inputData.value = e.target.value;
    this.props.onChange(this.inputData);
  };

  render() {
    return <input onChange={this.handleOnChange} />;
  }
}

export default () => {
  return (
    <div>
      <Form onChange={({data}) => console.log(data)}>
        <SubInput field="userName" onChangeGetter={e => e.value} />
      </Form>
    </div>
  );
};

```

> `onChangeGetter` 的默认值相当于 `onChangeGetter={e => e}`


## 上下文获取数据

我们为 Form 显式注入一个 data, 当数据变化时, data的值也会变化, 这样可以在上下文获取 Form 的数据

```js
// React.Component 版本
import React from 'react';
import Form from 'react-den-form';

export default class extends React.Component {
  data = {};

  render() {
    return (
      <div>
        <Form data={this.data}>
          <input field="userName" />
          <button onClick={() => console.log(this.data)}>show-data</button>
        </Form>
      </div>
    );
  }
}

```

```js
// useHooks 版本
import React, { useState } from 'react';
import Form from 'react-den-form';

export default () => {
  const [data] = useState({});

  return (
    <div>
      <Form data={data}>
        <input field="userName" />
        <button onClick={() => console.log(data)}>show-data</button>
      </Form>
    </div>
  );
};
```
输入数据, 点击 button, data数据打印如下:

```
{ userName: "dog" }
```
## 表单校验

表单校验是无痛的, 并且是高效的

我们给 input 组件添加 errorcheck 属性, 该属性可以是一个正则对象, 也可以是一个函数, 如果 errorcheck 校验的结果为 `false`, 就会将其他 error 相关的属性赋予至组件中

如下代码, 如果 input 内容不包含 `123`, 字体颜色为红色:

```js
import './App.css';
import React from 'react';
import Form from 'packages/react-den-form';

export default () => {
  return (
    <div>
      <Form>
        <input field="userName" errorcheck={/123/} errorstyle={{ color: '#f00' }}/>
      </Form>
    </div>
  );
};

```

### 表单校验相关的 api: 

| prop | 类型 | 用途 |
| --- | --- | --- |
| errorcheck | 正则或函数 | 若返回值为 false, 将其他 error Api应用至组件中 |
| errorstyle | style 对象 | 若校验为错误, 将 errorstyle 合并至 style 中 |
| errorclass | className 字符串 | 若校验为错误, 将 errorstyle 合并至 className 中 |
| errorprops | props 对象 | 若校验为错误, 将 errorprops 合并至整个 props 中 |

为什么是 errorcheck 而不是 errorCheck ? 这是因为 React 对 DOM 元素属性的定义为 lowercass:

```
Warning: React does not recognize the `errorCheck` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `errorcheck` instead. If you accidentally passed it from a parent component, remove it from the DOM element.
```

### 表单校验的更新方式

为了更好地性能, 并不会在每次输入更 Form 组件, 而是在当校验结果和上一次不一致时更新 Form 组件

如当以上代码:

 - 输入 `12` 不会更新组件
 - 当输入值为 `123` 时, 更新组件
 - 当输入值为 `1234`时, 不会更新组件
 - 当输入值改为 `234` 时, 更新组件


## fetch 提交

数据的提交在项目中应该是统一的, 如果表单的提交和其他行为的数据提交方式不一致, 就会导致项目数据交互的方式分裂了, 对项目长期的维护不利.

数据的提交最好在统一的地方进行提交及处理, 所以此表单库不会对 fetch 进行封装, 请根据 `上下文获取数据` 的方式, 自行处理提交

fetch 之后的结果校验, 请使用结果在 errorcheck 属性中自行校验

## 支持哪些 React渲染层 ?

此库支持所有 React 的渲染层, 如 ReactDOM, ReactNative, ReactVR
