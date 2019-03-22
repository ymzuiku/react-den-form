import './App.css';
import React from 'react';
import Form from 'packages/react-den-form';

function fetchLogin({ data }) {
  fetch('/api/login', { method: 'post', body: JSON.stringify(data) })
    .then(res => {
      return res.json();
    })
    .then(data => {
      console.log(data);
    });
}

export default () => {
  return (
    <div>
      {/* 此 Form 只会捕获 userName及password, age及vipLevel被子Form拦截了 */}
      <Form onSubmit={({ data }) => console.log('1', data)}>
        <input errorcheck={/bb/} errorstyle={{ color: '#f00' }} field="userName" />
        <input submit="true" field="password" />
        {/* 此 Form 只会捕获 age及vipLevel */}
        <Form onSubmit={({ data }) => console.log('2', data)}>
          <input field="age" />
          <button type="submit">此Submit会被最近的父级捕获</button>
        </Form>
      </Form>
    </div>
  );
};
