import './App.css';
import React from 'react';
import Form from 'packages/react-den-form';

function TestInput(props) {
  console.log(props);
  return <input field="field" />;
}

export default () => {
  return (
    <div>
      <Form
        onChange={({ data, field, update }) => {
          if (field === 'password') {
            update({ userName: '被password的输入修改了值' });
          }
          if (/aa/.test(data.userName)) {
            update({
              password: {
                value: '被userName的输入修改了值',
                style: { fontSize: 30 },
              },
            });
          }
        }}
      >
        <input field="userName" />
        {false && <input field="password" />}
        <TestInput dog={20} />
      </Form>
    </div>
  );
};
