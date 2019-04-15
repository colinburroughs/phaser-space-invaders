var player,
	motherships, 
	mothershipTimer = Math.floor(1e4 * Math.random()) + 2500,
    aliens, 
	bullets, 
	enemyBullets, 
	bulletTime = 0,
    cursors, 
	score, 
	explosions, 
	fireButton,
	leftButton,
	rightButton, 
	firingTimer = 2e3,
    livingEnemies = [],
    score = 0,
    scoreString = "",
    scoreText, 
	alienTimer = 0,
    moveAliensNextRow = !1,
    movingRight = !0,
    alienMoveEveryMs = 550,
    wallRight,
	wallLeft, 
	lives, 
	livesText, 
	numLives = 3,
    deathTimer = 0,
    bases, 
	baseBmps = [],
    baseDamageBmp, 
	barriers = 4,
    highscoreText,
	highscoreString, 
	stateText, 
	alienSound, 
	alienExplodeSound, 
	mothershipSound, 
	ufoSound, 
	ufoExplodeSound, 
	playerExplodeSound, 
	playerShootSound, 
	spaceKey, 
	Game = {
        preload: function() {
            game.load.bitmapFont("minecraftia", gameRoot + "assets/fonts/minecraftia.png", gameRoot + "assets/fonts/minecraftia.xml"),
			game.load.image("left", gameRoot + "assets/images/left.png"), 
			game.load.image("right", gameRoot + "assets/images/right.png"), 
			game.load.image("bullet", gameRoot + "assets/images/bullet.png"),
			game.load.image("explosion", gameRoot + "assets/images/explosion.png"), 
			game.load.image("mothership", gameRoot + "assets/images/mothership.png"), 
			game.load.image("background", gameRoot + "assets/images/background.png"), 
			game.load.image("ship-explosion", gameRoot + "assets/images/destroyed-ship.png"), 
			game.load.image("blank", gameRoot + "assets/images/blank.png"), 
			game.load.image("base", gameRoot + "assets/images/barrier.png"),
			game.load.spritesheet("ship", gameRoot + "assets/images/newship.png", 109.5, 60, 2),
			game.load.spritesheet("alien1", gameRoot + "assets/images/alien1.png", 87.5, 70, 2),
			game.load.spritesheet("alien2", gameRoot + "assets/images/alien2.png", 99.5, 70, 2), 
			game.load.spritesheet("alien3", gameRoot + "assets/images/alien3.png", 107, 70, 2), 
			game.load.spritesheet("enemy-bullet", gameRoot + "assets/images/enemy-bullets.png", 16, 30, 2), 
			game.load.audio("alien-move", gameRoot + "assets/audio/alien-move.wav"), 
			game.load.audio("alien-explode", gameRoot + "assets/audio/alien-explode.wav"), 
			game.load.audio("mothership-lowpitch", gameRoot + "assets/audio/mothership-lowpitch.wav"), 
			game.load.audio("ufo-move", gameRoot + "assets/audio/ufo.wav"), 
			gameload.audio("ufo-explode", gameRoot + "assets/audio/ufo-explosion.wav"), 
			game.load.audio("player-explode", gameRoot + "assets/audio/player-explode.wav"), 
			game.load.audio("player-bullet", gameRoot + "assets/audio/player-bullet.wav"), 
			game.load.audio("player-shoot", gameRoot + "assets/audio/player-shoot.wav")
        },
        create: function() {
            game.physics.startSystem(Phaser.Physics.ARCADE),
			game.add.tileSprite(0, 0, 800, 600, "background"), 
			(stateText = game.add.bitmapText(game.world.centerX, game.world.height / 3, "minecraftia", "", 30)).x = game.width / 2 - stateText.textWidth / 2, 
			stateText.visible = !1, 
			alienSound = game.add.audio("alien-move"), 
			alienExplodeSound = game.add.audio("alien-explode"), 
			mothershipSound = game.add.audio("mothership-lowpitch"), 
			playerExplodeSound = game.add.audio("player-explode"), 
			playerShootSound = game.add.audio("player-shoot"), 
			(bullets = game.add.group()).enableBody = !0,
			bullets.physicsBodyType = Phaser.Physics.ARCADE, 
			bullets.createMultiple(30, "bullet"), 
			bullets.setAll("anchor.x", .5), 
			bullets.setAll("anchor.y", 1), 
			bullets.setAll("outOfBoundsKill", !0), 
			bullets.setAll("checkWorldBounds", !0), 
			(enemyBullets = game.add.group()).enableBody = !0,
			enemyBullets.physicsBodyType = Phaser.Physics.ARCADE,
			enemyBullets.createMultiple(30, "enemy-bullet"), 
			enemyBullets.setAll("outOfBoundsKill", !0), 
			enemyBullets.setAll("checkWorldBounds", !0), 
			(motherships = game.add.group()).enableBody = !0,
			motherships.physicsBodyType = Phaser.Physics.ARCADE, 
			motherships.createMultiple(30, "mothership"), 
			motherships.setAll("anchor.x", .5), 
			motherships.setAll("anchor.y", .5), 
			player = game.add.sprite(336, 700, "ship"), 
			game.physics.enable(player, Phaser.Physics.ARCADE), 
			player.anchor.setTo(.5, .5), 
			player.scale.setTo(.5, .5), 
			player.animations.add("explode-ship", [1, 0, 1, 0, 1, 0], 10, !1), 
			player.body.collideWorldBounds = !0, 
			destroyedShips = game.add.group(), 
			destroyedShips.createMultiple(30, "ship-explosion"), 
			destroyedShips.setAll("anchor.x", .5), 
			destroyedShips.setAll("anchor.y", .5), 
			(aliens = game.add.group()).enableBody = !0, 
			aliens.physicsBodyType = Phaser.Physics.ARCADE, 
			this.createAliens(), 
			(explosions = game.add.group()).createMultiple(30, "explosion"), 
			explosions.forEach(this.setupInvader, this), 
			explosions.setAll("anchor.x", .5), 
			explosions.setAll("anchor.y", .5),
			fontSize = 20, 
			scoreString = "SCORE<1>\n", 
			(scoreText = game.add.bitmapText(20, 10, "minecraftia", scoreString + "000" + score)).fontSize = fontSize, 
			scoreText.fill = "#fff", 
			game.add.bitmapText(570, 10, "minecraftia", "SCORE<2>", fontSize), 
			game.add.bitmapText(555, 620, "minecraftia", "CREDIT 01", fontSize),
			localStorage.hiScore || (localStorage.hiScore = "0000"), 
			highscoreString = "HI-SCORE\n", 
			highscoreText = game.add.bitmapText(300, 10, "minecraftia", highscoreString + localStorage.hiScore, fontSize), 
			wallLeft = game.add.tileSprite(20, 0, 8, game.height, "blank"), 
			wallRight = game.add.tileSprite(game.width - 20, 0, 8, game.height, "blank"), 
			game.physics.enable([wallLeft, wallRight], Phaser.Physics.ARCADE), 
			wallLeft.body.immovable = !0, 
			wallLeft.body.allowGravity = !1, 
			wallRight.body.immovable = !0, 
			wallRight.body.allowGravity = !1, 
			cursors = game.input.keyboard.createCursorKeys(), 
			fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR), 
			spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR), 
			leftButton = rightButton = !1, 
			buttonLeft = game.add.button(0, 580, "left", function() {}, this, 1, 1, 1), 
			buttonLeft.onInputDown.add(function() {
                leftButton = !0
            }, this), buttonLeft.onInputUp.add(function() {
                leftButton = !1
            }, this), buttonRight = game.add.button(660, 580, "right", function() {}, this, 1, 1, 1), buttonRight.onInputDown.add(function() {
                rightButton = !0
            }, this), buttonRight.onInputUp.add(function() {
                rightButton = !1
            }, this), 
			lives = game.add.group(), 
			(livesText = game.add.bitmapText(20, 620, "minecraftia", numLives.toString())).fontSize = fontSize,
			livesText.fill = "#fff";
            for (a = 0; a < 2; a++) lives.create(50 + 40 * a, 620, "ship").scale.setTo(.3, .3);
            lives.reverse();
            var e = game.world.height / 8 * 7 - 100,
                t = game.width / barriers;
            (bases = game.add.group()).enableBody = !0,
			(baseDamageBmp = game.make.bitmapData(16, 16)).rect(1, 1, 5, 5, "black"), i = [];
            for (var a = 0; a < barriers; a++) {
                var i = game.make.bitmapData(100, 100);
                i.draw("base", 0, 0, 100, 100), i.update();
                var s = a * t + 65 - 100 / 3,
                    o = game.add.sprite(s, e, i);
                bases.add(o), baseBmps.push({
                    bmp: i,
                    worldX: s,
                    worldY: e
                })
            }
        },
        actionOnClick: function() {
            console.log("O")
        },
        createEnemyBullets: function() {
            for (var e = 0; e < 30; e++)
				enemyBullets.create("enemy-bullet").animations.add("shoot", [0, 1], 1, !0)
        },
        createAliens: function() {
            for (var e = 0; e < 5; e++)
                for (var t = 0; t < 11; t++) {
                    if (0 === e) a = aliens.create(52 * t, 52 * e, "alien1");
                    else if (1 === e || 2 === e) a = aliens.create(52 * t, 52 * e, "alien2");
                    else if (3 === e || 4 == e) var a = aliens.create(52 * t, 52 * e, "alien3");
                    a.scale.setTo(.4, .4), a.anchor.setTo(.5, .5)
                }
            aliens.x = 50, aliens.y = 125
        },
        setupInvader: function(e) {
            e.anchor.x = 0, e.anchor.y = 0, e.animations.add("explosion")
        },
        descend: function() {
            aliens.y += 10
        },
        update: function() {
            if (player.alive) {
                if (player.body.velocity.setTo(0, 0),
					this.game.time.now > deathTimer && (cursors.left.isDown || leftButton ? player.body.velocity.x = -200 : (cursors.right.isDown || rightButton) && (player.body.velocity.x = 200), 
					!fireButton.isDown && !game.input.pointer1.isDown || leftButton || rightButton || this.fireBullet()), 
					game.time.now > firingTimer && this.enemyFires(), 
					alienTimer < this.game.time.now && aliens.countLiving() > 0 && this.moveAliens(), 
					game.time.now > mothershipTimer) {
						var e = motherships.getFirstExists(!1);
						e.scale.setTo(1.1, 1.1),
						e && (e.reset(-80, 95), 
						mothershipSound.play(),
						e.body.velocity.x = 80, 
						mothershipTimer = game.time.now + Math.floor(1e4 * Math.random()) + 25e3)
                }
                game.physics.arcade.overlap(bullets, aliens, this.collisionHandler, null, this),
				game.physics.arcade.overlap(bullets, motherships, this.destroyMothership, null, this), 
				game.physics.arcade.overlap(enemyBullets, player, this.enemyHitsPlayer, null, this), 
				game.physics.arcade.overlap(enemyBullets, bullets, this.bulletsHit, null, this), 
				game.physics.arcade.overlap(aliens, wallRight, this.aliensEndOfRowRight, null, this), 
				game.physics.arcade.overlap(aliens, wallLeft, this.aliensEndOfRowLeft, null, this), 
				game.physics.arcade.overlap(aliens, player, this.aliensEatPlayer, null, this), 
				game.physics.arcade.overlap(enemyBullets, bases, this.hitBase, null, this), 
				game.physics.arcade.overlap(bullets, bases, this.hitBase, null, this)
            }
        },
        hitBase: function(e, t) {
            var a = bases.getChildIndex(t),
                i = baseBmps[a],
                s = Math.round(e.x - i.worldX),
                o = Math.round(e.y - i.worldY);
            if (4278254592 === i.bmp.getPixelRGB(s, o).color) {
                for (var l = 0; l < 40; l++) {
                    var n = Math.floor(30 * Math.random() - 15),
                        r = Math.floor(30 * Math.random() - 15);
                    i.bmp.draw(baseDamageBmp, s - n, o - r)
                }
                i.bmp.update(), e.kill()
            }
        },
        moveAliens: function() {
            alienTimer = game.time.now + alienMoveEveryMs, alienSound.play(), aliens.forEachAlive(function(e) {
                e.frame = 0 === e.frame ? 1 : 0
            }), moveAliensNextRow ? this.moveAliensDown() : movingRight ? aliens.x += 10 : aliens.x -= 10
        },
        moveAliensDown: function() {
            aliens.y += 25, moveAliensNextRow = !1
        },
        aliensEndOfRow: function() {
            movingRight = !movingRight, moveAliensNextRow = !0
        },
        aliensEndOfRowRight: function(e, t) {
            movingRight && this.aliensEndOfRow()
        },
        aliensEndOfRowLeft: function(e, t) {
            movingRight || this.aliensEndOfRow()
        },
        collisionHandler: function(e, t) {
            e.kill(), t.kill(), alienExplodeSound.play(), "alien3" === t.key ? score += 10 : "alien2" === t.key ? score += 20 : "alien1" === t.key && (score += 30), 2 === score.toString().length ? scoreText.text = scoreString + "00" + score : 3 === score.toString().length ? scoreText.text = scoreString + "0" + score : score.toString().length > 3 && (scoreText.text = scoreString + score);
            var a = explosions.getFirstExists(!1);
            a.scale.setTo(.35, .35), a.reset(t.body.center.x, t.body.center.y), a.play("explosion", 10, !1, !0), alienMoveEveryMs = 10 * aliens.countLiving(), 0 == aliens.countLiving() && this.gameOver("WELL DONE EARTHLING\nTHIS TIME YOU WIN")
        },
        destroyMothership: function(e, t) {
            e.kill(), t.kill(), alienExplodeSound.play();
            var a = [50, 100, 150, 300];
            3 === (score += a[Math.floor(Math.random() * a.length)]).toString().length ? scoreText.text = scoreString + "0" + score : score.toString().length > 3 && (scoreText.text = scoreString + score);
            var i = explosions.getFirstExists(!1);
            i.scale.setTo(.35, .35), i.reset(t.body.center.x, t.body.center.y), i.play("explosion", 10, !1, !0)
        },
        enemyHitsPlayer: function(e, t) {
            e.animations.play("explode-ship"), t.kill(), playerExplodeSound.play();
            var a = lives.getFirstAlive();
            a && a.kill(), 
			numLives--, 
			livesText.text = numLives.toString(), 
			0 === numLives ? (e.kill(), enemyBullets.callAll("kill"), this.gameOver("GAME OVER")) : deathTimer = this.game.time.now + 1e3
        },
        aliensEatPlayer: function(e, t) {
            e.play("explode-ship"), playerExplodeSound.play();
            var a = lives.getFirstAlive();
            a && a.kill(), 
			numLives--, 
			livesText.text = numLives.toString(), 
			0 === numLives ? (e.kill(), enemyBullets.callAll("kill")) : deathTimer = this.game.time.now + 1e3,
			this.gameOver("GAME OVER")
        },
        bulletsHit: function(e, t) {
            e.kill(), t.kill();
            var a = explosions.getFirstExists(!1);
            a.scale.setTo(.3, .3), 
			a.reset(t.body.center.x, t.body.center.y),
			a.play("explosion", 10, !1, !0)
        },
        enemyFires: function() {
            var e = enemyBullets.getFirstExists(!1);
            if (livingEnemies.length = 0, aliens.forEachAlive(function(e) {
                    livingEnemies.push(e)
                }), e && livingEnemies.length > 0) {
                var t = game.rnd.integerInRange(0, livingEnemies.length - 1),
                    a = livingEnemies[t];
                e.scale.setTo(.8, .8),
				e.animations.add("shoot", [0, 1], 10, !0), 
				e.play("shoot"), 
				e.reset(a.body.center.x, a.body.center.y),
				e.body.velocity.y = 300,
				firingTimer = game.time.now + 2e3
            }
        },
        fireBullet: function() {
            game.time.now > bulletTime && (bullet = bullets.getFirstExists(!1),
			bullet.scale.setTo(.3, .3), 
			bullet && (bullet.reset(player.x, player.y + 8),
			bullet.body.velocity.y = -600, 
			bulletTime = game.time.now + 700, 
			playerShootSound.play()))
        },
        displayNextLetter: function() {
            stateText.text = this.message.substr(0, this.counter), this.counter += 1
        },
        displayLetterByLetterText: function(e) {
            stateText.text = e, 
			stateText.x = game.width / 2 - stateText.textWidth / 2, 
			stateText.text = "", 
			stateText.visible = !0, 
			game.time.events.repeat(100, e.length, this.displayNextLetter, {
                message: e,
                counter: 1
            }).timer.onComplete.add(function() {
                fireButton.onDown.addOnce(this.restart, this),
				game.input.onDown.addOnce(this.restart, this)
            }, this)
        },
        gameOver: function(e) {
            game.sound.stopAll();
            var t = !1;
            if (score > localStorage.hiScore) {
                for (var a = "", i = 0; i < 4 - score.toString().length; i++) a = a.concat("0");
                localStorage.hiScore = a + score.toString(), t = !0
            }
            aliens.callAll("kill"), 
			motherships.callAll("kill"), 
			bases.callAll("kill"), 
			player.kill(), 
			lives.callAll("kill");
            var s = e;
            t && (s += "\n\nNEW HI SCORE!"),
			s += "\n\nRESTART GAME WITH TAP/SPACEBAR", 
			this.displayLetterByLetterText(s)
        },
        restart: function(e) {
            stateText.visible = !1, [bullets, aliens, enemyBullets, bases, lives].every(function(e) {
                e.destroy()
            }), 
			numLives = 3, 
			score = 0,
			barriers = 4,
			baseBmps = [], 
			alienMoveEveryMs = 550,
			game.world.removeAll(), 
			game.input.onTap.removeAll(), 
			game.input.onDown.removeAll(), 
			this.create()
        }
    };