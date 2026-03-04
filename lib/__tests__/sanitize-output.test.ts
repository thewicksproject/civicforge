import { describe, expect, it } from "vitest";
import { sanitizeOutput, stripDatamarks } from "@/lib/ai/sanitize";

describe("sanitizeOutput", () => {
  it("strips <script> tags with content", () => {
    expect(sanitizeOutput('<script>alert("xss")</script>')).toBe("");
    expect(sanitizeOutput('before<script>evil()</script>after')).toBe("beforeafter");
  });

  it("strips <svg> tags", () => {
    expect(sanitizeOutput('<svg><circle r="10"/></svg>')).toBe("");
  });

  it("strips <style> tags with content", () => {
    expect(sanitizeOutput("<style>body{display:none}</style>")).toBe("");
  });

  it("strips <link>, <meta>, <base> tags", () => {
    expect(sanitizeOutput('<link rel="stylesheet" href="evil.css">')).toBe("");
    expect(sanitizeOutput('<meta http-equiv="refresh" content="0;url=evil">')).toBe("");
    expect(sanitizeOutput('<base href="https://evil.com/">')).toBe("");
  });

  it("strips inline event handlers (quoted)", () => {
    expect(sanitizeOutput('<div onclick="alert(1)">hi</div>')).toBe("<div >hi</div>");
  });

  it("strips inline event handlers (unquoted)", () => {
    expect(sanitizeOutput("<img onerror=alert(1) src=x>")).toBe("<img  src=x>");
  });

  it("strips javascript: protocol", () => {
    expect(sanitizeOutput('<a href="javascript:alert(1)">click</a>')).toBe(
      '<a href="alert(1)">click</a>'
    );
  });

  it("strips data:text/html", () => {
    // Both data:text/html and <script> tags are stripped
    expect(sanitizeOutput('<a href="data:text/html,<script>alert(1)</script>">x</a>')).toBe(
      '<a href=",">x</a>'
    );
  });

  it("strips expression() CSS", () => {
    expect(sanitizeOutput('style="width:expression(alert(1))"')).toBe(
      'style="width:alert(1))"'
    );
  });

  it("strips <iframe>, <object>, <embed>, <form> tags", () => {
    expect(sanitizeOutput('<iframe src="evil.html"></iframe>')).toBe("");
    expect(sanitizeOutput('<object data="evil.swf"></object>')).toBe("");
    expect(sanitizeOutput('<embed src="evil.swf"/>')).toBe("");
    expect(sanitizeOutput('<form action="evil"><input></form>')).toBe("<input>");
  });

  it("leaves normal text and safe HTML intact", () => {
    const safe = "<p>Hello <strong>world</strong>! Check out this <a href=\"https://example.com\">link</a>.</p>";
    expect(sanitizeOutput(safe)).toBe(safe);
  });

  it("leaves plain text unchanged", () => {
    const text = "Just a normal message with no HTML";
    expect(sanitizeOutput(text)).toBe(text);
  });
});

describe("stripDatamarks", () => {
  it("removes ^ characters and trims", () => {
    expect(stripDatamarks("^hello^ ^world^")).toBe("hello world");
  });

  it("handles text without datamarks", () => {
    expect(stripDatamarks("plain text")).toBe("plain text");
  });

  it("trims leading/trailing whitespace", () => {
    expect(stripDatamarks("  ^word^  ")).toBe("word");
  });
});
