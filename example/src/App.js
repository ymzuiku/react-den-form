import './App.css';
import React from 'react';
import Form from 'packages/react-den-form';

export default () => {
  return (
    <div>
      <Form>
        <input field="userName" errorCheck={/123/} errorstyle={{ color: '#f00' }} errorclass="input" />
      </Form>
    </div>
  );
};
