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