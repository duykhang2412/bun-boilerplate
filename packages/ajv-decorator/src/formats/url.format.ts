export function isURL() {
    return {
        type: 'string',
        validate: (data: string) => {
            try {
                new URL(data.trim());
                return true;
            } catch {
                return false;
            }
        }
    }
}