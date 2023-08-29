import {
  Navbar,
  NavbarContent,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Input,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Textarea,
} from "@nextui-org/react";
import { useNavigate, useLocation } from "react-router-dom";
import { open } from "@tauri-apps/api/dialog";
import { useEffect, useState } from "react";
import { AddIcon } from "../public/AddIcon";
import { LockIcon } from "../public/LockIcon";
import { GenerateIcon } from "../public/GenerateIcon";
import { BarsIcon } from "../public/BarsIcon";
import { invoke } from "@tauri-apps/api";
import { SaveIcon } from "../public/SaveIcon";

export const AppBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isOpen: isGeneratorOpen,
    onOpen: onGeneratorOpen,
    onOpenChange: onGeneratorOpenChange,
  } = useDisclosure();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isChangePasswordOpen,
    onOpen: onChangePasswordOpen,
    onOpenChange: onChangePasswordOpenChange,
  } = useDisclosure();

  const [lowercase, setLowercase] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [numeric, setNumeric] = useState(true);
  const [special, setSpecial] = useState(true);
  const [length, setLength] = useState(10);
  const [password, setPassword] = useState("");

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [entryPassword, setEntryPassword] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    generatePassword();
  }, [lowercase, uppercase, numeric, special, length]);

  useEffect(() => {
    if (location.pathname != "/") {
      if (searchTerm == "") navigate("LoggedIn");
      else navigate("/search", { state: { searchTerm: searchTerm } });
    }
  }, [searchTerm]);

  const generatePassword = () => {
    let charset = "";
    if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numeric) charset += "0123456789";
    if (special) charset += "/!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(password);
  };

  function lockDb() {
    invoke("lock_db");
    navigate("/");
  }

  function addEntry() {
    invoke("add_entry", {
      title: title,
      username: username,
      password: entryPassword,
      url: url,
      notes: notes,
    }).then(() => {
      onAddOpenChange();
      navigate(0);
    });
  }

  function saveDb() {
    invoke("encrypt_db");
  }

  function changePassword() {
    invoke("change_db_password", { password: newPassword });
    onChangePasswordOpenChange();
  }

  function deleteAllEntries() {
    invoke("delete_all_entries").then(() => {
      navigate(0);
    });
  }

  async function importFromKeepass() {
    const selected = await open({
      multiple: false,
    });

    if (selected === null) {
      return;
    }

    invoke("import_from_keepass", { path: selected }).then(() => {
      navigate(0);
    });
  }

  return (
    <>
      <Navbar maxWidth={"full"}>
        <NavbarContent justify="start">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" isDisabled={location.pathname == "/"}>
                <BarsIcon />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem onPress={onAddOpen}>New Entry</DropdownItem>
              <DropdownItem>Save</DropdownItem>
              <DropdownItem onClick={lockDb}>Lock</DropdownItem>
              <DropdownItem onClick={importFromKeepass}>
                Import From Keepass
              </DropdownItem>
              <DropdownItem onClick={onChangePasswordOpen}>
                Change Password
              </DropdownItem>
              <DropdownItem className="text-red-500" onClick={deleteAllEntries}>
                Delete All Entries
              </DropdownItem>
              {/*
                <DropdownItem>Export</DropdownItem>
                <DropdownItem className="text-danger" color="danger">
                  Delete All Items
                </DropdownItem>
              */}
            </DropdownMenu>
          </Dropdown>
          <Button
            variant="bordered"
            onPress={saveDb}
            isDisabled={location.pathname == "/"}
          >
            <SaveIcon />
          </Button>
          <Button
            variant="bordered"
            onPress={lockDb}
            isDisabled={location.pathname == "/"}
          >
            <LockIcon />
          </Button>
          <Button
            variant="bordered"
            onPress={onAddOpen}
            isDisabled={location.pathname == "/"}
          >
            <AddIcon />
          </Button>
          <Button variant="bordered" onPress={onGeneratorOpen}>
            <GenerateIcon />
          </Button>
        </NavbarContent>
        <NavbarContent justify="end">
          <Input
            type="text"
            label="Search"
            size={"sm"}
            onChange={(e) => setSearchTerm(e.target.value)}
            isReadOnly={location.pathname == "/"}
          />
        </NavbarContent>
      </Navbar>

      <Modal
        isOpen={isGeneratorOpen}
        onOpenChange={onGeneratorOpenChange}
        backdrop={"blur"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Password Generator</ModalHeader>
              <ModalBody>
                <Input isReadOnly type="text" value={password} />
                <Input
                  size={"sm"}
                  type="number"
                  label="Password Length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Checkbox
                    defaultSelected
                    value={uppercase}
                    onChange={() => setUppercase(!uppercase)}
                  >
                    A-Z
                  </Checkbox>
                  <Checkbox
                    defaultSelected
                    value={lowercase}
                    onChange={() => setLowercase(!lowercase)}
                  >
                    a-z
                  </Checkbox>
                  <Checkbox
                    defaultSelected
                    value={numeric}
                    onChange={() => setNumeric(!numeric)}
                  >
                    0-9
                  </Checkbox>
                  <Checkbox
                    defaultSelected
                    value={special}
                    onChange={() => setSpecial(!special)}
                  >
                    / * & ^ ...
                  </Checkbox>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        backdrop={"blur"}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Entry</ModalHeader>
              <ModalBody>
                <Input
                  size={"sm"}
                  type="text"
                  label="Title"
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Input
                  size={"sm"}
                  type="text"
                  label="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                  size={"sm"}
                  type="text"
                  label="Password"
                  onChange={(e) => setEntryPassword(e.target.value)}
                />
                <Input
                  size={"sm"}
                  type="text"
                  label="Url"
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Textarea
                  label="Notes"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>Close</Button>
                <Button color="primary" onPress={addEntry}>
                  Add Entry
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isChangePasswordOpen}
        onOpenChange={onChangePasswordOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Change Master Password
              </ModalHeader>
              <ModalBody>
                <Input
                  size={"sm"}
                  type="text"
                  label="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={changePassword}>
                  Change Password
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
