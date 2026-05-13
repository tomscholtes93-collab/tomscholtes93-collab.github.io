// Satori VDOM template — no React runtime, just shape.
export function ogTemplate() {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0E0E0C',
        color: '#F4EFE6',
        padding: 80,
        fontFamily: 'Instrument Serif',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Inter',
                    fontSize: 22,
                    color: '#C4623A',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 24,
                  },
                  children: 'Tom Scholtes · Luxembourg',
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 96, lineHeight: 1.02, letterSpacing: -2 },
                  children: 'Six years in fund services,',
                },
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 96, lineHeight: 1.02, letterSpacing: -2, color: '#E37B4F' },
                  children: 'quietly automated.',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Inter',
              fontSize: 28,
              color: '#D6D1C7',
              maxWidth: 900,
            },
            children:
              'Personal site, live CV, and a portfolio of automation work I’ve built inside my role.',
          },
        },
      ],
    },
  };
}
