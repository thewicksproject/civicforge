"""
Helper utilities for controlling WLED holiday lights via Python/PyScript.

The helpers focus on keeping TwinkleFox running with the desired palette,
falling back to the built-in C9 palette when a custom palette lookup fails.
This prevents the device from reverting to a single-color (often yellow)
output when the palette name can't be resolved.
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

    It resolves effect and palette IDs by name, always posts both together, and
    falls back to the built-in C9 palette if a custom palette can't be located.
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
        fallback_palette: str = "C9",
    ) -> Dict[str, Any]:
        """
        Apply the TwinkleFox effect with the requested palette.

        If the palette cannot be resolved, the built-in C9 palette is used
        so the strand does not degrade to a single yellow color.
        """
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

    def ensure_twinklefox(
        self,
        palette_name: str = "C9",
        brightness: int = 200,
        segment_id: int = 0,
        transition_ms: int = 700,
        fallback_palette: str = "C9",
    ) -> Dict[str, Any]:
        """
        Re-assert TwinkleFox with the desired palette if the device has drifted.

        This is useful when other automations (circadian, presence, lux-based)
        try to change the effect or palette—keeping the strand locked to the
        time-based schedule that calls this helper.
        """
        effect_id = self._resolve_effect_id("TwinkleFox")
        palette_id, resolved_palette = self._resolve_palette_id(
            palette_name, fallback_palette=fallback_palette
        )

        state = self._read_state()
        segment = self._find_segment(state, segment_id)

        if (
            state.get("on")
            and segment is not None
            and segment.get("fx") == effect_id
            and segment.get("pal") == palette_id
        ):
            self.last_effect_name = "TwinkleFox"
            self.last_palette_name = resolved_palette
            return {"updated": False, "state": state}

        return self.apply_twinklefox(
            palette_name=palette_name,
            brightness=brightness,
            segment_id=segment_id,
            transition_ms=transition_ms,
            fallback_palette=fallback_palette,
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

    def _read_state(self) -> Dict[str, Any]:
        return self.transport.get_json(
            self._build_url("/json/state"), timeout=self.timeout
        )

    @staticmethod
    def _find_segment(state: Dict[str, Any], segment_id: int) -> Optional[Dict[str, Any]]:
        segments = state.get("seg", [])
        if isinstance(segments, dict):
            # some firmwares return a dict with "seg" -> list
            segments = segments.get("seg", [])
        for segment in segments:
            if segment.get("id", 0) == segment_id:
                return segment
        return segments[0] if segments else None

    def _build_url(self, path: str) -> str:
        if path.startswith("/"):
            return f"{self.base_url}{path}"
        return f"{self.base_url}/{path}"


__all__ = ["WLEDController", "UrlLibTransport", "WLEDTransport"]
