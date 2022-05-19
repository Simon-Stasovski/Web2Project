let connection;
const utilsMYSQL = require('../utilitiesMYSQL');

class InvalidInputError extends Error {   
    constructor(message) {
        super(message);
        this.name = "InvalidInputError";
  }
};
class InvalidDatabaseError extends Error { 
    constructor(message) {
        super(message);
        this.name = "InvalidDatabaseError";
  }
};

async function createTransactionTable(databaseConnection){

    connection = databaseConnection;

    const sqlQuery = "CREATE TABLE IF NOT EXISTS Transaction(TransactionID int "
        + "AUTO_INCREMENT, Price DECIMAL(8, 2), CardID int, FOREIGN KEY(CardID) " 
        + "REFERENCES Card(CardID), OriginalOwner varchar(25), FOREIGN KEY(OriginalOwner) "
        + "REFERENCES Users(Username), NewOwner varchar(25), FOREIGN KEY(NewOwner) "
        + "REFERENCES Users(Username), TransactionDate Date, PRIMARY KEY(TransactionID));";

    try{
        await connection.execute( sqlQuery ).catch(( error ) => { throw( error ); }); 
    }
    catch( error ){
        await dropTransactionTable().catch( ( error ) => { 
            let errorMessage = "Unable to drop Transaction table for reset";
            throw( errorMessage );
        });

        await connection.execute( sqlQuery ).catch(( error ) => {
            let errorMessage = "Unable to create Transaction table";
            throw( errorMessage );
        });

        console.info( 'Transactions table successfully initialized. File reset due to error.' );
    }
}

async function dropTransactionTable(){
    // connection = database.getConnection();

    try{
        if ( connection === undefined ){
            throw( "Database or connection not initialized" );
        }
        else{
            const sqlQuery =  "DROP TABLE IF EXISTS Transaction";

            await connection.execute( sqlQuery ).catch(( error ) => { 
                let errorMessage = `Unable to drop Transaction table: ${error}`;
                throw( errorMessage ); 
            });   

            console.info( "Transaction table dropped successfully"); 
        }
    }
    catch( error ){
        let errorMessage = `Error: Could not clear data in Transaction table in the database: ${error}`;
        console.error( errorMessage );
        throw( errorMessage );
    }
}

async function addTransaction(price, cardID, OriginalOwnerID, NewOwnerID, transactionDate){
    try{
        let insertQuery = `INSERT INTO Transaction(Price, CardID, OriginalOwner, NewOwner, TransactionDate) VALUES ('${price}', ${cardID}, '${OriginalOwnerID}', '${NewOwnerID}', '${transactionDate}');`;
        
        await utilsMYSQL.executeCommand(insertQuery, connection);

        return {price : price, oldOwner : OriginalOwnerID, newOwner : NewOwnerID, transactionDate : transactionDate, cardID: cardID};
    
    } catch (e){
        console.log(e.message);
        throw e;
    }
}
async function getTransaction(id){
    try{
        let selectQuery = `SELECT * FROM Transaction WHERE TransactionID = ${id}`;

        let result = await connection.query(selectQuery, [], (err, rows) => {
                        
        });

        if(result[0] == undefined){
            throw new InvalidDatabaseError("Invalid Id");
        }

        return result[0];

    }catch(e){
        throw e;
    }
}

async function getAllTransactions(){
    try{
        let selectQuery = 
        `SELECT * FROM Transaction;`;

        let result = await connection.query(selectQuery, [], (err, rows) => {

        });

        if(result[0] == undefined){
            throw new InvalidDatabaseError("Invalid Id");
        }

        return result[0];

    }catch(e){
        throw e;
    }
}

async function getAllUserTransactions(userId){
    try{
        let selectQuery = 
        `SELECT Cards.CardName Transactions.Price Transactions.TransactionDate from (Transactions INNER JOIN Cards ON Transactions.CardID = Cards.CardID) WHERE OriginalOwner = ? AND NewOwner = ?`;

        let result = await connection.query(selectQuery, [userId, userId], (err, rows) => {

        });

        if(result[0] == undefined){
            throw new InvalidDatabaseError("Invalid Id");
        }

        return result[0];

    }catch(e){
        throw e;
    }
}

