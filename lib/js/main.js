var gameRoot = './';
var game;
"undefined" == typeof gameRoot && (gameRoot = ""),
(game = new Phaser.Game(700, 660, Phaser.AUTO, "invaders")).state.add("Menu", Menu), 
game.state.add("Game", Game), 
game.state.start("Menu");