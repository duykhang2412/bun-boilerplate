export function isNotExcludedUserId() {
    return {
        keyword: 'isNotExcludedUserId',
        type: 'string',
        schema: true,
        validate: (excludedUserIds: string[], value: string) => {
            if (!Array.isArray(excludedUserIds)) {
                return false;
            }
            return !excludedUserIds.includes(value.trim());
        },
    }
}