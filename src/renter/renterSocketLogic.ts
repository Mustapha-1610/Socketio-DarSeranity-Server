import axios from "axios";
import nodeSchedule from "node-schedule";
import { io } from "socket.io-client";

let connectedRenters: Record<string, any> = {};
const rentDueReminder = new Map();
const renterNameSpaceLogic = (renterNameSpace: any) => {
  renterNameSpace.on("connection", (socket: any) => {
    socket.on("newRenterConnected", async (data: any) => {
      connectedRenters[data.renterSocketId] = {
        socketId: socket.id,
      };
    });
    //
    socket.on("sendMonthlyReminderMails", (data: any) => {
      console.log(data);
      const newDate = new Date(data.paymentDate);
      newDate.setDate(newDate.getDate() - 3);
      newDate.setHours(8, 0, 0, 0);
      const job = nodeSchedule.scheduleJob(
        "*/2 * * * *",
        /*{ start: data.paymentDate, rule: "0 8 * * *" }*/ async function () {
          axios
            .post(
              `${process.env.API_BASE_URL}/api/general/sendPaymentReminderMail`,
              {
                paymentDate: data.paymentDate,
                propertyTitle: data.propertyTitle,
                landlordId: data.landlordInformations.landlordId,
                renterId: data.renterId,
              }
            )
            .then((response: any) => {
              console.log(response);
              const renter =
                connectedRenters[response.data.socketData.renterSocketId];
              if (renter && renter.socketId) {
                socket.to(renter.socketId).emit("refreshData", "hello");
              }
              const landlordSocketObject: any =
                response.data.socketData.landlordSocketId;
              const landlordSocket = io(
                `${process.env.SOCKET_SERVER}/landlord`
              );

              landlordSocket.emit("refLanNotis", landlordSocketObject);
            })
            .catch((error) => {
              console.error("Error:", error.message);
            });
        }
      );
      rentDueReminder.set(data.scheduledEventId, job);
    });
    //
    socket.on("remindViewing", (data: any) => {
      const currentDate = new Date();
      const mailingDate = new Date(currentDate.getTime() + 30 * 1000);
      const scheduledDate = new Date(currentDate.getTime() + 60 * 1000);

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
          .post(
            `${process.env.API_BASE_URL}/api/propertyListing/confirmViewing`,
            {
              renterId: data.socketObject.renterData.renterId,
              rentalPropertyId: data.socketObject.propertyData.propertyId,
            }
          )
          .then((response) => {
            console.log("Response:", response.data);
          })
          .catch((error) => {
            console.error("Error:", error.message);
          });
      });
    });
    //
    socket.on("cancelRentReminder", (data: any) => {
      console.log(data);
      const job = rentDueReminder.get(data);
      if (job) {
        job.cancel();
        rentDueReminder.delete(data);
        console.log(`Cancelled event with ID ${data}`);
      } else {
        console.log(`No event found with ID ${data}`);
      }
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
