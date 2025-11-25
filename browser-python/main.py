from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from browser_use import Agent, ChatBrowserUse, Browser
from browser_use.browser import ProxySettings
from dotenv import load_dotenv
from steel_client import SteelBrowserClient
import os
import asyncio
from playwright.async_api import async_playwright
import traceback

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.environ["ANONYMIZED_TELEMETRY"] = "false"

BROWSER_USE_API_KEY = os.getenv("BROWSER_USE_API_KEY")

STEEL_URL = os.getenv("STEEL_URL")

print("BROWSER_USE_API_KEY:", BROWSER_USE_API_KEY)

print("STEEL_URL:", STEEL_URL)

steel_client = SteelBrowserClient(STEEL_URL)

active_sessions = {}

PUBLIC_HOST = "steel.aditya.ovh"

@app.post("/api/airbnb")
async def airbnb_handler(_: dict | None = None):
    try:
        session = await steel_client.create_session(timeout=600000)

        session_id = session.id if hasattr(session, 'id') else session.get('id')
        
        cdp_url = steel_client.get_cdp_url(session)

        debug_url = steel_client.get_debug_url(session)

        live_url = steel_client.get_live_view_url(session)

        if live_url:
            live_url = live_url.replace("0.0.0.0", PUBLIC_HOST)
        if debug_url:
            debug_url = debug_url.replace("0.0.0.0", PUBLIC_HOST)
        if cdp_url:
            cdp_url = cdp_url.replace("0.0.0.0", PUBLIC_HOST)

        live_url = live_url.replace("http://", "https://")
        debug_url = debug_url.replace("http://", "https://")
        cdp_url = cdp_url.replace("ws://", "wss://")

        active_sessions[session_id] = {
            'session': session,
            'cdp_url': cdp_url,
            'debug_url': debug_url,
            'live_url': live_url,
        }

        response = {
            "sessionId": session_id,
            "liveUrl": live_url,
            "debugUrl": debug_url,
            "cdpUrl": cdp_url,
        }

        asyncio.create_task(run_browser_use_task(cdp_url, session_id))

        return response

    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


async def run_browser_use_task(cdp_url: str, session_id: str):
    # playwright_instance = None
    # browser = None
    try:
        # playwright_instance = await async_playwright().start()

        # print(playwright_instance)

        print(cdp_url)

        browser = Browser(
            headless = False,
            cdp_url=cdp_url
        )

        # print(browser)

        # if browser.contexts:
        #     context = browser.contexts[0]
        # else:
        #     context = await browser.new_context()
        
        # if not context.pages:
        #     page = await context.new_page()
        
        llm = ChatBrowserUse(api_key=BROWSER_USE_API_KEY)

        task = """
Navigate to https://www.airbnb.com.
Click the search button.
Type "San Francisco" into the destination search input.
Click the submit button for the search.
Select any available dates to find rooms.
"""

        agent = Agent(
            task=task,
            llm=llm,
            browser=browser
        )
        
        result = await agent.run()
        print("Task completed:", result)

    except Exception as e:
        print(f"Error in browser-use task: {e}")
        traceback.print_exc()
    # finally:
        # if browser:
        #     await browser.close()
        # if playwright_instance:
        #     await playwright_instance.stop()
        # if session_id in active_sessions:
        #     del active_sessions[session_id]

        # try:
        #     await steel_client.delete_session(session_id)
        # except Exception as e:
        #     print(f"Error deleting session: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
