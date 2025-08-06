import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Internship: a
    .model({
      company: a.string().required(),
      position: a.string().required(),
      location: a.string(),
      status: a.enum(['applied', 'interview', 'offer', 'rejected', 'accepted']).default('applied'),
      applicationDate: a.date(),
      salary: a.string(),
      description: a.string(),
      notes: a.string(),
      contactEmail: a.email(),
      applicationUrl: a.url(),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});

/*== Usage Example ===============================================================
In your React components, use the Data client to interact with internships:

"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>()

// List all internships
const { data: internships } = await client.models.Internship.list()

// Create a new internship
await client.models.Internship.create({
  company: "Tech Corp",
  position: "Software Engineering Intern",
  status: "applied"
})
=========================================================================*/
