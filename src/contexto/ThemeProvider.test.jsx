import { render, screen, act, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

function ComponentePrueba() {
  const { tema, alternarTema } = useTheme();

  return (
    <div>
      <span data-testid="tema">{tema}</span>
      <button onClick={alternarTema}>Alternar tema</button>
    </div>
  );
}

function renderizarProveedor() {
  return render(
    <ThemeProvider>
      <ComponentePrueba />
    </ThemeProvider>
  );
}

describe('ThemeProvider y useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
  });

  it('inicia en tema claro si no hay un tema guardado', () => {
    renderizarProveedor();

    expect(screen.getByTestId('tema').textContent).toBe('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('claro');
    expect(localStorage.getItem('walking-dictionary-tema')).toBe('claro');
  });

  it('recupera el tema oscuro guardado en localStorage', () => {
    localStorage.setItem('walking-dictionary-tema', 'oscuro');

    renderizarProveedor();

    expect(screen.getByTestId('tema').textContent).toBe('oscuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('oscuro');
    expect(localStorage.getItem('walking-dictionary-tema')).toBe('oscuro');
  });

  it('recupera el tema claro guardado en localStorage', () => {
    localStorage.setItem('walking-dictionary-tema', 'claro');

    renderizarProveedor();

    expect(screen.getByTestId('tema').textContent).toBe('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('claro');
  });

  it('cambia de claro a oscuro al alternar el tema', async () => {
    renderizarProveedor();

    await act(async () => {
      screen.getByRole('button', { name: 'Alternar tema' }).click();
    });

    expect(screen.getByTestId('tema').textContent).toBe('oscuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('oscuro');
    expect(localStorage.getItem('walking-dictionary-tema')).toBe('oscuro');
  });

  it('cambia de oscuro a claro al alternar el tema', async () => {
    localStorage.setItem('walking-dictionary-tema', 'oscuro');

    renderizarProveedor();

    await act(async () => {
      screen.getByRole('button', { name: 'Alternar tema' }).click();
    });

    expect(screen.getByTestId('tema').textContent).toBe('claro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('claro');
    expect(localStorage.getItem('walking-dictionary-tema')).toBe('claro');
  });

  it('permite alternar el tema varias veces', async () => {
    renderizarProveedor();

    const boton = screen.getByRole('button', { name: 'Alternar tema' });

    await act(async () => {
      boton.click();
      boton.click();
      boton.click();
    });

    expect(screen.getByTestId('tema').textContent).toBe('oscuro');
    expect(document.documentElement.getAttribute('data-theme')).toBe('oscuro');
  });

  it('expone el contexto nulo por defecto cuando se usa fuera del proveedor', () => {
    function ComponenteSinProveedor() {
      const contexto = useTheme();
      return <span data-testid="contexto">{String(contexto)}</span>;
    }

    render(<ComponenteSinProveedor />);

    expect(screen.getByTestId('contexto').textContent).toBe('null');
  });
});
