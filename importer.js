const Nightmare = require('nightmare');
const nightmare = Nightmare({show: true, loadTimeout: 100000});
const cheerio = require('cheerio');
const csv = require('csv');
const vo = require('vo');
const fs = require('fs');

class Job {
  constructor(name, sourceLink, sourceSpans) {
    this.name = name;
    this.sourceLink = sourceLink;
    this.sourceSpans = sourceSpans;
    this.linkStream = fs.createWriteStream(`${name}Links.txt`);
    this.tsvStream = fs.createWriteStream(`${name}TSV.tsv`);
    this.finalStream = fs.createWriteStream(`${name}FINAL.txt`);
    this.errorStream = fs.createWriteStream(`${name}ERROR.txt`);
  }

  killStreams() {
    this.linkStream.end();
    this.tsvStream.end();
    this.errorStream.end();
    this.finalStream.end();
  }
}

// Sets
// https://store.snapon.com/Four-Way-Angle-Head-mm-Metric-10-mm-Four-Way-Angle-Head-Open-End-Wrench-P633523.aspx
//https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md
//https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md


// https://github.com/segmentio/nightmare/issues/402

const progressSelector = "#ctl00_ctl00_placeholderMain_placeholderContent_searchLoadingPanelctl00_ctl00_placeholderMain_placeholderContent_pnlProducts > div";

// const handToolJob = new Job("HandTools",
//   "https://store.snapon.com/Hand-Tools-C700010.aspx",
//   ["#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtFirst > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(2) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(3) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(4) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(5) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(6) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(7) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(8) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(9) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(10) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(11) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(12) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(13) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(14) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(15) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(16) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(17) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(18) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(19) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(20) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtLast > div > span.rtIn"]);

// const powerToolJob = new Job(
//   "PowerTools",
//   "https://store.snapon.com/Power-Tools-C700020.aspx",
//   ["#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtFirst > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(2) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(3) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtLast > div > span.rtIn"
//   ]);


// const toolStorageJob = new Job("ToolStorage", "https://store.snapon.com/Tool-Storage-C700030.aspx",
//   ["#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtFirst > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(2) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(3) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(3) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(4) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(5) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(6) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(7) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtLast > div > span.rtIn"
//   ]);

const toolStorageTotalItems = 1471 + 1113 + 185 + 80 + 283 + 16 + 7 + 1888;

// const shopToolJob = new Job("ShopTools", "https://store.snapon.com/Shop-and-Technician-Tools-C700050.aspx",
//   ["#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtFirst > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(2) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(3) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(4) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(5) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(6) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(7) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li:nth-child(8) > div > span.rtIn",
//     "#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li.rtLI.rtLast > div > span.rtIn"
//   ]);

const shopToolJobItems = 611 + 381 + 453 + 99 + 142 + 166 + 142 + 1430 + 69 + 347;

const diagnosticsJob = new Job("Diagnostics",
  "https://store.snapon.com/Diagnostics-C700040.aspx",
  ["#ctl00_ctl00_placeholderMain_placeholderLeftMenu_ACS_CurrentyCategory_RadTreeView > ul > li > div > span.rtIn"]
);

const waitTime = 12000;
const run = function* (job) {
  let links = [];
  for (let i = 0; i < job.sourceSpans.length; i++) {
    yield nightmare.goto(job.sourceLink)
      .click(job.sourceSpans[i])
      .wait(waitTime);
    let nextExists = yield nightmare.evaluate(() => {
      return (document.querySelector("#ctl00_ctl00_placeholderMain_placeholderContent_btnNext").attributes.disabled === undefined);
    });

    while (nextExists) {
      nextExists = yield nightmare.evaluate(() => {
        return (document.querySelector("#ctl00_ctl00_placeholderMain_placeholderContent_btnNext").attributes.disabled === undefined);
      });

      links.push(yield nightmare.evaluate(() => {
        let hrefs = [];
        let linksSelected = document.querySelectorAll(".boxtitle");
        try {
          for (let i = 0; i < linksSelected.length; i++) {
            hrefs.push(linksSelected[i].href);
          }
        } catch (err) {
          job.errorStream.write(`failed on parsing links ${linksSelected.toString()}`)
        }

        return hrefs;
      }));

      yield nightmare.click('#ctl00_ctl00_placeholderMain_placeholderContent_btnNext').wait(waitTime);
    }
  }

  return [].concat(...links).filter(i => i !== null);
};

const walkPages = (links, job) => {
  links.reduce(function (accumulator, url) {
    return accumulator.then(function (results) {
      return nightmare.goto(url).wait(1200).evaluate((url) => {
        try {
          let smallImage = '';
          if (document.querySelector('#ctl00_placeholderMain_imgProductImage')) {
            smallImage = document.querySelector('#ctl00_placeholderMain_imgProductImage').src;
          }

          let image = '';
          if (document.querySelector("#ctl00_placeholderMain_largeImageValue")) {
            image = document.querySelector("#ctl00_placeholderMain_largeImageValue").value;
          }
          const title = document.querySelector('#ctl00_placeholderMain_lblProductHead').textContent;
          const price = document.querySelector("#ctl00_placeholderMain_lblListPriceValue").textContent;
          const code = document.querySelector("#ctl00_placeholderMain_lblItem").textContent;
          const description = document.querySelector("#ctl00_placeholderMain_rpvProductInfo > div > div").innerHTML;
          const categories = document.querySelector("#breadcrumbs").innerHTML;
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
    job.finalStream.write(results.join());
    job.killStreams();
    nightmare.end();
  }).catch(console.error);
};

function parseMetaData(d) {
  const $d = cheerio.load(d.description);
  const description = $d('p').text();
  const $c = cheerio.load(d.categories);
  let category = [];
  $c('a').each(function (i, el) {
    category[i] = {text: $c(this).text(), link: $c(this).attr().href};
    category[i].text = category[i].text.replace('\n', '').trim();
  });
  let categoryString = category.map(i => i.text).reduce((prev, current) => {
    return prev + "|" + current;
  });

  return `${d.image}\t${d.smallImage}\t${d.title}\t${d.price}\t${d.code}\t${description.replace('\t', ' ').replace('\n', ' ')}\t${categoryString}\t${d.ogUrl}\n`
}


vo(run(diagnosticsJob))((err, results) => {
  if (err) {
    diagnosticsJob.killStreams();
    throw err
  } else {
    diagnosticsJob.linkStream.write(results.join('\n'));
    walkPages(results, diagnosticsJob);
  }
});


const totalItems = 836 + 267 + 1398 + 183 + 918 + 82 + 249 + 194 + 137 + 97 + 2029 + 1242 + 1052 + 103 + 93 + 370 + 70 + 193 + 115 + 1893 + 74;


