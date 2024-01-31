import axios from "axios";

let connectedRenters: Record<string, any> = {}; // Use a dictionary for O(1) lookup

const renterNameSpaceLogic = (renterNameSpace: any) => {
  renterNameSpace.on("connection", (socket: any) => {
    // function to add new connected renters to an array and save their socket id
    socket.on("newRenterConnected", (data: any) => {
      console.log(data);
      if (!connectedRenters[data.renterSocketId]) {
        connectedRenters[data.renterSocketId] = {
          socketId: socket.id,
        };
      }
    });
    // Function To Refresh notifications on the front side
    socket.on("refreshRenterNotifications", (data: any) => {
      console.log(data);
      const renter = connectedRenters[data.renterSocketId];
      console.log(renter + "renterrrr");
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
