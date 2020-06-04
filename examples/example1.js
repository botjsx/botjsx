const express = require('express');

const PORT = 3003;
const app = express();

app.listen(PORT, () => {
  console.info(`server is listening on ${PORT}`);
});

function incr({a, b}) {
  return a + b;
}

function decr({a, b}) {
  return a - b;
}

app.get('/test', (req, res) => {
  const a = incr({a: 1, b: 1});
  const b = decr({a, b: 1});
  let str = new Array(100000).fill('stroka');
  // console.log(str);
  res.send(b.toString());
});
