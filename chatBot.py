from typing import List
import telebot
from telebot.types import InputMediaPhoto, Message, PhotoSize


bot = telebot.TeleBot("1299314974:AAHyMfG6UCTzR1k6kQvrgwB06r5EhFvTbQw")


@bot.message_handler(commands=["start"])
def start_command(message: Message):
    bot.send_message(message.chat.id, "Hello! Start command handled!")


@bot.message_handler(content_types=["photo"])
def photo_handler(message: Message):
    pass


bot.polling(True)
