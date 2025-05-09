 How to add Firebase service account json files to Vercel

If you're using Firebase, Next.js, Vercel, firebase-admin, and if you've been Googling for the past hour on how to load your Google service account JSON file the easiest way possible, then you've come to the right place.

This blog post explains how to store the service account json file in a single environment variable and then pass it down to the Firebase admin SDK.

Here's how to do it:
1. Download the service account JSON file

Follow the steps at https://firebase.google.com/docs/admin/setup and download the JSON file.
2. Remove line breaks on the JSON file

Go to https://www.textfixer.com/tools/remove-line-breaks.php and paste the content of the JSON file.

Do not remove the \n characters from the private_key fields or the key won't be valid afterwards.
3. Create a new Vercel environment variable with the JSON content

Either via a command line:

vercel env add FIREBASE_SERVICE_ACCOUNT_KEY
? What’s the value of FIREBASE_SERVICE_ACCOUNT_KEY?

(paste the JSON content and submit)

Or via the Vercel web ui: https://vercel.com/docs/environment-variables

In both cases, the value will be encrypted.
4. Use it locally in .env.local

This is the tricky part, because you have to use single quotes instead of double quotes when surrounding the environment variable value in your file.

I am using the gitignored .env.local as explained in the Next.js documentation: https://nextjs.org/docs/basic-features/environment-variables#loading-environment-variables.

# .env.local
FIREBASE_SERVICE_ACCOUNT_KEY='JSON file content without line breaks'

5. Use the environment variable

Here's an example Next.js api route that will receive a Firebase id token and verify it. See https://firebase.google.com/docs/auth/admin/verify-id-tokens#web

// pages/api/user.ts

import * as admin from "firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  uid: string;
};

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

// example usage 
export default async function revenueCatApi(
  req: NextApiRequest,
  res: NextApiResponse<Data>
): Promise<void> {
  const firebaseToken = req.headers?.authorization?.split(" ")[1];

  if (!firebaseToken) {
    res.status(404).end();
    return;
  }

  const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

  res.status(200).json({ uid: decodedToken.uid });
}

That's it! Hope this helps.