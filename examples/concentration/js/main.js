/**
 * A game of Concentration. Each tile exists in double. Click on tiles to turn
 * them up, and find all the couples.
 *
 * Code initially taken from
 * http://www.emanueleferonato.com/2014/02/26/complete-html5-concentration-game-made-with-pixi-js/
 * but then largely rewritten as an Entity System game.
 *
 * Using:
 *  - Entity System for JavaScript - https://github.com/AdrianGaudebert/entity-system-js
 *  - Pixi.js - http://www.pixijs.com/
 *  - require.js - http://requirejs.org/
 */

require.config({
  paths: {
    'entity-manager': ['../../../entity-manager'],
    'lib': './lib'
  }
});

require(['entity-manager', 'lib/pixi'],
function (EntityManager,    PIXI) {

    var stage = new PIXI.Stage(0x888888);
    var renderer = PIXI.autoDetectRenderer(640, 480);
    document.getElementById('stage').appendChild(renderer.view);

    /*--- COMPONENTS ---*/

    /**
     * The basic Card component, that each tile on the board has. Controls the
     * position of the card and its tile number.
     */
    var Card = {
        name: 'Card',
        state: {
            x: 0,
            y: 0,
            tile: 0,
        }
    };

    /**
     * A marker for cards that are face down (tile hidden) in the game.
     */
    var CardFaceDown = {
        name: 'CardFaceDown',
        state: {
        }
    };

    /**
     * A marker for cards that are face up (tile visible) in the game.
     */
    var CardFaceUp = {
        name: 'CardFaceUp',
        state: {
        }
    };

    /**
     * A marker for cards that have been clicked by the player.
     */
    var CardClicked = {
        name: 'CardClicked',
        state: {
        }
    };

    /**
     * A marker for cards that have been found by the player and should be
     * removed from the game.
     */
    var CardFound = {
        name: 'CardFound',
        state: {
        }
    };

    /*--- PROCESSORS ---*/

    /**
     * A processor that takes care of all things related to displaying the game.
     */
    var RenderingProcessor = function (manager) {
        this.manager = manager;

        this.container = new PIXI.DisplayObjectContainer();
        stage.addChild(this.container);

        // An associative array for entities' sprites.
        // entity id -> sprite
        this.sprites = {};

        this.initTiles();
    };

    RenderingProcessor.prototype.initTiles = function () {
        var cards = this.manager.getComponentsData('Card');
        for (var entityId in cards) {
            this.createCardTile(entityId, cards[entityId]);
        }
    };

    RenderingProcessor.prototype.createCardTile = function (cardId, cardData) {
        var sprite = PIXI.Sprite.fromFrame(cardData.tile);

        sprite.buttonMode = true;
        sprite.interactive = true;
        sprite.position.x = 7 + cardData.x * 80;
        sprite.position.y = 7 + cardData.y * 80;

        (function (cardId, sprite, self) {
            sprite.click = function () {
                self.manager.addComponentsToEntity(['CardClicked'], cardId);
            };
        })(cardId, sprite, this);

        this.container.addChild(sprite);

        this.sprites[cardId] = sprite;
    };

    RenderingProcessor.prototype.update = function () {
        var found = this.manager.getComponentsData('CardFound');
        for (var entityId in found) {
            this.container.removeChild(this.sprites[entityId]);
            this.manager.removeEntity(entityId);
        }

        var faceDown = this.manager.getComponentsData('CardFaceDown');
        for (var entityId in faceDown) {
            this.sprites[entityId].tint = 0x000000;
            this.sprites[entityId].alpha = 0.5;
        }

        var faceUp = this.manager.getComponentsData('CardFaceUp');
        for (var entityId in faceUp) {
            this.sprites[entityId].tint = 0xffffff;
            this.sprites[entityId].alpha = 1.0;
        }

        renderer.render(stage);
    };

    /**
     * A processor that manages the cards and their change of state.
     */
    var CardProcessor = function (manager) {
        this.manager = manager;

        this.numberOfTiles = 48; // Number of tiles that will get displayed.
        this.numberOfPossibleTiles = 44; // Number of tiles in the image file.
        this.width = 8; // in number of tiles.

        this.timerStart = null;

        this.init();
    };

    CardProcessor.prototype.init = function () {
        // Choose a random set of tiles.
        var chosenTiles = [];
        while (chosenTiles.length < this.numberOfTiles) {
            var candidate = Math.floor(Math.random() * this.numberOfPossibleTiles);
            if (chosenTiles.indexOf(candidate) === -1) {
                chosenTiles.push(candidate, candidate);
            }
        }

        // Randomize those tiles.
        for (var i = 0; i < 96; i++) {
            var from = Math.floor(Math.random() * this.numberOfTiles);
            var to = Math.floor(Math.random() * this.numberOfTiles);
            var tmp = chosenTiles[from];
            chosenTiles[from] = chosenTiles[to];
            chosenTiles[to] = tmp;
        }

        for (var i = chosenTiles.length - 1; i >= 0; i--) {
            var cardId = this.manager.createEntity(['Card', 'CardFaceDown']);
            var card = this.manager.getComponentDataForEntity('Card', cardId);
            card.tile = chosenTiles[i];
            card.x = i % this.width;
            card.y = Math.floor(i / this.width);
        }
    };

    CardProcessor.prototype.update = function () {
        var manager = this.manager;
        var card;

        // Get all the cards currently face up, used in tests because we never
        // want to have more than 2 cards face up.
        var faceUp = manager.getComponentsData('CardFaceUp');
        var faceUpIds = Object.keys(faceUp);

        // Go through clicked cards and turn them face up if possible.
        var clicked = manager.getComponentsData('CardClicked');
        for (card in clicked) {
            if (Object.keys(faceUp).length < 2 && manager.entityHasComponent(card, 'CardFaceDown')) {
                manager.removeComponentsFromEntity(['CardFaceDown'], card);
                manager.addComponentsToEntity(['CardFaceUp'], card);

                if (Object.keys(faceUp).length === 2) {
                    this.timerStart = +new Date();
                }
            }

            manager.removeComponentsFromEntity(['CardClicked'], card);
        }

        if (faceUpIds.length > 2) {
            throw 'You did your job poorly, developer. Now go and fix your code.';
        }

        // When 2 cards are face up and we have waited long enough, if those
        // cards have the same tile, mark them as found, otherwise turn them
        // face down.
        if (faceUpIds.length == 2 && this.timerStart) {
            var now = +new Date();
            if (now - this.timerStart >= 1000) {
                var card1 = manager.getComponentDataForEntity('Card', faceUpIds[0]);
                var card2 = manager.getComponentDataForEntity('Card', faceUpIds[1]);

                if (card1.tile === card2.tile) {
                    // Found a pair.
                    manager.addComponentsToEntity(['CardFound'], faceUpIds[0]);
                    manager.addComponentsToEntity(['CardFound'], faceUpIds[1]);
                }
                else {
                    // Not a pair.
                    manager.removeComponentsFromEntity(['CardFaceUp'], faceUpIds[0]);
                    manager.removeComponentsFromEntity(['CardFaceUp'], faceUpIds[1]);
                    manager.addComponentsToEntity(['CardFaceDown'], faceUpIds[0]);
                    manager.addComponentsToEntity(['CardFaceDown'], faceUpIds[1]);
                }

                this.timerStart = null;
            }
        }
    };

    function start() {
        // Create an Entity System manager object.
        var manager = new EntityManager();

        // Add all components to the system.
        var components = [
            Card,
            CardFaceUp,
            CardFaceDown,
            CardClicked,
            CardFound,
        ];
        for (var i = components.length - 1; i >= 0; i--) {
            manager.addComponent(components[i].name, components[i]);
        }

        // Add all processors in the system. Note that because of the logic
        // in our processors' constructors, order here matters.
        // CardProcessor creates all the card entities, and RenderingProcessor
        // then creates all the sprites to go with them.
        manager.addProcessor(new CardProcessor(manager));
        manager.addProcessor(new RenderingProcessor(manager));

        // Start the main loop of the game.
        requestAnimFrame(animate);
        function animate() {
            requestAnimFrame(animate);

            manager.update();
        }
    }

    var tileAtlas = ["img/images.json"];
    var loader = new PIXI.AssetLoader(tileAtlas);
    loader.onComplete = start;
    loader.load();
});
