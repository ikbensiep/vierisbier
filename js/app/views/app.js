define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'views/header',
  'views/game'
], function(module, $, _, Backbone, HeaderView, GameView){

    // The Application
    // ---------------

    // Our overall AppView is the top-level piece of UI.
    var AppView = Backbone.View.extend(
    {
        el: $("body"),

        render: function()
        {
            // setup header
            this.header = new HeaderView();
            this.header.render();

            // initialize the game
            this.game = new GameView();

            return this;
        },

    });

    return new AppView;

});