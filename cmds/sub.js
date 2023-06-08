const timeNow = require('./current').timeNow
exports.command = 'sub'
exports.describe = 'убавляет от текущей даты указанное число(год месяц день) [option][value]]'
exports.builder = (yargs) => {
    yargs.usage('Usage:[команда] [опции] [value]')
    yargs.option('y', {
        alias: 'year',
        describe: 'убавляет от текущей даты указанное количество лет',
        type: 'number',
        requiresArg: true
    }),
    yargs.option('m', {
        alias: 'month',
        describe: 'убавляет от текущей даты указанное количество месяцев',
        type: 'number',
        requiresArg: true
    }),
    yargs.option('d', {
        alias: 'date',
        describe: 'убавляет от текущей даты указанное количество дней',
        type: 'number',
        requiresArg: true
    })
}
exports.handler = (argv) => {
    Object.keys(argv).forEach(key => {
        switch (key) {
            case 'y':
                timeNow.setFullYear(timeNow.getFullYear() - argv.y)
                break;
            case 'm':
                timeNow.setMonth(timeNow.getMonth() - argv.m)
                break;
            case 'd':
                timeNow.setDate(timeNow.getDate() - argv.d)
                break;
            default: return
        }
    })
    console.log(timeNow)
}