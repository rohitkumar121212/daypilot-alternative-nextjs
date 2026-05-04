import { fetchUtils } from "../utils/fetchUtils";

interface LoginUserInfoResponseInterface {
    readonly data?: Record<string, unknown>;
    readonly error?: string;
    readonly message?: string;
    readonly success?: boolean;
}

export async function getLoginUserInfo(): Promise<LoginUserInfoResponseInterface> {
    try {
        // const url = process.env.NODE_ENV === 'development'
        //     ? '/api/proxy/user-details'
        //     : 'https://aperfectstay.ai/aps-api/v1/users/details/private'
        const url = 'https://aperfectstay.ai/aps-api/v1/users/details/private' 
        const response = await fetchUtils.get<LoginUserInfoResponseInterface>(url)
        return response.data;
    } catch (error) {
        console.log("getLoginUserInfo error:", error);
        return {};
    }
}
