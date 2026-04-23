import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const author = await client.fetch(
  `*[_type == "author" && slug.current == "andrew-watson"][0]{_id, name, role, bio, location}`
);

if (!author) {
  console.error('Author andrew-watson not found');
  process.exit(1);
}

console.log('BEFORE:', author);

const updated = await client
  .patch(author._id)
  .set({
    role: 'Co-Founder @ Igloo Media Group, Dollar Commerce',
    bio: 'A former professional tennis player on the ATP Tour. Co-founded a DTC startup, exiting to Agora Brands in 2021. Co-founder of Igloo Media Group. Based in London.',
    location: 'London',
  })
  .commit();

console.log('AFTER:', { _id: updated._id, role: updated.role, bio: updated.bio, location: updated.location });
