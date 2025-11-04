import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

class DatabasesConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    // Configuration
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log(" MongoDB connected successfully");
      this.isConnected = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error(" MongoDB connection error:", err.message);
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn(" MongoDB disconnected");
      this.handleDisconnection();
    });

    process.on("SIGTERM", this.handleAppTermination.bind(this));
  }

  async connected() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MongoDB URI is not defined in environment variables");
      }

      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0;
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(`🔄 Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return this.connected();
    } else {
      console.error(`🚫 Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected) {
      console.log("Attempting to reconnect to MongoDB...");
      this.connected();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log(" MongoDB connection closed through app termination");
      process.exit(0);
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

const dbConnection = new DatabasesConnection();

export default dbConnection.connected.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
