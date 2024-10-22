import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import UserTable from "./UserTable";

export default function AdminPage() {
  return (
    <>
    <div>
      
      <Sidebar/>
       <UserTable/>
    </div>
    </>
  );
}
