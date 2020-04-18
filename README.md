# Access Log Parser

## Description
This Node.js application is intended to read an access log file, append fields to each entry (state, country, browser, device), and output a .csv file.

## Getting Started
* Clone the repository and install dependencies using ```npm install```
* Run ```node app.js``` in the CLI in order to run the application (output data.txt to data.csv)

## Dependencies Used (installed using npm)
* **@maxmind/geoip2-node**: MaxMind GeoIP2 Free Database used to obtain geolocation, such as *country* from an IP Address
* **fast-csv**: Library that parses and formats CSV in Node.js
* **user-agent-parse**: Parses user agents, returning an object including properties such as *browser* and *device*
* **zipcodes**: Zipcode lookup package, returning object including properties such as *state*

## Additional Information
Please reference ```app.js``` for documentation of code