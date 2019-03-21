import React from 'react';
import Form from 'packages/react-den-form';

export default () => {
  return (
    <div>
      <Form onChange={(e, data) => console.log(data)}>
        <input onChange={() => console.log('self-onChange')} field="userName" />
      </Form>
    </div>
  );
};
