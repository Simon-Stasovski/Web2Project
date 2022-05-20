//TODO
//refractor the User code to include:
    //Email *
    //Account balance (when creatingthe user)*
    //update for the Account ballance *
    //a bool to see if its private*
    //Update for the account balance(two users, the value, two bools)*?
    //reset password update*
    //update for IsPrivate(bool)*
//views:
    //login page
    //create account page at login page
    //MyAccount page where user can change password basic account info
    // tabs with all the diffrenct buttons for the other controllers
//User Sessions with cookies
// add the cookie implementations along side the Login of the user
const mysql = require("mysql2/promise");
const validate = require("./Validator/UserValidation");
const logger = require('../logger')
let dbconnection;

/**  Error for 400-level issues */
class InvalidInputError extends Error {}
class UserAlreadyExistsError extends Error{}
class UserCannotBeFoundError extends Error {}

/** Error for 500-level issues */
class DBConnectionError extends Error {}

//will drop the table if need be
async function dropUserTable(connection) {
  try{
    dbconnection= connection;
      const dropQuery = "DROP TABLE IF EXISTS users;";
      await connection.execute(dropQuery);
      logger.info("Table users dropped");

    // Create table if it doesn't exist

  } catch(error){
    logger.error(error.message);
    throw new DBConnectionError();
  } 
}


//will create the database table needed to store all the users account information

async function createUserTable(connection) {
  try {
  dbconnection= connection;
  const sqlQuery = "CREATE TABLE IF NOT EXISTS users(username VARCHAR(25), password VARCHAR(25),email varchar(320),Balance DECIMAL(10,2),isprivate BOOL, PRIMARY KEY(username));";
  await connection.execute(sqlQuery);
  console.info("Table users created/exists");
  }
  catch (error){
    //logger.error(error.message);
    throw new DBConnectionError();
  }

}

/**
 * Provides access to the connection object.  This should only be called by the unit test code.
 *   Note: This is not the best design since an external source can then close our connection,
 *          but permitting this for the special case of unit testing.
 *
 * @returns connection object
 */

function getConnection() {
  return dbconnection;
}
/**
 * will confirm that the users provided information and the information that is in database match to allow the user to log in
 * @param {*} username // the username for the account
 * @param {*} password  // the matching password of the account
 * @returns // true if user can log in, false if the information is incorect
 */
async function logInUser(username, password) {
  try{
    const sqlQuery = `SELECT password from users WHERE username ='${username}';`;
    let userpassword = await dbconnection
      .execute(sqlQuery)
      .then(logger.info("password was found"));
      if(password === userpassword[0][0].password){
        return true;
      }
      else {
        return false
      }
  }
  catch(error){
    throw error;
  }
}
/**
 * will get basic information about the user
 * @param {*} username // the username that the information will be retrived about
 * @returns // the said information
 */
async function getUser(username) {
  try{
    const sqlQuery = `SELECT username,email,Balance,isprivate from users WHERE username ='${username}';`;
    let user = await dbconnection
      .execute(sqlQuery)
      .then(logger.info("User was found"))
      .catch((error) => {
        throw new UserCannotBeFoundError;
      });
      return user[0][0];

  }
  catch ( error ){
   throw error;
  }
}
/**
 * Will add a new user to the database but not befor confirming their information is correct
 * @param {*} username // they new username must be unique to them
 * @param {*} password1 // their password assosiated with their account
 * @param {*} password2 // the confirmed password
 * @param {*} email //the users email that will be linked to their account
 * @returns 
 */
async function addUser(username, password1, password2,email) {
  if (!validate.isValid(username, password1, password2,email)){
    throw new InvalidInputError();
  }
  try{
      if(!await getUser(username)){
      const DEFAULTPRIVATE = true;
      const DEFAULTBALANCE = 0;
      const sqlQuery =
        `INSERT INTO users (username,password,email,Balance,isprivate) VALUES ('${username}','${password1}','${email}','${DEFAULTBALANCE}',${DEFAULTPRIVATE});`;
      await dbconnection
        .execute(sqlQuery)
        .then(logger.info("User added to database"))
        .catch((error) => {
          throw new Error("cannot add user to database");
        });
      
    return { Username: username, password: password1 };
    }
    else{
      throw new UserAlreadyExistsError;
    }
  }
  catch(error){
    throw error;
  }  
}
/**
 * Will permanently delete the users account after 1 confirming that they want to delete they account, validating they password to  make sure it is them that want to delete it
 * @param {*} username // the username of the account that needs to be deleted
 * @param {*} password // the password of the same account to confirm
 * @returns 
 */
async function deleteUser(username, password) {
if (await logInUser(username, password)) {
    const sqlQuery = `DELETE FROM users WHERE username ='${username}';`;
    return await dbconnection
      .execute(sqlQuery)
      .then(logger.info("User deleted"))
      .catch((error) => {
        throw new Error("cannot delete user from database");
      });
  } else {
    throw new Error("User Not found");
  }
}
/**
 *  this will allow the user to add money to they account
 * @param {*} username // the username of the account that money will be added to
 * @param {*} addedbalance // the amout that will be added to the balance
 * @returns 
 */
