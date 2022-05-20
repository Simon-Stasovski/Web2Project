# Web2Project# 
Chris,Anna,Simon
Made By Chris

## Commands needed
docker run -p 10000:3306 --name cardoholicsContainer -e MYSQL_ROOT_PASSWORD=pass -e MYSQL_DATABASE=cardoholics_db -d mysql:5.7

docker container exec -it cardoholicsContainer bash
## non standard node modules
node-serialize
## How to use the website
Once You reach http://localhost:1339/ you will be prompted to log in, any attempt to reach other enpoints will result in the user being redirected to the login page.
Once the user logs in they will acces the full felged website where they can add their cards, and do transactions with other users, they can also make their cards private(for their collection) or decide to sell it

