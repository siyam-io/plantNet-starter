import { useState } from "react";
import UpdateUserModal from "../../Modal/UpdateUserModal";
import PropTypes from "prop-types";

const UserDataRow = ({ users, refetch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUpdateRoleClick = (user) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  return (
    <>
      {users?.map((user) => (
        <tr key={user._id}>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{user?.email}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{user?.role}</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className={`${user?.status === "Requested" ? "text-yellow-600" : "text-green-600"} whitespace-no-wrap`}>
              {user?.status || "Verified"}
            </p>
          </td>

          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <span
              onClick={() => handleUpdateRoleClick(user)}
              className="relative cursor-pointer inline-block px-3 py-1 font-semibold text-green-900 leading-tight"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
              ></span>
              <span className="relative">Update Role</span>
            </span>
          </td>
        </tr>
      ))}
      {selectedUser && (
        <UpdateUserModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          user={selectedUser}
          refetch={refetch}
        />
      )}
    </>
  );
};

UserDataRow.propTypes = {
  users: PropTypes.array,
  refetch: PropTypes.func,
};

export default UserDataRow;
