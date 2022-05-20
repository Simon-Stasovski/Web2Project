const model = require( '../models/databaseModel' );
const cardModel = require( '../models/cardModel' );
const userModel = require( '../models/userModel' );
const DB = 'cardoholics_test_db';

const CARD_DATA = [ { BackImagePath: 'https://tse1.mm.bing.net/th?4',
                      CardCondition: 2,
                      CardName:'charmander',
                      CardOwner:'joe123',
                      CardPrice:'0.00',
                      CertificateImage: 'https://tse1.mm.bing.net/th?4',
                      Description:'2008 Edition',
                      FrontImagePath: 'https://tse1.mm.bing.net/th?4',
                      IsForSale: true,
                      SerialNumber:'1B65680B',
                      Type:'pokemon'
                    },
                    { BackImagePath: 'https://tse1.mm.bing.net/th?4',
                      CardCondition: 1,
                      CardName:'poliwag',
                      CardOwner:'joe123',
                      CardPrice:'1.00',
                      CertificateImage: 'https://tse1.mm.bing.net/th?4',
                      Description:'2014 Edition',
                      FrontImagePath: 'https://tse1.mm.bing.net/th?4',
                      IsForSale: true,
                      SerialNumber:'1AX5UHN',
                      Type:'pokemon'
                    },
                    { BackImagePath: 'https://tse1.mm.bing.net/th?4',
                    CardCondition: 4,
                    CardName:'mr mime',
                    CardOwner:'joe123',
                    CardPrice:'14.00',
                    CertificateImage: 'https://tse1.mm.bing.net/th?',
                    Description:'1999 Edition',
                    FrontImagePath: 'https://tse1.mm.bing.net/th?',
                    IsForSale: true,
                    SerialNumber:'2LMNOP90',
                    Type:'pokemon'
                  }
                ];

const generateCardData = () => {
    const index = Math.floor((Math.random() * CARD_DATA.length));
    return CARD_DATA.slice(index, index + 1)[0];
}

beforeEach( async () => {
    try{
        await model.initialize( DB, true );
        await userModel.addUser( "joe123", "joeMama123!!", "joeMama123!!", "joe@joe.com" ); 
    }
    catch( error ){}
});

afterEach( async () => {
    connection = model.getConnection();

    if ( connection ){
        await connection.end();
    }
});

test( "Test Successful Add Card", async () => {
    const { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner } = generateCardData();
    // let connection = model.getConnection();

    var connection = model.getConnection();
    let result = await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner, connection );

    let rows = await cardModel.readFromCardTable();
   
    expect( rows[0].CardName === CardName ).toBe( true );
    expect( rows[0].Type === Type ).toBe( true );
    expect( rows[0].Description === Description ).toBe( true );
    expect( rows[0].SerialNumber === SerialNumber ).toBe( true );
    expect( rows[0].FrontImagePath === FrontImagePath ).toBe( true );
    expect( rows[0].BackImagePath === BackImagePath ).toBe( true );

    rows[0].IsForSale = rows[0].IsForSale == 1 ? true : false;
    expect( rows[0].IsForSale === IsForSale ).toBe( true );
    expect( rows[0].CardCondition === CardCondition ).toBe( true );
    expect( rows[0].CertificateImage === CertificateImage ).toBe( true );
    expect( rows[0].CardPrice === CardPrice ).toBe( true );
    expect( rows[0].CardOwner === CardOwner ).toBe( true );
});

test( "Test Add Invalid Card Data", async () => {
    let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner } = generateCardData();
    // let connection = model.getConnection();

    Type = 'foo'; 
    var connection = model.getConnection();
    let result = await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner, connection );

    let rows = await model.readFromCardTable();
    // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
    // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

    expect( result === false ).toBe( true );
    expect( rows.length ).toBe( 0 );
});


test( "Test Successful Find Id in Card Table", async () => {
    const NUMBER_OF_ROWS_TO_TEST = 3;
    let rowsArray = [];
    const SEARCH_INDEX = 1;

    while( rowsArray.length < NUMBER_OF_ROWS_TO_TEST ){
        let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
            CertificateImage, CardPrice, CardOwner } = generateCardData();
        
            let result = await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
                CertificateImage, CardPrice, CardOwner, connection );

        if( result ){
            rowsArray.push( { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
                CertificateImage, CardPrice, CardOwner, connection } );
        }
    }

    let rowObject = await cardModel.findCardRecord( rowsArray[SEARCH_INDEX].CardID );
 
    console.log( rowObject );
    expect( Object.prototype.toString.call( rowObject ) === '[object Object]' ).toBe( true );
    expect( rowObject.CardName === rowsArray[SEARCH_INDEX].CardName ).toBe( true );
    expect( rowObject.Type === rowsArray[SEARCH_INDEX].Type ).toBe( true );
    expect( rowObject.Description === rowsArray[SEARCH_INDEX].Description ).toBe( true );
    expect( rowObject.SerialNumber === rowsArray[SEARCH_INDEX].SerialNumber ).toBe( true );
    expect( rowObject.FrontImagePath === rowsArray[SEARCH_INDEX].FrontImagePath ).toBe( true );
    expect( rowObject.BackImagePath === rowsArray[SEARCH_INDEX].BackImagePath ).toBe( true );
    expect( rowObject.IsForSale === rowsArray[SEARCH_INDEX].IsForSale ).toBe( true );
    expect( rowObject.CardCondition === rowsArray[SEARCH_INDEX].CardCondition ).toBe( true );
    expect( rowObject.CertificateImage === rowsArray[SEARCH_INDEX].CertificateImage ).toBe( true );
    expect( rowObject.CardPrice === rowsArray[SEARCH_INDEX].CardPrice ).toBe( true );
    expect( rowObject.CardOwner === rowsArray[SEARCH_INDEX].CardOwner ).toBe( true );
});


