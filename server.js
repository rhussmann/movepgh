#!/bin/env node
//  OpenShift sample Node application
var express  = require('express');
var fs       = require('fs');
var mongoose = require("mongoose");
var path     = require("path")


// Mongo configuration parameters
var MONGO_ROOT_URL = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/';
var MONGO_URL = MONGO_ROOT_URL + 'movepgh';


var facet_controller = require('./controller/facet_controller');
var decision_controller = require('./controller/decision_controller');
var hood_controller = require("./controller/neighborhood_controller");


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_INTERNAL_IP;
        self.port      = process.env.OPENSHIFT_INTERNAL_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_INTERNAL_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        // Routes for /health, /asciimo and /
        self.routes['/health'] = function(req, res) {
            res.send('1');
        };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/api/facets'] = function(req, res) {
            facet_controller.getFacetsForResponse(req, res);
        };
        
        self.routes['/api/decision'] = function(req, res) {
            decision_controller.getNeighborhoodsForRequest(req, res);
        };
        
        self.routes['/api/results'] = function(req, res) {
            decision_controller.getNeighborhoodsForRequest(req, res);
        };

        self.routes['/prioritize'] = function(req, res) {
          facet_controller.getFacets(function(facets){
            return res.render('prioritize', {title: "Let's Get Started", facets:facets});
          })
        };

        self.routes['/'] = function(req,res) {
          return res.render('index', {title: 'Moowing'});
        }
        
        self.routes['/results'] = function(req,res) {
          if(req.query.facets==null || req.query.facets==undefined || req.query.facets=='') {
            return resp.send(400)
          }
          var hid=req.query.hood;
          fids = req.query.facets.split(",")
          facet_controller.getFacetNameLookup(function(name_lookup) {
            decision_controller.getNeighborhoodsForFacets(fids, function(results) {
              new_results = []
              results.forEach(function(h) { 
                if(h.hood !== hid) {
                  new_results.push(h)
                }
              })
              
              results.forEach(function(h) { 
                if(h.hood === hid) {
                  new_results.unshift(h)
                }
              })
              
              console.log(new_results)
              return res.render('results', {
                title: 'And the winner is...', 
                results: new_results, fids:fids, facets: name_lookup
              });
            });
          })
        }
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();

        self.app.set('view engine', 'jade');
        self.app.use(express.static(path.join(__dirname + '/public')));
        self.app.set("view options", {pretty: true});

        // Connect to mongo
        mongoose.connect(MONGO_URL);

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

