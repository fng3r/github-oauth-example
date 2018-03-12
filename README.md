# Пример организации авторизации с использованием Passport.js и GitHub

## Подключаем приложение на GitHub

0. Знакомимся [с Passport.js](http://www.passportjs.org/docs/authenticate/)
1. Заходим на https://github.com/settings/developers
2. Создаём новое приложение
3. Создаём файл **.env** в корне примера
4. Добавляем полученные clientID и clientSecret в **.env**
```ini
GITHUB_CLIENT_ID=a734c7ed99d8978000b
GITHUB_CLIENT_SECRET=527b750fff429479f5690b974be29d4d0a7fdf
```
5. Генерируем случайным образом секрет для подписывания сессионной cookie в **.env**
```ini
EXPRESS_SESSION_SECRET=f9u402bvcyafа4a2j8vuv
```

## Запускаем приложение

```sh
npm install
npm start
```

Открываем приложение  
http://localhost:3000/
