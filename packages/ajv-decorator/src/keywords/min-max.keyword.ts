export function isMinMaxLength() {
    return {
        keyword: "isMinMaxLength",
        type: "string",
        schema: true,
        validate: function (
            schema: { min?: number; max?: number },
            data: string
        ): boolean {
            if (typeof data !== "string") return false;
            const length = [...new Intl.Segmenter().segment(data.trim())].length;
            
            const isValidMin = schema.min === undefined || length >= schema.min;
            const isValidMax = schema.max === undefined || length <= schema.max;

            return isValidMin && isValidMax;
        },
        metaSchema: {
            type: "object",
            properties: {
                min: { type: "integer", nullable: true },
                max: { type: "integer", nullable: true },
            },
        },
    };
}
