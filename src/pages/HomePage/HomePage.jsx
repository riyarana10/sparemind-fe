import FindParts from "../../components/FindPartsComp/FindParts";
import NewArrivalParts from "../../components/NewArrivals/NewArrivalParts";

const getAuthToken = () => localStorage.getItem("access_token");

function HomePage() {
  const token = getAuthToken();

  return (
    <>
      <FindParts token={token} />
      <NewArrivalParts token={token} />
    </>
  );
}

export default HomePage;
