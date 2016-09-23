// 灯的动画的处理
var lamp = {
    elem: $('.b-bg'),
    bright: function () {
        this.elem.addClass('lamp-bright')
    },
    dark: function () {
        this.elem.removeClass('lamp-bright')
    }
}

var $content = $('#content');
var swipe = Swipe($content);
var $contentW = $content.width();
var $contentH = $content.height();
var $boy = $('#boy');

// 页面滚动到指定的位置
function toScroll(time, proportionX) {
    swipe.onScroll(proportionX * $content.width(), time)
}

// 获取数据
var getValue = function (className) {
    var $element = $('' + className + '');
    return {
        height: $element.height(),
        top: $element.position().top
    }
};

// 桥的Y轴
var brightY = function () {
    return $('.c-bg-middle').position().top
}()

var boy = boyWalk();
boy.setFlowerWalk();

// var brightY = function () {
//     // console.log($('.c-bg-middle').position())
//     return $('.c-bg-middle').position().top

// }()

// ?  /////
// girl
var girl = {
    elem: $('.girl'),
    getHeight: function () {
        return this.elem.height()
    },
    // 转身
    rotate: function () {
        this.elem.addClass('girl-rotate')
    },
    setOffset: function () {
        this.elem.css({
            left: $('#content').width() / 2,
            top: brightY - this.getHeight()
        })
    },
    getWidth: function () {
        return this.elem.width()
    },
    getOffset: function () {
        return this.elem.offset()
    }
}
// 修正位置
girl.setOffset();
// console.log(girl.getHeight())

// 直接定位到第二个页面
// swipe.onScroll($content.width() * 2, 0)

function doorAction(left, right, time) {
    var door = $('.door')
    var doorL = $('.door-l');
    var doorR = $('.door-r');

    // count的作用是等开门活着关门的时候 
    // 左边的门和右边的门同时结束的时候才结束动画
    var count = 2;
    var def = $.Deferred();
    var complate = function () {
        if(count == 1) {
            def.resolve();
            return;
        }
        count--;
    }
    doorL.transition({
        'left': left
    }, time, complate)
    doorR.transition({
        'left': right
    }, time, complate)
    return def
}
function openDoor() {
    return doorAction('-50%', '100%', 2000);
}
function shutDoor() {
    return doorAction('0%', '50%', 2000);
}


$('.open').click(function() {
    openDoor().then(function () {
        lamp.bright()
    });
    
})
$('.shut').click(function () {
    shutDoor().then(function () {
        lamp.dark()
    })

})

function boyWalk() {
    var getY = function () {
        var value = getValue('.a-background-middle');
        return value.top + value.height / 2
    }()

    var boyHeight = $boy.height();
    // 修正小孩的位置
    $boy.css({
        top: getY - boyHeight + 25
    })

    ///----------------------

    // 原地走路
    function addWalk() {
        $boy.addClass('pause-walk');
    }

    // 恢复走路
    function pauseWalk() {
        $boy.removeClass('pause-walk');
    }

    function slowWalk() {
        $boy.addClass('slow-walk');
    }

    function calculateDist(direction, proportion) {
        return (direction == 'x' ? $contentW : $contentH) * proportion
    }
    function startRun(option, time) {
        var deferred = $.Deferred();
        pauseWalk();
        $boy.transition(
            option, 
            time, 
            'linear', 
            function () {
                deferred.resolve()
            }
        )
        return deferred
    }
    function walkRun(times, distX, distY) {
        slowWalk();
        var d1 = startRun ({
            'left': distX + 'px',
            'top': distY ? distY+ 'px' : undefined
        }, times)
        return d1;
    }
    var instance;

    // 走进商店
    function walkToShop(time) {
        var defer = $.Deferred();
        var doorLeft = $('.door').offset().left;
        var boyLeft = $('#boy').offset().left;
        instance = (doorLeft + $('.door').width() / 2) - (boyLeft + $('#boy').width() / 2)
        var walkPaly = startRun({
            transform: 'translateX(' + instance + 'px), scale(0.3, 0.3)',
            opacity: 0.1
        }, time)
        walkPaly.done(function () {
            $('#boy').css({
                opacity: 0
            })
            defer.resolve()
        })
        return defer
    }

    function walkOutShop(time) {
        var defer = $.Deferred()
        pauseWalk()
        var walkPaly = startRun({
            transform: 'translateX(' + instance + 'px), scale(1, 1)',
            opacity: 1
        }, time)
        walkPaly.done(function () {
            defer.resolve()
        })
        return defer
    }

    // 取花
    function talkFlower() {
        var defer = $.Deferred()
        setTimeout(function () {
            $boy.addClass('slowFlowerWalk')
            defer.resolve()
        }, 1000)
        return defer
    }

    return {
        walkTo: function (times, distX, distY) {
            var distX = calculateDist('x', distX);
            var distY = calculateDist('y', distY);
            return walkRun(times, distX, distY);
        },
        stopWalk: function () {
            pauseWalk()
        },
        outShop: function () {
            return walkOutShop.apply(null, arguments)
        },
        talkFlower: function () {
            return talkFlower()
        },
        // 复原初始的状态
        resetOriginal: function () {
            this.stopWalk()
            $boy.removeClass('slow-walk slowFlowerWalk').addClass('boyOriginal')
        },
        setFlowerWalk: function () {
            $boy.addClass('slowFlowerWalk')
        },
        getWidth: function () {
            return $boy.width()
        },
        rotate: function() {
            pauseWalk()
            $boy.addClass('boy-rotate')
        }
    }
}
