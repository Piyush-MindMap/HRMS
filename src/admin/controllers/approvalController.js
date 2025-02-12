import prisma from "../../config/db.config.js";
import { v4 as uuidv4 } from 'uuid';
import { getTodaysDate } from "../../utils/helperFunctions.js";

export const approveLeave = async (req, res) => {
    const { id, status, message } = req.body;

    try {
        const leave = await prisma.leaveRequests.findFirst({
            where:{
                LeaveRequestID : id
            },
            select:{
                Level1ApproverID: true,
                Level1ApprovalStatus:true,
                Level2ApproverID:true,
                Level2ApprovalStatus:true,
            }
        })
        if(leave.Level1ApprovalStatus !== 1 || (leave.Level2ApproverID && leave.Level2ApprovalStatus !== 1) ){
            return res.status(400).json({ status_code: 400, message: "Leave request is not approved by all approvers." });
        }
    } catch (error) {
        return res.status(404).json({ status_code: 404, message: "Leave request not found." });
    }  
    
    const data = {
        Status : status,
        Level3ApprovalStatus: status,
        Level3ApprovalComment : message || status ? 'Approved' : 'Rejected',
        Level3ApprovalDate : new Date(getTodaysDate()),
        ApprovalDate : new Date(getTodaysDate()),
        UpdatedDate: new Date(getTodaysDate())
    }
        
    try {
        await prisma.leave.update({
        where: { LeaveRequestID: id },
        data: data
        });
        res.json({ status_code: 200, message: "Leave approved successfully." });
    } catch (error) {
        console.error("Error approving leave:", error);
        res.status(500).json({
        status_code: 500,
        message: "An unexpected error occurred.",
        });
    }
};
