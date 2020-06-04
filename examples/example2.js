const express = require('express');
const Bot = require('../index');

const PORT = 3004;
const app = express();

app.listen(PORT, () => {
  console.info(`server is listening on ${PORT}`);
});

const incr = Bot.createContext(({a, b}) => {
  return a + b;
});

const decr = Bot.createContext(({b}) => {
  const a = Bot.useContext(incr);
  return a - b;
});

app.get('/test', (req, res) => {
  Bot.run(
    Bot.createComponent(incr, {a: 1, b: 1},
      Bot.createComponent(decr, {b: 1},
        function(b) {
          let str = new Array(100000).fill('stroka');
          res.send(b.toString());
        }
      )
    )
  );
});
