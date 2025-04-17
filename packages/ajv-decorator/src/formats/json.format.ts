export function isJSON() {
    return {
        type: 'string',
        validate: (data: string) => {
            const parsed = JSON.parse(data.trim());
            if (typeof parsed === 'object' && parsed !== null) {
                return true;
            }
            return false;
        },
    }
}
