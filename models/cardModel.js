const mysql = require( 'mysql2/promise' );
const validator = require( './validateCard' );
const logger = require('../logger');
var connection;

/**
 * Initializes a database with the passed in filename. Initializes the connection
 * and creates the card table that will store different types of card, if it 
 * is not already created. The reset flag determines whether or not the card table 
 * should be cleared of its data or not (if the card table starts fresh or can keep
 * previous data that might be stored in it).
 * The name column is set to unique and not null because it will be the way users will 
 * be able to update and delete specific records.
 * @param {*} databaseFilename the name of the database being initialized.
 * @param {*} resetFlag the boolean flag that determines if the table should be reset. 
 * True if it should be reset; False otherwise.
 */
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
            await dropCardTable().catch( (error ) => { 
                error = `Issue with clearing card table: ${error}`;
                logger.error( error ); 
                throw( error );
            }); // have to throw here if not execution continues
            
            logger.info( 'card table reset.' );
        }
               
        await createCardTable().catch( (error) => {
            error = `Issue with creating card table: ${error}`;
            logger.error( error ); 
            throw( error );
        });
    }
    catch( error ){
        logger.error( `Error: Unable to initialize database: ${error}` );
    }
}

/**
 * Creates the card table if it does not already exist. If there is an issue 
 * with creating or loading a previous card table, the table is reset and then
 * created again. Only for use within the model.
 * A connection to the database is initialized before the function is called.
 */
