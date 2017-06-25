const { Flow } = require('./../output/src/Flow.js')
//
// new Flow()
//     .if(1)
//         .wait(1000)
//     .elseif(2)
//         .if(2)
//         .end()
//         .wait(3000)
//     .end()
//     .action(undefined)

// @formatter:off
new Flow()
    .log('start...')
    .wait(1000)
    .repeat(10)
    /**/.map(() => Math.random() * 100)
    /**/.wait(500)
    /**/.if(v => v > 50)
    /**//**/.log('big {_}')
    /**/.else()
    /**//**/.log('small {_}')
    /**/.end()
    .end()
    .log('repeat done!')
    .wait(1000)
    .map([1, 3, 5, 7, 9, 11])
    .forEach()
    /**/.wait(500)
    /**/.debounce(1000)
    /**/.if(v => v < 5)
    /**//**/.log('{_} < 5')
    /**/.elseif(7)
    /**//**/.log('{_} == 7')
    /**//**/.continue()
    /**/.else()
    /**//**/.log('{_} >= 5')
    /**/.end()
    /**/.log('{_}...')
    .end()
    .log('value {_}')
    .log('forEach done!')
    .while(true)
    /**/.wait(500)
    /**/.map((v) => v + 2)
    /**/.log('{_}')
    /**/.if(v => v > 20)
    /**//**/.log('{_} > 20')
    /**//**/.if(v => v > 40)
    /**//**//**/.break()
    /**//**/.end()
    /**//**/.log('...')
    /**/.end()
    .end()
    .log('while done!')
    .log('end...')
    .invoke()
// @formatter:on
