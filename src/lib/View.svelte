<script>
  import Button, { Icon } from "@smui/button";
  import { invoke } from "@tauri-apps/api/tauri";
  import { open } from "@tauri-apps/api/dialog";
  import { appDir } from "@tauri-apps/api/path";
  import { data } from "../store.js";
  import PasswordTable from "./PasswordTable.svelte";
  import { navigate } from "svelte-navigator";

  async function writeFile() {
    const selected = await open({
      directory: false,
      multiple: false,
      defaultPath: await appDir(),
    });

    invoke("write_file", {
      filePath: selected,
      password: $data.password,
      text: JSON.stringify($data.fileText),
    });
  }

  function exit() {
    navigate("/", { replace: true });
  }

  function add() {
    navigate("/add", { replace: true });
  }
</script>

<div class="loggedInBtns">
  <Button variant="raised" on:click={exit}>
    <Icon class="material-icons">exit_to_app</Icon>
  </Button>
  <Button variant="raised" on:click={writeFile}>
    <Icon class="material-icons">save</Icon>
  </Button>
  <Button color="secondary" variant="raised" on:click={add}>
    <Icon class="material-icons">add</Icon>
  </Button>
</div>
{#if typeof $data.fileText === "object" && $data.fileText !== null}
  <PasswordTable />
{/if}
