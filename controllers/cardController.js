const express = require( 'express' );
const router = express.Router();
const routeRoot = '/';
const model = require( '../models/cardModel' );
const logger = require('../logger');

module.exports = {
    router,
    routeRoot,
    addCard
}

async function addCard( request, response ) {
    try{
        let card = await model.addCard( request.body.cardName, request.body.type, request.body.description, request.body.serialNumber, request.body.frontImagePath, request.body.backImagePath
            ,request.body.isForSale, request.body.cardCondition, request.body.certificateImage, request.body.cardPrice, request.body.cardOwner )
        // response.status( 200 );
    }
    catch( error ){
        if(error instanceof model.SystemError){
            //response.render( 'addFabricForm.hbs', { errorClass: "alert alert-primary", alertMessage: "Fabric add failed" });
            logger.error( error );
            response.status( 500 );
        }
        else if(error instanceof model.UserInputError){
            // response.render( 'addFabricForm.hbs', { errorClass: "alert alert-secondary", alertMessage: "Fabric add failed due to invalid input" });
            logger.error( error );
            response.status( 400 );
        } 
        else{
            logger.error( error.message );
        }
    }
}

router.post( '/card', addCard );