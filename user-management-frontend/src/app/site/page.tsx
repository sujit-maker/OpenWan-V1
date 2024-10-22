import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import CreateSiteModal from "./CreateSiteModal";
import EditSiteModal from "./EditSiteModal";
import SiteTable from "./SiteTable";


export default function SitePage(){
    return(
        <>

        
        <Sidebar/>
        <SiteTable/>
   
        </>
    );                  

}