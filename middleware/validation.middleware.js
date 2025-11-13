import { body,param,query,validationResult } from "express-validator";


// this is bolier plate
export const validate = (validation)=>{
    return async(req,res,next)=>{
        // run all validation 
        await Promise.all(validation.map(validation.run(req))) // this automatically saves the data in validationResult

        const errors = validationResult(req)

        if(errors.isEmpty()){
            return next();
        }

        const extractedError = errors.array().map(err=>({
            feild:err.path,
            message:err.msg
        }))
    }
}



export const commonValidations = {
    pagination:[
        query('page')
            .optional()
            .isInt({min:1})
            .withMessage("Page must be positive integer"),
        query('limit')
            .optional()
            .isInt({min:1,max:100})
            .withMessage("limit must be between 1 and 100")
    ],
    email:
        body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    name: 
        body('name')
            .trim()
            .isLength({min:2 ,max:100})
            .withMessage("please provide a valid name"),
    bio:
        body('bio')
            .trim()
            .isLength({min:5,max:500})
            .withMessage("bio length must be in between 5 and 500")

};

export const validateSignup = validate([
    commonValidations.email,
    commonValidations.name,
])