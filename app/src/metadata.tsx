import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

const defaultMetadata: {
  id: number;
  name: string;
  is_admin: boolean;
} = {
  id: 1,
  name: 'Bob',
  is_admin: true,
};

function Metadata() {
  const { formState, setMetadata, updateMetadata } = useForm({
    defaultMetadata,
  });

  return (
    <>
      <pre id="metadata">{JSON.stringify(formState.metadata, null, 2)}</pre>

      <button
        type="button"
        onClick={() => {
          setMetadata({ id: 100, name: 'Alice', is_admin: false });
        }}
      >
        set
      </button>
      <button
        type="button"
        onClick={() => {
          updateMetadata({ id: 500 });
        }}
      >
        update
      </button>
      <button
        type="button"
        onClick={() => {
          setMetadata();
        }}
      >
        clear
      </button>
    </>
  );
}

export default Metadata;