async function getUserSellTransactions(userId){
    try{
        let selectQuery = 
        `SELECT Cards.CardName Transactions.Price Transactions.TransactionDate from (Transactions INNER JOIN Cards ON Transactions.CardID = Cards.CardID) WHERE OriginalOwner = ?`;

        let result = await connection.query(selectQuery, [userId], (err, rows) => {

        });

        if(result[0] == undefined){
            throw new InvalidDatabaseError("Invalid Id");
        }

        return result[0];

    }catch(e){
        throw e;
    }
}

async function getUserBuyTransactions(userId){
    try{
        let selectQuery = 
        `SELECT Cards.CardName Transactions.Price Transactions.TransactionDate from (Transactions INNER JOIN Cards ON Transactions.CardID = Cards.CardID) WHERE NewOwner = ?`;

        let result = await connection.query(selectQuery, [userId], (err, rows) => {

        });

        if(result[0] == undefined){
            throw new InvalidDatabaseError("Invalid Id");
        }

        return result[0];

    }catch(e){
        throw e;
    }
}

async function updateTransactionPrice(transactionId, newPrice){
    try{
        let updatePrice = `UPDATE Transaction SET Price = ${newPrice} WHERE TransactionID = ${transactionId};`;

        await utilsMYSQL.executeCommand(updatePrice, connection);

    }catch(e){
        throw e;
    }
}

async function removeTransaction(id){
    try{
        // if(!Number.isInteger(id)){
        //     throw new InvalidInputError("Id was not a number");
        // }
        
        let deleteTransaction = `DELETE FROM Transaction WHERE TransactionID = ${id};`;

        await utilsMYSQL.executeCommand(deleteTransaction, connection);

    }catch(e){
        throw e;
    }
}

async function getSpecifiedTransactions(startDate, endDate, filterType, cardType, isSeller, isBuyer){

    try{

        let selectQuery;

        if(isSeller && isBuyer){
            return null;
        }
        else if(isSeller && !isBuyer && !filterType){
            selectQuery = `SELECT t.TransactionId, c.CardName, t.TransactionDate, t.Price, t.OriginalOwner, t.NewOwner FROM Transaction t INNER JOIN Card c ON t.CardID = c.CardID INNER JOIN Users u On t.OriginalOwner = u.Username WHERE t.TransactionDate >= '${startDate}' AND t.TransactionDate <= '${endDate}';`
        }
        else if(isSeller && !isBuyer && filterType){
            selectQuery = `SELECT t.TransactionId, c.CardName, t.TransactionDate, t.Price, t.OriginalOwner, t.NewOwner FROM Transaction t INNER JOIN Card c ON t.CardID = c.CardID INNER JOIN Users u On t.OriginalOwner = u.Username WHERE t.TransactionDate >= '${startDate}' AND t.TransactionDate <= '${endDate}' AND c.type = '${cardType}';`
        }
        else if(!isSeller && isBuyer && !filterType){
            selectQuery = `SELECT t.TransactionId, c.CardName, t.TransactionDate, t.Price, t.OriginalOwner, t.NewOwner FROM Transaction t INNER JOIN Card c ON t.CardID = c.CardID INNER JOIN Users u On t.NewOwner = u.Username WHERE t.TransactionDate >= '${startDate}' AND t.TransactionDate <= '${endDate}';`
        }
        else if(!isSeller && isBuyer && filterType){
            selectQuery = `SELECT t.TransactionId, c.CardName, t.TransactionDate, t.Price, t.OriginalOwner, t.NewOwner FROM Transaction t INNER JOIN Card c ON t.CardID = c.CardID INNER JOIN Users u On t.NewOwner = u.Username WHERE t.TransactionDate >= '${startDate}' AND t.TransactionDate <= '${endDate}' AND c.type = '${cardType}';`
        }
        else{
            return null;
        }

        let result = await connection.query(selectQuery, [], (err, rows) => {

        });

        if(result[0] == undefined){
            throw new InvalidDatabaseError("Invalid Id");
        }

        return result[0];

    }catch(e){

    }

}

module.exports = {
    createTransactionTable,
    dropTransactionTable,
    addTransaction,
    getTransaction,
    getAllTransactions,
    getAllUserTransactions,
    getUserSellTransactions,
    getUserBuyTransactions,
    updateTransactionPrice,
    removeTransaction,
    getSpecifiedTransactions
}