DEPLOY (5 minutes)
1. Put this folder on GitHub (or run `npx vercel` inside it).
2. In Vercel: Add New > Project > import it > Deploy.
3. Project > Storage (or Marketplace) > add "Upstash Redis" and connect it to the project.
4. Project > Settings > Environment Variables: add HOST_KEY = any secret word you choose.
5. Redeploy once.
6. Host opens:  https://YOUR-SITE.vercel.app/?host=YOUR_SECRET   (do this once on the host device)
7. Participants open:  https://YOUR-SITE.vercel.app   (no login)
