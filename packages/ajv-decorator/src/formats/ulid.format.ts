export function isULID() {
  return {
    type: 'string',
    validate: (data: string) => {
      const regex = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
      return regex.test(data.trim());
    },
  };
}
