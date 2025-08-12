from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)

    # Desktop view
    context = browser.new_context(viewport={'width': 1280, 'height': 720})
    page = context.new_page()
    page.goto("http://127.0.0.1:8080")
    page.screenshot(path="scratch/verification/verification_desktop_final.png")

    # Mobile view
    context = browser.new_context(viewport={'width': 375, 'height': 667})
    page = context.new_page()
    page.goto("http://127.0.0.1:8080")
    page.screenshot(path="scratch/verification/verification_mobile_final.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
