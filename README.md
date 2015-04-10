# Constituency polling maps

live url: http://www.bbc.co.uk/news/election-2015-31712045

## Getting started

To setup the project once you have a copy of the repository change into the project directory and run npm install:

```
npm install
```

This will install all node dependencies and as a post install script run bower to install all front end dependencies.
You do not need to have a bower installed as it will run from the projects version of bower.

```
grunt
```

Make images responsive

```
grunt images
```

Build World Service version

```
grunt translate
```

Make sure you've got at least version 3.4.13 of SASS ruby gem. If you don't, update it with

```
gem update sass
```


## Project structure

The project is using backbones router, models and views to help organise the project.

The app.js file acts as the application bootstrap and sets up all views and begins listening to pubsub events and pass them through to the correct part of the application.

The router file ```source/js/router.js``` is a singleton and loaded by the app.js, the router will fire pubsub events prefixed with ```routed:``` when it matches a route, it is then up to app.js to serialize the model required for the map.js view.

There is an application model that contains the state of the application and is used to serailize and deserailize from the application url.


## Update Data

All map data is stored within a csv file in the csvs folder. There is a task that will convert any csv file in this directory into a requirejs wrapped javascript object that the application can then consume. To convert the csv file run the following:

```
grunt csv
```

The file will be converted and then placed into ```source/js/data/results/<filename>.js```. The application has hardcoded the filename into the app.js define call so either replace the current csv or change the required file if you wish to update the data.


## Non-SVG version

The non-svg version of the project uses screen shots of the running application taken by PhantomJS.
To update the screen shots first ensure that you have the connect server running and then run the following:

```
grunt screen-shots
```

There are a lots of screen shots that will be taken so this can take a while. The task will run by default two instances of PhantomJS, this can be change by altering the ```PHANTOM_INSTANCES``` var at the top of the tasks/screen_shots.js file.

The task first generates all the backbone urls that must be called and then splits the array of urls to pass to each PhantomJS instnace.

Ensure you run:

```
	grunt images
```

after you run screenshots.


## iFrame scaffold

This project was built using the iFrame scaffold v1.6.2

## License
Copyright (c) 2014 BBC
