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

// Step 2.
// for(let i = 0; i < logFile.length; i++) {
//   Reader.open('./GeoLite2_City/GeoLite2-City.mmdb')
//     .then(reader => {
//       const response = reader.city(logFile[i][0]);

//       let country = response.country.names.en;
//       let postalCode = response.postal.code;
//       let state = '';

//       if(postalCode) {
//         state = zipcodes.lookup(postalCode).state;
//       } else {
//         state = 'N/A';
//       }

//       logFile[i].push(state);
//     })
//     .catch(err => console.error(err.message));
// }

async function addStateAndCountry(array) {
  let result = [];
  for(let i = 0; i < array.length; i++) {
    let reader = await Reader.open('./GeoLite2_City/GeoLite2-City.mmdb');

    let response = reader.city(array[i][0]);

    let country = response.country.names.en;
    let postalCode = response.postal.code;
    let state = '';
   
    if(postalCode) {
      state = zipcodes.lookup(postalCode).state;
    } else {
      state = 'N/A';
    }

    result.push(state, country);
  } 
}

// addStateAndCountry(logFile);


let promiseArray = [];
for(let i = 0; i < logFile.length; i++) {
  promiseArray.push(getData(logFile[i][0]));
}

Promise.all(promiseArray).then(data => {
  console.log(data);
});

 
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


// logFile.forEach(async entry => {
//   try {
//     let reader = await Reader.open('./GeoLite2_City/GeoLite2-City.mmdb');

//     let response = reader.city(entry[0]);

//     let country = response.country.names.en;
//     let postalCode = response.postal.code;
//     let state = '';
   
//     if(postalCode) {
//       state = zipcodes.lookup(postalCode).state;
//     } else {
//       state = 'N/A';
//     }

//     entry.push(state, country);
//   } catch(err) {
//     console.error(err.message);
//   }
// });