import SideBar from "@/components/SideBar";
import Nouvmod from "@/components/Demandemodification";
import Container from "@/components/Container";
function Nouvdm() {
  return (
    <>
      <div className="flex">
        <SideBar />
        <Container>
          <div className="">
            <Nouvmod />
          </div>
        </Container>
      </div>
    </>
  );
}
export default Nouvdm;
