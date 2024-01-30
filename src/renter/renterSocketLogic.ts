import axios from "axios";

let connectedRenters: Record<string, any> = {}; // Use a dictionary for O(1) lookup

const renterNameSpaceLogic = (renterNameSpace: any) => {
  renterNameSpace.on("connection", (socket: any) => {
    socket.on("newRenterConnected", (data: any) => {
      if (!connectedRenters[data.renterId]) {
        connectedRenters[data.renterId] = {
          socketId: socket.id,
          renterMail: data.renterMail,
        };
        renterNameSpace.emit(
          "connectedRentersCountUpdate",
          Object.keys(connectedRenters).length
        );
      } else {
        renterNameSpace.emit(
          "connectedRentersCountUpdate",
          Object.keys(connectedRenters).length
        );
      }
    });

    socket.on("testing", async () => {
      console.log("hello");
    });

    socket.on("renterDisconnected", (data: any) => {
      if (connectedRenters[data.renterId]) {
        delete connectedRenters[data.renterId];
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
