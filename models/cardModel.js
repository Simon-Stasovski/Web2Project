const mysql = require( 'mysql2/promise' );
const validator = require( './validateCard' );
const logger = require( '../logger' );
// const database = require( './databaseModel' );
var connection;

//#region ERROR_CLASSES

class SystemError extends Error{
    
}

class UserInputError extends Error{
    
}

//#endregion 

/**
 * Creates the card table if it does not already exist. If there is an issue 
 * with creating or loading a previous card table, the table is reset and then
 * created again. Only for use within the model.
 * A connection to the database is initialized before the function is called.
 */
 async function createCardTable( databaseConnection ){
    connection = databaseConnection;

    const sqlQuery =  'CREATE TABLE IF NOT EXISTS Card(CardID int AUTO_INCREMENT, CardName VARCHAR(50) NOT NULL, Type VARCHAR(50) NOT NULL,' +
     'Description VARCHAR(400), SerialNumber VARCHAR(50), FrontImagePath VARCHAR(150), BackImagePath VARCHAR(150), IsForSale BIT, CardCondition int, ' +
     'CertificateImage varchar(150), CardPrice DECIMAL(8, 2), CardOwner varchar(25), PRIMARY KEY(CardID), FOREIGN KEY (CardOwner) REFERENCES Users(Username));';
    
    try{
        await connection.execute( sqlQuery ).catch(( error ) => { throw( error ); }); 
        logger.info( 'Card table successfully initialized. File loaded.' );
    }
    catch( error ){
        await dropCardTable().catch( ( error ) => { 
            let errorMessage = "Unable to drop card table for reset";
            logger.error( errorMessage );
            throw( errorMessage );
        });

        await connection.execute( sqlQuery ).catch(( error ) => {
            let errorMessage = "Unable to create card table";
            logger.error( errorMessage ); 
            throw( errorMessage );
        });

        logger.info( 'Card table successfully initialized. File reset due to error.' );
    }
}

/**
 * Clears the contents of the current database's card table by
 * dropping the card table.
 * The database and connection are initialized before the function
 * is called.
 */
 async function dropCardTable(){
    // connection = database.getConnection();

    try{
        if ( connection === undefined ){
            throw( "Database or connection not initialized" );
        }
        else{
            const sqlQuery =  "DROP TABLE IF EXISTS Card";

            await connection.execute( sqlQuery ).catch(( error ) => { 
                let errorMessage = `Unable to drop card table: ${error}`;
                logger.error( errorMessage );
                throw( errorMessage ); 
            });   

            logger.info( "Card table dropped successfully"); 
        }
    }
    catch( error ){
        let errorMessage = `Error: Could not clear data in card table in the database: ${error}`;
        logger.error( errorMessage );
        throw( errorMessage );
    }
}


