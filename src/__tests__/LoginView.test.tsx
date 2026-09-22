import { render, screen, fireEvent } from '@testing-library/react';
import { LoginView } from '../views/LoginView';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

// Minimal mock for store
vi.mock('../services/store', () => ({
  obraStore: {
    getState: () => ({ currentUser: null }),
    enterDemoMode: vi.fn(),
    login: vi.fn(() => ({ success: true })),
  },
  Role: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'MAIN_CONTRACTOR_ADMIN',
    MANAGER: 'SITE_MANAGER',
    WORKER: 'SUBCONTRACTOR_USER',
  }
}));

vi.mock('../services/firebase', () => ({
  signInWithEmail: vi.fn(),
}));

describe('LoginView Component', () => {
  it('renders correctly with Title, labels, and Demo accounts', () => {
    render(
      <MemoryRouter>
        <LoginView />
      </MemoryRouter>
    );

    expect(screen.getByText('ObraService B2B')).toBeDefined();
    expect(screen.getByText('Correo Electrónico Corporativo')).toBeDefined();
    expect(screen.getByText('Contraseña')).toBeDefined();
    expect(screen.getByText('Carlos Mendoza')).toBeDefined();
  });
});
