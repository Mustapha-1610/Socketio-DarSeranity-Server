import axios from "axios";

let connectedRenters: any[] = [];

const renterNameSpaceLogic = (renterNameSpace: any) => {
  renterNameSpace.on("connection", (socket: any) => {
    socket.on("newRenterConnected", (data: any) => {
      console.log(data);
      const renterExists = connectedRenters.some(
        (renter) => renter.renterMail === data.renterMail
      );
      if (!renterExists) {
        connectedRenters.push({ renterMail: data.renterMail });
        renterNameSpace.emit(
          "connectedRentersCountUpdate",
          connectedRenters.length
        );
      } else {
        renterNameSpace.emit(
          "connectedRentersCountUpdate",
          connectedRenters.length
        );
      }
    });
    //
    socket.on("testing", () => {
      renterNameSpace.emit("testRenter");
    });
    //
    socket.on("renterDisconnected", (data: any) => {
      console.log(data);

      connectedRenters = connectedRenters.filter(
        (renter) => renter.renterMail !== data.renterMail
      );
      renterNameSpace.emit(
        "connectedRentersCountUpdate",
        connectedRenters.length
      );
    });
  });

  renterNameSpace.on("disconnect", (socket: any) => {
    console.log("working AAAAAAAAAAAAAA");
  });
};

export default renterNameSpaceLogic;
