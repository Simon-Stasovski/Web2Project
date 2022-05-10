const express = require('express');
const router = express.Router();
const routeRoot = '/';
module.exports = {
    router,
    routeRoot,
    showHome
}
/**
 * Renders the default Home page of the website.
 * @param {*} request 
 * @param {*} response 
 */
function showHome(request, response) {
    response.render('home.hbs')
}

router.get('/', showHome);