import axios from "axios";
import Steel from 'steel-sdk/index.mjs';

export class SteelBrowserClient {
    private baseUrl: string;
    private steel: Steel;

    constructor(baseUrl: string = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.steel = new Steel({
            baseURL: this.baseUrl,
            timeout: 600000,
        });
    }

    async createSession(options?: {
        userAgent?: string;
        proxyUrl?: string;
        timeout?: number;
    }) {
        try {
            const response = await this.steel.sessions.create({
                userAgent: options?.userAgent,
                proxyUrl: options?.proxyUrl,
                timeout: options?.timeout || 300000,
            });

            console.log('Steel Browser session response:', response);
            return response;
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
            await this.steel.sessions.release(sessionId);
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
        return sessionData.websocketUrl;
    }

    getLiveViewUrl(sessionData: any): string {
        return sessionData.sessionViewerUrl;
    }

    getDebugUrl(sessionData: any): string {
        return sessionData.debugUrl;
    }

    getDevtoolsUrl(sessionData: any): string {
        return sessionData.debuggerUrl;
    }
}

