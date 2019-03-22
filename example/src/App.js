import './App.css';
import React from 'react';
import Form from 'packages/react-den-form';

export default () => {
  return (
    <div>
      {/* 只有当 input内容校验结果发生变化时, onErrorCheck 才会执行 */}
      <Form
        onSubmit={() => {
          console.log('xx');
        }}
        onErrorCheck={({ isError, data }) => console.log(isError, data)}
      >
        <input field="userName" errorcheck={/123/} errorstyle={{ color: '#f00' }} errorclass="input" />
      </Form>
    </div>
  );
};
