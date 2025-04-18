export function isTrimData() {
  return {
    keyword: "isTrimData",
    type: "string",
    modifying: true,
    compile: function (schema: { min?: number; max?: number }) {
      return function (data: string, context: any) {
        if (typeof data === "string" && context.parentData && context.parentDataProperty !== undefined) {
          const trimmed = data.trim();
          context.parentData[context.parentDataProperty] = trimmed;

          const segmentLength = [...new Intl.Segmenter().segment(trimmed)].length;

          if (schema.min !== undefined && segmentLength < schema.min) {
            return false;
          }
          if (schema.max !== undefined && segmentLength > schema.max) {
            return false;
          }
        }
        return true;
      };
    },
    metaSchema: {
      type: "object",
      properties: {
        min: { type: "integer", nullable: true },
        max: { type: "integer", nullable: true },
      },
    },
    errors: true,
  };
}
