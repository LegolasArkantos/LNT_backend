import puppeteer from "puppeteer";

const getQuotes = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will be in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // Navigate to the initial page
  await page.goto("http://quotes.toscrape.com/", {
    waitUntil: "domcontentloaded",
  });

  while (true) {
    // Get page data
    const quotes = await page.evaluate(() => {
      // Fetch all elements with class "quote"
      const quoteList = document.querySelectorAll(".quote");

      // Convert the quoteList to an iterable array
      // For each quote fetch the text and author
      return Array.from(quoteList).map((quote) => {
        // Fetch the sub-elements from the previously fetched quote element
        // Get the displayed text and return it (`.innerText`)
        const text = quote.querySelector(".text").innerText;
        const author = quote.querySelector(".author").innerText;

        return { text, author };
      });
    });

    // Display the quotes
    console.log(quotes);

    // Click on the "Next page" button if it exists
    const nextPageButton = await page.$(".pager > .next > a");
    if (!nextPageButton) {
      // If there is no next page button, break the loop
      break;
    }

    // Click on the "Next page" button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      nextPageButton.click(),
    ]);
  }

  // Close the browser
  await browser.close();
};

// Start the scraping
getQuotes();


