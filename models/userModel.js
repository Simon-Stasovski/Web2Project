const mysql = require( 'mysql2/promise' );
const validator = require( './validateCard' );
const logger = require( '../logger' );
var connection;

async function createUserTable( databaseConnection ){
    connection = databaseConnection;

    const sqlQuery =  'CREATE TABLE IF NOT EXISTS Users(Username varchar(25), Email varchar(50), Password varchar(40), AccountBalance DECIMAL(10, 2), IsPrivate BOOL, PRIMARY KEY (Username));';
    
    try{
        await connection.execute( sqlQuery ).catch(( error ) => { throw( error ); }); 
        logger.info( 'Users table successfully initialized. File loaded.' );
    }
    catch( error ){
        await dropUsersTable().catch( ( error ) => { 
            let errorMessage = "Unable to drop users table for reset";
            logger.error( errorMessage );
            throw( errorMessage );
        });

        await connection.execute( sqlQuery ).catch(( error ) => {
            let errorMessage = "Unable to create card table";
            logger.error( errorMessage ); 
            throw( errorMessage );
        });

        logger.info( 'Users table successfully initialized. File reset due to error.' );
    }
}


async function dropUserTable(){
   try{
       if ( connection === undefined ){
           throw( "Database or connection not initialized" );
       }
       else{
           const sqlQuery =  "DROP TABLE IF EXISTS Users";

           await connection.execute( sqlQuery ).catch(( error ) => { 
               let errorMessage = `Unable to drop users table: ${error}`;
               logger.error( errorMessage );
               throw( errorMessage ); 
           });   

           logger.info( "Users table dropped successfully"); 
       }
   }
   catch( error ){
       let errorMessage = `Error: Could not clear data in users table in the database: ${error}`;
       logger.error( errorMessage );
       throw( errorMessage );
   }
}

module.exports = {
    createUserTable,
    dropUserTable
};