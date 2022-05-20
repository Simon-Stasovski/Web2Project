const validator = require( 'validator' );
const VALID_CARD_TYPES = [ "pokemon", "yu-gi-oh", "hockey", "basketball", "baseball", "magic the gathering" ];
const logger = require( '../logger' );

/**
 * Validates the data to be entered into the card table. cardName and serialNumber must be between 0 and 50 characters in length.
 * description must be between 0 and 400 characters in length. frontImagePath, backImagePath and certificateImagePath 
 * must be between 0 and 150 characters in length. cardType must be one of the 6 specified valid card types. cardCondition
 * must be an integer value between 1 and 5. cardPrice must be a currency value. cardOwner must already exist in the user database
 * and the card price must be specified if isForSale is true.
 * @param {*} cardName 
 * @param {*} description 
 * @param {*} frontImagePath 
 * @param {*} backImagePath 
 * @param {*} cardType 
 * @param {*} serialNumber 
 * @param {*} cardCondition 
 * @param {*} cardPrice 
 * @param {*} cardOwner 
 * @param {*} certificateImage 
 * @param {*} isForSale 
 * @returns 
 */
async function isValid( cardName, description, frontImagePath, backImagePath, cardType, serialNumber, cardCondition, cardPrice, cardOwner, certificateImage, isForSale, connection ){

    if(isForSale && cardPrice == null){
        return false;
    }
    if (checkIfContainsSpecialCharacters(serialNumber) || !validator.isLength( `"${serialNumber}"`, { min:0, max: 50 } )){
        return false;
    }
    else if( cardPrice != null && !validator.isCurrency( `${cardPrice}`, { allow_negatives: false } )){
        return false;
    }
    else if(  cardName === '' || !validator.isLength( `"${cardName}"`, { min:1, max: 50 } ) ){
        return false;
    }
    else if( !validator.isLength( `"${description}"`, { min:0, max: 400 } ) ){
        return false;
    }
    else if( !validator.isLength( `"${frontImagePath}"`, { min:0, max: 150 } ) ){
        return false;
    }
    else if( !validator.isLength( `"${backImagePath}"`, { min:0, max: 150 } ) ){
        return false;
    }
    else if( !validator.isLength( `"${certificateImage}"`, { min:0, max: 150 } ) ){
        return false;
    }
    else if(!validateCardType( cardType )){
        return false;
    }
    else if(cardCondition < 1 || cardCondition > 5){
        return false;
    }
    
    const sqlQuery =  `SELECT * FROM users WHERE username="${cardOwner}"`;

    try{
        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            logger.error( error );
            throw error;
        });
    
        if(rows.length <= 0){
            return false;
        }

        return true;
    }
    catch(error){
        return false;
    }
}

// ask Chris about regex
function checkIfContainsSpecialCharacters( string ){

}

function validateCardType( cardType ){
    for( let i = 0; i < VALID_CARD_TYPES.length; i++ ){
        if (cardType.toLowerCase() === VALID_CARD_TYPES[i]){
            return true;
        }
    }

    return false;
}

module.exports = {
    isValid
 };

