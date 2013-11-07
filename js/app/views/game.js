define([
  'module',
  'jquery',
  'underscore',
  'backbone',
  'collections/players',
  'collections/responses',
  'models/game',
  'views/player',
  'text!templates/game/main.html!strip'
], function(module, $, _, Backbone, Players, Responses, GameModel,
            PlayerView, GameTemplate){

    // Game View
    // ---------------

    var GameView = Backbone.View.extend(
    {
        el: $("#vierisbierapp"),

        events: {
            "keypress #new-player":     "createOnEnter",
            "keypress":                 "createOnSpace",
            "click #clear-completed":   "clearCompleted",
            "click #toggle-all":        "toggleAllComplete",
            "click .play":              "playRound",
        },

        initialize: function(options)
        {
            // render template
            this.$el.html(_.template(GameTemplate));

            // setup game model
            this.model = new GameModel();

            // get references to elements
            this.main = this.$('#main');
            this.input = this.$("#new-player");
            this.instructions = this.$("#instructions");
            this.allCheckbox = this.$("#toggle-all")[0];
            this.playerCount = this.$('.player-count .count');
            this.playersTotalScore = this.$('.players-total-score .count');
            this.roundCount = this.$('.game-round .count');
            this.roundResponse = this.$(".round-response");
            this.playButton = this.$("button.play");

            // initally hide game ui
            this.playButton.hide();
            this.instructions.hide();

            // setup responses collection
            this.responses = new Responses();

            // create some dummy response data
            this.responses.createSomeResponses();

            // setup and listen to players collection
            this.players = new Players();
            this.listenTo(this.players, 'add', this.addOne);
            this.listenTo(this.players, 'reset', this.addAll);
            this.listenTo(this.players, 'all', this.render);

            // fetch players collection (from local storage)
            this.players.fetch();
        },

        // Re-rendering the view just means refreshing the statistics -- the rest
        // of the view doesn't change.
        render: function()
        {
            var done = this.players.done().length;
            var remaining = this.players.remaining().length;

            if (this.players.length)
            {
                // show the game interface
                this.main.show();

                // check if there are players
                if (this.players.length > 0)
                {
                    // show game gui
                    this.playButton.show();
                    this.instructions.show();
                }
                else
                {
                    // no players, hide game ui
                    this.playButton.hide();
                    this.instructions.hide();
                }

                // update player count
                this.playerCount.text(remaining);

                // update players total score
                this.playersTotalScore.text(this.players.totalScore());
            }
 
            this.allCheckbox.checked = !remaining;
        },

        // If you hit return in the main input field, create new Player model,
        // persisting it to localStorage.
        createOnEnter: function(e)
        {
            if (e.keyCode != 13) return;
            if (!this.input.val()) return;

            // add new player
            this.players.create({name: this.input.val()});
            this.input.val('');
        },

        // If you hit spacebar, play new round
        createOnSpace: function(e) 
        {
            if (this.$('#new-player').is(":focus"))
            {
                return;
            } 
            if (e.keyCode == 32)
            { 
                this.playRound(e);
            }
        },

        // If you click the play button, play new round
        playRound: function(e)
        {
            this.roll();
        },

        // Clear all players, destroying their models with lasers.
        clearCompleted: function()
        {
            // destroy all models
            _.invoke(this.players.done(), 'destroy');

            // no players, reset/hide game ui
            this.allCheckbox.checked = false;
            this.playButton.hide();
            this.instructions.hide();

            return false;
        },

        // Select all players
        toggleAllComplete: function()
        {
            var done = this.allCheckbox.checked;

            // save all players
            this.players.each(function (player)
            {
                player.save({'done': done});
            });
        },

        // Add a single player to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(player)
        {
            var view = new PlayerView({model: player});

            // add to dom
            this.$("#player-list").append(view.render().el);
        },

        // Add all items in the Players collection at once.
        addAll: function()
        {
            this.players.each(this.addOne, this);
        },

        // Play a game round
        roll: function()
        {   
            // set round number for game, incrementing by 1
            // TODO: round numbers increases after everybody's had a turn?
            this.model.set('round', this.model.get('round') + 1);
            this.roundCount.text(this.model.get('round'));

            // go to next player
            this.currentPlayer = this.players.at(this.model.get('currentUser'));
            this.model.set('currentUser', this.model.get('currentUser') + 1);

            // trigger event for current player
            this.currentPlayer.trigger('setPlayer');

            // go to beginning of player list
            if (this.model.get('currentUser') >= this.players.length)
            {
                this.model.set('currentUser', 0);
            }

            // set root node class to rolling, hide PLAY button with css accordingly
            this.$el.addClass("rolling").removeClass('bier');
            this.playButton.attr('disabled', 'disabled');

            // reset response
            this.roundResponse.text('');

            // set countdown for animation interval
            this.model.set('countDown', 10);

            // start roll dice animation
            this.interval = setInterval(_.bind(this._rollDice, this), 80);
        },

        // Invoked x times by timer
        _rollDice: function()
        {
            // increment dice roll animation count
            this.model.set('countDown', this.model.get('countDown') - 1);

            // throw dice and get random nr
            this.lastNumber = _.random(1, 6);

            // update view with random nr
            this.$('.dice-number').text(this.lastNumber);

            // animation ended
            if (this.model.get('countDown') == 0)
            {
                // stop animation
                clearInterval(this.interval);
                this.$el.removeClass("rolling");

                // disable ui
                this.playButton.attr('disabled', null);

                var response;

                // 4 = beer
                if (4 == this.lastNumber)
                {
                    // show animation
                    this.$el.toggleClass('bier');

                    // check if user is paused
                    if (!this.currentPlayer.get('paused'))
                    {
                        // get victorious response
                        response = this.responses.random(true);

                        // update user model's points + 1 when he's not paused
                        // triggers 'change' event that re-renders the player's row
                        this.currentPlayer.save(
                        {
                            "score": this.currentPlayer.get("score") + 1
                        });
                    }
                    else
                    {
                        // unfortunately the user is paused so
                        // don't add score. get coma victorious response
                        // instead
                        response = this.responses.random(true, true);
                    }
                }
                else
                {
                    // tough luck, check if user is paused
                    if (!this.currentPlayer.get('paused'))
                    {
                        // get fail response
                        response = this.responses.random(false);
                    }
                    else
                    {
                        // the user is paused so get coma fail response
                        // instead
                        response = this.responses.random(false, true);
                    }
                }

                // show response with player data
                response = response.toString(this.currentPlayer);
                this.roundResponse.text(response);
            }
        },

    });

    return GameView;

});