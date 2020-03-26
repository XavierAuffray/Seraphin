const http = require('http')

server = http.createServer(function(request, response) {
  const url = request.url
  if (url === '/api/v1/quote/car-insurance') {
    const body = []
    request.on('data', function(chunk) {
      body.push(chunk)
    })
    request.on('end', function() {
      const parsedBody = Buffer.concat(body).toString()
      const carValue = JSON.parse(parsedBody)['car_value']
      const driverBirthdate = JSON.parse(parsedBody)['driver_birthdate']
      const result = computePrice(carValue, driverBirthdate)
      const jsonResult = JSON.stringify(result)
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.write(`${jsonResult}`);
      response.end();
    })
  }
})

server.listen(8080)

function getAge(d1, d2){
  d2 = d2 || new Date();
  var diff = d2.getTime() - d1.getTime();
  return diff / (1000 * 60 * 60 * 24 * 365.25);
}

function convertAgeToGoodFormat(age) {
  const day = age.slice(0, 2)
  const month = age.slice(3, 5)
  const year = age.slice(6, 10)
  return month + '/' + day + '/' + year
}

function computePrice(carValue, driverBirthdate) {
  if ((carValue == undefined) || (driverBirthdate == undefined) || (driverBirthdate.length < 10) || !(typeof(carValue) === 'number') )  {
    return {
    "success": false,
    "message": "parameters missing or incorrect values"
    }
  } else {
    driverBirthdate = convertAgeToGoodFormat(driverBirthdate)
    if (getAge(new Date(driverBirthdate)) >= 18 && getAge(new Date(driverBirthdate)) <= 25 ) {
      return {
      "success": true,
      "message": "quote successfully computed",
      "data": {
          "eligible": true,
          "premiums": {
            "civil_liability": 1000.00,
            "omnium": carValue * 0.03
          }
        }
      }
    } else if (getAge(new Date(driverBirthdate)) > 25) {
          return {
      "success": true,
      "message": "quote successfully computed",
      "data": {
          "eligible": true,
          "premiums": {
            "civil_liability": 500.00,
            "omnium": carValue * 0.03
          }
        }
      }
    } else if (getAge(new Date(driverBirthdate)) < 18) {
    return {
      "success": true,
      "message": "quote successfully computed",
      "data": {
        "eligible": false,
        "premiums": null
        }
      }
    }
  }
};