async function updateUserBalance(username,addedbalance){
  let userBalance = await getUserBalance(username);
  let userBalancePostparse =userBalance[0][0].Balance;
  userBalancePostparse = parseFloat(userBalancePostparse);
  userBalancePostparse += addedbalance;
  const sqlQuery =`UPDATE users SET Balance = '${userBalancePostparse}' WHERE username = '${username}';`;
  await dbconnection
  .execute(sqlQuery)
  .then(logger.info("User's Balance updated successfully"))
  .catch((error) => {
    throw new Error("Unable to update User's Balance");
  });
  return true;
}
/**
 *  it wil adjust the balances of the users per the price of the item that they are selling
 * @param {*} originlaOwnerUsername //username of the seller of the card
 * @param {*} newOwnerUsername //username of the buyer
 * @param {*} price // the price of the item the transaction will be based on
 * @returns 
 */
async function userTransaction(originlaOwnerUsername,newOwnerUsername,price) {
  if (!getUser(originlaOwnerUsername)&&!getUser(newOwnerUsername)) {
    throw new InvalidInputError();
  } else {
    let balanceOwner = await getUserBalance(originlaOwnerUsername);
    let balanceNewOwner = await getUserBalance(newOwnerUsername);
    balanceNewOwner -= price;
    balanceOwner += price;
    const sqlQuery1 =`UPDATE users SET Balance = ${balanceOwner} WHERE username = ${originlaOwnerUsername};`;
    const sqlQuery2 =`UPDATE users SET Balance = ${balanceNewOwner} WHERE username = ${newOwnerUsername};`;
    await dbconnection
      .execute(sqlQuery1)
      .then(logger.info("User's balance updated successfully"))
      .catch((error) => {
        throw new Error("Unable to update User's balance");
      });
      await dbconnection
      .execute(sqlQuery2)
      .then(logger.info("User's password updated successfully"))
      .catch((error) => {
        throw new Error("Unable to update User's password");
      });
      return true;
  }
}
/**
 * will update the password of the user, will authenticate the user then update the password with the confirmed new password
 * @param {*} username //user name of the account
 * @param {*} oldPassword // the old password of the user
 * @param {*} newPassword  // the new password of the user
 * @returns 
 */
async function updateUserPassword(username,oldPassword, newPassword) {
  if (!validate.isValid(username, newPassword,newPassword,"test@test.test")) { // must include an email
    throw new InvalidInputError();
  }
  else if(!await logInUser(username, oldPassword)){
    throw new InvalidInputError();
  } 
  else {
    const sqlQuery =`UPDATE users SET password = '${newPassword}' WHERE username = '${username}';`;
    return await dbconnection
      .execute(sqlQuery)
      .then(logger.info("User's password updated successfully"))
      .catch((error) => {
        throw new Error("Unable to update User's password");
      });
  }
}
/**
 * will retrive the balance of the user from the database
 * @param {*} username // the username of the user
 * @returns // the balance of the user
 */
async function getUserBalance(username){
  try{
  const sqlQuery = `SELECT Balance from users WHERE username ='${username}';`;
  let balance = await dbconnection
    .execute(sqlQuery)
    .then(logger.info("Balance was found"))
    .catch((error) => {
      throw new Error("Unable to get User balance");
    });
    return balance[0][0].Balance;
} catch (error) {
  logger.error("cannot find user balance");
  return null;
}
}
/**
 *  Sets the balance of the user 
 * @param {*} username // the username of the user
 * @param {*} newBalance the new balance to be set
 */
 async function setUserBalance(username, newBalance){
  try{
  const sqlQuery = `UPDATE users SET Balance = ${newBalance} WHERE username = '${username}'`;
  await dbconnection
    .execute(sqlQuery)
    .then(logger.info(""))
    .catch((error) => {
      throw new Error("");
    });
} catch (error) {
  logger.error("");
  null;
}

}
/**
 * will change the privacy of the user from private to public or vise versa
 * @param {*} username // the username of the user that needed its privacy setting changed
 * @param {*} isPrivate // the state that user wants its privacy setting to be
 * @returns 
 */
async function Updateprivacy(username,isPrivate) {
  if (!await getUser(username)) {
    throw new InvalidInputError();
  } else {
    const sqlQuery =`UPDATE users SET isprivate = '${isPrivate}' WHERE username = '${username}';`;
    return await dbconnection
      .execute(sqlQuery)
      .then(logger.info("User's privacy setting updated successfully"))
      .catch((error) => {
        throw new Error("Unable to update User's privacy setting");
      });
  }

}

module.exports = {
  createUserTable,
  dropUserTable,
  addUser,
  deleteUser,
  updateUserPassword,
  getConnection,
  getUser,
  Updateprivacy,
  logInUser,
  getUserBalance,
  userTransaction,
  updateUserBalance,
  setUserBalance,
  InvalidInputError,
  UserAlreadyExistsError,
  DBConnectionError,
};
