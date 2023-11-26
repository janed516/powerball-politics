const https = require("https");
const fs = require("fs");
require("dotenv").config();

const BILLS_BASE_URL = "https://api.congress.gov/v3/bill?format=json";
const TOKEN = process.env.API_TOKEN;

const TARGET_CALLS = 10;

let collectedBillsData = [];
let callsMade = 0;

async function main() {
  let prevBillsPage = {};
  do {
    let urlToCall = prevBillsPage.pagination
      ? `${prevBillsPage.pagination.next}&api_key=${TOKEN}`
      : `${BILLS_BASE_URL}&api_key=${TOKEN}`;
    console.log(`Making call: ${callsMade + 1}`);
    let billDataResp = await get(urlToCall);
    let billDataPack = JSON.parse(billDataResp);
    let billsPromises = billDataPack.bills.map(
      (b) =>
        new Promise(async (resolve) => {
          let data = JSON.parse(JSON.stringify(b));
          let billsPageResponse = await get(`${b.url}&api_key=${TOKEN}`);
          let billsPageJSON = JSON.parse(billsPageResponse);
          data.billData = billsPageJSON.bill;

          // if (billsPageJSON.bill.textVersions) {
          //   let textVersionResp = await get(
          //     `${billsPageJSON.bill.textVersions.url}&api_key=${TOKEN}`
          //   );
          //   let textVersionJSON = JSON.parse(textVersionResp);

          //   let textVersionPromises = textVersionJSON.textVersions.map(
          //     (t) =>
          //       new Promise(async (resolve) => {
          //         let xmlObj = t.formats.find((f) =>
          //           f.type.toLowerCase().includes("xml")
          //         );
          //         let textXmlData = await get(`${xmlObj.url}&api_key=${TOKEN}`);
          //         resolve(textXmlData);
          //       })
          //   );
          //   let textVersionPromiseResults = await Promise.allSettled(
          //     textVersionPromises
          //   );
          //   let allTextInfo = textVersionPromiseResults
          //     .filter((p) => p.status === "fulfilled")
          //     .map((p) => p.value);
          //   data.textData = allTextInfo;
          // }

          resolve(data);
        })
    );

    let promiseResults = await Promise.allSettled(billsPromises);
    let allBillInfo = promiseResults
      .filter((p) => p.status === "fulfilled")
      .map((p) => p.value);
    collectedBillsData = [...collectedBillsData, ...allBillInfo];
    prevBillsPage = billDataPack;
    billsDownloaded = collectedBillsData.length;

    console.log(`Completed call: ${callsMade + 1}`);
    callsMade++;
  } while (callsMade < TARGET_CALLS);
  // // console.log(json);

  let outFilePath = "./out.json";
  fs.writeFileSync(outFilePath, JSON.stringify(collectedBillsData, null, 2));
  console.log(`Written to file: ${outFilePath}`);

  console.log("-----------");
  console.log(`Collected ${collectedBillsData.length} bills`);
}

async function get(url) {
  return new Promise((resolve) => {
    let data = "";

    https.get(url, (res) => {
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve(data);
      });
    });
  });
}

main();

// wifiyongbuliao
