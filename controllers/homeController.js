const express = require('express');
const router = express.Router();
const routeRoot = '/';
const serialize = require('node-serialize');

module.exports = {
    router,
    routeRoot,
    showHome,
    executeSearchBarSearch,
    addToCart
}
/**
 * Renders the default Home page of the website.
 * @param {*} request 
 * @param {*} response 
 */
function showHome( request, response ) {
    response.render( 'home.hbs' );
}

router.get( '/', showHome );

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

    cart.push( request.query.item );

    response.cookie( 'cart', serialize.serialize( cart ), { expires: new Date(Date.now() + 10000 * 60000) });
    response.redirect( `${request.cookies['endpoint']}?numItemsInCart=${cart.length}` ); 
}

router.get( '/cart', addToCart );