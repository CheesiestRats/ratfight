$(document).ready(function() {
  //sounds
  var ratIntroSound = new Audio(
    "./ohshit.wav"
  );
  var swordAttackSound = new Audio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/613226/399904__mrthenoronha__shining-8-bit.wav"
  );
  var fireBallSounds = new Audio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/613226/368511__josepharaoh99__8-bit-fireball.mp3"
  );
  var healthPotSound = new Audio(
    "https://s3-us-west-2.amazonaws.com/s.cdpn.io/613226/221488__lloydevans09__glug.wav"
  );
  var ratShot = new Audio(
    "./boom.wav"
  )
  var battleTheme = new Audio(
    "./battle.wav"
  )
  var victoryScreech = new Audio(
    "./fanfare.wav"
  )

  //event listeners
  function attachListeners() {
    //  Event listeners
    document
      .getElementById("useWeapon")
      .addEventListener("click", useWeapon, false);
    document
      .getElementById("useFireball")
      .addEventListener("click", useFireball, false);
    document
      .getElementById("useHealthPot")
      .addEventListener("click", useHealthPot, false);
  }

  attachListeners();

  //player and enemy objects
  var player = {
    health: 100,
    mana: 100,
    inventory: ["old sword", "steel mace", ["health potion", 2]],
    travelHistory: []
  };

  //weapons

  var oldSword = {
    name: "old sword",
    stats: 5,
    damageType: "slash"
  };

  var steelMace = {
    name: "Steel mace",
    stats: 10,
    damageType: "blunt"
  };

  //spells

  var fireBall = {
    stats: 20,
    damageType: "fire",
    manaCost: 25,
    owned: false,
    sound: fireBallSounds
  };

  //items
  var healthPot = {
    stats: 35,
    owned: 2,
    sound: healthPotSound
  };

  //enemies

  var rat = {
    name: "Thug Rat",
    greeting:
      "You've denied the rat its cheese. Oh SHIT HE HAS A GUN!!!!",
    health: 25,
    attackFirst: true,
    moveNum: 2,
    moves: [["bite", 5], ["boom", 8]],
    vulnerability: ["fire", 5],
    sounds: ratShot,
    introSound: ratIntroSound,
    battleMusic: battleTheme,
    victoryMusic: victoryScreech
  };

  //COMBAT HERE
  //players equipped weapon
  let playerEquipped = steelMace;
  //player damage before being rounded down
  let playerDamage;
  //player damage after being rounded down
  let playerRealDamage;
  //stores random number deciding what move the enemy is using
  let enemyMove;
  //enemy damage
  let enemyDamage;
  //enemy player is currently fighting
  let enemy;
  //checks to see if the enemy has already attacked. Player goes first.
  let hasAttacked = true;

  const MAX_MESSAGES = 5;
  let messageCount = 0;

  //prints out combat to combat div
  function combatPrint(input) {
    const combatOutput = $(".combatOutput");

    if(messageCount >= MAX_MESSAGES){
      combatOutput.children().first().remove();
      messageCount--;
    }

    $(".combatOutput").append("<p class='text-center'>" + input + "</p>");

    //reset textbox
    $("#commandline").val("");

    messageCount++;
  }
  //  Combat section
  //checks if the game is over by comparing health
  function gameOverCheck(pHealth, eHealth) {
    if (pHealth <= 0) {
      combatPrint("The rat has stolen your cheese and won, refresh to try again.");
      return true;
    } else if (eHealth <= 0) {
      combatPrint("You've defeated the " + enemy.name + "!!!! The cheese is now yours.");
      enemy.victoryMusic.play();
      $("#backToGame").fadeIn(1000);
      enemy.battleMusic.pause();
      $('.rat img').attr('src', './dead.png')
      return true;
    }
    return false;
  }

  //takes in the maxmum and minimum damage a given move can inflict and returns a random value between those ranges.
  function calcDamage(max, min) {
    return Math.random() * (max - min) + min;
  }

  //finds the number of moves the current enemy can perform and calculates a random number to decide which move is performed.
  function calcEnemyMove(name) {
    var howMany = name.moveNum;
    return Math.floor(calcDamage(howMany + 1, 1)) - 1;
  }

  //changes the height of the player and enemy health and mana bars.
  function calcHealthBars(who, howMuch) {
    document.getElementById(who).style.height = howMuch * 2 + "px";
  }

  //checks enemy object vulnerability and compares it to the current damage type the player is performing.
  function checkForDamageType(damageTypeAttacking, enemyDamageType) {
    if (damageTypeAttacking.damageType === enemyDamageType.vulnerability[0]) {
      return enemyDamageType.vulnerability[1];
    }
  }

  //loops through player inventory for any given value and returns a boolean.
  function inventorySearch(input) {
    for (var i = 0; i < player.inventory.length + 1; i++) {
      if (player.inventory[i] === input) {
        return true;
      } else {
        return false;
      }
    }
  }

  function enemyTurn() {
    enemyMove = calcEnemyMove(enemy);
    enemyDamage = calcDamage(enemy.moves[enemyMove][1], 1);
    var enemyRealDamage = Math.floor(enemyDamage);
    player.health = player.health - enemyRealDamage;
    combatPrint(
      enemy.name +
        " attacks you with " +
        enemy.moves[enemyMove][0] +
        " for " +
        enemyRealDamage +
        "!"
    );
    calcHealthBars("playerHealth", player.health);
    ratShot.play();
    hasAttacked = true;
    //refreshes player inventory
    for(var i = 0; i < player.inventory.length; i++){
         var inventoryOption = player.inventory[i];
         var createOption = document.createElement("option");
         createOption.textContext = inventoryOption;
         createOption.value = inventoryOption;
         document.getElementById("inventory").appendChild(createOption);
    }
  }

  function useWeapon() {
    if (hasAttacked === false) {
      return combatPrint("You are still recovering from your attack.");
    }
    if (
      gameOverCheck(player.health, enemy.health) === false &&
      hasAttacked === true
    ) {
      playerDamage = calcDamage(playerEquipped.stats, 1);
      playerRealDamage = Math.floor(playerDamage);
      enemy.health = enemy.health - playerRealDamage;
      combatPrint(
        "You attack " +
          enemy.name +
          " with your " +
          playerEquipped.name +
          " for " +
          playerRealDamage
      );
      calcHealthBars("enemyHealth", enemy.health);
      swordAttackSound.play();
      setTimeout(enemyTurn, 1000);
      hasAttacked = false;
    } else {
      combatPrint("The game is over.");
    }
  }
  function useFireball() {
    if (hasAttacked === false) {
      return combatPrint("You are still recovering from your attack.");
    }
    if (
      gameOverCheck(player.health, enemy.health) === false &&
      hasAttacked === true &&
      player.mana >= 25
    ) {
      playerDamage = calcDamage(fireBall.stats, 1);
      playerRealDamage = Math.floor(playerDamage);
      enemy.health = enemy.health - playerRealDamage;
      player.mana = player.mana - fireBall.manaCost;
      combatPrint(
        "You sling a flaming ball at " + enemy.name + " for " + playerRealDamage
      );
      if (checkForDamageType(fireBall, enemy) > 0) {
        combatPrint(
          "Fireball deals an extra " + enemy.vulnerability[1] + " damage"
        );
        enemy.health = enemy.health - enemy.vulnerability[1];
      }
      calcHealthBars("enemyHealth", enemy.health);
      calcHealthBars("playerMana", player.mana);
      fireBall.sound.play();
      setTimeout(enemyTurn, 1000);
      hasAttacked = false;
    } else {
      combatPrint("You do not have enough mana cheese");
    }
  }

  function useHealthPot() {
    if (hasAttacked === false) {
      return combatPrint("You are still recovering from your attack.");
    }
    if (healthPot.owned > 0) {
      player.health = player.health + healthPot.stats;
      healthPot.owned = healthPot.owned - 1;
      combatPrint("You eat a health cheese, you feel invigorated!");
      healthPot.sound.play();
      calcHealthBars("playerHealth", player.health);
      setTimeout(enemyTurn, 1000);
      hasAttacked = false;
    } else {
      combatPrint("You have no more health cheeses!!!");
    }
  }

  //combat function
  function combat(player, enemyFighting) {
    enemy = enemyFighting;
    combatPrint(enemy.greeting);
    if (enemy.attackFirst === true) {
      enemyTurn();
    }
    document.addEventListener("click", playintroSound, {once: true})
    document.getElementById("enemyHealth").style.height = enemy.health + "px";
  }

  function playintroSound() {
    enemy.introSound.play();
    enemy.battleMusic.play();
  }

  console.log(ratIntroSound)

  combat(player, rat);
  //COMBAT END
});
