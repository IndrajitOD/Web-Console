# Web Console

A mobile-first React practice CRM inspired by a motor-claims customer survey workflow. Sample call and customer information is fictional. Survey answers are saved in this browser using local storage; no real calls are placed and no backend is connected.

## Run locally

```sh
npm install
npm run dev -- --host 0.0.0.0
```

Open the local address printed by Vite on your computer. To try the app from a phone on the same Wi-Fi, use the Network address printed by Vite.

## Practice flow

- Use the sticky top navigation to switch between Claim experience and Syllabus.
- Change yes/no answers and 1–10 ratings, then add optional agent notes.
- Finish or reset the practice form. Survey answers persist in this browser.
- Syllabus lists the 15 basic policy topics.
