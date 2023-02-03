const TelegramApi = require('node-telegram-bot-api')
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = '6069029355:AAFnhfUKIcyl6BG-2MxGuL95oKh1NPdZdQA'

const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `now I will guess a number from 0 to 9, and you have to guess it!`)
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber
    await bot.sendMessage(chatId, 'guess please :', gameOptions)
}

const start = async () => {

    try {
       await sequelize.authenticate()
       await sequelize.sync()
    } catch (e) {
        console.log('database connection broken', e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'first greeting'},
        {command: '/info', description: 'get user information'},
        {command: '/game', description: `'guess the number' game`}
    ])

    bot.on('message', async msg => {
        const text = msg.text
        const chatId = msg.chat.id
        
        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://sticker-collection.com/stickers/animated/TheLittleMole/thumbs/71bfedba-815d-49b6-97ad-8f8d2d673557file_2781076.jpg')
                return bot.sendMessage(chatId, `Welcome to telegram bot ${text}`)
            }
            if (text === '/info') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Your name is ${msg.from.first_name} ${msg.from.last_name}, in the game you have correct answers ${user.right}, and wrong answers ${user.wrong}`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }
            return bot.sendMessage(chatId, `I don't understand you, try again !`)
        } catch (e) {
            return bot.sendMessage(chatId, 'Some error has occurred')
        }
    })

    bot.on('callback_query', async msg => {
        const data = msg.data
        const chatId = msg.message.chat.id
        if (data === '/again') {
            return startGame(chatId)
        }

        const user = await UserModel.findOne({chatId})

        if (data == chats[chatId]) {
            user.right += 1
            await bot.sendMessage(chatId, `congratulations, you guessed the number ${chats[chatId]}`, againOptions)
        } else {
            user.wrong += 1
            await bot.sendMessage(chatId, `unfortunately you did not guess, the bot chose a number ${chats[chatId]}`, againOptions)
        }
        await user.save()
    })
}
start()