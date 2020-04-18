const fs = require('fs');
const Reader = require('@maxmind/geoip2-node').Reader;
const zipcodes = require('zipcodes');
const userAgent = require('user-agent-parse');

// Step 1.

// This is reading our .txt file which houses the access log data and splitting on every new line
let logFile = fs.readFileSync('data.txt', 'utf8').split('\n');

// We iterate over the array to create a 2D array
// Each element in the outer array will be a line of data
// In the inner arrays, we split the string at every space, unless it is inside of quotations
// This does not matter for the DATE in brackets because when joined into a string again, it will be in proper format...Additionally, we are not using DATE field to parse any additional data
for (let i = 0; i < logFile.length; i++) {
  // String.prototype.match() method searches a string for a match agaist a REGEX and returns the matchas an array
  // The only parameter passed through the .match() method is a REGEX
  logFile[i] = logFile[i].match(/(?:[^\s"]+|"[^"]*")+/g);
}

// Step 2. 
function resolveStateAndCountry(ipAddress) {
  const dbBuffer = fs.readFileSync('./GeoLite2_City/GeoLite2-City.mmdb');
  const reader = Reader.openBuffer(dbBuffer);

  const response = reader.city(ipAddress);

  let country = response.country.names.en;
  let postalCode = response.postal.code;
  let state = '';
 
  if(postalCode) {
    state = zipcodes.lookup(postalCode).state;
  } else {
    state = 'N/A';
  }

  return [state, country];
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

// addNewColumns();