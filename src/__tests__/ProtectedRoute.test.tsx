import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { User, Role } from '../types';

describe('ProtectedRoute Component', () => {
  const mockUser: User = {
    id: 'usr_1',
    name: 'Normal User',
    email: 'normal@obraservice.com',
    role: 'SITE_MANAGER',
    companyId: 'company_1',
    companyName: 'Constructora Norte',
    active: true,
    assignedProjectIds: ['project_1'],
    createdAt: new Date().toISOString(),
  };

  const mockSuperAdmin: User = {
    ...mockUser,
    role: 'SUPER_ADMIN',
    isSuperAdmin: true,
  };

  it('redirects to /login if there is no current user', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute currentUser={null}>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).toBeNull();
    expect(screen.getByText('Login Page')).toBeDefined();
  });

  it('renders children if the user is a SUPER_ADMIN', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute currentUser={mockSuperAdmin} allowedRoles={['MAIN_CONTRACTOR_ADMIN']}>
                <div>Protected Content for Admin Only</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content for Admin Only')).toBeDefined();
  });

  it('renders children if the user role is in the allowedRoles list', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute currentUser={mockUser} allowedRoles={['SITE_MANAGER']}>
                <div>Site Manager Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Site Manager Content')).toBeDefined();
  });
});
