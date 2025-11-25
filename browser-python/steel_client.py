from steel import Steel
from typing import Optional, Dict, Any
import os

STEEL_URL = os.getenv("STEEL_URL")

class SteelBrowserClient:
    def __init__(self, base_url: str = STEEL_URL):
        self.base_url = base_url
        self.timeout = 600000
        self.steel = Steel(base_url=base_url, timeout=self.timeout)

    async def create_session(
        self,
        user_agent: Optional[str] = None,
        proxy_url: Optional[str] = None,
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        try:
            response = self.steel.sessions.create(
                user_agent=user_agent,
                proxy_url=proxy_url,
                timeout=timeout or self.timeout,
                use_proxy=True,
                solve_captcha=True,
                block_ads=True
            )
            print('Steel Browser session response:', response)
            return response
        except Exception as e:
            raise Exception(f"Failed to create Steel session: {str(e)}")

    async def delete_session(self, session_id: str) -> None:
        try:
            self.steel.sessions.release(session_id)
        except Exception as e:
            raise Exception(f"Failed to delete Steel session: {str(e)}")

    def get_cdp_url(self, session_data: Any) -> str:
        return getattr(session_data, "websocket_url", getattr(session_data, "websocket_url", ""))

    def get_live_view_url(self, session_data: Any) -> str:
        return getattr(session_data, 'sessionViewerUrl', getattr(session_data, 'session_viewer_url', ''))

    def get_debug_url(self, session_data: Any) -> str:
        return getattr(session_data, 'debugUrl', getattr(session_data, 'debug_url', ''))

    def get_devtools_url(self, session_data: Any) -> str:
        return getattr(session_data, 'debuggerUrl', getattr(session_data, 'debugger_url', ''))

# {
#   "id": "a0406c4b-146e-4d34-9922-84fb21cbfe87",
#   "created_at": "2025-11-25T10:51:12.959000Z",
#   "credits_used": 0,
#   "debug_url": "http://0.0.0.0:3000/v1/sessions/debug",
#   "dimensions": {
#     "height": 1080,
#     "width": 1920
#   },
#   "duration": 0,
#   "event_count": 0,
#   "optimize_bandwidth": null,
#   "proxy_bytes_used": null,
#   "proxy_source": null,
#   "session_viewer_url": "http://0.0.0.0:3000/",
#   "status": "live",
#   "timeout": 0,
#   "websocket_url": "ws://0.0.0.0:3000/",
#   "device_config": null,
#   "headless": null,
#   "is_selenium": null,
#   "persist_profile": null,
#   "profile_id": null,
#   "region": null,
#   "solve_captcha": false,
#   "stealth_config": null,
#   "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
#   "createdAt": "2025-11-25T10:51:12.959Z",
#   "eventCount": 0,
#   "creditsUsed": 0,
#   "websocketUrl": "ws://0.0.0.0:3000/",
#   "debugUrl": "http://0.0.0.0:3000/v1/sessions/debug",
#   "debuggerUrl": "http://0.0.0.0:3000/v1/devtools/inspector.html",
#   "sessionViewerUrl": "http://0.0.0.0:3000/",
#   "proxyTxBytes": 0,
#   "proxyRxBytes": 0,
#   "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
#   "proxy": "",
#   "solveCaptcha": false
# }
