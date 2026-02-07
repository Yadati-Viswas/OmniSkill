import React, { useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();

  useEffect(() => {
    login({ username: 'tester', email: 'tester@example.com' }, 'token-123');
  }, [login]);

  return (
    <div data-testid="status">
      {isAuthenticated ? user?.username : 'logged-out'}
    </div>
  );
};

describe('AuthContext', () => {
  it('stores token and user on login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('tester');
    });

    expect(localStorage.getItem('token')).toBe('token-123');
    expect(localStorage.getItem('user')).toContain('tester');
  });
});
