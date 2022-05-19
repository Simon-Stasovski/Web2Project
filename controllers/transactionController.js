const express = require('express');
const { off } = require('process');
const router = express.Router();
const routeRoot = "/";
const model = require('../models/transactionModel');

module.exports = {
    router,
    routeRoot,
    addTransaction,
    listTransaction,
    listAllTransaction,
    updateTransaction,
    removeTransaction,
    listMyTransaction,
}

async function addTransaction(request, response) {
    try{
        let transaction = await model.addTransaction(request.body.Price, request.body.CardID, request.body.OriginalOwnerID, request.body.NewOwnerID, request.body.TransactionDate);

        response.status(200);
        response.render("displayTransaction.hbs", {message: "Successfully Added Transaction", 
        price : transaction.price, oldOwner : transaction.oldOwner, newOwner : transaction.newOwner, transactionDate : transaction.transactionDate, cardID: transaction.cardID});
    }catch(err){
        // if(err.name === model.InvalidDatabaseError.name){
        //     response.status(500);
        //     response.render("displayTransaction.hbs", {message:  "Error status 500. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        // else if(err.name === model.InvalidInputError.name){
        //     response.status(400)
        //     response.render("displayTransaction.hbs", {message:  "Error status 400. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        response.status(300);
        console.log(err.message);
        response.render("displayTransaction.hbs", {message: "Error status 300. Please Contact the administrator of the website", 
        price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
    }
}

async function listTransaction(request, response) {
    try{
        let transaction = await model.getTransaction(request.query.tid);
        response.status(200);
        response.render("displayMultipleTransactions.hbs", {message: "One Transaction", transactions: transaction});
    }catch(err){
        // if(err.name === model.InvalidDatabaseError.name){
        //     response.status(500);
        //     response.render("displayTransaction.hbs", {message:  "Error status 500. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        // else if(err.name === model.InvalidInputError.name){
        //     response.status(400)
        //     response.render("displayTransaction.hbs", {message:  "Error status 400. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        response.status(300);
        console.log(err.message);
        response.render("displayTransaction.hbs", {message: "Error status 300. Please Contact the administrator of the website", 
        price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
    }
}

async function listAllTransaction(request, response) {
    try{
        let transactionList = await model.getAllTransactions();
        response.status(200);
        response.render("displayMultipleTransactions.hbs", {message: "All Transactions", transactions: transactionList});
    }catch(err){
        // if(err.name === model.InvalidDatabaseError.name){
        //     response.status(500);
        //     response.render("displayMultipleTransactions.hbs", {message:  "Error status 500. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        // else if(err.name === model.InvalidInputError.name){
        //     response.status(400)
        //     response.render("displayMultipleTransactions.hbs", {message:  "Error status 400. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        response.status(300);
        console.log(err.message);
        response.render("displayMultipleTransactions.hbs", {message: "Error status 300. Please Contact the administrator of the website", 
        price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
    }
}

async function listMyTransaction(request, response) {
    try{
        if(request.query.filterType === 'on'){
            request.query.filterType = true;
        }
        else{
            request.query.filterType = false;
        }
        if(request.query.seller === 'on'){
            request.query.seller = true;
        }
        else{
            request.query.seller = false;
        }
        if(request.query.buyer === 'on'){
            request.query.buyer = true;
        }
        else{
            request.query.buyer = false;
        }

        let transactionList = await model.getSpecifiedTransactions(request.query.start, request.query.end, request.query.filterType, request.query.type, request.query.seller, request.query.buyer);
        response.status(200);
        transactionList.forEach(function(transaction){
            transaction.TransactionDate = transaction.TransactionDate.toString().substring(0, 16);
        })

        response.render("userTransactions.hbs", {transactions: transactionList});
    }catch(err){
        // if(err.name === model.InvalidDatabaseError.name){
        //     response.status(500);
        //     response.render("displayMultipleTransactions.hbs", {message:  "Error status 500. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        // else if(err.name === model.InvalidInputError.name){
        //     response.status(400)
        //     response.render("displayMultipleTransactions.hbs", {message:  "Error status 400. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        response.status(300);
        console.log(err.message);
        response.render("displayMultipleTransactions.hbs", {message: "Error status 300. Please Contact the administrator of the website", 
        price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
    }
}


async function updateTransaction(request, response) {
    try{
        let transaction = await model.getTransaction(request.query.id);
        await model.updateTransactionPrice(request.query.id, request.query.price)
        response.status(200);
        response.render("displayMultipleTransactions.hbs", {message: "Updated Transaction", transactions: transaction});

    }catch(err){
        // if(err.name === model.InvalidDatabaseError.name){
        //     response.status(500);
        //     response.render("displayTransaction.hbs", {message:  "Error status 500. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        // else if(err.name === model.InvalidInputError.name){
        //     response.status(400)
        //     response.render("displayTransaction.hbs", {message:  "Error status 400. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        response.status(300);
        console.log(err.message);
        response.render("displayTransaction.hbs", {message: "Error status 300. Please Contact the administrator of the website", 
        price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
    }
}

async function removeTransaction(request, response) {
    try{
        let transaction = await model.getTransaction(request.query.id);
        await model.removeTransaction(request.query.id);
        response.status(200);
        response.render("displayMultipleTransactions.hbs", {message: "Removed Transaction", transactions: transaction});
    }catch(err){
        // if(err.name === model.InvalidDatabaseError.name){
        //     response.status(500);
        //     response.render("displayTransaction.hbs", {message:  "Error status 500. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        // else if(err.name === model.InvalidInputError.name){
        //     response.status(400)
        //     response.render("displayTransaction.hbs", {message:  "Error status 400. Please Contact the administrator of the website", 
        //     price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
        //     return;
        // }
        response.status(300);
        console.log(err.message);
        response.render("displayTransaction.hbs", {message: "Error status 300. Please Contact the administrator of the website", 
        price : null, originalOwnerID : null, newOwnerID : null, transactionDate : null, cardID: null});
    }
}

async function displayAddForm(request, response){
    response.render("addTransaction.hbs");
}

async function displayUpdateForm(request, response){
    response.render("updateTransaction.hbs");
}

async function displayGetForm(request, response){
    response.render("getTransaction.hbs");
}


async function displayDeleteForm(request, response){
    response.render("removeTransaction.hbs");
}

async function diplayUserTransactions(request, response){
    response.render("userTransactions.hbs");
}

router.post("/addTransaction", (request, response) => addTransaction(request, response));
router.get("/updateTransaction", (request, response) => updateTransaction(request, response));
router.get("/deleteTransaction", (request, response) => removeTransaction(request, response));
router.get("/listTransaction", (request, response) => listTransaction(request, response));


router.get("/addTransactionForm", (request, response) => displayAddForm(request, response))
router.get("/updateTransactionForm", (request, response) => displayUpdateForm(request, response))
router.get("/deleteTransactionForm", (request, response) => displayDeleteForm(request, response))
router.get("/getTransaction", (request, response) => displayGetForm(request, response))

router.get("/getAllTransactions", (request, response) => listAllTransaction(request, response))

router.get("/myTransactions", (request, response) => diplayUserTransactions(request, response))
router.get("/listMyTransactions", (request, response) => listMyTransaction(request, response))