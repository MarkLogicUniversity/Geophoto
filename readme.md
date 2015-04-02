#Geopoto

The project showcases how to store a variety of data structures in a MarkLogic (NoSQL Document Management) database. The application uses JSON documents with geospatial data, binary documents (JPEG image files) as well as RDF Triple data.

##Get Started
To get started first please follow these steps:

* clone the repository
* `cd geophoto`
* `npm install && bower install`


##Capabilities
###Import script
The application allows users to import photos to the database. During this import process Exif ([Exchangeable Image File Format](http://en.wikipedia.org/wiki/Exchangeable_image_file_format)) information is extracted from the images and stored in the database along with some details of the image as well.

Based on the previously extracted latitude & longitude information a reverse geoquery is also executed against a Yahoo webservice and the information retrieve is also stored as part of the JSON document that gets inserted into the database.

Finally the import script uses the result of the reverse geoquery to lanuch another query against the [DBPedia](http://dbpedia.org/) database to gather RDF triples for insertion.

The import script itself is written using ES6 and has been complied to ES5 using [Babel](http://babeljs.io/).

###Frontend
The frontend uses Google Maps to plot the geospatial documents to a map interface.

The application also makes use of MarkLogic's built in search features such as text search and geospatial search.

##Installation
There are a few steps that you need to do in order to get up and running with the project - you will need to create an application server as well as a content and a modules database.

###MarkLogic Server
It is assumed that you already have the MarkLogic Server installed. If you require help please [download MarkLogic](http://developer.marklogic.com/products) and read our [installation guide](http://docs.marklogic.com/guide/installation/procedures#id_28962).


###For Linux and Mac users
If you're running a Linux or Mac OS you can navigate to the ml-setup folder and simply execute the script found in that folder:
`# cd ml-setup; chmod a+x setup.sh;  ./setup.sh`

This will execute a series of curl statements that will create the right application server & databases as well as enable the appropriate indexes that are required by the server.

###For Windows users
If you're running on a Windows environment please navigate to the ml-setup folder and open both of the `.txt` files in there and update the path to the json files (which need to be relative to where you have your curl installed). For example if your curl installation is under 'c:/curl/' (i.e. curl.exe is under that folder) you'd have to update this line with the right details pointing to the configuration JSON file.

`curl --digest --user admin:admin -X POST -d@"PATH_TO_CONFIG_RELATIVE_TO_CURL/Geophoto/ml-setup/01-rest-instance-config.json" -i -H "Content-type:application/json" http://localhost:8002/v1/rest-apis`

(Please do this for the curl statements in both .txt files)

Once you have the right paths in place, please execute both of the curl statements.

##Data import
The import script can be found under the folder named 'import' and it's called `import.js`.

The import script itself accepts two parameters:

1. The first one is either a path to a folder **or** a path to a file that you'd like to import.
2. The second parameter is a flag to indicate an 'offline' data import

The offline flag means that the reverse geoquery and the SPARQL query against DBPedia will not execute. (This feature has been added should you be without an internet connection)

###Usage
Before executing the script please make sure that you open the file `connection.js` (which is in the import folder as well) and you update the connection information:

	var connection = {
	  host: "localhost",
	  port: 5003,
	  user: "admin",
	  password: "admin"
	};

To import all files from a folder:
`node import.js ../data/photos`

To import one file:
`node import.js ../data/photos/01.JPG`

To import all files in the 'offline' mode:
`node import.js ../data/photos/ offline`


###Modifications to the import script
If you'd like to modify the import script there are a few steps that you need to do. First of all please make sure that you have the Babel compiler installed and that it is globally available on your system. You can do this by executing the following statement: `npm install -g babel`

The source for the import script is under 'import/es6'. Once you have made your changes, you need to recompile the JavaScript files from the es6 source. You can do this on a Linux/Mac system by executing the following command: 
`chmod a+x run.sh; ./run.sh`.

If you're running on windows you'd have to manually recompile the JavaScript files using this command (one command per each file): `babel semantic.es6 --out-file ../semantic.js`

##Starting the application
Before starting the application please make sure that you have the right connection details as well as the correct username/password combination in the `dbsettings.js` file:

	var connection = {
	    host: 'localhost',
	    port: 5003,
	    user: 'admin',
	    password: 'admin'
	};
	
(note that this file is **different** from the connection file that the import script is using)

To start the application nagivate to the project's root folder and execute the following command: `node app.js` - this should start up an Express server on port 3000 which means that navigating to localhost:3000 would show the main page of the application.

If port 3000 is not available you can always open up `app.js` and modify the following line `app.set('port', 3000);` and use a desired port number.