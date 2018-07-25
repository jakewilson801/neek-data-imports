const Nightmare = require('nightmare');
const nightmare = Nightmare({show: true, loadTimeout: 40000, dock: true});
const cheerio = require('cheerio');
const csv = require('csv');
const vo = require('vo');
const fs = require('fs');


class Job {
  constructor(name, sourceLink, reset) {
    this.name = name;
    this.sourceLink = sourceLink;
    this.reset = reset;
    if (reset) {
      this.linkStream = fs.createWriteStream(`tooltopia/${name}Links.txt`);
      this.tsvStream = fs.createWriteStream(`tooltopia/${name}TSV.tsv`);
      this.finalStream = fs.createWriteStream(`tooltopia/${name}FINAL.txt`);
      this.errorStream = fs.createWriteStream(`tooltopia/${name}ERROR.txt`);
    }
  }

  killStreams() {
    if (this.reset) {
      this.linkStream.end();
      this.tsvStream.end();
      this.errorStream.end();
      this.finalStream.end();
    }
  }
}

//#ctl00_centerColumn > div.rdcontents > div:nth-child(1) > div > div.product-list-options > div.product-list-text > a
//#ctl00_centerColumn > div.rdcontents > div:nth-child(249) > div > div.product-list-options > div.product-list-text > a
//#ctl00_centerColumn > div.rdcontents
//#ctl00_centerColumn > div.rdcontents > div
const toolTopia = new Job("Topia", ["https://www.tooltopia.com/search.aspx?find=&category=3606&page=2&size=200", "https://www.tooltopia.com/search.aspx?find=&category=3593&page=2&size=200"], true);

const walkPages = (links, job) => {
  links.reduce(function (accumulator, url) {
    return accumulator.then(function (results) {
      return nightmare.goto(url).wait(1200).evaluate((url) => {
        try {
          // document.querySelector()
          return {image, smallImage, title, price, code, description, categories, ogUrl: url};
        } catch (error) {
          return {error, url};
        }
      }, url).then(function (result) {
        if (result.url || result.error) {
          job.errorStream.write(`${JSON.stringify(result.error)} ${result.url}\n`);
        } else {
          const pageData = parseMetaData(result);
          results.push(pageData);
          job.tsvStream.write(pageData);
        }
        return results;
      }).catch(e => {
        console.error(e);
        job.errorStream.write(JSON.stringify(e))
      });
    }).catch(e => {
      console.error(e);
      job.errorStream.write(JSON.stringify(e))
    });
  }, Promise.resolve([])).then(function (results) {
    job.finalStream.write(results.join("\n"));
    job.killStreams();
    nightmare.end();
  }).catch(console.error);
};

const run = function* (job) {
  const results = [];
  for (let i = 0; i < job.sourceLink.length; i++) {
    yield nightmare.goto(job.sourceLink[i]);
    results.push(yield nightmare.evaluate(() => {
      const links = [];
      //#ctl00_centerColumn > div.rdcontents > div:nth-child(1) > div > div.product-list-options > div.product-list-text > a
      const linksHtml = document.querySelectorAll("#ctl00_centerColumn > div.rdcontents > div > div > div > div.product-list-text > a");
      for (let j = 0; j < linksHtml.length; j++) {
        links.push(linksHtml[j].href);
      }
      return links;
    }));
  }
  return results;
};

function parseMetaData(d) {
  const $d = cheerio.load(d.description);
  const description = $d('p').text();
  const $c = cheerio.load(d.categories);

  return `${d.image}\t${d.smallImage}\t${d.title}\t${d.price}\t${d.code}\t${description.replace('\t', ' ')}\t${categoryString}\t${d.ogUrl}\n`
}

vo(run(toolTopia))((err, results) => {
  if (err) {
    throw err
  } else {
    console.log(results[0].length);
    console.log(results[1].length);
  }
});
