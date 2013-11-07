define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'text!templates/header.html!strip'
], function(module, $, _, Backbone, HeaderTemplate){

    // Header View
    // --------------

    // The DOM element for the header
    var HeaderView = Backbone.View.extend(
    {
        el: $("#header"),

        render: function()
        {
        	// render template
            this.$el.html(_.template(HeaderTemplate));

            return this;
        },

    });

    return HeaderView;

});