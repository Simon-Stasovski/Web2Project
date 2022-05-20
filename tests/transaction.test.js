const model = require( '../models/databaseModel' );
const cardModel = require( '../models/cardModel' );
const userModel = require( '../models/userModel' );
const transactionModel = require( '../models/transactionModel' );
const { P } = require('pino');
const DB = 'cardoholics_test_db';
var connection;

const CARD_DATA = [ { 
                    CardID: 1,
                    BackImagePath: 'https://tse1.mm.bing.net/th?4',
                    CardCondition: 2,
                    CardName:'charmander',
                    CardOwner:'user1',
                    CardPrice:'0.00',
                    CertificateImage: 'https://tse1.mm.bing.net/th?4',
                    Description:'2008 Edition',
                    FrontImagePath: 'https://tse1.mm.bing.net/th?4',
                    IsForSale: true,
                    SerialNumber:'1B65680B',
                    Type:'pokemon'
                },
                {   
                    CardID: 2,
                    BackImagePath: 'https://tse1.mm.bing.net/th?4',
                    CardCondition: 1,
                    CardName:'poliwag',
                    CardOwner:'user1',
                    CardPrice:'1.00',
                    CertificateImage: 'https://tse1.mm.bing.net/th?4',
                    Description:'2014 Edition',
                    FrontImagePath: 'https://tse1.mm.bing.net/th?4',
                    IsForSale: true,
                    SerialNumber:'1AX5UHN',
                    Type:'pokemon'
                    },
                    {
                    CardID: 3, 
                    BackImagePath: 'https://tse1.mm.bing.net/th?4',
                    CardCondition: 4,
                    CardName:'mr mime',
                    CardOwner:'user1',
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

const TRANSACTION_DATA = [
    {
        Price: 100,
        CardID: 3, 
        OriginalOwner: "user1", 
        NewOwner: "user2",
        TransactionDate: "2022-01-01"
    },
    {
        Price: 300,
        CardID: 2, 
        OriginalOwner: "user1", 
        NewOwner: "user2",
        TransactionDate: "2022-05-10"
    },
    {
        Price: 50,
        CardID: 1, 
        OriginalOwner: "user1", 
        NewOwner: "user2",
        TransactionDate: "2022-03-14"
    },
    
]
const generateTransactionData = () => {
    const index = Math.floor((Math.random() * TRANSACTION_DATA.length));
    return TRANSACTION_DATA.slice(index, index + 1)[0];
}

beforeEach( async () => {
    try{
        await model.initialize( DB, true );
        connection = model.getConnection();

        await cardModel.Add( card)
        await userModel.addUser( "user1", "user2"); 
        
        for(let i = 0; i < CARD_DATA.length; i++){
            const { CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
                CertificateImage, CardPrice, CardOwner } = generateCardData();
        
            await cardModel.addCard( CardName, Type, Description, SerialNumber, FrontImagePath, BackImagePath, IsForSale, CardCondition, 
                CertificateImage, CardPrice, CardOwner, connection );
        }

    }
    catch( error ){}
});

afterEach( async () => {
    connection = model.getConnection();

    if ( connection ){
        await connection.end();
    }
});

test( "Test Successful Add Transaction", async () => {

    transactionModel.setConnection(connection);
    const card = generateCardData();
    const buyer = 'user2';

    let result = await transactionModel.createTransaction(card, buyer);

    expect(result[0] == 1).toBe(true);

});

test( "Update Transaction Success", async () => {

    transactionModel.setConnection(connection);
    const card = generateCardData();
    const buyer = 'user2';
    const newDate = '2050-01-01';
    let id = await transactionModel.createTransaction(card, buyer);

    let result = await transactionModel.UpdateDate(id[0], newDate)

    expect(result).toBe(true);

});

test( "Delete Transaction Success", async () => {

    transactionModel.setConnection(connection);
    const card = generateCardData();
    const buyer = 'user2';
    let id = await transactionModel.createTransaction(card, buyer);

    let result = await transactionModel.DeleteTransaction(id[0])

    expect(result).toBe(true);

});