async function createCardTable(){
    const sqlQuery =  'CREATE TABLE IF NOT EXISTS Card(CardID int AUTO_INCREMENT, CardName VARCHAR(50) NOT NULL, Type VARCHAR(50) NOT NULL,' +
     'Description VARCHAR(400), SerialNumber VARCHAR(50), FrontImagePath VARCHAR(150), BackImagePath VARCHAR(150), IsForSale BIT, CardCondition int, '
     'CertificateImage varchar(150), CardPrice DECIMAL(8, 2), CardOwner varchar(25), FOREIGN KEY (CardOwner) REFERENCES Username, PRIMARY KEY(CardID)';
    
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
 * Adds a new card entry to the card table with the passed in data.
 * Uses the isValid function to validate the passed in data. It also
 * converts the valid data into a certain styling format to ensure
 * consistency (ex: all names are lower case, all colour hex code begins with #).
 * Returns whether or not the card entry was added to the card table successfully.
 * The database, connection and card table are initialized before 
 * the function is called. 
 * @param {*} cardName The name of the card.
 * @param {*} type The type of knit of the card.
 * @param {*} description 
 * @param {*} serialNumber The serial number of the card to be added. 
 * @param {*} frontImagePath 
 * @param {*} backImagePath
 * @param {*} isForSale
 * @param {*} cardCondition
 * @param {*} certificateImage
 * @param {*} cardName
 * @param {*} cardOwner
 * @returns True if the card entry was added successfully; False otherwise.
 */
async function addCard( cardName, type, description, serialNumber, frontImagePath, backImagePath, isForSale, cardCondition, certificateImage, cardPrice, cardOwner){
    try{
        if( await validator.isValid( cardName, description, frontImagePath, backImagePath, type, serialNumber, cardCondition, cardPrice, cardOwner, certificateImage )){ 
            // add all the string values to lower case so they are inserted in lower case
            cardName = cardName.toLowerCase();
            type = type.toLowerCase();

            const sqlQuery =  `INSERT INTO card 
                                   VALUES ("${cardName}", "${type}", ${description}, "${serialNumber}", "${frontImagePath}", "${backImagePath}"), "${isForSale}", "${cardCondition}", "${certificateImage}", "${cardPrice}", "${cardOwner}"`;

                await connection.execute( sqlQuery ).catch(( error ) => { 
                    let errorMessage = `Unable to add data to card table: ${error}`;
                    logger.error( errorMessage );
                    throw new SystemError( errorMessage );
                });   

                logger.info( `card with name '${cardName}' added to table successfully`); 

                return { name: cardName, type: type, pricePerYard: pricePerYard, colour: colour };         
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
 * Checks if the passed in name matches the name of an existing
 * entry in the card table. Returns the entry's id if the name 
 * already exists in the card table. Returns null otherwise. A 
 * name must be unique because it is the public field that will 
 * be used to access a record for record updates and deletions. 
 * The database, connection and card table are initialized 
 * before the method is called. Only for use within the model.
 * @param {*} name The name to check for in the card table.
 * @returns The entry's id if the name already exists 
 * in the card table; Null otherwise.
 */
async function checkIfNameAlreadyInCardTable( name ){
    try{
        name = name.toLowerCase(); // ensures that search name is in correct format

        const sqlQuery = `SELECT Id FROM card WHERE name = "${name}"`;
        const NO_MATCHING_ROWS = 0;

        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            logger.error( error );
            throw new SystemError( error ) 
        });

        if( rows.length === NO_MATCHING_ROWS ){
            logger.info( `Name '${name}' not found in table` );
            return null;
        }
    
        logger.info( `Name '${name}' found in table` );
        return rows[0].Id;
    }
    catch( error ){
        // throws error so that the catch inside of the add method catches the error
        logger.error( error );
        throw error;
        // could also return true so that the data is not added to the database
    }
}

/**
 * Clears the contents of the current database's card table by
 * dropping the card table. Only for use within the model.
 * The database and connection are initialized before the function
 * is called.
 */
async function dropCardTable(){
    try{
        if ( connection === undefined ){
            throw( "Database or connection not initialized" );
        }
        else{
            const sqlQuery =  "DROP TABLE IF EXISTS card";

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
 * Gets the connection to the current database and returns it.
 * The database and connection are initialized before the
 * function is called.
 * @returns the connection to the database.
 */
function getConnection(){
    return connection;
}

/**
 * Finds the record in the card table that matches the passed in unique name.
 * If the name is not found in the table or an error occurs preventing the name
 * from being found in the table, null is returned. Otherwise, an object
 * representation of the record is returned. The database, connection and 
 * card table are initialized before the function is called.
 * @param {*} name The name of the record to find in the card table.
 * @returns The object representation of the corresponding record; Null otherwise.
 */
async function findCardRecord( name ){
    const NOT_FOUND = null;

    try{
        let id = await checkIfNameAlreadyInCardTable( name );

        if (id === NOT_FOUND ){
            let errorMessage = `Record with name '${name} not found in card table`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
            // return NOT_FOUND;
        }

        const sqlQuery = `SELECT * FROM card WHERE Id = ${id}`;
        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            let errorMessage = `Unable to find card record due to error: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage ); 
        });   

        logger.info( `Successfully retrieved card record with name '${name}'` );

        return rows[0];
    }
    catch( error ){
        logger.error( error );
        throw error;
        // return NOT_FOUND;
    }
}
/**
 * Reads the data from the card table and returns all of the 
 * rows in the table. The database, connection and card table
 * are initialized before the function is called. Returns an
 * empty array if there is an error while reading from the table.
 * @returns an array of all of the rows read from the card table.
 */
async function readFromcardTable(){
    const sqlQuery = "SELECT * FROM card";
    const EMPTY_ARRAY = [];

    let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => {  
        let errorMessage = `Error: Unable to read from card table: ${error}`;
        logger.error( errorMessage );
        throw new SystemError ( errorMessage );
    });
    
    return rows;
}

/**
 * Updates an entry's values in the card table based on the
 * entry's unique name. In order for the record to be updated
 * successfully, the new name must not already exist in the database
 * and the name and all the other entry data must be valid.
 * Returns true if the row is successfully updated; False otherwise.
 * Since the name field is set to unique in the table, selecting the 
 * row with the passed in name will either return 1 value (the Id of the 
 * corresponding row) or null (meaning that the name was not found in the database).
 * The database, connection and card table are initialized before the function
 * is called.
 * @param {*} name The unique name of the entry to update.
 * @param {*} newName The new name to update the record's name to. 
 * Must be unique or the record's current name.
 * @param {*} newType The new name to update the record's type to. 
 * @param {*} newType The new pricePerYard to update the record's pricePerYard to. 
 *  @param {*} newType The new hex colour to update the record's colour to. 
 * @returns True if entry is updated successfully; False otherwise.
 */
async function updateRowIncardTable( name, newName, newType, newPricePerYard, newColour ){
    //let sqlQuery = `SELECT Id FROM card WHERE name = '${name}'`;
    const NO_ENTRY_FOUND = null ;

    // ensure that all values are in correct database format
    name = name.toLowerCase();
    newName = newName.toLowerCase();
    newType = newType.toLowerCase();
    newPricePerYard = parseFloat( newPricePerYard );
    newColour = newColour.toLowerCase();
    newColour = newColour.charAt(0) === '#' ? newColour : `#${newColour}`;

    try{
        let id = await checkIfNameAlreadyInCardTable( name );

        if ( id === NO_ENTRY_FOUND ){
            let errorMessage = `Entry in card table with name '${name}' not found`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }
        else if( await !validator.isValid( newName, newType, newPricePerYard, newColour )){
            let errorMessage = 'New values to be inserted are invalid';
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }
        else if( await checkIfNameAlreadyInCardTable( newName ) !== null && newName !== name ){
            let errorMessage = `New name for record must be unique. The name '${newName}' already exists in the card table`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }

        const sqlQuery = `UPDATE card 
                          SET name = '${newName}', type = '${newType}', 
                          pricePerYard = ${newPricePerYard}, colour = '${newColour}'
                          WHERE Id = ${id}`;

        await connection.execute( sqlQuery ).catch(( error ) => {  
            let errorMessage = `Unable to update entry in card table: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage );
        });

        logger.info( "Successfully updated record" );

        return findCardRecord( newName );
    }
    catch( error ){
        logger.error( error );
        throw error;
    }
}

/**
 * Deletes the row in the card table that matches the passed in name.
 * The database, connection and card table are initialized before the function
 * is called.
 * @param {*} name The unique name of the row to delete.
 * @returns True if the row was deleted successfully; False otherwise.
 */
async function deleteRowFromcardTable( name ){
    const NO_ENTRY_FOUND = null;

    try{
        let id = await checkIfNameAlreadyInCardTable( name );

        if ( id === NO_ENTRY_FOUND ){
            let errorMessage = `Entry in card table with name '${name}' not found`;
            logger.error( errorMessage );
            throw new UserInputError( errorMessage );
        }

        const sqlQuery = `DELETE FROM card WHERE Id = ${id}`;

        await connection.execute( sqlQuery ).catch(( error ) => {  
            let errorMessage = `Unable to delete entry in card table: ${error}`;
            logger.error( errorMessage );
            throw new SystemError( errorMessage );
        });

        logger.info( `Successfully deleted record with name '${name}' from card table` );
        
        return true;
    }
    catch( error ){
        logger.error( error );
        throw error;
    }
}

/**
 * Builds and returns the formatted string representation of the 
 * card table entry whose fields are passed into the function.  
 * @param {*} name The name of the entry to format.
 * @param {*} type The type of the entry to format.
 * @param {*} pricePerYard The pricePerYard of the entry to format.
 * @param {*} colour The colour of the entry to format.
 * @returns The formatted string representation of the passed in entry fields.
 */
function getString( name, type, pricePerYard, colour ){
    return `{ name: '${name.toLowerCase()}', type: '${type.toLowerCase()}', \
pricePerYard: ${pricePerYard}, \
colour: '${colour.charAt(0) === '#' ? colour.toLowerCase() : '#' + colour.toLowerCase()}' }`;
}

/**
 * Builds and returns the formatted string representation of the 
 * card table entry object that is passed in.
 * @param {*} object The card table entry object to get the string 
 * representation of.
 * @returns The formatted string representation of the passed in object 
 * if it is not null; Null otherwise.
 */
function getStringFromObject( object ){
    return object !== null ? ( `{ id: ${object.id}, name: '${object.name.toLowerCase()}', \
type: '${object.type.toLowerCase()}', pricePerYard: ${object.pricePerYard}, \
colour: '${object.colour.charAt(0) === '#' ? object.colour.toLowerCase() : 
'#' + object.colour.toLowerCase()}' }` ) : null;
}

class SystemError extends Error{
    
}

class UserInputError extends Error{
    
}

module.exports = {
    initialize,
    addCard,
    dropCardTable,
    getConnection,
    findCardRecord,
    readFromcardTable,
    updateRowIncardTable,
    deleteRowFromcardTable,
    getString,
    getStringFromObject,
    SystemError,
    UserInputError
};