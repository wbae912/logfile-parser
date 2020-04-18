const Reader = require('@maxmind/geoip2-node').Reader;
const zipcodes = require('zipcodes');
 
let DATA = [
  ['207.114.153.6'],
  ['74.143.105.130'],
  ['109.239.235.216'],
  ['70.194.134.125'],
  ['123.126.113.132']
];

function fetchData(ipAddress) {
  return Reader.open('./GeoLite2_City/GeoLite2-City.mmdb')
    .then(reader => {
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
    })
    .catch(err => console.error(err));
}

function createPromiseArray(array) {
  let promiseArray = [];

  for(let i = 0; i < array.length; i++) {
    let ipAddress = array[i][0];
    let promise = fetchData(ipAddress);

    promiseArray.push(promise);
  }
  return promiseArray;
}


let promiseArray = createPromiseArray(DATA);
function resolvePromise(promiseArray) {
  return Promise.all(promiseArray)
    .then(function(response) {
      // console.log(response); // THIS SHOWS CORRECT RESPONSE [ [state,country],[state,country],... ]

      doSomething(response);

      // console.log(DATA); // DOES NOT LOG TO CONSOLE
    }); 
}

function doSomething(response) {
  for(let i = 0; i < DATA.length; i++) {
    DATA[i] = DATA[i].concat(response[i]);
  }
}

resolvePromise(promiseArray);
console.log(DATA); // DID NOT CHANGE...


// SAMPLE OUTPPUT:
[ 
  [ '207.114.153.6', 'CA', 'United States' ],
  [ '74.143.105.130', 'IN', 'United States' ],
  [ '109.239.235.216', 'N/A', 'Norway' ],
  [ '70.194.134.125', 'N/A', 'United States' ],
  [ '123.126.113.132', 'N/A', 'China' ]
];