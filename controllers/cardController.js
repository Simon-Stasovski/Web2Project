const express = require( 'express' );
const router = express.Router();
const routeRoot = '/';
const model = require( '../models/cardModel' );
const logger = require('../logger');
const { REPL_MODE_STRICT } = require('repl');

module.exports = {
    router,
    routeRoot,
    addCard,
    listAllCards, 
    getSpecificCard,
    listCardsByUser,
    editSpecificCard,
    deleteSpecificCard,
    listCardsForSale
}

async function addCard( request, response ) {
    try{
        let card = await model.addCard( request.body.cardName, request.body.type, request.body.description, request.body.serialNumber, request.body.frontImagePath, request.body.backImagePath
            ,request.body.isForSale, request.body.cardCondition, request.body.certificateImage, request.body.cardPrice, request.body.cardOwner )
        response.send( card );
            // response.status( 200 );
    }
    catch( error ){
        if(error instanceof model.SystemError){
            //response.render( 'addFabricForm.hbs', { errorClass: "alert alert-primary", alertMessage: "Fabric add failed" });
            logger.error( error );
            response.send( "Could not add card due to error" );
            response.status( 500 );
        }
        else if(error instanceof model.UserInputError){
            // response.render( 'addFabricForm.hbs', { errorClass: "alert alert-secondary", alertMessage: "Fabric add failed due to invalid input" });
            logger.error( error );
            response.send( "Could not add card due to invalid input" );
            response.status( 400 );
        } 
        else{
            logger.error( error.message );
        }
    }
}

router.post( '/card', addCard );

async function listAllCards( request, response ){
    try{
        let listOfCards = await model.readFromCardTable();
        // const dataToSend = { fabric: listOfFabric };
        // response.status( 200 );
        // response.render( 'showAllFabric.hbs', dataToSend );
        response.send( listOfCards );
    }
    catch( error ){
        logger.error( error );
        response.send( error.message );
        response.status( 500 );
        // response.render( 'home.hbs', { errorClass: "alert alert-primary", alertMessage: 'Cannot get all fabric items from database' });
    }
}

router.get( '/cards', listAllCards ); // can it be plural since the idea is multiple


async function getSpecificCard( request, response ){
    try{
        let id = request.params.id;
        let card = await model.findCardRecord( id );
        // const dataToSend = { fabric: listOfFabric };
        // response.status( 200 );
        // response.render( 'showAllFabric.hbs', dataToSend );

        if( card != null ){
            response.send( card );
        }
        else{
            response.send( `Could not find card with id ${id}` );
        }

    }
    catch( error ){
        if( error instanceof model.SystemError ){
            logger.error( error );
            response.send( "Could not find card due to error" );
            response.status( 500 );
            // response.render( 'showSpecificFabricForm.hbs', { errorClass: "alert alert-primary", alertMessage: 'Getting fabric with specified name failed' });
        }
        else if( error instanceof model.UserInputError ){
            logger.error( error );
            response.send( `Could not find card with id ${id}` );
            response.status( 400 );
            // response.render( 'showSpecificFabricForm.hbs', { errorClass: "alert alert-secondary", alertMessage: `Fabric name: ${request.params.name} does not exist in database` });
        } 
        else{
            response.send( `Could not find card with id ${id}` );
            response.status( 500 );
            logger.error( error.message );
        }
    }
}

router.get( '/card/:id', getSpecificCard ); 

async function listCardsByUser( request, response ){
    try{
        let username = request.params.user;
        let cards = await model.getCardsByOwner( username );

        if(cards != null){
            response.send( cards );
        }
        else{
            response.send( `Unable to retreive cards for user ${username}` );
        }
    }
    catch( error ){
        logger.error( error );
        response.send( `Unable to retreive cards for user ${username}` );
        response.status( 500 );
        // response.render( 'home.hbs', { errorClass: "alert alert-primary", alertMessage: 'Cannot get all fabric items from database' });
    }
}

