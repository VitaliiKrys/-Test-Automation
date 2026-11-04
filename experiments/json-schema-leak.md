# Експеримент: витік внутрішнього ownerId через API

1. Відкрити `src/app.ts`.
2. Тимчасово замінити `json(toPublic(order))` на `json(order)` лише у відповіді `POST /orders`.
3. Виконати `npm test`.
4. Тест `201; Location; calculated total; strict schema; side effect` виявить порушення контракту: поле `ownerId` не визначено у schema та заборонено через `additionalProperties: false`.
5. Звичайні перевірки `status=201`, `total=560` і `Location` при цьому можуть лишатися зеленими.
6. Повернути `toPublic(order)` і повторити тести.

Висновок: JSON Schema знаходить витоки полів, які не перевіряються простими твердженнями про статус і числові значення.
