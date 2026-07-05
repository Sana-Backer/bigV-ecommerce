"use client";

import axios from "axios";
import { DeleteIcon, Edit, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";


export default function Users() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: "",
        role: '',
        photo: null
    })
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("")
    const [isAddModal, setIsAddModal] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("https://dummyjson.com/users");
                console.log(response)

                const sortedUsers = [...response.data.users].sort((a, b) => a.firstName.localeCompare(b.firstName));
                setUsers(sortedUsers)

            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])


    const filteredUsers = users.filter((user) => {
        const matchesSearch = `${user.firstName} ${user.lastName}`.toLocaleLowerCase().includes(search.toLowerCase()) || user.email.toLocaleLowerCase().includes(search.toLocaleLowerCase());
        const matchesRole = role === "" || user.role === role
        return matchesSearch && matchesRole;
    });

    const handleAddUser = (e) => {
        e.preventDefault();
        const addUser = {
            id: users.length + 1, ...newUser, photo: preview
        }
        setUsers([...users, addUser])
        setIsAddModal(false)
        setNewUser({
            firstName: "",
            lastName: "",
            email: "",
            phone: '',
            role: ''
        })


    }
    const handleUpdateUser = () => {
        const updatedUsers = users.map((user) => {
            if (user.id === selectedUser.id) {
                return selectedUser;
            }
            return user;
        })
        setUsers(updatedUsers);
        setIsModalOpen(false);
    }
    const handleDeleteUser = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            const updateUsers = users.filter((user) => user.id !== userId)
            setUsers(updateUsers);
        } else {
            return;
        }
    }
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    const indexofLastItem = currentPage * itemsPerPage
    const indexofFirstitems = indexofLastItem - itemsPerPage
    const currentUsers = filteredUsers.slice(indexofFirstitems, indexofLastItem)

    return (
        <div className="flex flex-col  min-h-screen">
            <h1 className="t">USER MANAGEMENT</h1>
            <div className="grid grid-cols-4 gap-2">
                {/* <div className="bg-gray-200 p-4">12</div>
                <div className="bg-gray-200 p-4">Users</div>
                <div className="bg-gray-200 p-4">Management</div>
                <div className="bg-gray-200 p-4">Dashboard</div> */}
            </div>
            <div className="flex justify-between pt-2">
                <div className="relative  py-2">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-4"
                    />
                </div>

                <div className="flex  items-center mb-4">
                    <select name="" id=""
                        value={role}
                        onChange={(e) => setRole(e.target.value)}>
                        <option value="">Filter by Role</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                    </select>
                    <div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2 hover:bg-blue-600"
                            onClick={() => setIsAddModal(true)}>Add User</button>

                    </div>
                </div>


            </div>
            <div className="flex-1 ">

                <table className="min-w-full border border-gray-300 rounded-md ">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className=" border-gray-300 p-2">SI</th>
                            <th className=" border-gray-300 p-2">ID</th>
                            <th className=" border-gray-300 p-2">Name</th>
                            <th className=" border-gray-300 p-2">Email</th>
                            <th className=" border-gray-300 p-2">Role</th>
                            <th className=" border-gray-300 p-2">Photo</th>
                            <th className=" border-gray-300 p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="text-center p-4">
                                    Loading users...
                                </td>
                            </tr>

                        ) : currentUsers.length > 0 ? (
                            currentUsers.map((user, index) => (
                                <tr key={user.id}>
                                      <td className=" border-gray-300 text-center p-2">{index + 1}</td>
                                    <td className=" border-gray-300 text-center p-2">{user.id}</td>
                                    <td className=" border-gray-300 text-center p-2">{user.firstName} {user.lastName}</td>
                                    <td className=" border-gray-300 text-center p-2">{user.email}</td>
                                    <td className=" border-gray-300 text-center p-2">{user.role}</td>
                                    <td className=" border-gray-300 text-center p-2"><img
                                        src={user.photo}
                                        alt="User"
                                        className="w-10 h-10 rounded-full object-cover"
                                    /></td>
                                    <td className="text-center p-2">
                                        <div className="flex items-center justify-center gap-4">
                                            <Edit className="w-4 h-4 text-blue-500 cursor-pointer" onClick={() => {
                                                setSelectedUser(user)
                                                setIsModalOpen(true)
                                            }} />
                                            <DeleteIcon className="w-4 h-4 text-red-500 cursor-pointer"
                                                onClick={() => handleDeleteUser(user.id)}
                                            // onClick ={()=> {
                                            //     setUsers(users.filter(u => u.id !== user.id));
                                            // }}
                                            />
                                        </div>
                                    </td>
                                </tr>

                            ))
                        ) :
                            (
                                <tr>
                                    <td colSpan="5" className="text-center p-4">
                                        No users found.
                                    </td>
                                </tr>
                            )}
  
                       
                 
                    </tbody>
                  
                </table>
                 <div className="flex gap-2 justify-end right-1 items-end">
                    
                            <button disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)} 
                            className="px-3 py-1 border rounded disabled:opacity-50"
    >prev</button>
                          showing {currentPage} of {totalPages}
                            <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)} 
                            >next</button>
                        </div>

            </div>
            {isAddModal && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm p-4 z-50" >
                    <div className="space-y-2 bg-white/50 rounded-md  shadow-xl p-5">
                        <h4 className="text-xl font-semibold mb-3">Add New User</h4>
                        <div className="flex  gap-2">
                            <label> First name :</label>
                            <input type="text"
                                value={newUser.firstName}
                                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                placeholder="enter first name" className="px-3 border rounded-lg" />
                        </div>
                        <div className="flex  gap-2">
                            <label> Last name :</label>
                            <input type="text"
                                value={newUser.lastName}
                                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                placeholder="enter last name" className="px-3 border rounded-lg" />
                        </div>
                        <div className="flex  gap-2">
                            <label> email :</label>
                            <input type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="enter email" className="px-3 border rounded-lg" />
                        </div>
                        <div className="flex  gap-2">
                            <label> phone</label>
                            <input type="number"
                                value={newUser.phone}
                                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                placeholder="enter phone number" className="px-3 border rounded-lg" />
                        </div>
                        <div className="flex  gap-2">
                            <label> photo</label>
                            <input type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setNewUser({ ...newUser, photo: file });
                                    setPreview(URL.createObjectURL(file))

                                }}

                            // onChange={(e)=> setNewUser({...newUser, photo: e.target.files[0]})}
                            />
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-full object-cover"
                                />
                            )}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setIsAddModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAddUser}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                            >
                                Save User
                            </button>
                        </div>
                    </div>


                </div>
            )}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center  items-center p-3 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)} >
                    <div className="bg-white  p-4 space-y-3 rounded-md shadow-xl w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}>

                        <h4 className="text-lg font-bold ">Edit User</h4>

                        <div className="flex flex-col gap-1 " >
                            <label>First Name:</label>
                            <input type="text"
                                placeholder="First Name"
                                className="border px-2 rounded-md "
                                value={selectedUser?.firstName || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 " >
                            <label>Last Name:</label>
                            <input type="text"
                                placeholder="Last Name"
                                className="border px-2 rounded-md "
                                value={selectedUser?.lastName || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 " >
                            <label>Email:</label>
                            <input type="text"
                                placeholder="Email"
                                className="border px-2 rounded-md "
                                value={selectedUser?.email || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1 " >
                            <label>Role:</label>
                            <select
                                value={selectedUser?.role || ""}
                                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                className="border px-2 rounded-md"
                            >

                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                                <option value="moderator">Moderator</option>
                            </select>

                        </div>
                        <div className="flex flex-col gap-1 " >
                            <label>photo:</label>
                            <img src={selectedUser?.photo} alt="photo" className="w-24 h-24 rounded-full object-cover"
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    setSelectedUser({ ...selectedUser, photo: URL.createObjectURL(file) })
                                }}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                                Update User
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    )

}