    |+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|   
    |   You will find this code at -> https://github.com/kddfam     |
    |   You can also mail me at -> kdd.family.003@gmail.com         |
    |+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++|

This is the documentation file of node code for authentication.
Packages used ->
1) mongoose for mongodb queries,
2) pg for postgres queries,
3) express for network calls,
4) jsonwebtoken for authentication token,
5) chalk for interactive console registeries,
6) debug for debugging specific registeries,
7) winston for logging error logs in mongo database,
8) @hapi/joi for checking input data is of proper data type,
9) winston-mongodb for logging error directly into mongodb,
10) config for getting user's custom configration,
11) bcrypt for encrypting password before storing it into the database using HS-256 encryption,
12) random-number for generating opt and other required random numbers,

Using all the above packages/modules, this authetication node application is built.

How to run the application ->
>> set debug=success,failed
>> set pg_user="your postgres username"
>> set pg_password="your postgres password"
>> set pg_database="your database name"
>> set jwtKey="your jsonwebtoken key"
>> set port="port of your choice"
>> node authentication.js

Note : You should run all of the above mentioned on terminal and before running the application, you have to install
       all the packages.

How to install a package ->
>> npm install "package_name" (example == npm install mongoose)

Thanks for visiting my repository.
