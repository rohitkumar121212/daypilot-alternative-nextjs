import { fetchUtils } from "../utils/fetchUtils";

interface LoginUserInfoResponseInterface {
    readonly data?: Record<string, unknown>;
    readonly error?: string;
    readonly message?: string;
    readonly success?: boolean;
}

export async function getLoginUserInfo(): Promise<LoginUserInfoResponseInterface> {
    try {
        const loginUserInfoApiUrl = `/api/proxy/user-details`;
        const response = await fetchUtils.get<LoginUserInfoResponseInterface>(
            loginUserInfoApiUrl,
            { credentials: "include" }
        );
        return response.data;
    } catch (error) {
        console.log("getLoginUserInfo error:", error);
        return {};
    }
}
