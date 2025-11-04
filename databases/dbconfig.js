import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

class DatabasesConnection{
    constructor(){
        this.retryCount = 0;
        this.isConnected = false;

        // configuration 
        mongoose.set('strictQuery',true);

        mongoose.connection.on('connected',()=>{
            console.log("MONGODB connected successfully");
            this.isConnected= true;
        })
        mongoose.connection.on('error',()=>{
            console.log("MONGODB connection  error");
            this.isConnected=false;
        })
        mongoose.connection.on('disconnected',()=>{
            console.log("MONGODB disconneted");
            // attempt a reconnecting method
            this.handleDisconnetion();
            
        });
        // we are outside the constructor so it does not know about the method so we use bind => so we pass the context

        process.on('SIGTERM',this.handleAppTermination.bind(this));
    }

    async connected(){
       try {
         if(!process.env.MONGO_URI){
             throw new Error("MONGO db URL is not defined in env variables")
         }
         
         const connectionOptions ={
            uesNewUrlParser:true,
            useUnifiedTopology:true,
            maxPoolSize:10,
            serverSelectionTimeoutMS:5000,
            socketTimeoutMs:45000,
            family:4, // use IPv4 
         }
         if(process.env.NODE_ENV==="development"){
             mongoose.set('debug',true)
         }
         await mongoose.connect(process.env.MONGO_URI,connectionOptions);
         this.retryCount=0; // reset retry count successfully
       } catch (error) {
        console.error(error.message);
        await this.handleConnectionError();
       }
    }
    async handleConnectionError(){
        if(this.retryCount<MAX_RETRIES){
            this.retryCount++;
            console.log(`Retrying connection.... Attemp ${this.retryCount} of ${MAX_RETRIES}`)

            await new Promise(resolve => setTimeout(()=>{
                resolve
            },RETRY_INTERVAL))
            return this.connected()
        }else{
            console.error(`Failed to connected MONGODB after ${MAX_RETRIES}`);
        }
    }

    async handleDisconnetion(){
        if(!this.isConnected){
            console.log(`Attempting to reconneted to mongoDb...`)
            this.connected();
        }
    }

    async handleAppTermination(){
        try {
            await mongoose.connection.close();
            console.log("MongoDb connection closed through app termination")
        } catch (error) {
            console.log(`Error during database connection ${error}`)
            process.exit(1);
        }
    }

    getConnectionStatus(){
        return{
            isConnected:this.connected,
            readyState:mongoose.connection.readyState,
            host:mongoose.connection.host,
            name:mongoose.connection.name
        }
    }
}


// create a singleton instance => we throw a single class

const dbConnection = new DatabasesConnection();

export default dbConnection.connection.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection)