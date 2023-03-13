import { InstantlyFirebaseClient } from "instantly-firebase-client";
import type { InstantlyClient } from "instantly-core";

export const instantlyClient: InstantlyClient = new InstantlyFirebaseClient();
export * from "instantly-core";
