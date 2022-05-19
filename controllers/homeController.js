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
 * @param {*} request 
 * @param {*} response 
 */
function showHome(request, response) {
    response.render('login.hbs')
}

router.get( '/', showHome );

//#region ANNA
function executeSearchBarSearch( request, response ){
    response.redirect( `${request.cookies['endpoint']}?searchBarSearch=${request.query.searchBarSearch}` );  
}

router.get( '/searchbar', executeSearchBarSearch );

function addToCart( request, response ){
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

router.get( '/cart', addToCart );

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

    response.cookie( 'cart', serialize.serialize( cart ), { expires: new Date(Date.now() + 10000 * 60000) });
    response.redirect( '/cart/items' );
}

router.post( '/cart/items', removeCartItem );
//#endregion