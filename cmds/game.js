const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

exports.command = 'game'
exports.describe = 'игра "Загадай число". Программа загадывает, клиент отгадывает, вводя в cmd'
exports.builder = (yargs) => {
    yargs.usage('Usage: <название приложения> нажать Enter')
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
    const rl = readline.createInterface({ input, output });
    const numSecret = Math.floor(Math.random() * 100)
    input.setEncoding('utf8')
    rl.on('line', (answer) => {
        answer = parseInt(answer)
        try {
            if(!Number.isInteger(answer)) throw new Error()
            if(answer < numSecret) {
                output.write('Больше\n')
            }
            if(answer > numSecret) {
                output.write('Меньше\n')
            }
            if(answer === numSecret) {
                output.write(`Отгадано число ${numSecret}`)
                rl.close()
            }
        } catch (error) {
            console.log('вводить нужно только цифры и строго в диапазоне');
        }

    })

    console.log('Загадано число в диапазоне от 0 до 100\n')      
}