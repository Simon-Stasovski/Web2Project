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
async function createUserTable(connection) {
  try {
  dbconnection= connection;
  const sqlQuery = "CREATE TABLE IF NOT EXISTS users(id int AUTO_INCREMENT, username VARCHAR(25), password VARCHAR(25),email varchar(320),Balance DECIMAL(10,2),isprivate BOOL, PRIMARY KEY(id));";
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
async function getUser(username) {
  try{
    const sqlQuery = `SELECT username,email,Balance,isprivate from users WHERE username ='${username}';`;
    let user = await dbconnection
      .execute(sqlQuery)
      .then(logger.info("User was found"))
      .catch((error) => {
        throw new UserCannotBeFoundError;
      });
      console.log(user);
      return user[0][0];

  }
  catch ( error ){
   throw error;
  }
}
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
async function deleteUser(username, password) {
if (logInUser(username, password)) {
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
async function updateUserPassword(username,oldPassword, newPassword) {
  if (!validate.isValid(username, newPassword,newPassword,"test@test.test")) {
    throw new InvalidInputError();
  }
  else if(!logInUser(username, oldPassword)){
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
async function getUserBalance(username){
  try{
  const sqlQuery = `SELECT Balance from users WHERE username ='${username}';`;
  return await dbconnection
    .execute(sqlQuery)
    .then(logger.info("Balance was found"))
    .catch((error) => {
      throw new Error("Unable to get User balance");
    });
} catch (error) {
  logger.error("cannot find user balance");
  return null;
}

}

async function Updateprivacy(username,isPrivate) {
  if (!getUser(username)) {
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
/**
 *
 * @returns the eintire database
 */
async function printAllUsers() {
  const sqlQuery = "SELECT username,password from users ;";
  return await dbconnection
    .execute(sqlQuery)
    .then(logger.info("All Users."))
    .catch((error) => {
      throw new Error("Unable to print user data base");
    });
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
  printAllUsers,
  logInUser,
  getUserBalance,
  userTransaction,
  updateUserBalance,
  InvalidInputError,
  UserAlreadyExistsError,
  DBConnectionError,
};
