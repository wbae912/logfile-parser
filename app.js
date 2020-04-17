const fs = require('fs');
const Reader = require('@maxmind/geoip2-node').Reader;
const zipcodes = require('zipcodes');

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
console.log(logFile);

// Step 2.

async function getData(ipAddress) {
  let reader = await Reader.open('./GeoLite2_city/GeoLite2-City.mmdb');

  let response = reader.city(ipAddress);

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

function createPromiseArray(array) {
  let promiseArray = [];
  for(let i = 0; i < array.length; i++) {
    promiseArray.push(getData(logFile[i][0]));
  }

  return promiseArray;
}

let promiseArray = createPromiseArray(logFile);

function returnData(promiseArray) {
  return Promise.all(promiseArray)
    .then(data => {
      console.log(data); // THIS WORKS!!
      return data;
    });
} 

let results = returnData(promiseArray);
console.log(results);
console.log(returnData(promiseArray));


/* SAMPLE INPUT:
[ 
  [ '207.114.153.6',
    '-',
    '-',
    '[10/Jun/2015:18:14:56',
    '+0000]',
    '"GET /favicon.ico HTTP/1.1"',
    '200',
    '0',
    '"http://www.gobankingrates.com/banking/find-cds-now/"',
    '"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.81 Safari/537.36"'],
  [ '74.143.105.130',
    '-',
    '-',
    '[10/Jun/2015:18:15:00',
    '+0000]',
    '"GET /personal-finance/first-thing-should-social-security-check/ HTTP/1.1"',
    '200',
    '17842',
    '"http://www.gobankingrates.com/personal-finance/become-millionaire-using-just-401k/"',
    '"Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko"']
]
*/


/* Expected results: 
  [ 
    [ 'CA', 'United States' ],
    [ 'IN', 'United States' ],
    [ 'N/A', 'Norway' ],
    [ 'N/A', 'United States' ],
    [ 'IN', 'United States' ],
    [ 'IN', 'United States' ],
    [ 'N/A', 'China' ] 
  ]
*/


// let promiseArray = [];
// for(let i = 0; i < logFile.length; i++) {
//   promiseArray.push(getData(logFile[i][0]));
// }

// let results = [];
// function resolve(promiseArray) {
//   return Promise.all(promiseArray).then(data => {return data;})
//     .then(data => results = data);
// } 