test( "Test Find Id in Card Table With Inexistent ID", async () => {
    // causing an error to occur by dropping the fabric table 
    const sqlQuery = "DROP TABLE IF EXISTS Card";
    let connection = model.getConnection();

    await connection.execute( sqlQuery ).catch(( error ) => console.error( error ));

    let rowObject = await cardModel.findCardRecord( 1 );
 
    expect( rowObject === null ).toBe( true );
});


test( "Test Successful Read From Card Table No Data", async () => {
    let rows = await cardModel.readFromCardTable();
 
    expect( Array.isArray( rows )).toBe( true );
    expect( rows.length ).toBe( 0 );
});


test( "Test Successful Read From Card Table User Joe", async () => {
    let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner } = generateCardData();

    let result = await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
            CertificateImage, CardPrice, CardOwner, connection );

    cards = cardModel.getCardsByOwner( 'joe123' );

    expect( cards[0].CardName === CardName ).toBe( true );
    expect( cards[0].Type === Type ).toBe( true );
    expect( cards[0].Description === Description ).toBe( true );
    expect( cards[0].SerialNumber === SerialNumber ).toBe( true );
    expect( cards[0].FrontImagePath === FrontImagePath ).toBe( true );
    expect( cards[0].BackImagePath === BackImagePath ).toBe( true );

    cards[0].IsForSale = rows[0].IsForSale == 1 ? true : false;
    expect( cards[0].IsForSale === IsForSale ).toBe( true );
    expect( cards[0].CardCondition === CardCondition ).toBe( true );
    expect( cards[0].CertificateImage === CertificateImage ).toBe( true );
    expect( cards[0].CardPrice === CardPrice ).toBe( true );
    expect( cards[0].CardOwner === CardOwner ).toBe( true );
});

test( "Test Successful Read From Card Table Cards For Sale", async () => {
    let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner } = generateCardData();

    IsForSale = true;
    let result = await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
            CertificateImage, CardPrice, CardOwner, connection );

    cards = cardModel.getCardsForSale();

    expect( cards[0].CardName === CardName ).toBe( true );
    expect( cards[0].Type === Type ).toBe( true );
    expect( cards[0].Description === Description ).toBe( true );
    expect( cards[0].SerialNumber === SerialNumber ).toBe( true );
    expect( cards[0].FrontImagePath === FrontImagePath ).toBe( true );
    expect( cards[0].BackImagePath === BackImagePath ).toBe( true );

    cards[0].IsForSale = rows[0].IsForSale == 1 ? true : false;
    expect( cards[0].IsForSale === IsForSale ).toBe( true );
    expect( cards[0].CardCondition === CardCondition ).toBe( true );
    expect( cards[0].CertificateImage === CertificateImage ).toBe( true );
    expect( cards[0].CardPrice === CardPrice ).toBe( true );
    expect( cards[0].CardOwner === CardOwner ).toBe( true );
});



test( "Test Read From Card Table After Table has Been Dropped", async () => {
    const sqlQuery = "DROP TABLE IF EXISTS Card";
    let connection = model.getConnection();

    await connection.execute( sqlQuery ).catch(( error ) => console.error( error ));

    let rows = await cardModel.readFromCardTable();
 
    console.log( rows );
    expect( Array.isArray( rows )).toBe( true );
    expect( rows.length ).toBe( 0 );
});


