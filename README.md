Скрипт импорта контактов из адресной книги Google
=================================================

Т.к.  это альфа версия, то для его использования нужно проделать ряд телодвижений:
* сделать экспорт из адресной книги Google в формате "Google CSV"
* сконвертировать файл из UTF-16 в UTF-8 (я пока не заморочился перекодировкой на стороне JS)
* положить этот файл в проект под именем data/google/google.json