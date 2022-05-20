const express = require('express');
const router = express.Router();
const routeRoot = '/';
const serialize = require('node-serialize');
const cardModel = require( '../models/cardModel' );

module.exports = {
    router,
    routeRoot,
    showHome,
    executeSearchBarSearch,
    addToCart,
    getCartItems
}
/**
 * Renders the default Home page of the website.
 * @param {*} request The object representation of the http request
 * @param {*} response The object representation of the http response
 */
function showHome(request, response) {
    response.render('login.hbs');
}

router.get( '/', showHome );

//#region ANNA
/**
 * redirects the search bar search item to the last visited endpoint (either shopping page or card page)
 * @param {*} request The object representation of the http request. The endpoint cookie is set before this
 * method is called.
 * @param {*} response The object representation of the http response
 */
function executeSearchBarSearch( request, response ){
    response.redirect( `${request.cookies['endpoint']}?searchBarSearch=${request.query.searchBarSearch}` );  
}

router.get( '/searchbar', executeSearchBarSearch );

/**
 * Adds the card id passed in the request to the shopping cart cookie if the user is logged in.
 * @param {*} request The object representation of the http request
 * @param {*} response The object representation of the http response
 */
function addToCart( request, response ){
    let username = request.cookies['userName'];

    if( username != null ){
        let cart = serialize.unserialize( request.cookies['cart'] );

        if( cart == null ){
            cart = [];
        }
        else{
            cart = Object.values( cart );
        } 
    
        let id = request.query.item;
        if( !cart.includes( id )){
            cart.push( id );
        }
    
        response.cookie( 'cart', serialize.serialize( cart ), { expires: new Date(Date.now() + 10000 * 60000) });
        response.redirect( `${request.cookies['endpoint']}?numItemsInCart=${cart.length}` ); 
    }
    else{
        alert( "You must be logged in to shop. Log in or create an account to proceed." );
        response.redirect( `${request.cookies['endpoint']}` );
    }
   
}

router.get( '/cart', addToCart );


/**
 * Gets all of the items in the shopping cart cookies by passing the cardId in each index of the cookie's
 * array to the findSpecificRecord card model method. Also sums the total prices of the cards in the shopping
 * cart and calculates the 15% tax. Renders the shopping cart view with the object representations of each 
 * card in the shopping cart, the sum of all the card prices in the shopping cart and the tax.
 * @param {*} request The object representation of the http request
 * @param {*} response The object representation of the http response
 */
async function getCartItems( request, response ){
    let cart = serialize.unserialize( request.cookies['cart'] );
    let dataToSend = {};
    cart = Object.values( cart );

    if( cart == null || cart.length == 0 ){
        cart = [];
        dataToSend.emptyCart = true;
    }
    else{
        let items = [];
        let subtotal = 0;

        for( let i = 0; i < cart.length; i++ ){
            if( !items.includes( cart[i] )){
                let item = await cardModel.findCardRecord( cart[i] );
                items.push( item );
                subtotal += parseFloat( item.CardPrice );
            }
        }

        dataToSend.cartItems = items; 
        dataToSend.subtotal = subtotal;
        dataToSend.tax = ( subtotal*15 )/100;
        dataToSend.total = ( dataToSend.subtotal + dataToSend.tax ).toFixed( 2 );
        dataToSend.tax = dataToSend.tax.toFixed( 2 );
    }

    response.render( 'cart.hbs', dataToSend );
}

router.get( '/cart/items', getCartItems );

/**
 * Removes the specified card id from the shopping cart cookie and redirects
 * to the shopping cart view.
 * @param {*} request The object representation of the http request
 * @param {*} response The object representation of the http response 
 */
function removeCartItem( request, response ){
    let cart = serialize.unserialize( request.cookies['cart'] );
    cart = Object.values( cart );
    let cardToRemove = request.body.itemToRemove;
    let indexToSplice;

    for( let i = 0; i < cart.length; i++ ){
        if( cart[i] == cardToRemove ){
            indexToSplice = i;
            break;
        }
    }

    cart.splice( indexToSplice, 1 );

    response.cookie( 'cart', serialize.serialize( cart ), { expires: new Date(Date.now() + 10000 * 60000), overwrite: true});
    response.redirect( '/cart/items' );
}

router.post( '/cart/items', removeCartItem );
//#endregion