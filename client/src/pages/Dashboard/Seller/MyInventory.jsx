import { Helmet } from "react-helmet-async";
import PlantDataRow from "../../../components/Dashboard/TableRows/PlantDataRow";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";

const MyInventory = () => {
  const { user } = useAuth();
  const {
    data: plants = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["inventory", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/plants?email=${user?.email}`);
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <Helmet>
        <title>My Inventory</title>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-8">
        <p>{plants.length}</p>
        <div className="py-8">
          <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Image
                    </th>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Name
                    </th>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Category
                    </th>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Price
                    </th>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Quantity
                    </th>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Delete
                    </th>
                    <th className="px-5 py-3 bg-white border-b border-gray-200 text-gray-800 text-left text-sm uppercase font-normal">
                      Update
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((plant) => (
                    <PlantDataRow key={plant._id} plant={plant} refetch={refetch}/>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyInventory;
