const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
 
const url = 'https://github.com/trending';
 
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
 
  // Extracting data for trending repositories
  const repoData = await page.evaluate(() => {
    const repos = [];
    document.querySelectorAll('.Box .Box-row').forEach(repo => {
      const title = repo.querySelector('h1 a').textContent.trim();
      const url = 'https://github.com' + repo.querySelector('h1 a').getAttribute('href');
      const description = repo.querySelector('p')?.textContent.trim() || '';
      const stars = repo.querySelector('.octicon-star + span')?.textContent.trim() || '';
      const forks = repo.querySelector('.octicon-repo-forked + span')?.textContent.trim() || '';
      const language = repo.querySelector('[itemprop="programmingLanguage"]')?.textContent.trim() || '';
      repos.push({
        title,
        url,
        description,
        stars,
        forks,
        language
      });
    });
    return repos;
  });
 
  // Click on developers and select javascript from the language section
  await page.click('ul.filter-list li:nth-child(2) a'); // Click on developers
  await page.waitForSelector('div.select-menu:nth-child(6) button'); // Wait for the language button to appear
  await page.click('div.select-menu:nth-child(6) button'); // Click on the language button
  await page.waitForSelector('.select-menu-modal.show .select-menu-list a:nth-child(1)'); // Wait for the JavaScript option to appear
  await page.click('.select-menu-modal.show .select-menu-list a:nth-child(1)'); // Click on the JavaScript option
 
  // Extracting data for trending developers
  const devData = await page.evaluate(() => {
    const devs = [];
    document.querySelectorAll('article.border-bottom.border-gray-dark').forEach(dev => {
      const name = dev.querySelector('h1 a').textContent.trim();
      const username = dev.querySelector('h1 a').getAttribute('href').substring(1);
      const repo = dev.querySelector('h1 + p')?.textContent.trim() || '';
      const description = dev.querySelector('h1 + p + p')?.textContent.trim() || '';
      devs.push({
        name,
        username,
        repo: {
          name: repo,
          description
        }
      });
    });
    return devs;
  });
 
  await browser.close();
 
  // Storing the extracted data in a JSON object
  const jsonData = {
    repositories: repoData,
    developers: devData
  };
 
  // Saving the JSON to a file and console logging it
  fs.writeFileSync('data.json', JSON.stringify(jsonData, null, 2));
  console.log(jsonData);
})();