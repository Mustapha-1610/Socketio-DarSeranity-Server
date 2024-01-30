import axios from "axios";
import { landlordNameSpace } from "server";

let connectedLandlords: Record<string, any> = {}; // Use a dictionary for O(1) lookup

const landlordNameSpaceLogic = (landlordNameSpace: any) => {
  landlordNameSpace.on("connection", (socket: any) => {
    socket.on("newLandlordConnected", (data: any) => {
      console.log(data);
      if (!connectedLandlords[data.landlordSocketId]) {
        connectedLandlords[data.landlordSocketId] = {
          socketId: socket.id,
          landlordMail: data.landlordMail,
        };
        landlordNameSpace.emit(
          "connectedRentersCountUpdate",
          Object.keys(connectedLandlords).length
        );
      } else {
        landlordNameSpace.emit(
          "connectedRentersCountUpdate",
          Object.keys(connectedLandlords).length
        );
      }
    });
    socket.on("refLanNotis", (data: any) => {
      console.log("AAAAAAAAAAAAAAAAAAAAAAA");
      const landlord = connectedLandlords[data.data.landlordSocketId];
      console.log(landlord);
      if (landlord && landlord.socketId) {
        landlordNameSpace.to(landlord.socketId).emit("refreshData", "hello");
      }
    });
    //
    socket.on("testing", async () => {
      console.log("hello landlord");
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
