function boyWalk() {
    var $content = $('#content');
    var $containerW = $content.width();
    var $contentH = $content.height();
    var $boy = $('#boy');
   
    var getValue = function (className) {
        var $element = $(className);
        return {
            height: $element.height(),
            top: $element.position().top
        }
    };

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
        $boy.addClass('slow-walk');
    }

    // 恢复走路
    function pauseWalk() {
        $boy.removeClass('pause-walk');
    }

    function calculateDist(direction, proportion) {
        return (direction == 'x' ? $containerW : $contentH) * proportion
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
        addWalk();
        var d1 = startRun ({
            'left': distX + 'px',
            'top': distY ? distY+ 'px' : undefined
        }, times)
        return d1;
    }
    return {
        walkTo: function (times, distX, distY) {
            var distX = calculateDist('x', distX);
            var distY = calculateDist('y', distY);
            return walkRun(times, distX, distY);
        },
        stopWalk: function () {
            addWalk()
        },
        setColor: function (value) {
            $boy.css('background-color', value)
        }
    }
}
