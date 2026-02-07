import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const localStorageMock = (function () {
    let store: Record<string, string> = {};
    return {
        getItem(key: string) {
            return store[key] || null;
        },
        setItem(key: string, value: string) {
            store[key] = value.toString();
        },
        removeItem(key: string) {
            delete store[key];
        },
        clear() {
            store = {};
        },
        length: 0,
        key(index: number) {
            return "";
        }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});
