export function isTrimData() {
  return {
    keyword: 'isTrimData',
    type: 'string',
    modifying: true, 
    compile: function (_schema, parentSchema) {
      const minLength = parentSchema.minLength ?? 0; 
      const maxLength = parentSchema.maxLength ?? Infinity; 

      return function (data, context) {
        if (typeof data === "string" && context.parentData && context.parentDataProperty !== undefined) {
          const trimmed = data.trim();
          
          if (trimmed.length < minLength) return false;
          if (trimmed.length > maxLength) return false;
          
          context.parentData[context.parentDataProperty] = trimmed;
        }
        return true;
      };
    },
    errors: true, 
  };
}
