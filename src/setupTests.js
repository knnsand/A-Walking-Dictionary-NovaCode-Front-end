/**
 * @file setupTests.js
 * @brief Configuración que Vitest ejecuta antes de cada archivo de pruebas.
 *
 * - Agrega los matchers de jest-dom (toBeInTheDocument, toHaveTextContent, etc.).
 * - Carga las traducciones (inglés) para que los componentes con useTranslation
 *   rendericen su texto en las pruebas.
 */
import '@testing-library/jest-dom';
// Carga las traducciones (inglés) para que los componentes con useTranslation
// rendericen su texto en las pruebas.
import './i18n';