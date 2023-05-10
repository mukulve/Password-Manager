<script>
  import HomeBanner from "./HomeBanner.svelte";
  import Button, { Label } from "@smui/button";
  import { open } from "@tauri-apps/api/dialog";
  import { appDir } from "@tauri-apps/api/path";
  import { invoke } from "@tauri-apps/api/tauri";
  import { data } from "../store.js";
  import { navigate } from "svelte-navigator";
  import HelperText from "@smui/textfield/helper-text";
  import Textfield from "@smui/textfield";

  let userPassword = "",
    showError = false;

  async function createFile() {
    if (userPassword != "") {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: await appDir(),
      });
      invoke("create_file", { fileName: selected });

      data.update((storeData) => {
        storeData.fileText = [];
        storeData.password = userPassword;
        return storeData;
      });

      navigate("/view", { replace: true });
    } else {
      showError = true;
    }
  }

  async function openFile() {
    if (userPassword != "") {
      const selected = await open({
        directory: false,
        multiple: false,
        defaultPath: await appDir(),
      });

      invoke("read_file_text", {
        fileName: selected,
        password: userPassword,
      }).then((result) => {
        data.update((storeData) => {
          storeData.fileText = JSON.parse(result);
          storeData.password = userPassword;
          return storeData;
        });
      });

      navigate("/view", { replace: true });
    } else {
      showError = true;
    }
  }
</script>

<HomeBanner />

<div class="homePage">
  {#if showError}
    <div>
      <h4>You Must Enter A Password</h4>
      <h5>
        If Creating A File, The Password Will Be Used As Your Master Password
      </h5>
      <h5>If Opening A File, The Password Will Be Used To Read The File</h5>
    </div>
  {/if}
  <div style="width: 80%;margin-left:auto; margin-right:auto">
    <Textfield variant="filled" bind:value={userPassword} label="Password">
      <HelperText slot="helper">Enter A Password</HelperText>
    </Textfield>
  </div>

  <div>
    <Button variant="raised" on:click={openFile}>
      <Label>open password file</Label>
    </Button>
    <Button color="secondary" variant="raised" on:click={createFile}>
      <Label>create password file</Label>
    </Button>
  </div>
</div>
