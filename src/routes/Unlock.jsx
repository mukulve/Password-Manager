import { Input, Button } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useNavigate } from "react-router-dom";

export const Unlock = () => {
  const navigate = useNavigate();
  const [doesDbExist, setDoesDbExist] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    invoke("does_db_exist").then((result) => {
      if (result == true) setDoesDbExist(true);
      else setDoesDbExist(false);
    });
  }, []);

  function createDb() {
    invoke("create_db", { password: password })
      .then(() => {
        setDoesDbExist(true);
      })
      .catch((e) => {
        setError(e);
        return;
      });
  }

  function openDb() {
    invoke("decrypt_db", { password: password })
      .then(() => {
        navigate("LoggedIn");
      })
      .catch((e) => {
        setError(e);
        return;
      });
  }

  if (doesDbExist) {
    return (
      <div className="px-6 py-6">
        <h1 className="pb-6 text-lg font-semibold">Unlock Password File</h1>
        <p className="pb-6 text-sm text-red-500">{error}</p>
        <Input
          className="pb-6"
          size={"sm"}
          type="text"
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button color="primary" onClick={openDb}>
          Unlock
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <h1 className="pb-6 text-lg font-semibold">Create Password File</h1>
      {error && <p className="pb-6 text-sm text-red-500">{error}</p>}
      <Input
        className="pb-6"
        size={"sm"}
        type="text"
        label="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button color="primary" onClick={createDb}>
        Create
      </Button>
    </div>
  );
};
