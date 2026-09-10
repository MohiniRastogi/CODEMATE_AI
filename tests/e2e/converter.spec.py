import asyncio
from pathlib import Path

from playwright.async_api import async_playwright


BASE_URL = "http://localhost:8080"
SCREENSHOT = Path("/tmp/browser/converter-e2e.png")


async def main() -> None:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 1800},
            permissions=["clipboard-read", "clipboard-write"],
        )
        page = await context.new_page()
        converter_requests = []
        page.on(
            "request",
            lambda request: converter_requests.append(request)
            if "_serverFn" in request.url and request.method == "POST"
            else None,
        )

        await page.goto(f"{BASE_URL}/app/convert", wait_until="networkidle")
        await page.locator("textarea").fill('print("hello")')
        await page.locator("select").nth(0).select_option(label="Python")
        await page.locator("select").nth(1).select_option(label="JavaScript")
        await page.get_by_role("button", name="Convert Code").click()

        await page.get_by_text("Converted · JavaScript").wait_for(timeout=30_000)
        body = await page.locator("body").inner_text()
        assert 'console.log("hello");' in body, body
        assert len(converter_requests) == 1, f"expected one conversion request, got {len(converter_requests)}"

        copy_buttons = page.get_by_role("button", name="Copy")
        assert await copy_buttons.count() >= 3, "expected source, converted, and action copy buttons"
        await copy_buttons.nth(1).click()
        copied = await page.evaluate("navigator.clipboard.readText()")
        assert copied.strip(), "converted Copy button copied empty text"
        assert "console.log" in copied, copied

        SCREENSHOT.parent.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(SCREENSHOT))
        print("converter e2e passed: converted code rendered and copied")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())