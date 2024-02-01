import axios from "axios";
import nodeSchedule from "node-schedule";
import { io } from "socket.io-client";

let connectedRenters: Record<string, any> = {};
// Use a dictionary for O(1) lookup
const renterNameSpaceLogic = (renterNameSpace: any) => {
  renterNameSpace.on("connection", (socket: any) => {
    // function to add new connected renters to an array and save their socket id
    socket.on("newRenterConnected", async (data: any) => {
      connectedRenters[data.renterSocketId] = {
        socketId: socket.id,
      };
    });
    //
    socket.on("remindViewing", (data: any) => {
      // Get the current local date and time
      const currentDate = new Date();
      // Add 5 minutes to the current date
      const mailingDate = new Date(currentDate.getTime() + 1 * 60 * 1000);
      const scheduledDate = new Date(currentDate.getTime() + 2 * 60 * 1000);

      nodeSchedule.scheduleJob(mailingDate, async function () {
        axios
          .post(`${process.env.API_BASE_URL}/api/general/sendReminderMails`, {
            propertyTitle: data.socketObject.propertyData.propertyTitle,
            viewingDate: data.socketObject.propertyData.viewingDate,
            renterId: data.socketObject.renterData.renterId,
            landlordId: data.socketObject.landlordData.landlordId,
          })
          .then((response) => {
            const renter =
              connectedRenters[data.socketObject.socketData.renterSocketData];
            if (renter && renter.socketId) {
              socket.to(renter.socketId).emit("refreshData", "hello");
            }
            const landlordSocketObject: any =
              data.socketObject.socketData.landlordSocketData;
            const landlordSocket = io(`${process.env.SOCKET_SERVER}/landlord`);

            landlordSocket.emit("refLanNotis", landlordSocketObject);
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      });
      nodeSchedule.scheduleJob(scheduledDate, async function () {
        axios
          .post("http://localhost:3000/api/propertyListing/confirmViewing", {
            renterId: data.socketObject.renterData.renterId,
            rentalPropertyId: data.socketObject.propertyData.propertyId,
          })
          .then((response) => {
            console.log("Response:", response.data);
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      });
    });
    // Function To Refresh notifications on the front side
    socket.on("refreshRenterNotifications", (data: any) => {
      const renter = connectedRenters[data.renterSocketId];
      if (renter && renter.socketId) {
        socket.to(renter.socketId).emit("refreshData", "hello");
      }
    });
    // function to remove users from the connected array once disconnecte
    socket.on("renterDisconnected", (data: any) => {
      if (connectedRenters[data.landlordSocketId]) {
        delete connectedRenters[data.landlordSocketId];
        renterNameSpace.emit(
          "connectedRentersCountUpdate",
          Object.keys(connectedRenters).length
        );
      }
    });
  });

  renterNameSpace.on("disconnect", (socket: any) => {
    // You can handle disconnect logic here if needed
    console.log("working AAAAAAAAAAAAAA");
  });
};

export default renterNameSpaceLogic;
