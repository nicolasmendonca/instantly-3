import { InstantlyFirebaseClient } from "instantly-firebase-client";
import type { InstantlyClient } from "instantly-client";

export const instantlyClient: InstantlyClient = new InstantlyFirebaseClient();
export * from "instantly-client";
