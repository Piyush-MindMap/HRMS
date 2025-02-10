// Error handling logic
export const handleUncaughtErrors = () => {
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
  
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection:', promise, 'reason:', reason);
      process.exit(1);
    });
};
  