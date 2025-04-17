import emojiRegex from 'emoji-regex';

export function isEmoji() {
    return {
        type: 'string',
        validate: (data: string) => {
            const regex = emojiRegex();
            return regex.test(data.trim());
        },
    };
}
