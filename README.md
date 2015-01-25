# Hot Potato game (version 0.1 stable)

Hot Potato is an experimental multiplayer game written with Phaser and Meteor.
It is experimental in that it uses server-side Phaser instances (Phaser is built to run in a browser) which synchronize with client instances.
Series of stubs and overrides are used to make this work (partially, we don't need the whole Phaser functionality on server).

## Principle

A player is chosen at the beginning of the game to hold the hot potato. At the same time, a countdown is launched.
The player who is holding the hot potato must pass it to another player by colliding with him.
Players can move around the entire game area, trying to avoid collision with the player who holds the hot potato.
At the end of the countdown, the player with the hot potato loses.

##Installation

First you need to install [Meteor](https://www.meteor.com/) :

    curl https://install.meteor.com/ | sh

Clone the project, go to the project's root directory and type following command :

    meteor
    
This launches the application. You should now be able to play at http://localhost/:3000.
