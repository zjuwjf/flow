const { Flow } = require('./../output/src/Flow.js')

new Flow()
    .log('all start')
    .all(
        new Flow().map(1).wait(1000),
        new Flow().map(2).wait(2000),
        new Flow().map(3).wait(3000),
        new Flow().map(4).wait(4000))
    .map(JSON.stringify)
    .log('{_} all end')
    .invoke()

new Flow()
    .log('race start')
    .race(
        new Flow().map(1).wait(1000),
        new Flow().map(2).wait(2000),
        new Flow().map(3).wait(3000),
        new Flow().map(4).wait(4000))
    .map(JSON.stringify)
    .log('{_} race end')
    .invoke()