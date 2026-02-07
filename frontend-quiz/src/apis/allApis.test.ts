import axios from 'axios';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUserApi, getAllProblemsApi } from './allApis';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('allApis', () => {
  beforeEach(() => {
    mockedAxios.mockReset();
    localStorage.clear();
  });

  it('does not attach Authorization on auth endpoints', async () => {
    localStorage.setItem('token', 'undefined');
    mockedAxios.mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });

    await loginUserApi({ identifier: 'user', password: 'password123' });

    const config = mockedAxios.mock.calls[0][0] as any;
    expect(config.url).toContain('/v1-api/auth/users/login');
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('attaches Authorization on non-auth endpoints when token is valid', async () => {
    localStorage.setItem('token', 'valid-token');
    mockedAxios.mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {}
    });

    await getAllProblemsApi(0, 10);

    const config = mockedAxios.mock.calls[0][0] as any;
    expect(config.headers.Authorization).toBe('Bearer valid-token');
  });
});
