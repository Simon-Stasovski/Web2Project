const app = require("./app.js");
const port = 1339;

const model = require( './models/databaseModel' );
//app.listen(port);

let dbName = process.argv[2];
if (!dbName) {
  dbName = 'cardoholics_db';
} 
model.initialize(dbName, false)
    .then(
        app.listen(port) // Run the server
);
