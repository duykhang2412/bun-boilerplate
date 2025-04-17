export function isEmail(){
    return {
        type: 'string',
        validate: (data: string) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(data.trim());
        }
    }
}