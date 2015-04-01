#Setting up the Database for the Geophoto application, including the indexes

USERNAME="admin" #update if required
PASSWORD="admin" #update if required
echo 'Setting up the application server and the databases - '
curl --digest --user $USERNAME:$PASSWORD -X POST -d@"01-rest-instance-config.json" -i -H "Content-type:application/json" http://localhost:8002/v1/rest-apis

echo 'Setting up the indexes - '
curl --anyauth --user $USERNAME:$PASSWORD -X PUT -d@"02-database-config.json" -i -H "Content-type: application/json" http://localhost:8002/manage/v2/databases/geophoto-content/properties

echo 'Done.'
