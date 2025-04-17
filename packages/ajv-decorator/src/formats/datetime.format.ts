export function isDateTime(){
    return {
        type: 'string',
        validate: (data: string) => {
            const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
            return regex.test(data.trim());
        }
    }
}