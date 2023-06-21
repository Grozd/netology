const http = require('node:http')
const readline = require('node:readline/promises')
const readlineCb = require('node:readline')
const { stdin: input, stdout: output } = require('node:process')
const { codesErrors ,requestParameters, displaySettings } = require('./codes')
require('dotenv').config()

function State() {
    this.requiredParams = {}
    this.setUrlPathname = function() { throw Error('Вызван метод базового класса') }
    this.init = function() {
        if(this instanceof WeatherQuestion) {
            this.setUrlPathname()
        } else {
            this.setUrlSearchParams()
        }
    }
    this.greeting = function(variantWeather) {
        let i = 0
        let str = `-----Вы можете указать для запроса ${variantWeather} следующие параметры:\n\n`
        for (const key in this.requiredParams) {
            i++
            str += `${i}. ${key}- ${requestParameters[key]}\n`
        }
        return str
    }
    this.setUrlSearchParams = async function(context) {
        // создание генератора
        let inpGen = this.inputParams()
        // начальное приветствие
        console.log(context.greeting(this.greeting.bind(this, this.name)));
        for (const key of inpGen) {
            let tmp = await context.rl.question(key)
            let param = key.split(' ')[2]
            if(tmp !== 'q') context.urlObj.searchParams.append(param, tmp)
        }
        context.rl.pause()
        context.nextState(new HttpRequest())
    }
    this.inputParams = function*() {
        console.log('q - для пропуска ввода\n');
        for (const key in this.requiredParams) {
            yield `Введите параметр ${key} = `
        }
    }
}

function Autocomplete() {
    State.call(this)
    this.name = 'АВТООПРЕДЕЛЕНИЕ локации'
    this.alias = 'autocomplete'
    this.requiredParams = {
        //access_key: true,
        query: true,
        //callback: false
    }
}

function CurrentWeather() {
    State.call(this)
    this.name = 'ТЕКУЩАЯ погода'
    this.alias = 'current'
    this.requiredParams = {
        //access_key: true,
        query: true,
        units: false,
        language: false,
        //callback: false
    }
}
CurrentWeather.prototype = Object.create(State.prototype)
CurrentWeather.prototype.constructor = CurrentWeather

function WeatherForecast() {
    State.call(this)
    this.name = 'ПРОГНОЗ погоды'
    this.alias = 'forecast'
    this.requiredParams = {
        //access_key: true,
        query: true,
        forecast_days: false,
        hourly: false,
        interval: false,
        units: false,
        language: false,
        //callback: false
    }
}

WeatherForecast.prototype = Object.create(State.prototype)
WeatherForecast.prototype.constructor = WeatherForecast

function HistoricalWeather() {
    State.call(this)
    this.name = 'погода на дату В ПРОШЛОМ'
    this.alias = 'historical'
    this.requiredParams = {
        //access_key: true,
        query: true,
        historical_date: true,
        hourly: false,
        interval: false,
        units: false,
        language: false,
        //callback: false
    }
}
HistoricalWeather.prototype = Object.create(State.prototype)
HistoricalWeather.prototype.constructor = HistoricalWeather

function HistoricalTime_Series() {
    State.call(this)
    this.name = 'погода на ДИАПОЗОН В ПРОШЛОМ'
    this.alias = 'historical'
    this.requiredParams = {
        //access_key: true,
        query: true,
        historical_date_start: true,
        historical_date_end: true,
        hourly: false,
        interval: false,
        units: false,
        language: false,
        //callback: false
    }
}
HistoricalTime_Series.prototype = Object.create(State.prototype)
HistoricalTime_Series.prototype.constructor = HistoricalTime_Series

function Back() {
    State.call(this)
    this.back = function() {
        console.log('Некуда возвращаться')
    }
}
Back.prototype = Object.create(State.prototype)
Back.prototype.constructor = Back

function Exit() {
    this.stop = function() {
        console.log('\nВсего доброго!');
        process.exit(0)
    }
}

