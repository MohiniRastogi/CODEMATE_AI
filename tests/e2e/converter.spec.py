import re, asyncio
from pathlib import Path

from playwright.async_api import async_playwright


BASE_URL = "http://localhost:8080"
SCREENSHOT = Path("/tmp/browser/converter-e2e.png")
ERROR_SCREENSHOT = Path("/tmp/browser/converter-e2e-error-panel.png")


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

        # Malformed-response scenario: intercept the server fn and return a payload
        # with no convertedCode. The error panel must show the validated reason.
        async def malformed(route):
            await route.fulfill(
                status=200,
                content_type="application/json",
                body='{"contentType":"application/json","explanation":"oops"}',
            )

        await page.route(re.compile("_serverFn"), malformed)
        await page.get_by_role("button", name="Convert Code").click()
        panel = page.get_by_test_id("conversion-error-panel")
        await panel.wait_for(timeout=15_000)
        panel_text = await panel.inner_text()
        assert "Conversion failed" in panel_text, panel_text
        assert "not valid structured JSON" in panel_text, panel_text
        assert "Try again" in panel_text, panel_text
        await panel.screenshot(path=str(ERROR_SCREENSHOT))

        # Retry after removing the interception should succeed again.
        await page.unroute(re.compile("_serverFn"))
        await panel.get_by_role("button", name="Try again").click()
        await page.get_by_text("Converted · JavaScript").wait_for(timeout=30_000)
        assert await panel.count() == 0, "error panel should be gone after successful retry"

        SCREENSHOT.parent.mkdir(parents=True, exist_ok=True)
        await page.screenshot(path=str(SCREENSHOT))
        print("converter e2e passed: converted code rendered and copied; error panel shows validated reason and retry works")
        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
