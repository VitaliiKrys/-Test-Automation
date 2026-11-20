// Демонстраційні облікові дані публічного навчального стенда SauceDemo.
// У промислових проєктах секрети зберігаються у змінних середовища.
export const USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
  slow: { username: 'performance_glitch_user', password: 'secret_sauce' },
} as const;

export const BUYER = {
  firstName: 'Ivan',
  lastName: 'Petrenko',
  postalCode: '88000',
} as const;
