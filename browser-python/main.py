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

@app.post("/api/airbnb")
async def airbnb_handler(_: dict | None = None):
    try:
        session = await steel_client.create_session(timeout=600000)

        session_id = session.id if hasattr(session, 'id') else session.get('id')
        
        session_debug = session.debugUrl or session.get("debugUrl")

        session_ws = session.websocketUrl or session.get("websocketUrl")

        session_live = session.sessionViewerUrl or session.get("sessionViewerUrl")

        active_sessions[session_id] = {
            'session': session,
            'cdp_url': session_ws,
            'debug_url': session_debug,
            'live_url': session_live,
        }

        response = {
            "sessionId": session_id,
            "liveUrl": session_live,
            "debugUrl": session_debug,
            "cdpUrl": session_ws,
        }

        asyncio.create_task(run_browser_use_task(session_ws, session_id))

        return response

    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


async def run_browser_use_task(cdp_url: str, session_id: str):
    try:
        print(cdp_url)

        browser = Browser(
            headless = False,
            cdp_url=cdp_url
        )
        
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
