#flow 是一个用来解决代码流程控制的库, 它非常轻量级.

##q1. 为什么前端的代码总是容易大改动?

##q2. 前端的代码能像后端代码那样分层清晰, 甚至更好么?

##q3. 你是否已经厌倦了理不清的回调函数?

##q4. 尝试了 Promise, Rx, Coroutine, 使用上仍有诸多的局限性?

##q5. 是时候来重新梳理前端的代码结构了!

#   全新的视角来看前端
#   1.基于数据绑定的UI  (viewbean) => dom,  React, Vue, Angular
#   2.从触发源的角度, 构建控制流程.
#   2.1 主动触发源.
#        life-circle, widget-event, timer.
#   2.2 被动触发源
#        forward
#   3. 一个触发源, 对应一个控制流程图, 是一个fluent风格的函数, 通过flow构建.

Run the test-flow.js  
