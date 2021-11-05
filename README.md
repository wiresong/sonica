# Sonica
Sonica is an extension that adds audible indicators to events inside VS Code.

## Features
- Support for rulers
  - Persistent tones when rulers are crossed
  - clicks to determine if the cursor crosses a ruler, panning clicks that allow determining how far the cursor is from a ruler
  - Deals correctly with variable-width tabs
- Support for diagnostics
  - Sounds for errors and warnings
  - Sounds play both when the cursor moves over lines, for a general overview, and also when the cursor moves over individual characters, to determine where the error/warning is specifically

## Installation
The easiest way to install the extension is to either use the extension view in VSCode (search for Sonica) or go [here](https://marketplace.visualstudio.com/items?itemName=wiresong.sonica) and click on install.

To develop the extension, clone the repository, run npm i, and open the repository folder in VSCode. The general workflow is to make changes to the source code, then press f5 to run a test instance of the extension in a new VSCode window.

## Features to be added
- Sounds for more diagnostics
- Indications for indentation
- Eventual pseudo-HRTF, for determining where the cursor is in context of the entire file

## Known Bugs
- There are some edge cases with regards to what happens when moving to the beginning/end of lines

## Available settings

| Setting | Description |
| --- | --- |
| enabled | If the extension is enabled |
| volume | The volume of the extension, from 0 to 1 |
| EnableDiagnostics | If sounds for errors, warnings, etc. will play |
| enablePanning | If the cursor will pan when you move/type |

## Credits
Credit goes to [Austin Hicks](https://github.com/ahicks92) for the initial idea. The sounds used in the extension come from [this pack on Freesound](https://freesound.org/people/ironcross32/packs/32802/)
