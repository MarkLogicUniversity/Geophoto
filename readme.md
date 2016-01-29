#Geophoto

The project showcases how to store a variety of data structures in a MarkLogic (NoSQL Document Management) database. The application uses JSON documents with geospatial data, binary documents (JPEG image files) as well as RDF Triple data.

##Get Started
To get started first please follow these steps:

* clone the repository
* `cd Geophoto`
* `npm install && bower install`
* see the important section below for additional requirements

##Important!
Unfortunately the YQL table that has been used for the reverse geolookup has been shut down by Yahoo. This means that the code had to be refactored and it is now using Google's Geocoding API, which requires an API key. The API key has to be setup by the user who wishes to use this application.

To get a key please follow the process outlined here: [https://developers.google.com/maps/documentation/geocoding/get-api-key](https://developers.google.com/maps/documentation/geocoding/get-api-key)

**Please make sure that you ENABLE the geocode API!**

Once a key is created please make sure to edit `import/metadata-extract.js` on line 123 and add the key to the variable (`var key = ""`).

It's also important that this project requires you to run **Node.js v4** at least, otherwise the import script will not work.

##Capabilities
###Import script
The application allows users to import photos to the database. During this import process Exif ([Exchangeable Image File Format](http://en.wikipedia.org/wiki/Exchangeable_image_file_format)) information is extracted from the images and stored in the database along with some details of the image as well.

Based on the previously extracted latitude & longitude information a reverse geoquery is also executed against a Yahoo webservice and the information retrieve is also stored as part of the JSON document that gets inserted into the database.

Finally the import script uses the result of the reverse geoquery to lanuch another query against the [DBPedia](http://dbpedia.org/) database to gather RDF triples for insertion.

###Frontend
The frontend uses Google Maps to plot the geospatial documents to a map interface.

The application also makes use of MarkLogic's built in search features such as text search and geospatial search.

##Installation
There are a few steps that you need to do in order to get up and running with the project - you will need to create an application server as well as a content and a modules database.

###MarkLogic Server
It is assumed that you already have the MarkLogic Server installed. If you require help please [download MarkLogic](http://developer.marklogic.com/products) and read our [installation guide](http://docs.marklogic.com/guide/installation/procedures#id_28962).

Geophoto uses Node.js to call the [Management API](http://docs.marklogic.com/REST/management) to set up the application server and databases needed. To run this script, change directories to `ml-setup`, then run `node setup.js`.

    cd ml-setup
    node setup.js bootstrap

> Note that `setup.js` assumes a default local installation, where the Management API is available at http://localhost:8002. If deploying to a remote server, or if you need to change the admin username or password, edit setup.js before running.

##Data import
The import script can be found under the folder named 'import' and it's called `import.js`.

The import script itself accepts two parameters:

1. The first one is either a path to a folder **or** a path to a file that you'd like to import.

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

##Starting the application
Before starting the application please make sure that you have the right connection details as well as the correct username/password combination in the `dbsettings.js` file:

	var connection = {
	    host: 'localhost',
	    port: 5003,
	    user: 'admin',
	    password: 'admin'
	};

(note that this file is **different** from the connection file that the import script is using)

To start the application navigate to the project's root folder and execute the following command: `node app.js` - this should start up an Express server on port 4000 which means that navigating to localhost:4000 would show the main page of the application.

If port 4000 is not available you can always open up `app.js` and modify the following line `app.set('port', 4000);` and use a desired port number.
