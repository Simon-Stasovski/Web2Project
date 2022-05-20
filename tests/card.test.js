const model = require( '../models/databaseModel' );
const cardModel = require( '../models/cardModel' );
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
        const sqlQuery =  'INSERT INTO Users(Username, Email, Password, AccountBalance, IsPrivate) VALUES("joe123", "joe@joe.com", "joeMama123!!", 0.00, 1);';
    
        await connection.execute( sqlQuery ).catch(( error ) => { throw( error ); });  
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