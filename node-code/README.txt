You will find this code at -> https://github.com/kddfam
You can also mail me at -> kdd.family.003@gmail.com

This is the documentation file of node code for authentication.
Packages used ->
1) mongoose for mongodb queries,
2) pg for postgres queries,
3) express for network calls,
4) jsonwebtoken for authentication token,
5) chalk for interactive console registeries,
6) debug for debugging specific registeries,
7) winston for logging error logs in mongo database,
8) hapi/joi for checking input data is of proper data type,
9) winston-mongodb for logging error directly into mongodb,
10) config for getting user's custom configration,
11) bcrypt for encrypting password before storing it into the database using SHA-256 encryption

How to install package : 
>> npm i "package_name"

How to run the application : 
>> set debug = success,failed
>> set port = "port of your choice"
>> set pg_user = "your postgres username"
>> set pg_password = "your postgres password"
>> set pg_database = "your database name"
Note : Please Create tablename = users because query is using this. 

Using all the above packages/modules, this authetication node application is built.
