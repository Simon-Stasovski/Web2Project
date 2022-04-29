const validator = require( 'validator' );
const VALID_CARD_TYPES = [ "pokemon", "yu-gi-oh", "hockey", "basketball" ];

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
function isValid( name, type, pricePerYard, colour ){
    if ( !(validator.isAlpha( name, 'en-US', { ignore: " -" } )) || !validator.isLength( name, { min:0, max: 50 } )){
        return false;
    }
    else if( !validator.isCurrency( `${pricePerYard}`, { allow_negatives: false } )){
        return false;
    }
    else if( !validator.isHexColor( colour )){
        return false;
    }

    for( let i = 0; i < VALID_CARD_TYPES.length; i++ ){
        if (type.toLowerCase() === VALID_CARD_TYPES[i]){
            return true;
        }
    }

    return false;
}

module.exports = {
    isValid
 };

