export default function detectRegistered(fields: Object, data: any) {
  return data.ref.type === 'radio'
    ? !!Object.values(fields).find(({ ref: { name }, options }) => {
        return name === data.ref.name ? options.find(radioField => radioField.ref.value === data.ref.value) : false;
      })
    : !!fields[data.ref.name];
}
