import React from "react";
import AddFaculty from "./AddFaculty";
import Summary from "./Summary";

const AdminDashboard = () => {
  return (
    <div className="">
      <AddFaculty className="justify-start items-center py-1.5 " embedded={true} />
      <Summary className=" " embedded={true} />
    </div>
  );
};

export default AdminDashboard;