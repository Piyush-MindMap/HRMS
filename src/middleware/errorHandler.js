import logger from "./requestLogger.js";

export const serverError = (err, req, res, next) => {
    console.error(err.stack);
    logger.error(`Unhandled error: ${err.message}`);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }

 export const notFound = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found',
    });
  }