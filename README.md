# Hot Potato game

Hot Potato is an experimental multiplayer game written with Phaser and Meteor.
It is experimental in that it uses server-side Phaser instances (Phaser is built to run in a browser) which synchronize with client instances.
Series of stubs and overrides are used to make this work (partially, we don't need the whole Phaser functionality on server).

## Principle

A player is chosen at the beginning of the game to hold the hot potato. At the same time, a countdown is launched.
The player who is holding the hot potato must pass it to another player by colliding with him.
Players can move around the entire game area, trying to avoid collision with the player who holds the hot potato.
At the end of the countdown, the player with the hot potato loses.