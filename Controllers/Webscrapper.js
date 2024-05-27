import puppeteer from "puppeteer";
import readline from "readline";

// Create an interface to read input from the console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const getJobs = async (searchTerm) => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - a default viewport (`defaultViewport: null` - website page will be in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();

  // Replace any spaces in the search term with "+"
  const formattedSearchTerm = searchTerm.replace(/\s+/g, "+");

  // Construct the URL with the formatted search term
  const url = `https://www.bayt.com/en/pakistan/jobs/${formattedSearchTerm}-jobs/`;

  // Navigate to the constructed URL
  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  try {
 // Wait for the job listings to load
await page.waitForSelector("li.has-pointer-d");

// Get job data
const jobs = await page.evaluate(() => {
  const jobElements = document.querySelectorAll("div#results_inner_card.card-content");
  const jobData = [];
  jobElements.forEach((jobElement) => {
    const titleElement = jobElement.querySelector("h3.s-18");
    const companyElement = jobElement.querySelector("div.cname");
    const locationElement = jobElement.querySelector("span.func-area");
    const postedOnElement = jobElement.querySelector("div.col-md-12.float-left > span");

    if (titleElement && companyElement && locationElement && postedOnElement) {
      const title = titleElement.innerText.trim();
      const company = companyElement.innerText.trim();
      const location = locationElement.innerText.trim();
      const postedOn = postedOnElement.innerText.trim();
      jobData.push({ title, company, location, postedOn });
    }
  });
  return jobData;
});



    // Display the jobs
    console.log(jobs);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    // Close the browser
    await browser.close();

    // Close the readline interface
    rl.close();
  }
};

// Ask the user to enter a keyword to search for jobs
rl.question("Enter a keyword to search for jobs: ", (searchTerm) => {
  // Start the scraping with the user's input
  getJobs(searchTerm);
});
