const isDevelopment = process.env.NODE_ENV === 'development'
const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN || ''

function devAuthHeader(): Record<string, string> {
	if (isDevelopment && DEV_TOKEN) {
		return { 'Authorization': `Bearer ${DEV_TOKEN}` }
	}
	return {}
}

interface FetchResponse<T = any> {
	data: T;
	error: string | null;
	message: string;
	success: boolean;
	status?: number;
	statusText?: string;
	responseURL?: string;
}

export const fetchUtils = {
	async delete<T = any>(url: string, config?: RequestInit): Promise<FetchResponse<T>> {
		const response = await fetch(url, {
			headers: {
				...devAuthHeader(),
				...config?.headers,
			},
			method: "DELETE",
			credentials: "include",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			error: null,
			message: "",
			success: true,
			status: response.status,
			statusText: response.statusText,
		};
	},

	async get<T = any>(url: string, config?: RequestInit): Promise<FetchResponse<T>> {
		const response = await fetch(url, {
			headers: {
				...devAuthHeader(),
				...config?.headers,
			},
			method: "GET",
			credentials: "include",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			error: null,
			message: "",
			success: true,
			responseURL: response.url,
			status: response.status,
			statusText: response.statusText,
		};
	},

	async post<T = any>(url: string, data?: any, config?: RequestInit): Promise<FetchResponse<T>> {
		const isFormData = data instanceof FormData;
		const isURLSearchParams = data instanceof URLSearchParams;

		let body;
		let contentType: string | undefined;

		if (isFormData) {
			body = data;
		} else if (isURLSearchParams) {
			body = data.toString();
			contentType = "application/x-www-form-urlencoded";
		} else {
			body = JSON.stringify(data);
			contentType = "application/json";
		}

		const configHeaders = config?.headers as Record<string, string> | undefined;

		const response = await fetch(url, {
			body,
			headers: {
				...devAuthHeader(),
				...(contentType && !configHeaders?.["Content-Type"] && { "Content-Type": contentType }),
				...config?.headers,
			},
			method: "POST",
			credentials: "include",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			error: null,
			message: "",
			success: true,
			status: response.status,
			statusText: response.statusText,
		};
	},

	async put<T = any>(url: string, data?: any, config?: RequestInit): Promise<FetchResponse<T>> {
		const isFormData = data instanceof FormData;

		const response = await fetch(url, {
			body: isFormData ? data : JSON.stringify(data),
			headers: {
				...devAuthHeader(),
				...(!isFormData && { "Content-Type": "application/json" }),
				...config?.headers,
			},
			method: "PUT",
			credentials: "include",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			error: null,
			message: "",
			success: true,
			status: response.status,
			statusText: response.statusText,
		};
	},
};
