const fs = require('fs');

// This is reading our .txt file which houses the access log data and splitting on every new line
let readMe = fs.readFileSync('data.txt', 'utf8').split('\n');


// We iterate over the array to create a 2D array
// Each element in the outer array will be a line of data
// In the inner arrays, we split the string at every space, unless it is inside of quotations
// This does not matter for the DATE in brackets because when joined into a string again, it will be in proper format...Additionally, we are not using DATE field to parse any additional data
for(let i = 0; i < readMe.length; i++) {
  // String.prototype.match() method searches a string for a match agaist a REGEX and returns the matchas an array
  // The only parameter passed through the .match() method is a REGEX
  readMe[i] = readMe[i].match(/(?:[^\s"]+|"[^"]*")+/g);
}





// Use later to join strings back together
// readMe[i] = readMe[i].join(' ');