router.get( '/card/user/:user', listCardsByUser );

async function listCardsForSale( request, response ){
    try{
        let cardsForSale = await model.getCardsForSale();

        if( request.query.cardType != null ){
            cardsForSale = getFilterResults( request, cardsForSale );
        }

        let dataToSend = { cards: cardsForSale, cardEndpoint: "/cards/sale" }; 

        if( request.query.id != null ){
            let cardData = await model.findCardRecord( request.query.id );
            dataToSend.specificCardData = cardData;
            dataToSend.buyMode = true;
        }

        if(cardsForSale != null){
            response.render( 'mainPageCards.hbs', dataToSend );
        }
        else{
            response.send( `Unable to retreive cards for sale` );
        }
    }
    catch( error ){
        logger.error( error );
        response.send( `Unable to retreive cards for sale` );
        response.status( 500 );
        // response.render( 'home.hbs', { errorClass: "alert alert-primary", alertMessage: 'Cannot get all fabric items from database' });
    }
}

router.get( '/cards/sale', listCardsForSale );

function getFilterResults( request, cards ){
    let type = request.query.cardType;
    let minCondition = request.query.minCondition;
    let maxCondition = request.query.maxCondition;
    let minPrice = request.query.minPrice;
    let maxPrice = request.query.maxPrice;

    if(type != "All types"){
        cards = cards.filter( ( card ) => {
            return card.Type == type.toLower();
        });
    }

    cards = cards.filter( ( card ) => {
        return card.Condition >= minCondition && card.Condition <= maxCondition;
    });

    cards = cards.filter( ( card ) => {
        if( card.CardPrice != null ){
            return card.CardPrice >= minPrice && card.CardPrice <= maxPrice;
        }
        else{
            return false;
        }

    });
    
    return cards;
}

async function editSpecificCard( request, response ){
    try{
        let id = request.params.id;
        let card = await model.updateRowInCardTable( id, request.body.newCardName, request.body.newType, request.body.newDescription, request.body.newSerialNumber, 
            request.body.newFrontImagePath, request.body.newBackImagePath, request.body.newIsForSale, request.body.newCardCondition, request.body.newCertificateImage, 
            request.body.newCardPrice, request.body.newCardOwner );

        
        // const dataToSend = { fabric: listOfFabric };
        // response.status( 200 );
        // response.render( 'showAllFabric.hbs', dataToSend );
        response.send( card );
    }
    catch( error ){
        if( error instanceof model.SystemError ){
            logger.error( error );
            response.send( { error: error});
            response.status( 500 );
        }
        else if( error instanceof model.UserInputError ){
            logger.error( error );
            response.send( { error: error});
            response.status( 400 );
        } 
        else{
            logger.error( error.message );
        }
    }
}

router.put( '/card/:id', editSpecificCard ); 

async function deleteSpecificCard( request, response ){
    try{
        let id = request.params.id;
        let result = await model.deleteRowFromCardTable( id )

        if( result ){
            response.send( "Successfully deleted card with id " + id );
        }
        else{
            response.send( `Unable to delete card with id: ${id}` );
        }

        // response.status( 200 );
    }
    catch( error ){
        if( error instanceof model.SystemError ){
            response.send( `Could not find card with id: ${id} to delete` );
            response.status( 500 );
            // response.render( 'deleteFabricForm.hbs', { errorClass: "alert alert-primary", alertMessage: 'Deleting fabric with specified name failed' });
        }
        else if( error instanceof model.UserInputError ){
            response.send( `Could not find card with id: ${id} to delete` );
            response.status( 400 );
            // response.render( 'deleteFabricForm.hbs', { errorClass: "alert alert-secondary", alertMessage: `Fabric name: ${request.params.name} does not exist in database` });
        } 
        else{
            response.send( `Unable to delete card with id: ${id}` );
            response.status( 500 );
            logger.error( error.message );
        }
    }
}

router.delete( '/card/:id', deleteSpecificCard );
