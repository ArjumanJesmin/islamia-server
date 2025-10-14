import { UserRoute } from './../modules/user/user.route';
import express from "express";


const router = express.Router();

const moduleRoutes: any[] = [
  {
    path: "/user",
    route: UserRoute,
  },
  
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;