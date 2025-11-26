import express from 'express';
import cors from 'cors';
import puppeteer, { type Browser } from 'puppeteer-core';
import { SteelBrowserClient } from './steel-client';
import { BrowserUseClient } from "browser-use-sdk";
// import { z } from "zod";

const app = express();

app.use(express.json());

const allowedOrigins = [
    'https://agent.aditya.ovh',
    'https://api.aditya.ovh',
    'http://localhost:3002'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

console.log(process.env.BROWSER_USE_API_KEY);


const client = new BrowserUseClient({
    apiKey: process.env.BROWSER_USE_API_KEY!,
});

const steelClient = new SteelBrowserClient('http://localhost:3000');

const activeSessions = new Map<string, { browser: Browser; sessionId: string }>();

app.get('/', (req, res) => {
    res.json({ status: 'healthy', service: 'browser-backend' });
});

app.post('/api/airbnb', async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        let browser: Browser;

        const session = await steelClient.createSession({
            timeout: 600000,
        });

        console.log(session);

        browser = await puppeteer.connect({
            browserWSEndpoint: session.websocketUrl,
            defaultViewport: null,
        });

        activeSessions.set(session.id, { browser, sessionId: session.id });

        res.json({
            sessionId: session.id,
            liveUrl: session.sessionViewerUrl,
            debugUrl: session.debugUrl,
            cdpUrl: session.websocketUrl,
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
                // await browser.disconnect();
                // await steelClient.deleteSession(sessionKey);
                // activeSessions.delete(sessionKey);
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
