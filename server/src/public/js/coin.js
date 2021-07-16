const dogAnimateTime = 700, dogTotalClip = 10;
let gameObject;
function resetDog()
{
    $(".animated-dog").attr("src","images/animated-dog/1.png");
}
function coinFlip(side, speed) {
    $(".coin").hide();
    window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);

    gameObject = new component($(".coin"), 80, 80, 0, 0, $(".coin-area").height() - $(".coin").height());
    // let speed = getRandomInt(3, 6);
    let count = { 3: 39, 4: 29, 5: 23 };
    let angleFront = 0, angleBack = 180;
    angleSpeed = (1800 + side * 180) / count[speed];

    let dogClip = 1;
    let dogInterval = setInterval(() => {
        $(".animated-dog").attr("src","images/animated-dog/"+dogClip+".png");
        dogClip ++;
        if(dogClip > 10)
        {
            clearInterval(dogInterval);
            accelerate(speed);
            $(".coin").show();
            const curLeft = parseInt($(".coin").css("left"));
            $(".coin").animate({ width: "80px", height: "80px", left: (curLeft-22.5)+'px' }, count[speed]*50);
            $(".coin").animate({ width: "35px", height: "35px", left: curLeft+'px' }, count[speed]*50);
            let interval = setInterval(() => {
                rotate($(".coin div").eq(0), angleFront, angleFront + angleSpeed, 100);
                rotate($(".coin div").eq(1), angleBack, angleBack + angleSpeed, 100);
                angleFront += angleSpeed;
                angleBack += angleSpeed;
                gameObject.newPos();
                gameObject.update();
                if (gameObject.gravitySpeed <= 0) {
                    accelerate(-1 * speed);
                }
                if (gameObject.y == 0) {
                    clearInterval(interval);
                }
            }, 100);
        }
    }, dogAnimateTime/dogTotalClip);
    return 100*count[speed]+dogAnimateTime;
}


function component(object, width, height, x, y, totalHeight) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
    this.totalHeight = totalHeight;
    this.object = object;
    this.update = function () {
        // this.object.width(width);
        // this.object.height(height);
        // this.object.css("left", this.x + "px");
        this.object.css("bottom", (this.y) / 570 * this.totalHeight + "px");
    }
    this.newPos = function () {
        this.gravitySpeed += this.gravity * -1;
        // this.x += this.speedX;
        if (this.gravity > 0)
            this.y += this.speedY + this.gravitySpeed;
        else
            this.y -= this.speedY + this.gravitySpeed;
        this.hitBottom();
    }
    this.hitBottom = function () {
        if (this.y <= 0) {
            this.y = 0;
            this.gravitySpeed = 0;
        }
    }
}

function accelerate(n) {
    if (n > 0) {
        gameObject.gravitySpeed = 60;
    }
    else {
        gameObject.gravitySpeed = 0;
    }
    gameObject.gravity = n;
}

function rotate(obj, startAngle, endAngle, duration) {
    let elapsed = 0;
    let period = 20;
    let increment = (endAngle - startAngle) / (duration / period);
    let interval = setInterval(() => {
        obj.css("transform", "rotateX(" + startAngle + "deg)");
        startAngle += increment;
        elapsed += period;
        if (elapsed > duration) {
            clearInterval(interval);
        }
    }, period);
}