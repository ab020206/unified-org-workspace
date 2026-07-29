import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        background: 'var(--background)',
        surface: {
          DEFAULT: 'var(--surface)',
          secondary: 'var(--surface-secondary)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--muted-text)',
        },
        foreground: 'var(--foreground)',
        muted: {
          DEFAULT: 'var(--surface-secondary)',
          foreground: 'var(--text-secondary)',
        },
        accent: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        border: 'var(--border)',
        divider: 'var(--divider)',
        ring: 'var(--ring)',
        destructive: {
          DEFAULT: 'var(--error)',
          foreground: 'var(--primary-foreground)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',

        // Legacy module accent mappings aligned with Handcrafted Enterprise Palette
        forge: {
          slate: 'var(--text-primary)',
          blue: 'var(--primary)',
          purple: 'var(--primary)',
          green: 'var(--success)',
          cyan: 'var(--primary)',
          red: 'var(--error)',
          amber: 'var(--warning)',
        },
      },
      transitionDuration: {
        DEFAULT: '200ms',
        150: '150ms',
        180: '180ms',
        200: '200ms',
      },
      borderRadius: {
        xl: '0.75rem',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};

export default config;
