const fs = require('fs');
const Reader = require('@maxmind/geoip2-node').Reader;
const zipcodes = require('zipcodes');
const userAgent = require('user-agent-parse');
const fastcsv = require('fast-csv');


let logFile = fs.readFileSync('data.txt', 'utf8').split('\n');

// Splitting into 2D array. Each inner-array is split by space (delimiter) except if spaces exist within quotation marks("")
for (let i = 0; i < logFile.length; i++) {
  logFile[i] = logFile[i].match(/(?:[^\s"]+|"[^"]*")+/g);
}

function resolveStateAndCountry(ipAddress) {
  try {
    const dbBuffer = fs.readFileSync('./GeoLite2_City/GeoLite2-City.mmdb');
    const reader = Reader.openBuffer(dbBuffer);

    const response = reader.city(ipAddress);

    let country = (response.country.names) ? response.country.names.en : response.country.isoCode;
    let postalCode = response.postal.code;
    let state = '';
 
    // NOTE: response object also included the "state" in response.subdivisions[0].names 
    // However, decided to use zipcodes package to get state instead...some state names were not listed in the response and foreign countries had city value instead
    if(postalCode && zipcodes.lookup(postalCode)) {
      state = zipcodes.lookup(postalCode).state;
    } else {
      state = 'N/A';
    }

    return [state, country];
  } catch(error) {
    console.error(error.message);
  }
}

function concatenateLocation(dataArray) {
  let locationArray = [];
  for(let i = 0; i < dataArray.length; i++) {
    locationArray.push(resolveStateAndCountry(dataArray[i][0]));
  }

  for(let j = 0; j < dataArray.length; j++) {
    dataArray[j] = dataArray[j].concat(locationArray[j]);
  }
}

function parseUserAgent(userAgentString) {
  let agentObject = userAgent.parse(userAgentString);

  let browser = agentObject.name;
  let device = agentObject.device_type;

  if(!browser) {
    browser = 'N/A';
  }
  if(!device) {
    device = 'N/A';
  }
  
  return [browser, device];
}

function concatenateUserAgent(dataArray) {
  let agentArray = [];

  for(let i = 0; i < dataArray.length; i++) {
    let agentIndex = 9;
    let agentString = dataArray[i][agentIndex];
    agentArray.push(parseUserAgent(agentString));
  }

  for(let j = 0; j < dataArray.length; j++) {
    dataArray[j] = dataArray[j].concat(agentArray[j]);
  }
}

function addNewColumns() {
  concatenateLocation(logFile);
  concatenateUserAgent(logFile);
}

// When splitting the log file into a 2D array, it split a space within the date fields because the space was within brackets (i.e. [10/Jun/2015:18:14:56 +0000] => [10/Jun/2015:18:14:56, +0000])
// This function serves to combine the date into one element as originally intended
function combineDate(dataArray) {
  for(let i = 0; i < dataArray.length; i++) {
    dataArray[i][3] += ` ${dataArray[i][4]}`;
    dataArray[i].splice(4,1);
  }
}

// NOTE: Added headers to .csv file
// However, unclear about 2 header fields as denoted by the (?)s below (i.e. user(?) & response_time(?))
function writeCsv(dataArray) {
  try {
    const ws = fs.createWriteStream('data.csv');
    fastcsv
      .write(dataArray, { headers: ['ip_address', '-', 'user(?)', 'date', 'method', 'status', 'response_time(?)', 'url', 'user_agent', 'state', 'country', 'browser', 'device'] })
      .pipe(ws);
  } catch(error) {
    console.error(error);
  }
}

// Optional function created to overwrite the existing .txt file with data containing the new fields (state, country, browser, device)
function updateTxtFile(dataArray) {
  for(let i = 0; i < dataArray.length; i++) {
    dataArray[i] = dataArray[i].join(' ');
  }

  dataArray = dataArray.join('\n');
  fs.writeFileSync('data.txt', dataArray, {encoding:'utf8'});
}

function main() {
  addNewColumns();
  combineDate(logFile);
  writeCsv(logFile);
  updateTxtFile(logFile);
}

main();