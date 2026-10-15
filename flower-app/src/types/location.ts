// Shapes shared by the location screen and the API client. The API (flower-api) is the source of
// truth: it rounds and validates every request again and stores the location in Neon.

/** What the app sends: coordinates already rounded to about 1 km. */
export type LocationInput = { placeName: string; latitude: number; longitude: number };

/** What the server returns for a saved location. */
export type SavedLocation = LocationInput & { createdAt: string; updatedAt: string };
