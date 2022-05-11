/**
 * Controller that defines the handler method for undefined endpoints.
 */

 const express = require('express');
 const router = express.Router();
 const routeRoot = '/';
 
 module.exports = {
     router,
     routeRoot,
     showError
 }
 
 /**
  * Renders the error view for any invalid endpoint. 
  * @param {*} request The http request object
  * @param {*} response The http response object
  */
 function showError( request, response ){
     response.send( "Error: Invalid endpoint" );
    //  response.render( 'addFabricForm.hbs' );
 }
 
 router.all( '*', showError );