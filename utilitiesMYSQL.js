const mysql = require( 'mysql2/promise' );

/**
 * Executes the given sql command and returns the results
 * @param {String} command is the sql command to execute
 * @param {String} database is the database to execute the command on
 * @returns the results of the command
 */
 async function executeCommand(command, connection) {
    try {
      let response = await connection
        .cexecute(command)
        .then(console.log('Command ${command} executed'))
        .catch((error) => {
          throw new DatabaseReadWriteError(error);
        });
  
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  class DatabaseReadWriteError extends Error {}
  
  module.exports = {
    executeCommand,
  };
  