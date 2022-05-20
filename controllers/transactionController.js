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
            cardModel.SetOwnerShip(username, seller[i].CardID);
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
        response.render("transactionCompleted.hbs", {TransactionIds: transactionList, message: "TRANSACTION FAILED! Insufficient funds.", successfullTransaction: true});
    }
}


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

        response.render("userTransactions.hbs", {transactions: transactionList});
    }catch(err){
        if(err === model.InvalidDatabaseError){
            response.status(500);
            response.render("userTransactions.hbs", {transactions: transactionList}, {message: err.message});
            return;
        }
        else if(err === model.InvalidInputError){
            response.status(400)
            response.render("userTransactions.hbs", {transactions: transactionList}, {message: err.message});
            return;
        }
        response.status(300);
        console.log(err.message);
        response.render("userTransactions.hbs", {transactions: transactionList}, {message: "ERROR 300. Please contact the website administrator"});
    }
}

async function updateTransactionDate(request, response){
    try{

        await model.UpdateDate(request.query.id, request.query.transactionDate);

        response.status(200);
        response.render("userTransactions.hbs", {transactions: null});
    }catch(err){
        response.status(300);
        response.render("userTransactions.hbs", {message: "ERROR 300. Please contact the website administrator."}, {transactions: transactions});
    }
}

async function cancelTransaction(request, response){
    try{
        
        

        for(let i=0; i < seller.Length; i++){
            await model.DeleteTransaction(request.request.id[i]);
        }
        
        let username = request.cookies['userName'];

        await userModel.setUserBalance(username, (await userModel.getUserBalance(username)/1) + totalExpenses);


        for(let i = 0; i < seller.length; i++){
            await cardModel.SetOwnerShip(seller[i].CardOwner, seller[i].CardID);
            await userModel.setUserBalance(seller[i].CardOwner, (await userModel.getUserBalance(seller[i].CardOwner)/1) + (seller[i].CardPrice)/1);
        }

        seller = [];
        response.status(200);
        response.render("accountPage.hbs");
    }catch(err){
        response.status(300);
        response.render("userTransactions.hbs", {message: "ERROR 300. Please contact the website administrator."}, {transactions: transactions});
    }
}

async function diplayUserTransactions(request, response){
    response.render("userTransactions.hbs", {transactions: null});
}
async function displayCurrentTransactions(request, response){
    response.render("currentTransactions.hbs")
}

router.get("/transactionhistory", (request, response) => diplayUserTransactions(request, response))
router.post("/transactionhistory", (request, response) => listMyTransaction(request, response))

router.get("/transaction/newdate", (request, response) => updateTransactionDate(request, response))
router.get("/transaction", (request, response) => addTransaction(request, response))

router.get("/transaction/cancel", (request, response) => cancelTransaction(request, response))
