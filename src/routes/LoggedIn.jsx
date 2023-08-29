import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  ScrollShadow,
  Divider,
} from "@nextui-org/react";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { CopyIcon } from "../../public/CopyIcon";
import { DeleteIcon } from "../../public/DeleteIcon";
import { writeText, readText } from "@tauri-apps/api/clipboard";
import { useNavigate } from "react-router-dom";

export const LoggedIn = () => {
  const navigate = useNavigate();
  let [dbJson, setDbJson] = useState({});

  let [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => {
    invoke("get_db_json").then((result) => {
      setDbJson(JSON.parse(result));
    });
  }, []);

  if (dbJson.entries == undefined) {
    return <h1>Loading...</h1>;
  }

  async function copyPassword(value) {
    await writeText(value);
  }

  function deleteEntry(value) {
    invoke("delete_entry", { title: value }).then(() => {
      navigate(0);
    });
  }

  return (
    <>
      <ScrollShadow style={{ maxHeight: "calc(100vh - 80px - 120px)" }}>
        <Table
          selectionMode="single"
          removeWrapper
          className="px-6 py-6"
          aria-label="password table"
          onRowAction={(key) => setSelectedKey(key)}
        >
          <TableHeader>
            <TableColumn>Title</TableColumn>
            <TableColumn>Username</TableColumn>
            <TableColumn>Url</TableColumn>
            <TableColumn>Notes</TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody emptyContent={"No rows to display."}>{[]}</TableBody>
          <TableBody>
            {Object.keys(dbJson.entries).map((entryTitle) => (
              <TableRow key={entryTitle}>
                <TableCell>{entryTitle}</TableCell>
                <TableCell>{dbJson.entries[entryTitle].username}</TableCell>
                <TableCell>
                  {dbJson.entries[entryTitle].url.length > 40
                    ? dbJson.entries[entryTitle].url.slice(0, 37) + "..."
                    : dbJson.entries[entryTitle].url}
                </TableCell>
                <TableCell>
                  {dbJson.entries[entryTitle].notes.length > 20
                    ? dbJson.entries[entryTitle].notes.slice(0, 17) + "..."
                    : dbJson.entries[entryTitle].notes}
                </TableCell>
                <TableCell className="flex gap-4">
                  <Button
                    size="sm"
                    onClick={() =>
                      copyPassword(dbJson.entries[entryTitle].password)
                    }
                  >
                    <CopyIcon />
                  </Button>
                  <Button size="sm" onClick={() => deleteEntry(entryTitle)}>
                    <DeleteIcon />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollShadow>
      <div style={{ height: "120px" }} className="px-6 py-1 ">
        {selectedKey && (
          <>
            <h1 className="font-semibold">{selectedKey}</h1>
            <Divider />
            <div className="grid grid-cols-2">
              <h3>
                Username :{" "}
                {dbJson.entries[selectedKey].username.length > 30
                  ? dbJson.entries[selectedKey].username.slice(0, 27) + "..."
                  : dbJson.entries[selectedKey].username}
              </h3>
              <h3>
                URL :{" "}
                {dbJson.entries[selectedKey].url.length > 30
                  ? dbJson.entries[selectedKey].url.slice(0, 27) + "..."
                  : dbJson.entries[selectedKey].url}
              </h3>
              <h3>
                Password :{" "}
                {dbJson.entries[selectedKey].password.length > 30
                  ? dbJson.entries[selectedKey].password.slice(0, 27) + "..."
                  : dbJson.entries[selectedKey].password}
              </h3>
              <h3>
                Notes :{" "}
                {dbJson.entries[selectedKey].notes.length > 30
                  ? dbJson.entries[selectedKey].notes.slice(0, 27) + "..."
                  : dbJson.entries[selectedKey].notes}
              </h3>
            </div>
          </>
        )}
      </div>
    </>
  );
};
