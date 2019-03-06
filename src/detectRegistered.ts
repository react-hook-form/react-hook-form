export default function detectRegistered(fields: Object, data: any) {
  return data.ref.type === 'radio'
    ? !!Object.entries(fields).find(([key, field]) => {
        return key === data.ref.name ? field.options.find(radioField => radioField === data.ref.value) : false;
      })
    : !!fields[data.ref.name];
}
