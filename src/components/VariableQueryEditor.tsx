import React, { useState } from 'react';
import { TextArea } from '@grafana/ui';
import { MyVariableQuery } from '../types';

interface VariableQueryProps {
  query: MyVariableQuery;
  onChange: (query: MyVariableQuery, definition: string) => void;
}

export const VariableQueryEditor = ({ onChange, query }: VariableQueryProps) => {
  const [state, setState] = useState(query);

  const saveQuery = () => {
    onChange(state, `${state.rawQuery}`);
  };

  const handleChange = (event: React.FormEvent<HTMLTextAreaElement>) =>
    setState({
      ...state,
      [event.currentTarget.name]: event.currentTarget.value,
    });

  return (
    <>
      <div className="gf-form">
        <TextArea
          name="rawQuery"
          className="gf-form-input"
          onBlur={saveQuery}
          onChange={handleChange}
          value={state.rawQuery}
          rows={5}
        />
      </div>
    </>
  );
};
