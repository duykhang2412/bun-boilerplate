export function isMinMaxLength() {
    return {
        keyword: "isMinMaxLength",
        type: "string",
        schema: true,
        validate: function (
            schema: { min?: number; max?: number; isNumber?: boolean },
            data: string
        ): boolean {
            if (typeof data !== "string") return false;
            const trimmedData = data.trim();
            
            let value: number;

            if (schema.isNumber) {
                value = Number(trimmedData);
                if (isNaN(value)) return false; 
            } else {
                value = [...new Intl.Segmenter().segment(trimmedData)].length;
            }

            const isValidMin = schema.min === undefined || value >= schema.min;
            const isValidMax = schema.max === undefined || value <= schema.max;

            return isValidMin && isValidMax;
        },
        metaSchema: {
            type: "object",
            properties: {
                min: { type: "integer", nullable: true },
                max: { type: "integer", nullable: true },
                isNumber: { type: "boolean", nullable: true }
            },
        },
    };
}
