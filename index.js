// Кладём секреты из файла .env в process.env
require('dotenv').config();

const cookieParser = require('cookie-parser');
const connectEnsureLogin = require('connect-ensure-login');
const express = require('express');
const expressSession = require('express-session');
const hbs = require('hbs');
const passport = require('passport');
const passportGithub = require('passport-github');

// Создаём стратегию для аутентификации через GitHub
const strategy = new passportGithub.Strategy(
    {
        // clientID и clientSecret – реквизиты нашего приложения в GitHub
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        // Адрес, на который пользователь будет возвращён после авторизации в GitHub
        callbackURL: 'http://localhost:3000/login/return'
    },
    (accessToken, refreshToken, profile, done) => {
        // В этом месте можно сохранить пользователя в свою базу
        // или найти уже существующего в базе по данным из `profile`
        //
        // User.findOrCreate(profile.username, (err, profile) => {
        //     done(err, profile);
        // });

        // Чтобы завершить процесс аутентификации необходимо вызвать `done`
        // и передать туда профиль пользователя – исходный или дополненный из базы
        done(null, profile)

        // Чтобы отменить аутентификацию отправляем false
        // done(null, false)
    }
);

// Подключаем созданную стратегию
passport.use(strategy);

const app = express();

app.set('view engine', 'hbs');

// Подключаем, чтобы получить доступ к сессионной куке
app.use(cookieParser());

// Подключаем, чтобы управлять сессиями аутентифицированных пользователей.
app.use(expressSession({
// Сессии содержат id сессии и данные пользователя
// (или id пользователя, если данные хранятся в базе).
//
// Как только пользователь аутентифицируется, мы создаём его сессию с уникальным id.
// кладём её в хранилище (по умолчанию, в память), связываем с данными пользователя.
//
// Затем подписываем сессию секретом и кладём в cookie `connect.sid`.
//
// При обновлении страницы, мы читаем cookie `connect.sid`,
// получаем из неё id  и смотрим, нет ли в хранилище существующей сессии.
//
// Если есть, то считаем пользователя уже аутентифицированным.

    // Секрет, для подписи сессионной cookie, чтобы её нельзя было подделать
    secret: process.env.EXPRESS_SESSION_SECRET,
    // Указываем, нужно ли сохранять сессию, даже если она не была изменена
    resave: false,
    // Указываем, нужно ли сохранять новую, но не измененную сессию
    saveUninitialized: false,
    // Указываем хранилище (по умолчанию, в памяти)
    // store: new require('connect-mongo')(expressSession)(options)
}));

// Определяем функцию для сохранения данных пользователя в сессию
passport.serializeUser((profile, done) => {
    // Мы можем сохранить целиком
    done(null, profile);

    // Или, например, только id из базы:
    //
    // done(null, profile.id);
});

// Определяем функцию для получения данных пользователя из сессии
passport.deserializeUser((profile, done) => {
    // Мы сохранили целиком, поэтому данные уже готовы
    done(null, profile);

    // Если бы мы сохранили только id пользователя,
    // то понадобилось бы в начале сходить в базу:
    //
    // User.findById(id, (err, profile) => {
    //     done(err, profile);
    // });
});

app.use(passport.initialize());

// Подключаем механизм сессий к Passport.js
app.use(passport.session());

// Главная страница
app.get(
    '/',
    (req, res) => res.render('home', { user: req.user })
);

// Маршрут для входа
app.get(
    '/login',
    // Аутентифицируем пользователя через стратегию GitHub
    // Если не удается, отправляем код 401
    passport.authenticate('github')
);

// Маршрут, на который пользователь будет возвращён после авторизации на GitHub
app.get(
    '/login/return',
    // Заканчиваем аутентифицировать пользователя
    // Если не удачно, то отправляем на /
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => res.redirect('/')
);

// Маршрут для просмотра профиля пользователя
app.get(
    '/profile',
    // Если пользователь не аутентифицирован, то отправляем на /
    connectEnsureLogin.ensureLoggedIn('/'),
    // Иначе показываем его профиль
    (req, res) => res.render('profile', { user: req.user })
);

// Маршрут для выхода пользователя
app.get(
    '/logout',
    (req, res) => {
        // Удаляем сессию пользователя из хранилища
        req.logout();
        // И отправляем на /
        res.redirect('/');
    }
);

app.listen(3000);
