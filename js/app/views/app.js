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

    // The overall AppView is the top-level piece of UI.
    var AppView = Backbone.View.extend(
    {
        el: $("body"),

        render: function()
        {
            // setup header
            this.header = new HeaderView();
            this.header.render();

            // XXX: setup content

            // initialize the game
            // XXX: game should be part of content
            this.game = new GameView();

            // XXX: setup footer

            return this;
        },

    });

    return new AppView;

});