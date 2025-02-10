
import prisma from "../config/db.config.js";
import { empIdToSocketMap } from "../websocket.js";

export const userNotification = async(userId, socket) => {
    try{
      const notifications = await prisma.notifications.findMany({
        where: {
          UserID: userId,
        },
        orderBy: {
          CreatedDate: 'desc',
        },
      });
  
      for(let i = 0; i<notifications.length; i++){
        if(notifications[i].RelatedEntityID){
            const employee = await prisma.employees.findUnique({
                select:{Picture:true,FirstName:true,LastName:true},
                where:{EmployeeID:notifications[i].RelatedEntityID}})
            notifications[i]['RelatedEntity'] = employee
        }else{
            const employee = await prisma.employees.findUnique({
                select:{Picture:true,FirstName:true,LastName:true},
                where:{EmployeeID:notifications[i].UserID}})
            notifications[i]['RelatedEntity'] = employee
        }
      }

      const payload = {
        message: 'Notifications',
        data: notifications,
      };
  
      socket.send(JSON.stringify(payload));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }
  
export const sendRealTimeNotification = (userId, message) => {
  const socket = empIdToSocketMap.get(userId); 
  if (socket) {
    const payload = JSON.stringify({ message });
    socket.send(payload);
    console.log(`Real-time notification sent to user ${userId}: ${message}`);
  } else {
    console.log(`User ${userId} is not connected. Notification saved in DB.`);
  }
};