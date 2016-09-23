var Mxc = function() {
    var config = {
        audioConfig: {
            enable: true,
            // 正常播放地址
            playURL: 'music/happy.wav',
            // 正常循环地址
            cycleURL: 'music/circulation.wav'
        },
        setTime: {
            walkToThird: 6000,
            walkToMiddle: 6500,
            walkToEnd: 6500,
            walkTobridge: 2000,
            bridgeWalk: 2000,
            walkToShop: 1500,
            walkOutShop: 1500,
            openDoorTime: 800,
            shutDoorTime: 500,
            waitRotate: 850,
            waitFlower: 800
        },
        snowflakeURL: [
            'img/snowflake/snowflake1.png',
            'img/snowflake/snowflake2.png',
            'img/snowflake/snowflake3.png',
            'img/snowflake/snowflake4.png',
            'img/snowflake/snowflake5.png',
            'img/snowflake/snowflake6.png'
        ]
    }
    var $content = $('#content');
    var $contentW = $content.width();
    var $contentH = $content.height();
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
    if (config.audioConfig.enable) {
        var audio1 = Html5Audio(config.audioConfig.playURL);
        audio1.end(function() {
            Html5Audio(config.audioConfig.cycleURL, true)
        })
    }
    var swipe = Swipe($content);
    function toScroll(time, proportionX) {
        swipe.onScroll(proportionX * $content.width(), time)
    }
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
                top: $('.c-bg-middle').position().top - this.getHeight()
            })
        },
        getWidth: function () {
            return this.elem.width()
        },
        getOffset: function () {
            return this.elem.offset()
        }
    }
    var bird = {
        elem: $('.bird'),
        fly: function () {
            this.elem.addClass('birdFly')
            this.elem.transition({
                right: $content.width()
            }, 15000, 'linear')
        }
    }
    var boy = boyWalk();
    boy.walkTo(config.setTime.walkToThird, 0.6)
    .then(function () {
        // 第一个页面走完了 页面开始滚动
        toScroll(config.setTime.walkToMiddle, 1)
        return boy.walkTo(config.setTime.walkToMiddle, 0.5)
    })
    .then(function () {
        bird.fly()
    })
    .then(function () {
        boy.stopWalk()
        return BoyToShop(boy)
    })
    .then(function () {
        girl.setOffset();
        toScroll(config.setTime.walkToEnd, 2);
        return boy.walkTo(config.setTime.walkToEnd, 0.15)
    })
    .then(function () {
        return boy.walkTo(config.setTime.walkTobridge, 0.25, ($('.c-bg-middle').position().top - girl.getHeight()) / $('#content').height())
    })
    .then(function () {
        var x = (girl.getOffset().left - boy.getWidth() + girl.getWidth() / 5) / $('#content').width()
        return boy.walkTo(config.setTime.bridgeWalk, x)
    })
    .then(function () {
        boy.resetOriginal()
        setTimeout(function() {
            girl.rotate()
            boy.rotate(function() {
                snowflake()
            })
        }, config.setTime.waitRotate)
    })
    function boyWalk() {
        var $boy = $("#boy");
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
        
        function pauseWalk() {
            $boy.addClass("pause-walk")
        }
        function restoreWalk() {
            $boy.removeClass("pause-walk")
        }

        function slowWalk() {
            $boy.addClass('slow-walk');
        }

        function calculateDist(direction, proportion) {
            return (direction == 'x' ? $contentW : $contentH) * proportion
        }
        function startRun(option, time) {
            var deferred = $.Deferred();
            restoreWalk();
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
        function walkToShop(doorObj, time) {
            var defer = $.Deferred();
            var doorObj = $(".door");
            var doorLeft = doorObj.offset().left;
            var boyLeft = $('#boy').offset().left;
            instance = (doorLeft + doorObj.width() / 2) - (boyLeft + $('#boy').width() / 2)
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
            restoreWalk()
            var walkPaly = startRun({
                transform: 'translateX(' + instance + 'px), scale(1, 1)',
                opacity: 1
            }, time)
            walkPaly.done(function () {
                defer.resolve()
            })
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
            toShop: function() {
                return walkToShop.apply(null, arguments)
            },
            outShop: function () {
                return walkOutShop.apply(null, arguments)
            },
            talkFlower: function () {
                $boy.addClass("slowFlowerWalk")
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
            rotate: function(callback) {
                restoreWalk()
                $boy.addClass('boy-rotate')
                if(callback) {
                    callback()
                }
            }
        }
    }
    var BoyToShop = function(boyObj) {
        var defer = $.Deferred();
        var door = $('.door')
        var doorL = $('.door-l');
        var doorR = $('.door-r');
        function doorAction(left, right, time) {
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
        function openDoor(time) {
            return doorAction('-50%', '100%', time);
        }
        function shutDoor(time) {
            return doorAction('0%', '50%', time);
        }
        // 取花
        function talkFlower() {
            var defer = $.Deferred()
            boyObj.talkFlower()
            setTimeout(function () {
                defer.resolve()
            }, config.setTime.waitFlower)
            return defer
        }
        // 灯的动画的处理
        var lamp = {
            elem: $('.b-bg'),
            bright: function () {
                this.elem.addClass('lamp-bright')
            },
            dark: function () {
                this.elem.removeClass('lamp-bright')
            }
        };
        var waitOpen = openDoor(config.setTime.openDoorTime);
        waitOpen.then(function() {
            lamp.bright();
            return boyObj.toShop(door, config.setTime.walkToShop)
        }).then(function() {
            return talkFlower()
        }).then(function() {
            return boyObj.outShop(config.setTime.walkOutShop)
        }).then(function() {
            shutDoor(config.setTime.shutDoorTime);
            lamp.dark();
            defer.resolve()
        });
        return defer
    };
    // 飘雪
    function snowflake() {
        var $flakeContainer = $('#snowflake')

        // 取六张图
        function getImageNames() {
            return config.snowflakeURL[[Math.floor(Math.random() * 6)]]
        }
        function createSnowBox() {
            var url = getImageNames()
            return $('<div class="snowbox" />').css({
                'width': 41,
                'height': 41,
                'position': 'absolute',
                'backgroundSize': 'cover',
                'zIndex': 100000,
                'top': '-41px',
                'backgroundImage': 'url(' + url + ')'
            }).addClass('snowRoll')
        }
        // begin
        setInterval(function() {
            // 运动轨迹
            var startPositionLeft = Math.random() * $contentW - 100,
                startOpacity = 1,
                endPositionTop = $contentH - 40,
                endPositionLeft = startPositionLeft -100 + Math.random() * 500,
                duration = $contentH * 10 + Math.random() * 5000;

                // 设置随机透明度 不下于0.5
                var randomStart = Math.random() < 0.5 ? startOpacity : randomStart
                var $flake = createSnowBox()

                // 起点位置
                $flake.css({
                    left: startPositionLeft,
                    opacity: randomStart
                })

                $flakeContainer.append($flake)

                // 执行动画
                $flake.transition({
                    top: endPositionTop,
                    left: endPositionLeft,
                    opacity: 0.7
                }, duration, 'ease-out', function() {
                    $(this).remove()
                })
        }, 200)
    }
    // 背景音乐
    function Html5Audio(url, isloop) {
        var audio = new Audio(url)
        audio.autoPlay = true
        audio.loop = isloop || false
        audio.play()
        return {
            end: function(callback) {
                audio.addEventListener('ended', function() {
                    callback()
                }, false)
            }
        }
    }
};

$(function() {
    Mxc()
});

// 内部定义一个Swipe工厂方法，内部会产生一个swipe的滑动对象
// 暴露了scrollTo的接口
// JavaScript中没有抽象类与接口的支持，所以很大程度上实现封装都是靠闭包去模拟

function Swipe(container) {
    // 滑动的对象
    var swipe = {};

    // var container = $("#content");
    // 获取第一个子节点
    var element = container.find(":first");
    // li页面数量
    var slides = element.find("li");
    // 获取容器尺寸
    var width = container.width();
    var height = container.height();
    // 设置li页面总宽度
    element.css({
        width  : (slides.length * width) + 'px',
        height : height + 'px'
    });
    // 设置每一个页面li的宽度
    $.each(slides, function(index) {
        var slide = slides.eq(index); //获取到每一个li元素    
        slide.css({
            width: width + 'px',
            height: height + 'px'
        })
    });
    swipe.onScroll = function (x, time) {
        // 在5s内匀速移动x的位置，为两个页面单位
        element.css({
            'transition-timing-function': 'linear',
            'transition-duration': time + 'ms',
            'transform': 'translate3d(-' + x + 'px, 0px, 0px)'
        })
        return this;
    }
    return swipe;
}