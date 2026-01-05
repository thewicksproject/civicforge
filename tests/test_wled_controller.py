import pytest

from src.examples.wled_holiday_controller import WLEDController


class FakeTransport:
    def __init__(self, effects=None, palettes=None):
        self.effects = effects or []
        self.palettes = palettes or []
        self.posts = []

    def get_json(self, url: str, timeout: float = 3.0):
        if url.endswith("/json/effects"):
            return self.effects
        if url.endswith("/json/palettes"):
            return self.palettes
        raise ValueError(f"Unexpected URL {url}")

    def post_json(self, url: str, payload, timeout: float = 3.0):
        self.posts.append({"url": url, "payload": payload, "timeout": timeout})
        return {"ok": True}


def test_apply_twinklefox_posts_effect_and_palette():
    transport = FakeTransport(
        effects=["Solid", "TwinkleFox", "Sparkle"],
        palettes=["Default", "C9", "Warm White"],
    )
    controller = WLEDController("http://wled.local", transport=transport)

    controller.apply_twinklefox(palette_name="C9", brightness=300, transition_ms=500)

    assert transport.posts, "No POST request was recorded"
    payload = transport.posts[-1]["payload"]
    segment = payload["seg"][0]

    assert payload["bri"] == 255  # brightness is clamped
    assert payload["transition"] == 500
    assert segment["fx"] == 1  # TwinkleFox index
    assert segment["pal"] == 1  # C9 palette index
    assert controller.last_palette_name == "C9"
    assert controller.last_effect_name == "TwinkleFox"


def test_apply_twinklefox_uses_fallback_when_palette_missing():
    transport = FakeTransport(
        effects=["Solid", "TwinkleFox"],
        palettes=["Default", "C9"],
    )
    controller = WLEDController("http://wled.local", transport=transport)

    controller.apply_twinklefox(palette_name="Custom Multi")

    payload = transport.posts[-1]["payload"]
    segment = payload["seg"][0]

    assert segment["pal"] == 1  # falls back to C9 palette id
    assert controller.last_palette_name == "C9"


def test_apply_twinklefox_raises_when_effect_missing():
    transport = FakeTransport(
        effects=["Solid", "Sparkle"],
        palettes=["Default", "C9"],
    )
    controller = WLEDController("http://wled.local", transport=transport)

    with pytest.raises(ValueError):
        controller.apply_twinklefox()
