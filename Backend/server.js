import "dotenv/config";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 3000;

// Ensure DB is connected before accepting requests
await connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});