import { Router } from 'express';

const publicQueryRouter = Router();

publicQueryRouter.get('/',(req,res)=>{
   res.send("not implemented")
});
export default publicQueryRouter