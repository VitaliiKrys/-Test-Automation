# Лабораторна робота №6 — Playwright (варіант 9)

Дисципліна: Автоматизація тестування. Стенд: https://www.saucedemo.com/.

## Склад роботи
- `tests/login.spec.ts` — позитивний вхід і 3 негативні сценарії.
- `tests/inventory.spec.ts` — 5 перевірок каталогу: кількість, сортування, кошик, видалення, filter.
- `tests/variant9.spec.ts` — **два незалежні тести** правильності Item total, Tax і Total для 1 і 3 товарів.
- `tests/experiments/waiting.spec.ts` — три режими (1000 мс, очікувальне твердження, 5000 мс).
- `tests/diagnostic/failing.spec.ts` — **навмисно несправний** тест для Trace Viewer (7 товарів замість 6).
- `scripts/run-experiments.mjs` — записує виміряні результати експерименту в CSV/JSON.
- `Звіт_ЛР6_Варіант9.docx` — оформлений Word-звіт (після запуску внесіть реальні результати та скриншоти).

## Встановлення на Windows (PowerShell)
Встановити **Node.js 20 або новіший**, відкрити PowerShell у папці проєкту:

```powershell
npm install
npx playwright install chromium firefox
```

## Запуск повного набору в Chromium і Firefox
```powershell
npm test
```

Окремо індивідуальна частина:
```powershell
npm run test:variant9
```

Відкриття HTML-звіту та інтерактивного інспектора:
```powershell
npm run report
npm run test:ui
npx playwright codegen https://www.saucedemo.com
```

## Крок 6: три експерименти по 10 повторів
```powershell
npm run experiment
```

Кожен експеримент виконується послідовно в Chromium, **без паралельних воркерів**. Реальні дані: `results/experiment-results.csv`. **Не підміняйте їх припущеннями.** Якщо стенд недоступний, експеримент провести неможливо.

## Крок 7: трасування і навмисна помилка
```powershell
npm run test:diagnostic
npm run report
```

Тест діагностики **має падати**; це очікувана ситуація для дослідження. У `test-results/` з’явиться trace.zip, а в HTML-звіті — посилання на trace. Для перегляду вручну:
```powershell
npx playwright show-trace "ШЛЯХ_ДО_trace.zip"
```

У Trace Viewer зафіксувати три знімки: (1) стан сторінки перед помилкою; (2) вкладка **Network**; (3) вкладка **Console**. Скриншоти успішного запуску і HTML-звіту також додати до DOCX після реального виконання.




