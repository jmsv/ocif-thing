# ocif thing

<img src="https://raw.githubusercontent.com/jmsv/ocif-thing/refs/heads/main/apps/playground/public/icon.svg" width="144px" alt="ocif-thing" align="right" />

An infinite canvas editor based on the [OCIF spec](https://github.com/ocwg/spec/blob/main/spec/v0.5/spec.md)

More about OCIF: [canvasprotocol.org](https://canvasprotocol.org)

ocif thing playground: [ocif.jmsv.dev](https://ocif.jmsv.dev)

## `ocif-thing-editor` usage

### Install

```sh
npm install ocif-thing-editor
```

### React component

```diff
  import { useState } from "react"
  
+ import { OcifEditor, useOcifEditor } from "ocif-thing-editor"
+ import "ocif-thing-editor/styles.css"
  
  function App() {
+   const [value, setValue] = useState(initialValue)
+   const editor = useOcifEditor({ value, onChange: setValue })
  
    return (
      <div style={{ width: "100vw", height: "100vh" }}>
+       <OcifEditor editor={editor} />
      </div>
    )
  }
```

## Development

```sh
bun i
bun dev
```
