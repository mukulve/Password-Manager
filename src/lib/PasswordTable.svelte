<script>
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import IconButton from "@smui/icon-button";
  import { clipboard } from "@tauri-apps/api";
  import { data } from "../store.js";

  function deleteEntry(index) {
    data.update((currentValue) => {
      const updatedFileText = [...currentValue.fileText];
      updatedFileText.splice(index, 1);
      return { ...currentValue, fileText: updatedFileText };
    });
  }
</script>

<DataTable style="width: 100%;">
  <Head>
    <Row>
      <Cell>Name</Cell>
      <Cell>Username</Cell>
      <Cell>Password</Cell>
      <Cell>Options</Cell>
    </Row>
  </Head>
  <Body>
    {#each $data.fileText as item, index}
      <Row>
        <Cell>{item.name}</Cell>
        <Cell>{item.username}</Cell>
        <Cell>················</Cell>
        <Cell>
          <IconButton class="material-icons" on:click={() => deleteEntry(index)}
            >delete</IconButton
          >
          <IconButton
            class="material-icons"
            on:click={() => clipboard.writeText(item.password)}
            >copy_all</IconButton
          >
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
