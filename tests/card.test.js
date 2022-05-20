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

// test( "Test Add Invalid Fabric Data", async () => {
//     let { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
//         CertificateImage, CardPrice, CardOwner } = generateCardData();
//     // let connection = model.getConnection();

//     Type = 'foo'; 
//     var connection = model.getConnection();
//     let result = await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
//         CertificateImage, CardPrice, CardOwner, connection );

//     let rows = await model.readFromFabricTable();
//     // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
//     // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

//     expect( result === false ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 0 );
// });


// test( "Test Add Fabric with Name that Already Exists", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();

//     await model.addFabric( name, type, pricePerYard, colour );

//     // try adding record with same name
//     let result = await model.addFabric( name, 'other', '23.99', '#000000' );

//     let rows = await model.readFromFabricTable();
 
//     expect( result === false ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 1 );
//     expect( rows[0].name === name ).toBe( true );
//     // all of the other records should be the same as the initial insertion
//     expect( rows[0].type === type ).toBe( true );
//     expect( rows[0].pricePerYard === pricePerYard ).toBe( true );
//     expect( rows[0].colour === colour ).toBe( true );
// });

// /**
//  * Tests that passing in the name of a valid record to the 
//  * findFabricRecord method works and returns the object
//  * representation of the corresponding row.
//  */
// test( "Test Successful Find Name in Fabric Table", async () => {
//     const NUMBER_OF_ROWS_TO_TEST = 3;
//     let rowsArray = [];
//     const SEARCH_INDEX = 1;

//     while( rowsArray.length < NUMBER_OF_ROWS_TO_TEST ){
//         let { name, type, pricePerYard, colour } = generateFabricData();
        
//         let result = await model.addFabric( name, type, pricePerYard, colour );

//         if( result ){
//             rowsArray.push( { name, type, pricePerYard, colour } );
//         }
//     }

//     let rowObject = await model.findFabricRecord( rowsArray[SEARCH_INDEX].name );
 
//     console.log( rowObject );
//     expect( Object.prototype.toString.call( rowObject ) === '[object Object]' ).toBe( true );
//     expect( rowObject.id === SEARCH_INDEX + 1 ).toBe( true );
//     expect( rowObject.name === rowsArray[SEARCH_INDEX].name ).toBe( true );
//     expect( rowObject.type === rowsArray[SEARCH_INDEX].type ).toBe( true );
//     expect( rowObject.pricePerYard === rowsArray[SEARCH_INDEX].pricePerYard ).toBe( true );
//     expect( rowObject.colour === rowsArray[SEARCH_INDEX].colour ).toBe( true );
// });

// /**
//  * Tests that passing in a name that does not exist the
//  * fabric table into the findFabricRecord function returns 
//  * null.
//  */
//  test( "Test Find Name in Fabric Table With Inexistent Name", async () => {
//     let rowObject = await model.findFabricRecord( 'foo' );
 
//     expect( rowObject === null ).toBe( true );
// });

// /**
//  * Tests that if an error occurs during the findFabricRecord method
//  * that prevents the record from being found, a null value is returned. 
//  */
// test( "Test Find Name in Fabric Table With Inexistent Name", async () => {
//     // causing an error to occur by dropping the fabric table 
//     const sqlQuery = "DROP TABLE IF EXISTS fabric";
//     let connection = model.getConnection();

//     await connection.execute( sqlQuery ).catch(( error ) => console.error( error ));

//     let rowObject = await model.findFabricRecord( 'foo' );
 
//     expect( rowObject === null ).toBe( true );
// });

// /**
//  * Tests that reading from the fabric table when it has no
//  * data returns an empty array.
//  */
// test( "Test Successful Read From Fabric Table No Data", async () => {
//     let rows = await model.readFromFabricTable();
 
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 0 );
// });

// /**
//  * Tests that reading the fabric table when it has multiple
//  * rows returns an array of rows with the correct amount of rows
//  * and with accurate data. 
//  */
// test( "Test Successful Read From Fabric Table Multiple Rows", async () => {
//     const NUMBER_OF_ROWS_TO_TEST = 3;
//     let rowsArray = [];

//     while( rowsArray.length < NUMBER_OF_ROWS_TO_TEST ){
//         let { name, type, pricePerYard, colour } = generateFabricData();
        
//         let result = await model.addFabric( name, type, pricePerYard, colour );

//         if( result ){
//             rowsArray.push( { name, type, pricePerYard, colour } );
//         }
//     }

//     // console.log( rowsArray ); 
    
//     let rows = await model.readFromFabricTable();
 
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( rowsArray.length );

//     for( let i = 0; i < rowsArray.length; i++ ){
//         expect( rows[i].name === rowsArray[i].name ).toBe( true );
//         expect( rows[i].type === rowsArray[i].type ).toBe( true );
//         expect( rows[i].pricePerYard === rowsArray[i].pricePerYard ).toBe( true );
//         expect( rows[i].colour === rowsArray[i].colour ).toBe( true );
//     }

