// Public asset URLs, relative to the Vite base. Kept apart from survey.js so presentation components do not pull
// in a question bank.
export const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;
