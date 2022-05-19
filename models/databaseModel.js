const mysql = require( 'mysql2/promise' );
const cardModel = require( './cardModel' );
const transactionModel = require('./transactionModel');
const userModel = require('./userModel');
const logger = require( '../logger' );
var connection;


async function initialize( databaseFilename, resetFlag ){
    try{
        connection = await mysql.createConnection({
            host: 'localhost', 
            user: 'root',
            port: '10000',
            password: 'pass',
            database: databaseFilename
        });
    
        if( resetFlag ){
            await userModel.dropUserTable().catch( (error ) => { 
                error = `Issue with clearing user table: ${error}`;
                logger.error( error ); 
                throw( error );
            }); // have to throw here if not execution continues


            await cardModel.dropCardTable().catch( (error ) => { 
                error = `Issue with clearing card table: ${error}`;
                logger.error( error ); 
                throw( error );
            }); // have to throw here if not execution continues
          
            await transactionModel.dropTransactionTable().catch( (error ) => { 
                error = `Issue with clearing transaction table: ${error}`;
                logger.error( error ); 
                throw( error );
            }); // have to throw here if not execution continues
        }
        
        await userModel.createUserTable( connection ).catch( (error) => {
            error = `Issue with creating user table: ${error}`;
            logger.error( error ); 
            throw( error );
        });


        await cardModel.createCardTable( connection ).catch( (error) => {
            error = `Issue with creating card table: ${error}`;
            logger.error( error ); 
            throw( error );
        });

         await transactionModel.createTransactionTable( connection ).catch( (error) => {
             error = `Issue with creating transaction table: ${error}`;
             logger.error( error ); 
             throw( error );
         });

    }
    catch( error ){
        logger.error( `Error: Unable to initialize database: ${error}` );
    }
}

/**
 * Gets the connection to the current database and returns it.
 * The database and connection are initialized before the
 * function is called.
 * @returns the connection to the database.
 */
 function getConnection(){
    return connection;
}

async function clearDatabase(){
    await userModel.dropUserTable().catch( (error ) => { 
        error = `Issue with clearing user table: ${error}`;
        logger.error( error ); 
        throw( error );
    });

    await cardModel.dropCardTable().catch( (error ) => { 
        error = `Issue with clearing card table: ${error}`;
        logger.error( error ); 
        throw( error );
    });
}

module.exports = {
    initialize,
    getConnection
};