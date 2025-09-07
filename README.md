# Hangout Hub

A map-first social meetup application for discovering hangout spots and coordinating group meetings with live location sharing.

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Google Maps API Key (required)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Google Maps Map ID (optional - for custom styled maps)
GOOGLE_MAPS_MAP_ID=your_map_id_here
```

## Getting Started

1. Install dependencies:
```bash
npm i
```

2. Set up your environment variables in `.env`

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Map-first interface with Google Maps integration
- Advanced search with location-based filtering
- Real-time meetup coordination
- Live location sharing
- Parking availability integration
- Directions and navigation

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Google Maps (@vis.gl/react-google-maps)
- Radix UI Components

## Potential Errors
```bash
> next dev sh: next: command not found
```
from reddit (https://www.reddit.com/r/reactjs/comments/nz92v1/next_command_not_found/) - works for me on 6 Sep
If you have encountered the above error i would suggest doing the below steps.
```
Type in your terminal : nano ~/.zshrc.
Add the very end of the "zshrc" file add the below lines which add locally installed node_modules/.bin to PATH
export PATH="./node_modules/.bin:$PATH"
Press CTRL + X to exit.
Press Y to confirm saving.
Press Enter to save the file.
Type in your terminal : source ~/.zshrc
```