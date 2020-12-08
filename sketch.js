var PLAY = 1;
var END = 0;
var gameState = PLAY;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;
var cloudsGroup, cloudImage;
var obstaclesGroup,
  obstacle1,
  obstacle2,
  obstacle3,
  obstacle4,
  obstacle5,
  obstacle6;

var score;
var gameOverImg, restartImg;
var jumpSound, checkPointSound, dieSound;

var soundFlag = "silent";

function preload() {
  trex_running = loadAnimation("trex1.png", "trex3.png", "trex4.png");
  trex_collided = loadAnimation("trex_collided.png");

  groundImage = loadImage("ground2.png");

  cloudImage = loadImage("cloud.png");

  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");

  restartImg = loadImage("restart.png");
  gameOverImg = loadImage("gameOver.png");

  jumpSound = loadSound("jump.mp3");
  dieSound = loadSound("die.mp3");
  checkPointSound = loadSound("checkPoint.mp3");
}

function setup() {
  createCanvas(windowWidth - 50, windowHeight - 20);

  trex = createSprite(50, windowHeight - 60, 20, 50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.x = width / 2;

  trex.scale = 0.5;

  ground = createSprite(300, windowHeight - 40, 600, 20);
  ground.addImage("ground", groundImage);
  ground.debug = true;
  console.log(ground.width / 2);
  ground.x = ground.width / 2;

  gameOver = createSprite(windowWidth / 2, windowHeight / 2);
  gameOver.addImage(gameOverImg);

  restart = createSprite(windowWidth / 2, windowHeight / 2 + 40);
  restart.addImage(restartImg);

  gameOver.scale = 0.5;
  restart.scale = 0.5;

  invisibleGround = createSprite(
    ground.width / 2,
    windowHeight - 30,
    ground.width,
    10
  );
  invisibleGround.visible = false;
  obstaclesGroup = createGroup();
  cloudsGroup = createGroup();

  trex.setCollider("rectangle", 0, 0, trex.width, trex.height);
  trex.debug = true;
  trex.velocityX = 4;

  score = 0;
  if (!localStorage["highestScore"]) {
    localStorage["highestScore"] = 0;
  }
  window.focus();
}

function draw() {
  background("white");
  //displaying score
  textSize(15);
  text("Score: " + score, windowWidth / 2 + camera.position.x - 200, 120);
  text(
    "Highest Score : " + localStorage["highestScore"],
    windowWidth / 2 + camera.position.x - 200,
    100
  );

  if (gameState === PLAY) {
    gameOver.visible = false;
    restart.visible = false;

    camera.position.x = trex.x;

    //scoring
    score = score + Math.round(getFrameRate() / 60);
    trex.velocityX += 0.05;
    if (score > 0 && score % 100 === 0) {
      checkPointSound.play();
    }

    if (camera.position.x + width / 2 > ground.x + ground.width / 2) {
      ground.x = camera.position.x;
      invisibleGround.x = camera.position.x;
    }

    if (
      (touches.length > 0 || keyDown("space")) &&
      trex.y >= windowHeight - 80
    ) {
      trex.velocityY = -12;

      if (soundFlag === "silent") {
        jumpSound.play();
        soundFlag = "played";
      }

      touches = [];
    }
    if (keyWentUp("space")) {
      soundFlag = "silent";
    }
    trex.velocityY = trex.velocityY + 0.8;

    //spawn the clouds
    spawnClouds();

    //spawn obstacles on the ground
    spawnObstacles();

    if (obstaclesGroup.isTouching(trex)) {
      //trex.velocityY = -12;
      //jumpSound.play();
      gameState = END;
      dieSound.play();
    }
  } else if (gameState === END) {
    gameOver.visible = true;
    restart.visible = true;
    gameOver.x = trex.x;
    restart.x = trex.x;

    //change the trex animation
    trex.changeAnimation("collided", trex_collided);

    //ground.velocityX = 0;
    trex.velocityY = 0;
    trex.velocityX = 0;

    //set lifetime of the game objects so that they are never destroyed
    obstaclesGroup.setLifetimeEach(-1);
    cloudsGroup.setLifetimeEach(-1);

    obstaclesGroup.setVelocityXEach(0);
    cloudsGroup.setVelocityXEach(0);
  }

  //stop trex from falling down
  trex.collide(invisibleGround);

  if (mousePressedOver(restart)) {
    reset();
  }
  if (mousePressedOver(restart) || touches.length > 0) {
    reset();
    touches = [];
  }

  drawSprites();
}

function reset() {
  gameState = PLAY;
  gameOver.visible = false;
  restart.visible = false;

  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();

  trex.changeAnimation("running", trex_running);
  if (score > localStorage["highestScore"]) {
    localStorage["highestScore"] = score;
  }

  score = 0;
}

function spawnObstacles() {
  if (frameCount % 70 === 0) {
    var obstacle = createSprite(
      camera.position.x + windowWidth / 2,
      windowHeight - 60,
      10,
      40
    );
    // obstacle.velocityX = -(6 + score/100);

    //generate random obstacles
    var rand = Math.round(random(1, 6));
    switch (rand) {
      case 1:
        obstacle.addImage(obstacle1);
        break;
      case 2:
        obstacle.addImage(obstacle2);
        break;
      case 3:
        obstacle.addImage(obstacle3);
        break;
      case 4:
        obstacle.addImage(obstacle4);
        break;
      case 5:
        obstacle.addImage(obstacle5);
        break;
      case 6:
        obstacle.addImage(obstacle6);
        break;
      default:
        break;
    }

    //assign scale and lifetime to the obstacle
    obstacle.scale = 0.5;
    obstacle.lifetime = abs(width / obstacle.velocityX);

    //add each obstacle to the group
    obstaclesGroup.add(obstacle);
  }
}

function spawnClouds() {
  //write code here to spawn the clouds
  if (frameCount % 60 === 0) {
    var cloud = createSprite(camera.position.x + windowWidth / 2, 120, 40, 10);
    cloud.y = Math.round(random(50, height - 100));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    // cloud.velocityX = -3;

    //assign lifetime to the variable
    cloud.lifetime = abs(width / cloud.velocityX);

    //adjust the depth
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;

    //add each cloud to the group
    cloudsGroup.add(cloud);
  }
}