test( "Test Successful Update Entry in Card Table", async () => {
    let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner } = generateCardData();

    await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
            CertificateImage, CardPrice, CardOwner, connection );
    // let connection = model.getConnection();

    const newName = 'Eevee';
    const newType = 'Pokemon';
    const newDescription = 'foo';
    const newSerialNumber = '000000';
    const newFrontImagePath = '';
    const newBackImagePath = '';
    const newIsForSale = false;
    const newCardCondition = 1;
    const newCertificateImage = '';
    const newCardPrice = 1.88;
    const newOwner = 'joe123'


    let result = await cardModel.updateRowInCardTable( 1, newName, newType, newDescription, newSerialNumber, newFrontImagePath, newBackImagePath, newIsForSale, newCardCondition, newCertificateImage, newCardPrice, newOwner  );

    let rows = await cardModel.readFromCardTable();

    expect( result === true ).toBe( true );
    expect( Array.isArray( rows )).toBe( true );
    expect( rows.length ).toBe( 1 );
    expect( rows[0].CardName === newName.toLowerCase() ).toBe( true );
    expect( rows[0].Type === newType.toLowerCase() ).toBe( true );
    expect( rows[0].Description === newDescription ).toBe( true );
    expect( rows[0].SerialNumber === newSerialNumber.toLowerCase() ).toBe( true );
    expect( rows[0].FrontImagePath === newFrontImagePath.toLowerCase() ).toBe( true );
    expect( rows[0].BackImagePath === newBackImagePath.toLowerCase() ).toBe( true );

    rows[0].IsForSale = rows[0].IsForSale == 1 ? true : false;
    expect( rows[0].IsForSale === newIsForSale.toLowerCase() ).toBe( true );
    expect( rows[0].CardCondition === newCardCondition.toLowerCase() ).toBe( true );
    expect( rows[0].CertificateImage === newCertificateImage.toLowerCase() ).toBe( true );
    expect( rows[0].CardPrice === newCardPrice.toLowerCase() ).toBe( true );
    expect( rows[0].CardOwner === newOwner.toLowerCase() ).toBe( true );
});


test( "Test Update Entry in Fabric Table with Invalid New Data", async () => {
    let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner } = generateCardData();

    await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
            CertificateImage, CardPrice, CardOwner, connection );

    const newType = 'foo';


    let result = await cardModel.updateRowInCardTable( 1, CardName, newType, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
        CertificateImage, CardPrice, CardOwner, connection  );

    let rows = await cardModel.readFromCardTable();
    
    expect( result === false ).toBe( true );
    expect( Array.isArray( rows )).toBe( true );
    expect( rows.length ).toBe( 1 );
    expect( rows[0].Type === Type ).toBe( true );
    expect( rows[0].Type !== newType ).toBe( true );
});


// /**
//  * Tests that deleting a row by passing in its unique name
//  * to the delete method successfully deletes the row.
//  */
// test( "Test Successful Delete Row From Fabric Table", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();
//     // let connection = model.getConnection();

//     await model.addFabric( name, type, pricePerYard, colour );

//     // DO WE TEST THAT ADD WORKS HERE?
//     // let rows = await model.readFromFabricTable();

//     // expect( Array.isArray( rows )).toBe( true );
//     // expect( rows.length ).toBe( 1 );
//     // expect( rows[0].name === name ).toBe( true );
//     // expect( rows[0].type === type ).toBe( true );
//     // expect( rows[0].pricePerYard === pricePerYard ).toBe( true );
//     // expect( rows[0].colour === colour ).toBe( true );

//     let result = await model.deleteRowFromFabricTable( name );
//     rows = await model.readFromFabricTable();
//     // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
//     // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

//     expect( result === true ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 0 );
// });

// /**
//  * Tests that passing in a rows unique name to the delete method
//  * successfully deletes the row even if it is not in the correct format (lower case)
//  */
// test( "Test Successful Delete Row From Fabric Table With Different Name Format", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();
//     // let connection = model.getConnection();

//     await model.addFabric( name, type, pricePerYard, colour );

//     // // DO WE TEST THAT ADD WORKS HERE?
//     // let rows = await model.readFromFabricTable();

//     // expect( Array.isArray( rows )).toBe( true );
//     // expect( rows.length ).toBe( 1 );
//     // expect( rows[0].name === name ).toBe( true );
//     // expect( rows[0].type === type ).toBe( true );
//     // expect( rows[0].pricePerYard === pricePerYard ).toBe( true );
//     // expect( rows[0].colour === colour ).toBe( true );

//     let result = await model.deleteRowFromFabricTable( name.toUpperCase() );
//     rows = await model.readFromFabricTable();
//     // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
//     // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

//     expect( result === true ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 0 );
// });

// /**
//  * Tests that passing in an invalid row name (that does
//  * not exist in the table) to the delete method does not
//  * work and the table remains unchanged.
//  */
// test( "Test Delete Row From Fabric Table with Invalid Name", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();
//     // let connection = model.getConnection();

//     await model.addFabric( name, type, pricePerYard, colour );

//     // DO WE TEST THAT ADD WORKS HERE?
//     // let rows = await model.readFromFabricTable();

//     // expect( Array.isArray( rows )).toBe( true );
//     // expect( rows.length ).toBe( 1 );
//     // expect( rows[0].name === name ).toBe( true );
//     // expect( rows[0].type === type ).toBe( true );
//     // expect( rows[0].pricePerYard === pricePerYard ).toBe( true );
//     // expect( rows[0].colour === colour ).toBe( true );

//     let result = await model.deleteRowFromFabricTable( 'Foo' );
//     rows = await model.readFromFabricTable();
//     // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
//     // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

//     expect( result === false ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 1 );
//     expect( rows[0].name === name ).toBe( true );
// });