/**
 * Adds a new card entry to the card table with the passed in data.
 * Uses the isValid function to validate the passed in data. It also
 * converts the valid data into a certain styling format to ensure
 * consistency (ex: all card names are lowercase). 
 * Returns the object representation of the added card.
 * The database, connection and card table are initialized before 
 * the function is called. 
 * @param {*} cardName The name of the card.
 * @param {*} type The card's type (pokemon, basketball, etc)
 * @param {*} description The card's description
 * @param {*} serialNumber The card's serial number.
 * @param {*} frontImagePath The path to an image of the front of the card.
 * @param {*} backImagePath The path to an image of the back of the card.
 * @param {*} isForSale Whether or not the card is for sale. Default is not for sale.
 * @param {*} cardCondition The condition of the card specified with an integer value between 1 and 5 
 * (1 being best condition 5 being worst condition).
 * @param {*} certificateImage The path to an image of the card's certificate of authenticity.
 * @param {*} cardPrice The price of the card.
 * @param {*} cardOwner The owner of the card's username.
 * @returns The object representation of the added card.
 */
 async function addCard( cardName, type, description, serialNumber, frontImagePath, backImagePath, isForSale, cardCondition, certificateImage, cardPrice, cardOwner, dbConnection ){
    try{
        connection = dbConnection == null ? connection : dbConnection;
        
        isForSale = isForSale == 'on' ? true : false;
        
        if( await validator.isValid( cardName, description, frontImagePath, backImagePath, type, serialNumber, cardCondition, cardPrice, cardOwner, certificateImage, isForSale, connection )){ 
            // add all the string values to lower case so they are inserted in lower case
            cardName = cardName.toLowerCase();
            type = type.toLowerCase();

            description = description === "" ? null : `"${description}"`;
            frontImagePath = frontImagePath === "" ? null : `"${frontImagePath}"`;
            backImagePath = backImagePath === "" ? null : `"${backImagePath}"`;
            serialNumber = serialNumber === "" ? null : `"${serialNumber}"`;
            certificateImage = certificateImage === "" ? null : `"${certificateImage}"`;
            isForSale = isForSale === true ? 1 : 0;

            const sqlQuery =  `INSERT INTO Card(CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, CertificateImage, CardPrice, CardOwner)
                                   VALUES ("${cardName}", "${type}", ${description}, ${serialNumber}, ${frontImagePath}, ${backImagePath}, ${isForSale}, ${cardCondition}, ${certificateImage}, ${cardPrice}, "${cardOwner}")`;

                await connection.execute( sqlQuery ).catch(( error ) => { 
                    let errorMessage = `Unable to add data to card table: ${error}`;
                    logger.error( errorMessage );
                    throw new SystemError( errorMessage );
                });   

                logger.info( `Card with name '${cardName}' added to table successfully`); 

                let cardId = await getLastIdAddedToCardTable();

                if(cardId != null){
                    return await findCardRecord( cardId ); // make sure that this works properly
                }
                else{
                    return null; // not sure what we want to do in this case.
                }

        }
        else{          
            let errorMessage = "Invalid data";
            logger.error( errorMessage );
            throw new UserInputError(errorMessage );
        }
    }
    catch( error ){
        logger.error( error );
        throw error;// new UserInputError( `Error: card could not be added to the table: ${error}` );
    }

}

/**
 * Reads the data from the card table and returns all of the 
 * rows in the table. The database, connection and card table
 * are initialized before the function is called. Returns an
 * empty array if there is an error while reading from the table.
 * @returns an array of all of the rows read from the card table.
 */
 async function readFromCardTable(){
    const sqlQuery = "SELECT * FROM Card";
    const EMPTY_ARRAY = [];

    let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => {  
        let errorMessage = `Error: Unable to read from card table: ${error}`;
        logger.error( errorMessage );
        throw new SystemError ( errorMessage );
    });
    
    return rows;
}


async function getLastIdAddedToCardTable(){
    const sqlQuery = "SELECT MAX(CardID) FROM Card";

    let id = await connection.execute( sqlQuery ).catch(( error ) => {  
        let errorMessage = `Error: Unable to get maximum id in card table: ${error}`;
        logger.error( errorMessage );
        return null;
    });

    return id[0][0]["MAX(CardID)"];
}

/**
 * Finds the record in the card table that matches the passed in id
 * If the id is not found in the table or an error occurs preventing the id
 * from being found in the table, null is returned. Otherwise, an object
 * representation of the record is returned. The database, connection and 
 * card table are initialized before the function is called.
 * @param {*} id The id of the record to find in the card table.
 * @returns The object representation of the corresponding record; Null otherwise.
 */
 async function findCardRecord( id ){
    const NOT_FOUND = null;

    try{
        const sqlQuery = `SELECT * FROM Card WHERE CardID = ${id}`;
        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            let errorMessage = `Unable to find card record due to error: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage ); 
        });   

        if(rows.length <= 0){
            let errorMessage = `Record with id ${id} does not exist in the card table: ${error}`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage ); 
        }

        logger.info( `Successfully retrieved card record with id '${id}'` );

        return rows[0];
    }
    catch( error ){
        logger.error( error );
        return NOT_FOUND;
    }
}

async function getCardsByOwner( username ){
    const NOT_FOUND = null;

    try{
        const sqlQuery = `SELECT * FROM Card WHERE CardOwner = '${username}'`;
        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            let errorMessage = `Unable to find card record due to error: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage ); 
        });   

        if( rows.length <= 0 ){
            let errorMessage = `Records for user with username ${username} does not found in the card table.`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage ); 
        }

        logger.info( `Successfully retrieved cards from user with username ${username}'` );

        return rows;
    }
    catch( error ){
        logger.error( error );
        return NOT_FOUND;
    }
}

