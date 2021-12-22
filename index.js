const express = require('express');
const port = 3000;

const app = express();
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

// routes setting
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
