define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'views/game'
], function(module, $, _, Backbone, GameView){

    // The Application
    // ---------------

    // Our overall AppView is the top-level piece of UI.
    var AppView = Backbone.View.extend(
    {
        el: $("body"),

        render: function()
        {
            // initialize the game
            this.game = new GameView();
        },

    });

    return new AppView;

});