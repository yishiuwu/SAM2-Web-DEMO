<!-- This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. -->
## Setup
Download sam2 checkpoint from [here](https://github.com/facebookresearch/sam2/tree/main?tab=readme-ov-file#model-description) and put it in the directory `/backend`. In our implement, we use `sam2.1_hiera_base_plus`. 

Change the setting in `/backend/image_segment.py` if you would like to use other checkpoints.

To demo, just run the docker according to [docker setting](#docker-environment-command) and visit [localhost:3000](localhost:3000).

## Docker environment command
Please make sure Docker Desktop is running and run the following command under the directory `/flask-demo`.
- Rebuild container after updating codes and run the container <br/>
    `docker compose up --build -d`
- Run the container without rebuilding <br/>
    `docker compose up`
- Turn down the container  <br/>
    `docker compose down`

## Reference
- [SAM2](https://github.com/facebookresearch/sam2/tree/main)
<!-- style transfer -->
