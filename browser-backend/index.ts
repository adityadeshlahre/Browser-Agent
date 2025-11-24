import express from 'express';
import cors from 'cors';
import puppeteer, { type Browser } from 'puppeteer-core';
import { SteelBrowserClient } from './steel-client';
import { BrowserUseClient } from "browser-use-sdk";
// import { z } from "zod";

const app = express();

app.use(express.json());

app.use(cors());

console.log(process.env.BROWSER_USE_API_KEY);


const client = new BrowserUseClient({
    apiKey: process.env.BROWSER_USE_API_KEY!,
});

const steelClient = new SteelBrowserClient('http://localhost:3000');

const activeSessions = new Map<string, { browser: Browser; sessionId: string }>();

app.post('/api/airbnb', async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        let browser: Browser;
        let sessionKey: string;

        const session = await steelClient.createSession({
            timeout: 600000,
        });

        sessionKey = session.id || session.sessionId || session.session_id;

        const cdpUrl = steelClient.getCdpUrl(session);

        browser = await puppeteer.connect({
            browserWSEndpoint: cdpUrl,
            defaultViewport: null,
        });

        activeSessions.set(sessionKey, { browser, sessionId: sessionKey });

        res.json({
            sessionId: sessionKey,
            liveUrl: steelClient.getLiveViewUrl(sessionKey),
        });

        const task = `
            Navigate to https://www.airbnb.com.
            Click the search button.
            Type "San Francisco" into the destination search input.
            Click the submit button for the search.
            Select any available dates to find rooms.
        `;

        const result = await client.tasks.createTask({
            task,
        });

        for await (const update of result.watch()) {
            console.log(update);
            console.log(update.data);
            console.log(update.data.output);
            if (update.data.status === "finished") {
                await browser.disconnect();
                await steelClient.deleteSession(sessionKey);
                activeSessions.delete(sessionKey);
                if (update.data.output) {
                    for (const listing of update.data.output) {
                        console.log(`${listing}`);
                    }
                }
                // if (!res.headersSent) {
                //     res.status(200).json({ status: 'success', message: 'Task completed' });
                // }
            }
        }
    } catch (err) {
        console.error(err);
        const message = err instanceof Error ? err.message : String(err);
        if (!res.headersSent) {
            res.status(500).json({ status: 'error', message });
        }
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Automation server running on', port));
