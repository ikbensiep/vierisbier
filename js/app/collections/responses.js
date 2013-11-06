define([
  'module',
  'underscore',
  'backbone',
  'models/response'
], function(module, _, Backbone, Response){

	// Responses Collection
    // ------------------

    var ResponsesList = Backbone.Collection.extend(
    {

        // Reference to this collection's model.
        model: Response,

        // Get a random response.
        random: function(victory, paused)
        {
            if (_.isUndefined(victory))
            {
                victory = false;
            }
            if (_.isUndefined(paused))
            {
                paused = false;
            }
            // return a single random item from the collection.
            return _.sample(this.where({
                victory: victory,
                paused: paused
            }));
        },

        // add some test responses for testing
        createSomeResponses: function()
        {
            // some responses that should be coming from a database at startup
            // or something
            this.add([
                {
                    // won and not paused
                    description: "Keep em coming %(name)s!",
                    victory: true,
                    paused: false
                },
                {
                    // didn't win and not paused
                    description: "Go home %(name)s!",
                    victory: false,
                    paused: false
                },
                {
                    // won but paused
                    description: "You won %(name)s, but you're asleep?!",
                    victory: true,
                    paused: true
                },
                {
                    // didn't win and also paused
                    description: "Tough luck, and %(name)s is in coma anyway...",
                    victory: false,
                    paused: true
                }
            ]);
        }

    });

	return ResponsesList;
});

