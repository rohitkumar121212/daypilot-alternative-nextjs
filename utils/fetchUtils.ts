interface FetchResponse<T = any> {
	// data: T;
	// msg?: string;
	// responseURL?: string;
	// status: number;
	// statusText: string;
    data: T;
    error: string | null;
    message: string;
    success: boolean;
}

export const fetchUtils = {
	async delete<T = any>(url: string, config?: RequestInit): Promise<FetchResponse<T>> {
		const response = await fetch(url, {
			headers: {
				...config?.headers,
			},
			method: "DELETE",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			status: response.status,
			statusText: response.statusText,
		};
	},

	async get<T = any>(url: string, config?: RequestInit): Promise<FetchResponse<T>> {
		const response = await fetch(url, {
			headers: {
				...config?.headers,
			},
			method: "GET",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			responseURL: response.url,
			status: response.status,
			statusText: response.statusText,
		};
	},

	async post<T = any>(url: string, data?: any, config?: RequestInit): Promise<FetchResponse<T>> {
		const isFormData = data instanceof FormData;
		const isURLSearchParams = data instanceof URLSearchParams;

		let body;
		let contentType;

		if (isFormData) {
			body = data;
			// Don't set Content-Type for FormData, let browser set it with boundary
		} else if (isURLSearchParams) {
			body = data.toString();
			contentType = "application/x-www-form-urlencoded";
		} else {
			body = JSON.stringify(data);
			contentType = "application/json";
		}

		const response = await fetch(url, {
			body,
			headers: {
				...(contentType && !config?.headers?.["Content-Type"] && { "Content-Type": contentType }),
				...config?.headers,
			},
			method: "POST",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			status: response.status,
			statusText: response.statusText,
		};
	},

	async put<T = any>(url: string, data?: any, config?: RequestInit): Promise<FetchResponse<T>> {
		const isFormData = data instanceof FormData;

		const response = await fetch(url, {
			body: isFormData ? data : JSON.stringify(data),
			headers: {
				...(!isFormData && { "Content-Type": "application/json" }),
				...config?.headers,
			},
			method: "PUT",
			...config,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const responseData = await response.json();

		return {
			data: responseData,
			status: response.status,
			statusText: response.statusText,
		};
	},
};