function WeatherQuestion() {
    State.call(this)
    this.strategyWeather = {
        '1': CurrentWeather,
        '2': WeatherForecast,
        '3': HistoricalWeather,
        '4': HistoricalTime_Series,
        '5': Autocomplete,
        '6': Exit
    }
    this.greeting = function() {
        return '-----Для начала нужно выбрать: текущую погоду, прогноз или погоду в прошлом:\n' +
        '1. Текущую погоду\n' +
        '2. Прогноз\n' +
        '3. Погоду в прошлом с указанием конкретной даты\n' +
        '4. Погоду в прошлом с указанием диапазона дат\n' +
        '5. Текущую погоду с поиску города по ключевым словам\n' +
        '\nВведите одну из предложенных цифр и нажмите Enter...'
    }
    this.setUrlPathname = async function(context) {
        let totalStrGreet = context.greeting(this.greeting.bind(this))
        let variantWeather = '6'
        // проверка на правильный ввод клиентом
        do {
            variantWeather = await context.rl.question(totalStrGreet)
        } while (!Object.keys(this.strategyWeather).includes(variantWeather));
        context.rl.pause()
        // какую стратегию выбрал клиент
        let newState = new this.strategyWeather[variantWeather.trim()]()
        // установка состояния
        context.nextState(newState)
        context.urlObj.pathname = newState.alias
    }
}
WeatherQuestion.prototype = Object.create(State.prototype)
WeatherQuestion.prototype.constructor = WeatherQuestion

function HttpRequest() {
    this.httpRequest = function(context) {
        http.get(context.urlObj, res => {
            res.setEncoding('utf-8')
            res.on('data', (chunk)=>{
                let resObj = JSON.parse(chunk)
                if('error' in resObj) context.handlerError(resObj)
                else context.shortOutputVersion(resObj)
            })
        })
    }
}

function InteractConsole() {
    this.urlObj = new URL(`http://api.weatherstack.com`)
    this.state = new WeatherQuestion()
    this.rl = readline.createInterface(input, output)
    this.urlObj.searchParams.append('access_key', process.env.TOKEN_API)

    this.greeting = function(cb) {
        let strOutput = '\n==============================Приложение запроса погодных условий==============================\n\n'
        strOutput += cb()
        strOutput += '\nEsc - выход'
        strOutput += '\n================================================================================================\n'
        return strOutput
    }
    // установка pathname url
    this.setUrlPathname = async function() {
        await this.state.setUrlPathname(this)
    }
    // установка searchParams url
    this.setUrlSearchParams = async function() {
        await this.state.setUrlSearchParams(this)
    }
    this.nextState = function(state) {
        if(state instanceof Exit) state.stop()
        this.state = state
    }
    this.getState = function() {
        return this.state
    }
    this.httpRequest = function() {
        this.state.httpRequest(this)
    }
    this.shortOutputVersion = function(objAnswer) {
        const {
            unitTemp,
            unitWindSpeed,
            unitPressure,
            windSpeed,
            pressure
        } = displaySettings[objAnswer.request.unit]

        let str = ''
        str += `\n==================Результаты запроса==================\n`
        str += `\nМестоположение:\t ${objAnswer.request.query}\n`
        str += `Название:\t ${objAnswer.location.name}\n`
        str += `Регион:\t\t ${objAnswer.location.region}\n`
        str += `Дата:\t\t ${objAnswer.location.localtime}\n`
        str += `Температура:\t ${objAnswer.current.temperature} ${unitTemp}\n`
        str += `Скорость ветра:\t ${windSpeed(objAnswer.current.wind_speed)} ${unitWindSpeed}\n`
        str += `Влажность:\t ${objAnswer.current.humidity} %\n`
        str += `Давление:\t ${pressure(objAnswer.current.pressure)} ${unitPressure}\n`
        str += `\n======================================================\n`
        console.log(str);
    }
    this.fullOutputVersion = function() {}
    this.handlerError = function(resAPI) {
        let str = '\n=================================Результаты запроса=================================\n'
        str += `\nОшибка запроса № ${resAPI.error.code}\n`
        str += `Тип:\t   ${resAPI.error.type}\n`
        str += `Описание:  ${codesErrors[resAPI.error.code]}\n`
        str += `\n=====================================================================================\n`
        console.log(str);
    }
    this.listenKeyPress = function() {
        let cb = async (str, key) => {
            if(key.name === 'escape') {
                console.log('\n\n Всего доброго! ');
                process.exit(0)
            }
            if(key.name === 'q') {
                process.stdin.emit('keypress', '', { sequence: '\r', name: 'return', ctrl: false, meta: false, shift: false })
            }
        }
        // прослушивание stdin на keypress
        readlineCb.emitKeypressEvents(process.stdin)
        process.stdin.setRawMode(true)
        process.stdin.on('keypress', cb)
    }
    this.startApp = async function() {
        this.listenKeyPress()
        while ((this.state instanceof HttpRequest) === false) {
            if(this.state instanceof WeatherQuestion) {
                await this.setUrlPathname()
            } else {
                await this.setUrlSearchParams()
            }
        }
        this.httpRequest(this.urlObj)
    }
}


let ic = new InteractConsole();
(async (ic)=>{
    await ic.startApp()
})(ic)