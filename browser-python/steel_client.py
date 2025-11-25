from steel import Steel
from typing import Optional, Dict, Any

class SteelBrowserClient:
    def __init__(self, base_url: str = 'http://0.0.0.0:3000'):
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
        websocket_url = (
            getattr(session_data, "websocketUrl", None)
            or getattr(session_data, "websocket_url", None)
            or ""
        )

        session_id = getattr(session_data, "id", None)

        if not websocket_url or not session_id:
            return ""

        if not websocket_url.endswith("/"):
            websocket_url += "/"

        return f"{websocket_url}devtools/browser/{session_id}"

    def get_live_view_url(self, session_data: Any) -> str:
        return getattr(session_data, 'sessionViewerUrl', getattr(session_data, 'session_viewer_url', ''))

    def get_debug_url(self, session_data: Any) -> str:
        return getattr(session_data, 'debugUrl', getattr(session_data, 'debug_url', ''))

    def get_devtools_url(self, session_data: Any) -> str:
        return getattr(session_data, 'debuggerUrl', getattr(session_data, 'debugger_url', ''))
