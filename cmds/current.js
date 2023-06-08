
exports.timeNow = new Date()
exports.command = 'current'
exports.aliases = 'cur'
exports.describe = 'отображает текущую дату и время в формате ISO'
exports.builder = (yargs) => {
    yargs.usage('Usage:[команда] [опции]')
    yargs.option('y', {
        alias: 'year',
        describe: 'отображает текущий год',
        type: 'boolean'
    }),
    yargs.option('m', {
        alias: 'month',
        describe: 'отображает текущий месяц',
        type: 'boolean'
    }),
    yargs.option('d', {
        alias: 'date',
        describe: 'отображает текущую дату(число)',
        type: 'boolean'
    })
}
exports.handler = (argv) => {
    const obj = {
        totalStr: '',
        addSepar: function(key, val) {
            if(key in argv && this.totalStr.length > 0) this.totalStr += ` | ${val}`
            if(key in argv && this.totalStr.length === 0) this.totalStr += val
            return this
        }
    }

    obj
    .addSepar('y', this.timeNow.getFullYear())
    .addSepar('m', this.timeNow.getMonth())
    .addSepar('d', this.timeNow.getDate())

    if(obj.totalStr) console.log(obj.totalStr);
    else console.log(this.timeNow.toISOString())
}