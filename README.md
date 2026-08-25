This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Tres comandos de desarrollo. Cada modo tiene puerto fijo; si está ocupado, el arranque falla (no salta a otro).

```bash
npm run dev     # http://localhost:3000  modo normal, con login
npm run demo    # http://localhost:3001  modo demo, sin login, con Simular
npm run stop    # mata lo que escuche en 3000 y 3001
```

Puedes tener `dev` y `demo` a la vez: no compiten por el puerto. Si uno se niega a arrancar, `npm run stop` limpia los dos y vuelves a lanzar el que quieras.

Detalle de mundos (local vs mecanu.com, sin staging): [`docs/ENTORNOS.md`](docs/ENTORNOS.md).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
