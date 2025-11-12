import { getDBStatus } from "../databases/dbconfig";

export const checkHealth = async(req,res)=>{
    
    try {
       const dbStatus = getDBStatus();
     const healthStatus = {
         status:'ok',
         timeStamp:new Date().toISOString(),
         services:{
             database:{
                 status:dbStatus.isConnected? 'healthy':'unhealthy',
                 details:{
                     ...dbStatus,
                     readyState:getReadyStateText(dbStatus.readyState)
                 }
             },
             server:{
                 status:'healthy',
                 uptime:process.uptime(),
                 memoryStorage:process.memoryUsage(),
             }
         }
     }
 
     const httpStatus = healthStatus.services.database.status==='healthy'? 200:500;
 
     res.status(httpStatus).json(httpStatus)
   } catch (error) {
        console.log('Health check failed',error)
        res.state(500).json({
            status:"ERROR",
            timeStamp:new Date().toISOString(),
            error:error.message
        })
   }
}


//  utility method
function getReadyStateText(state){
    switch(state){
        case 0: return 'disconnected';
        case 1: return 'connected';
        case 2: return 'connecting';
        case 3: return 'disconnected';
    }
}