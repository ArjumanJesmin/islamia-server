import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserService } from "./user.service";


const createAdmin = catchAsync(async (req, res) => {
  const result = await UserService.createAdmin(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin created successfully!",
    data: result,
  });
});


  const createTeacher = catchAsync(async (req, res) => {
    const result = await UserService.createTeacher(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "শিক্ষকের তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
      data: result,
    });
  })


export const UserController = {
  createAdmin,
  createTeacher
};