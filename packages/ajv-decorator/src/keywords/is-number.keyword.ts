export function isNumber() {
    return {
        keyword: 'isNumber',
        type: 'string',
        schema: {
            type: "object",
            properties: {
                minimum: { type: "number" },
                maximum: { type: "number" },
                default: { type: "number" }
            },
            additionalProperties: false
        },
        modifying: true,
        validate: function (schema: { minimum?: number; maximum?: number; default?: number }, value: string, _parentSchema: any, dataCxt: { parentData: any; parentDataProperty: string }) {
            if (typeof value !== "string") return false;
            const num = Number(value.trim());
            if (isNaN(num)) return false;

            if (schema.minimum !== undefined && num < schema.minimum) return false;
            if (schema.maximum !== undefined && num > schema.maximum) return false;

            if (!value && schema.default !== undefined) {
                dataCxt.parentData[dataCxt.parentDataProperty] = String(schema.default);
            }

            return true;
        },
    }
}