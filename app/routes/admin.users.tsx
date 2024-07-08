import { Button, Input, Select, SelectItem, TableCell, TableRow, User } from "@nextui-org/react"
import { ActionFunction, json, LoaderFunction } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import PlusIcon from "~/components/icons/PlusIcon"
import { SearchIcon } from "~/components/icons/SearchIcon"
import ConfirmModal from "~/components/modal/confirmModal"
import CreateModal from "~/components/modal/createModal"
import EditModal from "~/components/modal/EditModal"
import { UserColumns } from "~/components/table/columns"
import CustomTable from "~/components/table/table"
import { errorToast, successToast } from "~/components/toast"
import usersController from "~/controllers/Users"
import { RegistrationInterface } from "~/interfaces/interface"
import AdminLayout from "~/layout/adminLayout"

const Users = () => {
    const [isCreateModalOpened, setIsCreateModalOpened] = useState(false)
    const [base64Image, setBase64Image] = useState()
    const [rowsPerPage, setRowsPerPage] = useState(13)
    const [isConfirmModalOpened, setIsConfirmModalOpened] = useState(false)
    const [isEditModalOpened, setIsEditModalOpened] = useState(false)
    const [dataValue, setDataValue] = useState<RegistrationInterface>()
    const submit = useSubmit()
    const actionData = useActionData<any>()
    const { user, users } = useLoaderData<{ user: { _id: string }, users: RegistrationInterface[]}>()

    const handleCreateModalClosed = () => {
        setIsCreateModalOpened(false)
    }
    const handleConfirmModalClosed = () => {
        setIsConfirmModalOpened(false)
    }
    const handleEditModalClosed = () => {
        setIsEditModalOpened(false)
    }
    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage)
    }

    useEffect(() => {
        if (actionData) {
            if (actionData.success) {
                successToast(actionData.message)
            } else {
                errorToast(actionData.message)
            }
        }
    }, [actionData])

    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState(users);

    const handleSearchChange = (event:any) => {
        setSearchQuery(event.target.value);
    };

    useEffect(() => {
        const filtered = users.filter(user => {
            const lowerCaseQuery = searchQuery.toLowerCase();
            return (
                user.firstName.toLowerCase().includes(lowerCaseQuery) ||
                user.phone.toLowerCase().includes(lowerCaseQuery) ||
                user.lastName.toLowerCase().includes(lowerCaseQuery) ||
                user.email.toLowerCase().includes(lowerCaseQuery) 
            );
        });
        setFilteredUsers(filtered);
    }, [searchQuery, users]);
    return (
        <AdminLayout pageName="Users Management">
            <div className="flex z-0 justify-between gap-2">
                <Toaster position="top-center" />
                <div>
                    <Input
                        placeholder="Search product..."
                        startContent={<SearchIcon className="" />}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        classNames={{
                            inputWrapper: "h-14 lg:w-80",
                        }}
                    />
                </div>
                <div>
                    <Button variant="flat" onClick={() => {
                        setIsCreateModalOpened(true)
                    }} color="primary" className="h-14 font-poppins text-md">
                        <PlusIcon className="h-6 w-6" />Create User
                    </Button>
                </div>
            </div>


            <CustomTable columns={UserColumns} rowsPerPage={rowsPerPage} onRowsPerPageChange={handleRowsPerPageChange}>
            {filteredUsers.map((user: RegistrationInterface, index: number) => (
                    <TableRow key={index}>
                        <TableCell className="text-xs">
                            <User
                                avatarProps={{ radius: "sm", src: user.image }}
                                name={user.firstName + ' ' + user.middleName + ' ' + user.lastName}
                            />
                        </TableCell>
                        <TableCell className="text-sm">{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell className="relative flex items-center gap-4">
                            <Button color="success" variant="flat" onClick={() => {
                                setIsEditModalOpened(true)
                                setDataValue(user)
                            }}>
                                Edit
                            </Button>
                            <Button color="danger" variant="flat" onClick={() => {
                                setIsConfirmModalOpened(true)
                                setDataValue(user)
                            }}>
                                Delete
                            </Button>

                        </TableCell>
                    </TableRow>
                ))}            </CustomTable>
            <ConfirmModal isOpen={isConfirmModalOpened} onOpenChange={handleConfirmModalClosed}>
                <div className="flex gap-4">
                    <Button color="primary" variant="flat" className="font-poppins text-md" onPress={handleConfirmModalClosed}>
                        No
                    </Button>
                    <Button color="danger" variant="flat" className="font-poppins text-md" onClick={() => {
                        setIsConfirmModalOpened(false)
                        if (dataValue) {
                            submit({
                                intent: "delete",
                                id: dataValue?._id
                            }, {
                                method: "post"
                            })
                        }
                    }} >
                        Yes
                    </Button>
                </div>
            </ConfirmModal>
            {/* Create Modal */}
            <EditModal
                modalTitle="Update user details"
                isOpen={isEditModalOpened}
                onOpenChange={handleEditModalClosed}
            >
                {(onClose) => (
                    <Form method="post">
                        <Input
                            label="First name"
                            isRequired
                            isClearable
                            name="firstname"
                            placeholder=" "
                            defaultValue={dataValue?.firstName}
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-poppins text-sm text-default-100",
                            }}
                        />
                        <div className="flex gap-4">
                            <Input
                                label="Middle Name"
                                name="middlename"
                                placeholder=" "
                                isClearable
                                defaultValue={dataValue?.middleName}
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                            <Input
                                label="Last Name"
                                isRequired
                                name="lastname"
                                defaultValue={dataValue?.lastName}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                        </div>
                        <Input
                            label="Email"
                            isRequired
                            name="email"
                            defaultValue={dataValue?.email}
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-poppins text-sm text-default-100",
                                inputWrapper: "mt-2"
                            }}
                        />
                        <div className="flex gap-4">
                            <Input
                                label=" Phone"
                                isRequired
                                name="phone"
                                defaultValue={dataValue?.phone}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                            <Input
                                label=" Password"
                                isRequired
                                name="password"
                                placeholder=" "
                                defaultValue={dataValue?.password}
                                isReadOnly
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                        </div>
                        <Input
                                label=" Role"
                                isRequired
                                name="role"
                                defaultValue={dataValue?.role}
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                       

                        <input name="admin" value={user._id} type="hidden" />
                        <input name="intent" value="update" type="hidden" />
                        <input name="id" value={dataValue?._id} type="hidden" />

                        <div className="flex justify-end gap-2 mt-10 font-poppins">
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <button type="submit" className="bg-primary-400 rounded-xl bg-opacity-20 text-primary text-sm font-poppins px-4">
                                Submit
                            </button>
                        </div>
                    </Form>
                )}
            </EditModal>

            {/* Create Modal */}
            <CreateModal
                modalTitle="Create New User"
                isOpen={isCreateModalOpened}
                onOpenChange={handleCreateModalClosed}
            >
                {(onClose) => (
                    <Form method="post">
                        <Input
                            label="First name"
                            isRequired
                            isClearable
                            name="firstname"
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-poppins text-sm text-default-100",
                            }}
                        />
                        <div className="flex gap-4">
                            <Input
                                label="Middle Name"
                                name="middlename"
                                placeholder=" "
                                isClearable
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                            <Input
                                label="Last Name"
                                isRequired
                                name="lastname"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                        </div>
                        <Input
                            label="Email"
                            isRequired
                            name="email"
                            isClearable
                            placeholder=" "
                            type="text"
                            labelPlacement="outside"
                            classNames={{
                                label: "font-poppins text-sm text-default-100",
                                inputWrapper: "mt-2"
                            }}
                        />
                        <div className="flex gap-4">
                            <Input
                                label=" Phone"
                                isRequired
                                name="phone"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                            <Input
                                label=" Password"
                                isRequired
                                name="password"
                                isClearable
                                placeholder=" "
                                type="text"
                                labelPlacement="outside"
                                classNames={{
                                    label: "font-poppins text-sm text-default-100",
                                    inputWrapper: "mt-2"
                                }}
                            />
                        </div>
                        <div className="pt-2">
                            <Select
                                label="Role"
                                labelPlacement="outside"
                                placeholder=" "
                                isRequired
                                name="role"
                            >
                                {[
                                    { key: "admin", value: "admin", display_name: "Admin" },
                                    { key: "attendant", value: "attendant", display_name: "Attendant" },
                                ].map((role) => (
                                    <SelectItem key={role.key}>{role.display_name}</SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div className="pt-2">
                            <label className="font-poppins block text-sm" htmlFor="">Image</label>
                            <input
                                name="image"
                                required
                                placeholder=" "
                                className="font-poppins mt-2 rounded-lg h-10 w-[25vw] bg-default-100"
                                type="file"
                                onChange={(event: any) => {
                                    const file = event.target.files[0];
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onloadend = () => {
                                            setBase64Image(reader.result)
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                            />
                        </div>

                        <input name="admin" value={user._id} type="hidden" />
                        <input name="intent" value="create" type="hidden" />
                        <input name="base64Image" value={base64Image} type="hidden" />

                        <div className="flex justify-end gap-2 mt-10 font-poppins">
                            <Button color="danger" variant="flat" onPress={onClose}>
                                Close
                            </Button>
                            <button type="submit" className="bg-primary-400 rounded-xl bg-opacity-20 text-primary text-sm font-poppins px-4">
                                Submit
                            </button>
                        </div>
                    </Form>
                )}
            </CreateModal>
        </AdminLayout>
    )
}

export default Users

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const firstName = formData.get("firstname") as string;
    const lastName = formData.get("lastname") as string;
    const middleName = formData.get("middlename") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const base64Image = formData.get("base64Image") as string;
    const role = formData.get("role") as string;
    const admin = formData.get("admin") as string;
    const intent = formData.get("intent") as string;
    const id = formData.get("id") as string;

    switch (intent) {
        case "create":
            const user = await usersController.CreateUser({
                firstName,
                middleName,
                lastName,
                email,
                admin,
                password,
                phone,
                role,
                intent,
                base64Image
            })
            return user

        case "delete":
            const deleteUser = await usersController.DeleteUser({
                intent,
                id
            })
            return deleteUser

        case "update":
            const updateUser = await usersController.UpdateUser({
                firstName,
                middleName,
                lastName,
                email,
                admin,
                phone,
                id,
                role,
                intent,
            })
            return updateUser

        default:
            return json({
                message: "Bad request",
                success: false,
                status: 400
            })
    }
}

export const loader: LoaderFunction = async ({ request }) => {
    const { user, users } = await usersController.FetchUsers({ request })

    return { user, users }
}