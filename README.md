# BetterPuertoPrincesa Blog

The blog for [BetterPuertoPrincesa.org](https://betterpuertoprincesa.org), served at **blog.betterpuertoprincesa.org**.

Built with Next.js 16 and Tailwind CSS 4. Post data is stored in Firebase Firestore, images are stored in Vercel Blob, and posts are written in a rich text editor at `/admin`. Colors, fonts and layout pieces are carried over from the main portal so both sites feel like one.

## How it fits together

| Part           | Where                                    | Notes                                                                |
| -------------- | ---------------------------------------- | -------------------------------------------------------------------- |
| Public pages   | `src/app/page.tsx`, `posts/`, `tags/`    | Read Firestore on the server, cached with the `posts` cache tag      |
| Editor         | `src/app/admin/`, `src/components/admin` | Google sign-in, Tiptap editor                                        |
| Images         | `src/app/api/upload/route.ts`            | Uploads go straight to Vercel Blob after the route checks the editor |
| Writes         | `src/app/admin/actions.ts`               | Server actions check the user's ID token and the `editors` list      |
| Theme          | `src/app/globals.css`                    | Palette and fonts ported from the main repo's `src/index.css`        |
| Firebase rules | `firestore.rules`                        | Firestore is closed to browsers; only the server reads and writes it |

When an editor saves or publishes, the server cleans the HTML (see `src/lib/sanitize.ts`), writes it to Firestore and refreshes the `posts` cache, so changes show up right away without a redeploy.

## Firebase setup

1. Create a Firebase project (or reuse one) and add a **Web app**.
2. **Authentication**: enable the Google sign-in provider. Under Settings, add `blog.betterpuertoprincesa.org` (and `localhost`) to Authorized domains.
3. **Firestore**: create a database in production mode.
4. Deploy the rules from this repo:
   ```sh
   npx firebase-tools login
   npx firebase-tools use --add   # pick the project
   npx firebase-tools deploy --only firestore:rules
   ```
5. Generate a service account key (Project settings, Service accounts, Generate new private key). Its values go into the server env vars below.

### Adding an editor

1. The person signs in at `/admin`. They'll see a "No editor access" message with their user ID.
2. In the Firebase console, create a document in the `editors` collection with that user ID as the document ID. Any fields are fine, for example `{ name: "Juan dela Cruz" }`.
3. They reload `/admin` and can start writing.

Remove the document to take access away.

## Images

Images are resized in the editor's browser before upload: longest side 1600px, saved as WebP, location data removed. Pages show them as they are stored.

## Local development

```sh
cp .env.example .env.local   # fill in the Firebase values
npm install
npm run dev
```

Open http://localhost:3000 for the blog and http://localhost:3000/admin for the editor.

The site still builds and runs without Firebase values; it just shows no posts.

Other scripts: `npm run lint`, `npm run typecheck`, `npm run format`.

## Deploying to Vercel

1. Import this repository in Vercel. The framework is detected as Next.js; no build settings need changing.
2. Under **Storage**, create a **Blob** store and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` for you.
3. Add the remaining environment variables from `.env.example` for Production and Preview. For `FIREBASE_PRIVATE_KEY`, paste the whole key including the BEGIN and END lines.
4. Under **Settings, Domains**, add `blog.betterpuertoprincesa.org`.
5. Point DNS at Vercel by adding a CNAME record wherever betterpuertoprincesa.org's DNS is managed:

   | Type  | Name   | Value                  |
   | ----- | ------ | ---------------------- |
   | CNAME | `blog` | `cname.vercel-dns.com` |

   If the domain already uses Vercel nameservers, Vercel adds this for you.

Preview deployments are kept out of search engines automatically (see `src/app/robots.ts`).

## Keeping the look in sync

The palette, fonts and shared pieces (`PageHeader`, `BalayongBranch`, `SocialIcon`, navbar and footer styling) are copied from the main portal. When the main site's `src/index.css` or those components change, copy the changes here too.

## Contributing

`main` is production and deploys automatically. Work happens on `feat/`, `fix/` and similar branches, merged through pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
