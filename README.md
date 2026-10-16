# Лабораторна робота №1 — автоматизація тестування

**Дисципліна:** Автоматизація тестування. **Варіант №9:** перевірка рядка на
паліндром без урахування регістру й пробілів; відхилення порожнього рядка.

## Структура

```text
qa-automation-variant9/
├── src/
│   ├── temperature.ts       # показова частина
│   └── palindrome.ts        # індивідуальне завдання №9
├── tests/
│   ├── temperature.test.ts
│   └── palindrome.test.ts
├── tools/
│   └── verify-with-node.test.mjs  # незалежна офлайн-перевірка
├── evidence/               # журнал виконаної офлайн-перевірки
├── .gitignore
├── .prettierignore
├── .prettierrc
├── eslint.config.mjs
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Встановлення (Node.js 20.19+)

```bash
npm install
npm test
npm run coverage
npm run lint
npm run typecheck
npm run format:check
```

`npm install` також генерує `package-lock.json`. Для повторюваних наступних
встановлень після коміту lock-файлу використовуйте `npm ci`.

**Режим спостереження:** `npm run test:watch`. Він перезапускає тести під час
змін файлів; вихід клавішею `q`. Для демонстрації хибного тесту тимчасово
замініть очікуване значення `true` на `false` в одному тесті, простежте
помилку та поверніть правильне значення.

**HTML-покриття:** після `npm run coverage` відкрийте `coverage/index.html`.
Мінімальні пороги: рядки 80%, гілки 80%, функції 100%.

**Форматування:** `npm run format` автоматично форматує файли.

## Очікувана поведінка

- `isPalindrome('Козак з казок')` → `true`;
- `isPalindrome('Я несу гусеня')` → `true`;
- `isPalindrome('Програма')` → `false`;
- `isPalindrome('Ї')` → `true`;
- `isPalindrome('')` → помилка `EMPTY_STRING`;
- `isPalindrome('   ')` → помилка `EMPTY_STRING`.

Ігноруються **тільки регістр та пробільні символи**. Пунктуація не
видаляється, відповідно до формулювання варіанта. Поведінка для рядків з
емодзі коректна завдяки посимвольному перевертанню `Array.from()`.

## Додаткова незалежна перевірка без npm (Node.js 22+)

```bash
npm run verify:offline
```

Це **не Vitest** і не замінює перевірки `npm test`, `npm run coverage`,
`npm run lint`, яка вимагається методичними вказівками. Вона призначена для
самостійної перевірки основної логіки, якщо залежності тимчасово недоступні.

## Публікація репозиторію та Pull Request

Проєкт підготовлено як локальний Git-репозиторій, із гілкою
`feature/lab1-palindrome`. Для публікації створіть порожній репозиторій на
GitHub, а далі в каталозі проєкту виконайте:



Перед цим бажано виконати `npm install` і закомітити створений
`package-lock.json`:

```bash
git add package-lock.json
git commit -m "Lab 1: lock dependencies"
```

На GitHub відкрийте Pull Request **з** `feature/lab1-palindrome`
**до** `main`. Запишіть реальні посилання на репозиторій і PR до звіту.

**Примітка:** вихідний архів не містить `node_modules/` і `coverage/`.
