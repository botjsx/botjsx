const express = require('express');
const fs = require('fs');
const logger = require('tracer').colorConsole({
  level: 'log',
  transport: [
    function(data) {
      console.log(data.output);
    },
    function(data) {
      fs.appendFile('./file.log', data.rawoutput + '\n', (err) => {
        if (err) throw err;
      });
    }
  ]
});

const PORT = 3003;
const app = express();

app.listen(PORT, () => {
  logger.info(`server is listening on ${PORT}`);
});

// function incr({a, b}) {
//   return a + b;
// }
//
// function decr({a, b}) {
//   return a - b;
// }
//
// const a = incr({a: 1, b: 1});
// const b = decr({a, b: 1});
let str = new Array(100000).fill({a: 'stroka'});

app.get('/test', (req, res) => {
  str.push({a: 'stroka'});
  logger.info(str);
  res.send('ok');
});