async function getCardsForSale( ){
    const NOT_FOUND = null;

    try{
        const sqlQuery = `SELECT * FROM Card WHERE IsForSale = 1`;
        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            let errorMessage = `Unable to find card record due to error: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage ); 
        });   

        if( rows.length <= 0 ){
            let errorMessage = `No cards for sale were found.`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage ); 
        }

        logger.info( `Successfully retrieved cards for sale` );

        return rows;
    }
    catch( error ){
        logger.error( error );
        return NOT_FOUND;
    }
}

/**
 * /**
 * Updates an entry's values in the card table based on the
 * entry's id. In order for the record to be updated
 * successfully, the entry data must be valid.
 * Returns the object representation of the updated record.
 * The database, connection and card table are initialized before the function
 * is called.
 * @param {*} id 
 * @param {*} newCardName 
 * @param {*} newType 
 * @param {*} newDescription 
 * @param {*} newSerialNumber 
 * @param {*} newFrontImagePath 
 * @param {*} newBackImagePath 
 * @param {*} newIsForSale 
 * @param {*} newCardCondition 
 * @param {*} newCertificateImage 
 * @param {*} newCardPrice 
 * @param {*} newCardOwner 
 * @returns The object representation of the updated record.
 */
async function updateRowInCardTable( specifiedId, newCardName, newType, newDescription, newSerialNumber, newFrontImagePath, newBackImagePath, newIsForSale, newCardCondition, newCertificateImage, newCardPrice, newCardOwner ){
    //let sqlQuery = `SELECT Id FROM card WHERE name = '${name}'`;
    const NO_ENTRY_FOUND = null ;

    // ensure that all values are in correct database format
    newCardName = newCardName.toLowerCase();
    newType = newType.toLowerCase();
    newCardPrice = parseFloat( newCardPrice );
    

    try{
        let id = await findCardRecord( specifiedId );
        id = id.CardID;

        if ( id === NO_ENTRY_FOUND ){
            let errorMessage = `Entry in card table with id '${specifiedId}' not found`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }
        else if(!(await validator.isValid( newCardName, newDescription, newFrontImagePath, newBackImagePath, newType, newSerialNumber, newCardCondition, newCardPrice, newCardOwner, newCertificateImage, newIsForSale, connection ))){
            let errorMessage = 'New values to be inserted are invalid';
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }

        newIsForSale = newIsForSale == true ? 1 : 0;

        const sqlQuery = `UPDATE Card 
                          SET CardName = '${newCardName}', Type = '${newType}', 
                          Description = '${newDescription}', SerialNumber = '${newSerialNumber}',
                          FrontImagePath = '${newFrontImagePath}', BackImagePath = '${newBackImagePath}',
                          IsForSale = ${newIsForSale}, CardCondition = ${newCardCondition},
                          CertificateImage = '${newCertificateImage}', CardPrice = ${newCardPrice},
                          CardOwner = '${newCardOwner}'                        
                          WHERE CardID = ${id}`;

        await connection.execute( sqlQuery ).catch(( error ) => {  
            let errorMessage = `Unable to update entry in card table: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage );
        });

        logger.info( "Successfully updated record" );

        return await findCardRecord( id );
    }
    catch( error ){
        logger.error( error );
        throw error;
    }
}

/**
 * Deletes the row in the card table that matches the passed in id.
 * The database, connection and card table are initialized before the function
 * is called.
 * @param {*} id The id of the row to delete.
 * @returns True if the row was deleted successfully; False otherwise.
 */
 async function deleteRowFromCardTable( specifiedId ){
    const NO_ENTRY_FOUND = null;

    try{
        let id = await findCardRecord( specifiedId );

        if ( id === NO_ENTRY_FOUND ){
            let errorMessage = `Entry in card table with id '${specifiedId}' not found`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }

        const sqlQuery = `DELETE FROM Card WHERE CardID = ${id.CardID}`;

        await connection.execute( sqlQuery ).catch(( error ) => {  
            let errorMessage = `Unable to delete entry in card table: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage );
        });

        logger.info( `Successfully deleted record with id '${specifiedId}' from card table` );
        
        return true;
    }
    catch( error ){
        logger.error( error );
        throw error;
    }
}

module.exports = {
    createCardTable,
    dropCardTable,
    addCard, 
    readFromCardTable,
    findCardRecord,
    getCardsByOwner,
    getCardsForSale,
    updateRowInCardTable,
    deleteRowFromCardTable,
    UserInputError,
    SystemError
};