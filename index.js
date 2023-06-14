const readline = require('node:readline');
const { stdin: input, stdout:output } = require('node:process')
const fs = require('node:fs');

function game(strLogFile) {
    // синхронный
    const inputStream = fs.createReadStream(strLogFile, { flags: 'r+', encoding: 'utf-8' })
    const outputStream = fs.createWriteStream(strLogFile, { flags: 'r+' })
    const riddleNumber = numberComp()
    let contentLogFile = []
    greeting()
    const rl = readline.createInterface({ input, output });

    inputStream.on('data', data => {
        //console.log(data, 'data event');
        contentLogFile = JSON.parse(data)
    })

    rl.on('line', line => {
        if('12'.includes(line) === false) {
            console.log('Допустимые числа ввода 1 и 2');
            return
        }
        line = parseInt(line)
        let logObj = createLog(riddleNumber, line)
        contentLogFile.push(logObj)
        let strContentLogFile = JSON.stringify(contentLogFile)
        outputStream.write(strContentLogFile)
        rl.close()
        report(contentLogFile)
    })
}
// приветствие в консоле
function greeting() {
    console.log(
        '\n================================< Орел или решка >================================\n\
        \n\tБыло загадано число (1 или 2). Пользователю требуется отгадать его\n\
        \n\tРезультаты сохраняются так же в файле логов - logResult.json\n\
        \n\tКомпьютер уже загадал число, теперь ваша очередь отгадывать\n\
        \n\tВведите число:...'
    )
}
// загаданное число компьютером
function numberComp() {
    return Math.floor(Math.random() * 2) + 1
}

/**
 * Создание объекта лога
 * @param {number} riddleNumber 
 * @param {string} line 
 * @returns {object}
 */
function createLog(riddleNumber, line) {
    let logObj = {}
    logObj['компьютер'] = riddleNumber
    logObj['игрок'] = line
    if(parseInt(line) === riddleNumber) {
        console.log('\n\tВы угадали!\n')
        logObj['победил'] = 'игрок'
        return logObj
    } else {
        console.log('\n\t< Не повезло >\n');
        logObj['победил'] = 'компьютер'
        return logObj
    }
}

function report(arrContentLogFile) {

    let totalGame = 0,
    win = 0,
    lose = 0,
    ratio = 0

    console.table(arrContentLogFile);

    arrContentLogFile.forEach(e=>{
        totalGame++
        if(e['победил'] === 'игрок') win++
        else lose++
    })
    ratio = Math.floor(win/totalGame * 100)
    console.table([{"итого игр": totalGame, "победа/поражения": `${win}/${lose}`, "% побед": ratio}])
}

game('logResult.json')