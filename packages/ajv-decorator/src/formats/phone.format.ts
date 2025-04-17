import { PhoneNumberUtil } from 'google-libphonenumber';

export const PHONE_UTIL = PhoneNumberUtil.getInstance();

export function isPhone() {
    return {
        type: 'string',
        validate: (data: string) => {
            try {
                const phone = PHONE_UTIL.parse(data);

                return (
                    data !== undefined &&
                    data.length === data.trim().length &&
                    data.length !== 0 &&
                    data.trim().length !== 0 &&
                    PHONE_UTIL.isValidNumber(phone)
                );
            } catch (e) {
                return false;
            }
        }
    }
}