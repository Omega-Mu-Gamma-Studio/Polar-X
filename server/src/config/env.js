const path = require('path');
const dotenv = require('dotenv');

// Load .env from the server/ root regardless of where the process was started.
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

module.exports = { env: process.env };
