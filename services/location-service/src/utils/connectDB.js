import mongoose from "mongoose";

function normalizeUri(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function attemptConnection(uri) {
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);
  return conn;
}

const connectDB = async () => {
  const primaryUri = normalizeUri(process.env.MONGO_URI);
  const fallbackUri = normalizeUri(process.env.MONGO_URI_FALLBACK);

  const candidates = [...new Set([primaryUri, fallbackUri].filter(Boolean))];
  if (candidates.length === 0) {
    console.error("MONGO_URI is not configured. Please set it in the environment.");
    process.exit(1);
  }

  let lastError = null;
  for (const uri of candidates) {
    try {
      await attemptConnection(uri);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Failed to connect to MongoDB at ${uri}: ${error.message}`);
    }
  }

  console.error("Unable to connect to any MongoDB instance. Exiting.");
  if (lastError) {
    console.error(lastError);
  }
  process.exit(1);
};

export default connectDB;
