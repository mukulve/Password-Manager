<script>
  import Textfield from "@smui/textfield";
  import Button from "@smui/button";
  import HelperText from "@smui/textfield/helper-text";
  import { data } from "../store.js";
  import { navigate } from "svelte-navigator";

  let newName = "",
    newUsername = "",
    newPassword = "";

  function addItem() {
    data.update((currentValue) => {
      const updatedFileText = [
        ...currentValue.fileText,
        {
          name: newName,
          username: newUsername,
          password: newPassword,
        },
      ];
      return { ...currentValue, fileText: updatedFileText };
    });

    newName = "";
    newPassword = "";
    newUsername = "";
    navigate("/view", { replace: true });
  }

  function cancelAdding() {
    navigate("/view", { replace: true });
  }
</script>

<Textfield variant="filled" bind:value={newName} label="Name">
  <HelperText slot="helper">Enter A Name</HelperText>
</Textfield>

<Textfield variant="filled" bind:value={newUsername} label="Name">
  <HelperText slot="helper">Enter A Username</HelperText>
</Textfield>

<Textfield variant="filled" bind:value={newPassword} label="Password">
  <HelperText slot="helper">Enter A Password</HelperText>
</Textfield>

<Button variant="raised" on:click={addItem}>Add Entry</Button>

<Button variant="raised" on:click={cancelAdding}>Cancel</Button>
