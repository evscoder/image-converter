import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {
      screens: {
        xs: '374px',
        sm: '576px',
        md: '768px',
        lg: '1024px',
        xl: '1200px',
        '2xl': '1366px',
        hd: '1920px',
        '2k': '2560px',
        '4k': '3840px'
      }
    }
  }
} satisfies Config;
