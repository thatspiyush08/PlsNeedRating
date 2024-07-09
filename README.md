
# Rankenstein
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
  - [View and select recent contests](#view-and-select-recent-contests)
  - [Top Rankings](#top-rankings)
  - [Username Search](#username-search)
  - [Participant Details](#participant-details)
- [Getting Started](#getting-started)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)

## Introduction

PlsNeedRating is a web application that allows users to view recent contests on Codeforces, select a contest to display the top rankings, and search for a specific username. Users can view their own performance and others’ performance in the contests.

### Built With
- [Next.js](https://nextjs.org/)

## Features

### View and select recent contests
Displays a list of recent Codeforces contests. Users can select any contest that they want to view.

![SC01](https://github.com/thatspiyush08/PlsNeedRating/assets/119056415/56e93c0d-6d24-4e95-ab57-ac5d34f180b2)



### Top Rankings

Display the top contestants for the selected contest.

![SC02](https://github.com/thatspiyush08/PlsNeedRating/assets/119056415/b328ec8c-ae17-4e9c-ad00-fa6a4b939479)


### Username Search
Search for a specific username to see their performance in the selected contest.

![SC03](https://github.com/thatspiyush08/PlsNeedRating/assets/119056415/b7875c35-8478-4ef1-b3df-645b0d866d59)


### Participant Details
Display the searched participant’s performance if they participated. 

![SC05](https://github.com/thatspiyush08/PlsNeedRating/assets/119056415/700abf76-55b3-440e-a38c-37d4401ad818)

Otherwise, inform the user if the searched username did not participate in the selected contest.
![SC04](https://github.com/thatspiyush08/PlsNeedRating/assets/119056415/6e1abf2a-632a-4507-93ba-1b6ecbe047b0)


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

## Contributing

If you want to contribute, please fork the repository and use a feature branch. Pull requests are warmly welcome.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

