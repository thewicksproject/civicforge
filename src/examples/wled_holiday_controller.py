"""
Simple helper utilities for controlling WLED holiday lights via Python/PyScript.

The goal is deterministic, schedule-based control—no circadian, presence, or
ambient-light logic. It keeps TwinkleFox running with the desired palette and
turns the lights off if a palette cannot be resolved to avoid a single-color
failure mode.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional, Protocol
from urllib import request


class WLEDTransport(Protocol):
    """Lightweight protocol to allow dependency injection for HTTP calls."""

    def get_json(self, url: str, timeout: float = 3.0) -> Any: ...

    def post_json(
        self, url: str, payload: Dict[str, Any], timeout: float = 3.0
    ) -> Any: ...


class UrlLibTransport:
    """Default transport that uses urllib from the Python standard library."""

    def __init__(self, timeout: float = 3.0):
        self.timeout = timeout

    def get_json(self, url: str, timeout: Optional[float] = None) -> Any:
        with request.urlopen(url, timeout=timeout or self.timeout) as response:
            return json.load(response)

    def post_json(
        self, url: str, payload: Dict[str, Any], timeout: Optional[float] = None
    ) -> Any:
        body = json.dumps(payload).encode("utf-8")
        req = request.Request(
            url, data=body, headers={"Content-Type": "application/json"}
        )
        with request.urlopen(req, timeout=timeout or self.timeout) as response:
            return json.load(response)


class WLEDController:
    """
    Minimal controller that keeps TwinkleFox running with the desired palette.

    It resolves effect and palette IDs by name and always posts both together.
    If a palette cannot be resolved, it turns the strand off instead of falling
    back to a default like C9.
    """

    def __init__(
        self,
        host: str,
        transport: Optional[WLEDTransport] = None,
        timeout: float = 3.0,
    ):
        self.base_url = host.rstrip("/")
        self.transport = transport or UrlLibTransport(timeout=timeout)
        self.timeout = timeout
        self.last_palette_name: Optional[str] = None
        self.last_effect_name: Optional[str] = None

    def apply_twinklefox(
        self,
        palette_name: str = "C9",
        brightness: int = 200,
        segment_id: int = 0,
        transition_ms: int = 700,
        fallback_palette: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Apply the TwinkleFox effect with the requested palette.

        If the palette cannot be resolved (and no fallback provided), the strand
        is turned off to avoid a degraded single-color state.
        """
        try:
            effect_id = self._resolve_effect_id("TwinkleFox")
            palette_id, resolved_palette = self._resolve_palette_id(
                palette_name, fallback_palette=fallback_palette
            )

            payload = {
                "on": True,
                "bri": self._clamp_brightness(brightness),
                "transition": transition_ms,
                "seg": [
                    {
                        "id": segment_id,
                        "on": True,
                        "fx": effect_id,
                        "pal": palette_id,
                    }
                ],
            }

            self.last_palette_name = resolved_palette
            self.last_effect_name = "TwinkleFox"
            return self.transport.post_json(
                self._build_url("/json/state"), payload, timeout=self.timeout
            )
        except ValueError:
            # If a palette cannot be resolved, turn the strand off rather than
            # falling back to a default palette like C9.
            off_payload = {"on": False}
            return self.transport.post_json(
                self._build_url("/json/state"), off_payload, timeout=self.timeout
            )

    def _resolve_effect_id(self, effect_name: str) -> int:
        effects: List[str] = self.transport.get_json(
            self._build_url("/json/effects"), timeout=self.timeout
        )
        for idx, name in enumerate(effects):
            if name.lower() == effect_name.lower():
                return idx
        raise ValueError(f"Effect '{effect_name}' not found on the WLED device.")

    def _resolve_palette_id(
        self, palette_name: str, fallback_palette: Optional[str] = None
    ) -> tuple[int, str]:
        palettes: List[str] = self.transport.get_json(
            self._build_url("/json/palettes"), timeout=self.timeout
        )

        palette_id = self._find_index_by_name(palettes, palette_name)
        if palette_id is not None:
            return palette_id, palette_name

        if fallback_palette:
            fallback_id = self._find_index_by_name(palettes, fallback_palette)
            if fallback_id is not None:
                return fallback_id, fallback_palette

        raise ValueError(
            f"Palette '{palette_name}' not found "
            f"and fallback '{fallback_palette}' unavailable."
        )

    @staticmethod
    def _find_index_by_name(items: List[str], target: str) -> Optional[int]:
        target_lower = target.lower()
        for idx, item in enumerate(items):
            if item.lower() == target_lower:
                return idx
        return None

    @staticmethod
    def _clamp_brightness(brightness: int) -> int:
        return max(1, min(255, brightness))

    def _build_url(self, path: str) -> str:
        if path.startswith("/"):
            return f"{self.base_url}{path}"
        return f"{self.base_url}/{path}"


__all__ = ["WLEDController", "UrlLibTransport", "WLEDTransport"]
