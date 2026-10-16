import { describe, expect, it } from 'vitest';
import { celsiusToFahrenheit } from '../src/temperature';

describe('celsiusToFahrenheit — показова частина', () => {
  it('перетворює 0 °C на 32 °F', () => {
    // Arrange
    const celsius = 0;
    // Act
    const result = celsiusToFahrenheit(celsius);
    // Assert
    expect(result).toBe(32);
  });

  it('перетворює 100 °C на 212 °F', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('повертає −40 °F для −40 °C', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it('відхиляє нечислову температуру NaN', () => {
    expect(() => celsiusToFahrenheit(Number.NaN)).toThrow(
      'INVALID_TEMPERATURE',
    );
  });
});
