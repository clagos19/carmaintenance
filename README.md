# Car Care

A mobile-first web app for tracking maintenance on your cars. Built for iPhone (add it to your Home Screen) with Canadian defaults: kilometers, CAD prices, Mr. Lube, Kal Tire and dealer service, winter tire swaps.

## Features

- **Garage** with any number of cars, each with a summary of what needs doing now and soon.
- **Add a car** by brand, model and year (about 40 brands and 500 models, or type your own), then either build a quick profile or just get started.
- **Spec lookup** from a bundled spec sheet of popular models sold in Canada, plus optional VIN decoding through NHTSA's free vPIC service. Anything guessed is marked *Assumed* on the maintenance screen and can be changed in one tap.
- **Top, side and engine views** of the car with hotspots on each maintenance item. Swipe through the jobs for each view; overdue items are red, upcoming ones amber.
- **Odometer** that saves as you type, plus **KM auto**, which estimates today's kilometers from your average daily driving each time the app opens. Estimates are marked so you can correct them.
- **Task details**: why it matters, rough cost at Mr. Lube, Kal Tire, the dealer or DIY, materials, step-by-step DIY instructions and YouTube how-to searches for your exact car.
- **Mark as done** to reset the task and see when it is due next.
- **Book** with a provider, bundle other due jobs into the same visit, save the appointment and add it to your calendar.
- **Scan a receipt** with the Scan button on a car's page. Claude reads the photo and offers to mark the matching jobs as done. Uses your own Anthropic API key, stored only on the phone (about a cent per scan).
- **Quiet jobs**: washer fluid and tire pressure don't raise alerts by default, since the dashboard already warns about them. Turn alerts on (or off for any other job) from the job's sheet.
- **History**: the History button on a car's page lists every service you've logged, newest first, with the date and km at the time. Each job's page shows its last service at the top.
- **Receipt photos**: scanned receipts keep a compressed photo on the phone (IndexedDB). Open it from History, the job's page or the Receipts list, and save it to Photos from there. Backups include the photos.
- **Tire tread**: on the tire jobs, add tire sets (winter, all-season…) and log tread per tire in 32nds with date and km. Tire replacement is then driven by the most worn tire (winter: flag at 6/32, replace at 5/32; all-season/summer: 4/32 and 3/32), with a km projection once there are two readings.
- **Back up and restore** your data as a file. Everything else stays on your phone.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173, also on your network for testing on a phone
npm test
npm run build    # static site in dist/
```

## Deploy

`.github/workflows/pages.yml` publishes `main` to GitHub Pages. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions** once.
On iPhone, open the site in Safari, tap **Share → Add to Home Screen**.

## Notes

- Spec sheet values are typical for recent model years and are a starting point, not a substitute for the owner's manual.
- Costs are rough Canadian estimates before tax.
