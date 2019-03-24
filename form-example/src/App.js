import './App.css';
import React from 'react';
import Form from 'packages/react-den-form';
import range from 'lodash/range';

const data = { userName: 'def', password: 'bb123' };

class Test extends React.Component {
  render() {
    console.log('render-bbb');
    return <input field="bbb" placeholder="bbb" />;
  }
}

export default () => {
  return (
    <div>
      {/* 此 Form 只会捕获 userName及password, age及vipLevel被子Form拦截了 */}
      <Form
        data={data}
        onChange={({ data, update }) => {
          if (/22/.test(data.userName)) {
            update({ password: { val: 'aaaaa' } });
          }
        }}
        onSubmit={({ data }) => console.log('1', data)}
      >
        <input defaultValue={data.userName} errorcheck={/bb/} errorstyle={{ color: '#f00' }} field="userName" />
        <input
          defaultValue={data.password}
          submit="true"
          field="password"
          errorcheck={/aa/}
          errorstyle={{ color: '#f00' }}
        />
        {range(100).map((v, i) => {
          return <input key={i} field={'list' + i} errorcheck={/cc/} errorstyle={{ color: '#f00' }} />;
        })}
        {/* 此 Form 只会捕获 age及vipLevel */}
        <Form onSubmit={({ data }) => console.log('2', data)}>
          <input field="age" />
          <Test />
          <button type="submit">此Submit会被最近的父级捕获</button>
        </Form>
      </Form>
    </div>
  );
};
