import { httpStatus } from 'http-status';
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";


const createFlatRequest = catchAsync(async (req, res) => {
  

  const result = await FlatShareRequestServices.createFlatRequestIntoDB(
    req.body,
    userId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Flat Share Request created successfully",
    data: result,
  });
});

const getAllFlatRequestData = catchAsync(async (req, res) => {
  const { userId } = req.user || { userId: null };
  const result = await FlatShareRequestServices.getAllFlatRequestDataFromDB(
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Flat Share Request retrieved successfully",
    data: result,
  });
});

export const FlatShareRequestController = {
  createFlatRequest,
  getAllFlatRequestData,
};