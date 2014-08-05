require.config({
  paths: {
    'entity-manager': ['../../../entity-manager'],
    'processor-manager': ['../../../processor-manager'],
    'lib': './lib'
  }
});

require(['entity-manager', 'processor-manager', 'lib/pixi'],
function (EntityManager,    ProcessorManager,    PIXI) {

    var stage = new PIXI.Stage(0x888888);
    var renderer = PIXI.autoDetectRenderer(640, 480);
    document.getElementById('stage').appendChild(renderer.view);

    /*--- COMPONENTS ---*/
    var Card = {
        name: 'Card',
        state: {
            x: 0,
            y: 0,
            tile: 0,
            visible: false,
            found: false,
            _sprite: null,
            _clicked: false,
        }
    };

    /*--- PROCESSORS ---*/
    var RenderingProcessor = function (manager) {
        this.manager = manager;
    };

    RenderingProcessor.prototype.update = function () {
        renderer.render(stage);
    };

    var CardProcessor = function (manager) {
        this.manager = manager;

        this.numberOfTiles = 48; // Number of tiles that will get displayed.
        this.numberOfPossibleTiles = 44; // Number of tiles in the image file.
        this.width = 8; // in number of tiles.

        this.timerStart = null;

        this.init();
    };

    CardProcessor.prototype.init = function () {
        this.container = new PIXI.DisplayObjectContainer();
        stage.addChild(this.container);

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
            var cardId = this.manager.createEntity(['Card']);
            var card = this.manager.getEntityWithComponent(cardId, 'Card');
            card.tile = chosenTiles[i];
            card.x = i % this.width;
            card.y = Math.floor(i / this.width);

            card._sprite = PIXI.Sprite.fromFrame(card.tile);
            card._sprite.buttonMode = true;
            card._sprite.interactive  =  true;
            card._sprite.position.x = 7 + card.x * 80;
            card._sprite.position.y = 7 + card.y * 80;

            (function (card) {
                card._sprite.click = function () {
                    card._clicked = true;
                };
            })(card);

            this.container.addChild(card._sprite);
        }
    };

    CardProcessor.prototype.update = function () {
        var cards = this.manager.getEntitiesWithComponent('Card');

        if (this.timerStart) {
            var now = +new Date();
            if (now - this.timerStart >= 1000) {
                if (this.selected1.tile === this.selected2.tile) {
                    // It's a match!
                    this.selected1.found = true;
                    this.selected2.found = true;
                }
                else {
                    this.selected1.visible = false;
                    this.selected2.visible = false;
                }

                this.selected1 = null;
                this.selected2 = null;
                this.timerStart = null;
            }
        }

        for (var i in cards) {
            var card = cards[i];

            if (!cards.hasOwnProperty(i) || !card._sprite) {
                continue;
            }

            if (card._clicked && !card.visible && !card.found) {
                if (!this.selected1) {
                    this.selected1 = card;
                    card.visible = true;
                }
                else if (!this.selected2) {
                    this.selected2 = card;
                    card.visible = true;

                    // Set a timer to hide or remove those cards.
                    this.timerStart = +new Date();
                }

                card._clicked = false;
            }

            if (!card.visible) {
                card._sprite.tint = 0x000000;
                card._sprite.alpha = 0.5;
            }
            else {
                card._sprite.tint = 0xffffff;
                card._sprite.alpha = 1.0;
            }

            if (card.found) {
                this.container.removeChild(card._sprite);
                card._sprite = null;
            }
        }
    };

    function start() {
        var manager = new EntityManager();
        manager.addComponent(Card.name, Card);

        var processors = new ProcessorManager();
        processors.addProcessor(new RenderingProcessor(manager));
        processors.addProcessor(new CardProcessor(manager));

        requestAnimFrame(animate);
        function animate() {
            requestAnimFrame(animate);

            processors.update();
        }
    }

    var tileAtlas = ["img/images.json"];
    var loader = new PIXI.AssetLoader(tileAtlas);
    loader.onComplete = start;
    loader.load();
});
