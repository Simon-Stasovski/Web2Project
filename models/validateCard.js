const validator = require( 'validator' );
const VALID_CARD_TYPES = [ "pokemon", "yu-gi-oh", "hockey", "basketball", "baseball", "magic the gathering" ];

/**
 * Validates the fabric data that will be inserted into the database.
 * Name can only be made up of letters and at most 50 characters long, 
 * the type must be one of the valid fabric types above, the price per 
 * yard must be a money value with only 2 decimals and the colour must 
 * be a valid hexadecimal colour value.
 * @param {*} name The name of the fabric 
 * @param {*} type The type of knit of the fabric
 * @param {*} pricePerYard The price of the fabric per yard
 * @param {*} colour The hexadecimal value of the fabric's colour
 */
async function isValid( cardName, description, frontImagePath, backImagePath, cardType, serialNumber, cardCondition, cardPrice, cardOwner, certificateImage, isForSale ){
    if(isForSale && cardPrice == null){
        return false;
    }
    if (checkIfContainsSpecialCharacters(serialNumber) || !validator.isLength( serialNumber, { min:0, max: 50 } )){
        return false;
    }
    else if( cardCondition != null && !validator.isCurrency( `${cardPrice}`, { allow_negatives: false } )){
        return false;
    }
    else if( !validator.isLength( cardName, { min:0, max: 50 } ) ){
        return false;
    }
    else if( !validator.isLength( description, { min:0, max: 400 } ) ){
        return false;
    }
    else if( !validator.isLength( frontImagePath, { min:0, max: 150 } ) ){
        return false;
    }
    else if( !validator.isLength( backImagePath, { min:0, max: 150 } ) ){
        return false;
    }
    else if( !validator.isLength( certificateImage, { min:0, max: 150 } ) ){
        return false;
    }
    else if(!validateCardType( cardType )){
        return false;
    }
    else if(cardCondition < 1 || cardCondition > 5){
        return false;
    }
    
    const sqlQuery =  `SELECT * FROM USERS WHERE username=${cardOwner}`;

    try{
        let [rows, fields] = await connection.execute( sqlQuery ).catch(( error ) => { 
            logger.error( error );
            throw new SystemError( error ) 
        });
    
        if(rows.length >= 0){
            return false;
        }
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

