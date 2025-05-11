import React from 'react';
import { useForm } from '@bombillazo/rhf-plus';

function Metadata() {
  const { setMetadata, metadata } = useForm({
    metadata: { name: '' },
  });
  return (
    <>
      <pre>{JSON.stringify(metadata, null, 2)}</pre>
      <button
        type="button"
        onClick={() => {
          setMetadata({ name: Math.random() * 1000 });
        }}
      >
        button
      </button>
    </>
  );
}

export default Metadata;
