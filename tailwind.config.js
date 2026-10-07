/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./black-alunos/index.html', './black-alunos/obrigado.html', './black-alunos/design-system.html', './black-alunos/js/**/*.js'],
  theme: {
    screens: {
      sm: '641px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        line: 'var(--border)',
        body: 'var(--text)',
        muted: 'var(--text-muted)',
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        action: 'var(--action)',
        'action-ink': 'var(--action-ink)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['"Open Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      borderRadius: { card: '12px' },
      maxWidth: { content: '1280px', prose: '65ch' },
      transitionTimingFunction: { out: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
};
