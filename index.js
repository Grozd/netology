#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
    .commandDir('./cmds')
    .demandCommand(1, 'необходимо ввести минимум одну команду')
    .usage("Usage: myApp [команда] [опции]")
    .example([
        ["myApp current", "вывод: 2023-06-06T20:34:23.089Z"],
        ["myApp add -d 1","вывод: 7"],
        ["myApp sub -y 1", "вывод: 2022"]
    ])
    .alias('version', 'v')
    .alias('help', 'h')
    .version(false)
    .argv