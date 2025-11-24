import axios from "axios";

export class SteelBrowserClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
    }

    async createSession(options?: {
        userAgent?: string;
        proxyUrl?: string;
        timeout?: number;
    }) {
        try {
            const response = await axios.post(`${this.baseUrl}/v1/sessions`, {
                user_agent: options?.userAgent,
                proxy_url: options?.proxyUrl,
                timeout: options?.timeout || 300000,
            });

            console.log('Steel Browser session response:', response.data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message;
                throw new Error(`Failed to create Steel session: ${message}`);
            }
            if (error instanceof Error) {
                throw new Error(`Failed to create Steel session: ${error.message}`);
            }
            throw error;
        }
    }

    // async getSession(sessionId: string) {
    //     try {
    //         const response = await axios.get(`${this.baseUrl}/v1/sessions/${sessionId}`);
    //         return response.data;
    //     } catch (error) {
    //         if (axios.isAxiosError(error)) {
    //             const message = error.response?.data?.message || error.message;
    //             throw new Error(`Failed to get Steel session: ${message}`);
    //         }
    //         if (error instanceof Error) {
    //             throw new Error(`Failed to get Steel session: ${error.message}`);
    //         }
    //         throw error;
    //     }
    // }

    async deleteSession(sessionId: string) {
        try {
            await axios.delete(`${this.baseUrl}/v1/sessions/${sessionId}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || error.message;
                throw new Error(`Failed to delete Steel session: ${message}`);
            }
            if (error instanceof Error) {
                throw new Error(`Failed to delete Steel session: ${error.message}`);
            }
            throw error;
        }
    }

    getCdpUrl(sessionData: any): string {
        return sessionData.websocketUrl ||
            sessionData.cdp_url ||
            sessionData.cdpUrl ||
            sessionData.ws_url ||
            sessionData.wsUrl ||
            sessionData.websocket_url ||
            `ws://localhost:9223`;
    }

    getLiveViewUrl(sessionId: string): string {
        return `http://localhost:5173/session/${sessionId}`;
    }
}

