require('dotenv').config();

let app = require('./app').init();

let port = app.get('port');

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`))