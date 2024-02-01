import axios from "axios";

let connectedLandlords: Record<string, any> = {}; // Use a dictionary for O(1) lookup

const landlordNameSpaceLogic = (landlordNameSpace: any) => {
  landlordNameSpace.on("connection", (socket: any) => {
    socket.on("newLandlordConnected", (data: any) => {
      connectedLandlords[data.landlordSocketId] = {
        socketId: socket.id,
        landlordMail: data.landlordMail,
      };
    });
    //
    socket.on("refLanNotis", (data: any) => {
      const landlord =
        connectedLandlords[data.data.landlordSocketId] ||
        connectedLandlords[data];
      if (landlord && landlord.socketId) {
        socket.to(landlord.socketId).emit("refreshData", "hello");
      }
    });
    //
    socket.on("renterDisconnected", (data: any) => {
      if (connectedLandlords[data.landlordSocketId]) {
        delete connectedLandlords[data.landlordSocketId];
        landlordNameSpace.emit(
          "connectedRentersCountUpdate",
          Object.keys(connectedLandlords).length
        );
      }
    });
  });

  landlordNameSpace.on("disconnect", (socket: any) => {
    // You can handle disconnect logic here if needed
    console.log("working AAAAAAAAAAAAAA");
  });
};

export default landlordNameSpaceLogic;
