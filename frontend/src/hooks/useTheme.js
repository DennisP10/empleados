import { useState, useEffect } from 'react';

function useTheme() {
  // Intentar obtener el tema guardado, si no, usar 'light'
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  const [theme, setTheme] = useState(savedTheme);

  useEffect(() => {
    // Cuando el estado 'theme' cambia:
    const root = window.document.documentElement;

    // 1. Quitar clases anteriores
    root.classList.remove('dark-mode', 'high-contrast-mode');

    // 2. Agregar la clase correspondiente (si no es 'light')
    if (theme === 'dark') {
      root.classList.add('dark-mode');
    } else if (theme === 'high-contrast') {
      root.classList.add('high-contrast-mode');
    }

    // 3. Guardar preferencia
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return [theme, setTheme];
}

export default useTheme;