// });

// /**
//  * Tests that trying to read from the fabric table when it doesn't 
//  * exist results in an empty array being returned. 
//  */
// test( "Test Read From Fabric Table After Table has Been Dropped", async () => {
//     const sqlQuery = "DROP TABLE IF EXISTS fabric";
//     let connection = model.getConnection();

//     await connection.execute( sqlQuery ).catch(( error ) => console.error( error ));

//     let rows = await model.readFromFabricTable();
 
//     console.log( rows );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 0 );
// });

// /**
//  * Tests that updating an entry by passing in an existing row name
//  * and updating that row with valid data works.
//  */
// test( "Test Successful Update Entry in Fabric Table", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();
//     // let connection = model.getConnection();

//     await model.addFabric( name, type, pricePerYard, colour );

//     const newName = 'New Fabric';
//     const newType = 'other';
//     const newPricePerYard = '23.99';
//     const newColour = '#000000';

//     let result = await model.updateRowInFabricTable( name, newName, newType, newPricePerYard, newColour );

//     let rows = await model.readFromFabricTable();
//     // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
//     // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

//     expect( result === true ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 1 );
//     expect( rows[0].name === newName.toLowerCase() ).toBe( true );
//     expect( rows[0].type === newType.toLowerCase() ).toBe( true );
//     expect( rows[0].pricePerYard === newPricePerYard ).toBe( true );
//     expect( rows[0].colour === newColour.toLowerCase() ).toBe( true );
// });

// /**
//  * Tests that trying to update a record with invalid data does not work.
//  */
// test( "Test Update Entry in Fabric Table with Invalid New Data", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();

//     await model.addFabric( name, type, pricePerYard, colour );

//     const newName = 'New!!!F4bric';
//     const newType = 'foo';
//     const newPricePerYard = '23.9999';
//     const newColour = '#000000';

//     let result = await model.updateRowInFabricTable( name, newName, newType, newPricePerYard, newColour );

//     let rows = await model.readFromFabricTable();
    
//     expect( result === false ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 1 );
//     expect( rows[0].name === name ).toBe( true );
//     expect( rows[0].type === type ).toBe( true );
//     expect( rows[0].pricePerYard === pricePerYard ).toBe( true );
//     expect( rows[0].colour === colour ).toBe( true );
// });

// /**
//  * Tests that trying to update a name with a name that already exists in the database
//  * does not work. Names must be unique so that only valid new name during an update
//  * is the current name that that record has or a name that is not yet in the table. 
//  */
// test( "Test Update Entry in Fabric Table with newName that Already Exists", async () => {
//     const { name, type, pricePerYard, colour } = generateFabricData();
//     const newName = 'New Fabric';
//     const newType = 'other';
//     const newPricePerYard = '23.99';
//     const newColour = '#000000';

//     await model.addFabric( name, type, pricePerYard, colour );
//     await model.addFabric( newName, "denim", '11.28', '#505e6b' );

//     let result = await model.updateRowInFabricTable( name, newName, newType, newPricePerYard, newColour );

//     let rows = await model.readFromFabricTable();
//     // const sqlQuery = "SELECT name, type, pricePerYard, colour FROM fabric";
//     // const [ rows, fields ] = await connection.execute( sqlQuery ); //.then( ( queryOutput ) => console.log( queryOutput ) ).catch( ( error ) => { console.error( error )})

//     expect( result === false ).toBe( true );

//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 2 );

//     expect( rows[0].name === name.toLowerCase() ).toBe( true ); // index 0 was target record
//     expect( rows[0].type === type.toLowerCase() ).toBe( true );
//     expect( rows[0].pricePerYard === pricePerYard ).toBe( true );
//     expect( rows[0].colour === colour.toLowerCase() ).toBe( true );

//     // just in case
//     expect( rows[1].name === newName.toLowerCase() ).toBe( true ); // index 0 was target record
//     expect( rows[1].type === 'denim' ).toBe( true );
//     expect( rows[1].pricePerYard === '11.28' ).toBe( true );
//     expect( rows[1].colour === '#505e6b' ).toBe( true );
// });

// /**
//  * Tests that trying to update a row that does not exist and 
//  * passing in a name that does not exist in the table does
//  * not work and does not alter the table.
//  */
// test( "Test Update Entry in Fabric Table with Invalid Search Name", async () => {
//     const SEARCH_NAME = 'New Fabric';

//     const newName = 'Updated Fabric Name';
//     const newType = 'other';
//     const newPricePerYard = '23.99';
//     const newColour = '#000000';

//     let result = await model.updateRowInFabricTable( SEARCH_NAME, newName, newType, newPricePerYard, newColour );

//     let rows = await model.readFromFabricTable();

//     expect( result === false ).toBe( true );
//     expect( Array.isArray( rows )).toBe( true );
//     expect( rows.length ).toBe( 0 );
// });

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