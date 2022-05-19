const errorController = require( './controllers/errorController' );
const homeController = require( './controllers/homeController' );

const cardController = require( './controllers/cardController' );
const transactionController = require( './controllers/transactionController' );
const uuid = require('uuid');
var cookieParser = require('cookie-parser');

const express = require('express');
const app = express();
app.use(cookieParser());
const {engine} = require('express-handlebars');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
app.use(cookieParser());

console.log("Creating app");

// Tell the app to use handlebars templating engine.  
//   Configure the engine to use a simple .hbs extension to simplify file naming
app.engine('hbs', engine({ extname: '.hbs'}));
app.set('view engine', 'hbs');
app.set('views', './views');  // indicate folder for views

// Add support for forms+json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json());
app.use(express.static('public'));
const expressListRoutes = require('express-list-routes');



// Make sure errorController is last!
const controllers = ['homeController', 'userController', 'cardController', 'transactionController', 'errorController'] 

// Register routes from all controllers 
//  (Assumes a flat directory structure and common 'routeRoot' / 'router' export)
controllers.forEach(( controllerName ) => {
    try {
        const controllerRoutes = require( './controllers/' + controllerName );
        app.use( controllerRoutes.routeRoot, controllerRoutes.router );
    } catch ( error ) {
        //fail gracefully if no routes for this controller
        console.log( error );
    }    
});

module.exports = app
// List out all created routes 
expressListRoutes(app, { prefix: '/' });