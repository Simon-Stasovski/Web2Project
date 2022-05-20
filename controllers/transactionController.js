const express = require('express');
const { off } = require('process');
const router = express.Router();
const routeRoot = "/";
const model = require('../models/transactionModel');
const cardModel = require('../models/cardModel');
const userModel = require('../models/userModel');
var serialize = require('../node_modules/node-serialize');
var seller = [];
let totalExpenses;

module.exports = {
    router,
    routeRoot,
    addTransaction,
    listMyTransaction,
}
/**
 * Adds a transaction to the database and renders a page to tell the user if it was successful and 
 * to ask the user to purchase if they wish to cancel it or go to the home page if it was successful.  
 * @param {*} request The json object that represents the http request
 * @param {*} response The json object that represents the http response 
 */
async function addTransaction(request, response) {
    try{
        let username = request.cookies['userName'];

        
        let cart = serialize.unserialize( request.cookies['cart'] );                                                                                                                                      
        cart = Object.values( cart );

        totalExpenses = 0;
        
        let cards = [];

        for( let i = 0; i < cart.length; i++){
            cards.push(await cardModel.findCardRecord(cart[i]))
        }


        for( var i=0; i<cards.length; i++){
            totalExpenses += (cards[i].CardPrice/1)
        }

        if(await userModel.getUserBalance(username) - (totalExpenses * 1.15) < 0){
            throw error;
        }

        let transactionList = [];

        for( var i=0; i<cart.length; i++){
            transactionList.push(await model.createTransaction( await cardModel.findCardRecord(cart[i]), username));
        }

        for(let i = 0; i < transactionList.length; i++){
            transactionList[i] = transactionList[i][0];
        }

        let userBalance = (await userModel.getUserBalance(username))/1

        await userModel.setUserBalance(username, userBalance - totalExpenses * 1.15);


        for(let i = 0; i < cart.length; i++){
            seller.push(await cardModel.findCardRecord(cart[i]));
            await cardModel.SetOwnerShip(username, seller[i].CardID, 0);
            await userModel.setUserBalance(seller[i].CardOwner, (await userModel.getUserBalance(seller[i].CardOwner)/1) + (seller[i].CardPrice)/1);
        }

        for(let i = 0; i < cards.length; i++){
            seller.push(cards[i]);
        }

        cart = null;

        response.cookie( 'cart', serialize.serialize( cart ), { expires: new Date(Date.now() + 10000 * 60000), overwrite: true});
        response.status(200);
        response.render("transactionCompleted.hbs", {TransactionIds: transactionList, message: "Transaction completed successfully.", successfullTransaction: true});
    }catch(err){
        response.status(400);
        response.render("transactionCompleted.hbs", {TransactionIds: null, message: "Transaction failed! Insufficient funds.", successfullTransaction: false});
    }
}

/**
 * Lists all the transaction based on the filtering options of the user.
 * Renders the page with a message indicating if their their filtering option
 * returned nothing or if it was a filter option that did not work.
 * @param {*} request The json object that represents the http request
 * @param {*} response The json object that represents the http response 
 */
async function listMyTransaction(request, response) {
    try{
        let username = request.cookies['userName'];

        if(request.body.filterType === 'on'){
            request.body.filterType = true;
        }
        else{
            request.body.filterType = false;
        }
        if(request.body.seller === 'on'){
            request.body.seller = true;
        }
        else{
            request.body.seller = false;
        }
        if(request.body.buyer === 'on'){
            request.body.buyer = true;
        }
        else{
            request.body.buyer = false;
        }

        let transactionList = await model.getSpecifiedTransactions(request.body.start, request.body.end, request.body.filterType, request.body.type, request.body.seller, request.body.buyer, username);
        response.status(200);
        transactionList.forEach(function(transaction){
            transaction.TransactionDate = transaction.TransactionDate.toString().substring(0, 15);
        })

        let message;

        if(transactionList.length == 0){
            message = "No transaction found with these settings.";
        }
        else{
            message = "";
        }

        response.render("userTransactions.hbs", {transactions: transactionList, message: message});
    }catch(err){
        response.status(400);
        response.render("userTransactions.hbs", {transactions: null, message: err.message});
    }
}
/**
 * Updates the transaction id and renders the page with a message to notify the user if it has been updated successfully.
 * @param {*} request The json object that represents the http request
 * @param {*} response The json object that represents the http response 
 */
async function updateTransactionDate(request, response){
    try{

        await model.UpdateDate(request.query.id, request.query.transactionDate);

        response.status(200);
        response.render("userTransactions.hbs", {transactions: null, message: "Transaction update successfully"});
    }catch(err){
        response.status(500);
        response.render("userTransactions.hbs", {transactions: null, message: "Transaction update failed"});
    }
}
/**
 * Cancels the user's recently made transaction by deleting the transaction and returning
 * ownership of the cards and returning the respective amounts to their balances.
 * Renders page that will 
 * @param {*} request The json object that represents the http request
 * @param {*} response The json object that represents the http response 
 */
async function cancelTransaction(request, response){
    try{

        for(let i=0; i < seller.Length; i++){
            await model.DeleteTransaction(request.request.id[i]);
        }
        
        let username = request.cookies['userName'];

        await userModel.setUserBalance(username, (await userModel.getUserBalance(username)/1) + (totalExpenses * 1.15));


        for(let i = 0; i < seller.length; i++){
            await cardModel.SetOwnerShip(seller[i].CardOwner, seller[i].CardID, 1);
            await userModel.setUserBalance(seller[i].CardOwner, (await userModel.getUserBalance(seller[i].CardOwner)/1) - (seller[i].CardPrice)/1);
        }

        seller = [];
        response.status(200);
        response.render("transactionCompleted.hbs", {TransactionIds: null, message: "Transaction successfully cancelled.", successfullTransaction: false});
    }catch(err){
        response.status(300);
        response.render("transactionCompleted.hbs", {TransactionIds: null, message: "Transaction cancellation failed.", successfullTransaction: false});
    }
}
/**
 * Displays the filtering page for the transactions.
 * @param {*} request The json object that represents the http request
 * @param {*} response The json object that represents the http response  
 */
async function diplayUserTransactions(request, response){
    response.status(200);
    response.render("userTransactions.hbs", {transactions: null});
}

router.get("/transactionhistory", (request, response) => diplayUserTransactions(request, response))
router.post("/transactionhistory", (request, response) => listMyTransaction(request, response))

router.get("/transaction/newdate", (request, response) => updateTransactionDate(request, response))
router.get("/transaction", (request, response) => addTransaction(request, response))

router.get("/transaction/cancel", (request, response) => cancelTransaction(request, response))
